var VERSION = 1.0,
    AUTHOR = "temechon@pixelcodr.com";
//
//// The function onload is loaded when the DOM has been loaded
//window.addEventListener("DOMContentLoaded", function() {
//
//});


Game = function(canvasId) {

    var canvas          = document.getElementById(canvasId);
    this.engine         = new BABYLON.Engine(canvas, true);

    // Contains all loaded assets needed for this state
    this.assets  = [];

    // The state scene
    this.scene   = null;

    this.score = 0;

    this.gamespeed = 0;
    this.obstacleTimer = -1;
    this.obstacleSpawnTime = Game.OBSTACLE_MAX_SPAWNTIME;

    // Resize window event
    var _this = this;
    window.addEventListener("resize", function() {
        _this.engine.resize();
    });

    this.player = null;
    this.lanes = null;

    // Run the game
    this.run();

};

Game.OBSTACLE_MAX_SPAWNTIME = 2000;

Game.prototype = {

    _initScene : function() {

        var scene = new BABYLON.Scene(this.engine);

        // Camera attached to the canvas

        var camera = new BABYLON.ArcRotateCamera("", -2.34432, 1.08, 20, new BABYLON.Vector3(0,0,6), scene);
        //camera.attachControl(this.engine.getRenderingCanvas());

        // Hemispheric light to light the scene
        var h = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0,1,0), scene);
        h.intensity = 0.3;

        // background
        new BABYLON.Layer("bg", "assets/background.jpg", scene, true);

        return scene;
    },

    /**
     * Run the current state
     */
    run : function() {

        this.scene = this._initScene();


        var _this  = this;
        // The loader
        var loader =  new BABYLON.AssetsManager(this.scene);

        var elf = loader.addMeshTask("elf", "", "./assets/elf/", "elf.babylon");
        elf.onSuccess = function(t) {

            _this.assets[t.name] = {meshes: t.loadedMeshes, skeleton: t.loadedSkeletons[0]};
        };

        var snowman = loader.addMeshTask("snowman", "", "./assets/snowman/", "snowman.babylon");
        snowman.onSuccess = function(t) {
            // Only one mesh here
            var snowman = new BABYLON.Mesh("snowman", _this.scene);
            t.loadedMeshes.forEach(function(m) {
                m.parent = snowman;
            });
            snowman.scaling.scaleInPlace(0.075);
            snowman.rotation.y = -Math.PI/2;
            snowman.setEnabled(false);
            _this.assets[t.name] = {meshes: snowman};
        };

        var rockTask = loader.addMeshTask("rock", "", "./assets/rock/", "rochers.babylon");
        rockTask.onSuccess = function(t) {
            // Only one mesh here
            t.loadedMeshes[0].setEnabled(false);
            t.loadedMeshes[0].convertToFlatShadedMesh();
            t.loadedMeshes[0].position.y = 0.5;
            t.loadedMeshes[0].material.subMaterials[0].emissiveColor = BABYLON.Color3.White(); // snow on the rock
            t.loadedMeshes[0].material.subMaterials[1].diffuseColor = BABYLON.Color3.FromInts(66,87,108);
            _this.assets[t.name] = {meshes: t.loadedMeshes[0]};
        };

        var bigRockTask = loader.addMeshTask("bigrock", "", "./assets/rock/", "rocher_grand.babylon");
        bigRockTask.onSuccess = function(t) {
            // Only one mesh here
            t.loadedMeshes[0].setEnabled(false);
            t.loadedMeshes[0].convertToFlatShadedMesh();
            t.loadedMeshes[0].position.y = 2.8;
            t.loadedMeshes[0].scaling.y -= 0.25;
            _this.assets[t.name] = {meshes: t.loadedMeshes[0]};
        };

        var giftTask = loader.addMeshTask("gift", "", "./assets/gift/", "gift.babylon");
        giftTask.onSuccess = function(t) {
            // Only one mesh here
            t.loadedMeshes[0].setEnabled(false);
            t.loadedMeshes[0].position.y = 1;
            t.loadedMeshes[0].material.emissiveTexture = t.loadedMeshes[0].material.diffuseTexture;
            _this.assets[t.name] = {meshes: t.loadedMeshes[0]};
        };

        var gateTask = loader.addMeshTask("gate", "", "./assets/gate/", "gate.babylon");
        gateTask.onSuccess = function(t) {
            // Only one mesh here
            t.loadedMeshes[0].setEnabled(false);
            t.loadedMeshes[0].rotation.y = Math.PI/2;
            _this.assets[t.name] = {meshes: t.loadedMeshes[0]};
        };

        var meshTask = loader.addMeshTask("sapinou", "", "./assets/sapinou/", "sapinou.babylon");
        meshTask.onSuccess = function(t) {
            // Only one mesh here
            t.loadedMeshes[0].setEnabled(false);
            t.loadedMeshes[0].scaling.scaleInPlace(1);


            //t.loadedMeshes[0].material.emissiveTexture = t.loadedMeshes[0].material.diffuseTexture.clone();
            _this.assets[t.name] = {meshes: t.loadedMeshes[0]};
        };

        loader.onFinish = function (tasks) {

            // Init the game
            _this._initGame();

            _this.scene.executeWhenReady(function() {
                $(".ready").show();
                $(".score").show();

                _this.engine.runRenderLoop(function () {
                    _this.scene.render();
                });

            });
        };

        loader.load();
    },

    /**
     * Start the game.
     */
    start : function() {

        $(".lost").hide();
        $(".ready").show();
        $(".score").show();

        var _this = this;

        // COLLISIONS
        // Check if collision between player and obstacles
        var checkCollisions = function() {
            var obstacles = _this.ob.obstacles;
            for (var i=0; i<obstacles.length; i++) {
                var o = obstacles[i];
                if (_this.player.isCollidingWith(o)) {
                    _this.dead();
                    _this.scene.unregisterBeforeRender(checkCollisions);
                }
            }
        };
        this.scene.registerBeforeRender(checkCollisions);

        this.score = 0;
        this.gamespeed = 0;

        // Init player
        this.player.init();
        this.player.position.x = this.lanes.getMiddleX();

        this.sapinous.init();

        this.lanes.init();

        this.light.position = this.player.position.clone();
        this.light.position.z += 20;

        var top = this.player.position.clone();
        top.y += 10;
        top.z -= 10;
        this.snow.emitter = top;

        // Start the game when space is pressed !
        $(window).keydown(function(evt) {
            if (evt.keyCode == 32) {
                $(".ready").hide();
                _this.gamespeed = 0.2;
                _this.obstacleTimer = Game.OBSTACLE_MAX_SPAWNTIME;
                $(window).off("keydown");
            }
        });

        // Reset camera target
        this.scene.activeCamera.target.z = 0;

        // Remove all obstacles
        var obstacles = this.ob.obstacles;
        obstacles.forEach(function(o) {
            o.dispose();
        });
        this.ob.obstacles = [];
        this.obstacleTimer = -1;
        this.obstacleSpawnTime = Game.OBSTACLE_MAX_SPAWNTIME;

        // remove all gifts
        var gifts = this.ob.gifts;
        gifts.forEach(function(g) {
            g.remove();
        });
        this.ob.gifts = [];

    },

    _initGame : function() {

        var _this = this;

        // LANES
        this.lanes = new Lanes(this);

        // PLAYER
        this.player = new Player(this);

        // SNOW
        this.snow = this._initParticles();

        // SAPINOUS
        this.sapinous = new SapinouManager(this);
        this.sapinous.plant();

        // LIGHT
        this.light = this._initShadows();

        // OBSTACLES
        this.ob = new ObstacleManager(this);

        // RECYCLE ELEMENTS
        this.scene.registerBeforeRender(function() {
            _this.sapinous.recycle();
            _this.lanes.recycle();
            _this.ob.recycle();
        });

        // GIFTS
        // Check if the player collides with a gift
        var checkGifts = function() {
            var gifts = _this.ob.gifts;
            for (var i=0; i<gifts.length; i++) {
                var o = gifts[i];
                if (_this.player.isCollidingWith(o)) {
                    _this.addToScore();
                    // delete gift
                    o.remove();
                    gifts.splice(i, 1);
                    i--;
                }
            }

        };
        this.scene.registerBeforeRender(checkGifts);

        // FLOOR
        var floor = BABYLON.Mesh.CreateGround("floor", 1, 1, 1, this.scene);
        floor.position.x = this.lanes.getMiddleX();
        floor.scaling = new BABYLON.Vector3(12*this.lanes.nblanes, 1, 200);
        floor.position.z = 50;
        floor.material = new BABYLON.StandardMaterial("", this.scene);
        floor.material.zOffset = 1;
        floor.material.diffuseTexture = new BABYLON.Texture("assets/grass2.jpg", this.scene);
        floor.material.specularColor = BABYLON.Color3.Black();
        floor.material.diffuseTexture.uScale = 10;
        floor.material.diffuseTexture.vScale = 30;
        floor.receiveShadows = true;

        // Moving forward
        this.scene.registerBeforeRender(function() {
            var delta = _this.engine.getDeltaTime(); // 1/60*1000
            var deltap= delta * 60 /1000;

            _this.player.position.z += _this.gamespeed * deltap;
            _this.scene.activeCamera.target.z = _this.player.position.z+1;

            _this.snow.emitter.z = _this.player.position.z-10;
            floor.position.z = _this.player.position.z + 50;
            floor.material.diffuseTexture.vOffset += _this.gamespeed*0.15 * deltap;

            _this.light.position.z = _this.player.position.z + 1;
            if (_this.obstacleTimer != -1) {
                _this.obstacleTimer -= _this.engine.getDeltaTime();
                if (_this.obstacleTimer <= 0 && !_this.player.dead) {
                    _this.ob.send();
                    _this.obstacleTimer = _this.obstacleSpawnTime;
                }
            }
        });

        // Init positions
        this.start();

    },

    _initParticles : function() {

        var snow = new BABYLON.ParticleSystem("particles", 1000, this.scene);
        snow.particleTexture = new BABYLON.Texture("assets/snow.png", this.scene);
        var top = new BABYLON.Vector3(0,10,0);
        snow.emitter = top;
        snow.minEmitBox = new BABYLON.Vector3(-12, 0, -5);
        snow.maxEmitBox = new BABYLON.Vector3(12, 0, 60);
        snow.colorDead = new BABYLON.Color4(1, 1, 1, 0.0);
        snow.minSize = 0.1;
        snow.maxSize = 0.5;
        snow.minLifeTime = 1;
        snow.maxLifeTime = 2;
        snow.emitRate = 500;
        snow.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        snow.gravity = new BABYLON.Vector3(0, -9.81, 0);
        snow.direction1 = new BABYLON.Vector3(0,-1,0);
        snow.direction2 = new BABYLON.Vector3(0,-1,0);
        snow.minAngularSpeed = 0;
        snow.maxAngularSpeed = 2*Math.PI;
        snow.minEmitPower = 1;
        snow.maxEmitPower = 3;
        snow.updateSpeed = 0.004;

        snow.start();

        return snow;
    },

    _initShadows : function() {

        var light = new BABYLON.PointLight("biglight", BABYLON.Vector3.Zero(), this.scene);
        light.position.y = 25;
        light.range = 50;
        light.intensity = 1.5;

        return light;
    },

    rotation : function(x) {

        var _this = this;

        var rotations = [
            // Rotation 1
            [
                {alpha:null},
                {alpha:-0.92}
            ]
        ];

        var tf = 240;

        if (rotations[x]) {
            // animation creation
            var keysAlpha = [];
            for (var i=0; i<rotations[x].length; i++) {
                if (! rotations[x][i].alpha) {
                    keysAlpha.push( {frame:tf*i/rotations[x].length, value:this.scene.activeCamera.alpha});
                } else {
                    keysAlpha.push( {frame:tf*i/rotations[x].length, value:rotations[x][i].alpha});
                }
            }
            var animationAlpha = new BABYLON.Animation("alpha", "alpha", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            animationAlpha.setKeys(keysAlpha);

            this.scene.activeCamera.animations.push(animationAlpha);

            this.scene.beginAnimation(this.scene.activeCamera, 0, tf, false);
        }

    },

    /**
     * The player is dead : stop the game
     */
    dead : function() {

        var _this = this;

        this.gamespeed = 0;

        // Make player die
        this.player.die(function() {

            // Display lose screen
            $(".lost").html("Score : "+_this.score+"<br/>Press space to replay !")
            $(".lost").show();
            $(".score").hide();

            // Retry when pressing space
            $(window).keydown(function(evt) {
                if (evt.keyCode == 32) {
                    $(window).off("keydown");
                    _this.start();
                }
            });
        });


    },

    addToScore : function() {
        this.score++;
        $(".score").text(this.score);
    }

};