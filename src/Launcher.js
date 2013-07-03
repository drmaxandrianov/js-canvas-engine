var engine = new JSCEngineCreator("pad", 400, 400);
var isIntersecting = false;

engine.addObject({
    id: "1",
    layer: 10,
    xPos: 100,
    yPos: 150,
    boundingBoxHeight: 70,
    boundingBoxWidth: 30,
    angle: 0,
    onDraw: function (context, objectData) {
        context.save();
        context.translate(objectData.xPos, objectData.yPos);
        context.rotate(objectData.angle);
        if (isIntersecting) context.strokeStyle="red";
        else context.strokeStyle="blue";
        context.rect(-(objectData.boundingBoxWidth / 2),-(objectData.boundingBoxHeight / 2),
            objectData.boundingBoxWidth, objectData.boundingBoxHeight);
        context.stroke();
        context.restore();

    }
});

engine.addObject({
    id: "2",
    layer: 10,
    xPos: 300,
    yPos: 150,
    boundingBoxHeight: 70,
    boundingBoxWidth: 30,
    angle: 0,
    onDraw: function (context, objectData) {

        context.save();
        context.translate(objectData.xPos, objectData.yPos);
        context.rotate(objectData.angle);
        if (isIntersecting) context.strokeStyle="red";
        else context.strokeStyle="blue";
        context.rect(-(objectData.boundingBoxWidth / 2),-(objectData.boundingBoxHeight / 2),
            objectData.boundingBoxWidth, objectData.boundingBoxHeight);
        context.stroke();
        context.restore();
    }
});

engine.setIterationHandler({
    onPhysicsIteration: function() {
        isIntersecting = JSCEEngineHelpers.checkObjectsIntersection(
            engine.getObject("1"),
            engine.getObject("2")
        );
    }
});

engine.setMouseHandler({
    onMove: function (mouseData) {
        engine.objectLookAt("1", mouseData.xPos, mouseData.yPos);
    },
    onLeftDown: function (mouseData) {
        engine.objectLookAt("2", mouseData.xPos, mouseData.yPos);
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
        engine.objectTranslate("1", 0, -1);
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
