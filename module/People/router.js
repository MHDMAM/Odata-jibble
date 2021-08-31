const router = new require('express').Router()
const People = require('./index.js');
const Validation = require('./validation.js');

router.route('/').get(People.load);
router.route('/').post(Validation.create, People.create);
router.route('/').delete(People.delete);
// param: username
router.route('/').patch(Validation.update, People.update);

// param :username
router.route('/detail').get(Validation.personDetails, People.details);
// param :filter
router.route('/search').get(Validation.search, People.search);

module.exports = router;