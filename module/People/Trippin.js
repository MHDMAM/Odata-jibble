const config = require("config");
const _ = require('lodash');
const Trippin = config.Trippin;
const { HttpClient } = require('../../components/utils/request.js');
const logger = require('../../components/logger/index');

let TrippinURL = _.template(Trippin.People.baseURL)({ key: Trippin.key });

module.exports.listPeople = async () => {
	const Options = { method: 'GET', baseURL: TrippinURL };
	let PeopleRequest = new HttpClient();
	let people = await PeopleRequest.sendWithRetry(Options)
	if (!people.value) throw new Error('People Data is Missing');
	return Promise.resolve(people.value);
};

module.exports.personDetails = async (username) => {
	const Options = { method: 'GET', baseURL: `${TrippinURL}('${username}')` };
	let DetailsRequest = new HttpClient();
	let details = await DetailsRequest.sendWithRetry(Options)
	if (!details) throw new Error('Person Details Data is Missing');
	return Promise.resolve(details);
};

module.exports.search = async (filter) => {
	const Options = { method: 'GET', baseURL: TrippinURL, params: { $filter: filter } };
	let SearchRequest = new HttpClient();
	let details = await SearchRequest.sendWithRetry(Options)
	if (!details.value) throw new Error('Person Filter Results Data is Missing');
	return Promise.resolve(details.value);
};

module.exports.create = async (body) => {
	const Options = { method: 'POST', baseURL: TrippinURL, data: body };
	let CreateRequest = new HttpClient();
	let details = await CreateRequest.sendWithRetry(Options)
	if (!details) throw new Error('Person Creation Data is Missing');
	return Promise.resolve(details);
};

module.exports.update = async (username, body) => {
	const Options = { method: 'PATCH', baseURL: `${TrippinURL}('${username}')`, data: body };
	let CreateRequest = new HttpClient();
	let updated = await CreateRequest.sendWithRetry(Options)
	return Promise.resolve(updated);
};

module.exports.delete = async (username) => {
	const Options = { method: 'DELETE', baseURL: `${TrippinURL}('${username}')` };
	let CreateRequest = new HttpClient();
	let updated = await CreateRequest.sendWithRetry(Options)
	return Promise.resolve(updated);
};