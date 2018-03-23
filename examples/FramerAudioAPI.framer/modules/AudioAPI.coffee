class AudioChain extends Framer.BaseClass

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

		@options.autoplay ?= true
		@options.loop ?= false
		@options.name ?= ""
		@options.panner ?= false
		@options.pan ?= 0
		@options.speed ?= 1
		@options.url ?= ""
		@options.volume ?= 1

		@api = @options.api

		# Load URL into buffer
		@load()

	# Setup nodes to build chain
	connect: ->

		@gainNode = @api.context.createGain();

		@pannerNode = @api.context.createPanner();

		@source.connect(@gainNode)

		@pannerNode.connect(@gainNode)

		@gainNode.connect(@api.context.destination)

		# Properties
		@source.playbackRate.value = @options.speed
		@gainNode.gain.value = @options.volume
		@source.loop=@loop

	load: ->

		if @api.buffers[@options.url] is undefined

			@loading = true

			@source = @api.context.createBufferSource()
			@request = new XMLHttpRequest()

			@request.open("GET", @url, true)

			@request.responseType = "arraybuffer"

			@request.onload = =>
				@api.context.decodeAudioData(@request.response,((buffer) =>

					#  Actual data stream
					@source.buffer = buffer

					# Adding the buffer to the API for later reuse
					@api.addBuffer(@options.url, @source.buffer)

					# Setup chain
					@connect()

					if @autoplay is true
						@play()
					)
				,((e) -> print "Error with decoding audio data" + e.err))

# 			@request.onreadystatechange = =>
# 				print XMLHttpRequest.DONE
# 				print @request.status

			@request.addEventListener 'loadend' , (event) =>
				@loaded = true
				@loading = false
				@emit "LoadEnd", @source

			@request.send()

		else

			@source = @api.context.createBufferSource()
			@source.buffer = @api.buffers[@options.url]
			@connect()
			if @autoplay is true
				@play()

	play: (time, offset, duration) =>

		if @loading == true

			print "Error: can't play until source is loaded"

			return this

		if @paused is true

			@options.autoplay = false
			chain = new AudioChain (@options)
			chain.play(@api.context.currentTime, @playedOffset+(@pausedWhen-@playedWhen), @playedDuration-(@pausedWhen-@playedWhen))

			return chain

		else

			time ?= @api.context.currentTime
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
				# A new AudioChain has to be created

				# We force autoplay
				@options.autoplay = true

				# New Chain with the same options
				chain = new AudioChain (@options)

				# Return the object so it can treated in the program
				return chain

	stop: (time) =>

		time ?= 0

		if @played is true and @stopped is false

			@stopped = true

			@source.stop(time)

	clone: =>

		# New Chain with the same options
		chain = new AudioChain (@options)

		# Return the object so it can treated in the program
		return chain

	fadeTo: (chain, time, offset, duration) =>

		# Defaults for the sound to be faded to
		time ?= 0
		offset ?= 0
		duration ?= chain.source.duration

		# Fade
		@gainNode.gain.setValueAtTime(@volume, @api.context.currentTime);
		@gainNode.gain.linearRampToValueAtTime(0, @api.context.currentTime+3);
		@stop(@api.context.currentTime+3)
		# We capture the object back for those cases the clip has to be "reloaded"
		chain = chain.play(time, offset, duration)
		chain.gainNode.gain.setValueAtTime(0, @api.context.currentTime);
		chain.gainNode.gain.linearRampToValueAtTime(chain.volume, @api.context.currentTime+3);

		return chain

	pause: =>

		if @paused is false

			@stop()
			@paused=true
			@pausedWhen=@api.context.currentTime

	fadeOut: (time, duration) ->

		time ?= @api.context.currentTime
		duration ?= 3

		@gainNode.gain.setValueAtTime(@volume, time);
		@gainNode.gain.linearRampToValueAtTime(0, time+duration);
		@stop(time+duration)

	fadeIn: (time, duration) ->

		time ?= @api.context.currentTime
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

	@define 'loop',
		get: ->
			@options.loop
		set: (value) ->
			@options.loop = value

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


class AudioAPI extends Framer.BaseClass

	context: undefined

	buffers: []

	chains: []

	constructor: (@options={}) ->

		super @options

		# Context creation
		@context = new (window.AudioContext || window.webkitAudioContext)();

	@define 'volume',
		get: ->
			@options.volume
		set: (value) ->
			@options.volume = value

	@define 'currentTime',
		get: ->
			@context.currentTime

	addBuffer: (url, buffer, chain) =>

		@buffers[url] = buffer

	play: (options={}) ->

		# We include self (this) to be used withing AudioChain
		options.api = this

		# Every time we call "play" a new chain has to be added
		chain = new AudioChain (options)

	load: (options={}) ->

		# Disabling autostart
		options.autoplay = false

		# We include self (this) to be used withing AudioChain
		options.api = this

		# AudioChain will contain the clip
		chain = new AudioChain (options)

		return chain

	stop: ->

		for chain in @chains

			chain.stop()

		@chains = []

module.exports = AudioAPI
