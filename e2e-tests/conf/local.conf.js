
exports.config = {

  seleniumPort : 4444,


  seleniumAddress: 'http://localhost:4444/wd/hub',


  /*
      The first spec to run is the login, then the others
   */
  specs: ['../specs/**/*.js'],

  /*
      This is the element containing the root element for the application
      Since we're using two different apps for login and as the actual application,
      we use a common selector between the root elements (the ng-app attribute
   */
  rootElement: '[ng-app]',

  baseUrl : 'http://localhost:8000/build'


}