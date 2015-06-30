function Game(params) {
    this.params = arguments[0] || {};
    document.getElementById(params.stage.container).style.background = '#000';
    this.stage = new Kinetic.Stage(this.params.stage);
    this.layer = new Kinetic.Layer();//main game layer
    this.startupScreen = new Kinetic.Layer();//start game layer
    this.endScreen = new Kinetic.Layer();//game over layer

    this.helper = new Helper();
    //game environment variables and flags
    this.env = {
        state: this.STATE_IDLE,
        score: 0,
        timers: {}
    };
    var textures = {
        alien1: '/img/alien1.png',
        alien2: '/img/alien2.png',
        alien3: '/img/alien3.png',
        alien4: '/img/alien4.png',
        player: '/img/player.png',
        missile: '/img/missile.png',
        alienmissile: '/img/alien-missile.png'
    };

    this.achievements = {
        alien1: 20,
        alien2: 50,
        alien3: 100,
        alien4: 200
    };
    this.textFields = {};
    this.animationHandlers = {};

    this.gamePlay = {
        lives: 3,
        aliensMoveAmplitude: (this.stage.width() - 10) / 2
    };

    var self = this;

    self.playField = {
        x: 10,
        y: 40,
        width: self.stage.width() - 20,
        height: self.stage.height() - 40
    };

    this.helper.prepareImages(textures, function () {
        console.log('images are loaded');
        self.drawStartScreen();
        //self.drawGameOverScreen()
        //self.drawGameScreen();
    });
}
Game.prototype.resource = {
    text: {
        startUp: '"space invaders"\n           game',
        pressAnyKey: 'press any key to start game',
        yourScore: 'Score: ',
        win: 'you win!!!',
        loose: 'you loose...',
        restart: 'press "r" to restart'
    }
};

Game.prototype.drawStartScreen = function () {
    this.env.state = this.STATE_IDLE;
    this.startupScreen.removeChildren();
    this.stage.add(this.startupScreen);
    this.startupScreen.add(this.createText('hello', this.stage.width() / 2 - 110, this.stage.height() / 2, this.resource.text.startUp, 30, 'green'));
    this.startupScreen.add(this.createText('pak', this.stage.width() / 2 - 170, this.stage.height() / 2 + 90, this.resource.text.pressAnyKey, 30, 'red'));
    this.startupScreen.draw();
    this.setKeyboardHandlers();
};
Game.prototype.drawGameScreen = function () {
    this.endScreen.remove();
    this.startupScreen.remove();
    var firstAlienRowY = 50;
    var alienRowsDistance = 40;
    var gamePlay = this.params.gamePlay;
    var aliensInRow = gamePlay.aliensInRow || 10;
    this.env.state = this.STATE_STARTED;
    this.env.lives = this.params.gamePlay.lives;
    this.env.score = 0;
    this.startupScreen.remove();
    if (this.player) {  //game was restarted
        this.layer.removeChildren();
    }
    this.group = new Kinetic.Group({});//group for aliens
    this.stage.add(this.layer)
    this.layer.add(this.group);
    this.initAliens(firstAlienRowY, alienRowsDistance, aliensInRow);
    this.layer.add(this.createText('score', 100, 15, 'score: 0', 20, 'green'));
    this.layer.add(this.createText('lives', 300, 15, 'lives: ' + this.env.lives, 20, 'green'));
    this.layer.add(this.createRect(this.playField.x, this.playField.y, this.playField.width, this.playField.height, 'transparent', 'green', 3));
    this.group.bounds = this.helper.getBounds(this.group.children);
    this.player = this.addTexture('player', this.stage.width() / 2, this.stage.height() - 40 - 5, 80, 40);
    this.layer.add(this.player);
    this.playerShot();
    this.startAlienMoving((this.stage.width() - 40 - (aliensInRow * 30 + (aliensInRow - 1) * 10)) / 2);
    this.layer.draw();
    this.setKeyboardHandlers();
    this.alienShot();
};
Game.prototype.drawGameOverScreen = function (win) {
    this.env.state = this.STATE_ENDED;
    this.env.lives = this.params.gamePlay.lives;
    this.layer.remove();
    this.stage.add(this.endScreen);
    var resultText = win ? this.resource.text.win : this.resource.text.loose;

    this.endScreen.add(this.createText('result', this.stage.width() / 2 - 110, this.stage.height() / 2 - 90, resultText, 30, 'green'));
    this.endScreen.add(this.createText('your score', this.stage.width() / 2 - 120, this.stage.height() / 2, this.resource.text.yourScore + this.env.score, 30, 'red'));
    this.endScreen.add(this.createText('control', this.stage.width() / 2 - 120, this.stage.height() / 2 + 90, this.resource.text.restart, 30, 'blue'));
    this.endScreen.draw();
    this.setKeyboardHandlers();
};

