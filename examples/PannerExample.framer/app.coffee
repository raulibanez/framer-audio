AudioAPI = require "AudioAPI"

# Key properties below are panner (true) and maxDistance (300)
audio = new AudioAPI
	url: "https://s3-eu-west-1.amazonaws.com/freesounds/anothertune.wav"
	autoplay: true
	looping: true
	panner: true
	maxDistance: 300

# Initial panner position. Default is (0, 0, 0)
audio.setPannerPosition(speaker.midX, speaker.midY, 0)

# Listener (mic) position. Listener will affect to all audio objects
audio.setListenerPosition(mic.midX, mic.midY, 0)

# Move tracking
speaker.onMove ->
	audio.setPannerPosition(speaker.midX, speaker.midY, 0)
	
# Speaker Glowing Effect
glow = ->
	speaker.shadowColor = speaker.backgroundColor
	speaker.shadowSpread = 0
	speaker.animate
		shadowSpread: 10
		shadowColor: "rgba(0,0,0,0)"
speaker.onAnimationEnd ->
	glow()
glow()

# Speaker Draggable Config
speaker.draggable = true
speaker.draggable.momentum = false
