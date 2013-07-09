var screenWidth = 640, screenHeight = 480;
var e = new JSCEngineCreator("pad", screenWidth, screenHeight);

var constants = {
    diagonalSqrt: 2 / Math.sqrt(2),
    avatarSpeed: 2,
    bulletSpeed: 5,
    mobSpeed: 1,
    bulletDamage: 34,
    bulletAngleNoise: 0.1,
    mobLife: 100,
    bulletDelay: 100
};

var avatar = {
    id: "avatar",
    xPos: screenWidth / 2,
    yPos: screenHeight / 2,
    angle: 0,
    moveVertical: false,
    moveHorizontal: false,
    speed: constants.avatarSpeed,
    layer: 10,

    boundingBoxHeight: 40,
    boundingBoxWidth: 40,

    onDraw: function (context, objectData) {
        context.beginPath();
        context.strokeStyle = "black";
        context.arc(objectData.xPos, objectData.yPos, 20, 0, 2 * Math.PI);
        context.stroke();
        context.closePath();
    }
};

var mouse = {
    xPos: 0,
    yPos: 0,
    isLeftPressed: false
};

var bullets = [];
var bulletCounter = 0;
var mobs = [];
var mobsCounter = 0;

function Bullet() {
    this.id = "bul" + bulletCounter++;
    this.angle = JSCEEngineHelpers.angleFromPoints(avatar.xPos, avatar.yPos, mouse.xPos, mouse.yPos) + (Math.random() - 0.5) * constants.bulletAngleNoise;
    this.speed = constants.bulletSpeed;
    this.angleNoise = constants.bulletAngleNoise;
    this.damage = constants.bulletDamage;
    this.isDeleted = false;
    this.layer = 8;

    this.xPos = avatar.xPos;
    this.yPos = avatar.yPos;
    this.boundingBoxHeight = 10;
    this.boundingBoxWidth = 10;

    this.onDraw = function (context, objectData) {
        if (this.isDeleted) return;
        context.beginPath();
        context.strokeStyle = "blue";
        context.arc(objectData.xPos, objectData.yPos, 5, 0, 2 * Math.PI);
        context.stroke();
        context.closePath();
    };
}

function Mob() {
    this.id = "mob" + mobsCounter++;
    this.angle = JSCEEngineHelpers.angleFromPoints(this.xPos, this.yPos, avatar.xPos, avatar.yPos);
    this.life = constants.mobLife;
    this.speed = constants.mobSpeed;
    this.layer = 9;

    var newPos = getPointOnPerimeter();
    this.xPos = newPos.xPos;
    this.yPos = newPos.yPos;
    this.boundingBoxHeight = 30;
    this.boundingBoxWidth = 30;

    this.onDraw = function (context, objectData) {
        context.beginPath();
        if (this.life > 0) {
            context.strokeStyle = "red";
            context.arc(this.xPos, this.yPos, 15, 0, 2 * Math.PI);
        } else {
            context.strokeStyle = "gray";
            context.arc(this.xPos, this.yPos, 4, 0, 2 * Math.PI);
        }
        context.stroke();
        context.closePath();
    };
}

// Create initial number of mobs
for (var i = 0; i < 20; i++) {
    createMob();
}

// Create all next mobs
setInterval(createMob, 1000);

// Add avatar
e.objectAdd(avatar);

e.iterationHandlerSet({
    beforeDrawIteration: function () {
        createBullet();
        moveMobs();

        var newBullets = [];
        for (var n = 0; n < bullets.length; n++) {
            if (bullets[n].isDeleted) {
                e.objectDelete(bullets[n].id);
            } else {
                newBullets.push(bullets[n]);
            }
        }
        bullets = newBullets;
    },
    onPhysicsIteration: function () {
        calculateBullets();
    }
});

e.mouseHandlerSet({
    onLeftDown: function (mouseData) {
        mouse = mouseData;
    },
    onLeftUp: function (mouseData) {
        mouse = mouseData;
    },
    onMove: function (mouseData) {
        mouse = mouseData;
    },
    onDraw: function (context, mouseData) {
        context.beginPath();
        context.strokeStyle = "green";
        context.arc(mouseData.xPos, mouseData.yPos, 10, 0, 2 * Math.PI);
        context.stroke();
        context.closePath();
    }
});

