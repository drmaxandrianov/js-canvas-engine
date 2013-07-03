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

        var ox = objectData.xPos, oy = objectData.yPos, oa = objectData.angle;
        var ow = objectData.boundingBoxWidth, oh = objectData.boundingBoxHeight;

        var rect = {};

        // Setup initial position
        rect.x1 = -ow/2;
        rect.y1 = -oh/2;
        rect.x2 = ow/2;
        rect.y2 = -oh/2;
        rect.x3 = ow/2;
        rect.y3 = oh/2;
        rect.x4 = -ow/2;
        rect.y4 = oh/2;

        // Rotate around center
        var rect2 = {};
        rect2.x1 = rect.x1 * Math.cos(oa) - rect.y1 * Math.sin(oa);
        rect2.y1 = rect.y1 * Math.cos(oa) + rect.x1 * Math.sin(oa);
        rect2.x2 = rect.x2 * Math.cos(oa) - rect.y2 * Math.sin(oa);
        rect2.y2 = rect.y2 * Math.cos(oa) + rect.x2 * Math.sin(oa);
        rect2.x3 = rect.x3 * Math.cos(oa) - rect.y3 * Math.sin(oa);
        rect2.y3 = rect.y3 * Math.cos(oa) + rect.x3 * Math.sin(oa);
        rect2.x4 = rect.x4 * Math.cos(oa) - rect.y4 * Math.sin(oa);
        rect2.y4 = rect.y4 * Math.cos(oa) + rect.x4 * Math.sin(oa);

        // Translate to object position
        rect.x1 = rect2.x1 + ox;
        rect.y1 = rect2.y1 + oy;
        rect.x2 = rect2.x2 + ox;
        rect.y2 = rect2.y2 + oy;
        rect.x3 = rect2.x3 + ox;
        rect.y3 = rect2.y3 + oy;
        rect.x4 = rect2.x4 + ox;
        rect.y4 = rect2.y4 + oy;

        context.beginPath();
        if (isIntersecting) context.strokeStyle="red";
        else context.strokeStyle="blue";
        context.moveTo(rect.x1, rect.y1);
        context.lineTo(rect.x2, rect.y2);
        context.lineTo(rect.x3, rect.y3);
        context.lineTo(rect.x4, rect.y4);
        context.lineTo(rect.x1, rect.y1);

        context.closePath();
        context.fill();

        /*
        context.save();
        context.translate(objectData.xPos, objectData.yPos);
        context.rotate(objectData.angle);
        if (isIntersecting) context.strokeStyle="red";
        else context.strokeStyle="blue";
        context.rect(-(objectData.boundingBoxWidth / 2),-(objectData.boundingBoxHeight / 2),
            objectData.boundingBoxWidth, objectData.boundingBoxHeight);
        context.stroke();
        context.restore();
        */
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

        var ox = objectData.xPos, oy = objectData.yPos, oa = objectData.angle;
        var ow = objectData.boundingBoxWidth, oh = objectData.boundingBoxHeight;

        var rect = {};

        // Setup initial position
        rect.x1 = -ow/2;
        rect.y1 = -oh/2;
        rect.x2 = ow/2;
        rect.y2 = -oh/2;
        rect.x3 = ow/2;
        rect.y3 = oh/2;
        rect.x4 = -ow/2;
        rect.y4 = oh/2;

        // Rotate around center
        var rect2 = {};
        rect2.x1 = rect.x1 * Math.cos(oa) - rect.y1 * Math.sin(oa);
        rect2.y1 = rect.y1 * Math.cos(oa) + rect.x1 * Math.sin(oa);
        rect2.x2 = rect.x2 * Math.cos(oa) - rect.y2 * Math.sin(oa);
        rect2.y2 = rect.y2 * Math.cos(oa) + rect.x2 * Math.sin(oa);
        rect2.x3 = rect.x3 * Math.cos(oa) - rect.y3 * Math.sin(oa);
        rect2.y3 = rect.y3 * Math.cos(oa) + rect.x3 * Math.sin(oa);
        rect2.x4 = rect.x4 * Math.cos(oa) - rect.y4 * Math.sin(oa);
        rect2.y4 = rect.y4 * Math.cos(oa) + rect.x4 * Math.sin(oa);

        // Translate to object position
        rect.x1 = rect2.x1 + ox;
        rect.y1 = rect2.y1 + oy;
        rect.x2 = rect2.x2 + ox;
        rect.y2 = rect2.y2 + oy;
        rect.x3 = rect2.x3 + ox;
        rect.y3 = rect2.y3 + oy;
        rect.x4 = rect2.x4 + ox;
        rect.y4 = rect2.y4 + oy;

        context.beginPath();
        if (isIntersecting) context.strokeStyle="red";
        else context.strokeStyle="blue";
        context.moveTo(rect.x1, rect.y1);
        context.lineTo(rect.x2, rect.y2);
        context.lineTo(rect.x3, rect.y3);
        context.lineTo(rect.x4, rect.y4);
        context.lineTo(rect.x1, rect.y1);

        context.closePath();
        context.fill();

        /*
        context.save();
        context.translate(objectData.xPos, objectData.yPos);
        context.rotate(objectData.angle);
        context.rect(-(objectData.boundingBoxWidth / 2),-(objectData.boundingBoxHeight / 2),
            objectData.boundingBoxWidth, objectData.boundingBoxHeight);
        context.stroke();
        context.restore();*/
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
