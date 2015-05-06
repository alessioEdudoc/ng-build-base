/**
 * Inherits from Page.js and defines the page components
 */
var Page = require("../../abstract/Page.js");
var PageObject = (function () {
    function PageObject() {
    	// =========================== START Page components definition ========================= //
    	
    	this.version = Page.create.label(by.binding('version'));
		
		// =========================== END Page components definition =========================== //
    }
    // inherits from the Page object
    PageObject.prototype = Page.prototype;
    PageObject.prototype.constructor = PageObject;
    return PageObject;
})();
module.exports = new PageObject();

// ======================================================================================= //
// ============================ PAGE SPECIFIC METHODS ==================================== //
// ======================================================================================= //



/**
 * Opens the login page
 */
PageObject.prototype.visitPage = function () {
    return browser.get('#');
};






