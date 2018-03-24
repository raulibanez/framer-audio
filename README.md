# Framer Web Audio API Module
This module provides better audio support for your Framer projects. It uses [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) instead the default [HTML5 Audio element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio). If you need **accurate timing** for your audio, **gapless loops** or **beautifull fades**, this is your module! Future additions will allow you to use 3D panner, waveforms and more. 

## Example
#### 1. [Framer API Audio Example](https://framer.cloud/MweHh)
A sample project with a bit of everything.

![Example Preview](https://raw.githubusercontent.com/raulibanez/framer-audio/master/example.png)

## Including the Module
To use this module, get the AudioAPI.coffee file from within the `/module` folder and place it within the `/modules` folder of your prototype. 

```javascript
AudioAPI = require "AudioAPI"
```

## Getting Started

This would be a very basic example. Remember that the clip must be loaded before it's played

```javascript
AudioAPI = require "AudioAPI"

clip = new AudioAPI
	name: "ClipFeel"
	url: "https://s3-eu-west-1.amazonaws.com/freesounds/feelagain.mp3"
 
clip.onLoadEnd ->
	clip.play()
```

## Known Problems

#### 'TypeError: null is not an object'

You will see this error often but it's not an actual problem. Every time you see it, you just have to **reload (CMD+R)** to eliminate it. This issue is caused by Framer and how it manages the prototype preview. Not a big deal.

![TypeError: null is not an object](https://raw.githubusercontent.com/raulibanez/framer-audio/master/error.png)

#### Sound is not playing

Web applications and hosting providers usually protect their resources (images, sounds, ...) to be used only when the access is requested from the same domain where they are hosted or external approved domains. This is controlled by a mechanism called [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing).

Having said that, there are free CORS proxies which will allow you to avoid this security mechanism. These proxies usually have limitations (like 2MB maxsize limit). Please find below an example of how I use a CORS proxy (you have to add the URL string before the actual URL with the sound clip).

```
clip = audio.load
	name: "ClipFeel"
	url: "https://cors-anywhere.herokuapp.com/www.orangefreesounds.com/wp-content/uploads/2018/03/Meditation-bell-sound.mp3?_=1"
```
