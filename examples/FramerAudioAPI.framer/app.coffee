AudioAPI = require "AudioAPI"

clipA = new AudioAPI
	name: "ClipA"
	url: "https://s3-eu-west-1.amazonaws.com/freesounds/feelagain.mp3"
	
clipB = new AudioAPI
	name: "ClipB"
	url: "https://s3-eu-west-1.amazonaws.com/freesounds/where.mp3"

currentClip = clipA

play.onTap ->
	currentClip = clipA.play()
	
advance.onTap ->
	if currentClip.name == "ClipA"
		currentClip = currentClip.fadeTo(clipB)
	else
		currentClip = currentClip.fadeTo(clipA)
	
clone.onTap ->
	clipC = clipA.clone()
	clipC.play()
	
stopAll.onTap ->
	clipA.stopAll()
		
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
	
clipB.onLoadEnd ->
	print "#{clipB.name} loaded."
