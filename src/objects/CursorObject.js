function CursorObject() {
    this.mouseX = -1;
    this.mouseY = -1;
    this.isPressed = false;
    this.isOverSomething = false;
}

CursorObject.prototype.updatePosition = function(mouseX, mouseY) {
    this.mouseX = mouseX;
    this.mouseY = mouseY;
};

CursorObject.prototype.updateIsPressed = function(isPressed) {
    this.isPressed = isPressed;
};

CursorObject.prototype.updateIsOverSomething = function(isOverSomething) {
    this.isOverSomething = isOverSomething;
};

CursorObject.prototype.draw = function (context) {
    context.beginPath();
    context.arc(
        this.mouseX,
        this.mouseY,
        5, 0, 2 * Math.PI
    );
    context.stroke();
};