Game.prototype.setKeyboardHandlers = function () {
    var self = this;
    switch (this.env.state) {//listen to any key
        case this.STATE_IDLE:
        {
            window.onkeydown = function (e) {
                console.log('idle')
                self.drawGameScreen();
            };
            break;
        }
        case  this.STATE_STARTED:
        {
            console.log('started');
            var moveSpeed = self.params.gamePlay.playerSpeed || 10;
            window.onkeydown = function (e) {
                var ship = self.player;
                switch (e.keyCode) {
                    case self.KEY_LEFT:
                    {
                        var x = ship.x();
                        if (x <= 10) {
                            return false;
                        }
                        ship.setX(x - moveSpeed);
                        self.layer.draw();
                        break;
                    }
                    case self.KEY_RIGHT:
                    {
                        var x = ship.x();
                        if ((x + ship.width()) >= (self.stage.width() - 10)) {
                            break;
                        }
                        ship.setX(x + moveSpeed);
                        self.layer.draw();
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
//                        console.log(e.keyCode);
                        return;
                    }
                }
            }
            break;
        }
        case self.STATE_ENDED:
        {
            window.onkeydown = function (e) {
                console.log('ended', e.keyCode);
                if (e.keyCode === 82) {
                    self.drawGameScreen();
                }
            };
            break;
        }
    }
};

Game.prototype.initAliens = function (firstAlienRowY, alienRowsDistance, aliensRowsX) {
    var self = this;
    self.addAlienRow(firstAlienRowY, aliensRowsX, 'alien1');
    self.addAlienRow(firstAlienRowY + alienRowsDistance, aliensRowsX, 'alien2');
    self.addAlienRow(firstAlienRowY + alienRowsDistance * 2, aliensRowsX, 'alien3');
    self.addAlienRow(firstAlienRowY + alienRowsDistance * 3, aliensRowsX, 'alien4');
    this.layer.draw();
};

