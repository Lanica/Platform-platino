game.debug = true;

//
// prints out fps(frame per second) on every 5 seconds
//
game.enableOnFpsEvent = true; // onfps event is disabled by default so enable this
game.onFpsInterval    = 5000; // set onfps interval msec (default value equals 5,000 msec)

game.addEventListener('onfps', function(e) {
    Ti.API.info(e.fps.toFixed(2) + " fps");
});

alloy.addEventListener('onlowmemory', function(e) {
    Ti.API.warn("Low Memory");
});
