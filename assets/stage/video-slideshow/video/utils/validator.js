window.SLM = window.SLM || {};

window.SLM['stage/video-slideshow/video/utils/validator.js'] = window.SLM['stage/video-slideshow/video/utils/validator.js'] || function () {
  const _exports = {};

  const log = errorMsg => {
    console.warn(errorMsg);
  };

  _exports.log = log;

  function checkType(value, type) {
    if (typeof type !== 'string') return false;

    if (typeof value !== type) {
      return false;
    }

    return true;
  }

  const validator = (value, type, paramsName, required) => {
    if (Array.isArray(type)) {
      let isVerifyType = false;
      type.forEach(t => {
        const isPass = checkType(value, t);
        if (isPass) isVerifyType = true;
      });

      if (!isVerifyType) {
        log(`${paramsName} must be ${type.join(' | ')} type`);
        return;
      }
    } else {
      const isPass = checkType(value, type);

      if (!isPass) {
        log(`${paramsName} must be ${type} type`);
        return;
      }
    }

    if (required && value === undefined) {
      log(`${paramsName} field is required`);
    }
  };

  _exports.validator = validator;
  _exports.default = {
    validator,
    log
  };
  return _exports;
}();