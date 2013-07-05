// The MIT License (MIT)

// Copyright (c) 2013 by Maxim Pestun

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.


/**
 * Main entry point for users of engine. It is suggested to call to this function to create new instance of engine for future compatibility. It will return JSCEngine object which contains all functions available for the user.
 *
 * @param {string} canvasId id of canvas in HTML file
 * @param {number} canvasWidth width of canvas
 * @param {number} canvasHeight height of canvas
 * @returns {JSCEngine}
 */
function JSCEngineCreator(canvasId, canvasWidth, canvasHeight) {
    var engineRecord = new JSCEngineCore(canvasId, canvasWidth, canvasHeight);
    engineRecord.initialize();
    return new JSCEngine(engineRecord);
}

/**
 * Main container for all functions of engine, available for the end user. It is safe to work with this functions.
 *
 * @param {JSCEngineCore} engineRecord engine, created with JSCEngineCreator
 * @constructor
 */
function JSCEngine(engineRecord) {
    var engine = engineRecord;

    this.iterationHandlerSet = function (iterationHandler) {
        engine.setIterationHandler(iterationHandler);
    };

    this.objectAdd = function (object) {
        engine.addObject(object);
    };

    this.objectClone = function (id) {
        var object = engine.getObject(id);
        return {
            id: object.id,
            xPos: object.xPos,
            yPos: object.yPos,
            angle: object.angle,
            layer: object.layer,
            boundingBoxWidth: object.boundingBoxWidth,
            boundingBoxHeight: object.boundingBoxHeight
        };
    };

    this.objectDelete = function (id) {
        engine.deleteObject(id);
    };

    this.objectSetPosition = function (id, xPos, yPos) {
        engine.objectSetPosition(id, xPos, yPos);
    };

    this.objectSetRotation = function (id, angle) {
        engine.objectSetRotation(id, angle);
    };

    this.objectRotate = function (id, angleDiff) {
        engine.objectRotate(id, angleDiff);
    };

    this.objectTranslate = function (id, xPosDiff, yPosDiff) {
        engine.objectTranslate(id, xPosDiff, yPosDiff);
    };

    this.objectLookAt = function (id, xPos, yPos) {
        engine.objectLookAt(id, xPos, yPos);
    };

    this.objectMoveForward = function (id, distance) {
        engine.objectMoveForward(id, distance);
    };

    this.objectStrafeRight = function (id, distance) {
        engine.objectStrafeRight(id, distance);
    };

    this.keyHandlerAdd = function (keyHandler) {
        engine.addKeyHandler(keyHandler);
    };

    this.keyHandlerDelete = function (keyHandler) {
        engine.deleteKeyHandler(keyHandler);
    };

    this.mouseHandlerSet = function (mouseHandler) {
        engine.setMouseHandler(mouseHandler);
    };
}

/**
 * Core class for engine logic. It is not recommended to call its methods directly. Instead use JSCEngine created with JSCEngineCreator.
 *
 * @param {string} canvasId id of canvas in HTML file
 * @param {number} canvasWidth width of canvas
 * @param {number} canvasHeight height of canvas
 * @constructor
 */
