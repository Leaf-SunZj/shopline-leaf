window.SLM = window.SLM || {};

window.SLM['stage/text-with-video/index.js'] = window.SLM['stage/text-with-video/index.js'] || function () {
  const _exports = {};
  const { registrySectionConstructor } = window['SLM']['theme-shared/utils/sectionsLoad/index.js'];
  const Video = window['SLM']['stage/video/utils/video.js'].default;

  class TextWithVideo {
    constructor(container) {
      const sectionId = container.data('section-id');
      const $video = container.find(`.video--${sectionId}`);
      if (!$video.length) return;
      const settings = JSON.parse($video.find(`#Video-data-${sectionId}`).text());
      const videoUrl = settings.video_url;

      if (!videoUrl) {
        return;
      }

      this.instance = new Video($video, {
        clickCallback: () => {
          container.find('.video__controll').toggleClass('d-none', false);
        }
      });
    }

    onUnload() {
      this.instance && this.instance.onUnload();
    }

  }

  TextWithVideo.type = 'text-with-video';
  registrySectionConstructor(TextWithVideo.type, TextWithVideo);
  return _exports;
}();