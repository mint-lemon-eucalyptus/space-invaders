function Game(params) {
    var params = this.params = arguments[0] || {};
//    document.getElementById(params.stage.container).style.background = '#000';
    this.stage = new Kinetic.Stage(params.stage);
    this.layer = new Kinetic.Layer();
    this.stage.add(this.layer);
    this.helper = new Helper();
    //game environment variables and flags
    this.env = {
        state: this.STATE_IDLE,
        score: 0,
        timers: {}
    };
    var textures = {
        alien1: 'http://localhost:63342/fabric/img/alien1.png',
        alien2: 'http://localhost:63342/fabric/img/alien2.png',
        alien3: 'http://localhost:63342/fabric/img/alien3.png',
        alien4: 'http://localhost:63342/fabric/img/alien4.png',
        player: 'http://localhost:63342/fabric/img/player.png'
    };
    this.textFields = {};
    this.textFields = {};
    this.group = new Kinetic.Group({
        clip: {
            x: 0,
            y: 0,
            width: 1000,
            height: 1000
        }
    });
    this.layer.add(this.group);

    var self = this;

    this.helper.prepareImages(textures, function () {
        console.log('images are loaded')
        var firstAlienRowY = 50;
        var alienRowsDistance = 40;
        var aliensRowsX = 10;
        var amplitude = (580 - (aliensRowsX * 30 + (aliensRowsX - 1) * 10)) / 2;
        self.initAliens(firstAlienRowY, alienRowsDistance, aliensRowsX);
        self.startAlienMoving(amplitude);
        self.addText('score', 100, 15, 'ssaad', 20, 'green', 'Calibri');
        self.updateText('score', 'score: 0');
        self.player = self.addTexture('player', self.stage.width() / 2, self.stage.height() - 40 - 5, 80, 40);
        setTimeout(function () {
            self.player.x(self.player.x() + 100)
        }, 1000)
        self.layer.add(self.player)
    });
}
Game.prototype.initAliens = function (firstAlienRowY, alienRowsDistance, aliensRowsX) {
    var self = this;
    self.addAlienRow(firstAlienRowY, aliensRowsX, 'alien1');
    self.addAlienRow(firstAlienRowY + alienRowsDistance, aliensRowsX, 'alien2');
    self.addAlienRow(firstAlienRowY + alienRowsDistance * 2, aliensRowsX, 'alien3');
    self.addAlienRow(firstAlienRowY + alienRowsDistance * 3, aliensRowsX, 'alien4');
    this.layer.draw();
}

Game.prototype.addAlienRow = function (y, count, type) {
    var xOffs = 100;
    var textureSize = 30;
    var dist = 10;
    var arr = [];
    for (var i = 0; i < count; ++i) {
        var alien = this.addTexture(type, xOffs + (textureSize + dist) * i, y, textureSize, textureSize);
        this.group.add(alien);
        arr.push(alien);
    }
    return arr;
}

Game.prototype.addTexture = function (name, x, y, w, h) {
    var texture = new Kinetic.Image({
        x: x,
        y: y,
        width: w, height: h,
        image: this.helper.getImage(name)
    });
    this.layer.draw();
    return texture;
}
Game.prototype.addText = function (id, x, y, text, size, fill, ff) {
    var textItem = new Kinetic.Text({
        x: x,
        y: y,
        text: text,
        fontSize: size,
        fontFamily: ff,
        fill: fill
    });
    this.textFields[id] = textItem;
    this.layer.add(textItem);
    return textItem;
}
Game.prototype.updateText = function (id, newVal) {
    this.textFields[id].setText(newVal);
}
Game.prototype.startAlienMoving = function (amplitude) {
    var self = this;
    var period = 2000;
    console.log(self.group.getSize());
    // in ms
    var centerX = 0;
    var anim = new Kinetic.Animation(function (frame) {
        self.group.setX(amplitude * Math.sin(frame.time * 1 * Math.PI / period) + centerX);
    }, self.layer);
    anim.start();
}

//draw required fields and elements on screen
Game.prototype.initScreen = function (done) {
    var layer = this.layer;

    var group = new Kinetic.Group({
        x: 0,
        y: 40
    });
    layer.add(group);

    var canvas = this.canvas;
    var self = this;
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
    this.addImg('ship', function (ship) {
        ship = self.controls.ship;
        self.canvas.add(ship);
        done();
    }, this.helper.normalize(['top', 'left'], this.canvasDefaults, this.CONTROLS.Image.ship));
}

Game.prototype.updateControl = function (name, prop, newval) {
    this.controls[name][prop] = newval;
    this.canvas.renderAll();
}

