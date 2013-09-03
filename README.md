#Game Engine Made Easy

JSC Engine (JavaScript Canvas Engine) is a small and easy to use 2D game engine for HTML5 canvas element written in JavaScript.

It is so easy to use JSC Engine, that you can create your new game just in several minutes. Have a look at [Quick Start](https://github.com/maxpestun/po-js-canvas-engine/wiki/Quick-Start) guide inside project Wiki.

##Very Quick Example
In case you want to test everything by yourself right now just download the whole project and open the `index.html` file in your web browser. There will be a simple shooting game, use keyboard arrows to move the avatar, use left mouse button to shoot. No apache or other web server is required.

##Another Example
In case you want to make everything by your own have a look at [Quick Start] (https://github.com/maxpestun/po-js-canvas-engine/wiki/Quick-Start). Below is an example of using JSC Engine in your project (note, `pad` is an ID of the canvas element inside HTML file):
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

Using JSC Engine you can control objects with keyboard and mouse. You can even perform polygonal collision detection and use common functions for image rendering and objects moving so rapidly used in game development.

##License
This software is under MIT License (MIT). Copyright (c) 2013 by Maxim Pestun.