function JSCEngineCore(canvasId, canvasWidth, canvasHeight) {
    /**
     * Local settings of engine. It is set up automatically during engine creation.
     *
     * @type {{canvas: {width: number, height: number, id: string}, timers: {keyHandlersRepeatRate: number, physicsCalculationRepeatRate: number}}}
     */
    this.settings = {
        canvas: {
            width: canvasWidth,
            height: canvasHeight,
            id: canvasId
        },
        timers: {
            keyHandlersRepeatRate: 10,
            physicsCalculationRepeatRate: 10
        }
    };

    /**
     * Core parameters of current engine instance, used for inner logic.
     *
     * @type {{canvas: object, context: object, isInitialized: boolean}}
     */
    this.core = {
        canvas: null,
        context: null,
        isInitialized: false
    };

    /**
     * Function for engine initialization, called from JSCEngineCreator during engine creation.
     */
    this.initialize = function () {
        // Main canvas initialization
        this.core.canvas = document.getElementById(this.settings.canvas.id);
        this.core.canvas.width = this.settings.canvas.width;
        this.core.canvas.height = this.settings.canvas.height;
        this.core.context = this.core.canvas.getContext("2d");
        JSCEngineLog("Initialization: on load canvas 2D context created");

        // This is used to prevent canvas selection with mouse dragging
        this.core.canvas.onmousedown = function (event) {
            event.preventDefault();
        };
        JSCEngineLog("Initialization: prevent canvas selection with mouse");

        // Special check for fast performance rendering
        this.initAnimFrame();
        JSCEngineLog("Initialization: request for animation frame is done");

        // Key handlers initialization
        this.initKeyHandlers();
        this.startKeyHandlersLoop();
        JSCEngineLog("Initialization: key handlers initialization complete");

        // Mouse handlers initialization
        this.initMouseHandlers();
        JSCEngineLog("Initialization: mouse handler initialization complete");

        // Mark that initialization is complete and start the main loop
        this.core.isInitialized = true;
        this.beginLoop();
        JSCEngineLog("Initialization: completed and render loop started");
    };

    /**
     * Starting the drawing loop.
     */
    this.beginLoop = function () {
        var self = this;
        this.continueLoop = function () {
            window.requestAnimFrame(self.continueLoop);
            if (self.core.isInitialized) {
                // Clear screen
                self.core.context.clearRect(0, 0,
                    self.settings.canvas.width,
                    self.settings.canvas.height);

                // Perform iteration actions before drawing
                if (self.iterationHandler != null) {
                    self.iterationHandler.beforeDrawIteration();
                }

                // Draw all objects
                self.drawObjects();

                //Draw mouse pointer
                if (self.mouseHandler != null) {
                    self.mouseHandler.onDraw(
                        self.core.context,
                        {
                            xPos: self.mouseHandler.xPos,
                            yPos: self.mouseHandler.yPos,
                            isLeftPressed: self.mouseHandler.isLeftPressed
                        });
                }
            }
        };
        this.continueLoop();
    };

    /**
     * Special check for fast performance rendering
     */
    this.initAnimFrame = function () {
        window.requestAnimFrame = (function () {
            JSCEngineLog("Initialization: function requestAnimFrame updated");
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame
                || window.mozRequestAnimationFrame || function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
        })();
    };

    /**
     * Storage for iteration handler callbacks
     * @type {null} default value if unset
     */
    this.iterationHandler = null;

    // USABLE
    // Adds function which will be executed in loop before each drawing
    // iterationHandler = {beforeDrawIteration: func, onPhysicsIteration: func};

    /**
     * Adds function which will be executed in loop before each drawing.
     *
     * @param {object} iterationHandler object with callbacks
     * @param {function} iterationHandler.beforeDrawIteration function without parameters, will be called before drawing on each loop iteration
     * @param {function} iterationHandler.onPhysicsIteration function without parameters, will be calculated each physicsCalculationRepeatRate milliseconds
     */
    this.setIterationHandler = function (iterationHandler) {
        if (iterationHandler.beforeDrawIteration === undefined
            && iterationHandler.onPhysicsIteration === undefined) {
            JSCEngineError("iteration handler is empty, any callback should be provided");
            return;
        }

        iterationHandler.beforeDrawIteration = iterationHandler.beforeDrawIteration || function () {
        };
        iterationHandler.onPhysicsIteration = iterationHandler.onPhysicsIteration || function () {
        };

        this.iterationHandler = iterationHandler;

        setInterval(this.iterationHandler.onPhysicsIteration, this.settings.timers.physicsCalculationRepeatRate);
    };

    /**
     * Storage for all drawable objects.
     *
     * @type {Array}
     */
    this.objects = [];

    /**
     * Index for fast searching of drawable objects.
     *
     * @type {Array}
     */
    this.objectsIndex = [];

    /**
     * Add new object into engine.
     *
     * @param {object} object description of the object
     * @param {string} object.id identification of the object, must be a string
     * @param {number} [object.xPos] position on X
     * @param {number} [object.yPos] position on Y
     * @param {number} [object.angle] rotation angle
     * @param {number} [object.layer] number of the layer
     * @param {number} [object.boundingBoxWidth] width of bounding box (when angle is 0)
     * @param {number} [object.boundingBoxHeight] height of bounding box (when angle is 0)
     * @param {function} object.onDraw function for drawing
     * @param {function} [object.onLeftClickDown] function for left click down (requires bounding box)
     * @param {function} [object.onLeftClickUp] function for left click up (requires bounding box)
     */
    this.addObject = function (object) {
        if (object.id === undefined) {
            JSCEngineError("can not add object without id");
            return;
        }
        if (typeof(object.id) != "string") {
            JSCEngineError("id of object must be a string");
            return;
        }
        if (object.onDraw === undefined) {
            JSCEngineError("object must have callback for drawing");
            return;
        }

        object.xPos = object.xPos || 0;
        object.yPos = object.yPos || 0;
        object.angle = object.angle || 0;
        object.layer = object.layer || 0;
        object.boundingBoxWidth = object.boundingBoxWidth || 0;
        object.boundingBoxHeight = object.boundingBoxHeight || 0;
        object.onLeftClickDown = object.onLeftClickDown || null;
        object.onLeftClickUp = object.onLeftClickUp || null;

        if (typeof(object.layer) != "number") {
            JSCEngineError("layer of object must be a number");
            return;
        }

        // Add object to collection of objects
        this.objects.push(object);

        // Sort collection of objects by layer
        this.objects.sort(this.objectLayersComparison);

        // Rebuild indexes
        this.objectsIndex = [];
        for (var i = 0; i < this.objects.length; i++) {
            this.objectsIndex[this.objects[i].id] = i;
        }
    };

    /**
     * Comparison function for objects layers. If first object has bigger layer number, then 1, if equal, then 0, else -1.
     *
     * @param {object} objectData1 first object to compare
     * @param {object} objectData2 second object to compare
     * @returns {number} comparison result number
     */
    this.objectLayersComparison = function (objectData1, objectData2) {
        if (objectData1.layer < objectData2.layer) return -1;
        else if (objectData1.layer > objectData2.layer) return 1;
        return 0;
    };

    /**
     * Automatically called to draw all objects.
     */
    this.drawObjects = function () {
        var self = this;
        for (var i = 0; i < this.objects.length; i++) {
            this.objects[i].onDraw(
                self.core.context, {
                    id: this.objects[i].id,
                    xPos: this.objects[i].xPos,
                    yPos: this.objects[i].yPos,
                    angle: this.objects[i].angle,
                    layer: this.objects[i].layer,
                    boundingBoxWidth: this.objects[i].boundingBoxWidth,
                    boundingBoxHeight: this.objects[i].boundingBoxHeight
                });
        }
    };

    /**
     * Get the pointer to the object, not all fields may be edited manually.
     *
     * @param {string} id identification string of object
     * @returns {object} object itself
     */
    this.getObject = function (id) {
        var index = this.objectsIndex[id];
        return this.objects[index];
    };

    /**
     * Deleted the object by id.
     *
     * @param {string} id identification string of object
     */
    this.deleteObject = function (id) {
        var index = this.objectsIndex[id];
        if (index !== undefined) {
            this.objects.splice(index, 1);
            this.objectsIndex.splice(id, 1);
            return;
        }
        JSCEngineError("can not delete object, there are no such");
    };

    /**
     * Set the new position of the object.
     *
     * @param {string} id identification string of object
     * @param {number} xPos new position on X
     * @param {number} yPos new position on Y
     */
    this.objectSetPosition = function (id, xPos, yPos) {
        var object = this.getObject(id);
        object.xPos = xPos;
        object.yPos = yPos;
    };

    /**
     * Set the angle in radians of the object/
     *
     * @param {string} id identification string of object
     * @param {number} angle new angle value
     */
    this.objectSetRotation = function (id, angle) {
        var object = this.getObject(id);
        object.angle = angle;
    };

    /**
     * Rotate object on specified angle.
     *
     * @param {string} id identification string of object
     * @param {number} angleDiff rotation angle to add to existing angle
     */
    this.objectRotate = function (id, angleDiff) {
        var object = this.getObject(id);
        object.angle += angleDiff;
    };

    /**
     * Translate object on specified values by X and Y axises.
     *
     * @param {string} id identification string of object
     * @param {number} xPosDiff translate on specified value on X
     * @param {number} yPosDiff translate on specified value on Y
     */
    this.objectTranslate = function (id, xPosDiff, yPosDiff) {
        var object = this.getObject(id);
        object.xPos += xPosDiff;
        object.yPos += yPosDiff;
    };

    /**
     * Make object view at the specified point.
     *
     * @param {string} id identification string of object
     * @param {number} xPos X coordinate of view point
     * @param {number} yPos Y coordinate of view point
     */
    this.objectLookAt = function (id, xPos, yPos) {
        var object = this.getObject(id);
        object.angle = JSCEEngineHelpers.angleFromPoints(
            object.xPos,
            object.yPos,
            xPos,
            yPos
        );
    };

    /**
     * Moves the object forward using its direction angle. Use negative number to move backward.
     *
     * @param {string} id identification string of object
     * @param {number} distance distance to move
     */
    this.objectMoveForward = function (id, distance) {
        var object = this.getObject(id);
        object.xPos += Math.cos(object.angle) * distance;
        object.yPos += Math.sin(object.angle) * distance;
    };

    /**
     * Strafe the object to the left or to the right.
     *
     * @param {string} id identification string of object
     * @param {number} distance distance to move
     */
    this.objectStrafeRight = function (id, distance) {
        var object = this.getObject(id);
        object.xPos += Math.cos(object.angle + Math.PI / 2) * distance;
        object.yPos += Math.sin(object.angle + Math.PI / 2) * distance;
    };

    /**
     * Storage for all key handlers.
     *
     * @type {Array}
     */
    this.keyHandlers = [];

    /**
     * Add new key handler.
     *
     * @param {object} keyHandler description of the key handler object
     * @param {number} keyHandler.keyCode code of the key, use JSCEngineKeyCodes for standard values
     * @param {function} keyHandler.onPress callback on press event
     * @param {function} keyHandler.onRelease callback on release event
     * @param {boolean} keyHandler.smooth if true then no delay between first press and keep pressing (perfect for game controls)
     */
    this.addKeyHandler = function (keyHandler) {
        if (keyHandler.keyCode === undefined) {
            JSCEngineError("no key code was given, can not handle a such key");
            return;
        }
        if (keyHandler.onPress === undefined
            && keyHandler.onRelease === undefined) {
            JSCEngineError("at least one key handler must be specified");
            return;
        }

        keyHandler.onPress = keyHandler.onPress || function () {
        };
        keyHandler.onRelease = keyHandler.onRelease || function () {
        };
        keyHandler.smooth = keyHandler.smooth || false;

        this.keyHandlers.push(keyHandler);
    };

    /**
     * Remove key handler for specified key code.
     *
     * @param {number} keyCode key code value, use JSCEngineKeyCodes for standard values
     */
    this.deleteKeyHandler = function (keyCode) {
        for (var i = 0; i < this.keyHandlers.length; i++) {
            if (this.keyHandlers[i].keyCode == keyCode) {
                this.keyHandlers.splice(i, 1);
                return;
            }
        }
        JSCEngineError("can not delete key handler, there are no such");
    };

    // Automatically called during engine initialization.
    // Set ups the handlers for system keys events
    this.initKeyHandlers = function () {
        var self = this;
        document.onkeydown = function (event) {
            var keyCode;

            if (event === null) keyCode = window.event.keyCode;
            else keyCode = event.keyCode;

            for (var i = 0; i < self.keyHandlers.length; i++) {
                if (self.keyHandlers[i].keyCode == keyCode) {
                    self.keyHandlers[i].isPressed = true;
                    if (!self.keyHandlers[i].smooth) {
                        self.keyHandlers[i].onPress();
                    }
                }
            }
        };
        document.onkeyup = function (event) {
            var keyCode;

            if (event === null) keyCode = window.event.keyCode;
            else keyCode = event.keyCode;

            for (var i = 0; i < self.keyHandlers.length; i++) {
                if (self.keyHandlers[i].keyCode == keyCode) {
                    self.keyHandlers[i].isPressed = false;
                    self.keyHandlers[i].onRelease();
                }
            }
        };
    };

    // Automatically called during engine initialization.
    // Starts the loop to check keys pressings
    this.startKeyHandlersLoop = function () {
        var self = this;
        setInterval(function () {
            for (var i = 0; i < self.keyHandlers.length; i++) {
                if (self.keyHandlers[i].isPressed) {
                    if (self.keyHandlers[i].smooth) {
                        self.keyHandlers[i].onPress();
                    }
                }
            }
        }, this.settings.timers.keyHandlersRepeatRate);
    };

    // Storage for mouse handler
    this.mouseHandler = null;

    // USABLE
    // Add handler for mouse actions
    // mouseHandler = {onLeftDown: func, onLeftUp: func, onMove: func, onDraw: func}
    this.setMouseHandler = function (mouseHandler) {
        if (mouseHandler.onLeftDown === undefined
            && mouseHandler.onLeftUp === undefined
            && mouseHandler.onMove === undefined
            && mouseHandler.onDraw === undefined) {
            JSCEngineError("mouse handler is empty, no callbacks are given");
            return;
        }

        mouseHandler.onLeftDown = mouseHandler.onLeftDown || function () {
        };
        mouseHandler.onLeftUp = mouseHandler.onLeftUp || function () {
        };
        mouseHandler.onMove = mouseHandler.onMove || function () {
        };
        mouseHandler.onDraw = mouseHandler.onDraw || function () {
        };

        this.mouseHandler = mouseHandler;
        this.mouseHandler.isLeftPressed = false;
    };

    // Automatically called during engine initialization.
    // Set ups the handlers for system mouse events
    this.initMouseHandlers = function () {
        var self = this;

        this.core.canvas.addEventListener("mousedown", function (event) {
            if (self.mouseHandler != null) {
                self.mouseHandler.isLeftPressed = true;
                self.mouseHandler.xPos = event.offsetX;
                self.mouseHandler.yPos = event.offsetY;
                self.mouseHandler.onLeftDown({
                    xPos: self.mouseHandler.xPos,
                    yPos: self.mouseHandler.yPos,
                    isLeftPressed: self.mouseHandler.isLeftPressed
                });
                self.processObjectsClicks("leftClickDown");
            }
        });

        window.addEventListener("mouseup", function (event) {
            if (self.mouseHandler != null) {
                self.mouseHandler.xPos = event.offsetX;
                self.mouseHandler.yPos = event.offsetY;
                self.mouseHandler.isLeftPressed = false;
                self.mouseHandler.onLeftUp({
                    xPos: self.mouseHandler.xPos,
                    yPos: self.mouseHandler.yPos,
                    isLeftPressed: self.mouseHandler.isLeftPressed
                });
                self.processObjectsClicks("leftClickUp");
            }
        });

        this.core.canvas.addEventListener("mousemove", function (event) {
            if (self.mouseHandler != null) {
                self.mouseHandler.xPos = event.offsetX;
                self.mouseHandler.yPos = event.offsetY;
                self.mouseHandler.onMove({
                    xPos: self.mouseHandler.xPos,
                    yPos: self.mouseHandler.yPos,
                    isLeftPressed: self.mouseHandler.isLeftPressed
                });
            }
        });
    };

    this.processObjectsClicks = function (typeOfClick) {
        for (var i = 0; i < this.objects.length; i++) {
            if (typeOfClick == "leftClickDown") {
                if (this.objects[i].onLeftClickDown != null) {
                    if (JSCEEngineHelpers.doPolygonsIntersect(
                        JSCEEngineHelpers.getRectanglePoints(this.objects[i]),
                        [
                            {x: this.mouseHandler.xPos, y: this.mouseHandler.yPos}
                        ]
                    )) {
                        this.objects[i].onLeftClickDown({
                            xPos: this.mouseHandler.xPos,
                            yPos: this.mouseHandler.yPos,
                            isLeftPressed: this.mouseHandler.isLeftPressed
                        });
                    }
                }
            } else if (typeOfClick == "leftClickUp") {
                if (this.objects[i].onLeftClickUp != null) {
                    if (JSCEEngineHelpers.doPolygonsIntersect(
                        JSCEEngineHelpers.getRectanglePoints(this.objects[i]),
                        [
                            {x: this.mouseHandler.xPos, y: this.mouseHandler.yPos}
                        ]
                    )) {
                        this.objects[i].onLeftClickUp({
                            xPos: this.mouseHandler.xPos,
                            yPos: this.mouseHandler.yPos,
                            isLeftPressed: this.mouseHandler.isLeftPressed
                        });
                    }
                }
            }
        }
    };


}

