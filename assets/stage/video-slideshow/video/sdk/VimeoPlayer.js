window.SLM = window.SLM || {};

window.SLM['stage/video-slideshow/video/sdk/VimeoPlayer.js'] = window.SLM['stage/video-slideshow/video/sdk/VimeoPlayer.js'] || function () {
  const _exports = {};
  const axios = window['axios']['default'];
  const merge = window['lodash']['merge'];
  const LibraryLoader = window['SLM']['commons/video/LibraryLoader.js'].default;
  const BaseSdk = window['SLM']['stage/video-slideshow/video/sdk/Base.js'].default;
  const playerState = window['SLM']['stage/video-slideshow/video/constant/state.js'].default;
  const { log } = window['SLM']['stage/video-slideshow/video/utils/validator.js'];
  const AutoplayChecker = window['SLM']['commons/video/AutoplayChecker.js'].default;
  let vimeoReady = false;

  function defaultVideoOptions() {
    return {
      byline: false,
      controls: true,
      loop: false,
      muted: true,
      playsinline: true,
      portrait: false,
      responsive: true,
      transparent: false,
      title: 'vedio',
      autoplay: false,
      autopause: false
    };
  }

  let autoplayChecker = null;

  class VimeoPlayer extends BaseSdk {
    async _getVideoInfo() {
      if (!this.videoMeidaData) {
        const res = await VimeoPlayer.getVideoInfo(`https://vimeo.com/${this.options.videoId}`);

        if (res && res.data) {
          return this.videoMeidaData = res.data;
        }

        return;
      }

      return this.videoMeidaData;
    }

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
      this.wrapperContainer = null;
      this.autoPlayChecker = null;
      this.playerStator = null;
      this.currentWaitingTask = null;
      this.videoNodeData.idx = idx;
      this.videoNodeData.$wrapper = $wrapper;
      this.container = $el;
      this.wrapperContainer = $wrapper;
      const transOptions = this.initPlayerVars(options);
      const mergeOptions = merge(defaultVideoOptions(), transOptions);
      this.events = events;
      this.options = { ...mergeOptions
      };

      if (vimeoReady) {
        this.init();
      } else {
        LibraryLoader.load('vimeo', window.vimeoApiReady);
        window.SL_EventBus.on('stage:vimeoReady', this.init.bind(this));
      }

      if (!this.options.hasCover && this.options.autoplay) {
        if (autoplayChecker && autoplayChecker.completed) {
          this.handleAutoplayFail(autoplayChecker.supportState);
        } else {
          window.SL_EventBus.on('stage:checkAutoplayComplete', this.handleAutoplayFail.bind(this));
        }
      }
    }

    async init() {
      vimeoReady = true;
      const {
        autoplay,
        ...otherOptions
      } = this.options;
      this.player = new window.Vimeo.Player(this.container, otherOptions);
      this.player.ready().then(async () => {
        this.videoNodeData.width = await this.player.getVideoWidth();
        this.videoNodeData.height = await this.player.getVideoHeight();
        this.playerReady(this.player, this.videoNodeData);

        if (autoplay) {
          this.player.setVolume(0);
          this.playerStator = new Promise((rosolve, reject) => {
            this.player.play().then(rosolve).catch(reject).finally(() => {
              this.playerStator = null;
            });
          });
        }
      }).catch(async event => {
        if (!this.options.hasCover) {
          const videoMediaData = await this._getVideoInfo();

          if (videoMediaData) {
            this.events.onError(event, videoMediaData, this.$wrapper);
          }
        }
      });
      if (!this.events.onStateChange) return;
      const {
        onStateChange
      } = this.events;
      this.player.on('play', () => {
        onStateChange(playerState.playing, this.wrapperContainer);
      });
      this.player.on('pause', () => {
        onStateChange(playerState.paused, this.wrapperContainer);
      });
      this.player.on('loaded', () => {
        onStateChange(playerState.buffering, this.wrapperContainer);
      });
    }

    async handleAutoplayFail(supportState) {
      if (!supportState.autoplay) {
        const videoMeidaData = await this._getVideoInfo();

        if (videoMeidaData) {
          this.events.autoplayFail(videoMeidaData, this.wrapperContainer);
        }
      }
    }

    initPlayerVars(options) {
      const {
        width,
        height,
        videoId,
        playerVars,
        muted,
        autoplay,
        $on,
        hasCover,
        ...others
      } = options;
      const opts = {
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
        videoId,
        muted,
        $on,
        id: videoId,
        hasCover,
        autoplay,
        ...others
      };
      const newOpts = {};

      for (const key in opts) {
        const val = opts[key];
        if (val !== undefined) newOpts[key] = val;
      }

      return newOpts;
    }

    playVideo() {
      if (!this.playerStator) {
        this.playerStator = new Promise((rosolve, reject) => {
          this.player.play().then(rosolve).catch(reject).finally(() => {
            this.playerStator = null;
          });
        });
      } else if (this.playerStator && this.currentWaitingTask) {
        this.currentWaitingTask = null;
      }
    }

    muteVideo() {
      this.player.setMuted(true);
    }

    unMuteVideo() {
      this.player.setMuted(false);
    }

    pauseVideo() {
      this.currentWaitingTask = () => {
        this.player.pause();
      };

      if (this.playerStator) {
        this.playerStator.then(() => {
          if (this.currentWaitingTask && typeof this.currentWaitingTask === 'function') {
            this.currentWaitingTask();
          }
        });
      } else {
        this.player.pause();
      }
    }

    destroy() {
      this.player.destroy();
    }

    async playerReady(e, videoNodeData) {
      videoNodeData.aspectRatio = videoNodeData.width / videoNodeData.height;

      if (this.options.useRealRatio) {
        const videoMediaData = await this._getVideoInfo();

        if (videoMediaData) {
          videoNodeData.aspectRatio = videoMediaData.width / videoMediaData.height;
        }
      }

      if (this.events.onReady) {
        this.events.onReady(e, videoNodeData);
      }
    }

  }

  VimeoPlayer.type = 'vimeo';

  VimeoPlayer.install = function () {
    window.vimeoApiReady = function () {
      window.SL_EventBus.emit('stage:vimeoReady');
    };

    autoplayChecker = AutoplayChecker.getInstance();
  };

  VimeoPlayer.getVideoInfo = async url => {
    return new Promise(r => {
      axios.get(`http://vimeo.com/api/oembed.json?url=${url}`).then(res => {
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

  _exports.default = VimeoPlayer;
  return _exports;
}();