Game.prototype.alienShot = function () {
    if (this.env.state !== this.STATE_STARTED) {
        return;
    }
    var self = this;
    var alien = this.group.children[this.helper.random(0, this.group.children.length)];

    var pos = alien.getAbsolutePosition();
    var missile = this.addTexture('alienmissile', pos.x + alien.width() / 2, pos.y);
    this.layer.add(missile);
    var animation = new Kinetic.Animation(function (frame) {
        var y = missile.y();
        if (y >= self.stage.height()) {
            animation.stop();
            missile.remove();
            self.alienShot();
        } else {
            missile.y(missile.y() + self.params.gamePlay.alienMissileSpeed || 10);
            if (self.helper.doObjectsCollide(self.player, missile)) {
                animation.stop();
                //    self.player.remove();
                missile.remove();
                self.env.lives -= 1;
                self.updateText('lives', 'lives: ' + self.env.lives);
                if (self.env.lives > 0) {
                    self.alienShot();
                } else {    //player loses
                    self.onStop(false);
                }
            }
        }
    }, self.layer);
    animation.start();
    self.animationHandlers.alienmissile = animation;
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
};
Game.prototype.addTexture = function (name, x, y, w, h) {
    var texture = new Kinetic.Image({
        x: x,
        y: y,
        width: w, height: h,
        image: this.helper.getImage(name)
    });
    texture._actorClass = name;
    return texture;
};
Game.prototype.createRect = function (x, y, w, h, fill, stroke, sw) {
    var item = new Kinetic.Rect({
        x: x,
        y: y,
        width: w,
        height: h,
        fill: fill,
        stroke: stroke,
        strokeWidth: sw
    });
    return item;
};
Game.prototype.createText = function (id, x, y, text, size, fill, ff) {
    var item = this.textFields[id];
    if (!item) {
        var item = new Kinetic.Text({
            x: x,
            y: y,
            text: text,
            fontSize: size,
            fontFamily: ff || 'Calibri',
            fill: fill
        });
        this.textFields[id] = item;
    } else {
        item.setText(text);
    }
    return item;
};
Game.prototype.updateText = function (id, newVal) {
    this.textFields[id].setText(newVal);
};
Game.prototype.startAlienMoving = function (amplitude) {
    var self = this;
    var period = 2000;
    console.log(self.group.getSize());
    // in ms
    var stepX = this.params.gamePlay.alienSpeedX, stepY = this.params.gamePlay.alienSpeedY;
    var anim = new Kinetic.Animation(function (frame) {
        var x = self.group.x();
        if (x <= -amplitude || x >= amplitude) {
            stepX = -stepX;
            var yBot = self.group.bounds.y2, y = self.group.y();
            if ((y + yBot + stepY) >= self.player.y()) {
                self.onStop(false);
            }
            self.group.y(self.group.y() + stepY);
        }
        self.group.setX(x + stepX);
    }, self.layer);
    anim.start();
    self.animationHandlers.aliens = anim;
};
Game.prototype.onStop = function (win) {
    this.env.state = this.STATE_ENDED;
    for (var i in this.animationHandlers) {
        this.animationHandlers[i].stop();
    }
    this.drawGameOverScreen(win);
};
Game.prototype.playerShot = function () {
    if (this.env.state !== this.STATE_STARTED) {
        return;
    }
    var missile = this.addTexture('missile', this.player.x() + (this.player.width()) / 2, this.player.y() - 20);
    var self = this;

    this.layer.add(missile);
    var animation = new Kinetic.Animation(function (frame) {
        var y = missile.y();
        if (y <= 0) {
            animation.stop();
            missile.remove();
            self.playerShot();
        } else {
            missile.y(missile.y() - 13);
            var arr = self.group.children;
            for (var i = 0; i < arr.length; ++i) {
                var item = arr[i];
                if (self.helper.doObjectsCollide(item, missile)) {
                    animation.stop();
                    item.remove();
                    missile.remove();
                    var achievement = self.getAchievement(item._actorClass);
                    self.env.score += achievement;
                    self.updateText('score', 'score: ' + self.env.score);
                    if (arr.length > 0) {
                        self.playerShot();
                    } else {    //player wins
                        self.onStop(true);
                    }
                    break;
                }
            }
        }
    }, self.layer);
    animation.start();
    self.animationHandlers.missile = animation;
};

Game.prototype.getAchievement = function (actorClass) {
    return this.achievements[actorClass];
};


Game.prototype.STATE_IDLE = 0;
Game.prototype.STATE_STARTED = 1;
Game.prototype.STATE_ENDED = 2;

Game.prototype.KEY_LEFT = 37;
Game.prototype.KEY_UP = 38;
Game.prototype.KEY_RIGHT = 39;
Game.prototype.KEY_DOWN = 40;

function Helper() {
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
};
Helper.prototype.getImage = function (src) {
    return this.images[src];
};

Helper.prototype.getBounds = function (childs) {
    var minX = Number.MAX_VALUE, minY = Number.MAX_VALUE, maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE;
    childs.forEach(function (item) {
        var x = item.x(), y = item.y(), x2 = item.width() + x, y2 = item.height() + y;
        console.log(x, y, x2, y2);
        if (x < minX) {
            minX = x;
        }
        if (y < minY) {
            minY = y;
        }
        if (x2 > maxX) {
            maxX = x2;
        }
        if (y2 > maxY) {
            maxY = y2;
        }
    });
    return{
        x1: minX, y1: minY, x2: maxX, y2: maxY
    }
};
Helper.prototype.doObjectsCollide = function (a, b) { // a and b are your objects
    var ca = a.getAbsolutePosition(), cb = b.getAbsolutePosition();
    //   console.log(ca, cb, a.getHeight(), a.getWidth(), b.getHeight(), b.getWidth());
    return !(
        ((ca.y + a.getHeight()) < (cb.y)) ||
            (ca.y > (cb.y + b.getHeight())) ||
            ((ca.x + a.getWidth()) < cb.x) ||
            (ca.x > (cb.x + b.getWidth()))
        );
};
Helper.prototype.random = function (min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

