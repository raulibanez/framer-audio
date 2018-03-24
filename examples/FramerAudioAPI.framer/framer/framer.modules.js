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
        this.options.autoplay = true;
        chain = new AudioAPI(this.options);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWVyLm1vZHVsZXMuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1VzZXJzL3JhdWwvR2l0L2ZyYW1lci1hdWRpby9leGFtcGxlcy9GcmFtZXJBdWRpb0FQSS5mcmFtZXIvbW9kdWxlcy9teU1vZHVsZS5jb2ZmZWUiLCIuLi8uLi8uLi8uLi8uLi9Vc2Vycy9yYXVsL0dpdC9mcmFtZXItYXVkaW8vZXhhbXBsZXMvRnJhbWVyQXVkaW9BUEkuZnJhbWVyL21vZHVsZXMvQXVkaW9BUEkuY29mZmVlIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIjIEFkZCB0aGUgZm9sbG93aW5nIGxpbmUgdG8geW91ciBwcm9qZWN0IGluIEZyYW1lciBTdHVkaW8uIFxuIyBteU1vZHVsZSA9IHJlcXVpcmUgXCJteU1vZHVsZVwiXG4jIFJlZmVyZW5jZSB0aGUgY29udGVudHMgYnkgbmFtZSwgbGlrZSBteU1vZHVsZS5teUZ1bmN0aW9uKCkgb3IgbXlNb2R1bGUubXlWYXJcblxuZXhwb3J0cy5teVZhciA9IFwibXlWYXJpYWJsZVwiXG5cbmV4cG9ydHMubXlGdW5jdGlvbiA9IC0+XG5cdHByaW50IFwibXlGdW5jdGlvbiBpcyBydW5uaW5nXCJcblxuZXhwb3J0cy5teUFycmF5ID0gWzEsIDIsIDNdIiwiQXVkaW9Db250ZXh0ID0gbmV3ICh3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQpKCk7XG5cbk9iamVjdExpc3QgPSBbXVxuXG5CdWZmZXJMaXN0ID0gW11cblxuY2xhc3MgQXVkaW9BUEkgZXh0ZW5kcyBGcmFtZXIuQmFzZUNsYXNzXG5cblx0YXBpOiB1bmRlZmluZWRcblxuXHRzb3VyY2U6IHVuZGVmaW5lZFxuXG5cdGdhaW5Ob2RlOiB1bmRlZmluZWRcblxuXHRwYW5uZXJOb2RlOiB1bmRlZmluZWRcblxuXHRyZXF1ZXN0OiB1bmRlZmluZWRcblxuXHRlbmRlZDogZmFsc2VcblxuXHRsb2FkZWQ6IGZhbHNlXG5cblx0bG9hZGluZzogZmFsc2VcblxuXHRwbGF5ZWQ6IGZhbHNlXG5cblx0cGxheWVkV2hlbjogMFxuXG5cdHBsYXllZE9mZnNldDogMFxuXG5cdHBsYXllZER1cmF0aW9uOiAwXG5cblx0cGF1c2VkOiBmYWxzZVxuXG5cdHBhdXNlZFdoZW46IDBcblxuXHRzdG9wcGVkOiBmYWxzZVxuXG5cdGNvbnN0cnVjdG9yOiAoQG9wdGlvbnM9e30pIC0+XG5cblx0XHRAb3B0aW9ucy5hdXRvcGxheSA/PSBmYWxzZVxuXHRcdEBvcHRpb25zLmxvb3AgPz0gZmFsc2Vcblx0XHRAb3B0aW9ucy5uYW1lID89IFwiXCJcblx0XHRAb3B0aW9ucy5wYW5uZXIgPz0gZmFsc2Vcblx0XHRAb3B0aW9ucy5zcGVlZCA/PSAxXG5cdFx0QG9wdGlvbnMudXJsID89IFwiXCJcblx0XHRAb3B0aW9ucy52b2x1bWUgPz0gMVxuXG5cdFx0IyBMb2FkIFVSTCBpbnRvIGJ1ZmZlclxuXHRcdEBsb2FkKClcblxuXHRcdCMgQWRkIHRoaXMgdG8gdGhlIE9iamVjdExpc3QgYXJyYXlOZXh0XG5cdFx0T2JqZWN0TGlzdC5wdXNoIEBcblxuXG5cdCMgU2V0dXAgbm9kZXMgdG8gYnVpbGQgY2hhaW5cblx0Y29ubmVjdDogLT5cblxuXHRcdEBnYWluTm9kZSA9IEF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG5cblx0XHRAc291cmNlLmNvbm5lY3QoQGdhaW5Ob2RlKVxuXG5cdFx0QGdhaW5Ob2RlLmNvbm5lY3QoQXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKVxuXG5cdFx0IyBQcm9wZXJ0aWVzXG5cdFx0QHNvdXJjZS5wbGF5YmFja1JhdGUudmFsdWUgPSBAb3B0aW9ucy5zcGVlZFxuXHRcdEBnYWluTm9kZS5nYWluLnZhbHVlID0gQG9wdGlvbnMudm9sdW1lXG5cdFx0QHNvdXJjZS5sb29wPUBsb29wXG5cblx0bG9hZDogLT5cblxuXHRcdGlmIEJ1ZmZlckxpc3RbQG9wdGlvbnMudXJsXSBpcyB1bmRlZmluZWRcblxuXHRcdFx0QGxvYWRpbmcgPSB0cnVlXG5cblx0XHRcdEBzb3VyY2UgPSBBdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKClcblx0XHRcdEByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblxuXHRcdFx0QHJlcXVlc3Qub3BlbihcIkdFVFwiLCBAdXJsLCB0cnVlKVxuXG5cdFx0XHRAcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBcImFycmF5YnVmZmVyXCJcblxuXHRcdFx0QHJlcXVlc3Qub25sb2FkID0gPT5cblx0XHRcdFx0QXVkaW9Db250ZXh0LmRlY29kZUF1ZGlvRGF0YShAcmVxdWVzdC5yZXNwb25zZSwoKGJ1ZmZlcikgPT5cblxuXHRcdFx0XHRcdCMgIEFjdHVhbCBkYXRhIHN0cmVhbVxuXHRcdFx0XHRcdEBzb3VyY2UuYnVmZmVyID0gYnVmZmVyXG5cblx0XHRcdFx0XHQjIFdlIGtlZXAgdGhlIGJ1ZmZlcnMgaW4gYW4gYXJyYXkgZm9yIHJldXNlXG5cdFx0XHRcdFx0QnVmZmVyTGlzdFtAb3B0aW9ucy51cmxdID0gQHNvdXJjZS5idWZmZXJcblxuXHRcdFx0XHRcdCMgU2V0dXAgY2hhaW5cblx0XHRcdFx0XHRAY29ubmVjdCgpXG5cblx0XHRcdFx0XHRpZiBAYXV0b3BsYXkgaXMgdHJ1ZVxuXHRcdFx0XHRcdFx0QHBsYXkoKVxuXHRcdFx0XHRcdClcblx0XHRcdFx0LCgoZSkgLT4gcHJpbnQgXCJFcnJvciB3aXRoIGRlY29kaW5nIGF1ZGlvIGRhdGFcIiArIGUuZXJyKSlcblxuXHQjIFx0XHRcdEByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9ID0+XG5cdCMgXHRcdFx0XHRwcmludCBYTUxIdHRwUmVxdWVzdC5ET05FXG5cdCMgXHRcdFx0XHRwcmludCBAcmVxdWVzdC5zdGF0dXNcblxuXHRcdFx0QHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lciAnbG9hZGVuZCcgLCAoZXZlbnQpID0+XG5cdFx0XHRcdEBsb2FkZWQgPSB0cnVlXG5cdFx0XHRcdEBsb2FkaW5nID0gZmFsc2Vcblx0XHRcdFx0QGVtaXQgXCJMb2FkRW5kXCIsIEBzb3VyY2VcblxuXHRcdFx0QHJlcXVlc3Quc2VuZCgpXG5cblx0XHRlbHNlXG5cblx0XHRcdEBzb3VyY2UgPSBBdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKClcblx0XHRcdEBzb3VyY2UuYnVmZmVyID0gQnVmZmVyTGlzdFtAb3B0aW9ucy51cmxdXG5cdFx0XHRAY29ubmVjdCgpXG5cdFx0XHRpZiBAYXV0b3BsYXkgaXMgdHJ1ZVxuXHRcdFx0XHRAcGxheSgpXG5cblx0cGxheTogKHRpbWUsIG9mZnNldCwgZHVyYXRpb24pID0+XG5cblx0XHRpZiBAbG9hZGluZyA9PSB0cnVlXG5cblx0XHRcdHByaW50IFwiRXJyb3I6IGNhbid0IHBsYXkgdW50aWwgc291cmNlIGlzIGxvYWRlZFwiXG5cblx0XHRcdHJldHVybiB0aGlzXG5cblx0XHRpZiBAcGF1c2VkIGlzIHRydWVcblxuXHRcdFx0QG9wdGlvbnMuYXV0b3BsYXkgPSBmYWxzZVxuXHRcdFx0Y2hhaW4gPSBuZXcgQXVkaW9BUEkgKEBvcHRpb25zKVxuXHRcdFx0Y2hhaW4ucGxheShBdWRpb0NvbnRleHQuY3VycmVudFRpbWUsIEBwbGF5ZWRPZmZzZXQrKEBwYXVzZWRXaGVuLUBwbGF5ZWRXaGVuKSwgQHBsYXllZER1cmF0aW9uLShAcGF1c2VkV2hlbi1AcGxheWVkV2hlbikpXG5cblx0XHRcdHJldHVybiBjaGFpblxuXG5cdFx0ZWxzZVxuXG5cdFx0XHR0aW1lID89IEF1ZGlvQ29udGV4dC5jdXJyZW50VGltZVxuXHRcdFx0b2Zmc2V0ID89IDBcblx0XHRcdGR1cmF0aW9uID89IEBzb3VyY2UuYnVmZmVyLmR1cmF0aW9uXG5cblx0XHRcdCMgV2Uga2VlcCB0aGVzZSB2YWx1ZXMgdG8gYmUgYWJsZSB0byByZXN1bWUgYXVkaW9cblx0XHRcdFsgQHBsYXllZFdoZW4sIEBwbGF5ZWRPZmZzZXQsIEBwbGF5ZWREdXJhdGlvbiBdID0gWyB0aW1lLCBvZmZzZXQsIGR1cmF0aW9uIF1cblxuXHRcdFx0aWYgQHBsYXllZCBpcyBmYWxzZVxuXG5cdFx0XHRcdEBwbGF5ZWQgPSB0cnVlXG5cblx0XHRcdFx0QHNvdXJjZS5hZGRFdmVudExpc3RlbmVyICdlbmRlZCcgLCAoZXZlbnQpID0+XG5cdFx0XHRcdFx0QGVuZGVkID0gdHJ1ZVxuXHRcdFx0XHRcdEBlbWl0IFwiUGxheWJhY2tFbmRcIiwgQHNvdXJjZVxuXG5cdFx0XHRcdEBzb3VyY2Uuc3RhcnQodGltZSwgb2Zmc2V0LCBkdXJhdGlvbilcblxuXHRcdFx0XHRyZXR1cm4gdGhpc1xuXG5cdFx0XHRlbHNlXG5cblx0XHRcdFx0IyBBbiBhdWRpbyBzb3VyY2UgY2FuIG9ubHkgYmUgcGxheWVkIG9uY2Vcblx0XHRcdFx0IyBBIG5ldyBBdWRpb0FQSSBoYXMgdG8gYmUgY3JlYXRlZFxuXG5cdFx0XHRcdCMgV2UgZm9yY2UgYXV0b3BsYXlcblx0XHRcdFx0QG9wdGlvbnMuYXV0b3BsYXkgPSB0cnVlXG5cblx0XHRcdFx0IyBOZXcgQXVkaW9BUEkgd2l0aCB0aGUgc2FtZSBvcHRpb25zXG5cdFx0XHRcdGNoYWluID0gbmV3IEF1ZGlvQVBJIChAb3B0aW9ucylcblxuXHRcdFx0XHQjIFJldHVybiB0aGUgb2JqZWN0IHNvIGl0IGNhbiB0cmVhdGVkIGluIHRoZSBwcm9ncmFtXG5cdFx0XHRcdHJldHVybiBjaGFpblxuXG5cdHN0b3A6ICh0aW1lKSA9PlxuXG5cdFx0dGltZSA/PSAwXG5cblx0XHRpZiBAcGxheWVkIGlzIHRydWUgYW5kIEBzdG9wcGVkIGlzIGZhbHNlXG5cblx0XHRcdEBzdG9wcGVkID0gdHJ1ZVxuXG5cdFx0XHRAc291cmNlLnN0b3AodGltZSlcblxuXHRjbG9uZTogPT5cblxuXHRcdCMgTmV3IEF1ZGlvQVBJIHdpdGggdGhlIHNhbWUgb3B0aW9uc1xuXHRcdGNoYWluID0gbmV3IEF1ZGlvQVBJIChAb3B0aW9ucylcblxuXHRcdCMgUmV0dXJuIHRoZSBvYmplY3Qgc28gaXQgY2FuIHRyZWF0ZWQgaW4gdGhlIHByb2dyYW1cblx0XHRyZXR1cm4gY2hhaW5cblxuXHRmYWRlVG86IChjaGFpbiwgdGltZSwgb2Zmc2V0LCBkdXJhdGlvbikgPT5cblxuXHRcdCMgRGVmYXVsdHMgZm9yIHRoZSBzb3VuZCB0byBiZSBmYWRlZCB0b1xuXHRcdHRpbWUgPz0gMFxuXHRcdG9mZnNldCA/PSAwXG5cdFx0ZHVyYXRpb24gPz0gY2hhaW4uc291cmNlLmR1cmF0aW9uXG5cblx0XHQjIEZhZGVcblx0XHRAZ2Fpbk5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZShAdm9sdW1lLCBBdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuXHRcdEBnYWluTm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIEF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSszKTtcblx0XHRAc3RvcChBdWRpb0NvbnRleHQuY3VycmVudFRpbWUrMylcblx0XHQjIFdlIGNhcHR1cmUgdGhlIG9iamVjdCBiYWNrIGZvciB0aG9zZSBjYXNlcyB0aGUgY2xpcCBoYXMgdG8gYmUgXCJyZWxvYWRlZFwiXG5cdFx0Y2hhaW4gPSBjaGFpbi5wbGF5KHRpbWUsIG9mZnNldCwgZHVyYXRpb24pXG5cdFx0Y2hhaW4uZ2Fpbk5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCBBdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuXHRcdGNoYWluLmdhaW5Ob2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoY2hhaW4udm9sdW1lLCBBdWRpb0NvbnRleHQuY3VycmVudFRpbWUrMyk7XG5cblx0XHRyZXR1cm4gY2hhaW5cblxuXHRwYXVzZTogPT5cblxuXHRcdGlmIEBwYXVzZWQgaXMgZmFsc2VcblxuXHRcdFx0QHN0b3AoKVxuXHRcdFx0QHBhdXNlZD10cnVlXG5cdFx0XHRAcGF1c2VkV2hlbj1BdWRpb0NvbnRleHQuY3VycmVudFRpbWVcblxuXHRmYWRlT3V0OiAodGltZSwgZHVyYXRpb24pIC0+XG5cblx0XHR0aW1lID89IEF1ZGlvQ29udGV4dC5jdXJyZW50VGltZVxuXHRcdGR1cmF0aW9uID89IDNcblxuXHRcdEBnYWluTm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKEB2b2x1bWUsIHRpbWUpO1xuXHRcdEBnYWluTm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIHRpbWUrZHVyYXRpb24pO1xuXHRcdEBzdG9wKHRpbWUrZHVyYXRpb24pXG5cblx0ZmFkZUluOiAodGltZSwgZHVyYXRpb24pIC0+XG5cblx0XHR0aW1lID89IEF1ZGlvQ29udGV4dC5jdXJyZW50VGltZVxuXHRcdGR1cmF0aW9uID89IDNcblxuXHRcdEBnYWluTm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKDAsIHRpbWUpO1xuXHRcdEBnYWluTm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKEB2b2x1bWUsIHRpbWUrZHVyYXRpb24pO1xuXHRcdGNoYWluID0gQHBsYXkodGltZSlcblxuXHRcdHJldHVybiBjaGFpblxuXG5cdG9uTG9hZEVuZDogKHNvdXJjZSkgLT4gQG9uIFwiTG9hZEVuZFwiLCBzb3VyY2VcblxuXHRvblBsYXliYWNrRW5kOiAoc291cmNlKSAtPiBAb24gXCJQbGF5YmFja0VuZFwiLCBzb3VyY2VcblxuXHRAZGVmaW5lICdhdXRvcGxheScsXG5cdFx0Z2V0OiAtPlxuXHRcdFx0QG9wdGlvbnMuYXV0b3BsYXlcblxuXHRAZGVmaW5lICdsb29wJyxcblx0XHRnZXQ6IC0+XG5cdFx0XHRAb3B0aW9ucy5sb29wXG5cdFx0c2V0OiAodmFsdWUpIC0+XG5cdFx0XHRAb3B0aW9ucy5sb29wID0gdmFsdWVcblxuXHRAZGVmaW5lICduYW1lJyxcblx0XHRnZXQ6IC0+XG5cdFx0XHRAb3B0aW9ucy5uYW1lXG5cdFx0c2V0OiAodmFsdWUpIC0+XG5cdFx0XHRAb3B0aW9ucy5uYW1lID0gdmFsdWVcblxuXHRAZGVmaW5lICdwYW5uZXInLFxuXHRcdGdldDogLT5cblx0XHRcdEBvcHRpb25zLnBhbm5lclxuXHRcdHNldDogKHZhbHVlKSAtPlxuXHRcdFx0QG9wdGlvbnMucGFubmVyID0gdmFsdWVcblxuXHRAZGVmaW5lICdzcGVlZCcsXG5cdFx0Z2V0OiAtPlxuXHRcdFx0QG9wdGlvbnMuc3BlZWRcblx0XHRzZXQ6ICh2YWx1ZSkgLT5cblx0XHRcdEBvcHRpb25zLnNwZWVkID0gdmFsdWVcblxuXHRcdFx0aWYgQHNvdXJjZSBpc250IHVuZGVmaW5lZFxuXHRcdFx0XHRAc291cmNlLnBsYXliYWNrUmF0ZS52YWx1ZSA9IEBvcHRpb25zLnNwZWVkXG5cblx0QGRlZmluZSAndXJsJyxcblx0XHRnZXQ6IC0+XG5cdFx0XHRAb3B0aW9ucy51cmxcblxuXHRAZGVmaW5lICd2b2x1bWUnLFxuXHRcdGdldDogLT5cblx0XHRcdEBvcHRpb25zLnZvbHVtZVxuXHRcdHNldDogKHZhbHVlKSAtPlxuXHRcdFx0QG9wdGlvbnMudm9sdW1lID0gdmFsdWVcblxuXHRcdFx0aWYgQGdhaW5Ob2RlIGlzbnQgdW5kZWZpbmVkXG5cdFx0XHRcdEBnYWluTm9kZS5nYWluLnZhbHVlID0gQG9wdGlvbnMudm9sdW1lXG5cblx0QGRlZmluZSAnY3VycmVudFRpbWUnLFxuXHRcdGdldDogLT5cblx0XHRcdEF1ZGlvQ29udGV4dC5jdXJyZW50VGltZVxuXG5cdHN0b3BBbGw6IC0+XG5cblx0XHRmb3Igb2JqIGluIE9iamVjdExpc3RcblxuXHRcdFx0b2JqLnN0b3AoKVxuXG5cdFx0T2JqZWN0TGlzdCA9IFtdXG5cbm1vZHVsZS5leHBvcnRzID0gQXVkaW9BUElcbiIsIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBRUFBO0FEQUEsSUFBQSw4Q0FBQTtFQUFBOzs7O0FBQUEsWUFBQSxHQUFtQixJQUFBLENBQUMsTUFBTSxDQUFDLFlBQVAsSUFBdUIsTUFBTSxDQUFDLGtCQUEvQixDQUFBLENBQUE7O0FBRW5CLFVBQUEsR0FBYTs7QUFFYixVQUFBLEdBQWE7O0FBRVA7OztxQkFFTCxHQUFBLEdBQUs7O3FCQUVMLE1BQUEsR0FBUTs7cUJBRVIsUUFBQSxHQUFVOztxQkFFVixVQUFBLEdBQVk7O3FCQUVaLE9BQUEsR0FBUzs7cUJBRVQsS0FBQSxHQUFPOztxQkFFUCxNQUFBLEdBQVE7O3FCQUVSLE9BQUEsR0FBUzs7cUJBRVQsTUFBQSxHQUFROztxQkFFUixVQUFBLEdBQVk7O3FCQUVaLFlBQUEsR0FBYzs7cUJBRWQsY0FBQSxHQUFnQjs7cUJBRWhCLE1BQUEsR0FBUTs7cUJBRVIsVUFBQSxHQUFZOztxQkFFWixPQUFBLEdBQVM7O0VBRUksa0JBQUMsT0FBRDtBQUVaLFFBQUE7SUFGYSxJQUFDLENBQUEsNEJBQUQsVUFBUzs7Ozs7OztVQUVkLENBQUMsV0FBWTs7O1dBQ2IsQ0FBQyxPQUFROzs7V0FDVCxDQUFDLE9BQVE7OztXQUNULENBQUMsU0FBVTs7O1dBQ1gsQ0FBQyxRQUFTOzs7V0FDVixDQUFDLE1BQU87OztXQUNSLENBQUMsU0FBVTs7SUFHbkIsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQUdBLFVBQVUsQ0FBQyxJQUFYLENBQWdCLElBQWhCO0VBZFk7O3FCQWtCYixPQUFBLEdBQVMsU0FBQTtJQUVSLElBQUMsQ0FB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
