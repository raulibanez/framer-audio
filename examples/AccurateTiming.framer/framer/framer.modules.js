require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"AudioAPI":[function(require,module,exports){
var AudioAPI, AudioContext, BufferList, ObjectList,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AudioContext = new (window.AudioContext || window.webkitAudioContext)();

ObjectList = [];

BufferList = [];

AudioAPI = (function(superClass) {
  extend(AudioAPI, superClass);

  AudioAPI.prototype.api = void 0;

  AudioAPI.prototype.source = void 0;

  AudioAPI.prototype.gainNode = void 0;

  AudioAPI.prototype.pannerNode = void 0;

  AudioAPI.prototype.request = void 0;

  AudioAPI.prototype.ended = false;

  AudioAPI.prototype.loaded = false;

  AudioAPI.prototype.loading = false;

  AudioAPI.prototype.played = false;

  AudioAPI.prototype.playedWhen = 0;

  AudioAPI.prototype.playedOffset = 0;

  AudioAPI.prototype.playedDuration = 0;

  AudioAPI.prototype.paused = false;

  AudioAPI.prototype.pausedWhen = 0;

  AudioAPI.prototype.stopped = false;

  function AudioAPI(options) {
    var base, base1, base2, base3, base4, base5, base6, base7;
    this.options = options != null ? options : {};
    this.pause = bind(this.pause, this);
    this.fadeTo = bind(this.fadeTo, this);
    this.clone = bind(this.clone, this);
    this.stop = bind(this.stop, this);
    this.play = bind(this.play, this);
    this.load = bind(this.load, this);
    this.setListenerPosition = bind(this.setListenerPosition, this);
    this.setPannerPosition = bind(this.setPannerPosition, this);
    if ((base = this.options).autoplay == null) {
      base.autoplay = false;
    }
    if ((base1 = this.options).looping == null) {
      base1.looping = false;
    }
    if ((base2 = this.options).name == null) {
      base2.name = "";
    }
    if ((base3 = this.options).panner == null) {
      base3.panner = false;
    }
    if ((base4 = this.options).maxDistance == null) {
      base4.maxDistance = 1000;
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
    AudioAPI.__super__.constructor.call(this, this.options);
    this.source = AudioContext.createBufferSource();
    this.gainNode = AudioContext.createGain();
    if (this.panner === true) {
      this.pannerNode = AudioContext.createPanner();
      this.setPannerProperties();
    }
    this.load();
    ObjectList.push(this);
  }

  AudioAPI.prototype.setPannerProperties = function() {
    this.pannerNode.panningModel = 'HRTF';
    this.pannerNode.distanceModel = 'linear';
    this.pannerNode.refDistance = 1;
    this.pannerNode.maxDistance = this.options.maxDistance;
    this.pannerNode.rolloffFactor = 1;
    this.pannerNode.coneInnerAngle = 360;
    this.pannerNode.coneOuterAngle = 0;
    this.pannerNode.coneOuterGain = 0;
    this.pannerNode.setPosition(0, 0, 0);
    this.pannerNode.setOrientation(0, 0, 0);
    AudioContext.listener.setPosition(0, 0, 0);
    return AudioContext.listener.setOrientation(0, 1, 0, 0, 0, 1);
  };

  AudioAPI.prototype.setPannerPosition = function(xPos, yPos, zPos) {
    return this.pannerNode.setPosition(xPos, yPos, zPos);
  };

  AudioAPI.prototype.setListenerPosition = function(xPos, yPos, zPos) {
    return AudioContext.listener.setPosition(xPos, yPos, zPos);
  };

  AudioAPI.prototype.connect = function() {
    if (this.panner === false) {
      this.source.connect(this.gainNode);
      this.gainNode.connect(AudioContext.destination);
    } else {
      this.source.connect(this.pannerNode);
      this.pannerNode.connect(this.gainNode);
      this.gainNode.connect(AudioContext.destination);
    }
    this.source.playbackRate.value = this.options.speed;
    this.gainNode.gain.value = this.options.volume;
    return this.source.loop = this.looping;
  };

  AudioAPI.prototype.load = function() {
    if (BufferList[this.options.url] === void 0) {
      this.loading = true;
      this.request = new XMLHttpRequest();
      this.request.open("GET", this.url, true);
      this.request.responseType = "arraybuffer";
      this.request.onload = (function(_this) {
        return function() {
          return AudioContext.decodeAudioData(_this.request.response, (function(buffer) {
            _this.source.buffer = buffer;
            BufferList[_this.options.url] = _this.source.buffer;
            _this.connect();
            _this.loaded = true;
            _this.loading = false;
            _this.emit("LoadEnd", _this.source);
            if (_this.autoplay === true) {
              return _this.play();
            }
          }), (function(e) {
            return print("Error with decoding audio data" + e.err);
          }));
        };
      })(this);
      return this.request.send();
    } else {
      this.source.buffer = BufferList[this.options.url];
      this.connect();
      if (this.autoplay === true) {
        return this.play();
      }
    }
  };

  AudioAPI.prototype.play = function(time, offset, duration) {
    var chain, ref;
    if (this.loading === true) {
      print("Error: can't play until source is loaded");
      return this;
    }
    if (this.paused === true) {
      this.options.autoplay = false;
      chain = new AudioAPI(this.options);
      chain.play(AudioContext.currentTime, this.playedOffset + (this.pausedWhen - this.playedWhen), this.playedDuration - (this.pausedWhen - this.playedWhen));
      return chain;
    } else {
      if (time == null) {
        time = AudioContext.currentTime;
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
        this.options.autoplay = false;
        chain = new AudioAPI(this.options);
        chain.play(time, offset, duration);
        return chain;
      }
    }
  };

  AudioAPI.prototype.stop = function(time) {
    if (time == null) {
      time = 0;
    }
    if (this.played === true && this.stopped === false) {
      this.stopped = true;
      return this.source.stop(time);
    }
  };

  AudioAPI.prototype.clone = function() {
    var chain;
    chain = new AudioAPI(this.options);
    return chain;
  };

  AudioAPI.prototype.fadeTo = function(chain, time, offset, duration) {
    if (time == null) {
      time = 0;
    }
    if (offset == null) {
      offset = 0;
    }
    if (duration == null) {
      duration = chain.source.duration;
    }
    this.gainNode.gain.setValueAtTime(this.volume, AudioContext.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(0, AudioContext.currentTime + 3);
    this.stop(AudioContext.currentTime + 3);
    chain = chain.play(time, offset, duration);
    chain.gainNode.gain.setValueAtTime(0, AudioContext.currentTime);
    chain.gainNode.gain.linearRampToValueAtTime(chain.volume, AudioContext.currentTime + 3);
    return chain;
  };

  AudioAPI.prototype.pause = function() {
    if (this.paused === false) {
      this.stop();
      this.paused = true;
      return this.pausedWhen = AudioContext.currentTime;
    }
  };

  AudioAPI.prototype.fadeOut = function(time, duration) {
    if (time == null) {
      time = AudioContext.currentTime;
    }
    if (duration == null) {
      duration = 3;
    }
    this.gainNode.gain.setValueAtTime(this.volume, time);
    this.gainNode.gain.linearRampToValueAtTime(0, time + duration);
    return this.stop(time + duration);
  };

  AudioAPI.prototype.fadeIn = function(time, duration) {
    var chain;
    if (time == null) {
      time = AudioContext.currentTime;
    }
    if (duration == null) {
      duration = 3;
    }
    this.gainNode.gain.setValueAtTime(0, time);
    this.gainNode.gain.linearRampToValueAtTime(this.volume, time + duration);
    chain = this.play(time);
    return chain;
  };

  AudioAPI.prototype.onLoadEnd = function(source) {
    return this.on("LoadEnd", source);
  };

  AudioAPI.prototype.onPlaybackEnd = function(source) {
    return this.on("PlaybackEnd", source);
  };

  AudioAPI.define('autoplay', {
    get: function() {
      return this.options.autoplay;
    }
  });

  AudioAPI.define('looping', {
    get: function() {
      return this.options.looping;
    },
    set: function(value) {
      this.options.looping = value;
      if (this.source !== void 0) {
        return this.source.loop = this.options.looping;
      }
    }
  });

  AudioAPI.define('name', {
    get: function() {
      return this.options.name;
    },
    set: function(value) {
      return this.options.name = value;
    }
  });

  AudioAPI.define('panner', {
    get: function() {
      return this.options.panner;
    },
    set: function(value) {
      return this.options.panner = value;
    }
  });

  AudioAPI.define('maxDistance', {
    get: function() {
      return this.options.maxDistance;
    },
    set: function(value) {
      this.options.maxDistance = value;
      if (this.pannerNode !== void 0) {
        return this.pannerNode.maxDistance = this.options.maxDistance;
      }
    }
  });

  AudioAPI.define('speed', {
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

  AudioAPI.define('url', {
    get: function() {
      return this.options.url;
    }
  });

  AudioAPI.define('volume', {
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

  AudioAPI.define('currentTime', {
    get: function() {
      return AudioContext.currentTime;
    }
  });

  AudioAPI.prototype.stopAll = function() {
    var i, len, obj;
    for (i = 0, len = ObjectList.length; i < len; i++) {
      obj = ObjectList[i];
      obj.stop();
    }
    return ObjectList = [];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWVyLm1vZHVsZXMuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1VzZXJzL3JhdWwvR2l0L2ZyYW1lci1hdWRpby9leGFtcGxlcy9BY2N1cmF0ZVRpbWluZy5mcmFtZXIvbW9kdWxlcy9teU1vZHVsZS5jb2ZmZWUiLCIuLi8uLi8uLi8uLi8uLi9Vc2Vycy9yYXVsL0dpdC9mcmFtZXItYXVkaW8vZXhhbXBsZXMvQWNjdXJhdGVUaW1pbmcuZnJhbWVyL21vZHVsZXMvQXVkaW9BUEkuY29mZmVlIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIjIEFkZCB0aGUgZm9sbG93aW5nIGxpbmUgdG8geW91ciBwcm9qZWN0IGluIEZyYW1lciBTdHVkaW8uIFxuIyBteU1vZHVsZSA9IHJlcXVpcmUgXCJteU1vZHVsZVwiXG4jIFJlZmVyZW5jZSB0aGUgY29udGVudHMgYnkgbmFtZSwgbGlrZSBteU1vZHVsZS5teUZ1bmN0aW9uKCkgb3IgbXlNb2R1bGUubXlWYXJcblxuZXhwb3J0cy5teVZhciA9IFwibXlWYXJpYWJsZVwiXG5cbmV4cG9ydHMubXlGdW5jdGlvbiA9IC0+XG5cdHByaW50IFwibXlGdW5jdGlvbiBpcyBydW5uaW5nXCJcblxuZXhwb3J0cy5teUFycmF5ID0gWzEsIDIsIDNdIiwiQXVkaW9Db250ZXh0ID0gbmV3ICh3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQpKCk7XG5cbk9iamVjdExpc3QgPSBbXVxuXG5CdWZmZXJMaXN0ID0gW11cblxuY2xhc3MgQXVkaW9BUEkgZXh0ZW5kcyBGcmFtZXIuQmFzZUNsYXNzXG5cblx0YXBpOiB1bmRlZmluZWRcblxuXHRzb3VyY2U6IHVuZGVmaW5lZFxuXG5cdGdhaW5Ob2RlOiB1bmRlZmluZWRcblxuXHRwYW5uZXJOb2RlOiB1bmRlZmluZWRcblxuXHRyZXF1ZXN0OiB1bmRlZmluZWRcblxuXHRlbmRlZDogZmFsc2VcblxuXHRsb2FkZWQ6IGZhbHNlXG5cblx0bG9hZGluZzogZmFsc2VcblxuXHRwbGF5ZWQ6IGZhbHNlXG5cblx0cGxheWVkV2hlbjogMFxuXG5cdHBsYXllZE9mZnNldDogMFxuXG5cdHBsYXllZER1cmF0aW9uOiAwXG5cblx0cGF1c2VkOiBmYWxzZVxuXG5cdHBhdXNlZFdoZW46IDBcblxuXHRzdG9wcGVkOiBmYWxzZVxuXG5cdGNvbnN0cnVjdG9yOiAoQG9wdGlvbnM9e30pIC0+XG5cblx0XHRAb3B0aW9ucy5hdXRvcGxheSA/PSBmYWxzZVxuXHRcdEBvcHRpb25zLmxvb3BpbmcgPz0gZmFsc2Vcblx0XHRAb3B0aW9ucy5uYW1lID89IFwiXCJcblx0XHRAb3B0aW9ucy5wYW5uZXIgPz0gZmFsc2Vcblx0XHRAb3B0aW9ucy5tYXhEaXN0YW5jZSA/PSAxMDAwXG5cdFx0QG9wdGlvbnMuc3BlZWQgPz0gMVxuXHRcdEBvcHRpb25zLnVybCA/PSBcIlwiXG5cdFx0QG9wdGlvbnMudm9sdW1lID89IDFcblxuXHRcdHN1cGVyIEBvcHRpb25zXG5cblx0XHQjIE5vZGUgY3JlYXRpb25cblx0XHRAc291cmNlID0gQXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG5cdFx0QGdhaW5Ob2RlID0gQXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcblx0XHRpZiBAcGFubmVyIGlzIHRydWVcblx0XHRcdEBwYW5uZXJOb2RlID0gQXVkaW9Db250ZXh0LmNyZWF0ZVBhbm5lcigpXG5cdFx0XHRAc2V0UGFubmVyUHJvcGVydGllcygpXG5cblx0XHQjIExvYWQgVVJMIGludG8gYnVmZmVyXG5cdFx0QGxvYWQoKVxuXG5cdFx0IyBBZGQgdGhpcyB0byB0aGUgT2JqZWN0TGlzdCBhcnJheU5leHRcblx0XHRPYmplY3RMaXN0LnB1c2ggQFxuXG5cdCMgUGFubmVyIERlZmF1bHQgcHJvcGVydGllc1xuXHRzZXRQYW5uZXJQcm9wZXJ0aWVzOiAtPlxuXG5cdFx0IyBQYW5uZXIgZGVmYXVsdCBwcm9wZXJ0aWVzXG5cdFx0QHBhbm5lck5vZGUucGFubmluZ01vZGVsID0gJ0hSVEYnXG5cdFx0QHBhbm5lck5vZGUuZGlzdGFuY2VNb2RlbCA9ICdsaW5lYXInXG5cdFx0QHBhbm5lck5vZGUucmVmRGlzdGFuY2UgPSAxXG5cdFx0QHBhbm5lck5vZGUubWF4RGlzdGFuY2UgPSBAb3B0aW9ucy5tYXhEaXN0YW5jZVxuXHRcdEBwYW5uZXJOb2RlLnJvbGxvZmZGYWN0b3IgPSAxXG5cdFx0QHBhbm5lck5vZGUuY29uZUlubmVyQW5nbGUgPSAzNjBcblx0XHRAcGFubmVyTm9kZS5jb25lT3V0ZXJBbmdsZSA9IDBcblx0XHRAcGFubmVyTm9kZS5jb25lT3V0ZXJHYWluID0gMFxuXG5cdFx0IyBQYW5uZXIgZGVmYXVsdCBsb2NhdGlvbiAoMCwgMCwgMClcblx0XHRAcGFubmVyTm9kZS5zZXRQb3NpdGlvbigwLCAwLCAwKVxuXHRcdEBwYW5uZXJOb2RlLnNldE9yaWVudGF0aW9uKDAsIDAsIDApXG5cblx0XHQjIExpc3RlbmVyIGRlZmF1bHQgbG9jYXRpb24gKDAsIDAsIDApXG5cdFx0QXVkaW9Db250ZXh0Lmxpc3RlbmVyLnNldFBvc2l0aW9uKDAsIDAsIDApXG5cdFx0QXVkaW9Db250ZXh0Lmxpc3RlbmVyLnNldE9yaWVudGF0aW9uKDAsIDEsIDAsIDAsIDAsIDEpXG5cblx0IyBQYW5uZXIgcG9zaXRpb25cblx0c2V0UGFubmVyUG9zaXRpb246ICh4UG9zLCB5UG9zLCB6UG9zKSA9PlxuXG5cdFx0QHBhbm5lck5vZGUuc2V0UG9zaXRpb24oeFBvcywgeVBvcywgelBvcylcblxuXHQjIExpc3RlbmVyIHBvc2l0aW9uXG5cdHNldExpc3RlbmVyUG9zaXRpb246ICh4UG9zLCB5UG9zLCB6UG9zKSA9PlxuXG5cdFx0QXVkaW9Db250ZXh0Lmxpc3RlbmVyLnNldFBvc2l0aW9uKHhQb3MsIHlQb3MsIHpQb3MpXG5cblx0IyBTZXR1cCBub2RlcyB0byBidWlsZCBjaGFpblxuXHRjb25uZWN0OiAtPlxuXG5cdFx0aWYgQHBhbm5lciBpcyBmYWxzZVxuXG5cdFx0XHRAc291cmNlLmNvbm5lY3QoQGdhaW5Ob2RlKVxuXG5cdFx0XHRAZ2Fpbk5vZGUuY29ubmVjdChBdWRpb0NvbnRleHQuZGVzdGluYXRpb24pXG5cblx0XHRlbHNlXG5cblx0XHRcdEBzb3VyY2UuY29ubmVjdChAcGFubmVyTm9kZSlcblxuXHRcdFx0QHBhbm5lck5vZGUuY29ubmVjdChAZ2Fpbk5vZGUpXG5cblx0XHRcdEBnYWluTm9kZS5jb25uZWN0KEF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbilcblxuXHRcdCMgUHJvcGVydGllc1xuXHRcdEBzb3VyY2UucGxheWJhY2tSYXRlLnZhbHVlID0gQG9wdGlvbnMuc3BlZWRcblx0XHRAZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IEBvcHRpb25zLnZvbHVtZVxuXHRcdEBzb3VyY2UubG9vcD1AbG9vcGluZ1xuXG5cdGxvYWQ6ID0+XG5cblx0XHRpZiBCdWZmZXJMaXN0W0BvcHRpb25zLnVybF0gaXMgdW5kZWZpbmVkXG5cblx0XHRcdEBsb2FkaW5nID0gdHJ1ZVxuXG5cdFx0XHRAcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cblx0XHRcdEByZXF1ZXN0Lm9wZW4oXCJHRVRcIiwgQHVybCwgdHJ1ZSlcblxuXHRcdFx0QHJlcXVlc3QucmVzcG9uc2VUeXBlID0gXCJhcnJheWJ1ZmZlclwiXG5cblx0XHRcdEByZXF1ZXN0Lm9ubG9hZCA9ID0+XG5cdFx0XHRcdEF1ZGlvQ29udGV4dC5kZWNvZGVBdWRpb0RhdGEoQHJlcXVlc3QucmVzcG9uc2UsKChidWZmZXIpID0+XG5cblx0XHRcdFx0XHQjICBBY3R1YWwgZGF0YSBzdHJlYW1cblx0XHRcdFx0XHRAc291cmNlLmJ1ZmZlciA9IGJ1ZmZlclxuXG5cdFx0XHRcdFx0IyBXZSBrZWVwIHRoZSBidWZmZXJzIGluIGFuIGFycmF5IGZvciByZXVzZVxuXHRcdFx0XHRcdEJ1ZmZlckxpc3RbQG9wdGlvbnMudXJsXSA9IEBzb3VyY2UuYnVmZmVyXG5cblx0XHRcdFx0XHQjIFNldHVwIGNoYWluXG5cdFx0XHRcdFx0QGNvbm5lY3QoKVxuXG5cdFx0XHRcdFx0IyBGbGFnIGNvbnRyb2xcblx0XHRcdFx0XHRAbG9hZGVkID0gdHJ1ZVxuXHRcdFx0XHRcdEBsb2FkaW5nID0gZmFsc2Vcblx0XHRcdFx0XHRAZW1pdCBcIkxvYWRFbmRcIiwgQHNvdXJjZVxuXG5cdFx0XHRcdFx0IyBBdXRvcGxheSBjb250cm9sXG5cdFx0XHRcdFx0aWYgQGF1dG9wbGF5IGlzIHRydWVcblx0XHRcdFx0XHRcdEBwbGF5KClcblx0XHRcdFx0XHQpXG5cdFx0XHRcdCwoKGUpIC0+IHByaW50IFwiRXJyb3Igd2l0aCBkZWNvZGluZyBhdWRpbyBkYXRhXCIgKyBlLmVycikpXG5cblx0IyBcdFx0XHRAcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSA9PlxuXHQjIFx0XHRcdFx0cHJpbnQgWE1MSHR0cFJlcXVlc3QuRE9ORVxuXHQjIFx0XHRcdFx0cHJpbnQgQHJlcXVlc3Quc3RhdHVzXG5cblx0XHRcdEByZXF1ZXN0LnNlbmQoKVxuXG5cdFx0ZWxzZVxuXG5cdFx0XHRAc291cmNlLmJ1ZmZlciA9IEJ1ZmZlckxpc3RbQG9wdGlvbnMudXJsXVxuXHRcdFx0QGNvbm5lY3QoKVxuXHRcdFx0aWYgQGF1dG9wbGF5IGlzIHRydWVcblx0XHRcdFx0QHBsYXkoKVxuXG5cdHBsYXk6ICh0aW1lLCBvZmZzZXQsIGR1cmF0aW9uKSA9PlxuXG5cdFx0aWYgQGxvYWRpbmcgPT0gdHJ1ZVxuXG5cdFx0XHRwcmludCBcIkVycm9yOiBjYW4ndCBwbGF5IHVudGlsIHNvdXJjZSBpcyBsb2FkZWRcIlxuXG5cdFx0XHRyZXR1cm4gdGhpc1xuXG5cdFx0aWYgQHBhdXNlZCBpcyB0cnVlXG5cblx0XHRcdEBvcHRpb25zLmF1dG9wbGF5ID0gZmFsc2Vcblx0XHRcdGNoYWluID0gbmV3IEF1ZGlvQVBJIChAb3B0aW9ucylcblx0XHRcdGNoYWluLnBsYXkoQXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lLCBAcGxheWVkT2Zmc2V0KyhAcGF1c2VkV2hlbi1AcGxheWVkV2hlbiksIEBwbGF5ZWREdXJhdGlvbi0oQHBhdXNlZFdoZW4tQHBsYXllZFdoZW4pKVxuXG5cdFx0XHRyZXR1cm4gY2hhaW5cblxuXHRcdGVsc2VcblxuXHRcdFx0dGltZSA/PSBBdWRpb0NvbnRleHQuY3VycmVudFRpbWVcblx0XHRcdG9mZnNldCA/PSAwXG5cdFx0XHRkdXJhdGlvbiA/PSBAc291cmNlLmJ1ZmZlci5kdXJhdGlvblxuXG5cdFx0XHQjIFdlIGtlZXAgdGhlc2UgdmFsdWVzIHRvIGJlIGFibGUgdG8gcmVzdW1lIGF1ZGlvXG5cdFx0XHRbIEBwbGF5ZWRXaGVuLCBAcGxheWVkT2Zmc2V0LCBAcGxheWVkRHVyYXRpb24gXSA9IFsgdGltZSwgb2Zmc2V0LCBkdXJhdGlvbiBdXG5cblx0XHRcdGlmIEBwbGF5ZWQgaXMgZmFsc2VcblxuXHRcdFx0XHRAcGxheWVkID0gdHJ1ZVxuXG5cdFx0XHRcdEBzb3VyY2UuYWRkRXZlbnRMaXN0ZW5lciAnZW5kZWQnICwgKGV2ZW50KSA9PlxuXHRcdFx0XHRcdEBlbmRlZCA9IHRydWVcblx0XHRcdFx0XHRAZW1pdCBcIlBsYXliYWNrRW5kXCIsIEBzb3VyY2VcblxuXHRcdFx0XHRAc291cmNlLnN0YXJ0KHRpbWUsIG9mZnNldCwgZHVyYXRpb24pXG5cblx0XHRcdFx0cmV0dXJuIHRoaXNcblxuXHRcdFx0ZWxzZVxuXG5cdFx0XHRcdCMgQW4gYXVkaW8gc291cmNlIGNhbiBvbmx5IGJlIHBsYXllZCBvbmNlXG5cdFx0XHRcdCMgQSBuZXcgQXVkaW9BUEkgaGFzIHRvIGJlIGNyZWF0ZWRcblxuXHRcdFx0XHQjIFdlIGRpc2FibGUgYXV0b3BsYXlcblx0XHRcdFx0QG9wdGlvbnMuYXV0b3BsYXkgPSBmYWxzZVxuXG5cdFx0XHRcdCMgTmV3IEF1ZGlvQVBJIHdpdGggdGhlIHNhbWUgb3B0aW9uc1xuXHRcdFx0XHRjaGFpbiA9IG5ldyBBdWRpb0FQSSAoQG9wdGlvbnMpXG5cblx0XHRcdFx0IyBTdGFydCBhdWRpb1xuXHRcdFx0XHRjaGFpbi5wbGF5KHRpbWUsIG9mZnNldCwgZHVyYXRpb24pXG5cblx0XHRcdFx0IyBSZXR1cm4gdGhlIG9iamVjdCBzbyBpdCBjYW4gdHJlYXRlZCBpbiB0aGUgcHJvZ3JhbVxuXHRcdFx0XHRyZXR1cm4gY2hhaW5cblxuXHRzdG9wOiAodGltZSkgPT5cblxuXHRcdHRpbWUgPz0gMFxuXG5cdFx0aWYgQHBsYXllZCBpcyB0cnVlIGFuZCBAc3RvcHBlZCBpcyBmYWxzZVxuXG5cdFx0XHRAc3RvcHBlZCA9IHRydWVcblxuXHRcdFx0QHNvdXJjZS5zdG9wKHRpbWUpXG5cblx0Y2xvbmU6ID0+XG5cblx0XHQjIE5ldyBBdWRpb0FQSSB3aXRoIHRoZSBzYW1lIG9wdGlvbnNcblx0XHRjaGFpbiA9IG5ldyBBdWRpb0FQSSAoQG9wdGlvbnMpXG5cblx0XHQjIFJldHVybiB0aGUgb2JqZWN0IHNvIGl0IGNhbiB0cmVhdGVkIGluIHRoZSBwcm9ncmFtXG5cdFx0cmV0dXJuIGNoYWluXG5cblx0ZmFkZVRvOiAoY2hhaW4sIHRpbWUsIG9mZnNldCwgZHVyYXRpb24pID0+XG5cblx0XHQjIERlZmF1bHRzIGZvciB0aGUgc291bmQgdG8gYmUgZmFkZWQgdG9cblx0XHR0aW1lID89IDBcblx0XHRvZmZzZXQgPz0gMFxuXHRcdGR1cmF0aW9uID89IGNoYWluLnNvdXJjZS5kdXJhdGlvblxuXG5cdFx0IyBGYWRlXG5cdFx0QGdhaW5Ob2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUoQHZvbHVtZSwgQXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcblx0XHRAZ2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBBdWRpb0NvbnRleHQuY3VycmVudFRpbWUrMyk7XG5cdFx0QHN0b3AoQXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKzMpXG5cdFx0IyBXZSBjYXB0dXJlIHRoZSBvYmplY3QgYmFjayBmb3IgdGhvc2UgY2FzZXMgdGhlIGNsaXAgaGFzIHRvIGJlIFwicmVsb2FkZWRcIlxuXHRcdGNoYWluID0gY2hhaW4ucGxheSh0aW1lLCBvZmZzZXQsIGR1cmF0aW9uKVxuXHRcdGNoYWluLmdhaW5Ob2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgQXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcblx0XHRjaGFpbi5nYWluTm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKGNoYWluLnZvbHVtZSwgQXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKzMpO1xuXG5cdFx0cmV0dXJuIGNoYWluXG5cblx0cGF1c2U6ID0+XG5cblx0XHRpZiBAcGF1c2VkIGlzIGZhbHNlXG5cblx0XHRcdEBzdG9wKClcblx0XHRcdEBwYXVzZWQ9dHJ1ZVxuXHRcdFx0QHBhdXNlZFdoZW49QXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lXG5cblx0ZmFkZU91dDogKHRpbWUsIGR1cmF0aW9uKSAtPlxuXG5cdFx0dGltZSA/PSBBdWRpb0NvbnRleHQuY3VycmVudFRpbWVcblx0XHRkdXJhdGlvbiA/PSAzXG5cblx0XHRAZ2Fpbk5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZShAdm9sdW1lLCB0aW1lKTtcblx0XHRAZ2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCB0aW1lK2R1cmF0aW9uKTtcblx0XHRAc3RvcCh0aW1lK2R1cmF0aW9uKVxuXG5cdGZhZGVJbjogKHRpbWUsIGR1cmF0aW9uKSAtPlxuXG5cdFx0dGltZSA/PSBBdWRpb0NvbnRleHQuY3VycmVudFRpbWVcblx0XHRkdXJhdGlvbiA/PSAzXG5cblx0XHRAZ2Fpbk5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0aW1lKTtcblx0XHRAZ2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShAdm9sdW1lLCB0aW1lK2R1cmF0aW9uKTtcblx0XHRjaGFpbiA9IEBwbGF5KHRpbWUpXG5cblx0XHRyZXR1cm4gY2hhaW5cblxuXHRvbkxvYWRFbmQ6IChzb3VyY2UpIC0+IEBvbiBcIkxvYWRFbmRcIiwgc291cmNlXG5cblx0b25QbGF5YmFja0VuZDogKHNvdXJjZSkgLT4gQG9uIFwiUGxheWJhY2tFbmRcIiwgc291cmNlXG5cblx0QGRlZmluZSAnYXV0b3BsYXknLFxuXHRcdGdldDogLT5cblx0XHRcdEBvcHRpb25zLmF1dG9wbGF5XG5cblx0QGRlZmluZSAnbG9vcGluZycsXG5cdFx0Z2V0OiAtPlxuXHRcdFx0QG9wdGlvbnMubG9vcGluZ1xuXHRcdHNldDogKHZhbHVlKSAtPlxuXHRcdFx0QG9wdGlvbnMubG9vcGluZyA9IHZhbHVlXG5cblx0XHRcdGlmIEBzb3VyY2UgaXNudCB1bmRlZmluZWRcblx0XHRcdFx0QHNvdXJjZS5sb29wPUBvcHRpb25zLmxvb3BpbmdcblxuXHRAZGVmaW5lICduYW1lJyxcblx0XHRnZXQ6IC0+XG5cdFx0XHRAb3B0aW9ucy5uYW1lXG5cdFx0c2V0OiAodmFsdWUpIC0+XG5cdFx0XHRAb3B0aW9ucy5uYW1lID0gdmFsdWVcblxuXHRAZGVmaW5lICdwYW5uZXInLFxuXHRcdGdldDogLT5cblx0XHRcdEBvcHRpb25zLnBhbm5lclxuXHRcdHNldDogKHZhbHVlKSAtPlxuXHRcdFx0QG9wdGlvbnMucGFubmVyID0gdmFsdWVcblxuXHRAZGVmaW5lICdtYXhEaXN0YW5jZScsXG5cdFx0Z2V0OiAtPlxuXHRcdFx0QG9wdGlvbnMubWF4RGlzdGFuY2Vcblx0XHRzZXQ6ICh2YWx1ZSkgLT5cblx0XHRcdEBvcHRpb25zLm1heERpc3RhbmNlID0gdmFsdWVcblxuXHRcdFx0aWYgQHBhbm5lck5vZGUgaXNudCB1bmRlZmluZWRcblx0XHRcdFx0QHBhbm5lck5vZGUubWF4RGlzdGFuY2UgPSBAb3B0aW9ucy5tYXhEaXN0YW5jZVxuXG5cdEBkZWZpbmUgJ3NwZWVkJyxcblx0XHRnZXQ6IC0+XG5cdFx0XHRAb3B0aW9ucy5zcGVlZFxuXHRcdHNldDogKHZhbHVlKSAtPlxuXHRcdFx0QG9wdGlvbnMuc3BlZWQgPSB2YWx1ZVxuXG5cdFx0XHRpZiBAc291cmNlIGlzbnQgdW5kZWZpbmVkXG5cdFx0XHRcdEBzb3VyY2UucGxheWJhY2tSYXRlLnZhbHVlID0gQG9wdGlvbnMuc3BlZWRcblxuXHRAZGVmaW5lICd1cmwnLFxuXHRcdGdldDogLT5cblx0XHRcdEBvcHRpb25zLnVybFxuXG5cdEBkZWZpbmUgJ3ZvbHVtZScsXG5cdFx0Z2V0OiAtPlxuXHRcdFx0QG9wdGlvbnMudm9sdW1lXG5cdFx0c2V0OiAodmFsdWUpIC0+XG5cdFx0XHRAb3B0aW9ucy52b2x1bWUgPSB2YWx1ZVxuXG5cdFx0XHRpZiBAZ2Fpbk5vZGUgaXNudCB1bmRlZmluZWRcblx0XHRcdFx0QGdhaW5Ob2RlLmdhaW4udmFsdWUgPSBAb3B0aW9ucy52b2x1bWVcblxuXHRAZGVmaW5lICdjdXJyZW50VGltZScsXG5cdFx0Z2V0OiAtPlxuXHRcdFx0QXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lXG5cblx0c3RvcEFsbDogLT5cblxuXHRcdGZvciBvYmogaW4gT2JqZWN0TGlzdFxuXG5cdFx0XHRvYmouc3RvcCgpXG5cblx0XHRPYmplY3RMaXN0ID0gW11cblxubW9kdWxlLmV4cG9ydHMgPSBBdWRpb0FQSVxuIiwiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10p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
