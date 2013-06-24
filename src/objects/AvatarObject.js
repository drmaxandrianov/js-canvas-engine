function AvatarObject(id) {
    this.id = id;
    this.posX = 100;
    this.posY = 100;
    this.angle = 0;
}

AvatarObject.prototype.setPosition = function (posX, posY) {
    this.posX = posX;
    this.posY = posY;
};

AvatarObject.prototype.translate = function (diffX, diffY) {
    this.posX += diffX;
    this.posY += diffY;
};

AvatarObject.prototype.setRotation = function (angle) {
    this.angle = angle;
};

AvatarObject.prototype.rotate = function (diffAngle) {
    this.angle += diffAngle;
};

AvatarObject.prototype.getPositionX = function() {
    return this.posX;
};

AvatarObject.prototype.getPositionY = function() {
    return this.posY;
};

AvatarObject.prototype.draw = function (context) {
    context.beginPath();
    context.arc(this.posX, this.posY, 20, 0, 2 * Math.PI);
    context.stroke();
};