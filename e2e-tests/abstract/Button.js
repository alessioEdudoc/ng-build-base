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
 * Clicks the button
 *
 * @return {Promise} a promise resolved when the button is clicked
 */
Component.prototype.click = function () {
    return element(this.locator).click();
};


