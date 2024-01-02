window.SLM = window.SLM || {};

window.SLM['stage/video-slideshow/video/VideoController.js'] = window.SLM['stage/video-slideshow/video/VideoController.js'] || function () {
  const _exports = {};
  const { validator, log } = window['SLM']['stage/video-slideshow/video/utils/validator.js'];
  const sdkMaps = {};

  class VideoController {
    constructor({
      plugins,
      sectionId,
      $on
    }) {
      this.customEvents = {};
      this.videoInsMaps = {};
      validator(sectionId, ['string', 'number'], 'sectionId', true);

      for (let i = 0; i < plugins.length; i++) {
        const sdk = plugins[i];

        if (sdk && sdk.install) {
          const sdkName = sdk.type || '';
          sdkMaps[sdkName] = sdk;
          continue;
        }

        log(`${sdk.name} plugin miss install function `);
      }

      if ($on) this.customEvents = $on;
      this.usePlugins();
    }

    usePlugins() {
      Object.keys(sdkMaps).map(key => sdkMaps[key].install());
    }

    getVideoInfo(type, url) {
      validator(type, 'string', 'type', true);

      if (sdkMaps[type]) {
        return sdkMaps[type].getVideoInfo(url);
      }
    }

    createVideo({
      $el,
      type,
      videoId,
      blockId,
      idx,
      $wrapper,
      hasCover,
      ...options
    }) {
      validator($el, 'object', '$el', true);
      validator($wrapper, 'object', '$wrapper', false);
      validator(type, 'string', 'type', true);
      validator(videoId, ['string', 'number'], 'videoId', true);
      validator(blockId, 'string', 'blockId', false);
      validator(idx, ['string', 'number'], 'idx', false);
      validator(options, 'object', 'options', false);
      validator(hasCover, 'boolean', 'hasCover', true);
      this.player = new sdkMaps[type]({
        $el,
        $wrapper,
        videoId,
        events: this.customEvents,
        idx,
        hasCover,
        ...options
      });
      this.videoInsMaps[`video-${blockId}-${idx}`] = this.player;
    }

    findVideo(id) {
      if (!id) return;
      const ins = this.videoInsMaps[id];
      return ins;
    }

    playVideo(blockId, idx) {
      const id = `video-${blockId}-${idx}`;
      const ins = this.findVideo(id);

      if (ins && ins.playVideo) {
        ins.playVideo();
        return;
      }

      log(`Cannot find the ${id} instance or instance method. playVideo`);
    }

    pauseVideo(blockId, idx) {
      const id = `video-${blockId}-${idx}`;
      const ins = this.findVideo(id);

      if (ins && ins.pauseVideo) {
        ins.pauseVideo();
        return;
      }

      log(`Cannot find the ${id} instance or instance method. pauseVideo`);
    }

    muteVideo(blockId, idx) {
      const id = `video-${blockId}-${idx}`;
      const ins = this.findVideo(id);

      if (ins && ins.muteVideo) {
        ins.muteVideo();
        return;
      }

      log(`Cannot find the ${id} instance or instance method. muteVideo`);
    }

    unMuteVideo(blockId, idx) {
      const id = `video-${blockId}-${idx}`;
      const ins = this.findVideo(id);

      if (ins && ins.unMuteVideo) {
        ins.unMuteVideo();
        return;
      }

      log(`Cannot find the ${id} instance or instance method. unMuteVideo`);
    }

    destroy() {
      Object.keys(this.videoInsMaps).forEach(id => {
        this.videoInsMaps[id] && this.videoInsMaps[id].destroy();
      });
    }

  }

  _exports.default = VideoController;
  return _exports;
}();