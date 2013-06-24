// ---------------------------------------------------------
// ----------------------- SETTINGS ------------------------
// ---------------------------------------------------------
var settings = {
    canvasWidth: 640,
    canvasHeight: 480,

    defaultKeysUpdateInterval: 1,
    defaultMouseHoldRepeatRate: 10,

    physicsUpdateInterval: 1,
    playersAvatarId: 0,
    avatarTranslateSpeed: 1,
    bulletTranslateSpeed: 3,
    bulletDefaultPower: 10,

    commonNumberOfAliveMobs: 10
};

var weaponParameters = {
    gunSimple: {
        shootAngleNoise: 0.1
    }
};

var mobParameters = {
    translateSpeed: 0.5
};

var runtimeVariables = {
    useMouseClickAction: false,
    useMouseHoldAction: true,

    selectedWeapon: weaponParameters.gunSimple
};

// ---------------------------------------------------------
// ----------------------- OBJECTS -------------------------
// ---------------------------------------------------------
var gameObjects = {
    avatars: [],
    bullets: null,
    cursor: null,
    mobs: null
};

var gameControllers = {
    keysController: null,
    mouseController: null
};

// ---------------------------------------------------------
// -------------------- INITIALIZATION ---------------------
// ---------------------------------------------------------
var core = {
    canvas: null,
    context: null,
    isInitialized: false
};

window.onload = function () {
    core.canvas = document.getElementById("pad");
    core.canvas.width = settings.canvasWidth;
    core.canvas.height = settings.canvasHeight;
    core.context = core.canvas.getContext("2d");
    console.log("Initialization: on load canvas 2D context created");

    core.canvas.onmousedown = function (event) {
        event.preventDefault();
    };
    console.log("Initialization: prevent canvas selection with mouse");

    initializeGameObjects();
    console.log("Initialization: all game objects are initialized");
    initializeGameControllers();
    console.log("Initialization: all game controls are initialized");
    core.isInitialized = true;
};

function initializeGameObjects() {
    gameObjects.avatars.push(new AvatarObject(0));
    gameObjects.bullets = new BulletsCollectionObject();
    gameObjects.cursor = new CursorObject();
    gameObjects.mobs = new MobsCollectionObject();

    // Generate some new mobs
    for (var i = 0; i < 10; i++) {
        gameObjects.mobs.spawnMobOnEdge(settings.canvasWidth, settings.canvasHeight, mobParameters.translateSpeed);
    }
}

function initializeGameControllers() {
    gameControllers.keysController = new KeyController(settings.defaultKeysUpdateInterval);
    gameControllers.keysController.defineKeyAction("left", function () {
        gameObjects.avatars[settings.playersAvatarId]
            .translate(-settings.avatarTranslateSpeed * gameControllers.keysController.diagonalMoveCorrector(), 0);
    });

    gameControllers.keysController.defineKeyAction("right", function () {
        gameObjects.avatars[settings.playersAvatarId]
            .translate(settings.avatarTranslateSpeed * gameControllers.keysController.diagonalMoveCorrector(), 0);
    });

    gameControllers.keysController.defineKeyAction("up", function () {
        gameObjects.avatars[settings.playersAvatarId]
            .translate(0, -settings.avatarTranslateSpeed * gameControllers.keysController.diagonalMoveCorrector());
    });

    gameControllers.keysController.defineKeyAction("down", function () {
        gameObjects.avatars[settings.playersAvatarId]
            .translate(0, settings.avatarTranslateSpeed * gameControllers.keysController.diagonalMoveCorrector());
    });

    gameControllers.mouseController = new MouseController(settings.defaultMouseHoldRepeatRate);
    gameControllers.mouseController.defineClickAction(function (mouseX, mouseY) {
        if (runtimeVariables.useMouseClickAction) {
            gameObjects.bullets.shoot(mouseX, mouseY, runtimeVariables.selectedWeapon.shootAngleNoise, settings.bulletTranslateSpeed, settings.bulletDefaultPower);
        }
    });

    gameControllers.mouseController.defineMoveAction(function (mouseX, mouseY) {
        gameObjects.cursor.updatePosition(mouseX, mouseY);
    });

    gameControllers.mouseController.defineHoldAction(function (mouseX, mouseY) {
        if (runtimeVariables.useMouseHoldAction) {
            gameObjects.bullets.shoot(mouseX, mouseY, runtimeVariables.selectedWeapon.shootAngleNoise, settings.bulletTranslateSpeed, settings.bulletDefaultPower);
        }
    });
}

window.requestAnimFrame = (function () {
    console.log("Initialization: function requestAnimFrame updated");
    return  window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

// ---------------------------------------------------------
// ---------------------- RENDER LOOP ----------------------
// ---------------------------------------------------------
(function animationLoop() {
    requestAnimFrame(animationLoop);
    if (core.isInitialized) {
        render();
    }
})();

// ---------------------------------------------------------
// ----------------------- GAME LOOP -----------------------
// ---------------------------------------------------------
(function physicsLoop() {
    setTimeout(physicsLoop, settings.physicsUpdateInterval);
    if (core.isInitialized) {
        gameObjects.bullets.calculate();
        gameObjects.mobs.calculate(
            gameObjects.avatars[settings.playersAvatarId].getPositionX(),
            gameObjects.avatars[settings.playersAvatarId].getPositionY()
        );
        gameObjects.bullets.collideWithMobs(gameObjects.mobs.getMobs());

        // Count mobs and add new
        var numberOfAliveMobs = gameObjects.mobs.getNumberOfAliveMobs();
        var diff = settings.commonNumberOfAliveMobs - numberOfAliveMobs;
        if (diff > 0) {
            while (diff > 0) {
                gameObjects.mobs.spawnMobOnEdge(settings.canvasWidth, settings.canvasHeight, mobParameters.translateSpeed);
                diff--;
            }
        }
    }
})();

// ---------------------------------------------------------
// ------------------------- RENDER ------------------------
// ---------------------------------------------------------
function render() {
    if (core.isInitialized) {
        // Clear screen
        core.context.clearRect(0, 0, settings.canvasWidth, settings.canvasHeight);

        // Render avatars
        gameObjects.avatars.forEach(function (avatar) {
            avatar.draw(core.context);
        });

        // Render bullets
        gameObjects.bullets.draw(core.context);

        // Render mobs
        gameObjects.mobs.draw(core.context);

        // Render cursor
        gameObjects.cursor.draw(core.context);
    }
}