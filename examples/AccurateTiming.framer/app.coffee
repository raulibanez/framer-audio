# Samples and sequence values by Neil McCallion
# https://codepen.io/njmcode/pen/PwaXwB

AudioAPI = require "AudioAPI"

kick = new AudioAPI
	url: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/101507/kick.wav"
	
snare = new AudioAPI
	url: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/101507/snare.wav"
	
openHat = new AudioAPI
	url: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/101507/openHat.wav"
	
closedHat = new AudioAPI
	url: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/101507/closedHat.wav"
	
tempo = 100

sequence = [
	[openHat,	'0010001000100010'],
	[closedHat,	'1000100010001000'],
	[snare,		'0000100000001000'],
	[kick,		'1000000010100100']]
	
play.onTap ->
	for sample in sequence
		for note, index in sample[1]
			if note is "1"
				sample[0].play(sample[0].currentTime+(index+1)/(tempo/16))

