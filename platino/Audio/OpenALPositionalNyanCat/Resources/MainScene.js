var platino = require('co.lanica.platino');
var ALmixer = platino.require('co.lanica.almixer');




// I made this a helper function because it wasn't obvious what the best way to hide a particle was.
// scene.remove() on the particle works, but the instantaneous disappearance of the existing particles was unpleasant to look at.
// This could be solved with a delayed timer callback to remove the particles after the next gets going for a little bit, 
// but I didn't feel like adding more indirection for what is supposed to be a simple audio example.
// I also tried pause(), stop(), resume(), and restart(), but it didn't work the way I wanted.
// I didn't see any difference between pause() and stop() so particles would freeze on screen, which included the inability to move them once frozen.
// I also tried setting .alpha to 0, but it didn't seem to do anything.
// So my solution is kind of silly but effective; I just move the particles to some place offscreen.
// In theory, I'm wasting some CPU and the timer callback technique would be better, but for this simple example, 
// the performance shouldn't make a difference.
function HideParticle(particle_effect, scene)
{
    particle_effect.move(-10000, -10000);
}

// This is the counterpart function for HideParticle.
function ShowParticle(particle_effect, x, y)
{
    particle_effect.move(x, y);
}

(function() {


	var MainScene = function(window, game) {
		var scene = platino.createScene();

		var touchableObjectsArray = [];
		var currentlyTouchedObjectsList = {};
		var audioSource = null;
		var audioListener = null;
		var sourceTrailParticles = [];
		var currentSourceTrailParticle = null;
		var listenerTrailParticles = [];
		var currentListenerTrailParticle = null;

		// Yes! It's the Nyanyanyanyanyanyanya (Nyan Cat Song) from https://www.youtube.com/watch?v=QH2-TGUlwu4
		// and http://momolabo.lolipop.jp/nyancatsong/Nyan/Nyanyanyanyanyanyanya%21.html
		var soundEffectHandle = ALmixer.LoadAll("NyaNyaLoopMono.wav");
		// Since this app uses OpenAL effects which need OpenAL source ids, let's grab a free channel and hold on/reuse its source.
		// Since we have nothing else playing, we know all channels are free. So let's use channel 0.
		// If we did not know this, we could use ALmixer.FindFreeChannel() first to get a free channel.
		// If we had more sounds, playing, we might also want to use ALmixer.ReserveChannels() to prevent auto-assignment from trying to use our channel.
		var alSourceID = ALmixer.GetSource(0);

		// I like linear distance models for 2D games.
		// Options are AL_NONE, AL_INVERSE_DISTANCE, AL_INVERSE_DISTANCE_CLAMPED
		// AL_LINEAR_DISTANCE, AL_LINEAR_DISTANCE_CLAMPED
		// AL_EXPONENT_DISTANCE, AL_EXPONENT_DISTANCE_CLAMPED 
		ALmixer.alDistanceModel(ALmixer.AL_LINEAR_DISTANCE_CLAMPED);
		// Turn on Doppler effects
		ALmixer.alDopplerFactor(0.3);
		// Default speed of sound in OpenAL is 343.3 (which is speed of sound in air)
		ALmixer.alSpeedOfSound(343.3);

		// We want to set the scale/range of how sound will get quieter as things get farther apart.
		// In ApplicationWindow.js, we implied we were working in a game virtual space of 1024x768.
		// So let's set the max drop off distance at 700.
		ALmixer.alSourcef(alSourceID, ALmixer.AL_MAX_DISTANCE, 700);

		var onSpriteTouch = function(e)
		{
			Ti.API.info(e.source.name + ' fired a touch event with type: ' + e.type);
		};

		var onAudioListenerTouchStart = function(e)
		{
			audioListener.center = {x:e.x, y:e.y};
			audioListener.color(1.0, 0, 1.0);
		};
		
		var onAudioListenerTouchMove = function(e)
		{
			audioListener.center = {x:e.x, y:e.y};
			audioListener.color(1.0, 0.0, 0.0);
			if(currentListenerTrailParticle !== null)
			{
				currentListenerTrailParticle.x = audioListener.center.x;
				currentListenerTrailParticle.y = audioListener.center.y;
			}
			// Note: Remember that OpenAL coordinates follow Cartesian coordinates which you find in your math books, OpenGL, physics libraries.
			// Titanium views are upside-down compared to everything else. So we should invert our y-coordinates.
			// (Not that we will be able to hear the difference in this example since nobody has speakers above and below their heads.)
			// In ApplicationWindow.js, we implied we were working in a game virtual space of 1024x768, where our height is 768.
			ALmixer.alListener3f(ALmixer.AL_POSITION, audioListener.center.x, game.TARGET_SCREEN.height - audioListener.center.y, 0);
				
		};
		
		var onAudioListenerTouchEnd = function(e)
		{
			audioListener.center = {x:e.x, y:e.y};
			audioListener.color(1.0, 1.0, 1.0);
			if(currentListenerTrailParticle !== null)
			{
				currentListenerTrailParticle.x = audioListener.center.x;
				currentListenerTrailParticle.y = audioListener.center.y;
			}
			// Note: Remember that OpenAL coordinates follow Cartesian coordinates which you find in your math books, OpenGL, physics libraries.
			// Titanium views are upside-down compared to everything else. So we should invert our y-coordinates.
			// (Not that we will be able to hear the difference in this example since nobody has speakers above and below their heads.)
			// In ApplicationWindow.js, we implied we were working in a game virtual space of 1024x768, where our height is 768.
			ALmixer.alListener3f(ALmixer.AL_POSITION, audioListener.center.x, game.TARGET_SCREEN.height - audioListener.center.y, 0);

		};
		

		var onAudioSourceTouchStart = function(e)
		{
			audioSource.center = {x:e.x, y:e.y};
			if(currentSourceTrailParticle !== null)
			{
				currentSourceTrailParticle.x = audioSource.center.x;
				currentSourceTrailParticle.y = audioSource.center.y;
			}
		};

		var onAudioSourceTouchMove = function(e)
		{
			audioSource.center = {x:e.x, y:e.y};
			if(currentSourceTrailParticle !== null)
			{
				currentSourceTrailParticle.x = audioSource.center.x;
				currentSourceTrailParticle.y = audioSource.center.y;
			}
			// Note: Remember that OpenAL coordinates follow Cartesian coordinates which you find in your math books, OpenGL, physics libraries.
			// Titanium views are upside-down compared to everything else. So we should invert our y-coordinates.
			// (Not that we will be able to hear the difference in this example since nobody has speakers above and below their heads.)
			// In ApplicationWindow.js, we implied we were working in a game virtual space of 1024x768, where our height is 768.
			ALmixer.alSource3f(alSourceID, ALmixer.AL_POSITION, audioSource.center.x, game.TARGET_SCREEN.height - audioSource.center.y, 0);
			
		};

		var onAudioSourceTouchEnd = function(e)
		{
			audioSource.center = {x:e.x, y:e.y};
			if(currentSourceTrailParticle !== null)
			{
				currentSourceTrailParticle.x = audioSource.center.x;
				currentSourceTrailParticle.y = audioSource.center.y;
			}
			// Note: Remember that OpenAL coordinates follow Cartesian coordinates which you find in your math books, OpenGL, physics libraries.
			// Titanium views are upside-down compared to everything else. So we should invert our y-coordinates.
			// (Not that we will be able to hear the difference in this example since nobody has speakers above and below their heads.)
			// In ApplicationWindow.js, we implied we were working in a game virtual space of 1024x768, where our height is 768.
			ALmixer.alSource3f(alSourceID, ALmixer.AL_POSITION, audioSource.center.x, game.TARGET_SCREEN.height - audioSource.center.y, 0);			
		};

		var onScreenTouchStart = function(event)
		{
            var e = game.locationInView(event);
			var i;
			var event_data;
			var current_touched_object;

			for(i=0; i<touchableObjectsArray.length; i++)
			{
				if(touchableObjectsArray[i].contains(e.x, e.y))
				{
					event_data =
					{
						x: e.x,
						y: e.y
					};
					current_touched_object = touchableObjectsArray[i];
//					Ti.API.debug("onScreenTouchStart object " + current_touched_object);
//					Ti.API.debug("onScreenTouchStart object.name " + current_touched_object.name);
//					Ti.API.debug("onScreenTouchStart e.type " + e.type);
					currentlyTouchedObjectsList[current_touched_object] = current_touched_object;
					current_touched_object.fireEvent(e.type, event_data);
				}
			}
		};
		
		var onScreenTouchMove = function(event)
		{
            var e = game.locationInView(event);
			var key;
			var touched_object;
			var event_data;
			event_data =
			{
				x: e.x,
				y: e.y
			};
			for(key in currentlyTouchedObjectsList)
			{
                touched_object = currentlyTouchedObjectsList[key];
				touched_object.fireEvent(e.type, event_data);
			}
		};
		
		var onScreenTouchEnd = function(event)
		{
            var e = game.locationInView(event);
			var key;
			var touched_object;
			var event_data;
			event_data =
			{
				x: e.x,
				y: e.y
			};
			for(key in currentlyTouchedObjectsList)
			{
                touched_object = currentlyTouchedObjectsList[key];
				touched_object.fireEvent(e.type, event_data);
				delete currentlyTouchedObjectsList[key];
			}
		};
		

		var onSceneActivated = function(e)
		{
			// ---- create sprites, add listeners, etc. ----
			var current_particle_index = 0;
			Ti.API.info("MainScene has been activated.");
			
			// Yes! It's the adorable Nyan Cat from https://www.youtube.com/watch?v=QH2-TGUlwu4
			// and http://nyan.cat/
			audioSource = platino.createSpriteSheet(
            {
				x:100,
				y:100,
				image:'NyanCat_NyanCat.xml'
			});
            game.setupSpriteSize(audioSource);
			audioSource.name = 'audioSource';

			sourceTrailParticles[0] = platino.createParticles({image:'RainbowTrail_100.lap'});
			sourceTrailParticles[1] = platino.createParticles({image:'RainbowTrail_200.lap'});
			sourceTrailParticles[2] = platino.createParticles({image:'RainbowTrail_300.lap'});
			sourceTrailParticles[3] = platino.createParticles({image:'RainbowTrail_400.lap'});
			sourceTrailParticles[4] = platino.createParticles({image:'RainbowTrail_500.lap'});
			currentSourceTrailParticle = null; // don't show anything at 0 velocity

			listenerTrailParticles[0] = platino.createParticles({image:'ListenerTrail_100.lap'});
			listenerTrailParticles[1] = platino.createParticles({image:'ListenerTrail_200.lap'});
			listenerTrailParticles[2] = platino.createParticles({image:'ListenerTrail_300.lap'});
			listenerTrailParticles[3] = platino.createParticles({image:'ListenerTrail_400.lap'});
			listenerTrailParticles[4] = platino.createParticles({image:'ListenerTrail_500.lap'});
			currentListenerTrailParticle = null; // don't show anything at 0 velocity

			// http://openclipart.org/detail/2219/head-set-by-machovka
			audioListener = platino.createSprite(
            {
				image:'Machovka_head_set.png',
				width:100,
				height:100,
				x:400,
				y:400
			});
            game.setupSpriteSize(audioListener);

			audioListener.color(1.0, 1.0, 1.0);
			audioListener.name = 'audioListener';

			// Initialize all the particles by adding them to the scene, but then hiding them.
			for(current_particle_index=0; current_particle_index<5; current_particle_index++)
			{
				scene.add(sourceTrailParticles[current_particle_index]);
				HideParticle(sourceTrailParticles[current_particle_index]);
			}
			for(current_particle_index=0; current_particle_index<5; current_particle_index++)
			{
				scene.add(listenerTrailParticles[current_particle_index]);
				HideParticle(listenerTrailParticles[current_particle_index]);
			}

			// Set the initial audio positions to the starting sprite positions.
			// Note: Remember that OpenAL coordinates follow Cartesian coordinates which you find in your math books, OpenGL, physics libraries.
			// Titanium views are upside-down compared to everything else. So we should invert our y-coordinates.
			// (Not that we will be able to hear the difference in this example since nobody has speakers above and below their heads.)
			// In ApplicationWindow.js, we implied we were working in a game virtual space of 1024x768, where our height is 768.
			ALmixer.alSource3f(alSourceID, ALmixer.AL_POSITION, audioSource.center.x, game.TARGET_SCREEN.height - audioSource.center.y, 0);
			ALmixer.alListener3f(ALmixer.AL_POSITION, audioListener.center.x, game.TARGET_SCREEN.height - audioListener.center.y, 0);
			
			
			scene.add(audioListener);
			scene.add(audioSource);
			audioSource.animate(1, 6, 1000, -1);


			// add touch events to sprites
			audioSource.addEventListener('touchstart', onAudioSourceTouchStart);
			audioSource.addEventListener('touchmove', onAudioSourceTouchMove);
			audioSource.addEventListener('touchend', onAudioSourceTouchEnd);
			audioListener.addEventListener('touchstart', onAudioListenerTouchStart);
			audioListener.addEventListener('touchmove', onAudioListenerTouchMove);
            audioListener.addEventListener('touchend', onAudioListenerTouchEnd);

			// add sprites to the 'touchable' array
			touchableObjectsArray.push(audioSource);
			touchableObjectsArray.push(audioListener);

			// add touch event listener to the screen (which is responsible for redistributing touches to individual sprites)
			game.addEventListener('touchstart', onScreenTouchStart);
			game.addEventListener('touchmove', onScreenTouchMove);
			game.addEventListener('touchend', onScreenTouchEnd);

			ALmixer.PlaySource(alSourceID, soundEffectHandle, -1);
		};

		var onSceneDeactivated = function(e)
		{

			// ---- remove sprites, listeners, etc. ----

			Ti.API.info("MainScene has been deactivated.");

			game.removeEventListener('touchstart', onScreenTouchStart);
			game.removeEventListener('touchmove', onScreenTouchMoved);
			game.removeEventListener('touchend', onScreenTouchEnd);

			if(audioSource)
			{
				scene.remove(audioSource);
				audioSource.removeEventListener('touchstart', onAudioSourceTouchStart);
				audioSource.removeEventListener('touchmove', onAudioSourceTouchMove);
				audioSource.removeEventListener('touchend', onAudioSourceTouchEnd);
				audioSource = null;
			}

			if(audioListener)
			{
				scene.remove(audioListener);
				audioListener.removeEventListener('touchstart', onAudioListenerTouchStart);
				audioListener.removeEventListener('touchmove', onAudioListenerTouchMove)
				audioListener.removeEventListener('touchend', onAudioListenerTouchEnd);
				audioListener = null
			}



			touchableObjectsArray = null;
			currentlyTouchedObjectsArray = null;


			scene.dispose();
		};

		scene.addEventListener('activated', onSceneActivated);
		scene.addEventListener('deactivated', onSceneDeactivated);
		
			
		var source_velocity_slider = Titanium.UI.createSlider({
			min:0,
			max:1.0,
			value:0.0,
			width:'80%',
			height:'auto',
			top:0,
			text:"Source Velocity"
		});
		source_velocity_slider.addEventListener('change', function(e)
		{
			// Avoids app initialization problem where this function is called before the audioSource is creates.
			if(!audioSource)
			{
				return;
			}
			var which_particle = null;
			var current_particle_index = 0;
			if(e.value <= 1.0/10.0)
			{
				// don't show the emitter
			}
			else if(e.value <= 3.0/10.0)
			{
				// warp 100
				which_particle = sourceTrailParticles[0];
			}
			else if(e.value <= 5.0/10.0)
			{
				// warp 200
				which_particle = sourceTrailParticles[1];
			}
				else if(e.value <= 7.0/10.0)
			{
				// warp 300
				which_particle = sourceTrailParticles[2];
			}
			else if(e.value <= 9.0/10.0)
			{
				// warp 400
				which_particle = sourceTrailParticles[3];
			}
			else
			{
				// warp 500
				which_particle = sourceTrailParticles[4];
			}

			if(which_particle !== currentSourceTrailParticle)
			{
                // Loop through all our particles and hide all of them except for the one that needs to be shown.
                // Also update the position of the shown particle.
				for(current_particle_index=0; current_particle_index<5; current_particle_index++)
				{
					if(which_particle === sourceTrailParticles[current_particle_index])
					{
						ShowParticle(sourceTrailParticles[current_particle_index], audioSource.center.x, audioSource.center.y);
					}
					else
					{
						HideParticle(sourceTrailParticles[current_particle_index]);
					}
				}

                // Save the selected particle as the one we are now showing.
				currentSourceTrailParticle = which_particle;
			}

			// slider ranges are 0 to 1. We want to scale up the values so we can actually hear a difference 
			// since OpenAL speed of sound is 343.3 m/s.
			var source_velocity = e.value * 100;
			ALmixer.alSource3f(alSourceID, ALmixer.AL_VELOCITY, source_velocity, 0, 0);

			// Let's make Pop Tart cat animate faster or slower based on the velocity.
			// animate takes the number of milliseconds between frames, so larger numbers mean animate slower.
			// This might seem a little confusing if you are used to thinking larger numbers mean faster.
			// But the math equation still works for the following if the "larger" (slower) number is the "min" and the smaller number is the "max".
			// Let's say 250 is the slowest at 0.0 (min)
			// 1 is the fastest at 1.0 (max)
			// normalized_value = (raw_value - min) / (max-min)
			// Our slider is the normalized value because it always returns 0 to 1.
			// So we want to solve for the raw_value.
			// raw_value = normalized_value * (max-min) + min
			var max_range_fastest = 1;
			var min_range_slowest = 250;
			var raw_value = e.value * (max_range_fastest - min_range_slowest) + min_range_slowest;
//			Ti.API.info('raw_value: ' + raw_value);
			audioSource.animate(1, 6, raw_value, -1);
			

		});
		window.add(source_velocity_slider);

		var listener_velocity_slider = Titanium.UI.createSlider({
			min:0,
			max:1.0,
			value:0.0,
			width:'80%',
			height:'auto',
			bottom:0,
			text:"Listener Velocity"
			//   leftTrackImage:'../images/slider_orangebar.png',
			//   rightTrackImage:'../images/slider_lightbar.png',
			//   thumbImage:'../images/slider_thumb.png'
		});
		listener_velocity_slider.addEventListener('change',function(e)
		{
			var which_particle = null;
			var current_particle_index = 0;
			// Based on the range of the slider, pick a different particle effect for looks
			// since we only have a finite set of precanned particles I made.
			if(e.value <= 1.0/10.0)
			{
				// don't show the emitter
			}
			else if(e.value <= 3.0/10.0)
			{
				// warp 100
				which_particle = listenerTrailParticles[0];
			}
			else if(e.value <= 5.0/10.0)
			{
				// warp 200
				which_particle = listenerTrailParticles[1];
			}
				else if(e.value <= 7.0/10.0)
			{
				// warp 300
				which_particle = listenerTrailParticles[2];
			}
			else if(e.value <= 9.0/10.0)
			{
				// warp 400
				which_particle = listenerTrailParticles[3];
			}
			else
			{
				// warp 500
				which_particle = listenerTrailParticles[4];
			}

			if(which_particle !== currentListenerTrailParticle)
			{
                // Loop through all our particles and hide all of them except for the one that needs to be shown.
                // Also update the position of the shown particle.
				for(current_particle_index=0; current_particle_index<5; current_particle_index++)
				{
					if(which_particle === listenerTrailParticles[current_particle_index])
					{
						ShowParticle(listenerTrailParticles[current_particle_index], audioListener.center.x, audioListener.center.y);
					}
					else
					{
						HideParticle(listenerTrailParticles[current_particle_index]);

					}
				}
				
                // Save the selected particle as the one we are now showing.
				currentListenerTrailParticle = which_particle;
			}

			// slider ranges are 0 to 1. We want to scale up the values so we can actually hear a difference 
			// since OpenAL speed of sound is 343.3 m/s.
			// Make negative because the listener flys to the left (negative direction)
			var listener_velocity = e.value * -100;
			ALmixer.alListener3f(ALmixer.AL_VELOCITY, listener_velocity, 0, 0);

		});
		window.add(listener_velocity_slider);


		return scene;
	};

	module.exports = MainScene;
}).call(this);
