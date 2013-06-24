function MobObject(id, translateSpeed, posX, posY) {
    this.id = id;
    this.translateSpeed = translateSpeed;
    this.posX = posX;
    this.posY = posY;
    this.angle = 0;
    this.radius = 10;
    this.alive = true;
    this.lives = 100;
}

MobObject.prototype.rotateToPlayer = function (playerX, playerY) {
    var dX = this.posX - playerX;
    var dY = this.posY - playerY;
    if (dY >= 0) {
        this.angle = Math.PI / 2 + Math.atan2(dX, -dY);
    } else {
        this.angle = -(Math.PI / 2 + Math.atan2(dX, dY));
    }
};

MobObject.prototype.translateForward = function () {
    this.posX += Math.cos(this.angle) * this.translateSpeed;
    this.posY += Math.sin(this.angle) * this.translateSpeed;
};

MobObject.prototype.isAlive = function () {
    return this.alive;
};

MobObject.prototype.makeDead = function () {
    this.alive = false;
};

MobObject.prototype.takeLives = function (numberOfLivesToTake) {
    this.lives -= numberOfLivesToTake;
    if (this.lives <= 0) this.alive = false;
};

MobObject.prototype.draw = function (context) {
    if (this.isAlive()) {
        context.beginPath();
        context.arc(this.posX, this.posY, 10, Math.PI + this.angle + 0.5, Math.PI + this.angle - 0.5);
        context.stroke();
    } else {
        context.beginPath();
        context.arc(this.posX, this.posY, 2, 0, 2 * Math.PI);
        context.stroke();
    }
};

MobObject.prototype.getPositionX = function () {
    return this.posX;
};

MobObject.prototype.getPositionY = function () {
    return this.posY;
};

MobObject.prototype.getRadius = function () {
    return this.radius;
};


function MobsCollectionObject() {
    this.mobLastId = -1;
    this.mobs = [];
}

MobsCollectionObject.prototype.spawnMobOnEdge = function (screenWidth, screenHeight, translateSpeed) {
    var onLeftOrTopEdge = false;
    if (Math.random() > 0.5) {
        onLeftOrTopEdge = true;
    }

    var posX = screenWidth;
    var posY = screenHeight;

    if (Math.random() > 0.5) {
        // On left or right edge
        if (onLeftOrTopEdge) posX = 0;
        posY = Math.random() * screenHeight;

    } else {
        // On top of bottom edge
        posX = Math.random() * screenWidth;
        if (onLeftOrTopEdge) posY = 0;
    }

    this.mobLastId++;
    this.mobs.push(new MobObject(this.mobLastId, translateSpeed, posX, posY));
};

MobsCollectionObject.prototype.calculate = function (playerX, playerY) {
    this.mobs.forEach(function (mob) {
        if (mob.isAlive()) {
            mob.rotateToPlayer(playerX, playerY);
            mob.translateForward();
        }
    });
};

MobsCollectionObject.prototype.getMobs = function () {
    return this.mobs;
};

MobsCollectionObject.prototype.getNumberOfAliveMobs = function() {
    var numberOfAlive = 0;
    this.mobs.forEach(function (mob) {
        if (mob.isAlive()) numberOfAlive++;
    });
    return numberOfAlive;
};

MobsCollectionObject.prototype.draw = function (context) {
    this.mobs.forEach(function (mob) {
        mob.draw(context);
    });
};