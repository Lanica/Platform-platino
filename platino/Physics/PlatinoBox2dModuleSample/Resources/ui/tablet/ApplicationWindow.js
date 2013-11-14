var platino = require("co.lanica.platino");
require("co.lanica.box2d");
var box2d = co_lanica_box2d;

var game, ground, rect1, rect2, world, box2dground, box2drect1, box2drect2;
var contactListener, rect1Fixture, rect2Fixture;

var DEGTORAD = 0.0174532925199432957;
var RADTODEG = 57.295779513082320876;

//Application Window Component Constructor
function ApplicationWindow() {
	//create component instance
	var self = Ti.UI.createWindow({
		backgroundColor:'#ffffff'
	});

    game  = platino.createGameView();
    var scene = platino.createScene();

    game.color(0, 0, 0);
    scene.color(0, 0, 0);

    game.debug = true;
    game.enableOnFpsEvent = true;
    game.onFpsInterval    = 3000;

    game.addEventListener('onfps', function(e) {
        Ti.API.info(e.fps.toFixed(2) + " fps");
    });

    ground = platino.createSprite({x:0, height: 20});
    rect1  = platino.createSprite({width:40,height:40});
    rect2  = platino.createSprite({width:40,height:40});

    ground.color(0, 0, 1);
    rect1.color(1, 0, 0);
    rect2.color(0, 1, 0);

    scene.add(ground);
    scene.add(rect1);
    scene.add(rect2);

    game.pushScene(scene);

    game.addEventListener('onload', function(e) {

        rect1.angle = 45;
        rect2.angle = 45;

        rect1.center = {x: game.screen.width * 0.5, y: 0};
        rect2.center = {x: game.screen.width * 0.5, y: rect1.height * 2};

        ground.width = game.screen.width;
        ground.y = game.screen.height - ground.height;

        initBox2dWorld(game);

        game.start();
    });

    game.enableOnDrawFrameEvent = true;
    game.addEventListener('enterframe', updateWorld);

    game.addEventListener('touchstart', function(e) {

    });

    self.add(game);
	return self;
}

var step = 1.0 / 30.0;

function updateWorld(e) {
    world.Step(step, 10, 2);

    var pos = box2drect1.GetPosition();
    rect1.center = {x:pos.x, y:pos.y};
    rect1.rotate(box2drect1.GetAngle() * RADTODEG);

    pos = box2drect2.GetPosition();
    rect2.center = {x:pos.x, y:pos.y};
    rect2.rotate(box2drect2.GetAngle() * RADTODEG);
}

function initBox2dWorld() {
    world  = new box2d.b2World(new box2d.b2Vec2(0, 9.8));

    // add static floor
    var staticBodyDef = new box2d.b2BodyDef();
    staticBodyDef.type = box2d.b2_staticBody;
    staticBodyDef.position.Set(ground.center.x, ground.center.y);

    var boxShape = new box2d.b2PolygonShape();
    boxShape.SetAsBox(ground.width / 2, ground.height / 2);

    var boxFixtureDef = new box2d.b2FixtureDef();
    boxFixtureDef.shape = boxShape;
    boxFixtureDef.density = 1;
    boxFixtureDef.friction = 0.2;
    boxFixtureDef.restitution = 0.1;

    box2dground = world.CreateBody(staticBodyDef);
    box2dground.CreateFixture(boxFixtureDef);

    var dynamicBodyDef = new box2d.b2BodyDef();
    dynamicBodyDef.type = box2d.b2_dynamicBody;
    boxShape.SetAsBox(rect1.width / 2, rect1.height / 2);
    dynamicBodyDef.angle = (rect1.angle * DEGTORAD);

    dynamicBodyDef.position.Set(rect1.center.x, rect1.center.y);
    box2drect1 = world.CreateBody(dynamicBodyDef);
    rect1Fixture = box2drect1.CreateFixture(boxFixtureDef);

    dynamicBodyDef.position.Set(rect2.center.x, rect2.center.y);
    box2drect2 = world.CreateBody(dynamicBodyDef);
    rect2Fixture = box2drect2.CreateFixture(boxFixtureDef);

    contactListener = new box2d.ContactListener(this);
    contactListener.BeginContact = function(contact) {
        var fixtureA = contact.GetFixtureA();
        var fixtureB = contact.GetFixtureB();

        if (fixtureA.equals(rect1Fixture) && fixtureB.equals(rect2Fixture)) {
            Ti.API.info("rect1 is colliding with rect2");
        } else if (fixtureA.equals(rect2Fixture) && fixtureB.equals(rect1Fixture)) {
            Ti.API.info("rect2 is colliding with rect1");
        }
    };
    contactListener.EndContact = function(contact) {};
    contactListener.PreSolve = function(contact, manifold) {};
    contactListener.PostSolve = function(contact, impluse) {};

    world.SetContactListener(contactListener);
}

//make constructor function the public component interface
module.exports = ApplicationWindow;
