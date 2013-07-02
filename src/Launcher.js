var engine = new JSCEngineCreator("pad", 400, 400);
var bullets = [];
var lastBulletId = 0;
var userPosX = 0;
var userPosY = 0;
var mousePosX = 0;
var mousePosY = 0;

engine.addObject({
    id: "1",
    layer: 10,
    onDraw: function (context, objectData) {
        JSCEEngineHelpers.drawImage(context, document.getElementById("icon"), objectData);
        userPosX = objectData.xPos;
        userPosY = objectData.yPos;
    }
});

for (var i = 0; i < 10; i++) {
    engine.addObject({
        id: "random" + i,
        xPos: Math.random() * 400,
        yPos: Math.random() * 400,
        angle: 0,
        onDraw: drawRandom
    });
}

function drawRandom(context, objectData) {
    context.beginPath();
    context.arc(objectData.xPos, objectData.yPos, 10, 0, 2 * Math.PI);
    context.stroke();
    engine.objectTranslate(objectData.id, ((Math.random() * 2) - 1), ((Math.random() * 2) - 1));
}

engine.addMouseHandler({
    onMove: function (mouseData) {
        engine.objectLookAt("1", mouseData.xPos, mouseData.yPos);
        mousePosX = mouseData.xPos;
        mousePosY = mouseData.yPos;
    },
    onLeftDown : function(mouseData) {
        var bulletName = "bullet" + lastBulletId++;
        bullets.push(bulletName);
        engine.addObject({
            id: bulletName,
            xPos: userPosX,
            yPos: userPosY,
            angle: JSCEEngineHelpers.angleFromPoints(userPosX, userPosY, mousePosX, mousePosY),
            onDraw: function(context, objectData) {
                engine.objectMoveForward(objectData.id, 5);
                context.beginPath();
                context.arc(objectData.xPos, objectData.yPos, 2, 0, 2 * Math.PI);
                context.stroke();
            }
        });

    },
    onDraw: function (context, mouseData) {
        context.beginPath();
        context.arc(mouseData.xPos, mouseData.yPos, 10, 0, 2 * Math.PI);
        context.stroke();
        if (mouseData.isLeftPressed) {
            context.beginPath();
            context.arc(mouseData.xPos, mouseData.yPos, 5, 0, 2 * Math.PI);
            context.stroke();
        }
    }
});

engine.addKeyHandler({
    keyCode: JSCEngineKeyCodes.right,
    onPress: function () {
        engine.objectTranslate("1", 1, 0);
    },
    smooth: true
});

engine.addKeyHandler({
    keyCode: JSCEngineKeyCodes.left,
    onPress: function () {
        engine.objectTranslate("1", -1, 0);
    },
    smooth: true
});

engine.addKeyHandler({
    keyCode: JSCEngineKeyCodes.up,
    onPress: function () {
        engine.objectMoveForward("1", 1);
    },
    smooth: true
});

engine.addKeyHandler({
    keyCode: JSCEngineKeyCodes.down,
    onPress: function () {
        engine.objectTranslate("1", 0, 1);
    },
    smooth: true
});
