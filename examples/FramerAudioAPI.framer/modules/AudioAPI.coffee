AudioContext = new (window.AudioContext || window.webkitAudioContext)();

ObjectList = []

BufferList = []

class AudioAPI extends Framer.BaseClass

	api: undefined

	source: undefined

	gainNode: undefined

	pannerNode: undefined

	request: undefined

	ended: false

	loaded: false

	loading: false

	played: false

	playedWhen: 0

	playedOffset: 0

	playedDuration: 0

	paused: false

	pausedWhen: 0

	stopped: false

	constructor: (@options={}) ->

		@options.autoplay ?= false
		@options.looping ?= false
		@options.name ?= ""
		@options.panner ?= false
		@options.maxDistance ?= 1000
		@options.speed ?= 1
		@options.url ?= ""
		@options.volume ?= 1

		super @options

		# Node creation
		@source = AudioContext.createBufferSource()
		@gainNode = AudioContext.createGain();
		if @panner is true
			@pannerNode = AudioContext.createPanner()
			@setPannerProperties()

		# Load URL into buffer
		@load()

		# Add this to the ObjectList arrayNext
		ObjectList.push @

	# Panner Default properties
	setPannerProperties: ->

		# Panner default properties
		@pannerNode.panningModel = 'HRTF'
		@pannerNode.distanceModel = 'linear'
		@pannerNode.refDistance = 1
		@pannerNode.maxDistance = @options.maxDistance
		@pannerNode.rolloffFactor = 1
		@pannerNode.coneInnerAngle = 360
		@pannerNode.coneOuterAngle = 0
		@pannerNode.coneOuterGain = 0

		# Panner default location (0, 0, 0)
		@pannerNode.setPosition(0, 0, 0)
		@pannerNode.setOrientation(0, 0, 0)

		# Listener default location (0, 0, 0)
		AudioContext.listener.setPosition(0, 0, 0)
		AudioContext.listener.setOrientation(0, 1, 0, 0, 0, 1)

	# Panner position
	setPannerPosition: (xPos, yPos, zPos) =>

		@pannerNode.setPosition(xPos, yPos, zPos)

	# Listener position
	setListenerPosition: (xPos, yPos, zPos) =>

		AudioContext.listener.setPosition(xPos, yPos, zPos)

	# Setup nodes to build chain
	connect: ->

		if @panner is false

			@source.connect(@gainNode)

			@gainNode.connect(AudioContext.destination)

		else

			@source.connect(@pannerNode)

			@pannerNode.connect(@gainNode)

			@gainNode.connect(AudioContext.destination)

		# Properties
		@source.playbackRate.value = @options.speed
		@gainNode.gain.value = @options.volume
		@source.loop=@looping

	load: =>

		if BufferList[@options.url] is undefined

			@loading = true

			@request = new XMLHttpRequest()

			@request.open("GET", @url, true)

			@request.responseType = "arraybuffer"

			@request.onload = =>
				AudioContext.decodeAudioData(@request.response,((buffer) =>

					#  Actual data stream
					@source.buffer = buffer

					# We keep the buffers in an array for reuse
					BufferList[@options.url] = @source.buffer

					# Setup chain
					@connect()

					# Flag control
					@loaded = true
					@loading = false
					@emit "LoadEnd", @source

					# Autoplay control
					if @autoplay is true
						@play()
					)
				,((e) -> print "Error with decoding audio data" + e.err))

	# 			@request.onreadystatechange = =>
	# 				print XMLHttpRequest.DONE
	# 				print @request.status

			@request.send()

		else

			@source.buffer = BufferList[@options.url]
			@connect()
			if @autoplay is true
				@play()

	play: (time, offset, duration) =>

		if @loading == true

			print "Error: can't play until source is loaded"

			return this

		if @paused is true

			@options.autoplay = false
			chain = new AudioAPI (@options)
			chain.play(AudioContext.currentTime, @playedOffset+(@pausedWhen-@playedWhen), @playedDuration-(@pausedWhen-@playedWhen))

			return chain

		else

			time ?= AudioContext.currentTime
			offset ?= 0
			duration ?= @source.buffer.duration

			# We keep these values to be able to resume audio
			[ @playedWhen, @playedOffset, @playedDuration ] = [ time, offset, duration ]

			if @played is false

				@played = true

				@source.addEventListener 'ended' , (event) =>
					@ended = true
					@emit "PlaybackEnd", @source

				@source.start(time, offset, duration)

				return this

			else

				# An audio source can only be played once
				# A new AudioAPI has to be created

				# We disable autoplay
				@options.autoplay = false

				# New AudioAPI with the same options
				chain = new AudioAPI (@options)

				# Start audio
				chain.play(time, offset, duration)

				# Return the object so it can treated in the program
				return chain

	stop: (time) =>

		time ?= 0

		if @played is true and @stopped is false

			@stopped = true

			@source.stop(time)

	clone: =>

		# New AudioAPI with the same options
		chain = new AudioAPI (@options)

		# Return the object so it can treated in the program
		return chain

	fadeTo: (chain, time, offset, duration) =>

		# Defaults for the sound to be faded to
		time ?= 0
		offset ?= 0
		duration ?= chain.source.duration

		# Fade
		@gainNode.gain.setValueAtTime(@volume, AudioContext.currentTime);
		@gainNode.gain.linearRampToValueAtTime(0, AudioContext.currentTime+3);
		@stop(AudioContext.currentTime+3)
		# We capture the object back for those cases the clip has to be "reloaded"
		chain = chain.play(time, offset, duration)
		chain.gainNode.gain.setValueAtTime(0, AudioContext.currentTime);
		chain.gainNode.gain.linearRampToValueAtTime(chain.volume, AudioContext.currentTime+3);

		return chain

	pause: =>

		if @paused is false

			@stop()
			@paused=true
			@pausedWhen=AudioContext.currentTime

	fadeOut: (time, duration) ->

		time ?= AudioContext.currentTime
		duration ?= 3

		@gainNode.gain.setValueAtTime(@volume, time);
		@gainNode.gain.linearRampToValueAtTime(0, time+duration);
		@stop(time+duration)

	fadeIn: (time, duration) ->

		time ?= AudioContext.currentTime
		duration ?= 3

		@gainNode.gain.setValueAtTime(0, time);
		@gainNode.gain.linearRampToValueAtTime(@volume, time+duration);
		chain = @play(time)

		return chain

	onLoadEnd: (source) -> @on "LoadEnd", source

	onPlaybackEnd: (source) -> @on "PlaybackEnd", source

	@define 'autoplay',
		get: ->
			@options.autoplay

	@define 'looping',
		get: ->
			@options.looping
		set: (value) ->
			@options.looping = value

			if @source isnt undefined
				@source.loop=@options.looping

	@define 'name',
		get: ->
			@options.name
		set: (value) ->
			@options.name = value

	@define 'panner',
		get: ->
			@options.panner
		set: (value) ->
			@options.panner = value

	@define 'maxDistance',
		get: ->
			@options.maxDistance
		set: (value) ->
			@options.maxDistance = value

			if @pannerNode isnt undefined
				@pannerNode.maxDistance = @options.maxDistance

	@define 'speed',
		get: ->
			@options.speed
		set: (value) ->
			@options.speed = value

			if @source isnt undefined
				@source.playbackRate.value = @options.speed

	@define 'url',
		get: ->
			@options.url

	@define 'volume',
		get: ->
			@options.volume
		set: (value) ->
			@options.volume = value

			if @gainNode isnt undefined
				@gainNode.gain.value = @options.volume

	@define 'currentTime',
		get: ->
			AudioContext.currentTime

	stopAll: ->

		for obj in ObjectList

			obj.stop()

		ObjectList = []

module.exports = AudioAPI
