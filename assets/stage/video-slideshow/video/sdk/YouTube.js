window.SLM = window.SLM || {};

window.SLM['stage/video-slideshow/video/sdk/YouTube.js'] = window.SLM['stage/video-slideshow/video/sdk/YouTube.js'] || function () {
  const _exports = {};
  const axios = window['axios']['default'];
  const merge = window['lodash']['merge'];
  const LibraryLoader = window['SLM']['commons/video/LibraryLoader.js'].default;
  const YoutubeReadyWatcher = window['SLM']['commons/video/YoutubeReadyWatcher.js'].default;
  const BaseSdk = window['SLM']['stage/video-slideshow/video/sdk/Base.js'].default;
  const playerState = window['SLM']['stage/video-slideshow/video/constant/state.js'].default;
  const { log } = window['SLM']['stage/video-slideshow/video/utils/validator.js'];
  const AutoplayChecker = window['SLM']['commons/video/AutoplayChecker.js'].default;

  function defaultVideoOptions() {
    return {
      ratio: 16 / 9,
      scrollAnimationDuration: 400,
      playerVars: {
        autohide: 0,
        autoplay: undefined,
        cc_load_policy: 0,
        controls: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        disablekb: 1,
        muted: 1,
        showinfo: 0,
        origin: window.location.origin
      },
      host: `${window.location.protocol}//www.youtube.com`
    };
  }

  let ytReadyWatcher = null;
  let autoplayChecker = null;

  class YouTube extends BaseSdk {
    constructor({
      $el,
      $wrapper,
      events,
      idx,
      ...options
    }) {
      super();
      this.player = null;
      this.options = {};
      this.events = {};
      this.container = null;
      this.videoNodeData = {};
      this.videoMeidaData = null;
      this.loopTimer = null;
      this.autoPlayChecker = null;
      this.wrapperContainer = null;
      this.videoNodeData.idx = idx;
      this.videoNodeData.$wrapper = $wrapper;
      this.container = $el;
      this.wrapperContainer = $wrapper;

      for (const key in options) {
        const val = options[key];
        options[key] = this.transNumToBoolean(val);
      }

      if (options.playerVars) {
        for (const key in options.playerVars) {
          const val = options.playerVars[key];
          options.playerVars[key] = this.transNumToBoolean(val);
        }
      }

      const transOptions = this.initPlayerVars(options);
      const mergeOptions = merge(defaultVideoOptions(), transOptions);
      const newEvents = this.initEvents(merge(events, mergeOptions.$on));
      delete mergeOptions.events;
      this.events = merge(events, mergeOptions.$on);
      this.options = { ...mergeOptions,
        events: newEvents
      };

      if (ytReadyWatcher && ytReadyWatcher.ready) {
        this.init();
      } else {
        LibraryLoader.load('youtubeSdk');
        window.SL_EventBus.on('stage:youTubeReady', this.init.bind(this));
      }

      if (!this.options.hasCover && this.options.autoplay) {
        if (autoplayChecker && autoplayChecker.completed) {
          this.handleAutoplayFail(autoplayChecker.supportState);
        } else {
          window.SL_EventBus.on('stage:checkAutoplayComplete', this.handleAutoplayFail.bind(this));
        }
      }
    }

    init() {
      new window.YT.Player(this.container, { ...this.options
      });
    }

    async _getVideoInfo() {
      if (!this.videoMeidaData) {
        const res = await YouTube.getVideoInfo(`https://www.youtube.com/watch?v=${this.options.videoId}`);

        if (res && res.data) {
          return this.videoMeidaData = res.data;
        }

        return;
      }

      return this.videoMeidaData;
    }

    async handleAutoplayFail(supportState) {
      if (!supportState.autoplay) {
        const videoMeidaData = await this._getVideoInfo();

        if (videoMeidaData) {
          this.events.autoplayFail(videoMeidaData, this.wrapperContainer);
        }
      }
    }

    transNumToBoolean(value) {
      if (value !== undefined && typeof value === 'boolean') {
        return value ? 1 : 0;
      }

      return value;
    }

    initPlayerVars(options) {
      const {
        width,
        height,
        videoId,
        playerVars,
        muted,
        useRealRatio,
        $on,
        autoplay,
        hasCover,
        ...others
      } = options;
      const opts = {
        width,
        height,
        videoId,
        muted,
        $on,
        autoplay,
        useRealRatio,
        hasCover,
        playerVars: { ...playerVars,
          ...others
        }
      };
      const newOpts = {};

      for (const key in opts) {
        const val = opts[key];
        if (val) newOpts[key] = val;
      }

      if (opts.playerVars.loop) {
        opts.playerVars.playlist = `${videoId}`;
      }

      return newOpts;
    }

    initEvents(events = {}) {
      const self = this;
      return {
        async onReady(e) {
          self.player = e.target;
          let videoSize = self.player.getSize();

          if (self.options.width && self.options.height) {
            videoSize = {
              width: self.options.width,
              height: self.options.height
            };
          }

          self.videoNodeData = { ...videoSize,
            ...self.videoNodeData
          };
          const {
            muted,
            speed,
            quality
          } = self.options;

          if (muted !== undefined) {
            if (muted || self.options.autoplay) {
              self.player.mute();
            } else {
              self.player.unMute();
            }
          }

          if (self.options.autoplay) {
            self.player.mute();
            self.player.playVideo();
          }

          self.videoNodeData.aspectRatio = self.videoNodeData.width / self.videoNodeData.height;

          if (self.options.useRealRatio) {
            const videoMediaData = await self._getVideoInfo.call(self);

            if (videoMediaData) {
              self.videoNodeData.aspectRatio = videoMediaData.width / videoMediaData.height;
            }
          }

          if (events.onReady) events.onReady(e, self.videoNodeData);

          if (speed) {
            self.player.setPlaybackRate(speed);
          }

          if (quality) {
            self.player.setPlaybackQuality(quality);
          }
        },

        onStateChange(event) {
          let status = '';

          switch (event.data) {
            case 1:
              status = playerState.playing;
              break;

            case 2:
              status = playerState.paused;
              break;

            case 3:
              status = playerState.buffering;
              break;

            case -1:
              status = playerState.ended;
              break;

            default:
              status = playerState.ended;
          }

          if (status === playerState.playing && self.options.playerVars.loop) {
            clearTimeout(self.loopTimer);
            const finalSecond = event.target.getDuration() - 1;

            if (finalSecond > 2) {
              function loopTheVideo() {
                if (event.target.getCurrentTime() > finalSecond) {
                  event.target.seekTo(0);
                }

                self.loopTimer = setTimeout(loopTheVideo, 500);
              }

              loopTheVideo();
            }
          }

          if (status === playerState.paused && self.loopTimer) {
            clearTimeout(self.loopTimer);
          }

          if (events.onStateChange) events.onStateChange(status, self.wrapperContainer);
        },

        async onError(event) {
          if (!self.options.hasCover) {
            const videoMediaData = await self._getVideoInfo();

            if (videoMediaData) {
              events.onError(event, videoMediaData, self.$wrapper);
            }
          }
        }

      };
    }

    playVideo() {
      if (this.player) this.player.playVideo();
    }

    muteVideo() {
      this.player && this.player.mute();
    }

    pauseVideo() {
      if (this.player) this.player.pauseVideo();
    }

    unMuteVideo() {
      this.player && this.player.unMute();
    }

    destroy() {
      this.player && this.player.destroy();
    }

  }

  YouTube.type = 'youtube';

  YouTube.install = function () {
    ytReadyWatcher = YoutubeReadyWatcher.getInstance();
    autoplayChecker = AutoplayChecker.getInstance();
  };

  YouTube.getVideoInfo = async url => {
    return new Promise(r => {
      axios.get(`https://www.youtube.com/oembed?url=${url}&format=json`).then(res => {
        if (res.status === 200 || res.status === 206) {
          r(res);
        } else {
          r();
        }
      }).catch(err => {
        log(err);
        r();
      });
    });
  };

  _exports.default = YouTube;
  return _exports;
}();