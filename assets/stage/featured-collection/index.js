window.SLM = window.SLM || {};

window.SLM['stage/featured-collection/index.js'] = window.SLM['stage/featured-collection/index.js'] || function () {
  const _exports = {};
  const Swiper = window['swiper']['default'];
  const { Navigation } = window['swiper'];
  const { registrySectionConstructor } = window['SLM']['theme-shared/utils/sectionsLoad/index.js'];
  Swiper.use([Navigation]);
  const selectors = {
    slide: '.featured-collection-item-slide',
    prevBtn: 'prev-pagination-btn',
    nextBtn: 'next-pagination-btn'
  };

  class FeatureCollectionSection {
    constructor(container) {
      this.container = null;
      this.settings = {};
      this.sectionId = '';
      if (!container.find(selectors.slide).length) return;
      this.container = container;
      this.sectionId = container.data('section-id');
      this.gridHorizontalSpace = container.data('grid-horizontal-space');

      try {
        this.settings = JSON.parse($(`#featuredCollection-data-${this.sectionId}`).text());
      } catch (err) {}

      this.renderSwiper();
    }

    renderSwiper() {
      const {
        slice_in_mobile,
        md_cols,
        pc_cols,
        slice_in_pc_style
      } = this.settings;
      let mbSlidesPerView = 1;

      if (slice_in_mobile) {
        mbSlidesPerView = +md_cols + md_cols * 0.1;
      }

      const that = this;
      this.swiper = new Swiper(`.featured-collection-swiper-${this.sectionId}`, {
        navigation: {
          nextEl: `#swiper-button-next-${this.sectionId}`,
          prevEl: `#swiper-button-prev-${this.sectionId}`
        },
        watchOverflow: true,
        resizeObserver: true,
        slidesPerView: mbSlidesPerView,
        slidesPerGroup: 1,
        setWrapperSize: true,
        slideClass: 'product-slide',
        slidesOffsetAfter: 0,
        slidesOffsetBefore: 0,
        breakpoints: {
          751: {
            slidesPerView: pc_cols,
            speed: 1000,
            initialSlide: slice_in_pc_style === 'right_blank' ? this.container.find(selectors.slide).length - 1 : 0
          }
        },
        on: {
          init(swiper) {
            that.container.on('mouseover mouseleave', '.product-slide', () => {
              that.swiper.updateSize();
            });

            if (swiper.slides.length > 0) {
              const slideHeight = swiper.slides[0].offsetHeight;
              const top = (slideHeight - 40) / 2;
              that.container.find('.stage-featured-collection__arrow').css({
                top: `${top}px`
              });
            }
          }

        }
      });
    }

    onUnload() {
      this.swiper && this.swiper.destroy();
    }

  }

  registrySectionConstructor('featured-collection', FeatureCollectionSection);
  return _exports;
}();