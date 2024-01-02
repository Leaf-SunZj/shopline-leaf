window.SLM = window.SLM || {};

window.SLM['stage/video-slideshow/video/index.js'] = window.SLM['stage/video-slideshow/video/index.js'] || function () {
  const _exports = {};
  const Swiper = window['swiper']['default'];
  const { Navigation, Pagination, Autoplay, Keyboard } = window['swiper'];
  const EffectFlickityFade = window['SLM']['commons/swiper/effect-flickity-fade.js'].default;
  const throttle = window['SLM']['commons/utils/throttle.js'].default;
  const AutoplayChecker = window['SLM']['commons/video/AutoplayChecker.js'].default;
  const VideoController = window['SLM']['stage/video-slideshow/video/VideoController.js'].default;
  const YouTube = window['SLM']['stage/video-slideshow/video/sdk/YouTube.js'].default;
  const Vimeo = window['SLM']['stage/video-slideshow/video/sdk/VimeoPlayer.js'].default;
  const playerState = window['SLM']['stage/video-slideshow/video/constant/state.js'].default;
  const assessBackgroundVideo = window['SLM']['stage/video-slideshow/video/utils/initBackground.js'].default;
  Swiper.use([EffectFlickityFade, Navigation, Pagination, Autoplay, Keyboard]);
  const SLIDE_ACTIVE_CLASS = 'is-selected';
  const selectors = {
    flickityViewport: '.flickity-viewport',
    image: '.hero__image',
    imageWrapper: '.hero__image-wrapper',
    imageMobile: '.hero__image--mobile',
    slide: '.slideshow__slide'
  };
  const classes = {
    parallaxContainer: 'parallax-container',
    parallax: 'parallax',
    isNatural: 'is-natural',
    isNaturalMobile: 'is-natural-mobile',
    playing: 'video--playing'
  };

  class VideoSlideshow {
    constructor(container) {
      this.swiper = null;
      this.videoController = null;
      this.container = container;
      this.sectionId = container.data('section-id');

      try {
        this.settings = JSON.parse($(`#VideoSlide-data-${this.sectionId}`).text());
        this.blocks = JSON.parse($(`#VideoSlide-data-block-${this.sectionId}`).text());
      } catch (err) {}

      this.init();
    }

    init() {
      const {
        container,
        sectionId,
        settings
      } = this;
      const slides = container.find(selectors.slide);
      const self = this;

      if (slides.length === 0) {
        return;
      }

      const swiperOptions = {
        grabCursor: true,
        enabled: slides.length > 1,
        speed: 0,
        effect: 'flickity-fade',
        slideActiveClass: SLIDE_ACTIVE_CLASS,
        wrapperClass: 'flickity-slider',
        virtualTranslate: true,
        delay: 2000,
        keyboard: {
          enabled: true
        },
        on: {
          click(swiper, event) {
            const {
              activeIndex
            } = swiper;
            const prevEl = $('.flickity-button--prev .flickity-button__icon', container)[0];
            const nextEl = $('.flickity-button--next .flickity-button__icon', container)[0];
            const len = swiper.slides.length;

            if (prevEl && event.target.contains(prevEl) && swiper.activeIndex === 0) {
              setTimeout(() => {
                swiper.slideTo(len - 1, 0);
              }, 200);
              return;
            }

            if (nextEl && event.target.contains(nextEl) && len - 1 === activeIndex) {
              setTimeout(() => {
                swiper.slideTo(0, 0);
              }, 200);
              return;
            }

            const activeBlockId = $(swiper.slides[swiper.activeIndex]).data('id');
            const activeBlockType = $(swiper.slides[swiper.activeIndex]).data('type');
            const activeIdx = swiper.activeIndex;
            const autoplayChecker = AutoplayChecker.getInstance();

            if (autoplayChecker.completed && autoplayChecker.supportState) {
              const {
                autoplay
              } = autoplayChecker.supportState;

              if (!autoplay) {
                if (activeBlockType === 'video' && $(swiper.slides[swiper.activeIndex]).find('.video-data')) {
                  self.videoController.playVideo(activeBlockId, activeIdx);
                }
              }
            }
          },

          slideChange(swiper) {
            const activeBlockId = $(swiper.slides[swiper.activeIndex]).data('id');
            const previousBlockId = $(swiper.slides[swiper.previousIndex]).data('id');
            const activeBlockType = $(swiper.slides[swiper.activeIndex]).data('type');
            const previousBlockType = $(swiper.slides[swiper.previousIndex]).data('type');
            const activeIdx = swiper.activeIndex;
            const previousIdx = swiper.previousIndex;
            if (activeBlockId === previousBlockId) return;

            if (previousBlockType === 'video' && $(swiper.slides[swiper.previousIndex]).find('.video-data')) {
              self.videoController.pauseVideo(previousBlockId, previousIdx);
            }

            if (activeBlockType === 'video' && $(swiper.slides[swiper.activeIndex]).find('.video-data')) {
              self.videoController.playVideo(activeBlockId, activeIdx);
            }
          },

          slideChangeTransitionStart() {
            this.$el.removeClass('hero--static');
          },

          init() {
            this.$el.removeClass('hero--static');
          },

          afterInit() {
            window.SL_EventBus.emit('parallax');
          }

        }
      };

      if (settings.autoplay) {
        Object.assign(swiperOptions, {
          autoplay: {
            disableOnInteraction: false,
            delay: settings.autoplay_speed * 1000
          }
        });
      }

      switch (settings.style) {
        case 'arrows':
          Object.assign(swiperOptions, {
            navigation: {
              nextEl: '.flickity-button--next',
              prevEl: '.flickity-button--prev'
            }
          });
          break;

        case 'dots':
        case 'bars':
          Object.assign(swiperOptions, {
            pagination: {
              el: '.swiper-pagination',
              clickable: true
            }
          });
          break;

        default:
          break;
      }

      this.videoController = new VideoController({
        plugins: [YouTube, Vimeo],
        $on: {
          onReady(_, videoData) {
            const {
              $wrapper,
              aspectRatio
            } = videoData;
            const createBackground = throttle(100, assessBackgroundVideo.bind($wrapper, aspectRatio), true);
            createBackground();
            window.addEventListener('resize', createBackground);
          },

          onStateChange(state, el) {
            if (state === playerState.buffering || state === playerState.ended) {
              el.removeClass(classes.playing);
            }

            if (state === playerState.playing) {
              el.addClass(classes.playing);
            }
          },

          autoplayFail(videoMeidaData, el) {
            const fallCover = el.find('.video__fallback-cover');

            if (fallCover.length) {
              fallCover.css({
                backgroundImage: `url(${videoMeidaData.thumbnail_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              });
              fallCover.removeClass('hide');
            }
          },

          onError(event, videoMeidaData, el) {
            const fallCover = el.find('.video__fallback-cover');

            if (fallCover.length) {
              fallCover.css({
                backgroundImage: `url(${videoMeidaData.thumbnail_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              });
              fallCover.removeClass('hide');
            }
          }

        }
      });
      this.swiper = new Swiper(`#Slideshow-${sectionId}`, swiperOptions);
      const width = 640;
      const height = 360;

      for (let i = 0; i < slides.length; i++) {
        const el = slides[i];
        const wrapper = $(el).find('.video-data');
        const idx = i;
        assessBackgroundVideo.call($(el).find('.video-crop-window'), width / height);

        if (wrapper.length) {
          const blockId = wrapper.attr('block-id');
          const videoId = wrapper.data('video-id');
          const type = wrapper.data('type');
          const muted = wrapper.data('quiet');
          const isFirstBlock = i === 0;
          const hasCover = wrapper.data('has-cover');
          this.videoController.createVideo({
            $el: wrapper[0],
            $wrapper: $(el).find('.video-crop-window'),
            type,
            videoId,
            blockId,
            idx,
            loop: true,
            controls: false,
            autoplay: isFirstBlock,
            muted,
            width,
            height,
            hasCover
          });
        }
      }

      const $flickityViewport = container.find(selectors.flickityViewport);

      if ($flickityViewport.hasClass(classes.isNatural)) {
        const $image = container.find(`[data-swiper-slide-index="0"]`).find(selectors.image).eq(0);
        if ($image.data('aspectratio')) return;
        const src = $image.data('aspectratio-url');
        const image = new Image();
        image.src = src;

        image.onload = e => {
          const {
            target
          } = e;
          const aspectRatio = target.height / target.width * 100;
          $flickityViewport.prepend($('<style />').text(`
          @media only screen and (min-width: 769px) {
            .natural--${sectionId} {
              padding-top: ${aspectRatio}% !important;
            }
          }
        `));
        };
      }

      if ($flickityViewport.hasClass(classes.isNaturalMobile)) {
        const $mobileImage = container.find(selectors.imageMobile);
        let src = $mobileImage.data('aspectratio-url');
        if ($mobileImage.data('aspectratio')) return;

        if (!src) {
          const $pcImage = container.find(`[data-swiper-slide-index="0"]`).find(selectors.image).eq(0);
          if ($pcImage.data('aspectratio')) return;
          src = $pcImage.data('aspectratio-url');
        }

        if (!src) return;
        const image = new Image();
        image.src = src;

        image.onload = e => {
          const {
            target
          } = e;
          const aspectRatio = target.height / target.width * 100;
          $flickityViewport.prepend($('<style />').text(`
          @media only screen and (max-width: 768px) {
            .natural-mobile--${sectionId} {
              padding-top: ${aspectRatio}% !important;
            }
          }
        `));
        };
      }

      this.swiper.on('transitionEnd', this.handleSwiperTransitionEnd);
    }

    handleSwiperTransitionEnd() {}

    onUnload() {
      if (this.swiper) {
        this.swiper.off('transitionEnd', this.handleSwiperTransitionEnd);
        this.swiper.destroy();
        this.swiper = null;
      }

      if (this.videoController) {
        this.videoController.destroy();
        this.videoController = null;
      }
    }

  }

  VideoSlideshow.type = 'video-slideshow';
  _exports.default = VideoSlideshow;
  return _exports;
}();