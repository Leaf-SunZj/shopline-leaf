window.SLM = window.SLM || {};

window.SLM['stage/shoppable-image/index.js'] = window.SLM['stage/shoppable-image/index.js'] || function () {
  const _exports = {};
  const Swiper = window['swiper']['default'];
  const { Lazy } = window['swiper'];
  const { convertFormat } = window['SLM']['theme-shared/utils/newCurrency/CurrencyConvert.js'];
  const { debounce } = window['lodash'];
  const { registrySectionConstructor } = window['SLM']['theme-shared/utils/sectionsLoad/index.js'];
  const { disablePageScroll, enablePageScroll } = window['scroll-lock'];
  const Base = window['SLM']['commons/base/BaseClass.js'].default;
  Swiper.use([Lazy]);

  class ShoppableImage extends Base {
    constructor(container) {
      super();
      this.config = {
        swiperBreakpoint: 750,
        namespace: 'stage:shoppable-image',
        initSlide: 0
      };
      this.container = null;
      this.swiperWrapped = null;
      this.sectionId = '';
      this.swiperActiveIndex = 0;
      this.class = {
        hotpotActive: 'shoppable-image__hotspot-active'
      };
      const sectionId = container.data('section-id');
      this.selectors = {
        containerSelector: '.shoppable-image',
        productSwiperWrapper: '.shoppable-image__swiper-wrapped',
        productSwiper: '.shoppable-image__swiper',
        hotpot: '.shoppable-image__hotspot',
        hotpotActive: '.shoppable-image__hotspot-active',
        mViewProductButton: '.shoppable-image__md-button',
        mDrawerCloseButton: '.shoppable-image__close-button',
        nextEl: `.swiper-button-next-${sectionId}`,
        prevEl: `.swiper-button-prev-${sectionId}`,
        swiperPagination: '.shoppable-image__swiper-pagination'
      };
      this.$setNamespace(`${this.config.namespace}:${sectionId}`);
      this.selectors.containerSelector = `.shoppable-image[data-section-id="${sectionId}"]`;
      this.container = container;
      this.sectionId = sectionId;
      this.swiperWrapped = $(this.container).find(this.selectors.productSwiperWrapper);
      this.config.initSlide = this.swiperWrapped.data('init-slide') || 0;
      this.init();
    }

    initSwiper(options) {
      const swiperSelector = `${this.selectors.containerSelector} ${this.selectors.productSwiper}`;
      const that = this;
      this.swiperInstance = new Swiper(swiperSelector, {
        init: true,
        allowTouchMove: false,
        lazy: {
          loadOnTransitionStart: true
        },
        effect: 'fade',
        fadeEffect: {
          crossFade: true
        },
        on: {
          slideChange() {
            that.swiperActiveIndex = this.realIndex;
            const hotpotDom = $(`${that.selectors.containerSelector} ${that.selectors.hotpot}[data-index=${this.realIndex + 1}]`);
            if (hotpotDom.hasClass(that.class.hotpotActive)) return;
            that.clearActiveHotpot();
            hotpotDom.addClass(that.class.hotpotActive);
          }

        },
        ...options
      });
    }

    swiperResizeHandler(width, swiperOptions) {
      enablePageScroll(this.swiperWrapped.get(0));

      if (width > this.config.swiperBreakpoint) {
        if (this.swiperInstance) this.swiperInstance.destroy();
        this.initSwiper({
          initialSlide: this.swiperActiveIndex,
          navigation: {
            nextEl: this.selectors.nextEl,
            prevEl: this.selectors.prevEl
          },
          ...swiperOptions
        });
        this.swiperWrapped.removeClass('open');
      } else {
        if (this.swiperInstance) this.swiperInstance.destroy();
        this.swiperWrapped.removeClass('open');
        this.initSwiper({
          effect: 'slide',
          pagination: {
            el: `${this.selectors.containerSelector} ${this.selectors.swiperPagination}`,
            clickable: true
          },
          loop: true,
          initialSlide: this.swiperActiveIndex,
          ...swiperOptions
        });
        this.swiperInstance.allowTouchMove = true;
      }
    }

    clearActiveHotpot() {
      this.container.find(this.selectors.hotpot).removeClass(this.class.hotpotActive);
    }

    hotpotClickEventResizeHandler(width) {
      const hotpotActiveStatus = clickDom => {
        if (clickDom.hasClass(this.class.hotpotActive)) return;
        this.clearActiveHotpot();
        clickDom.addClass(this.class.hotpotActive);
      };

      const hotpotClickOpenDrawer = clickIndex => {
        if (this.swiperWrapped.hasClass('open')) {
          this.swiperInstance.slideToLoop(clickIndex - 1);
          return;
        }

        this.swiperWrapped.addClass('open');
        disablePageScroll(this.swiperWrapped.get(0));
        this.swiperInstance.slideToLoop(clickIndex - 1, 0);
      };

      const getClickDom = e => {
        const clickDom = $(e.currentTarget);
        const clickIndex = clickDom.data('index');
        return {
          clickDom,
          clickIndex
        };
      };

      let handle;

      if (width > this.config.swiperBreakpoint) {
        handle = e => {
          const {
            clickDom,
            clickIndex
          } = getClickDom(e);
          hotpotActiveStatus(clickDom);
          this.swiperInstance.slideToLoop(clickIndex - 1);
        };
      } else {
        handle = e => {
          const {
            clickDom,
            clickIndex
          } = getClickDom(e);
          hotpotActiveStatus(clickDom);
          hotpotClickOpenDrawer(clickIndex);
        };
      }

      this.$off(`click`, `${this.selectors.containerSelector} ${this.selectors.hotpot}`);
      this.$on(`click`, `${this.selectors.containerSelector} ${this.selectors.hotpot}`, handle);
    }

    init() {
      this.swiperResizeHandler(window.innerWidth, {
        initialSlide: this.config.initSlide
      });
      this.$win.on('resize', debounce(() => {
        this.swiperResizeHandler(window.innerWidth);
        this.hotpotClickEventResizeHandler(window.innerWidth);
      }, 50));
      this.initClick();
      $(this.selectors.hotpot).mouseenter(function () {
        $(this).addClass('actived');
      }).mouseleave(function () {
        $(this).removeClass('actived');
      });
      window.SL_EventBus.on('global:currency:format', () => {
        this.container.find('.product-tooltip__price .price').each((_, element) => {
          const $element = $(element);
          const priceValue = $element.data('product-price');
          $($element).html(convertFormat(priceValue));
        });
      });
    }

    initClick() {
      this.hotpotClickEventResizeHandler(window.innerWidth);
      this.$on('click', `${this.selectors.containerSelector} ${this.selectors.mViewProductButton}`, () => {
        this.swiperWrapped.addClass('open');
        disablePageScroll(this.swiperWrapped.get(0));
      });

      const closeDrawerHandler = () => {
        this.swiperWrapped.removeClass('open');
        enablePageScroll(this.swiperWrapped.get(0));
      };

      this.$on('click', `${this.selectors.containerSelector} ${this.selectors.mDrawerCloseButton}`, e => {
        e.stopPropagation();
        closeDrawerHandler();
      });
      this.$on('click', `${this.selectors.containerSelector} ${this.selectors.productSwiperWrapper}`, e => {
        if (window.innerWidth > this.config.swiperBreakpoint) return;

        if (e.target === e.currentTarget) {
          e.stopPropagation();
          closeDrawerHandler();
        }
      });
    }

    destroy() {
      if (this.swiperInstance) this.swiperInstance.destroy();
      this.$offAll();
    }

  }

  class ShoppableImageSection {
    constructor(container) {
      this.instance = new ShoppableImage(container);
    }

    onUnload() {
      if (this.instance) {
        this.instance.destroy();
      }
    }

  }

  ShoppableImageSection.type = 'shoppable-image';
  registrySectionConstructor(ShoppableImageSection.type, ShoppableImageSection);
  return _exports;
}();