function MouseController(mouseHoldRepeatRate) {
    this.defaultMouseHoldRepeatRate = mouseHoldRepeatRate;

    this.isMouseDown = false;
    this.mouseX = 100;
    this.mouseY = 100;

    this.clickAction = this.passive;
    this.moveAction = this.passive;
    this.holdAction = this.passive;

    this.initialize();
}

MouseController.prototype.passive = function (mouseX, mouseY) {
    console.log("Passive action was performed (" + mouseX + ", "
        + mouseY + "). Add mouse click handler in MouseController.")
};

MouseController.prototype.defineClickAction = function(action) {
    this.clickAction = action;
};

MouseController.prototype.defineMoveAction = function(action) {
    this.moveAction = action;
};

MouseController.prototype.defineHoldAction = function(action) {
    this.holdAction = action;
};

MouseController.prototype.initialize = function() {
    var self = this;

    core.canvas.addEventListener("mousedown", function (event) {
        self.isMouseDown = true;
        self.mouseX = event.offsetX;
        self.mouseY = event.offsetY;
        self.clickAction(self.mouseX, self.mouseY);
        self._performHoldAction();
    });

    window.addEventListener("mouseup", function (event) {
        self.isMouseDown = false;
    });

    core.canvas.addEventListener("mousemove", function (event) {
        self.mouseX = event.offsetX;
        self.mouseY = event.offsetY;
        self.moveAction(self.mouseX, self.mouseY);
    });

};

MouseController.prototype.setMouseHoldRepeatRate = function(mouseHoldRepeatRate) {
    this.defaultMouseHoldRepeatRate = mouseHoldRepeatRate;
};

MouseController.prototype.getPositionX = function() {
    return this.mouseX;
};

MouseController.prototype.getPositionY = function() {
    return this.mouseY;
};

MouseController.prototype._performHoldAction = function() {
    var self = this;
    if (this.isMouseDown) setTimeout(function() {self._performHoldAction()}, this.defaultMouseHoldRepeatRate);
    this.holdAction(this.mouseX, this.mouseY);
};