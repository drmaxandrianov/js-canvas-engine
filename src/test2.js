var screenWidth = 800, screenHeight = 600;
var e = new JSCEngineCreator("pad", screenWidth, screenHeight);

// Updated on each mouse callback
var mouse = {
    xPos: 0,
    yPos: 0,
    isLeftPressed: false
};

var avatar = {
    moveVertical: false,
    moveHorizontal: false,
    speed: 2,
    diagonalSqrt: 2 / Math.sqrt(2)
};

e.objectAdd({
        id: "avatar",
        xPos: screenWidth / 2,
        yPos: screenHeight / 2,
        layer: 10,
        angle: 0,
        boundingBoxWidth: 15,
        boundingBoxHeight: 15,
        onDraw: function (context, objectData) {
            context.beginPath();
            context.arc(objectData.xPos, objectData.yPos, 15, 0, 2 * Math.PI);
            context.stroke();
            context.closePath();
        }
    }
);

e.mouseHandlerSet({
    onLeftDown: function(mouseData){

    },
    onLeftUp: function(mouseData){

    },
    onMove: function(mouseData){
        mouse = mouseData;
    },
    onDraw: function(context, mouseData){
        context.beginPath();
        context.arc(mouseData.xPos, mouseData.yPos, 10, 0, 2 * Math.PI);
        context.stroke();
        context.closePath();
    }
});

e.keyHandlerAdd({
    keyCode: JSCEngineKeyCodes.up,
    smooth: true,
    onPress: function () {
        avatar.moveVertical = true;
        var move = avatar.speed;
        if (avatar.moveHorizontal) {
            move = avatar.diagonalSqrt;
        }
        e.objectTranslate("avatar", 0, -move);
    },
    onRelease: function() {
        avatar.moveVertical = false;
    }
});

e.keyHandlerAdd({
    keyCode: JSCEngineKeyCodes.down,
    smooth: true,
    onPress: function () {
        avatar.moveVertical = true;
        var move = avatar.speed;
        if (avatar.moveHorizontal) {
            move = avatar.diagonalSqrt;
        }
        e.objectTranslate("avatar", 0, move);
    },
    onRelease: function() {
        avatar.moveVertical = false;
    }
});

e.keyHandlerAdd({
    keyCode: JSCEngineKeyCodes.left,
    smooth: true,
    onPress: function () {
        avatar.moveHorizontal= true;
        var move = avatar.speed;
        if (avatar.moveVertical) {
            move = avatar.diagonalSqrt;
        }
        e.objectTranslate("avatar", -move, 0);
    },
    onRelease: function() {
        avatar.moveHorizontal= false;
    }
});

e.keyHandlerAdd({
    keyCode: JSCEngineKeyCodes.right,
    smooth: true,
    onPress: function () {
        avatar.moveHorizontal= true;
        var move = avatar.speed;
        if (avatar.moveVertical) {
            move = avatar.diagonalSqrt;
        }
        e.objectTranslate("avatar", move, 0);
    },
    onRelease: function() {
        avatar.moveHorizontal= false;
    }
});