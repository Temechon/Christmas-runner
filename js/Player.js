var Player = function(game) {

    // Call super constructor
    GameObject.call(this, game);

    // Player position.y
    this.height = 0.75;

    var _this = this;
    this.game.assets['elf'].meshes.forEach(function(m) {
        m.parent = _this;
        m.material.emissiveTexture = m.material.diffuseTexture;
        _this.addChildren(m);
    });
    this.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
    this.position.y = this.height;
    this.rotation.y = Math.PI+Math.PI/8;

    // Compute world matrix at first frame
    this.setReady();

    // save skeleton
    this.skeleton = this.game.assets['elf'].skeleton;

    // Init variable!
    this.init();

    var gravity = -0.015;
    this.getScene().registerBeforeRender(function() {
        if (_this.isJumping > 0) {
            _this.speed += gravity;
            _this.position.y += _this.speed;
            if (_this.position.y <=  _this.height){
                _this.position.y = _this.height;
                _this.isJumping = false;
                // Run again if not dead !
                if (!_this.dead) {
                    _this.getScene().beginAnimation(_this.skeleton, 0, 21, true, 1.25);
                }
            }
        }

        _this.position.x += 0.5 * _this.direction;
        if (_this.direction < 0) { // going to the left
            if (_this.position.x <= _this.destinationX) {
                _this.position.x = _this.destinationX;
                _this.direction = 0;
            }
        }
        if (_this.direction > 0) { // going to the right
            if (_this.position.x >= _this.destinationX) {
                _this.position.x = _this.destinationX;
                _this.direction = 0;
            }
        }
    });
    window.addEventListener("keydown", function(evt) {
        if (evt.keyCode == 32) {
            _this._jump();
        }
        if (evt.keyCode == 39 && _this.direction == 0) { // right pressed and not moving
            _this._right();
        }
        if (evt.keyCode == 37 && _this.direction == 0) { // left pressed and not moving
            _this._left();
        }
    });

    // Touch events
    var hammertime = new Hammer(this.getScene().getEngine().getRenderingCanvas());
    hammertime.on('swiperight', function(ev) {
        _this._right();
    }).on('swipeleft', function(ev) {
        _this._left();
    }).on('tap', function(ev) {
        _this._jump();
    })
};

Player.prototype = Object.create(GameObject.prototype);
Player.prototype.constructor = Player;

Player.prototype._jump = function() {
    if (!this.dead) {
        var height = 0.3;
        if (this.isJumping >= 0 && this.isJumping < 2) {
            this.isJumping++;
            this.speed = height;
            if (this.isJumping == 1) {
                this.getScene().beginAnimation(this.skeleton, 22, 48, false, 1.0);
            } else {
                this.getScene().beginAnimation(this.skeleton, 49, 73, false, 0.75);
            }
        }
    }
};

Player.prototype._right = function() {
    if (!this.dead) {
        if (this.currentLane < this.game.lanes.nblanes - 1) {
            this.currentLane++;
            this.direction = 1;
            this.destinationX = this.game.lanes.getLanePositionX(this.currentLane);
        }
    }
};

Player.prototype._left = function() {
    if (!this.dead) {
        if (this.currentLane > 0) {
            this.currentLane--;
            this.direction = -1;
            this.destinationX = this.game.lanes.getLanePositionX(this.currentLane);
        }
    }
};

/**
 * Make the player die
 * @param callback
 */
Player.prototype.die = function(callback) {
    this.dead = true;
    this.height = 1;
    //this.getScene().stopAnimation(this.skeleton);
    this.getScene().beginAnimation(this.skeleton, 74, 138, false, 1.0, callback);
};


Player.prototype.init = function() {

    // Player is not dead
    this.dead = false;

    // Speed
    this.speed = 0;

    // Player is not jumping
    this.isJumping = 0;

    // The destination lane
    this.destinationX = -1;

    // The direction
    this.direction = 0;

    // The initial position
    this.position.z = 0;

    // The current lane
    this.currentLane = Math.floor(this.game.lanes.nblanes /2);

    // Run, little boy, run !
    this.getScene().beginAnimation(this.skeleton, 0, 21, true, 1.5);

};

