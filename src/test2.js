var screenWidth = 800, screenHeight = 600;
var e = new JSCEngineCreator("pad", screenWidth, screenHeight);

// Updated on each mouse callback
var mouse = {
    xPos: 0,
    yPos: 0,
    isLeftPressed: false
};

var avatar = {
    xPos: screenWidth / 2,
    yPos: screenHeight / 2,
    angle: 0,
    moveVertical: false,
    moveHorizontal: false,
    speed: 2,
    diagonalSqrt: 2 / Math.sqrt(2)
};

var mobs = [];
var lastMobId = 0;

function Mob(id) {
    this.id = id;
    this.speed = 1;
    this.life = 100;
}

function createMob() {
    var mob = new Mob(lastMobId++);
    var pos = getPointOnPerimeter();
    mobs.push(mob);
    e.objectAdd({
        id: "mob" + mob.id,
        xPos: pos.xPos,
        yPos: pos.yPos,
        angle: JSCEEngineHelpers.angleFromPoints(this.xPos, this.yPos, avatar.xPos, avatar.yPos),
        boundingBoxWidth: 30,
        boundingBoxHeight: 30,
        layer: 9,
        onDraw: function(context, objectData) {
            var id = objectData.id.slice(3);

            context.beginPath();
            if (mobs[id].life > 0) {
                e.objectLookAt(objectData.id, avatar.xPos, avatar.yPos);
                e.objectMoveForward(objectData.id, mobs[id].speed);
                context.arc(objectData.xPos, objectData.yPos, 15, 0, 2 * Math.PI);
            } else {
                context.arc(objectData.xPos, objectData.yPos, 4, 0, 2 * Math.PI);
            }
            context.stroke();
            context.closePath();
        }
    });
}

for (var i = 0; i < 20; i++) {
    createMob();
}

setInterval(createMob, 1000);

var bullets = [];
var lastBulletId = 0;
var bulletDelay = 50;

function Bullet(id) {
    this.id = id;
    this.speed = 7;
    this.angleNoise = 0.1;
    this.damage = 30;
    this.isDeleted = false;
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

e.objectAdd({
        id: "avatar",
        xPos: screenWidth / 2,
        yPos: screenHeight / 2,
        layer: 10,
        angle: 0,
        boundingBoxWidth: 30,
        boundingBoxHeight: 30,
        onDraw: function (context, objectData) {
            avatar.xPos = objectData.xPos;
            avatar.yPos = objectData.yPos;
            avatar.angle = objectData.angle;

            context.beginPath();
            context.arc(objectData.xPos, objectData.yPos, 15, 0, 2 * Math.PI);
            context.stroke();
            context.closePath();
        }
    }
);

e.mouseHandlerSet({
    onLeftDown: function(mouseData){
        mouse = mouseData;
    },
    onLeftUp: function(mouseData){
        mouse = mouseData;
    },
    onMove: function(mouseData){
        mouse = mouseData;
    },
    onDraw: function(context, mouseData){
        context.beginPath();
        context.arc(mouseData.xPos, mouseData.yPos, 10, 0, 2 * Math.PI);
        context.stroke();
        context.closePath();
    }
});

var lastTime = new Date().getTime();
e.iterationHandlerSet({
    onPhysicsIteration: function() {
        for (var i = 0; i < bullets.length; i++) {
            if (bullets[i].isDeleted) continue;
            e.objectMoveForward("bul" + i, bullets[i].speed);

            for (var j = 0; j < mobs.length; j++) {
                if (mobs[j].life <= 0) continue;
                if (JSCEEngineHelpers.checkObjectsIntersection(e.objectClone("bul" + i), e.objectClone("mob" + j))) {
                    mobs[j].life -= bullets[i].damage;
                    bullets[i].isDeleted = true;
                    break;
                }
            }
        }
    },
    beforeDrawIteration: function() {
        if (mouse.isLeftPressed && (new Date().getTime() - lastTime) > bulletDelay) {
            lastTime = new Date().getTime()
            var bullet = new Bullet(lastBulletId++);
            bullets.push(bullet);
            e.objectAdd({
                id: "bul" + bullet.id,
                xPos: avatar.xPos,
                yPos: avatar.yPos,
                angle: JSCEEngineHelpers.angleFromPoints(avatar.xPos, avatar.yPos, mouse.xPos, mouse.yPos) +
                    (Math.random() - 0.5) * bullet.angleNoise,
                boundingBoxWidth: 10,
                boundingBoxHeight: 10,
                layer: 8,
                onDraw: function(context, objectData) {
                    var id = objectData.id.slice(3);
                    if (bullets[id].isDeleted) return;

                    context.beginPath();
                    context.arc(objectData.xPos, objectData.yPos, 5, 0, 2 * Math.PI);
                    context.stroke();
                    context.closePath();
                }
            });
        }
    }
});

e.keyHandlerAdd({
    keyCode: JSCEngineKeyCodes.up,
    smooth: true,
    onPress: function () {
        avatar.moveVertical = true;
        var move = avatar.speed;
        if (avatar.moveHorizontal) {
            move = avatar.diagonalSqrt;
        }
        e.objectTranslate("avatar", 0, -move);
    },
    onRelease: function() {
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
            move = avatar.diagonalSqrt;
        }
        e.objectTranslate("avatar", 0, move);
    },
    onRelease: function() {
        avatar.moveVertical = false;
    }
});

e.keyHandlerAdd({
    keyCode: JSCEngineKeyCodes.left,
    smooth: true,
    onPress: function () {
        avatar.moveHorizontal= true;
        var move = avatar.speed;
        if (avatar.moveVertical) {
            move = avatar.diagonalSqrt;
        }
        e.objectTranslate("avatar", -move, 0);
    },
    onRelease: function() {
        avatar.moveHorizontal= false;
    }
});

e.keyHandlerAdd({
    keyCode: JSCEngineKeyCodes.right,
    smooth: true,
    onPress: function () {
        avatar.moveHorizontal= true;
        var move = avatar.speed;
        if (avatar.moveVertical) {
            move = avatar.diagonalSqrt;
        }
        e.objectTranslate("avatar", move, 0);
    },
    onRelease: function() {
        avatar.moveHorizontal= false;
    }
});