var engine = new JSCEngineCreator("pad", 400, 400);


engine.addObject({
    id: "1",
    onDraw: function(context, objectData) {
        JSCEEngineDrawHelpers.drawImage(context, document.getElementById("icon"), objectData);
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
        engine.objectTranslate(objectData.id, ((Math.random()*2)-1), ((Math.random()*2)-1));
}

engine.addMouseHandler({
    onMove: function(mouseData) {
        engine.objectLookAt("1", mouseData.xPos, mouseData.yPos);
    },
    onDraw: function(context, mouseData) {
        context.beginPath();
        context.arc(mouseData.xPos, mouseData.yPos, 10, 0, 2 * Math.PI);
        context.stroke();
        if (mouseData.isLeftPressed) {
            context.beginPath();
            context.arc(mouseData.xPos, mouseData.yPos, 5, 0, 2 * Math.PI);
            context.stroke();
        }
    }
})

engine.addKeyHandler({
    keyCode: JSCEngineKeyCodes.right,
    onPress: function() {
        engine.objectTranslate("1", 1, 0);
    },
    smooth: true
});

engine.addKeyHandler({
    keyCode: JSCEngineKeyCodes.left,
    onPress: function() {
        engine.objectTranslate("1", - 1, 0);
    },
    smooth: true
});

engine.addKeyHandler({
    keyCode: JSCEngineKeyCodes.up,
    onPress: function() {
        engine.objectTranslate("1", 0, - 1);
    },
    smooth: true
});

engine.addKeyHandler({
    keyCode: JSCEngineKeyCodes.down,
    onPress: function() {
        engine.objectTranslate("1", 0, 1);
    },
    smooth: true
});
