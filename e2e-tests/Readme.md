#Edudoc e2e tests
##Starting the tests
In order to run the e2e tests, you have to:

1. Install protractor ```npm install -g protractor```
1. Update webdriver-manager ```webdriver-manager update```
1. Run the webdriver server ```webdriver-manager start```. The server has to be running during the test execution.
1. From the edudoc root folder, run
 - localhost:  ```protractor e2e-tests/conf/local.conf.js```
 - heroku:  ```protractor e2e-tests/conf/heroku.conf.js```




##Guidelines
The e2e tests folder has this structure:
<pre>
e2e-tests
+- conf
| +- heroku.conf.js **(protractor configuration file for Heroku)**
| +- local.conf.js **(protractor configuration file for localhost)**
+- abstract
| +- Page.js
| +- Input.js
| +- **(other page and component abstraction files...)**
+- pages
| +- page-name **(replace with descriptive name)**
| | +- page-file-1.js
| | +- **(...other page files, partials etc...)**
+- specs
| | +- feature-1 **(replace with descriptive name)**
| | | +- spec-file-1.js  **(replace with descriptive name)**
| | | +- **(... other spec files ...)**
| | +- **(... other feature folders ...)**
| | | +- **(... with their own spec files ...)**
</pre>

### Page objects
The Page objects live in the **pages** folder, they are intended to contain locators and component abstraction methods. In this way we have an unique place to store locators for a certain page.
A Page object inherits from the **common/Page** class an defines page-specific components and methods.
In the *e2e-tests/pages/common* folder, there are component abstraction files. These files abstract page elements as input, button, select, and other more complex components as date pickers, sliders, modals etc. They are instantiated in the **Page** class **create** convenience methods.

#### Sample page object

```javascript

/**
 * SamplePage
 * Inherits from Page.js and defines the page components
 */
var Page = require("../common/Page.js");
var PageObject = (function () {

    function PageObject() {
    	// =========================== START Page components definition =========================== //
    	

		this.emailInput = 		Page.create.input(by.css('#account_email'));
		this.passwordInput = 	Page.create.input(by.css('#account_password'));
		this.loginBtn = 		Page.create.button(by.cssContainingText('button', 'Sign In'));



		// =========================== END Page components definition =========================== //
    }
    // inherits from the Page object
    PageObject.prototype = Page.prototype;
    PageObject.prototype.constructor = PageObject;
    return PageObject;
})();
module.exports = PageObject;

// ======================================================================================= //
// ============================ PAGE SPECIFIC METHODS ==================================== //
// ======================================================================================= //



/**
 * Opens the login page
 */
PageObject.prototype.visitPage = function () {
    return browser.get('http://localhost:3000');
};


/**
 * Login with given credentials
 *
 * @return {Promise} a promise resolved after the login button is clicked
 */
PageObject.prototype.login = function (email, password) {

	var me = this;
	return protractor.promise.all([
            me.emailInput.fill(email),
            me.passwordInput.fill(password),
        ]).then(function(){
            return me.loginBtn.click();
        });
};
```

### Spec files

The **specs** files contain the test scenarios, they use Page objects to interact with different pages and their components. 

#### Sample spec object

```javascript

// Include Page objects
var LoginPage = require('../../pages/login/LoginPage.js');
var DashboardPage = require('../../pages/dashboard/DashboardPage.js');

// Open a main describe block

describe('Edudoc App', function() {
  'use strict';


  // Instantiate the Page objects
  var loginPage = new LoginPage();
  var dashboardPage = new DashboardPage();


  // Before any operation, you want to login
  it('login test', function() {

    loginPage.visitPage();
    loginPage.login('susanmatthews@gmail.com', 'edudoc1234');


    expect(browser.getTitle()).toEqual('Edudoc');

  });


  // And then it's possible to perform actions on the Page objects
  it('this is just a test clicking some button', function() {

    dashboardPage.showListBtn.click();
    dashboardPage.showGridBtn.click();
    dashboardPage.showListBtn.click();
    dashboardPage.showGridBtn.click();

    expect(browser.getTitle()).toEqual('Edudoc');
  });
});
```