var Gift = function(game) {

    // Call super constructor
    GameObject.call(this, game);

    // Set shape
    var obj = this.game.assets['gift'].meshes.createInstance("gift");
    obj.setEnabled(true);

    // set ready
    this.setReady();

    // add as children
    this.addChildren(obj);

    // run animation
    this.animation(3000);

    // Recycle if not taken by player
    var _this = this;
    var recycle = function() {
        if (_this.position.z < _this.game.player.position.z - 20) {
            _this.spot.dispose();
            _this.dispose();
            _this.getScene().unregisterBeforeRender(recycle);
        }
    };
    this.getScene().registerBeforeRender(recycle);

    // Lights
    var l = new BABYLON.SpotLight("", new BABYLON.Vector3(0,5,0) , new BABYLON.Vector3(0,-1,0), Math.PI/4, 20, this.getScene());
    l.parent = this;
    l.intensity = 2;
    l.diffuse = BABYLON.Color3.Green();
    l.range = 6;
    this.spot = l;

};

Gift.prototype = Object.create(GameObject.prototype);
Gift.prototype.constructor = Gift;

Gift.prototype.animation = function(duration) {
    var quarter = duration * 60 * 0.001 / 4;

    // Scaling
    var scaling = new BABYLON.Animation("", "scaling", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    scaling.setKeys([
        {frame: 0, value: BABYLON.Vector3.Zero()},
        {frame: quarter * 2, value: new BABYLON.Vector3(1.5,1.5,1.5)},
        {frame: quarter * 4, value: new BABYLON.Vector3(1,1,1)}
    ]);
    var f = new BABYLON.ElasticEase();
    f.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
    scaling.setEasingFunction(f);
    this.animations.push(scaling);

    // Rotation
    var rotation = new BABYLON.Animation("", "rotation.y", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    rotation.setKeys([
        {frame: 0, value: 0},
        {frame: quarter * 4, value: Math.PI * 4}
    ]);
    var e = new BABYLON.CubicEase();
    e.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    rotation.setEasingFunction(e);
    this.animations.push(rotation);

    this.getScene().beginAnimation(this, 0, quarter * 4, false, 1);
};

Gift.prototype.remove = function() {
    this.spot.dispose();
    this.dispose();
};


