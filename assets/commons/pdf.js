window.SLM = window.SLM || {};

window.SLM['commons/pdf.js'] = window.SLM['commons/pdf.js'] || function () {
  const _exports = {};
  const originPdfjs = window['pdfjs-dist']['/legacy/build/pdf']['*'];
  const originPdfjsWorker = window['pdfjs-dist']['/legacy/build/pdf.worker.entry'].default;
  window['pdfjs-dist'] = {
    '/legacy/build/pdf': {
      '*': originPdfjs
    },
    '/legacy/build/pdf.worker.entry': {
      default: originPdfjsWorker
    }
  };
  return _exports;
}();