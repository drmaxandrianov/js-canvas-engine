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


// Main entry point for users of engine. It is suggested to call to this
// function to create new instance of engine for future compatibility
function JSCEngineCreator(canvasId, canvasWidth, canvasHeight) {
    var engine = new JSCEngineCore(canvasId, canvasWidth, canvasHeight);
    engine.initialize();
    return engine;
}

// Game engine core class, all functions below are marked as USABLE if
// they are planned by design to be used by the user
function JSCEngineCore(canvasId, canvasWidth, canvasHeight) {
    // Local settings of engine
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

    // Core parameters of current engine instance
    this.core = {
        canvas: null,
        context: null,
        isInitialized: false
    };

    // Function for initialization, called from JSCEngineCreator during
    // engine creation
    this.initialize = function () {
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

        this.initKeyHandlers();
        this.startKeyHandlersLoop();
        JSCEngineLog("Initialization: key handlers initialization complete");

        this.initMouseHandlers();
        JSCEngineLog("Initialization: mouse handler initialization complete");

        this.core.isInitialized = true;
        this.beginLoop();
        JSCEngineLog("Initialization: completed and render loop started");
    };

    // Starting the drawing loop
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
                    self.iterationHandler.onDrawIteration();
                }

                // Draw objects
                self.drawObjects();

                //Draw mouse
                if (self.mouseHandler != null) {
                    self.mouseHandler.onDraw(
                        self.core.context,
                        {
                            isLeftPressed: self.mouseHandler.isLeftPressed,
                            xPos: self.mouseHandler.xPos,
                            yPos: self.mouseHandler.yPos
                        });
                }
            }
        };
        this.continueLoop();
    };

    // Special check for fast performance rendering
    this.initAnimFrame = function () {
        window.requestAnimFrame = (function () {
            JSCEngineLog("Initialization: function requestAnimFrame updated");
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame
                || window.mozRequestAnimationFrame || function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
        })();
    };

    // Storage for iteration handler callbacks
    this.iterationHandler = null;

    // USABLE
    // Adds function which will be executed in loop before each drawing
    // iterationHandler = {onDrawIteration: func, onPhysicsIteration: func};
    this.setIterationHandler = function(iterationHandler) {
        if (iterationHandler.onDrawIteration === undefined
            && iterationHandler.onPhysicsIteration === undefined) {
            JSCEngineError("iteration handler is empty, any callback should be provided");
            return;
        }

        iterationHandler.onDrawIteration = iterationHandler.onDrawIteration || function() {};
        iterationHandler.onPhysicsIteration = iterationHandler.onPhysicsIteration || function() {};

        this.iterationHandler = iterationHandler;

        setInterval(this.iterationHandler.onPhysicsIteration, this.settings.timers.physicsCalculationRepeatRate);
    };

    // Storage for all drawable objects
    this.objects = [];

    // Index for fast searching of drawable objects
    this.objectsIndex = [];

    // USABLE
    // Add new object into engine: 
    // object = {id: string, xPos: int, yPos: int, angle: intRadians, layer: int, boundingBoxWidth: int,
    // boundingBoxHeight: int, onDraw: func}
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

    // Comparison function for objects layers
    this.objectLayersComparison = function(objectData1, objectData2) {
        if (objectData1.layer < objectData2.layer) return -1;
        else if (objectData1.layer > objectData2.layer) return 1;
        return 0;
    };

    // Automatically called to draw all objects
    this.drawObjects = function () {
        var self = this;
        for (var i = 0; i < this.objects.length; i++) {
            this.objects[i].onDraw(
                self.core.context, {
                    id: this.objects[i].id,
                    xPos: this.objects[i].xPos,
                    yPos: this.objects[i].yPos,
                    angle: this.objects[i].angle,
                    boundingBoxWidth: this.objects[i].boundingBoxWidth,
                    boundingBoxHeight: this.objects[i].boundingBoxHeight
                });
        }
    };

    // USABLE
    // Get the pointer to the object, not all fields may be edited (for example: id and layer are fixed)
    // object = {id: string, xPos: int, yPos: int, angle: intRadians, layer: int, boundingBoxWidth: int,
    // boundingBoxHeight: int, onDraw: func}
    this.getObject = function (id) {
        var index = this.objectsIndex[id];
        return this.objects[index];
    };

    // USABLE
    // Deleted the object by id
    this.deleteObject = function (id) {
        var index = this.objectsIndex[id];
        if (index !== undefined) {
            this.objects.splice(index, 1);
            this.objectsIndex.splice(id, 1);
            return;
        }
        JSCEngineError("can not delete object, there are no such");
    };

    // USABLE
    // Set the position of the object
    this.objectSetPosition = function (id, xPos, yPos) {
        var object = this.getObject(id);
        object.xPos = xPos;
        object.yPos = yPos;
    };

    // USABLE
    // Set the angle in radians of the object
    this.objectSetRotation = function (id, angle) {
        var object = this.getObject(id);
        object.angle = angle;
    };

    // USABLE
    // Rotate object on specified angle
    this.objectRotate = function (id, angleDiff) {
        var object = this.getObject(id);
        object.angle += angleDiff;
    };

    // USABLE
    // Translate object on specified values by X and Y axises
    this.objectTranslate = function (id, xPosDiff, yPosDiff) {
        var object = this.getObject(id);
        object.xPos += xPosDiff;
        object.yPos += yPosDiff;
    };

    // USABLE
    // Make object view at the specified point
    this.objectLookAt = function (id, xPos, yPos) {
        var object = this.getObject(id);
        object.angle = JSCEEngineHelpers.angleFromPoints(
            object.xPos,
            object.yPos,
            xPos,
            yPos
        );
    };

    // USABLE
    // Moves the object forward using its direction angle
    this.objectMoveForward = function (id, distance) {
        var object = this.getObject(id);
        object.xPos += Math.cos(object.angle) * distance;
        object.yPos += Math.sin(object.angle) * distance;
    };

    // Storage for all key handlers
    this.keyHandlers = [];

    // USABLE
    // Add new key handler
    // keyHandler = {keyCode: int, onPress: func, onRelease: func, smooth: boolean}
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

    // USABLE
    // Remove key handler
    this.deleteKeyHandler = function(keyCode) {
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
    this.angleFromPoints = function (x0, y0, x1, y1) {
        var dX = x0 - x1;
        var dY = y0 - y1;
        if (dY >= 0) {
            return Math.PI / 2 + Math.atan2(dX, -dY);
        } else {
            return -(Math.PI / 2 + Math.atan2(dX, dY));
        }
    };

    this.getRectanglePoints = function (objectData) {
        if (objectData.boundingBoxHeight === undefined ||
            objectData.boundingBoxWidth === undefined ||
            (objectData.boundingBoxHeight == 0 && objectData.boundingBoxWidth == 0)) {
            return null;
        }

        var ox = objectData.xPos, oy = objectData.yPos, oa = objectData.angle;
        var ow = objectData.boundingBoxWidth, oh = objectData.boundingBoxHeight;

        var rect = {};

        // Setup initial position
        rect.x1 = -ow/2;
        rect.y1 = oh/2;
        rect.x2 = ow/2;
        rect.y2 = oh/2;
        rect.x3 = ow/2;
        rect.y3 = -oh/2;
        rect.x4 = -ow/2;
        rect.y4 = -oh/2;

        // Rotate around center
        rect.x1 = rect.x1 * Math.cos(oa) - rect.y1 * Math.sin(oa);
        rect.y1 = rect.y1 * Math.cos(oa) + rect.x1 * Math.sin(oa);
        rect.x2 = rect.x2 * Math.cos(oa) - rect.y2 * Math.sin(oa);
        rect.y2 = rect.y2 * Math.cos(oa) + rect.x2 * Math.sin(oa);
        rect.x3 = rect.x3 * Math.cos(oa) - rect.y3 * Math.sin(oa);
        rect.y3 = rect.y3 * Math.cos(oa) + rect.x3 * Math.sin(oa);
        rect.x4 = rect.x4 * Math.cos(oa) - rect.y4 * Math.sin(oa);
        rect.y4 = rect.y4 * Math.cos(oa) + rect.x4 * Math.sin(oa);

        // Translate to object position
        rect.x1 = rect.x1 + ox;
        rect.y1 = rect.y1 + oy;
        rect.x2 = rect.x2 + ox;
        rect.y2 = rect.y2 + oy;
        rect.x3 = rect.x3 + ox;
        rect.y3 = rect.y3 + oy;
        rect.x4 = rect.x4 + ox;
        rect.y4 = rect.y4 + oy;

        return [
            rect.x1,
            rect.y1,
            rect.x2,
            rect.y2,
            rect.x3,
            rect.y3,
            rect.x4,
            rect.y4
        ];
    };

    // USABLE
    // https://gist.github.com/shamansir/3007244
    // Check intersection of two objects
    this.checkObjectsIntersection = function(objectData1, objectData2) {

        function edgeTest(p1, p2, p3, r2) {
            var rot = [ -(p2[1] - p1[1]),
                p2[0] - p1[0] ];

            var ref = (rot[0] * (p3[0] - p1[0]) +
                rot[1] * (p3[1] - p1[1])) >= 0;

            for (var i = 0, il = r2.length; i < il; i+=2) {
                if (((rot[0] * (r2[i]   - p1[0]) +
                    rot[1] * (r2[i+1] - p1[1])) >= 0) === ref) return false;
            }

            return true;
        }

        // both rects must be specified as all four points in plain vector, like:
        //   [ x1, y1, x2, y2, x3, y3, x4, y4 ], clockwise from top-left point
        // their points must already be rotated and specified in global space before passing to this function
        function isecRects(r1, r2) {
            if (!r1 || !r2) throw new Error('Rects are not accessible');

            var pn, px;
            for (var pi = 0, pl = r1.length; pi < pl; pi += 2) {
                pn = (pi === (pl - 2)) ? 0 : pi + 2; // next point
                px = (pn === (pl - 2)) ? 0 : pn + 2;
                if (edgeTest([r1[pi], r1[pi+1]],
                    [r1[pn], r1[pn+1]],
                    [r1[px], r1[px+1]], r2)) return false;
            }
            for (var pi = 0, pl = r2.length; pi < pl; pi += 2) {
                pn = (pi === (pl - 2)) ? 0 : pi + 2; // next point
                px = (pn === (pl - 2)) ? 0 : pn + 2;
                if (edgeTest([r2[pi], r2[pi+1]],
                    [r2[pn], r2[pn+1]],
                    [r2[px], r2[px+1]], r1)) return false;
            }
            return true;
        }

        var rect1 = this.getRectanglePoints(objectData1);
        var rect2 = this.getRectanglePoints(objectData2);
        if (rect1 == null || rect2 == null) {
            console.log("ONE OBJECT IS NULL");
            return false;
        }

        return isecRects(rect1, rect2);
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
