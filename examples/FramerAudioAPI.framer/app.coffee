AudioAPI = require "AudioAPI"

audio = new AudioAPI

clipA = audio.load
	name: "ClipA"
	url: "https://s3-eu-west-1.amazonaws.com/freesounds/feelagain.mp3"
	
clipB = audio.load
	name: "ClipB"
	url: "https://s3-eu-west-1.amazonaws.com/freesounds/where.mp3"

currentClip = clipA

clips = []

play.onTap ->
	currentClip = clipA.play()
	clips.push currentClip
	
advance.onTap ->
	if currentClip.name == "ClipA"
		currentClip = currentClip.fadeTo(clipB)
	else
		currentClip = currentClip.fadeTo(clipA)
	clips.push currentClip
	
clone.onTap ->
	clipC = clipA.clone()
	clipC.play()
	clips.push clipC
	
stopAll.onTap ->
	for clip in clips
		clip.stop()
		
slider = new SliderComponent
	x: Align.center
	y: 50
	min: -2
	max: 4
	value: 1
	
slider.on Events.SliderValueChange, ->
	currentClip.speed=slider.value
	print slider.value
	
pause.onTap ->
	currentClip.pause()
	
fadeOut.onTap ->
	currentClip = currentClip.fadeOut()
	
fadeIn.onTap ->
	currentClip = currentClip.fadeIn()
	clips.push currentClip
	

# Events
clipA.onLoadEnd ->
	print "#{clipA.name} loaded."
	
clipA.onPlaybackEnd ->
	print "#{clipA.name} ended."
	
clipB.onLoadEnd ->
	print "#{clipB.name} loaded."
	
clipB.onPlaybackEnd ->
	print "#{clipB.name} ended."
