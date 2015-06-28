//fabric.Object.prototype.selectable = false;
/*
 var canvas = new fabric.Canvas('canva');

 var text = new fabric.Text('hello world', { left: 100, top: 100 });
 canvas.add(text);
 /*
 var animateX = -300;

 function onChange() {
 canvas.renderAll();
 }
 function onCompleteMoveX() {
 animateX = animateX == 300 ? 100 : 300;
 //    animateProperty = animateProperty == 'left' ? 'right' : 'left';
 group.animate('left', animateX, {
 onChange: onChange,
 onComplete: moveY,
 duration: 2000,
 easing: fabric.util.ease.easeOutSine
 });
 }

 function moveY() {
 group.animate('top', group.top + 30, {
 onChange: onChange,
 onComplete: function () {
 console.log(group.top, group.height, canvas.height)
 if ((group.top + group.height) >= canvas.height) {
 console.log('top == 0')
 } else {
 onCompleteMoveX();
 }

 },
 duration: 200,
 easing: fabric.util.ease.easeOutSine
 })

 }

 // добавляем прямоугольник, чтобы он отобразился

 var group = new fabric.Group([], {
 top: 100,
 left: 100
 });

 canvas.add(group);

 addRowToGroup(getRowOfAliens(4, 30, 0));
 addRowToGroup(getRowOfAliens(4, 30, 30));
 addRowToGroup(getRowOfAliens(4, 30, 60));
 console.log(group.top, group.height, canvas.height);
 addRowToGroup(getRowOfAliens(4, 30, 90));
 console.log(group.top, group.height, canvas.height);

 function addRowToGroup(row) {
 row.forEach(function (t) {
 group.addWithUpdate(t);
 });
 //   group._calcBounds();
 //   group._updateObjectsCoords();
 }

 function getRowOfAliens(count, distance, offsetY) {
 var arr = [];
 var offsetX = 0;
 for (var i = 0; i < count; ++i) {
 arr.push(new fabric.Rect({left: offsetX, top: offsetY, fill: 'red', width: 20, height: 20}));
 offsetX += distance;
 }
 return arr;
 }

 onCompleteMoveX();
 //canvas.renderAll();
 */

var game = new Game({canvas: { width: 300, height: 300}});
game.initScreen();
    game.start();

