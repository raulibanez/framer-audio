require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"AudioAPI":[function(require,module,exports){
var AudioAPI, AudioChain,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AudioChain = (function(superClass) {
  extend(AudioChain, superClass);

  AudioChain.prototype.api = void 0;

  AudioChain.prototype.source = void 0;

  AudioChain.prototype.gainNode = void 0;

  AudioChain.prototype.pannerNode = void 0;

  AudioChain.prototype.request = void 0;

  AudioChain.prototype.ended = false;

  AudioChain.prototype.loaded = false;

  AudioChain.prototype.loading = false;

  AudioChain.prototype.played = false;

  AudioChain.prototype.playedWhen = 0;

  AudioChain.prototype.playedOffset = 0;

  AudioChain.prototype.playedDuration = 0;

  AudioChain.prototype.paused = false;

  AudioChain.prototype.pausedWhen = 0;

  AudioChain.prototype.stopped = false;

  function AudioChain(options1) {
    var base, base1, base2, base3, base4, base5, base6, base7;
    this.options = options1 != null ? options1 : {};
    this.pause = bind(this.pause, this);
    this.fadeTo = bind(this.fadeTo, this);
    this.clone = bind(this.clone, this);
    this.stop = bind(this.stop, this);
    this.play = bind(this.play, this);
    if ((base = this.options).autoplay == null) {
      base.autoplay = true;
    }
    if ((base1 = this.options).loop == null) {
      base1.loop = false;
    }
    if ((base2 = this.options).name == null) {
      base2.name = "";
    }
    if ((base3 = this.options).panner == null) {
      base3.panner = false;
    }
    if ((base4 = this.options).pan == null) {
      base4.pan = 0;
    }
    if ((base5 = this.options).speed == null) {
      base5.speed = 1;
    }
    if ((base6 = this.options).url == null) {
      base6.url = "";
    }
    if ((base7 = this.options).volume == null) {
      base7.volume = 1;
    }
    this.api = this.options.api;
    this.load();
  }

  AudioChain.prototype.connect = function() {
    this.gainNode = this.api.context.createGain();
    this.pannerNode = this.api.context.createPanner();
    this.source.connect(this.gainNode);
    this.pannerNode.connect(this.gainNode);
    this.gainNode.connect(this.api.context.destination);
    this.source.playbackRate.value = this.options.speed;
    this.gainNode.gain.value = this.options.volume;
    return this.source.loop = this.loop;
  };

  AudioChain.prototype.load = function() {
    if (this.api.buffers[this.options.url] === void 0) {
      this.loading = true;
      this.source = this.api.context.createBufferSource();
      this.request = new XMLHttpRequest();
      this.request.open("GET", this.url, true);
      this.request.responseType = "arraybuffer";
      this.request.onload = (function(_this) {
        return function() {
          return _this.api.context.decodeAudioData(_this.request.response, (function(buffer) {
            _this.source.buffer = buffer;
            _this.api.addBuffer(_this.options.url, _this.source.buffer);
            _this.connect();
            if (_this.autoplay === true) {
              return _this.play();
            }
          }), (function(e) {
            return print("Error with decoding audio data" + e.err);
          }));
        };
      })(this);
      this.request.addEventListener('loadend', (function(_this) {
        return function(event) {
          _this.loaded = true;
          _this.loading = false;
          return _this.emit("LoadEnd", _this.source);
        };
      })(this));
      return this.request.send();
    } else {
      this.source = this.api.context.createBufferSource();
      this.source.buffer = this.api.buffers[this.options.url];
      this.connect();
      if (this.autoplay === true) {
        return this.play();
      }
    }
  };

  AudioChain.prototype.play = function(time, offset, duration) {
    var chain, ref;
    if (this.loading === true) {
      print("Error: can't play until source is loaded");
      return this;
    }
    if (this.paused === true) {
      this.options.autoplay = false;
      chain = new AudioChain(this.options);
      chain.play(this.api.context.currentTime, this.playedOffset + (this.pausedWhen - this.playedWhen), this.playedDuration - (this.pausedWhen - this.playedWhen));
      return chain;
    } else {
      if (time == null) {
        time = this.api.context.currentTime;
      }
      if (offset == null) {
        offset = 0;
      }
      if (duration == null) {
        duration = this.source.buffer.duration;
      }
      ref = [time, offset, duration], this.playedWhen = ref[0], this.playedOffset = ref[1], this.playedDuration = ref[2];
      if (this.played === false) {
        this.played = true;
        this.source.addEventListener('ended', (function(_this) {
          return function(event) {
            _this.ended = true;
            return _this.emit("PlaybackEnd", _this.source);
          };
        })(this));
        this.source.start(time, offset, duration);
        return this;
      } else {
        this.options.autoplay = true;
        chain = new AudioChain(this.options);
        return chain;
      }
    }
  };

  AudioChain.prototype.stop = function(time) {
    if (time == null) {
      time = 0;
    }
    if (this.played === true && this.stopped === false) {
      this.stopped = true;
      return this.source.stop(time);
    }
  };

  AudioChain.prototype.clone = function() {
    var chain;
    chain = new AudioChain(this.options);
    return chain;
  };

  AudioChain.prototype.fadeTo = function(chain, time, offset, duration) {
    if (time == null) {
      time = 0;
    }
    if (offset == null) {
      offset = 0;
    }
    if (duration == null) {
      duration = chain.source.duration;
    }
    this.gainNode.gain.setValueAtTime(this.volume, this.api.context.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(0, this.api.context.currentTime + 3);
    this.stop(this.api.context.currentTime + 3);
    chain = chain.play(time, offset, duration);
    chain.gainNode.gain.setValueAtTime(0, this.api.context.currentTime);
    chain.gainNode.gain.linearRampToValueAtTime(chain.volume, this.api.context.currentTime + 3);
    return chain;
  };

  AudioChain.prototype.pause = function() {
    if (this.paused === false) {
      this.stop();
      this.paused = true;
      return this.pausedWhen = this.api.context.currentTime;
    }
  };

  AudioChain.prototype.fadeOut = function(time, duration) {
    if (time == null) {
      time = this.api.context.currentTime;
    }
    if (duration == null) {
      duration = 3;
    }
    this.gainNode.gain.setValueAtTime(this.volume, time);
    this.gainNode.gain.linearRampToValueAtTime(0, time + duration);
    return this.stop(time + duration);
  };

  AudioChain.prototype.fadeIn = function(time, duration) {
    var chain;
    if (time == null) {
      time = this.api.context.currentTime;
    }
    if (duration == null) {
      duration = 3;
    }
    this.gainNode.gain.setValueAtTime(0, time);
    this.gainNode.gain.linearRampToValueAtTime(this.volume, time + duration);
    chain = this.play(time);
    return chain;
  };

  AudioChain.prototype.onLoadEnd = function(source) {
    return this.on("LoadEnd", source);
  };

  AudioChain.prototype.onPlaybackEnd = function(source) {
    return this.on("PlaybackEnd", source);
  };

  AudioChain.define('autoplay', {
    get: function() {
      return this.options.autoplay;
    }
  });

  AudioChain.define('loop', {
    get: function() {
      return this.options.loop;
    },
    set: function(value) {
      return this.options.loop = value;
    }
  });

  AudioChain.define('name', {
    get: function() {
      return this.options.name;
    },
    set: function(value) {
      return this.options.name = value;
    }
  });

  AudioChain.define('panner', {
    get: function() {
      return this.options.panner;
    },
    set: function(value) {
      return this.options.panner = value;
    }
  });

  AudioChain.define('speed', {
    get: function() {
      return this.options.speed;
    },
    set: function(value) {
      this.options.speed = value;
      if (this.source !== void 0) {
        return this.source.playbackRate.value = this.options.speed;
      }
    }
  });

  AudioChain.define('url', {
    get: function() {
      return this.options.url;
    }
  });

  AudioChain.define('volume', {
    get: function() {
      return this.options.volume;
    },
    set: function(value) {
      this.options.volume = value;
      if (this.gainNode !== void 0) {
        return this.gainNode.gain.value = this.options.volume;
      }
    }
  });

  return AudioChain;

})(Framer.BaseClass);

AudioAPI = (function(superClass) {
  extend(AudioAPI, superClass);

  AudioAPI.prototype.context = void 0;

  AudioAPI.prototype.buffers = [];

  AudioAPI.prototype.chains = [];

  function AudioAPI(options1) {
    this.options = options1 != null ? options1 : {};
    this.addBuffer = bind(this.addBuffer, this);
    AudioAPI.__super__.constructor.call(this, this.options);
    this.context = new (window.AudioContext || window.webkitAudioContext)();
  }

  AudioAPI.define('volume', {
    get: function() {
      return this.options.volume;
    },
    set: function(value) {
      return this.options.volume = value;
    }
  });

  AudioAPI.define('currentTime', {
    get: function() {
      return this.context.currentTime;
    }
  });

  AudioAPI.prototype.addBuffer = function(url, buffer, chain) {
    return this.buffers[url] = buffer;
  };

  AudioAPI.prototype.play = function(options) {
    var chain;
    if (options == null) {
      options = {};
    }
    options.api = this;
    return chain = new AudioChain(options);
  };

  AudioAPI.prototype.load = function(options) {
    var chain;
    if (options == null) {
      options = {};
    }
    options.autoplay = false;
    options.api = this;
    chain = new AudioChain(options);
    return chain;
  };

  AudioAPI.prototype.stop = function() {
    var chain, i, len, ref;
    ref = this.chains;
    for (i = 0, len = ref.length; i < len; i++) {
      chain = ref[i];
      chain.stop();
    }
    return this.chains = [];
  };

  return AudioAPI;

})(Framer.BaseClass);

module.exports = AudioAPI;


},{}],"myModule":[function(require,module,exports){
exports.myVar = "myVariable";

exports.myFunction = function() {
  return print("myFunction is running");
};

exports.myArray = [1, 2, 3];


},{}]},{},[])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWVyLm1vZHVsZXMuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1VzZXJzL3JhdWwvR2l0L2ZyYW1lci1hdWRpby9leGFtcGxlcy9GcmFtZXJBdWRpb0FQSS5mcmFtZXIvbW9kdWxlcy9teU1vZHVsZS5jb2ZmZWUiLCIuLi8uLi8uLi8uLi8uLi9Vc2Vycy9yYXVsL0dpdC9mcmFtZXItYXVkaW8vZXhhbXBsZXMvRnJhbWVyQXVkaW9BUEkuZnJhbWVyL21vZHVsZXMvQXVkaW9BUEkuY29mZmVlIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIjIEFkZCB0aGUgZm9sbG93aW5nIGxpbmUgdG8geW91ciBwcm9qZWN0IGluIEZyYW1lciBTdHVkaW8uIFxuIyBteU1vZHVsZSA9IHJlcXVpcmUgXCJteU1vZHVsZVwiXG4jIFJlZmVyZW5jZSB0aGUgY29udGVudHMgYnkgbmFtZSwgbGlrZSBteU1vZHVsZS5teUZ1bmN0aW9uKCkgb3IgbXlNb2R1bGUubXlWYXJcblxuZXhwb3J0cy5teVZhciA9IFwibXlWYXJpYWJsZVwiXG5cbmV4cG9ydHMubXlGdW5jdGlvbiA9IC0+XG5cdHByaW50IFwibXlGdW5jdGlvbiBpcyBydW5uaW5nXCJcblxuZXhwb3J0cy5teUFycmF5ID0gWzEsIDIsIDNdIiwiY2xhc3MgQXVkaW9DaGFpbiBleHRlbmRzIEZyYW1lci5CYXNlQ2xhc3NcblxuXHRhcGk6IHVuZGVmaW5lZFxuXG5cdHNvdXJjZTogdW5kZWZpbmVkXG5cblx0Z2Fpbk5vZGU6IHVuZGVmaW5lZFxuXG5cdHBhbm5lck5vZGU6IHVuZGVmaW5lZFxuXG5cdHJlcXVlc3Q6IHVuZGVmaW5lZFxuXG5cdGVuZGVkOiBmYWxzZVxuXG5cdGxvYWRlZDogZmFsc2VcblxuXHRsb2FkaW5nOiBmYWxzZVxuXG5cdHBsYXllZDogZmFsc2VcblxuXHRwbGF5ZWRXaGVuOiAwXG5cblx0cGxheWVkT2Zmc2V0OiAwXG5cblx0cGxheWVkRHVyYXRpb246IDBcblxuXHRwYXVzZWQ6IGZhbHNlXG5cblx0cGF1c2VkV2hlbjogMFxuXG5cdHN0b3BwZWQ6IGZhbHNlXG5cblxuXHRjb25zdHJ1Y3RvcjogKEBvcHRpb25zPXt9KSAtPlxuXG5cdFx0QG9wdGlvbnMuYXV0b3BsYXkgPz0gdHJ1ZVxuXHRcdEBvcHRpb25zLmxvb3AgPz0gZmFsc2Vcblx0XHRAb3B0aW9ucy5uYW1lID89IFwiXCJcblx0XHRAb3B0aW9ucy5wYW5uZXIgPz0gZmFsc2Vcblx0XHRAb3B0aW9ucy5wYW4gPz0gMFxuXHRcdEBvcHRpb25zLnNwZWVkID89IDFcblx0XHRAb3B0aW9ucy51cmwgPz0gXCJcIlxuXHRcdEBvcHRpb25zLnZvbHVtZSA/PSAxXG5cblx0XHRAYXBpID0gQG9wdGlvbnMuYXBpXG5cblx0XHQjIExvYWQgVVJMIGludG8gYnVmZmVyXG5cdFx0QGxvYWQoKVxuXG5cdCMgU2V0dXAgbm9kZXMgdG8gYnVpbGQgY2hhaW5cblx0Y29ubmVjdDogLT5cblxuXHRcdEBnYWluTm9kZSA9IEBhcGkuY29udGV4dC5jcmVhdGVHYWluKCk7XG5cblx0XHRAcGFubmVyTm9kZSA9IEBhcGkuY29udGV4dC5jcmVhdGVQYW5uZXIoKTtcblxuXHRcdEBzb3VyY2UuY29ubmVjdChAZ2Fpbk5vZGUpXG5cblx0XHRAcGFubmVyTm9kZS5jb25uZWN0KEBnYWluTm9kZSlcblxuXHRcdEBnYWluTm9kZS5jb25uZWN0KEBhcGkuY29udGV4dC5kZXN0aW5hdGlvbilcblxuXHRcdCMgUHJvcGVydGllc1xuXHRcdEBzb3VyY2UucGxheWJhY2tSYXRlLnZhbHVlID0gQG9wdGlvbnMuc3BlZWRcblx0XHRAZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IEBvcHRpb25zLnZvbHVtZVxuXHRcdEBzb3VyY2UubG9vcD1AbG9vcFxuXG5cdGxvYWQ6IC0+XG5cblx0XHRpZiBAYXBpLmJ1ZmZlcnNbQG9wdGlvbnMudXJsXSBpcyB1bmRlZmluZWRcblxuXHRcdFx0QGxvYWRpbmcgPSB0cnVlXG5cblx0XHRcdEBzb3VyY2UgPSBAYXBpLmNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKClcblx0XHRcdEByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblxuXHRcdFx0QHJlcXVlc3Qub3BlbihcIkdFVFwiLCBAdXJsLCB0cnVlKVxuXG5cdFx0XHRAcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBcImFycmF5YnVmZmVyXCJcblxuXHRcdFx0QHJlcXVlc3Qub25sb2FkID0gPT5cblx0XHRcdFx0QGFwaS5jb250ZXh0LmRlY29kZUF1ZGlvRGF0YShAcmVxdWVzdC5yZXNwb25zZSwoKGJ1ZmZlcikgPT5cblxuXHRcdFx0XHRcdCMgIEFjdHVhbCBkYXRhIHN0cmVhbVxuXHRcdFx0XHRcdEBzb3VyY2UuYnVmZmVyID0gYnVmZmVyXG5cblx0XHRcdFx0XHQjIEFkZGluZyB0aGUgYnVmZmVyIHRvIHRoZSBBUEkgZm9yIGxhdGVyIHJldXNlXG5cdFx0XHRcdFx0QGFwaS5hZGRCdWZmZXIoQG9wdGlvbnMudXJsLCBAc291cmNlLmJ1ZmZlcilcblxuXHRcdFx0XHRcdCMgU2V0dXAgY2hhaW5cblx0XHRcdFx0XHRAY29ubmVjdCgpXG5cblx0XHRcdFx0XHRpZiBAYXV0b3BsYXkgaXMgdHJ1ZVxuXHRcdFx0XHRcdFx0QHBsYXkoKVxuXHRcdFx0XHRcdClcblx0XHRcdFx0LCgoZSkgLT4gcHJpbnQgXCJFcnJvciB3aXRoIGRlY29kaW5nIGF1ZGlvIGRhdGFcIiArIGUuZXJyKSlcblxuIyBcdFx0XHRAcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSA9PlxuIyBcdFx0XHRcdHByaW50IFhNTEh0dHBSZXF1ZXN0LkRPTkVcbiMgXHRcdFx0XHRwcmludCBAcmVxdWVzdC5zdGF0dXNcblxuXHRcdFx0QHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lciAnbG9hZGVuZCcgLCAoZXZlbnQpID0+XG5cdFx0XHRcdEBsb2FkZWQgPSB0cnVlXG5cdFx0XHRcdEBsb2FkaW5nID0gZmFsc2Vcblx0XHRcdFx0QGVtaXQgXCJMb2FkRW5kXCIsIEBzb3VyY2VcblxuXHRcdFx0QHJlcXVlc3Quc2VuZCgpXG5cblx0XHRlbHNlXG5cblx0XHRcdEBzb3VyY2UgPSBAYXBpLmNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKClcblx0XHRcdEBzb3VyY2UuYnVmZmVyID0gQGFwaS5idWZmZXJzW0BvcHRpb25zLnVybF1cblx0XHRcdEBjb25uZWN0KClcblx0XHRcdGlmIEBhdXRvcGxheSBpcyB0cnVlXG5cdFx0XHRcdEBwbGF5KClcblxuXHRwbGF5OiAodGltZSwgb2Zmc2V0LCBkdXJhdGlvbikgPT5cblxuXHRcdGlmIEBsb2FkaW5nID09IHRydWVcblxuXHRcdFx0cHJpbnQgXCJFcnJvcjogY2FuJ3QgcGxheSB1bnRpbCBzb3VyY2UgaXMgbG9hZGVkXCJcblxuXHRcdFx0cmV0dXJuIHRoaXNcblxuXHRcdGlmIEBwYXVzZWQgaXMgdHJ1ZVxuXG5cdFx0XHRAb3B0aW9ucy5hdXRvcGxheSA9IGZhbHNlXG5cdFx0XHRjaGFpbiA9IG5ldyBBdWRpb0NoYWluIChAb3B0aW9ucylcblx0XHRcdGNoYWluLnBsYXkoQGFwaS5jb250ZXh0LmN1cnJlbnRUaW1lLCBAcGxheWVkT2Zmc2V0KyhAcGF1c2VkV2hlbi1AcGxheWVkV2hlbiksIEBwbGF5ZWREdXJhdGlvbi0oQHBhdXNlZFdoZW4tQHBsYXllZFdoZW4pKVxuXG5cdFx0XHRyZXR1cm4gY2hhaW5cblxuXHRcdGVsc2VcblxuXHRcdFx0dGltZSA/PSBAYXBpLmNvbnRleHQuY3VycmVudFRpbWVcblx0XHRcdG9mZnNldCA/PSAwXG5cdFx0XHRkdXJhdGlvbiA/PSBAc291cmNlLmJ1ZmZlci5kdXJhdGlvblxuXG5cdFx0XHQjIFdlIGtlZXAgdGhlc2UgdmFsdWVzIHRvIGJlIGFibGUgdG8gcmVzdW1lIGF1ZGlvXG5cdFx0XHRbIEBwbGF5ZWRXaGVuLCBAcGxheWVkT2Zmc2V0LCBAcGxheWVkRHVyYXRpb24gXSA9IFsgdGltZSwgb2Zmc2V0LCBkdXJhdGlvbiBdXG5cblx0XHRcdGlmIEBwbGF5ZWQgaXMgZmFsc2VcblxuXHRcdFx0XHRAcGxheWVkID0gdHJ1ZVxuXG5cdFx0XHRcdEBzb3VyY2UuYWRkRXZlbnRMaXN0ZW5lciAnZW5kZWQnICwgKGV2ZW50KSA9PlxuXHRcdFx0XHRcdEBlbmRlZCA9IHRydWVcblx0XHRcdFx0XHRAZW1pdCBcIlBsYXliYWNrRW5kXCIsIEBzb3VyY2VcblxuXHRcdFx0XHRAc291cmNlLnN0YXJ0KHRpbWUsIG9mZnNldCwgZHVyYXRpb24pXG5cblx0XHRcdFx0cmV0dXJuIHRoaXNcblxuXHRcdFx0ZWxzZVxuXG5cdFx0XHRcdCMgQW4gYXVkaW8gc291cmNlIGNhbiBvbmx5IGJlIHBsYXllZCBvbmNlXG5cdFx0XHRcdCMgQSBuZXcgQXVkaW9DaGFpbiBoYXMgdG8gYmUgY3JlYXRlZFxuXG5cdFx0XHRcdCMgV2UgZm9yY2UgYXV0b3BsYXlcblx0XHRcdFx0QG9wdGlvbnMuYXV0b3BsYXkgPSB0cnVlXG5cblx0XHRcdFx0IyBOZXcgQ2hhaW4gd2l0aCB0aGUgc2FtZSBvcHRpb25zXG5cdFx0XHRcdGNoYWluID0gbmV3IEF1ZGlvQ2hhaW4gKEBvcHRpb25zKVxuXG5cdFx0XHRcdCMgUmV0dXJuIHRoZSBvYmplY3Qgc28gaXQgY2FuIHRyZWF0ZWQgaW4gdGhlIHByb2dyYW1cblx0XHRcdFx0cmV0dXJuIGNoYWluXG5cblx0c3RvcDogKHRpbWUpID0+XG5cblx0XHR0aW1lID89IDBcblxuXHRcdGlmIEBwbGF5ZWQgaXMgdHJ1ZSBhbmQgQHN0b3BwZWQgaXMgZmFsc2VcblxuXHRcdFx0QHN0b3BwZWQgPSB0cnVlXG5cblx0XHRcdEBzb3VyY2Uuc3RvcCh0aW1lKVxuXG5cdGNsb25lOiA9PlxuXG5cdFx0IyBOZXcgQ2hhaW4gd2l0aCB0aGUgc2FtZSBvcHRpb25zXG5cdFx0Y2hhaW4gPSBuZXcgQXVkaW9DaGFpbiAoQG9wdGlvbnMpXG5cblx0XHQjIFJldHVybiB0aGUgb2JqZWN0IHNvIGl0IGNhbiB0cmVhdGVkIGluIHRoZSBwcm9ncmFtXG5cdFx0cmV0dXJuIGNoYWluXG5cblx0ZmFkZVRvOiAoY2hhaW4sIHRpbWUsIG9mZnNldCwgZHVyYXRpb24pID0+XG5cblx0XHQjIERlZmF1bHRzIGZvciB0aGUgc291bmQgdG8gYmUgZmFkZWQgdG9cblx0XHR0aW1lID89IDBcblx0XHRvZmZzZXQgPz0gMFxuXHRcdGR1cmF0aW9uID89IGNoYWluLnNvdXJjZS5kdXJhdGlvblxuXG5cdFx0IyBGYWRlXG5cdFx0QGdhaW5Ob2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUoQHZvbHVtZSwgQGFwaS5jb250ZXh0LmN1cnJlbnRUaW1lKTtcblx0XHRAZ2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBAYXBpLmNvbnRleHQuY3VycmVudFRpbWUrMyk7XG5cdFx0QHN0b3AoQGFwaS5jb250ZXh0LmN1cnJlbnRUaW1lKzMpXG5cdFx0IyBXZSBjYXB0dXJlIHRoZSBvYmplY3QgYmFjayBmb3IgdGhvc2UgY2FzZXMgdGhlIGNsaXAgaGFzIHRvIGJlIFwicmVsb2FkZWRcIlxuXHRcdGNoYWluID0gY2hhaW4ucGxheSh0aW1lLCBvZmZzZXQsIGR1cmF0aW9uKVxuXHRcdGNoYWluLmdhaW5Ob2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgQGFwaS5jb250ZXh0LmN1cnJlbnRUaW1lKTtcblx0XHRjaGFpbi5nYWluTm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKGNoYWluLnZvbHVtZSwgQGFwaS5jb250ZXh0LmN1cnJlbnRUaW1lKzMpO1xuXG5cdFx0cmV0dXJuIGNoYWluXG5cblx0cGF1c2U6ID0+XG5cblx0XHRpZiBAcGF1c2VkIGlzIGZhbHNlXG5cblx0XHRcdEBzdG9wKClcblx0XHRcdEBwYXVzZWQ9dHJ1ZVxuXHRcdFx0QHBhdXNlZFdoZW49QGFwaS5jb250ZXh0LmN1cnJlbnRUaW1lXG5cblx0ZmFkZU91dDogKHRpbWUsIGR1cmF0aW9uKSAtPlxuXG5cdFx0dGltZSA/PSBAYXBpLmNvbnRleHQuY3VycmVudFRpbWVcblx0XHRkdXJhdGlvbiA/PSAzXG5cblx0XHRAZ2Fpbk5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZShAdm9sdW1lLCB0aW1lKTtcblx0XHRAZ2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCB0aW1lK2R1cmF0aW9uKTtcblx0XHRAc3RvcCh0aW1lK2R1cmF0aW9uKVxuXG5cdGZhZGVJbjogKHRpbWUsIGR1cmF0aW9uKSAtPlxuXG5cdFx0dGltZSA/PSBAYXBpLmNvbnRleHQuY3VycmVudFRpbWVcblx0XHRkdXJhdGlvbiA/PSAzXG5cblx0XHRAZ2Fpbk5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0aW1lKTtcblx0XHRAZ2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShAdm9sdW1lLCB0aW1lK2R1cmF0aW9uKTtcblx0XHRjaGFpbiA9IEBwbGF5KHRpbWUpXG5cblx0XHRyZXR1cm4gY2hhaW5cblxuXHRvbkxvYWRFbmQ6IChzb3VyY2UpIC0+IEBvbiBcIkxvYWRFbmRcIiwgc291cmNlXG5cblx0b25QbGF5YmFja0VuZDogKHNvdXJjZSkgLT4gQG9uIFwiUGxheWJhY2tFbmRcIiwgc291cmNlXG5cblx0QGRlZmluZSAnYXV0b3BsYXknLFxuXHRcdGdldDogLT5cblx0XHRcdEBvcHRpb25zLmF1dG9wbGF5XG5cblx0QGRlZmluZSAnbG9vcCcsXG5cdFx0Z2V0OiAtPlxuXHRcdFx0QG9wdGlvbnMubG9vcFxuXHRcdHNldDogKHZhbHVlKSAtPlxuXHRcdFx0QG9wdGlvbnMubG9vcCA9IHZhbHVlXG5cblx0QGRlZmluZSAnbmFtZScsXG5cdFx0Z2V0OiAtPlxuXHRcdFx0QG9wdGlvbnMubmFtZVxuXHRcdHNldDogKHZhbHVlKSAtPlxuXHRcdFx0QG9wdGlvbnMubmFtZSA9IHZhbHVlXG5cblx0QGRlZmluZSAncGFubmVyJyxcblx0XHRnZXQ6IC0+XG5cdFx0XHRAb3B0aW9ucy5wYW5uZXJcblx0XHRzZXQ6ICh2YWx1ZSkgLT5cblx0XHRcdEBvcHRpb25zLnBhbm5lciA9IHZhbHVlXG5cblx0QGRlZmluZSAnc3BlZWQnLFxuXHRcdGdldDogLT5cblx0XHRcdEBvcHRpb25zLnNwZWVkXG5cdFx0c2V0OiAodmFsdWUpIC0+XG5cdFx0XHRAb3B0aW9ucy5zcGVlZCA9IHZhbHVlXG5cblx0XHRcdGlmIEBzb3VyY2UgaXNudCB1bmRlZmluZWRcblx0XHRcdFx0QHNvdXJjZS5wbGF5YmFja1JhdGUudmFsdWUgPSBAb3B0aW9ucy5zcGVlZFxuXG5cdEBkZWZpbmUgJ3VybCcsXG5cdFx0Z2V0OiAtPlxuXHRcdFx0QG9wdGlvbnMudXJsXG5cblx0QGRlZmluZSAndm9sdW1lJyxcblx0XHRnZXQ6IC0+XG5cdFx0XHRAb3B0aW9ucy52b2x1bWVcblx0XHRzZXQ6ICh2YWx1ZSkgLT5cblx0XHRcdEBvcHRpb25zLnZvbHVtZSA9IHZhbHVlXG5cblx0XHRcdGlmIEBnYWluTm9kZSBpc250IHVuZGVmaW5lZFxuXHRcdFx0XHRAZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IEBvcHRpb25zLnZvbHVtZVxuXG5cbmNsYXNzIEF1ZGlvQVBJIGV4dGVuZHMgRnJhbWVyLkJhc2VDbGFzc1xuXG5cdGNvbnRleHQ6IHVuZGVmaW5lZFxuXG5cdGJ1ZmZlcnM6IFtdXG5cblx0Y2hhaW5zOiBbXVxuXG5cdGNvbnN0cnVjdG9yOiAoQG9wdGlvbnM9e30pIC0+XG5cblx0XHRzdXBlciBAb3B0aW9uc1xuXG5cdFx0IyBDb250ZXh0IGNyZWF0aW9uXG5cdFx0QGNvbnRleHQgPSBuZXcgKHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dCkoKTtcblxuXHRAZGVmaW5lICd2b2x1bWUnLFxuXHRcdGdldDogLT5cblx0XHRcdEBvcHRpb25zLnZvbHVtZVxuXHRcdHNldDogKHZhbHVlKSAtPlxuXHRcdFx0QG9wdGlvbnMudm9sdW1lID0gdmFsdWVcblxuXHRAZGVmaW5lICdjdXJyZW50VGltZScsXG5cdFx0Z2V0OiAtPlxuXHRcdFx0QGNvbnRleHQuY3VycmVudFRpbWVcblxuXHRhZGRCdWZmZXI6ICh1cmwsIGJ1ZmZlciwgY2hhaW4pID0+XG5cblx0XHRAYnVmZmVyc1t1cmxdID0gYnVmZmVyXG5cblx0cGxheTogKG9wdGlvbnM9e30pIC0+XG5cblx0XHQjIFdlIGluY2x1ZGUgc2VsZiAodGhpcykgdG8gYmUgdXNlZCB3aXRoaW5nIEF1ZGlvQ2hhaW5cblx0XHRvcHRpb25zLmFwaSA9IHRoaXNcblxuXHRcdCMgRXZlcnkgdGltZSB3ZSBjYWxsIFwicGxheVwiIGEgbmV3IGNoYWluIGhhcyB0byBiZSBhZGRlZFxuXHRcdGNoYWluID0gbmV3IEF1ZGlvQ2hhaW4gKG9wdGlvbnMpXG5cblx0bG9hZDogKG9wdGlvbnM9e30pIC0+XG5cblx0XHQjIERpc2FibGluZyBhdXRvc3RhcnRcblx0XHRvcHRpb25zLmF1dG9wbGF5ID0gZmFsc2VcblxuXHRcdCMgV2UgaW5jbHVkZSBzZWxmICh0aGlzKSB0byBiZSB1c2VkIHdpdGhpbmcgQXVkaW9DaGFpblxuXHRcdG9wdGlvbnMuYXBpID0gdGhpc1xuXG5cdFx0IyBBdWRpb0NoYWluIHdpbGwgY29udGFpbiB0aGUgY2xpcFxuXHRcdGNoYWluID0gbmV3IEF1ZGlvQ2hhaW4gKG9wdGlvbnMpXG5cblx0XHRyZXR1cm4gY2hhaW5cblxuXHRzdG9wOiAtPlxuXG5cdFx0Zm9yIGNoYWluIGluIEBjaGFpbnNcblxuXHRcdFx0Y2hhaW4uc3RvcCgpXG5cblx0XHRAY2hhaW5zID0gW11cblxubW9kdWxlLmV4cG9ydHMgPSBBdWRpb0FQSVxuIiwiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFFQUE7QURBQSxJQUFBLG9CQUFBO0VBQUE7Ozs7QUFBTTs7O3VCQUVMLEdBQUEsR0FBSzs7dUJBRUwsTUFBQSxHQUFROzt1QkFFUixRQUFBLEdBQVU7O3VCQUVWLFVBQUEsR0FBWTs7dUJBRVosT0FBQSxHQUFTOzt1QkFFVCxLQUFBLEdBQU87O3VCQUVQLE1BQUEsR0FBUTs7dUJBRVIsT0FBQSxHQUFTOzt1QkFFVCxNQUFBLEdBQVE7O3VCQUVSLFVBQUEsR0FBWTs7dUJBRVosWUFBQSxHQUFjOzt1QkFFZCxjQUFBLEdBQWdCOzt1QkFFaEIsTUFBQSxHQUFROzt1QkFFUixVQUFBLEdBQVk7O3VCQUVaLE9BQUEsR0FBUzs7RUFHSSxvQkFBQyxRQUFEO0FBRVosUUFBQTtJQUZhLElBQUMsQ0FBQSw2QkFBRCxXQUFTOzs7Ozs7O1VBRWQsQ0FBQyxXQUFZOzs7V0FDYixDQUFDLE9BQVE7OztXQUNULENBQUMsT0FBUTs7O1dBQ1QsQ0FBQyxTQUFVOzs7V0FDWCxDQUFDLE1BQU87OztXQUNSLENBQUMsUUFBUzs7O1dBQ1YsQ0FBQyxNQUFPOzs7V0FDUixDQUFDLFNBQVU7O0lBRW5CLElBQUMsQ0FBQSxHQUFELEdBQU8sSUFBQyxDQUFBLE9BQU8sQ0FBQztJQUdoQixJQUFDLENBQUEsSUFBRCxDQUFBO0VBZFk7O3VCQWlCYixPQUFBLEdBQVMsU0FBQTtJQUVSLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBQyxDQUFBLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBYixDQUFBO0lBRVosSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsR0FBRyxDQUFD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
