window.SLM = window.SLM || {};

window.SLM['product/commons/js/product-item.js'] = window.SLM['product/commons/js/product-item.js'] || function () {
  const _exports = {};
  const { SL_State } = window['SLM']['theme-shared/utils/state-selector.js'];
  const ProductItemReport = window['SLM']['theme-shared/report/product/product-item.js'].default;
  const getCurrencyCode = window['SLM']['theme-shared/utils/currency/getCurrencyCode.js'].default;
  const { convertPrice } = window['SLM']['theme-shared/utils/currency/getCurrencyCode.js'];
  const previewModal = window['SLM']['product/commons/js/preview-modal/index.js'].default;
  const quickAddModal = window['SLM']['product/commons/js/quick-add-modal.js'].default;
  const { processPrice } = window['SLM']['commons/utils/convertPrice.js'];
  const hdReport = new ProductItemReport();
  const isPad = SL_State.get('request.is_mobile') || document.ontouchmove !== undefined;
  $('body').delegate('.js-product-item-quick-view', 'click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    const spuSeq = $(this).data('spu-seq');
    const uniqueKey = $(this).data('unique-key');
    const query = $(this).data('query');
    const position = $(this).data('index');
    previewModal({
      spuSeq,
      uniqueKey,
      query,
      position
    });
  });
  $('body').on('click', '.js-product-item-quick-add', e => {
    e.preventDefault();
    e.stopPropagation();
    const $current = $(e.currentTarget);
    const itemIndex = $current.data('index');
    const spuSeq = $current.data('spu-seq');
    const uniqueKey = $current.data('unique-key');
    const status = $current.data('status');
    const position = $current.data('index');
    quickAddModal({
      spuSeq,
      uniqueKey,
      $button: $current,
      position,
      itemIndex,
      status
    });
  });
  $('body').on('click', '.js-product-item-sold-out', e => {
    e.preventDefault();
    e.stopPropagation();
  });
  window.SL_EventBus.on('global:currency:format', ({
    currencyCode: code,
    lang
  }) => {
    const priceItems = $('[data-product-item-price]');

    for (const priceItem of priceItems) {
      const priceValue = $(priceItem).data('product-item-price');
      const isSavePrice = $(priceItem).data('product-item-save-price');
      processPrice($(priceItem), priceValue, {
        isSavePrice,
        code,
        lang
      }).render();
    }
  });

  if (isPad) {
    $('.product-item__inner-wrap .product-item__actions').css({
      display: 'block'
    });
    $('.product-item__inner-wrap').removeClass('js-product-inner-wrap');
    $('#collectionsAjaxInner').addClass('pad');
    $('.product-item__wrapper').addClass('pad');
  }

  const tryDecodeURIComponent = str => {
    try {
      return decodeURIComponent(str);
    } catch (e) {
      return str;
    }
  };

  const judgePageType = () => {
    const pageType = SL_State.get('templateAlias');
    const title = SL_State.get('sortation.sortation.title');

    if (pageType === 'Products') {
      let {
        pathname
      } = window.location;
      const {
        search
      } = window.location;
      let collectionName = '';

      if (title) {
        collectionName = title;
      } else {
        collectionName = 'All Products';
      }

      if (window.Shopline.routes && window.Shopline.routes.root && window.Shopline.routes.root !== '/') {
        const root = `/${window.Shopline.routes.root.replace(/\//g, '')}`;
        pathname = pathname.replace(root, '');
      }

      if (pathname === '/collections/types' || pathname === '/collections/brands') {
        collectionName = tryDecodeURIComponent(pathname.replace('/collections/', '') + search);
      } else {
        const pathnameArr = pathname.split('/');

        if (pathnameArr[pathnameArr.length - 1] === '') {
          pathnameArr.pop();
        }

        if (pathnameArr[1] === 'collections' && pathnameArr.length === 4) {
          collectionName += tryDecodeURIComponent(pathname.replace('/collections/', '') + search);
        }
      }

      return collectionName;
    }

    if (pageType === 'ProductsSearch') {
      return 'Search Result';
    }
  };

  function thirdPartReport({
    id,
    name,
    price,
    index,
    customCategoryName
  }) {
    const listName = judgePageType();
    window.SL_EventBus.emit('global:thirdPartReport', {
      GA: [['event', 'select_content', {
        content_type: 'product',
        currency: getCurrencyCode(),
        items: [{
          id,
          name,
          currency: getCurrencyCode(),
          price: convertPrice(price),
          list_name: listName,
          list_position: index,
          category: customCategoryName
        }]
      }]],
      GA4: [['event', 'select_content', {
        content_type: 'product',
        item_id: id
      }], ['event', 'select_item', {
        currency: getCurrencyCode(),
        items: [{
          item_id: id,
          item_name: name,
          price: convertPrice(price),
          currency: getCurrencyCode(),
          item_list_name: listName,
          index,
          item_category: customCategoryName
        }]
      }]]
    });
  }

  function reportClickProduct(id) {
    const pageType = window.SL_State.get('template');

    if (pageType === 'collection') {
      if (window.HdSdk && window.HdSdk.shopTracker) {
        window.HdSdk.shopTracker.report('60006260', {
          event_name: '130',
          product_id: id
        });
      }
    }
  }

  $(document.body).on('click', '.product-item', function () {
    const item = $(this);
    const isRecentlyProduct = item.hasClass('__sl-custom-track-product-recently-viewed-item');
    const isSearchProduct = item.hasClass('__sl-custom-track-product-item-search');

    if (!isSearchProduct && !isRecentlyProduct) {
      hdReport.itemSelect({
        productInfo: item.data()
      });
    }

    thirdPartReport({
      id: $(this).data('skuId'),
      name: $(this).data('name'),
      price: $(this).data('price'),
      index: $(this).data('index') + 1,
      customCategoryName: $(this).data('custom-category-name')
    });
    reportClickProduct(item.data('id'));
  });
  return _exports;
}();