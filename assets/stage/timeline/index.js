window.SLM = window.SLM || {};

window.SLM['stage/timeline/index.js'] = window.SLM['stage/timeline/index.js'] || function () {
  const _exports = {};
  const Swiper = window['swiper']['default'];
  const { Pagination } = window['swiper'];
  const { registrySectionConstructor } = window['SLM']['theme-shared/utils/sectionsLoad/index.js'];
  const isMobile = window['SLM']['commons/utils/isMobile.js'].default;
  Swiper.use([Pagination]);

  class TimelineSection {
    constructor($container) {
      this.swipers = [];
      this.$container = $container;
      this.initSwipers();
      this.addMobileClassTag();
    }

    initSwipers() {
      const $swiperContainers = this.$container.find('.timeline-swiper');
      const swiperOptions = {
        allowTouchMove: false,
        virtualTranslate: true,
        loop: false,
        pagination: {
          el: '.swiper-pagination',
          bulletActiveClass: 'swiper-pagination-bullet-active body1 ls-20p',
          clickable: true,

          renderBullet(index, className) {
            const {
              slides
            } = this;
            const slide = slides[index];
            let tab = index + 1;

            if (slide && slide.dataset && slide.dataset.tab) {
              tab = slide.dataset.tab;
            }

            return `<span class="${className}">${tab}</span>`;
          }

        },
        on: {
          slideChange(swiper) {
            const bullet = swiper.pagination.bullets[swiper.activeIndex];

            if (bullet) {
              bullet.scrollIntoViewIfNeeded();
            }
          }

        }
      };

      if ($swiperContainers.length) {
        $swiperContainers.each((index, elem) => {
          this.swipers.push(new Swiper(elem, swiperOptions));
        });
      }
    }

    addMobileClassTag() {
      setTimeout(() => {
        if (isMobile()) {
          $('[data-section-type="timeline"]').each((_, el) => {
            $(el).parents('.shopline-section').addClass('timeline-mobile-section');
          });
        }
      }, 0);
    }

  }

  _exports.default = TimelineSection;
  TimelineSection.type = 'timeline';
  registrySectionConstructor('timeline', TimelineSection);
  return _exports;
}();