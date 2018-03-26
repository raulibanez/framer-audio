AudioAPI = require "AudioAPI"

setup = [
	[sourceA, "https://s3-eu-west-1.amazonaws.com/freesounds/drums.wav"],
	[sourceB, "https://s3-eu-west-1.amazonaws.com/freesounds/kick.wav"],
	[sourceC, "https://s3-eu-west-1.amazonaws.com/freesounds/lead.wav"]]
	
samples = []

for item in setup

	do (item) ->

		# Draggable 
		item[0].draggable = true
		item[0].draggable.momentum = false
		
		# onMove
		item[0].onMove ->
			print item[0].name, item[0].midX-(Screen.width/2), (Screen.height/2)-item[0].midY
	
		# Glow
		glow = ->
			item[0].shadowColor = item[0].backgroundColor
			item[0].shadowSpread = 0
			item[0].animate
				shadowSpread: 10
				shadowColor: "rgba(0,0,0,0)"
		item[0].onAnimationEnd ->
			glow()
		glow()
		
		# Audio load
		audio = new AudioAPI
			name: item[0].name
			url: item[1]
			loop: true
			panner: true
		
		# Start all samples at the same time (currentTime+1) once they're ALL loaded
		audio.onLoadEnd ->
			samples.push audio
			if samples.length == 3
				for sample in samples
					sample.play(sample.currentTime+1)
		