const Trippin = require('./Trippin.js');
const logger = require('../../components/logger/index');

exports.load = async (body) => {
	let people = await Trippin.listPeople()
		.catch(error => {
			return Promise.reject({
				httpcode: 500
			});
		});
	if (!people) return;
	return Promise.resolve({
		people: people
	});
}

exports.details = async (query) => {
	let username = query.username;
	let info = await Trippin.personDetails(username)
		.catch(error => {
			return Promise.reject({
				httpcode: 500
			});
		});

	if (!info) return;
	return Promise.resolve({
		user: info
	});
}

exports.search = async (query) => {
	let filter = query.filter;
	let info = await Trippin.search(filter)
		.catch(error => {
			return Promise.reject({
				httpcode: 500
			});
		});

	if (!info) return;
	return Promise.resolve({
		user: info
	});
}

exports.create = async (body) => {
	let info = await Trippin.create(body)
		.catch(error => {
			return Promise.reject({
				httpcode: 500
			});
		});

	if (!info) return;
	return Promise.resolve({
		user: info
	});
}

exports.update = async (username, body) => {
	let info = await Trippin.update(username, body)
		.catch(error => {
			logger.debug(error);
			return Promise.reject({
				httpcode: 500
			});
		});

	if (!info) return;
	return Promise.resolve({
		user: info
	});
}

exports.delete = async (query) => {
	let username = query.username;
	let info = await Trippin.delete(username)
		.catch(error => {
			logger.debug(error);
			return Promise.reject({
				httpcode: 500
			});
		});

	if (!info) return;
	return Promise.resolve({
		user: info
	});
}