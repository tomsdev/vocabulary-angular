'use strict';

describe('Service: dataStorage', function () {

	// load the service's module
	beforeEach(module('vocabularyAngularApp'));

	// instantiate service
	var dataStorage,
			valName,
			val,
			objName,
			obj;
	beforeEach(inject(function(_dataStorage_) {
		dataStorage = _dataStorage_;
		valName = "testVal";
		val = "val";
		objName = "testObj";
		obj = {prop:"val"};
	}));

	afterEach(function () {
		localStorage.removeItem(valName);
		localStorage.removeItem(objName);
	});

	it('should exist', function () {
		expect(!!dataStorage).toBe(true);
	});

	it('should save the value', function () {
		expect(dataStorage.getValue(valName)).toBeNull();
		dataStorage.setValue(valName, val);
		expect(dataStorage.getValue(valName)).toBe(val);
	})

	it('should delete the value', function () {
		dataStorage.setValue(valName, val);
		expect(dataStorage.getValue(valName)).toBe(val);
		dataStorage.removeItem(valName);
		expect(dataStorage.getValue(valName)).toBeNull();
	})

	it('should save the object', function () {
		expect(dataStorage.getObject(objName)).toBeNull();
		dataStorage.setObject(objName, obj);
		expect(dataStorage.getObject(objName).prop).toBe(val);
	})

	it('should delete the object', function () {
		dataStorage.setObject(objName, obj);
		expect(dataStorage.getObject(objName).prop).toBe(val);
		dataStorage.removeItem(objName);
		expect(dataStorage.getObject(objName)).toBeNull();
	});
});
