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
    var base, base1, base2, base3, base4, base5, base6;
    this.options = options != null ? options : {};
    this.pause = bind(this.pause, this);
    this.fadeTo = bind(this.fadeTo, this);
    this.clone = bind(this.clone, this);
    this.stop = bind(this.stop, this);
    this.play = bind(this.play, this);
    this.load = bind(this.load, this);
    if ((base = this.options).autoplay == null) {
      base.autoplay = false;
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
    if ((base4 = this.options).speed == null) {
      base4.speed = 1;
    }
    if ((base5 = this.options).url == null) {
      base5.url = "";
    }
    if ((base6 = this.options).volume == null) {
      base6.volume = 1;
    }
    this.load();
    ObjectList.push(this);
  }

  AudioAPI.prototype.connect = function() {
    this.gainNode = AudioContext.createGain();
    this.source.connect(this.gainNode);
    this.gainNode.connect(AudioContext.destination);
    this.source.playbackRate.value = this.options.speed;
    this.gainNode.gain.value = this.options.volume;
    return this.source.loop = this.loop;
  };

  AudioAPI.prototype.load = function() {
    if (BufferList[this.options.url] === void 0) {
      this.loading = true;
      this.source = AudioContext.createBufferSource();
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
      this.source = AudioContext.createBufferSource();
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

  AudioAPI.define('loop', {
    get: function() {
      return this.options.loop;
    },
    set: function(value) {
      return this.options.loop = value;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWVyLm1vZHVsZXMuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1VzZXJzL3JhdWwvR2l0L2ZyYW1lci1hdWRpby9leGFtcGxlcy9QYW5uZXJFeGFtcGxlLmZyYW1lci9tb2R1bGVzL215TW9kdWxlLmNvZmZlZSIsIi4uLy4uLy4uLy4uLy4uL1VzZXJzL3JhdWwvR2l0L2ZyYW1lci1hdWRpby9leGFtcGxlcy9QYW5uZXJFeGFtcGxlLmZyYW1lci9tb2R1bGVzL0F1ZGlvQVBJLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiIyBBZGQgdGhlIGZvbGxvd2luZyBsaW5lIHRvIHlvdXIgcHJvamVjdCBpbiBGcmFtZXIgU3R1ZGlvLiBcbiMgbXlNb2R1bGUgPSByZXF1aXJlIFwibXlNb2R1bGVcIlxuIyBSZWZlcmVuY2UgdGhlIGNvbnRlbnRzIGJ5IG5hbWUsIGxpa2UgbXlNb2R1bGUubXlGdW5jdGlvbigpIG9yIG15TW9kdWxlLm15VmFyXG5cbmV4cG9ydHMubXlWYXIgPSBcIm15VmFyaWFibGVcIlxuXG5leHBvcnRzLm15RnVuY3Rpb24gPSAtPlxuXHRwcmludCBcIm15RnVuY3Rpb24gaXMgcnVubmluZ1wiXG5cbmV4cG9ydHMubXlBcnJheSA9IFsxLCAyLCAzXSIsIkF1ZGlvQ29udGV4dCA9IG5ldyAod2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0KSgpO1xuXG5PYmplY3RMaXN0ID0gW11cblxuQnVmZmVyTGlzdCA9IFtdXG5cbmNsYXNzIEF1ZGlvQVBJIGV4dGVuZHMgRnJhbWVyLkJhc2VDbGFzc1xuXG5cdGFwaTogdW5kZWZpbmVkXG5cblx0c291cmNlOiB1bmRlZmluZWRcblxuXHRnYWluTm9kZTogdW5kZWZpbmVkXG5cblx0cGFubmVyTm9kZTogdW5kZWZpbmVkXG5cblx0cmVxdWVzdDogdW5kZWZpbmVkXG5cblx0ZW5kZWQ6IGZhbHNlXG5cblx0bG9hZGVkOiBmYWxzZVxuXG5cdGxvYWRpbmc6IGZhbHNlXG5cblx0cGxheWVkOiBmYWxzZVxuXG5cdHBsYXllZFdoZW46IDBcblxuXHRwbGF5ZWRPZmZzZXQ6IDBcblxuXHRwbGF5ZWREdXJhdGlvbjogMFxuXG5cdHBhdXNlZDogZmFsc2VcblxuXHRwYXVzZWRXaGVuOiAwXG5cblx0c3RvcHBlZDogZmFsc2VcblxuXHRjb25zdHJ1Y3RvcjogKEBvcHRpb25zPXt9KSAtPlxuXG5cdFx0QG9wdGlvbnMuYXV0b3BsYXkgPz0gZmFsc2Vcblx0XHRAb3B0aW9ucy5sb29wID89IGZhbHNlXG5cdFx0QG9wdGlvbnMubmFtZSA/PSBcIlwiXG5cdFx0QG9wdGlvbnMucGFubmVyID89IGZhbHNlXG5cdFx0QG9wdGlvbnMuc3BlZWQgPz0gMVxuXHRcdEBvcHRpb25zLnVybCA/PSBcIlwiXG5cdFx0QG9wdGlvbnMudm9sdW1lID89IDFcblxuXHRcdCMgTG9hZCBVUkwgaW50byBidWZmZXJcblx0XHRAbG9hZCgpXG5cblx0XHQjIEFkZCB0aGlzIHRvIHRoZSBPYmplY3RMaXN0IGFycmF5TmV4dFxuXHRcdE9iamVjdExpc3QucHVzaCBAXG5cblx0IyBTZXR1cCBub2RlcyB0byBidWlsZCBjaGFpblxuXHRjb25uZWN0OiAtPlxuXG5cdFx0QGdhaW5Ob2RlID0gQXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcblxuXHRcdEBzb3VyY2UuY29ubmVjdChAZ2Fpbk5vZGUpXG5cblx0XHRAZ2Fpbk5vZGUuY29ubmVjdChBdWRpb0NvbnRleHQuZGVzdGluYXRpb24pXG5cblx0XHQjIFByb3BlcnRpZXNcblx0XHRAc291cmNlLnBsYXliYWNrUmF0ZS52YWx1ZSA9IEBvcHRpb25zLnNwZWVkXG5cdFx0QGdhaW5Ob2RlLmdhaW4udmFsdWUgPSBAb3B0aW9ucy52b2x1bWVcblx0XHRAc291cmNlLmxvb3A9QGxvb3BcblxuXHRsb2FkOiA9PlxuXG5cdFx0aWYgQnVmZmVyTGlzdFtAb3B0aW9ucy51cmxdIGlzIHVuZGVmaW5lZFxuXG5cdFx0XHRAbG9hZGluZyA9IHRydWVcblxuXHRcdFx0QHNvdXJjZSA9IEF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKVxuXHRcdFx0QHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG5cdFx0XHRAcmVxdWVzdC5vcGVuKFwiR0VUXCIsIEB1cmwsIHRydWUpXG5cblx0XHRcdEByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IFwiYXJyYXlidWZmZXJcIlxuXG5cdFx0XHRAcmVxdWVzdC5vbmxvYWQgPSA9PlxuXHRcdFx0XHRBdWRpb0NvbnRleHQuZGVjb2RlQXVkaW9EYXRhKEByZXF1ZXN0LnJlc3BvbnNlLCgoYnVmZmVyKSA9PlxuXG5cdFx0XHRcdFx0IyAgQWN0dWFsIGRhdGEgc3RyZWFtXG5cdFx0XHRcdFx0QHNvdXJjZS5idWZmZXIgPSBidWZmZXJcblxuXHRcdFx0XHRcdCMgV2Uga2VlcCB0aGUgYnVmZmVycyBpbiBhbiBhcnJheSBmb3IgcmV1c2Vcblx0XHRcdFx0XHRCdWZmZXJMaXN0W0BvcHRpb25zLnVybF0gPSBAc291cmNlLmJ1ZmZlclxuXG5cdFx0XHRcdFx0IyBTZXR1cCBjaGFpblxuXHRcdFx0XHRcdEBjb25uZWN0KClcblxuXHRcdFx0XHRcdCMgRmxhZyBjb250cm9sXG5cdFx0XHRcdFx0QGxvYWRlZCA9IHRydWVcblx0XHRcdFx0XHRAbG9hZGluZyA9IGZhbHNlXG5cdFx0XHRcdFx0QGVtaXQgXCJMb2FkRW5kXCIsIEBzb3VyY2VcblxuXHRcdFx0XHRcdCMgQXV0b3BsYXkgY29udHJvbFxuXHRcdFx0XHRcdGlmIEBhdXRvcGxheSBpcyB0cnVlXG5cdFx0XHRcdFx0XHRAcGxheSgpXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQsKChlKSAtPiBwcmludCBcIkVycm9yIHdpdGggZGVjb2RpbmcgYXVkaW8gZGF0YVwiICsgZS5lcnIpKVxuXG5cdCMgXHRcdFx0QHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gPT5cblx0IyBcdFx0XHRcdHByaW50IFhNTEh0dHBSZXF1ZXN0LkRPTkVcblx0IyBcdFx0XHRcdHByaW50IEByZXF1ZXN0LnN0YXR1c1xuXG5cdFx0XHRAcmVxdWVzdC5zZW5kKClcblxuXHRcdGVsc2VcblxuXHRcdFx0QHNvdXJjZSA9IEF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKVxuXHRcdFx0QHNvdXJjZS5idWZmZXIgPSBCdWZmZXJMaXN0W0BvcHRpb25zLnVybF1cblx0XHRcdEBjb25uZWN0KClcblx0XHRcdGlmIEBhdXRvcGxheSBpcyB0cnVlXG5cdFx0XHRcdEBwbGF5KClcblxuXHRwbGF5OiAodGltZSwgb2Zmc2V0LCBkdXJhdGlvbikgPT5cblxuXHRcdGlmIEBsb2FkaW5nID09IHRydWVcblxuXHRcdFx0cHJpbnQgXCJFcnJvcjogY2FuJ3QgcGxheSB1bnRpbCBzb3VyY2UgaXMgbG9hZGVkXCJcblxuXHRcdFx0cmV0dXJuIHRoaXNcblxuXHRcdGlmIEBwYXVzZWQgaXMgdHJ1ZVxuXG5cdFx0XHRAb3B0aW9ucy5hdXRvcGxheSA9IGZhbHNlXG5cdFx0XHRjaGFpbiA9IG5ldyBBdWRpb0FQSSAoQG9wdGlvbnMpXG5cdFx0XHRjaGFpbi5wbGF5KEF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSwgQHBsYXllZE9mZnNldCsoQHBhdXNlZFdoZW4tQHBsYXllZFdoZW4pLCBAcGxheWVkRHVyYXRpb24tKEBwYXVzZWRXaGVuLUBwbGF5ZWRXaGVuKSlcblxuXHRcdFx0cmV0dXJuIGNoYWluXG5cblx0XHRlbHNlXG5cblx0XHRcdHRpbWUgPz0gQXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lXG5cdFx0XHRvZmZzZXQgPz0gMFxuXHRcdFx0ZHVyYXRpb24gPz0gQHNvdXJjZS5idWZmZXIuZHVyYXRpb25cblxuXHRcdFx0IyBXZSBrZWVwIHRoZXNlIHZhbHVlcyB0byBiZSBhYmxlIHRvIHJlc3VtZSBhdWRpb1xuXHRcdFx0WyBAcGxheWVkV2hlbiwgQHBsYXllZE9mZnNldCwgQHBsYXllZER1cmF0aW9uIF0gPSBbIHRpbWUsIG9mZnNldCwgZHVyYXRpb24gXVxuXG5cdFx0XHRpZiBAcGxheWVkIGlzIGZhbHNlXG5cblx0XHRcdFx0QHBsYXllZCA9IHRydWVcblxuXHRcdFx0XHRAc291cmNlLmFkZEV2ZW50TGlzdGVuZXIgJ2VuZGVkJyAsIChldmVudCkgPT5cblx0XHRcdFx0XHRAZW5kZWQgPSB0cnVlXG5cdFx0XHRcdFx0QGVtaXQgXCJQbGF5YmFja0VuZFwiLCBAc291cmNlXG5cblx0XHRcdFx0QHNvdXJjZS5zdGFydCh0aW1lLCBvZmZzZXQsIGR1cmF0aW9uKVxuXG5cdFx0XHRcdHJldHVybiB0aGlzXG5cblx0XHRcdGVsc2VcblxuXHRcdFx0XHQjIEFuIGF1ZGlvIHNvdXJjZSBjYW4gb25seSBiZSBwbGF5ZWQgb25jZVxuXHRcdFx0XHQjIEEgbmV3IEF1ZGlvQVBJIGhhcyB0byBiZSBjcmVhdGVkXG5cblx0XHRcdFx0IyBXZSBkaXNhYmxlIGF1dG9wbGF5XG5cdFx0XHRcdEBvcHRpb25zLmF1dG9wbGF5ID0gZmFsc2VcblxuXHRcdFx0XHQjIE5ldyBBdWRpb0FQSSB3aXRoIHRoZSBzYW1lIG9wdGlvbnNcblx0XHRcdFx0Y2hhaW4gPSBuZXcgQXVkaW9BUEkgKEBvcHRpb25zKVxuXG5cdFx0XHRcdCMgU3RhcnQgYXVkaW9cblx0XHRcdFx0Y2hhaW4ucGxheSh0aW1lLCBvZmZzZXQsIGR1cmF0aW9uKVxuXG5cdFx0XHRcdCMgUmV0dXJuIHRoZSBvYmplY3Qgc28gaXQgY2FuIHRyZWF0ZWQgaW4gdGhlIHByb2dyYW1cblx0XHRcdFx0cmV0dXJuIGNoYWluXG5cblx0c3RvcDogKHRpbWUpID0+XG5cblx0XHR0aW1lID89IDBcblxuXHRcdGlmIEBwbGF5ZWQgaXMgdHJ1ZSBhbmQgQHN0b3BwZWQgaXMgZmFsc2VcblxuXHRcdFx0QHN0b3BwZWQgPSB0cnVlXG5cblx0XHRcdEBzb3VyY2Uuc3RvcCh0aW1lKVxuXG5cdGNsb25lOiA9PlxuXG5cdFx0IyBOZXcgQXVkaW9BUEkgd2l0aCB0aGUgc2FtZSBvcHRpb25zXG5cdFx0Y2hhaW4gPSBuZXcgQXVkaW9BUEkgKEBvcHRpb25zKVxuXG5cdFx0IyBSZXR1cm4gdGhlIG9iamVjdCBzbyBpdCBjYW4gdHJlYXRlZCBpbiB0aGUgcHJvZ3JhbVxuXHRcdHJldHVybiBjaGFpblxuXG5cdGZhZGVUbzogKGNoYWluLCB0aW1lLCBvZmZzZXQsIGR1cmF0aW9uKSA9PlxuXG5cdFx0IyBEZWZhdWx0cyBmb3IgdGhlIHNvdW5kIHRvIGJlIGZhZGVkIHRvXG5cdFx0dGltZSA/PSAwXG5cdFx0b2Zmc2V0ID89IDBcblx0XHRkdXJhdGlvbiA/PSBjaGFpbi5zb3VyY2UuZHVyYXRpb25cblxuXHRcdCMgRmFkZVxuXHRcdEBnYWluTm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKEB2b2x1bWUsIEF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG5cdFx0QGdhaW5Ob2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgQXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKzMpO1xuXHRcdEBzdG9wKEF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSszKVxuXHRcdCMgV2UgY2FwdHVyZSB0aGUgb2JqZWN0IGJhY2sgZm9yIHRob3NlIGNhc2VzIHRoZSBjbGlwIGhhcyB0byBiZSBcInJlbG9hZGVkXCJcblx0XHRjaGFpbiA9IGNoYWluLnBsYXkodGltZSwgb2Zmc2V0LCBkdXJhdGlvbilcblx0XHRjaGFpbi5nYWluTm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKDAsIEF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG5cdFx0Y2hhaW4uZ2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShjaGFpbi52b2x1bWUsIEF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSszKTtcblxuXHRcdHJldHVybiBjaGFpblxuXG5cdHBhdXNlOiA9PlxuXG5cdFx0aWYgQHBhdXNlZCBpcyBmYWxzZVxuXG5cdFx0XHRAc3RvcCgpXG5cdFx0XHRAcGF1c2VkPXRydWVcblx0XHRcdEBwYXVzZWRXaGVuPUF1ZGlvQ29udGV4dC5jdXJyZW50VGltZVxuXG5cdGZhZGVPdXQ6ICh0aW1lLCBkdXJhdGlvbikgLT5cblxuXHRcdHRpbWUgPz0gQXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lXG5cdFx0ZHVyYXRpb24gPz0gM1xuXG5cdFx0QGdhaW5Ob2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUoQHZvbHVtZSwgdGltZSk7XG5cdFx0QGdhaW5Ob2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgdGltZStkdXJhdGlvbik7XG5cdFx0QHN0b3AodGltZStkdXJhdGlvbilcblxuXHRmYWRlSW46ICh0aW1lLCBkdXJhdGlvbikgLT5cblxuXHRcdHRpbWUgPz0gQXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lXG5cdFx0ZHVyYXRpb24gPz0gM1xuXG5cdFx0QGdhaW5Ob2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdGltZSk7XG5cdFx0QGdhaW5Ob2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoQHZvbHVtZSwgdGltZStkdXJhdGlvbik7XG5cdFx0Y2hhaW4gPSBAcGxheSh0aW1lKVxuXG5cdFx0cmV0dXJuIGNoYWluXG5cblx0b25Mb2FkRW5kOiAoc291cmNlKSAtPiBAb24gXCJMb2FkRW5kXCIsIHNvdXJjZVxuXG5cdG9uUGxheWJhY2tFbmQ6IChzb3VyY2UpIC0+IEBvbiBcIlBsYXliYWNrRW5kXCIsIHNvdXJjZVxuXG5cdEBkZWZpbmUgJ2F1dG9wbGF5Jyxcblx0XHRnZXQ6IC0+XG5cdFx0XHRAb3B0aW9ucy5hdXRvcGxheVxuXG5cdEBkZWZpbmUgJ2xvb3AnLFxuXHRcdGdldDogLT5cblx0XHRcdEBvcHRpb25zLmxvb3Bcblx0XHRzZXQ6ICh2YWx1ZSkgLT5cblx0XHRcdEBvcHRpb25zLmxvb3AgPSB2YWx1ZVxuXG5cdEBkZWZpbmUgJ25hbWUnLFxuXHRcdGdldDogLT5cblx0XHRcdEBvcHRpb25zLm5hbWVcblx0XHRzZXQ6ICh2YWx1ZSkgLT5cblx0XHRcdEBvcHRpb25zLm5hbWUgPSB2YWx1ZVxuXG5cdEBkZWZpbmUgJ3Bhbm5lcicsXG5cdFx0Z2V0OiAtPlxuXHRcdFx0QG9wdGlvbnMucGFubmVyXG5cdFx0c2V0OiAodmFsdWUpIC0+XG5cdFx0XHRAb3B0aW9ucy5wYW5uZXIgPSB2YWx1ZVxuXG5cdEBkZWZpbmUgJ3NwZWVkJyxcblx0XHRnZXQ6IC0+XG5cdFx0XHRAb3B0aW9ucy5zcGVlZFxuXHRcdHNldDogKHZhbHVlKSAtPlxuXHRcdFx0QG9wdGlvbnMuc3BlZWQgPSB2YWx1ZVxuXG5cdFx0XHRpZiBAc291cmNlIGlzbnQgdW5kZWZpbmVkXG5cdFx0XHRcdEBzb3VyY2UucGxheWJhY2tSYXRlLnZhbHVlID0gQG9wdGlvbnMuc3BlZWRcblxuXHRAZGVmaW5lICd1cmwnLFxuXHRcdGdldDogLT5cblx0XHRcdEBvcHRpb25zLnVybFxuXG5cdEBkZWZpbmUgJ3ZvbHVtZScsXG5cdFx0Z2V0OiAtPlxuXHRcdFx0QG9wdGlvbnMudm9sdW1lXG5cdFx0c2V0OiAodmFsdWUpIC0+XG5cdFx0XHRAb3B0aW9ucy52b2x1bWUgPSB2YWx1ZVxuXG5cdFx0XHRpZiBAZ2Fpbk5vZGUgaXNudCB1bmRlZmluZWRcblx0XHRcdFx0QGdhaW5Ob2RlLmdhaW4udmFsdWUgPSBAb3B0aW9ucy52b2x1bWVcblxuXHRAZGVmaW5lICdjdXJyZW50VGltZScsXG5cdFx0Z2V0OiAtPlxuXHRcdFx0QXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lXG5cblx0c3RvcEFsbDogLT5cblxuXHRcdGZvciBvYmogaW4gT2JqZWN0TGlzdFxuXG5cdFx0XHRvYmouc3RvcCgpXG5cblx0XHRPYmplY3RMaXN0ID0gW11cblxubW9kdWxlLmV4cG9ydHMgPSBBdWRpb0FQSVxuIiwiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFFQUE7QURBQSxJQUFBLDhDQUFBO0VBQUE7Ozs7QUFBQSxZQUFBLEdBQW1CLElBQUEsQ0FBQyxNQUFNLENBQUMsWUFBUCxJQUF1QixNQUFNLENBQUMsa0JBQS9CLENBQUEsQ0FBQTs7QUFFbkIsVUFBQSxHQUFhOztBQUViLFVBQUEsR0FBYTs7QUFFUDs7O3FCQUVMLEdBQUEsR0FBSzs7cUJBRUwsTUFBQSxHQUFROztxQkFFUixRQUFBLEdBQVU7O3FCQUVWLFVBQUEsR0FBWTs7cUJBRVosT0FBQSxHQUFTOztxQkFFVCxLQUFBLEdBQU87O3FCQUVQLE1BQUEsR0FBUTs7cUJBRVIsT0FBQSxHQUFTOztxQkFFVCxNQUFBLEdBQVE7O3FCQUVSLFVBQUEsR0FBWTs7cUJBRVosWUFBQSxHQUFjOztxQkFFZCxjQUFBLEdBQWdCOztxQkFFaEIsTUFBQSxHQUFROztxQkFFUixVQUFBLEdBQVk7O3FCQUVaLE9BQUEsR0FBUzs7RUFFSSxrQkFBQyxPQUFEO0FBRVosUUFBQTtJQUZhLElBQUMsQ0FBQSw0QkFBRCxVQUFTOzs7Ozs7OztVQUVkLENBQUMsV0FBWTs7O1dBQ2IsQ0FBQyxPQUFROzs7V0FDVCxDQUFDLE9BQVE7OztXQUNULENBQUMsU0FBVTs7O1dBQ1gsQ0FBQyxRQUFTOzs7V0FDVixDQUFDLE1BQU87OztXQUNSLENBQUMsU0FBVTs7SUFHbkIsSUFBQyxDQUFBLElBQUQsQ0FB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
