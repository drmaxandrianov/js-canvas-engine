function KeyController(updateInterval) {
    this.pressedKeyMap = {
        left: {isPressed: false, action: this.passive},
        right: {isPressed: false, action: this.passive},
        up: {isPressed: false, action: this.passive},
        down: {isPressed: false, action: this.passive}
    };

    this.initialize();

    var self = this;
    setInterval(function() {self.processKeys();}, updateInterval);
}

KeyController.prototype.passive = function () {
    console.log("Passive action was performed. Add key handler in KeyController.")
};

KeyController.prototype.defineKeyAction = function (keyName, action) {
    this.pressedKeyMap[keyName].action = action;
};

KeyController.prototype.processKeys = function () {
    if (this.pressedKeyMap.left.isPressed) {
        this.pressedKeyMap.left.action();
    }
    if (this.pressedKeyMap.right.isPressed) {
        this.pressedKeyMap.right.action();
    }
    if (this.pressedKeyMap.up.isPressed) {
        this.pressedKeyMap.up.action();
    }
    if (this.pressedKeyMap.down.isPressed) {
        this.pressedKeyMap.down.action();
    }
};

KeyController.prototype.diagonalMoveCorrector = function () {
    var numberOfPressedArrowKeys = 0;

    if (this.pressedKeyMap.left.isPressed) numberOfPressedArrowKeys++;
    if (this.pressedKeyMap.right.isPressed) numberOfPressedArrowKeys++;
    if (this.pressedKeyMap.up.isPressed) numberOfPressedArrowKeys++;
    if (this.pressedKeyMap.down.isPressed) numberOfPressedArrowKeys++;

    if (numberOfPressedArrowKeys <= 1) return 1;
    else return 1 / Math.sqrt(2);
};

KeyController.prototype.initialize = function () {
    var self = this;

    document.onkeydown = function (event) {
        var keyCode;

        if (event == null) keyCode = window.event.keyCode;
        else keyCode = event.keyCode;

        switch (keyCode) {
            case 37:
                self.pressedKeyMap.left.isPressed = true;
                break;
            case 39:
                self.pressedKeyMap.right.isPressed = true;
                break;
            case 38:
                self.pressedKeyMap.up.isPressed = true;
                break;
            case 40:
                self.pressedKeyMap.down.isPressed = true;
                break;
            default:
                break;
        }
    };

    document.onkeyup = function (event) {
        var keyCode;

        if (event == null) keyCode = window.event.keyCode;
        else keyCode = event.keyCode;

        switch (keyCode) {
            case 37:
                self.pressedKeyMap.left.isPressed = false;
                break;
            case 39:
                self.pressedKeyMap.right.isPressed = false;
                break;
            case 38:
                self.pressedKeyMap.up.isPressed = false;
                break;
            case 40:
                self.pressedKeyMap.down.isPressed = false;
                break;
            default:
                break;
        }
    };
};