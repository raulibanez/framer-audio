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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWVyLm1vZHVsZXMuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1VzZXJzL3JhdWwvR2l0L2ZyYW1lci1hdWRpby9leGFtcGxlcy9GcmFtZXJBdWRpb0FQSS5mcmFtZXIvbW9kdWxlcy9teU1vZHVsZS5jb2ZmZWUiLCIuLi8uLi8uLi8uLi8uLi9Vc2Vycy9yYXVsL0dpdC9mcmFtZXItYXVkaW8vZXhhbXBsZXMvRnJhbWVyQXVkaW9BUEkuZnJhbWVyL21vZHVsZXMvQXVkaW9BUEkuY29mZmVlIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIjIEFkZCB0aGUgZm9sbG93aW5nIGxpbmUgdG8geW91ciBwcm9qZWN0IGluIEZyYW1lciBTdHVkaW8uIFxuIyBteU1vZHVsZSA9IHJlcXVpcmUgXCJteU1vZHVsZVwiXG4jIFJlZmVyZW5jZSB0aGUgY29udGVudHMgYnkgbmFtZSwgbGlrZSBteU1vZHVsZS5teUZ1bmN0aW9uKCkgb3IgbXlNb2R1bGUubXlWYXJcblxuZXhwb3J0cy5teVZhciA9IFwibXlWYXJpYWJsZVwiXG5cbmV4cG9ydHMubXlGdW5jdGlvbiA9IC0+XG5cdHByaW50IFwibXlGdW5jdGlvbiBpcyBydW5uaW5nXCJcblxuZXhwb3J0cy5teUFycmF5ID0gWzEsIDIsIDNdIiwiQXVkaW9Db250ZXh0ID0gbmV3ICh3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQpKCk7XG5cbk9iamVjdExpc3QgPSBbXVxuXG5CdWZmZXJMaXN0ID0gW11cblxuY2xhc3MgQXVkaW9BUEkgZXh0ZW5kcyBGcmFtZXIuQmFzZUNsYXNzXG5cblx0YXBpOiB1bmRlZmluZWRcblxuXHRzb3VyY2U6IHVuZGVmaW5lZFxuXG5cdGdhaW5Ob2RlOiB1bmRlZmluZWRcblxuXHRwYW5uZXJOb2RlOiB1bmRlZmluZWRcblxuXHRyZXF1ZXN0OiB1bmRlZmluZWRcblxuXHRlbmRlZDogZmFsc2VcblxuXHRsb2FkZWQ6IGZhbHNlXG5cblx0bG9hZGluZzogZmFsc2VcblxuXHRwbGF5ZWQ6IGZhbHNlXG5cblx0cGxheWVkV2hlbjogMFxuXG5cdHBsYXllZE9mZnNldDogMFxuXG5cdHBsYXllZER1cmF0aW9uOiAwXG5cblx0cGF1c2VkOiBmYWxzZVxuXG5cdHBhdXNlZFdoZW46IDBcblxuXHRzdG9wcGVkOiBmYWxzZVxuXG5cdGNvbnN0cnVjdG9yOiAoQG9wdGlvbnM9e30pIC0+XG5cblx0XHRAb3B0aW9ucy5hdXRvcGxheSA/PSBmYWxzZVxuXHRcdEBvcHRpb25zLmxvb3AgPz0gZmFsc2Vcblx0XHRAb3B0aW9ucy5uYW1lID89IFwiXCJcblx0XHRAb3B0aW9ucy5wYW5uZXIgPz0gZmFsc2Vcblx0XHRAb3B0aW9ucy5zcGVlZCA/PSAxXG5cdFx0QG9wdGlvbnMudXJsID89IFwiXCJcblx0XHRAb3B0aW9ucy52b2x1bWUgPz0gMVxuXG5cdFx0IyBMb2FkIFVSTCBpbnRvIGJ1ZmZlclxuXHRcdEBsb2FkKClcblxuXHRcdCMgQWRkIHRoaXMgdG8gdGhlIE9iamVjdExpc3QgYXJyYXlOZXh0XG5cdFx0T2JqZWN0TGlzdC5wdXNoIEBcblxuXHQjIFNldHVwIG5vZGVzIHRvIGJ1aWxkIGNoYWluXG5cdGNvbm5lY3Q6IC0+XG5cblx0XHRAZ2Fpbk5vZGUgPSBBdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuXG5cdFx0QHNvdXJjZS5jb25uZWN0KEBnYWluTm9kZSlcblxuXHRcdEBnYWluTm9kZS5jb25uZWN0KEF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbilcblxuXHRcdCMgUHJvcGVydGllc1xuXHRcdEBzb3VyY2UucGxheWJhY2tSYXRlLnZhbHVlID0gQG9wdGlvbnMuc3BlZWRcblx0XHRAZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IEBvcHRpb25zLnZvbHVtZVxuXHRcdEBzb3VyY2UubG9vcD1AbG9vcFxuXG5cdGxvYWQ6ID0+XG5cblx0XHRpZiBCdWZmZXJMaXN0W0BvcHRpb25zLnVybF0gaXMgdW5kZWZpbmVkXG5cblx0XHRcdEBsb2FkaW5nID0gdHJ1ZVxuXG5cdFx0XHRAc291cmNlID0gQXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG5cdFx0XHRAcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cblx0XHRcdEByZXF1ZXN0Lm9wZW4oXCJHRVRcIiwgQHVybCwgdHJ1ZSlcblxuXHRcdFx0QHJlcXVlc3QucmVzcG9uc2VUeXBlID0gXCJhcnJheWJ1ZmZlclwiXG5cblx0XHRcdEByZXF1ZXN0Lm9ubG9hZCA9ID0+XG5cdFx0XHRcdEF1ZGlvQ29udGV4dC5kZWNvZGVBdWRpb0RhdGEoQHJlcXVlc3QucmVzcG9uc2UsKChidWZmZXIpID0+XG5cblx0XHRcdFx0XHQjICBBY3R1YWwgZGF0YSBzdHJlYW1cblx0XHRcdFx0XHRAc291cmNlLmJ1ZmZlciA9IGJ1ZmZlclxuXG5cdFx0XHRcdFx0IyBXZSBrZWVwIHRoZSBidWZmZXJzIGluIGFuIGFycmF5IGZvciByZXVzZVxuXHRcdFx0XHRcdEJ1ZmZlckxpc3RbQG9wdGlvbnMudXJsXSA9IEBzb3VyY2UuYnVmZmVyXG5cblx0XHRcdFx0XHQjIFNldHVwIGNoYWluXG5cdFx0XHRcdFx0QGNvbm5lY3QoKVxuXG5cdFx0XHRcdFx0IyBGbGFnIGNvbnRyb2xcblx0XHRcdFx0XHRAbG9hZGVkID0gdHJ1ZVxuXHRcdFx0XHRcdEBsb2FkaW5nID0gZmFsc2Vcblx0XHRcdFx0XHRAZW1pdCBcIkxvYWRFbmRcIiwgQHNvdXJjZVxuXG5cdFx0XHRcdFx0IyBBdXRvcGxheSBjb250cm9sXG5cdFx0XHRcdFx0aWYgQGF1dG9wbGF5IGlzIHRydWVcblx0XHRcdFx0XHRcdEBwbGF5KClcblx0XHRcdFx0XHQpXG5cdFx0XHRcdCwoKGUpIC0+IHByaW50IFwiRXJyb3Igd2l0aCBkZWNvZGluZyBhdWRpbyBkYXRhXCIgKyBlLmVycikpXG5cblx0IyBcdFx0XHRAcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSA9PlxuXHQjIFx0XHRcdFx0cHJpbnQgWE1MSHR0cFJlcXVlc3QuRE9ORVxuXHQjIFx0XHRcdFx0cHJpbnQgQHJlcXVlc3Quc3RhdHVzXG5cblx0XHRcdEByZXF1ZXN0LnNlbmQoKVxuXG5cdFx0ZWxzZVxuXG5cdFx0XHRAc291cmNlID0gQXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG5cdFx0XHRAc291cmNlLmJ1ZmZlciA9IEJ1ZmZlckxpc3RbQG9wdGlvbnMudXJsXVxuXHRcdFx0QGNvbm5lY3QoKVxuXHRcdFx0aWYgQGF1dG9wbGF5IGlzIHRydWVcblx0XHRcdFx0QHBsYXkoKVxuXG5cdHBsYXk6ICh0aW1lLCBvZmZzZXQsIGR1cmF0aW9uKSA9PlxuXG5cdFx0aWYgQGxvYWRpbmcgPT0gdHJ1ZVxuXG5cdFx0XHRwcmludCBcIkVycm9yOiBjYW4ndCBwbGF5IHVudGlsIHNvdXJjZSBpcyBsb2FkZWRcIlxuXG5cdFx0XHRyZXR1cm4gdGhpc1xuXG5cdFx0aWYgQHBhdXNlZCBpcyB0cnVlXG5cblx0XHRcdEBvcHRpb25zLmF1dG9wbGF5ID0gZmFsc2Vcblx0XHRcdGNoYWluID0gbmV3IEF1ZGlvQVBJIChAb3B0aW9ucylcblx0XHRcdGNoYWluLnBsYXkoQXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lLCBAcGxheWVkT2Zmc2V0KyhAcGF1c2VkV2hlbi1AcGxheWVkV2hlbiksIEBwbGF5ZWREdXJhdGlvbi0oQHBhdXNlZFdoZW4tQHBsYXllZFdoZW4pKVxuXG5cdFx0XHRyZXR1cm4gY2hhaW5cblxuXHRcdGVsc2VcblxuXHRcdFx0dGltZSA/PSBBdWRpb0NvbnRleHQuY3VycmVudFRpbWVcblx0XHRcdG9mZnNldCA/PSAwXG5cdFx0XHRkdXJhdGlvbiA/PSBAc291cmNlLmJ1ZmZlci5kdXJhdGlvblxuXG5cdFx0XHQjIFdlIGtlZXAgdGhlc2UgdmFsdWVzIHRvIGJlIGFibGUgdG8gcmVzdW1lIGF1ZGlvXG5cdFx0XHRbIEBwbGF5ZWRXaGVuLCBAcGxheWVkT2Zmc2V0LCBAcGxheWVkRHVyYXRpb24gXSA9IFsgdGltZSwgb2Zmc2V0LCBkdXJhdGlvbiBdXG5cblx0XHRcdGlmIEBwbGF5ZWQgaXMgZmFsc2VcblxuXHRcdFx0XHRAcGxheWVkID0gdHJ1ZVxuXG5cdFx0XHRcdEBzb3VyY2UuYWRkRXZlbnRMaXN0ZW5lciAnZW5kZWQnICwgKGV2ZW50KSA9PlxuXHRcdFx0XHRcdEBlbmRlZCA9IHRydWVcblx0XHRcdFx0XHRAZW1pdCBcIlBsYXliYWNrRW5kXCIsIEBzb3VyY2VcblxuXHRcdFx0XHRAc291cmNlLnN0YXJ0KHRpbWUsIG9mZnNldCwgZHVyYXRpb24pXG5cblx0XHRcdFx0cmV0dXJuIHRoaXNcblxuXHRcdFx0ZWxzZVxuXG5cdFx0XHRcdCMgQW4gYXVkaW8gc291cmNlIGNhbiBvbmx5IGJlIHBsYXllZCBvbmNlXG5cdFx0XHRcdCMgQSBuZXcgQXVkaW9BUEkgaGFzIHRvIGJlIGNyZWF0ZWRcblxuXHRcdFx0XHQjIFdlIGZvcmNlIGF1dG9wbGF5XG5cdFx0XHRcdEBvcHRpb25zLmF1dG9wbGF5ID0gdHJ1ZVxuXG5cdFx0XHRcdCMgTmV3IEF1ZGlvQVBJIHdpdGggdGhlIHNhbWUgb3B0aW9uc1xuXHRcdFx0XHRjaGFpbiA9IG5ldyBBdWRpb0FQSSAoQG9wdGlvbnMpXG5cblx0XHRcdFx0IyBSZXR1cm4gdGhlIG9iamVjdCBzbyBpdCBjYW4gdHJlYXRlZCBpbiB0aGUgcHJvZ3JhbVxuXHRcdFx0XHRyZXR1cm4gY2hhaW5cblxuXHRzdG9wOiAodGltZSkgPT5cblxuXHRcdHRpbWUgPz0gMFxuXG5cdFx0aWYgQHBsYXllZCBpcyB0cnVlIGFuZCBAc3RvcHBlZCBpcyBmYWxzZVxuXG5cdFx0XHRAc3RvcHBlZCA9IHRydWVcblxuXHRcdFx0QHNvdXJjZS5zdG9wKHRpbWUpXG5cblx0Y2xvbmU6ID0+XG5cblx0XHQjIE5ldyBBdWRpb0FQSSB3aXRoIHRoZSBzYW1lIG9wdGlvbnNcblx0XHRjaGFpbiA9IG5ldyBBdWRpb0FQSSAoQG9wdGlvbnMpXG5cblx0XHQjIFJldHVybiB0aGUgb2JqZWN0IHNvIGl0IGNhbiB0cmVhdGVkIGluIHRoZSBwcm9ncmFtXG5cdFx0cmV0dXJuIGNoYWluXG5cblx0ZmFkZVRvOiAoY2hhaW4sIHRpbWUsIG9mZnNldCwgZHVyYXRpb24pID0+XG5cblx0XHQjIERlZmF1bHRzIGZvciB0aGUgc291bmQgdG8gYmUgZmFkZWQgdG9cblx0XHR0aW1lID89IDBcblx0XHRvZmZzZXQgPz0gMFxuXHRcdGR1cmF0aW9uID89IGNoYWluLnNvdXJjZS5kdXJhdGlvblxuXG5cdFx0IyBGYWRlXG5cdFx0QGdhaW5Ob2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUoQHZvbHVtZSwgQXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcblx0XHRAZ2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBBdWRpb0NvbnRleHQuY3VycmVudFRpbWUrMyk7XG5cdFx0QHN0b3AoQXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKzMpXG5cdFx0IyBXZSBjYXB0dXJlIHRoZSBvYmplY3QgYmFjayBmb3IgdGhvc2UgY2FzZXMgdGhlIGNsaXAgaGFzIHRvIGJlIFwicmVsb2FkZWRcIlxuXHRcdGNoYWluID0gY2hhaW4ucGxheSh0aW1lLCBvZmZzZXQsIGR1cmF0aW9uKVxuXHRcdGNoYWluLmdhaW5Ob2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgQXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcblx0XHRjaGFpbi5nYWluTm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKGNoYWluLnZvbHVtZSwgQXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKzMpO1xuXG5cdFx0cmV0dXJuIGNoYWluXG5cblx0cGF1c2U6ID0+XG5cblx0XHRpZiBAcGF1c2VkIGlzIGZhbHNlXG5cblx0XHRcdEBzdG9wKClcblx0XHRcdEBwYXVzZWQ9dHJ1ZVxuXHRcdFx0QHBhdXNlZFdoZW49QXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lXG5cblx0ZmFkZU91dDogKHRpbWUsIGR1cmF0aW9uKSAtPlxuXG5cdFx0dGltZSA/PSBBdWRpb0NvbnRleHQuY3VycmVudFRpbWVcblx0XHRkdXJhdGlvbiA/PSAzXG5cblx0XHRAZ2Fpbk5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZShAdm9sdW1lLCB0aW1lKTtcblx0XHRAZ2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCB0aW1lK2R1cmF0aW9uKTtcblx0XHRAc3RvcCh0aW1lK2R1cmF0aW9uKVxuXG5cdGZhZGVJbjogKHRpbWUsIGR1cmF0aW9uKSAtPlxuXG5cdFx0dGltZSA/PSBBdWRpb0NvbnRleHQuY3VycmVudFRpbWVcblx0XHRkdXJhdGlvbiA/PSAzXG5cblx0XHRAZ2Fpbk5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0aW1lKTtcblx0XHRAZ2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShAdm9sdW1lLCB0aW1lK2R1cmF0aW9uKTtcblx0XHRjaGFpbiA9IEBwbGF5KHRpbWUpXG5cblx0XHRyZXR1cm4gY2hhaW5cblxuXHRvbkxvYWRFbmQ6IChzb3VyY2UpIC0+IEBvbiBcIkxvYWRFbmRcIiwgc291cmNlXG5cblx0b25QbGF5YmFja0VuZDogKHNvdXJjZSkgLT4gQG9uIFwiUGxheWJhY2tFbmRcIiwgc291cmNlXG5cblx0QGRlZmluZSAnYXV0b3BsYXknLFxuXHRcdGdldDogLT5cblx0XHRcdEBvcHRpb25zLmF1dG9wbGF5XG5cblx0QGRlZmluZSAnbG9vcCcsXG5cdFx0Z2V0OiAtPlxuXHRcdFx0QG9wdGlvbnMubG9vcFxuXHRcdHNldDogKHZhbHVlKSAtPlxuXHRcdFx0QG9wdGlvbnMubG9vcCA9IHZhbHVlXG5cblx0QGRlZmluZSAnbmFtZScsXG5cdFx0Z2V0OiAtPlxuXHRcdFx0QG9wdGlvbnMubmFtZVxuXHRcdHNldDogKHZhbHVlKSAtPlxuXHRcdFx0QG9wdGlvbnMubmFtZSA9IHZhbHVlXG5cblx0QGRlZmluZSAncGFubmVyJyxcblx0XHRnZXQ6IC0+XG5cdFx0XHRAb3B0aW9ucy5wYW5uZXJcblx0XHRzZXQ6ICh2YWx1ZSkgLT5cblx0XHRcdEBvcHRpb25zLnBhbm5lciA9IHZhbHVlXG5cblx0QGRlZmluZSAnc3BlZWQnLFxuXHRcdGdldDogLT5cblx0XHRcdEBvcHRpb25zLnNwZWVkXG5cdFx0c2V0OiAodmFsdWUpIC0+XG5cdFx0XHRAb3B0aW9ucy5zcGVlZCA9IHZhbHVlXG5cblx0XHRcdGlmIEBzb3VyY2UgaXNudCB1bmRlZmluZWRcblx0XHRcdFx0QHNvdXJjZS5wbGF5YmFja1JhdGUudmFsdWUgPSBAb3B0aW9ucy5zcGVlZFxuXG5cdEBkZWZpbmUgJ3VybCcsXG5cdFx0Z2V0OiAtPlxuXHRcdFx0QG9wdGlvbnMudXJsXG5cblx0QGRlZmluZSAndm9sdW1lJyxcblx0XHRnZXQ6IC0+XG5cdFx0XHRAb3B0aW9ucy52b2x1bWVcblx0XHRzZXQ6ICh2YWx1ZSkgLT5cblx0XHRcdEBvcHRpb25zLnZvbHVtZSA9IHZhbHVlXG5cblx0XHRcdGlmIEBnYWluTm9kZSBpc250IHVuZGVmaW5lZFxuXHRcdFx0XHRAZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IEBvcHRpb25zLnZvbHVtZVxuXG5cdEBkZWZpbmUgJ2N1cnJlbnRUaW1lJyxcblx0XHRnZXQ6IC0+XG5cdFx0XHRBdWRpb0NvbnRleHQuY3VycmVudFRpbWVcblxuXHRzdG9wQWxsOiAtPlxuXG5cdFx0Zm9yIG9iaiBpbiBPYmplY3RMaXN0XG5cblx0XHRcdG9iai5zdG9wKClcblxuXHRcdE9iamVjdExpc3QgPSBbXVxuXG5tb2R1bGUuZXhwb3J0cyA9IEF1ZGlvQVBJXG4iLCIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUVBQTtBREFBLElBQUEsOENBQUE7RUFBQTs7OztBQUFBLFlBQUEsR0FBbUIsSUFBQSxDQUFDLE1BQU0sQ0FBQyxZQUFQLElBQXVCLE1BQU0sQ0FBQyxrQkFBL0IsQ0FBQSxDQUFBOztBQUVuQixVQUFBLEdBQWE7O0FBRWIsVUFBQSxHQUFhOztBQUVQOzs7cUJBRUwsR0FBQSxHQUFLOztxQkFFTCxNQUFBLEdBQVE7O3FCQUVSLFFBQUEsR0FBVTs7cUJBRVYsVUFBQSxHQUFZOztxQkFFWixPQUFBLEdBQVM7O3FCQUVULEtBQUEsR0FBTzs7cUJBRVAsTUFBQSxHQUFROztxQkFFUixPQUFBLEdBQVM7O3FCQUVULE1BQUEsR0FBUTs7cUJBRVIsVUFBQSxHQUFZOztxQkFFWixZQUFBLEdBQWM7O3FCQUVkLGNBQUEsR0FBZ0I7O3FCQUVoQixNQUFBLEdBQVE7O3FCQUVSLFVBQUEsR0FBWTs7cUJBRVosT0FBQSxHQUFTOztFQUVJLGtCQUFDLE9BQUQ7QUFFWixRQUFBO0lBRmEsSUFBQyxDQUFBLDRCQUFELFVBQVM7Ozs7Ozs7O1VBRWQsQ0FBQyxXQUFZOzs7V0FDYixDQUFDLE9BQVE7OztXQUNULENBQUMsT0FBUTs7O1dBQ1QsQ0FBQyxTQUFVOzs7V0FDWCxDQUFDLFFBQVM7OztXQUNWLENBQUMsTUFBTzs7O1dBQ1IsQ0FBQyxTQUFVOztJQUduQixJQUFDLENBQUEsSUFBRCxDQUFBO0lBR0EsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsSUFBaEI7RUFkWTs7cUJBaUJiLE9BQUEsR0FBUyxTQUFBO0lBRVIsSUFB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
