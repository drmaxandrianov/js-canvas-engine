// Main entry point for users of engine
function JSCEngineCreator(canvasWidth, canvasHeight, canvasId) {
    var engine = new JSCEngineCore(canvasWidth, canvasHeight, canvasId);
    engine.initialize();
    return engine;
}

// Class to create a game engine core
function JSCEngineCore(canvasWidth, canvasHeight, canvasId) {
    this.settings = {
        canvas: {
            width: canvasWidth,
            height: canvasHeight,
            id: canvasId
        },
        timers: {
            keyHandlersRepeatRate: 10
        }
    };
    
    this.core = {
        canvas: null,
        context: null,
        isInitialized: false
    };
    
    this.initialize = function() {
        this.core.canvas = document.getElementById(this.settings.canvas.id);
        this.core.canvas.width = this.settings.canvas.width;
        this.core.canvas.height = this.settings.canvas.height;
        this.core.context = this.core.canvas.getContext("2d");
        JSCEngineLog("Initialization: on load canvas 2D context created");
    
        this.core.canvas.onmousedown = function (event) {
            event.preventDefault();
        };
        JSCEngineLog("Initialization: prevent canvas selection with mouse");
        
        this.initAnimFrame();
        JSCEngineLog("Initialization: request for animation frame is done");
    
        //initializeGameObjects();
        //console.log("Initialization: all game objects are initialized");
        //initializeGameControllers();
        //console.log("Initialization: all game controls are initialized");
        this.core.isInitialized = true;
    };
    
    this.beginLoop = function() {
        var self = this;
        this.continueLoop = function () {
            window.requestAnimFrame(self.continueLoop);
            if (self.core.isInitialized) {
                self.drawObjects();
            }
        };
        this.continueLoop();
    };
    
    this.initAnimFrame = function() {
        window.requestAnimFrame = (function() {
            console.log("Initialization: function requestAnimFrame updated");
            return  window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                function (callback) {
                    window.setTimeout(callback, 1000 / 60);
                };
        })();
    };
    
    this.drawableObjects = [];
    this.addDrawableObject = function(id, xPos, yPos, angle, onDraw) {
        this.drawableObjects.push({
            id: id,
            xPos: xPos,
            yPos: yPos,
            angle: angle,
            onDraw: onDraw
        });
    };
    
    this.drawObjects = function() {
        var self = this;
        for (var i = 0; i < this.drawableObjects.length; i++) {
            this.drawableObjects[i].onDraw(self.core.context, 
                this.drawableObjects[i].xPos, 
                this.drawableObjects[i].yPos, 
                this.drawableObjects[i].angle);
        }
    };
    
    this.keyHandlers = [];
    this.addKeyHandler = function(keyCode, callback, repeatable) {
        this.keyHandlers.push({
            keyCode: keyCode,
            callback: callback,
            repeatable: repeatable
        });
    };
    
    this.initKeyHandlers = function() {
        var self = this;
        document.onkeydown = function (event) {
            var keyCode;
    
            if (event === null) keyCode = window.event.keyCode;
            else keyCode = event.keyCode;
            
            for (var i = 0; i < this.keyHandlers.length; i++) {
                if (self.keyHandlers[i].keyCode == keyCode) {
                    self.keyHandlers[i].isPressed = true;
                    if (!self.keyHandlers[i].repeatable) {
                        self.keyHandlers[i].callback();   
                    }
                }
            }
        };
        document.onkeyup = function (event) {
            var keyCode;
    
            if (event === null) keyCode = window.event.keyCode;
            else keyCode = event.keyCode;
            
            for (var i = 0; i < this.keyHandlers.length; i++) {
                if (self.keyHandlers[i].keyCode == keyCode) {
                    self.keyHandlers[i].isPressed = false;
                }
            }
        };
    };
    
    this.startKeyHandlersLoop = function() {
        var self = this;
        setInterval(function() {
            for (var i = 0; i < self.keyHandlers.length; i++) {
                if (self.keyHandlers[i].isPressed) {
                    if (self.keyHandlers[i].repeatable) {
                        self.keyHandlers[i].callback();
                    }
                }
            }
        }, this.settings.timers.keyHandlersRepeatRate);
    }
    
    this.mouseHandlers = [];
    this.addMouseHandler = function(callback) {
        this.mouseHandlers.add({
            callback: callback,
            isPressed: false
        })
    };
    
    
}

function JSCEngineLog(message) {
    console.log("JSCEngine: " + message);
}

