JSC Engine
==========

JSC Engine (JavaScript Canvas Engine) is a small and easy to use 2D game engine for HTML canvas element.

It is so easy to use JSC Engine, that you can create your new game just in several minutes. Have a look at Quick Start
guide inside Wiki.

Quick example is below. Create the engine instance:
```javascript
var screenWidth = 800, screenHeight = 600;
var e = new JSCEngineCreator("pad", screenWidth, screenHeight);
```

Add and draw the object:
```javascript
e.objectAdd({
        id: "avatar",
        xPos: 100,
        yPos: 100,
        angle: 0,
        onDraw: function (context, objectData) {
            context.beginPath();
            context.arc(objectData.xPos, objectData.yPos, 15, 0, 2 * Math.PI);
            context.stroke();
            context.closePath();
        }
    }
);
```

Process the keys:
```javascript
e.keyHandlerAdd({
    keyCode: JSCEngineKeyCodes.right,
    smooth: true,
    onPress: function () {
        e.objectMoveForward("avatar", 5);
    }
});
```

Navigate your web browser to the created page. 

Using JSC Engine you can control objects with keyboard and mouse. You can even perform poligonal collision detection and use
common functions for image rendering and objects moving so rapidly used in gaming.
