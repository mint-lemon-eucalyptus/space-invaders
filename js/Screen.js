function Game(params) {
    var params = this.params = arguments[0] || {};
    this.helper = new Helper();
    this.helper.merge(params.canvas, this.DEFAULTS_CANVAS_PARAMS);
    var canvasParams = params.canvas;

    var elem = document.querySelector('canvas');
    if (!elem) {//there is no canvas elements on page
        elem = document.createElement('canvas');
        document.querySelector(params.canvas.parent).appendChild(elem);
    }
    //setup canvas
    elem.setAttribute('width', canvasParams.width);
    elem.setAttribute('height', canvasParams.height);
    elem.setAttribute('id', canvasParams.id);
    fabric.Object.prototype.originX = "left";
    fabric.Object.prototype.originY = "top";
    this.canvas = new fabric.Canvas(canvasParams.id);
    //game environment variables and flags
    this.env = {
        state: this.STATE_IDLE,
        score: 0,
        timers: {}
    };
    this.controls = {};


}
//draw required fields and elements on screen
Game.prototype.initScreen = function () {
    var canvas = this.canvas;

    var t = this.params.canvas;
    this.canvasDefaults = {top: t.height, left: t.width, height: t.height, width: t.width};

    //render all controls based on parameters in prototype
    var controlFamily = this.CONTROLS.Text;
    for (var control in controlFamily) {
        //recalculate object`s positions and sizing scaled by real canvas size and scaling factors defined in prototype
        var scoreParams = this.helper.normalize(['top', 'left'], this.canvasDefaults, controlFamily[control]);
        this.controls[control] = new fabric.Text(scoreParams.value, scoreParams);
        canvas.add(this.controls[control]);
    }
}

Game.prototype.updateControl = function (name, prop, newval) {
    this.controls[name][prop] = newval;
    this.canvas.renderAll();
}

Game.prototype.start = function () {
    this.updateControl('score', 'text', this.CONTROLS.Text.score.value + this.env.score);
    var params = arguments[0] || this.params;
    this.env.score = 0;
    var self = this;
    //draw player`s ship
    var ship;
    this.addImg('ship', function (img) {
        ship = self.controls.ship;
        window.onkeydown = onKeyDown;
        self.env.timers.intervalHandle = setInterval(playerMissile, self.GAMEPLAY_SHIP_CANNON_INTERVAL);

        function onKeyDown(e) {
            switch (e.keyCode) {
                case self.KEY_LEFT:
                {
                    if (ship.left <= 0) {
                        return false;
                    }
                    ship.left -= self.CONTROLS_SHIP_STEP;
                    self.canvas.renderAll();
                    break;
                }
                case self.KEY_RIGHT:
                {
                    if ((ship.left + ship.width) >= self.DEFAULTS_CANVAS_PARAMS.width) {
                        break;
                    }
                    ship.left += self.CONTROLS_SHIP_STEP;
                    break;
                }
                case self.KEY_UP:
                {
                    break;
                }
                case self.KEY_DOWN:
                {
                    break;
                }
                default :
                {
                    console.log(e.keyCode);
                    return;
                }
            }
            self.canvas.renderAll();
            return false;
        }

    }, this.helper.normalize(['top', 'left'], this.canvasDefaults, this.CONTROLS.Image.ship));


    function playerMissile() {
        console.log('missile');
        self.addImg('pm', function (img) {
            img.top = ship.top - img.height;
            img.left = ship.left + ship.width / 2 - img.width / 2;
            self.canvas.renderAll();
            setTimeout(function () {
                self.canvas.remove(img)
            }, 500)
        }, self.CONTROLS.Image.missile);
    }

}

Game.prototype.addImg = function (name, cb, controlData) {
    var self = this;
    fabric.Image.fromURL(controlData.url, function (img) {
        self.controls[name] = img;
        self.canvas.add(img);
        cb(img);
    }, controlData);
}


Game.prototype._extends = function (s, d) {
    for (var i in d) {
        s[i] = d[i];
    }
}

//defaults here
Game.prototype.CONTROLS_TEXTSIZE = 25;
Game.prototype.CONTROLS_SHIP_STEP = 10;
Game.prototype.GAMEPLAY_SHIP_CANNON_INTERVAL = 1000;


/*define scaling*/
//all controls here
Game.prototype.CONTROLS = {
    Text: {
        score: {value: 'score: ', left: 0.15, top: 0.01, fontSize: Game.prototype.CONTROLS_TEXTSIZE, fill: 'red'},
        lives: {value: 'lives: ', left: 0.65, top: 0.01, fontSize: Game.prototype.CONTROLS_TEXTSIZE, fill: 'red'}
    },
    Image: {
        ship: {url: '/fabric/img/ship.png', left: 0.4, top: 0.9},
        missile: {url: '/fabric/img/missile.png'}
    }
};


Game.prototype.KEY_LEFT = 37;
Game.prototype.KEY_UP = 38
Game.prototype.KEY_RIGHT = 39;
Game.prototype.KEY_DOWN = 40;

Game.prototype.DEFAULTS_CANVAS_PARAMS = {parent: 'body', width: 300, height: 300, id: 'spaceInvaders'};


Game.prototype.STATE_STARTED = 'STARTED';
Game.prototype.STATE_IDLE = 'IDLE';
Game.prototype.STATE_STARTED = 'STARTED';


function Helper() {
}
Helper.prototype.normalize = function (properties, defaults, overrides) {
    var o = JSON.parse(JSON.stringify(overrides));
    properties.forEach(function (t) {
        o[t] = overrides[t] * defaults[t];
    });
    return o;
}
Helper.prototype.merge = function (_source, _with) {
    for (var i in _with) {
        if (!_source[i]) {
            _source[i] = _with[i];
        }
    }
}