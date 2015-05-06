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
 * Gets the text
 *
 * @return {Promise} a promise resolved when the text is retrieved
 */
Component.prototype.getText = function () {
    return element(this.locator).getText();
};
