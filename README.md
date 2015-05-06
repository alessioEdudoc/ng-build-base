# ng-build-base — a complete build configuration for AngularJS projects

This project is a build configuration for AngularJS projects.
It's based on **angular-seed**, and adds a full set of tools to be ready to work
with AngularJS and LESS. It is based on **gulp**.

The project contains a sample AngularJS application and is preconfigured to install the Angular
framework and a bunch of development and testing tools.

Features:

- LESS, CSS, Javascript and HTML minification (prod mode)
- Cache busting
- Version bumping
- Automatic script / stylesheet injection in the index file
- Templates module (html2js)
- Unit test (Karma)
- E2E test (Protractor) with Page / Component abstraction structure
- Coverage report (karma coverage)
- Complexity report (Plato)
- JS lint and code style checks




## Getting Started

To get you started you can simply clone the repository and install the dependencies:

### Prerequisites

Git: [http://git-scm.com/](http://git-scm.com/).

NodeJS: [http://nodejs.org/](http://nodejs.org/).


### Install Dependencies

Run

```
npm install
```

to install node and bower components at once

### Build the Application
The application can be built in development and production mode.

In **development** mode:

- A JS linter and code style check is performed
- Unit tests are run
- A coverage report is generated (in ```http://localhost:8000/report/coverage```)
- A complexity report is generated (in ```http://localhost:8000/report/complexity```)
- The project ```src``` folder structure is preserved in the ```build``` directory
- The LESS files are compiled into CSS
- The _meta and _templ modules are generated
- The JS and CSS files are injected in the index.html file
- The metadata in ```src/meta.json``` is aligned with ```bower.json``` and ```package.json```

In **production** mode:

- The application is built in development mode, then:
- The template files are minified and cached in the _templ Angular module
- The CSS files are concatenated and minified and stored in the ```css/styles.min.css``` file
- The JS files are concatenated and minified in the ```js/app.min.js``` file
- The ```index.html``` is injected with the JS and CSS (with a cache buster query parameter hash) and then minified
- The project version is bumped


If you have Gulp installed globally, run:

```bash
gulp dev               # builds the application in development mode
gulp prod              # builds the application in production mode
gulp prod -v 0.1.2     # builds in production mode and sets the version to 0.1.2
gulp prod -v patch     # builds in production mode and bumps the patch version (2.2.2 -> 2.2.3)
gulp prod -v minor     # builds in production mode and bumps the minor version (2.2.2-> 2.3.0)
gulp prod -v major     # builds in production mode and bumps the major version (2.2.2 -> 3.0.0)
```
Otherwise:

```bash
npm run dev            # builds the application in development mode
npm run prod           # builds the application in production mode
npm run prod-patch     # builds in production mode and bumps the patch version (2.2.2 -> 2.2.3)
npm run prod-minor     # builds in production mode and bumps the minor version (2.2.2-> 2.3.0)
npm run prod-major     # builds in production mode and bumps the major version (2.2.2 -> 3.0.0)
```



### Run the Application

There is a simple development web server.  The simplest way to start
this server is:

```
npm start
```

Now browse to the app at `http://localhost:8000/build/index.html`.



## Directory Layout

```
src/                  --> all of the source files for the application
  vendor/                 --> bower third-party packages
    ...
  assets/                 --> assets folder for images, fonts etc.
    ...
  modules/                --> folder containing all Angular modules
    <module name>/
    
      <module name>.js    --> the module declaration file, contains just the module dependency statement
    
      common/             --> contains all the code shared among the module features
        config/           --> all the module .config  and  .run 
        services/         --> all the module .service  and  .factory, and relative .test.js files
        directives/       --> all the module .directive  and  related files (Controllers and Templates and test files)
        filters/          --> all the module .filter
        constants/        --> all the module .constant
        
      features/
        <feature name>/   --> all Angular files related to a specific feature
          controllers/    --> all Controllers relative to this feature, and their relative .test.js files
          templates/      --> all Templates relative to this feature
          
  index.html              --> main index file (the main html template file of the app)
  
  
karma.conf.js             --> config file for running unit tests with Karma


e2e-tests/                --> end-to-end tests
  conf/                   --> Protractor config files
    ...
  abstract/               --> PageObject and Component abstraction objects
    ...
  pages/                  --> application-specific PageObjects
    ...
  specs/                  --> test-case specification files
    ...
gulpfile.js               --> Gulp tasks definition


build/                    --> the compiled application files
```



### Running Unit Tests

The app comes preconfigured with unit tests. These are written in
[Jasmine][jasmine], which we run with the [Karma Test Runner][karma]. There is a Karma
configuration file to run them.

* the configuration is found at `karma.conf.js`
* the unit tests are found next to the code they are testing and are named as `....test.js`.

To run the unit tests, use the supplied gulp task:

```bash
gulp karma
```

or, if you don't have Gulp installed globally:

```bash
npm run test
```

This script will start the Karma test runner to execute the unit tests.

A coverage html report will be generated, it will be available at ```http://localhost:8000/report/coverage```.

A complexity html report will be generated, it will be available at ```http://localhost:8000/report/complexity```.


### End to end testing

**Prerequisites**: you should have webdriver and protractor installed globally.
Install them running 

```
npm install protractor -g
```
**Then**:

1. Run the HTTP server with ``` npm start ```
2. Run the webdriver server with ``` webdriver-manager start ```
3. Run protractor with ``` npm run e2e ```

In addition, since Protractor is built upon WebDriver we need to install this.  There
is a predefined script to do this:

```
npm run update-webdriver
```

This will download and install the latest version of the stand-alone WebDriver tool.

Once you have ensured that the development web server hosting our application is up and running
and WebDriver is updated, you can run the end-to-end tests using the supplied npm script:

```
npm run protractor
```

This script will execute the end-to-end tests against the application being hosted on the
development server.



### Running the App during Development

Start the HTTP server running  ``` npm start ```