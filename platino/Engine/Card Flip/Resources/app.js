var window = Ti.UI.createWindow({backgroundColor:'black'});

var platino = require('co.lanica.platino');
var game = platino.createGameView();
game.color(0, 0, 0);
game.debug = true;

var scene = platino.createScene();

var bg = platino.createSprite({image:"cardBG2.jpg"});
scene.add(bg)

var cardFront = platino.createSprite({image:"cardFront.png"});
var cardBack = platino.createSprite({image:"cardBack.png"});
cardBack.alpha=0
scene.add(cardFront);
scene.add(cardBack);


var flipToBack1 = platino.createTransform();
flipToBack1.duration = 300;
flipToBack1.angle = 90;
flipToBack1.rotate_axis = platino.Y;

var flipToBack2 = platino.createTransform();
flipToBack2.duration = 300;
flipToBack2.angle = 0;
flipToBack2.rotate_axis = platino.Y;

var flipToFront1 = platino.createTransform();
flipToFront1.duration = 300;
flipToFront1.angle = -90;
flipToFront1.rotate_axis = platino.Y;

var flipToFront2 = platino.createTransform();
flipToFront2.duration = 300;
flipToFront2.angle = 0;
flipToFront2.rotate_axis = platino.Y;

flipToBack1.addEventListener('complete', function(e) {
    cardBack.transform(flipToBack2);
    cardFront.alpha = 0;
    cardBack.alpha = 1;
});

flipToFront1.addEventListener('complete', function(e) {
    cardFront.transform(flipToFront2);
    cardBack.alpha = 0;
    cardFront.alpha = 1;
});

game.addEventListener('touchstart', function(e) {
    if(cardBack.alpha===0){
        cardFront.clearTransforms();
        cardBack.clearTransforms();
        cardFront.transform(flipToBack1);
    }
    else if(cardFront.alpha===0){
        cardFront.clearTransforms();
        cardBack.clearTransforms();
        cardBack.transform(flipToFront1);
    }
});

game.pushScene(scene);

game.addEventListener('onload', function(e) {

    cardFront.rotateFromAxis(0, cardFront.width * 0.5, cardFront.height * 0.5, platino.Y);
    cardBack.rotateFromAxis(-90, cardBack.width * 0.5, cardBack.height * 0.5, platino.Y);

    cardFront.center = {x: game.screen.width * 0.5, y: game.screen.height * 0.5};
    cardBack.center = {x: cardFront.center.x, y: cardFront.center.y};
    
    game.start();
});

//////////////////
window.add(game);
window.open({fullscreen:true, navBarHidden:true});