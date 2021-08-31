const logger = require('../logger/index.js');
module.exports = class RequestValidation {

  static validateSchema(req, res, next, isValid, errorCode) {
    if (isValid && isValid.error) {
      logger.error({
        msg: 'Error - in validation.',
        path: 'validation',
        uri: req.baseUrl,
        headers: req.headers,
        query: req.query,
        params: req.params,
        body: req.body,
        error_message: isValid.error.message
      })
      return res.status(422).send({
        status: errorCode || 'SL999',
        message: (isValid.error && isValid.error.message && isValid.error.message.replace(/\"/g, '')) || 'Unprocessable Entity',
      });
    }
    return next();
  }
};