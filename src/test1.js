var jscEngine = JSCEngineCreator("pad", 400, 400);
var isIntersecting = false;
var mouse = {x: 0, y: 0};

jscEngine.objectAdd({
    id: "1",
    layer: 10,
    xPos: 100,
    yPos: 150,
    boundingBoxHeight: 70,
    boundingBoxWidth: 30,
    angle: 0,
    onDraw: function (context, objectData) {
        context.save();
        context.beginPath();
        context.translate(objectData.xPos, objectData.yPos);
        context.rotate(objectData.angle);
        context.rect(-(objectData.boundingBoxWidth / 2), -(objectData.boundingBoxHeight / 2),
            objectData.boundingBoxWidth, objectData.boundingBoxHeight);
        if (isIntersecting) context.strokeStyle = "red";
        else context.strokeStyle = "blue";
        context.stroke();
        context.closePath();
        context.restore();

    },
    onLeftClickUp: function (mouseData) {
        alert("1 Up");
    }
});

jscEngine.objectAdd({
    id: "2",
    layer: 10,
    xPos: 300,
    yPos: 150,
    boundingBoxHeight: 70,
    boundingBoxWidth: 30,
    angle: 0,
    onDraw: function (context, objectData) {

        context.save();
        context.beginPath();
        context.translate(objectData.xPos, objectData.yPos);
        context.rotate(objectData.angle);
        context.rect(-(objectData.boundingBoxWidth / 2), -(objectData.boundingBoxHeight / 2),
            objectData.boundingBoxWidth, objectData.boundingBoxHeight);
        if (isIntersecting) context.strokeStyle = "red";
        else context.strokeStyle = "blue";
        context.stroke();
        context.closePath();
        context.restore();
    },
    onLeftClickDown: function (mouseData) {
        alert("2 Down");
    }
});

var isClickDown = false;
var mouseDiff = {};
jscEngine.objectAdd({
    id: "d",
    layer: 11,
    xPos: 200,
    yPos: 200,
    boundingBoxHeight: 70,
    boundingBoxWidth: 30,
    angle: Math.PI / 4,
    onDraw: function (context, objectData) {
        context.save();
        context.beginPath();
        context.translate(objectData.xPos, objectData.yPos);
        context.rotate(objectData.angle);
        context.rect(-(objectData.boundingBoxWidth / 2), -(objectData.boundingBoxHeight / 2),
            objectData.boundingBoxWidth, objectData.boundingBoxHeight);
        if (isClickDown) context.strokeStyle = "green";
        else context.strokeStyle = "blue";
        context.stroke();
        context.closePath();
        context.restore();
    },
    onLeftClickDown: function (mouseData) {
        isClickDown = true;
        var obj = jscEngine.objectClone("d");
        mouseDiff.x = mouseData.xPos - obj.xPos;
        mouseDiff.y = mouseData.yPos - obj.yPos;
    },
    onLeftClickUp: function (mouseData) {
        isClickDown = false;
        alert("released :)");
    }
});

jscEngine.iterationHandlerSet({
    onPhysicsIteration: function () {
        isIntersecting = JSCEEngineHelpers.checkObjectsIntersection(
            jscEngine.objectClone("1"),
            jscEngine.objectClone("2")
        );
    },
    beforeDrawIteration: function() {
        jscEngine.objectLookAt("1", mouse.x, mouse.y);
    }
});

jscEngine.mouseHandlerSet({
    onMove: function (mouseData) {
        if (isClickDown) {
            jscEngine.objectSetPosition("d",
                mouseData.xPos - mouseDiff.x,
                mouseData.yPos - mouseDiff.y
            );
        }
        mouse.x = mouseData.xPos;
        mouse.y = mouseData.yPos;
    },
    onLeftDown: function (mouseData) {
        jscEngine.objectLookAt("2", mouseData.xPos, mouseData.yPos);
    },
    onLeftUp: function (mouseData) {
        isClickDown = false;
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

jscEngine.keyHandlerAdd({
    keyCode: JSCEngineKeyCodes.right,
    onPress: function () {
        jscEngine.objectStrafeRight("1", 1);
    },
    smooth: true
});

jscEngine.keyHandlerAdd({
    keyCode: JSCEngineKeyCodes.left,
    onPress: function () {
        jscEngine.objectStrafeRight("1", -1);
    },
    smooth: true
});

jscEngine.keyHandlerAdd({
    keyCode: JSCEngineKeyCodes.up,
    onPress: function () {
        var speed = 4;
        jscEngine.objectMoveForward("1", speed);
        var o1 = jscEngine.objectClone("1");
        var o2 = jscEngine.objectClone("2");
        var willIntersect = JSCEEngineHelpers.checkObjectsIntersection(o1, o2);
        if (willIntersect) {
            jscEngine.objectMoveForward("1", -speed);
        }
    },
    smooth: true
});

jscEngine.keyHandlerAdd({
    keyCode: JSCEngineKeyCodes.down,
    onPress: function () {
        jscEngine.objectMoveForward("1", -1);
    },
    smooth: true
});
