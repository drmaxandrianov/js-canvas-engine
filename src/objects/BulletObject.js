function BulletObject(avatarId, posX, posY, angle, speed, power) {
    this.owner = avatarId;
    this.posX = posX;
    this.posY = posY;
    this.angle = angle;
    this.speed = speed;
    this.power = power;
}

BulletObject.prototype.calculate = function () {
    this.posX += Math.cos(this.angle) * this.speed;
    this.posY += Math.sin(this.angle) * this.speed;
};

BulletObject.prototype.draw = function (context) {
    context.beginPath();
    context.arc(this.posX, this.posY, 3, 0, 2 * Math.PI);
    context.stroke();
};

BulletObject.prototype.isCollidingWithSquare = function (posX, posY, width, height) {
    return this.posX >= posX && this.posX <= posX + width
        && this.posY >= posY && this.posY <= posY + height;

};

BulletObject.prototype.isCollidingWithCircle = function (posX, posY, radius) {
    return Math.sqrt(Math.pow(this.posX - posX, 2) + Math.pow(this.posY - posY, 2)) <= radius;
};


function BulletsCollectionObject() {
    this.bullets = [];
}

BulletsCollectionObject.prototype.addBullet = function (avatarId, posX, posY, angle, speed, power) {
    this.bullets.push(new BulletObject(avatarId, posX, posY, angle, speed, power));
};

BulletsCollectionObject.prototype.calculate = function () {
    this.bullets.forEach(function (bullet, i) {
        bullet.calculate();
        if ((bullet.posX < 0 || bullet.posX > core.canvas.width)
            || (bullet.posY < 0 || bullet.posY > core.canvas.height)) {
            this.splice(i, 1);
        }
    }, this.bullets);
};

BulletsCollectionObject.prototype.collideWithMobs = function (mobs) {
    var self = this;
    mobs.forEach(function (mob) {
        // Go through each alive mob ...
        if (mob.isAlive()) {
            self.bullets.forEach(function (bullet, i) {
                // ... and check intersection with each bullet ...
                if (bullet.isCollidingWithCircle(mob.getPositionX(), mob.getPositionY(), mob.getRadius())) {
                    mob.takeLives(bullet.power);    // ... remove lives of mob ...
                    this.splice(i, 1);              // ... and delete bullet
                }
            }, self.bullets);
        }
    });
};

BulletsCollectionObject.prototype.draw = function (context) {
    this.bullets.forEach(function (bullet) {
        bullet.draw(context);
    })
};

BulletsCollectionObject.prototype.shoot = function (mouseX, mouseY, angleNoise, speed, power) {
    var avatar = gameObjects.avatars[0];
    var avX = avatar.posX;
    var avY = avatar.posY;
    var randomAngleNoise = angleNoise * (Math.random() - 0.5);
    this.bullets.push(new BulletObject(
        0, avX, avY,
        getAngle(avX, avY, mouseX, mouseY) + randomAngleNoise,
        speed, power)
    );
};

function getAngle(x0, y0, x1, y1) {
    var dX = x0 - x1;
    var dY = y0 - y1;
    if (dY >= 0) {
        return Math.PI / 2 + Math.atan2(dX, -dY);
    } else {
        return -(Math.PI / 2 + Math.atan2(dX, dY));
    }
}