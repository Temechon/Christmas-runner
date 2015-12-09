/**
 * Contains a pool of sapinous. If a sapinou is too far from the camera, it is recycled.
 * @constructor
 */
var SapinouManager = function(game) {

    this.game = game;
    this.sapinous = [];
    this.gates = [];
    this.maxNumber = 25;

    this.lastZPosition = 0;
    this.lastZPositionGates = 0;

};


SapinouManager.prototype.randomNumber = function (min, max) {
    if (min === max) {
        return (min);
    }
    var random = Math.random();
    return ((random * (max - min)) + min);
};


SapinouManager.prototype.recycle = function() {

    var limiteInf = this.game.player.position.z - 20;
    for (var i=0; i<this.sapinous.length; i++) {
        var s = this.sapinous[i];
        if (s.position.z < limiteInf) {
            s.position.z += 150;
            break;
        }
    }
    for (i=0; i<this.gates.length; i++) {
        var g = this.gates[i];
        if (g.position.z < limiteInf) {
            g.position.z += 150;
            break;
        }
    }
};

SapinouManager.prototype.init = function() {

    this.lastZPosition = 0;
    this.lastZPositionGates = 0;

    for (var i=0; i<2*this.maxNumber; i+=2) {
        // sapinou 1
        var s1 = this.sapinous[i];
        s1.position = new BABYLON.Vector3(this.game.player.position.x - this.game.lanes.nblanes/2*5 - this.randomNumber(2.5,5), 4, this.lastZPosition);
        // sapinou 2
        var s2 = this.sapinous[i+1];
        s2.position = new BABYLON.Vector3(this.game.player.position.x + this.game.lanes.nblanes/2*5 + this.randomNumber(2.5,5), 4, this.lastZPosition);
        this.lastZPosition += this.randomNumber(4,8);

        // gate 1
        var g1 = this.gates[i];
        g1.position = new BABYLON.Vector3(this.game.player.position.x - this.game.lanes.nblanes/2*5, 1, this.lastZPositionGates);
        // gate 2
        var g2 = this.gates[i+1];
        g2.position = new BABYLON.Vector3(this.game.player.position.x + this.game.lanes.nblanes/2*5 , 1, this.lastZPositionGates);
        this.lastZPositionGates += 9;
    }

};

// Create sapinous
SapinouManager.prototype.plant = function() {

    for (var i=0; i<this.maxNumber; i++) {
        // left
        var a1 = this.game.assets['sapinou'].meshes.createInstance("sapinou");
        a1.rotation.y = Math.random()*Math.PI*2;
        // right
        var a2 = this.game.assets['sapinou'].meshes.createInstance("sapinou");
        a2.rotation.y = Math.random()*Math.PI*2;
        this.sapinous.push(a1, a2);
    }

    for (var j=0; j<this.maxNumber; j++) {
        // left
        var g1 = this.game.assets['gate'].meshes.createInstance("gate");
        // right
        var g2 = this.game.assets['gate'].meshes.createInstance("gate");
        this.gates.push(g1, g2);
    }
};
