const logger = require("./components/logger/index");

const router = new require('express').Router();

const People = require('./module/People/router');

router.route('/').get((req, res) => {
  res.json({
    message: 'Welcome to API!'
  })
})

router.use('/people', People);

router.use('*', (req, res) => {
  logger.info({
    uri: req.baseUrl,
    headers: req.headers,
    query: req.query,
    params: req.params,
    body: req.body,
  });
  res.status(401).json()
});

module.exports = router