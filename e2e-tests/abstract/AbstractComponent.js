/**
 * This class represent a text input element
 * @class
 */

var AbstractComponent = (function () {


    /**
     * Creates a new AbstractComponent.
     * @param {Object} locator the locator for this input
     * @constructor
     */
    function AbstractComponent(locator) {
        this.locator = locator;
    }




    /**
     * Clears the input field
     *
     * @return {Promise} a promise resolved when the input is cleared
     */
    AbstractComponent.prototype.isVisible = function () {
        return element(this.locator).isDisplayed();
    };



    return AbstractComponent;
})();

module.exports = AbstractComponent;
