This example demonstrates OpenAL positional effects. 

It demonstrates the use of position on the noise maker (OpenAL source) depicted as bubbles, and the listener (depicted by the headphones).
You may touch and drag both around to hear how the sound shifts between the left and right speakers depending where the bubbles are relative to the listener.
(For best results, use headphones to hear the stereo separation.)

Distance attenuation is also demonstrated. Notice how the volume increases and decreases as you move the objects closer and farther away from each other.


It also demonstrates the use of velocity and the Doppler effect. 
When sound travels towards the listener, the sound plays at a higher pitch. 
When sound travels away from the listener, the sound plays at a lower pitch. 
The magnitude of the velocity of each object will dictate how much the pitch shifts.
The top slider bar controls the velocity of the source.
The bottom slider bar controls the velocity of the listener.
Particle effects are used to visually represent the velocity (magnitude and velocity) of each object.

This example also demonstrates touch APIs to drag the bubbles and headset, particle effects, and native UI sliders. 
The particles were made in Animo Particles and the original asset files are included with the project.


=======
Issues:
=======
Particle effects are still documented as "experimental" on Android. In this example, they work, but the huge number of particles being used cause Dalvik's garbage collector to go crazy, negatively impacting performance.



===========
Easter Egg:
===========

After you do the normal:
git clone git@github.com:ewmailing/ALmixerOpenALPositionTiJS.git
cd ALmixerOpenALPositionTiJS
git pull origin fancyaudio
git checkout fancyaudio

Do:
git pull origin NyanCat
git checkout NyanCat

Re-run to see a fun, modified example.

