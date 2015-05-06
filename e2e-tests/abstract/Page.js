/**
 * This class represent a page and centralizes common methods for pages
 * @class
 */

var Page = (function () {


    /**
     * Creates a new Page.
     * @param {Object} locators
     * @constructor
     */
    function Page() {

    }


    /**
     * Convenience methods to create components to include in the Page object
     */
    Page.create = {

        input : function (locatorKey) {
            var Input = require('./Input.js');
            return new Input(locatorKey);
        },

        button : function (locatorKey) {
            var Button = require('./Button.js');
            return new Button(locatorKey);
        },

        select : function (locatorKey) {
            var Select = require('./Select.js');
            return new Select(locatorKey);
        },

        label : function (locatorKey) {
            var Label = require('./Label.js');
            return new Label(locatorKey);
        }

    };



    Page.prototype.scrollToElement = function(component) {

        if (component.locator.using !== 'css selector') {
            throw 'Page.scrollToElement(): the Component is not using a by.css locator!!';
        }

        return browser.executeScript('document.querySelector("'+component.locator.value+'").scrollIntoView(true);');

    };


    return Page;
})();

module.exports = Page;
