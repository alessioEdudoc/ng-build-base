
var metaPage = require('../../pages/meta/MetaPage.js');


describe('Sample App', function() {
	'use strict';
	



	
	it('should have title', function() {
		metaPage.visitPage();

		expect(browser.getTitle()).toEqual('My AngularJS App');

	});


	it('the version should be in Semver format', function() {

		metaPage.version.getText().then(function (text){
			expect(!!text.match(/\d+\.\d+\.\d+(?:-build\.\d+)?/)).toBe(true);
		});

	});


	
});
