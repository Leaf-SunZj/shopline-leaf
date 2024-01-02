window.SLM = window.SLM || {};

window.SLM['stage/collection-list/index.js'] = window.SLM['stage/collection-list/index.js'] || function () {
  const _exports = {};
  const Swiper = window['swiper']['default'];
  const { Navigation, Pagination } = window['swiper'];
  const { registrySectionConstructor } = window['SLM']['theme-shared/utils/sectionsLoad/index.js'];
  const isMobile = window['SLM']['commons/utils/isMobile.js'].default;
  Swiper.use([Navigation, Pagination]);
  const selectors = {
    slide: '.collection-item-slide',
    prevBtn: 'prev-pagination-btn',
    nextBtn: 'next-pagination-btn'
  };
  const rowsSelectors = {
    slide: '.collection-item-slide',
    pagination: '.colletionlist__group__pagination'
  };

  class CollectionListSection {
    constructor(container) {
      this.container = null;
      this.settings = {};
      this.sectionId = '';
      if (!container.find(selectors.slide).length) return;
      this.container = container;
      this.sectionId = container.data('section-id');
      this.gridHorizontalSpace = container.data('grid-horizontal-space');

      try {
        this.settings = JSON.parse($(`#collectionList-data-${this.sectionId}`).text());
      } catch (err) {}

      this.renderSwiper();
      const {
        slice_in_mobile,
        m_rows
      } = this.settings;

      if (slice_in_mobile && m_rows >= 2 && isMobile()) {
        this.renderRowsSwiper();
      }
    }

    renderSwiper() {
      const {
        slice_in_mobile,
        m_cols,
        pc_cols
      } = this.settings;
      let mbSlidesPerView = 1;

      if (slice_in_mobile) {
        mbSlidesPerView = m_cols * 1 + 0.4;
      }

      this.swiper = new Swiper(`.colletionlist-swiper-${this.sectionId}`, {
        navigation: {
          nextEl: `#swiper-button-next-${this.sectionId}`,
          prevEl: `#swiper-button-prev-${this.sectionId}`
        },
        watchOverflow: true,
        resizeObserver: true,
        slidesPerView: mbSlidesPerView,
        slidesPerGroup: 1,
        slideClass: 'collection-item-slide',
        breakpoints: {
          751: {
            slidesPerView: pc_cols
          }
        }
      });
    }

    renderRowsSwiper() {
      const swiperDom = this.container.find(`.colletionlist__group-${this.sectionId}`);
      this.rowSwiper = new Swiper(swiperDom[0], {
        initialSlide: 0,
        pagination: {
          el: rowsSelectors.pagination,
          clickable: true
        },
        slidesPerView: 1,
        slidesPerGroup: 1,
        slideClass: 'collection-item-slide'
      });
    }

    onUnload() {
      this.swiper && this.swiper.destroy();
      this.rowSwiper && this.rowSwiper.destroy();
    }

  }

  registrySectionConstructor('collection-list', CollectionListSection);
  return _exports;
}();