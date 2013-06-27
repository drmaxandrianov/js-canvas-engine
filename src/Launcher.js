var engine = new JSCEngineCreator(400, 400, "pad");

engine.addDrawableObject("1", 100, 100, 0, 
    function(context, xPos, yPos, angle) {
        context.beginPath();
        context.arc(xPos, yPos, 20, 0, 2 * Math.PI);
        context.stroke();   
    });
    
setTimeout(function action() {
    engine.objectTranslate("1", 1, 1);
    setTimeout(action, 10);
}, 10);