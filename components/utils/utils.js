const _ = require('lodash');

module.exports.extractValues = extractValues(keys, obj, defaultValue = null, stringify = false) {
  let defaultsObj = _(keys)
    .mapKeys()
    .mapValues(() => {
      return defaultValue;
    })
    .value();
  return _(obj)
    .omitBy(_.isNull)
    .pick(keys)
    .mapValues(val => { if (!stringify) return val; if (_.isString(val)) return val; return JSON.stringify(val) })
    .defaults(defaultsObj) // apply the defaults
    .value();
}