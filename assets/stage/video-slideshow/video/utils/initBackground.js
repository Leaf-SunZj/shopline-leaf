window.SLM = window.SLM || {};

window.SLM['stage/video-slideshow/video/utils/initBackground.js'] = window.SLM['stage/video-slideshow/video/utils/initBackground.js'] || function () {
  const _exports = {};
  const selectors = {
    cropWindow: '.video-crop-window',
    background: '.video-background',
    iframe: '.video__slide-controll iframe'
  };

  function assessBackgroundVideo(realRatio) {
    const $container = this;
    const cw = $container.width();
    const ch = $container.height();
    const cr = cw / ch;
    const $frame = $(selectors.iframe, this);
    const vr = realRatio || $frame.attr('width') / $frame.attr('height');
    const $pan = $(selectors.background, this);
    const vCrop = 75;

    if (cr > vr) {
      const vh = cw / vr + vCrop * 2;
      $pan.css({
        marginTop: (ch - vh) / 2 - vCrop,
        marginLeft: '',
        height: vh + vCrop * 2,
        width: ''
      });
    } else {
      const vw = ch * vr + vCrop * 2 * vr;
      $pan.css({
        marginTop: -vCrop,
        marginLeft: (cw - vw) / 2,
        height: ch + vCrop * 2,
        width: vw
      });
    }
  }

  _exports.default = assessBackgroundVideo;
  return _exports;
}();