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
 * Clears and fill the input field with text.
 *
 * @params {string} txt the text to write in the input field
 * @return {Promise} a promise resolved when the input is filled
 */
Component.prototype.fill = function (txt) {
    var loc = element(this.locator);
    return loc.clear()
        .then(function() {
            return loc.sendKeys(txt);
        });
};


/**
 * Clears the input field
 *
 * @return {Promise} a promise resolved when the input is cleared
 */
Component.prototype.clear = function () {
    return element(this.locator).clear();
};


