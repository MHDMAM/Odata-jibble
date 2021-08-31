const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
const assert = chai.assert;

chai.use(chaiAsPromised);

const Trippin = require('./Trippin');

const Keys = ['UserName', 'FirstName', 'LastName', 'MiddleName', 'Gender', 'Age', 'Emails', 'FavoriteFeature', 'Features', 'AddressInfo', 'HomeAddress'];

describe('Test Odata, People APIs Requests', () => {
	context('List people', () => {
		let people;
		before(async () => {
			people = await Trippin.listPeople();
		});

		it('should return array', () => {
			expect(people)
				.to.be.an('array')
		});

		it('should return non empty array', () => {
			expect(people)
				.that.is.not.empty
		});

		it('should have all members to be an objects', () => {
			people.forEach(person => { expect(person).to.be.an('object'); })
		});

		it('should have UserName', () => {
			expect(people[0]).to.have.property('UserName');
		});

	});

	context('Show Details on a Specific Person', () => {
		let person;
		before(async () => {
			const username = 'russellwhyte';
			person = await Trippin.personDetails(username);
		});

		it('should return an object', () => {
			expect(person)
				.to.be.an('object')
		});

		it('should not be an empty', () => {
			expect(person)
				.that.is.not.empty
		});

		it('should have at least UserName', () => {
			expect(person).to.have.property('UserName');
		});

	});

	context('Allow Filtering people', () => {
		let filteredPeople;
		before(async () => {
			const filter = "UserName eq 'russellwhyte'";
			filteredPeople = await Trippin.search(filter);
		});

		it('should return an array', () => {
			expect(filteredPeople)
				.to.be.an('array')
		});

		it('should return non empty array', () => {
			expect(filteredPeople)
				.that.is.not.empty
		});

		it('should have all members to be an objects', () => {
			filteredPeople.forEach(person => { expect(person).to.be.an('object'); })
		});

		it('should have UserName property', () => {
			expect(filteredPeople[0]).to.have.property('UserName');
		});

		it('should have UserName equals to "russellwhyte"', () => {
			assert.propertyVal(filteredPeople[0], 'UserName', 'russellwhyte');
		});

		it('should have all proprieties', () => {
			expect(filteredPeople[0]).to.have.keys(Keys);
		});

	});

	context('Create New Person', () => {
		let newPerson;
		const Person = {
			"UserName": "ttd1",
			"FirstName": "Mo",
			"LastName": "Mi",
			"MiddleName": "AK",
			"Age": 34,
			"Emails": ["ttd1@example.com"]
		};
		before(async () => {

			newPerson = await Trippin.create(Person);
			// newPerson = {
			// 	"@odata.context": "https://services.odata.org/TripPinRESTierService/(S(1yzwnucxqazyb432gfnxzpcf))/$metadata#People/$entity",
			// 	"UserName": "ttd1",
			// 	"FirstName": "Mo",
			// 	"LastName": "Mi",
			// 	"MiddleName": "AK",
			// 	"Gender": "Male",
			// 	"Age": 34,
			// 	"Emails": ["ttd1@example.com"],
			// 	"FavoriteFeature": "Feature1",
			// 	"Features": [],
			// 	"AddressInfo": [],
			// 	"HomeAddress": null
			// }
		});

		it('should return an object', () => {
			expect(newPerson)
				.to.be.an('object')
		});

		it('should not be an empty', () => {
			expect(newPerson)
				.that.is.not.empty
		});

		it('should have correct Person Details', () => {
			let _person = Object.assign({}, Person);
			_person.Gender = 'Male';
			_person.FavoriteFeature = 'Feature1';
			_person.Features = [];
			_person.AddressInfo = [];
			_person.HomeAddress = null;
			assert.deepEqual(newPerson, newPerson);
		});

		it('should have all proprieties', () => {
			expect(newPerson).to.have.keys([...Keys, '@odata.context']);
		});

	});

	context('Allow Updating a Specific Person Details', () => {
		const username = 'ttd1';
		const bodyReq = { 'FirstName': 'Moo' };
		it('should fulfilled the Promise Request', () => {
			return expect(Trippin.update(username, bodyReq)).to.eventually.be.fulfilled;
		})
	});

	context('Allow Remove a Specific Person', () => {
		const username = 'ttd1';
		it('should fulfilled the Promise Request', () => {
			return expect(Trippin.delete(username)).to.eventually.be.fulfilled;
		})
	});

});