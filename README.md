# Framer Web Audio API Module
This module provides better audio support for your Framer projects. It uses [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) instead the default [HTML5 Audio element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio). If you need **accurate timing** for your audio, **gapless loops** or **beautifull fades**, this is your module! Future additions will allow you to use 3D panner, waveforms and more. 

## Example
#### 1. [Framer API Audio Example](https://framer.cloud/VVtVs)
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

audio = new AudioAPI

clip = audio.load
	name: "ClipFeel"
	url: "https://s3-eu-west-1.amazonaws.com/freesounds/feelagain.mp3"
 
 clip.onPlaybackEnd ->
	clip.play()
```