Game.prototype.start = function () {
    this.updateControl('score', 'text', this.CONTROLS.Text.score.value + this.env.score);
    var params = arguments[0] || this.params;
    window.onkeydown = onKeyDown;
    var self = this;
    self.env.timers.intervalHandle = setInterval(playerMissile, self.GAMEPLAY_SHIP_CANNON_INTERVAL);
    this.env.score = 0;
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
//                console.log(e.keyCode);
                return;
            }
        }
        self.canvas.renderAll();
        return false;
    }

    //draw player`s ship
    var ship = self.controls.ship;

    this.aliens = new fabric.Group([], {
        top: 0,
        left: 0
    });
    this.canvas.add(this.aliens);

    function playerMissile() {
        var missileParams = self.CONTROLS_MISSILE;
        var missile = new fabric.Rect({
            left: ship.left + ship.width / 2 - missileParams.width / 2,
            top: ship.top - missileParams.height,
            fill: 'red',
            width: missileParams.width, height: missileParams.height});
        self.canvas.add(missile);

        missile.animate('top', 0, {
            onChange: checkCollisions,
            onComplete: function () {
                self.canvas.remove(missile)
            },
            duration: 700,
            easing: fabric.util.ease.easeOutSine
        });

        function checkCollisions() {
            var missileY = missile.top
            var missileX = missile.left
            if (self.aliens._objects.length >= 3) {
                var a = self.aliens._objects[0];
                var b = self.aliens._objects[1];
                var alien = self.aliens._objects[2];
                var alienX = alien.left
                var alienY = alien.top
                console.log(alienX)
                //     console.log(a.left, b.left);
                //     console.log(a.intersectsWithObject(b));
            }

            self.canvas.renderAll();
        }

    }

    function createAlien(x, y, type, name) {
        var alien = new fabric.Rect({left: x, top: y, fill: 'red', width: 20, height: 20});

        self.controls[name] = alien;
        //  console.log(alien);
        alien.top = x;
        alien.left = y;
        self.aliens.addWithUpdate(alien);//add it to group
        self.canvas.renderAll();
        //   console.log(alien.top, alien.left);
    }

    createAlien(50, 50, 'type1', 'a1');
    createAlien(50, 50 + 10, 'type1', 'a1');
    createAlien(50, 50 + 60, 'type1', 'a1');
    createAlien(50, 50 + 90, 'type1', 'a1');
    createAlien(50, 50 + 120, 'type1', 'a1');

    var animateX = 200;

    function onCompleteMoveX() {
        animateX = animateX == 0 ? 300 - self.aliens.width : 0;
        //    animateProperty = animateProperty == 'left' ? 'right' : 'left';
        self.aliens.animate('left', animateX, {
            onChange: onChange,
            onComplete: onCompleteMoveX,
            duration: 2000,
            easing: fabric.util.ease.easeOutSine
        });
    }

    function onChange() {
        self.canvas.renderAll();
    }

    onCompleteMoveX()

}

Game.prototype.addImg = function (name, cb, controlData) {
    var self = this;
    fabric.Image.fromURL(controlData.url, function (img) {
        self.controls[name] = img;
        cb(img);
    }, controlData);
}


//defaults here
Game.prototype.CONTROLS_TEXTSIZE = 25;
Game.prototype.CONTROLS_SHIP_STEP = 10;
Game.prototype.CONTROLS_MISSILE = {width: 30, height: 15};
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
        missile: {url: '/fabric/img/missile.png'},
        aliens: {type1: {url: '/fabric/img/alien1.png'}}
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
Helper.prototype.prepareImages = function (srcArr, done) {
    this.images = {};
    var self = this;
    var arr = [];
    for (var i in srcArr) {
        arr.push({id: i, data: srcArr[i]});
    }
    async.map(arr, function (a, next) {
        var imageObj = new Image();
        self.images[a.id] = imageObj;
        imageObj.src = a.data;
        imageObj.onload = function () {
            next();
        }
    }, function () {
        done();
    });
}
Helper.prototype.getImage = function (src) {
    return this.images[src];
}
Helper.prototype.loadImage = function (data, cb) {
    if (!this.images[data.src]) {
        this.images[data.src] = new Image();
    }
    var imageObj = new Image();
    imageObj.src = data.src;
    imageObj.onload = function () {
        var img = new Kinetic.Image({
            x: data.x,
            y: data.y,
            image: imageObj,
            width: data.width,
            height: data.height
        });
        cb(img);
    };
}

Helper.prototype.doObjectsCollide = function (a, b) { // a and b are your objects
    var ca = a.getAbsolutePosition(), cb = b.getAbsolutePosition();
    console.log(ca, cb, a.getHeight(), a.getWidth(), b.getHeight(), b.getWidth());
    return !(
        ((ca.y + a.getHeight()) < (cb.y)) ||
            (ca.y > (cb.y + b.getHeight())) ||
            ((ca.x + a.getWidth()) < cb.x) ||
            (ca.x > (cb.x + b.getWidth()))
        );
}

