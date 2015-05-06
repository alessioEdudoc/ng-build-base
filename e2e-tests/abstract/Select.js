/**
 * Inherits from AbstractComponent and exports the class variable.
 * Don't need to modify this code, add custom methods below.
 */
var AbstractComponent = require('./AbstractComponent.js');
var Component = (function () {
    function Component(locator) {
        this.locator = locator;
    }
    Component.prototype = AbstractComponent.prototype;
    Component.prototype.constructor = Component;
    return Component;
})();
module.exports = Component;


// ======================================================================================= //
// ========================= COMPONENT SPECIFIC METHODS ================================== //
// ======================================================================================= //


/**
 * Selects an option from a dropdown menu/select
 *
 * @params {string} txt the text of the option
 * @return {Promise} a promise resolved when the input is filled
 */
Component.prototype.select = function (txt) {

    var el = element(this.locator);

    return el.click()
        .then(el.getTagName)
        .then(function(tagName){

            if (tagName === 'select') {
               el.sendKeys(txt);
               return el.element(by.cssContainingText('option', txt)).click().then(function(){
                   browser.actions().mouseDown().mouseUp().perform();
               });
            } else { // assume bootstrap dropdown
                return el.element(by.cssContainingText("a", txt)).click();
               // return el.element(by.xpath("../ul//a[contains(text(), '"+txt+"')]")).click();
            }

        });
};

