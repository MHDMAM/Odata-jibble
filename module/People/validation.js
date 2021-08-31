const joi = require('joi');
const requestValidation = require('../../components/utils/incomingRequestValidation.js');

const personDetails_Schema = joi.object({
	username: joi.string().required(),
});

const search_Schema = joi.object({
	filter: joi.string().optional(),
});

const create_Schema = joi.object({
	UserName: joi.string().required(),
}).unknown();

exports.personDetails = function personDetails(req, res, next) {
	const isValid = personDetails_Schema.validate(req.query);
	return requestValidation.validateSchema(req, res, next, isValid, 'T01')
};

exports.search = function search(req, res, next) {
	const isValid = search_Schema.validate(req.query);
	return requestValidation.validateSchema(req, res, next, isValid, 'T01')
};

exports.create = function create(req, res, next) {
	const isValid = create_Schema.validate(req.body);
	return requestValidation.validateSchema(req, res, next, isValid, 'T01')
};

exports.update = function update(req, res, next) {
	const isValid = personDetails_Schema.validate(req.query);
	return requestValidation.validateSchema(req, res, next, isValid, 'T01')
};