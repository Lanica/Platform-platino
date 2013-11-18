#Lanica Platino SDK™ - Sample Code

The Lanica Platino SDK includes a list of sample code apps.

We think you’ll find helpful to understand some of the API fundamentals and get you started. You can find additional samples in the Lanica development open source project on our github repository.

We encourage you to participate and contribute to these samples if you improve any of the code. Fork the repo, make your changes, and submit a pull request.


## Camera View

Demonstrates the use of the Platino GameView's Camera object. Learn how to create a [Transform](http://docs.lanica.co/docs/#!/api/Transform) instance for use with the [GameView](http://docs.lanica.co/docs/#!/api/GameView)'s camera to pan/zoom the screen.

APIs covered:

* [platino.createTransform()](http://docs.lanica.co/docs/#!/api/Platino-method-createTransform)
* [game.moveCamera()](http://docs.lanica.co/docs/#!/api/GameView-method-moveCamera)

[Get Started](https://github.com/Lanica/Platform/tree/master/platino/Engine/Camera)

## Multiplayer Tank Sample Game

Multi-player tank game demo. Annihilate your remote opponent in this 2D top-down action game. As seen at CodeStrong 2012.

[Get Started](https://github.com/Lanica/Platform/tree/master/platino/Engine/CodestrongTank)

## Events

Demonstrates event listeners in Platino. Learn how to direct touch events to individual sprites, and how to listen to {@link GameView game} and {@link Scene scene}-specific events.

APIs covered:

* sprite.addEventListener() (Individual Sprite Touch Events)
* game.addEventListener() (Global screen touch events)
* scene.addEventListener() (activation/deactivation of scenes)
* [platino.createSprite()](http://docs.lanica.co/docs/#!/api/Platino-method-createSprite)

[Get Started](https://github.com/Lanica/Platform/tree/master/platino/Engine/Events)

## Isometric Tile Map

Demonstrates usage of Platino APIs to create an isometric tilemap.

[Get Started](https://github.com/Lanica/Platform/tree/master/platino/Engine/IsometricTileMapTest)

## Physics Chipmunk 2D Sample

Bouncing soccer balls and tumbling crates with our physics module. Covers basic Chipmunk2D module usage (physics demo).

[Get Started](https://github.com/Lanica/Platform/tree/master/platino/Engine/ChipmunkSample)

## Platino Samples

A collection of different modules that demonstrates the usage of almost every Platino API.

[Get Started](https://github.com/Lanica/Platform/tree/master/platino/Engine/PlatinoSamples)

## Shooter Game Sample

Fun shooter action game demo. Learn how to create {@link sprite sprites}, animate objects with {@link transform transforms}, and apply cool particle effects to make your game scenes come alive. As seen at CodeStrong 2012.

[Get Started](https://github.com/Lanica/Platform/tree/master/platino/Engine/PlatinoShooter)

## Scenes

Demonstrates the use of the Platino {@link Scene}s. Learn how to create, activate, deactivate, and transition between scenes.

APIs covered:

* [platino.createScene()](http://docs.lanica.co/docs/#!/api/Platino-method-createScene)
* [game.replaceScene()](http://docs.lanica.co/docs/#!/api/GameView-method-replaceScene) (Transitioning between scenes)
* scene.addEventListener() (activation/deactivation of scenes)
* [scene.add()](http://docs.lanica.co/docs/#!/api/Scene-method-add) (adding sprites to scenes)

[Get Started](https://github.com/Lanica/Platform/tree/master/platino/Engine/Camera)

## Transforms

Demonstrates the use of the Platino {@link transform transform} objects. Learn how to animate an object by "tweening" specific properties (such as x/y location, alpha, etc).

APIs covered:

* [platino.createTransform()](http://docs.lanica.co/docs/#!/api/Platino-method-createTransform)
* [sprite.transform()](http://docs.lanica.co/docs/#!/api/Sprite-method-transform)
* [sprite.clearTransforms()](http://docs.lanica.co/docs/#!/api/Sprite-method-clearTransforms)
* transform.addEventListener() (start/completion of transform sequences)

## BunnyMark

A fun 2D sprite benchmark sample app, based on [Iain Lobb's original](http://blog.iainlobb.com/2010/11/display-list-vs-blitting-results.html).

The demo starts with 10 bouncing bunnies, with more bunnies being added on every screen tap. Monitor the app's frames-per-second (FPS) in realtime as bunnies invade your device!

[Get Started](https://github.com/Lanica/Platform/tree/master/platino/Engine/BunnyMark)


### [API Reference](http://docs.lanica.co/#!/api)
Platino SDK APIs [Get Started](http://docs.lanica.co/#!/api)

