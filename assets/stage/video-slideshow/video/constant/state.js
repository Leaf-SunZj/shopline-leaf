window.SLM = window.SLM || {};

window.SLM['stage/video-slideshow/video/constant/state.js'] = window.SLM['stage/video-slideshow/video/constant/state.js'] || function () {
  const _exports = {};
  const playerState = {
    ended: 'ENDED',
    playing: 'PLAYING',
    paused: 'PAUSED',
    buffering: 'BUFFERING'
  };
  _exports.default = playerState;
  return _exports;
}();