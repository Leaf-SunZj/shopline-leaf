window.SLM = window.SLM || {};

window.SLM['stage/video-slideshow/index.js'] = window.SLM['stage/video-slideshow/index.js'] || function () {
  const _exports = {};
  const { registrySectionConstructor } = window['SLM']['theme-shared/utils/sectionsLoad/index.js'];
  const VideoSlide = window['SLM']['stage/video-slideshow/video/index.js'].default;
  registrySectionConstructor(VideoSlide.type, VideoSlide);
  return _exports;
}();