// Helper class for user to do common tasks, all functions below are marked as 
// USABLE if they are planned by design to be used by the user
var JSCEEngineHelpers = (function () {

    // USABLE
    // Makes it easy to draw an image using object data with specified angle
    this.drawImage = function (context, image, objectData) {
        context.save();
        context.translate(objectData.xPos, objectData.yPos);
        context.rotate(objectData.angle);
        context.drawImage(image, -(image.width / 2), -(image.height / 2));
        context.restore();
    };

    // USABLE
    // Calculates the angle from two points
    this.angleFromPoints = function (xPos, yPos, xLookAt, yLookAt) {
        var dX = xPos - xLookAt;
        var dY = yPos - yLookAt;
        if (dY >= 0) {
            return Math.PI / 2 + Math.atan2(dX, -dY);
        } else {
            return -(Math.PI / 2 + Math.atan2(dX, dY));
        }
    };

    this.checkObjectsIntersection = function (objectData1, objectData2) {
        var rect1 = this.getRectanglePoints(objectData1);
        var rect2 = this.getRectanglePoints(objectData2);
        if (rect1 == null || rect2 == null) {
            return false;
        }
        return this.doPolygonsIntersect(rect1, rect2);
    };

    /**
     * Helper function to determine whether there is an intersection between the two polygons described
     * by the lists of vertices. Uses the Separating Axis Theorem
     *
     * @param polygonA an array of connected points [{x:, y:}, {x:, y:},...] that form polygonA closed polygon
     * @param polygonB an array of connected points [{x:, y:}, {x:, y:},...] that form polygonA closed polygon
     * @return true if there is any intersection between the 2 polygons, false otherwise
     */
    this.doPolygonsIntersect = function (polygonA, polygonB) {
        var polygons = [polygonA, polygonB];
        var minA, maxA, projected, i, i1, j, minB, maxB;

        for (i = 0; i < polygons.length; i++) {

            // for each polygon, look at each edge of the polygon, and determine if it separates
            // the two shapes
            var polygon = polygons[i];
            for (i1 = 0; i1 < polygon.length; i1++) {

                // grab 2 vertices to create an edge
                var i2 = (i1 + 1) % polygon.length;
                var p1 = polygon[i1];
                var p2 = polygon[i2];

                // find the line perpendicular to this edge
                var normal = { x: p2.y - p1.y, y: p1.x - p2.x };

                minA = maxA = undefined;
                // for each vertex in the first shape, project it onto the line perpendicular to the edge
                // and keep track of the min and max of these values
                for (j = 0; j < polygonA.length; j++) {
                    projected = normal.x * polygonA[j].x + normal.y * polygonA[j].y;
                    if (minA === undefined || projected < minA) {
                        minA = projected;
                    }
                    if (maxA === undefined || projected > maxA) {
                        maxA = projected;
                    }
                }

                // for each vertex in the second shape, project it onto the line perpendicular to the edge
                // and keep track of the min and max of these values
                minB = maxB = undefined;
                for (j = 0; j < polygonB.length; j++) {
                    projected = normal.x * polygonB[j].x + normal.y * polygonB[j].y;
                    if (minB === undefined || projected < minB) {
                        minB = projected;
                    }
                    if (maxB === undefined || projected > maxB) {
                        maxB = projected;
                    }
                }

                // if there is no overlap between the projects, the edge we are looking at separates the two
                // polygons, and we know there is no overlap
                if (maxA < minB || maxB < minA) {
                    //console.log("polygons don't intersect!");
                    return false;
                }
            }
        }
        return true;
    };

    // Extrude the polygon line from object's rectangular bounding box
    this.getRectanglePoints = function (objectData) {
        // Check that object data is valid an collision can be performed
        if (objectData.boundingBoxHeight === undefined ||
            objectData.boundingBoxWidth === undefined ||
            objectData.boundingBoxHeight == 0 && objectData.boundingBoxWidth == 0) {
            return null;
        }

        var ox = objectData.xPos, oy = objectData.yPos, oa = objectData.angle;
        var ow = objectData.boundingBoxWidth, oh = objectData.boundingBoxHeight;

        // Setup initial position
        var rect = {};
        rect.x1 = -ow / 2;
        rect.y1 = -oh / 2;
        rect.x2 = ow / 2;
        rect.y2 = -oh / 2;
        rect.x3 = ow / 2;
        rect.y3 = oh / 2;
        rect.x4 = -ow / 2;
        rect.y4 = oh / 2;

        // Rotate around center
        var rectR = {};
        rectR.x1 = rect.x1 * Math.cos(oa) - rect.y1 * Math.sin(oa);
        rectR.y1 = rect.y1 * Math.cos(oa) + rect.x1 * Math.sin(oa);
        rectR.x2 = rect.x2 * Math.cos(oa) - rect.y2 * Math.sin(oa);
        rectR.y2 = rect.y2 * Math.cos(oa) + rect.x2 * Math.sin(oa);
        rectR.x3 = rect.x3 * Math.cos(oa) - rect.y3 * Math.sin(oa);
        rectR.y3 = rect.y3 * Math.cos(oa) + rect.x3 * Math.sin(oa);
        rectR.x4 = rect.x4 * Math.cos(oa) - rect.y4 * Math.sin(oa);
        rectR.y4 = rect.y4 * Math.cos(oa) + rect.x4 * Math.sin(oa);

        // Translate to object's position
        rect.x1 = rectR.x1 + ox;
        rect.y1 = rectR.y1 + oy;
        rect.x2 = rectR.x2 + ox;
        rect.y2 = rectR.y2 + oy;
        rect.x3 = rectR.x3 + ox;
        rect.y3 = rectR.y3 + oy;
        rect.x4 = rectR.x4 + ox;
        rect.y4 = rectR.y4 + oy;

        return [
            {x: rect.x1, y: rect.y1},
            {x: rect.x2, y: rect.y2},
            {x: rect.x3, y: rect.y3},
            {x: rect.x4, y: rect.y4}
        ];
    };

    return this;
})();

// Logging for engine
function JSCEngineLog(message) {
    console.log("JSCEngine INFO: " + message);
}

// Logging for engine with errors
function JSCEngineError(message) {
    console.log("JSCEngine ERROR: " + message);
}

// Support structure for quick key codes access
var JSCEngineKeyCodes = {
    left: 37,
    right: 39,
    up: 38,
    down: 40
};