function createMob() {
    var calcMobs = 0;
    for (var i = 0; i < mobs.length; i++) {
        if (mobs[i].life > 0) calcMobs++;
    }
    if (calcMobs >= 30) return;
    var mob = new Mob();
    mobs.push(mob);
    e.objectAdd(mob);
}

function moveMobs() {
    for (var i = 0; i < mobs.length; i++) {
        if (mobs[i].life < 0) continue;
        e.objectLookAt(mobs[i].id, avatar.xPos, avatar.yPos);
        e.objectMoveForward(mobs[i].id, mobs[i].speed);

    }
}

var lastTime = new Date().getTime();
function createBullet() {
    if (mouse.isLeftPressed && (new Date().getTime() - lastTime) > constants.bulletDelay) {
        lastTime = new Date().getTime();
        var bullet = new Bullet();
        bullets.push(bullet);
        e.objectAdd(bullet);
    }
}

function calculateBullets() {
    for (var i = 0; i < bullets.length; i++) {
        if (bullets[i].isDeleted) continue;
        e.objectMoveForward(bullets[i].id, bullets[i].speed);

        for (var j = 0; j < mobs.length; j++) {
            if (mobs[j].life <= 0) continue;
            if (JSCEEngineHelpers.checkObjectsIntersection(bullets[i], mobs[j])) {
                mobs[j].life -= bullets[i].damage;
                bullets[i].isDeleted = true;
                break;
            }
        }
    }
}

function getPointOnPerimeter() {
    var onVertical = true;
    if (Math.random() < 0.5) onVertical = false;

    var xPos = 0, yPos = 0;

    if (onVertical) {
        var onLeft = true;
        if (Math.random() < 0.5) onLeft = false;
        if (onLeft) xPos = 0;
        else xPos = screenWidth;
        yPos = Math.random() * screenHeight;
    } else {
        var onTop = true;
        if (Math.random() < 0.5) onTop = false;
        if (onTop) yPos = 0;
        else yPos = screenHeight;
        xPos = Math.random() * screenWidth;
    }

    return {xPos: xPos, yPos: yPos};
}


e.keyHandlerAdd({
    keyCode: JSCEngineKeyCodes.up,
    smooth: true,
    onPress: function () {
        avatar.moveVertical = true;
        var move = avatar.speed;
        if (avatar.moveHorizontal) {
            move = constants.diagonalSqrt;
        }
        e.objectTranslate("avatar", 0, -move);
    },
    onRelease: function () {
        avatar.moveVertical = false;
    }
});

e.keyHandlerAdd({
    keyCode: JSCEngineKeyCodes.down,
    smooth: true,
    onPress: function () {
        avatar.moveVertical = true;
        var move = avatar.speed;
        if (avatar.moveHorizontal) {
            move = constants.diagonalSqrt;
        }
        e.objectTranslate("avatar", 0, move);
    },
    onRelease: function () {
        avatar.moveVertical = false;
    }
});

e.keyHandlerAdd({
    keyCode: JSCEngineKeyCodes.left,
    smooth: true,
    onPress: function () {
        avatar.moveHorizontal = true;
        var move = avatar.speed;
        if (avatar.moveVertical) {
            move = constants.diagonalSqrt;
        }
        e.objectTranslate("avatar", -move, 0);
    },
    onRelease: function () {
        avatar.moveHorizontal = false;
    }
});

e.keyHandlerAdd({
    keyCode: JSCEngineKeyCodes.right,
    smooth: true,
    onPress: function () {
        avatar.moveHorizontal = true;
        var move = avatar.speed;
        if (avatar.moveVertical) {
            move = constants.diagonalSqrt;
        }
        e.objectTranslate("avatar", move, 0);
    },
    onRelease: function () {
        avatar.moveHorizontal = false;
    }
});