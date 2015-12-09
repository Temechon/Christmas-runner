var Lanes = function(game) {

    this.game = game;

    // Number of planes along z-axis
    this.maxNumber = 10;

    // Number of lanes
    this.nblanes = 3;

    this.lanes = [];

    this.lastZPosition = 0;

    this.length = 10;

    var footpath = new BABYLON.StandardMaterial("", game.scene);
    footpath.diffuseTexture = new BABYLON.Texture("assets/ground.jpg", game.scene);
    footpath.diffuseTexture.vScale = 2;
    //footpath.diffuseTexture.hasAlpha = true;
    footpath.specularColor = BABYLON.Color3.Black();

    for (var i = 0; i<this.nblanes; i++){
        for (var l=0; l<this.maxNumber; l++) {
            var g = BABYLON.Mesh.CreateGround("lane", 3, this.length, 1, game.scene);
            g.material = footpath;
            g.receiveShadows = true;
            this.lanes.push(g);
        }
    }
    this.init();
};


Lanes.prototype.init = function() {

    this.lastZPosition = ((this.lanes.length-1)%this.maxNumber) * this.length + this.length/2;
    var interval = 4;
    var cp = interval * -1 * (this.nblanes/2);

    for (var i = 0; i<this.lanes.length; i++){
        var l = this.lanes[i];
        l.position.x = cp;
        l.position.y = 0.1;
        l.position.z = (i%this.maxNumber) * this.length + this.length/2;

        if ((i+1) % this.maxNumber == 0) {
            cp += interval;
        }
    }
};

Lanes.prototype.getLanePositionX = function(c) {
    return this.lanes[c*this.maxNumber].position.x;
};

Lanes.prototype.getRandomLane = function() {

    var randomNumber = function (min, max) {
        if (min === max) {
            return (min);
        }
        var random = Math.random();
        return ((random * (max - min)) + min);
    };

    var c = randomNumber(0, this.nblanes);
    return this.lanes[c].position.x;
};

Lanes.prototype.getMiddleX = function() {
    var c = Math.floor(this.nblanes/2*this.maxNumber);
    return this.lanes[c].position.x;
};

Lanes.prototype.recycle = function() {

    var _this  = this;
    var increase = false;
    this.lanes.forEach(function(l) {
        if (l.position.z < _this.game.player.position.z - 25) {
            l.position.z = _this.lastZPosition;
            increase = true;
        }
    });
    if (increase) {
        this.lastZPosition += this.length;
    }
};

Lanes.prototype.reset = function() {
    this.init();
};