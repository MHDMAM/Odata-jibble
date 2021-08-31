const _ = require('lodash');
const controller = require('./controller');
const logger = require('../../components/logger/index');

module.exports.load = function load(req, res) {
  let start_benchmark = process.hrtime();
  logger.info({
    route: "GET:/v1/Trippin/people/",
    info: 'Start New Load People Request'
  })
  return controller.load()
    .then(function(results) {
      const diff = process.hrtime(start_benchmark);
      logger.info({
        route: "GET:/v1/Trippin/people/",
        results: results,
        info: 'Ends Add Load People Successfully',
        benchmark: ((((+diff[0]) * 1e9) + (+diff[1])) / 1000000)
      })
      return res.send(results)
    })
    .catch(reason => {
      const diff = process.hrtime(start_benchmark);
      logger.error({
        route: "GET:/v1/Trippin/people/",
        reason: reason,
        info: 'Ends Add Load People With Failure',
        benchmark: ((((+diff[0]) * 1e9) + (+diff[1])) / 1000000)
      })
      return res.status(reason.httpcode || 500).send(_.omit(reason, ['httpcode']))
    })
};

module.exports.details = function details(req, res) {
  let start_benchmark = process.hrtime();
  logger.info({
    route: "GET:/v1/Trippin/people/details?username",
    query: req.query,
    info: 'Start New Person Details Request'
  })
  return controller.details(req.query)
    .then(function(results) {
      const diff = process.hrtime(start_benchmark);
      logger.info({
        route: "GET:/v1/Trippin/people/details?username",
        query: req.query,
        results: results,
        info: 'Ends Add detail Person Details Successfully',
        benchmark: ((((+diff[0]) * 1e9) + (+diff[1])) / 1000000)
      })
      return res.send(results)
    })
    .catch(reason => {
      const diff = process.hrtime(start_benchmark);
      logger.error({
        route: "GET:/v1/Trippin/people/details?username",
        query: req.query,
        reason: reason,
        info: 'Ends Add detail Details With Failure',
        benchmark: ((((+diff[0]) * 1e9) + (+diff[1])) / 1000000)
      })
      return res.status(reason.httpcode || 500).send(_.omit(reason, ['httpcode']))
    })
};

module.exports.search = function search(req, res) {
  let start_benchmark = process.hrtime();
  logger.info({
    route: "GET:/v1/Trippin/people/search?filter",
    query: req.query,
    info: 'Start New Person Search Request'
  })
  return controller.search(req.query)
    .then(function(results) {
      const diff = process.hrtime(start_benchmark);
      logger.info({
        route: "GET:/v1/Trippin/people/search?filter",
        query: req.query,
        results: results,
        info: 'Ends Add detail Person Search Successfully',
        benchmark: ((((+diff[0]) * 1e9) + (+diff[1])) / 1000000)
      })
      return res.send(results)
    })
    .catch(reason => {
      const diff = process.hrtime(start_benchmark);
      logger.error({
        route: "GET:/v1/Trippin/people/search?filter",
        query: req.query,
        reason: reason,
        info: 'Ends Add detail Search With Failure',
        benchmark: ((((+diff[0]) * 1e9) + (+diff[1])) / 1000000)
      })
      return res.status(reason.httpcode || 500).send(_.omit(reason, ['httpcode']))
    })
};

module.exports.create = function create(req, res) {
  let start_benchmark = process.hrtime();
  logger.info({
    route: "POST:/v1/Trippin/people/",
    body: req.body,
    info: 'Start New Create People Request'
  })
  return controller.create(req.body)
    .then(function(results) {
      const diff = process.hrtime(start_benchmark);
      logger.info({
        route: "POST:/v1/Trippin/people/",
        body: req.body,
        results: results,
        info: 'Ends Create People Successfully',
        benchmark: ((((+diff[0]) * 1e9) + (+diff[1])) / 1000000)
      })
      return res.send(results)
    })
    .catch(reason => {
      const diff = process.hrtime(start_benchmark);
      logger.error({
        route: "POST:/v1/Trippin/people/",
        body: req.body,
        reason: reason,
        info: 'Ends Create People With Failure',
        benchmark: ((((+diff[0]) * 1e9) + (+diff[1])) / 1000000)
      })
      return res.status(reason.httpcode || 500).send(_.omit(reason, ['httpcode']))
    })
};

module.exports.update = function update(req, res) {
  let start_benchmark = process.hrtime();
  logger.info({
    route: "PATCH:/v1/Trippin/people/:username",
    body: req.body,
    info: 'Start New Update Person Request'
  })
  return controller.update(req.query.username, req.body)
    .then(function(results) {
      const diff = process.hrtime(start_benchmark);
      logger.info({
        route: "PATCH:/v1/Trippin/people/:username",
        body: req.body,
        results: results,
        info: 'Ends Update Person Successfully',
        benchmark: ((((+diff[0]) * 1e9) + (+diff[1])) / 1000000)
      })
      return res.send(results)
    })
    .catch(reason => {
      const diff = process.hrtime(start_benchmark);
      logger.error({
        route: "PATCH:/v1/Trippin/people/:username",
        body: req.body,
        reason: reason,
        info: 'Ends Update Person With Failure',
        benchmark: ((((+diff[0]) * 1e9) + (+diff[1])) / 1000000)
      })
      return res.status(reason.httpcode || 500).send(_.omit(reason, ['httpcode']))
    })
};

module.exports.delete = function Delete(req, res) {
  let start_benchmark = process.hrtime();
  logger.info({
    route: "DELETE:/v1/Trippin/people/",
    query: req.query,
    info: 'Start New Delete Person Request'
  })
  return controller.delete(req.query)
    .then(function(results) {
      const diff = process.hrtime(start_benchmark);
      logger.info({
        route: "DELETE:/v1/Trippin/people/",
        query: req.query,
        results: results,
        info: 'Ends Add Delete Person Successfully',
        benchmark: ((((+diff[0]) * 1e9) + (+diff[1])) / 1000000)
      })
      return res.send(results)
    })
    .catch(reason => {
      const diff = process.hrtime(start_benchmark);
      logger.error({
        route: "DELETE:/v1/Trippin/people/",
        query: req.query,
        reason: reason,
        info: 'Ends Add Delete Person With Failure',
        benchmark: ((((+diff[0]) * 1e9) + (+diff[1])) / 1000000)
      })
      return res.status(reason.httpcode || 500).send(_.omit(reason, ['httpcode']))
    })
};