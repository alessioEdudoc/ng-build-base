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
- Watch mode




## Getting Started

To get you started you can simply clone the repository and install the dependencies:

### Prerequisites

You need git to clone the ng-build-base repository. You can get git from
[http://git-scm.com/](http://git-scm.com/).

We also use a number of node.js tools to initialize and test ng-build-base. You must have node.js and
its package manager (npm) installed.  You can get them from [http://nodejs.org/](http://nodejs.org/).

### Clone ng-build-base

Clone the ng-build-base repository using [git][git]:

```
git clone https://github.com/sefvef/ng-build-base.git
cd ng-build-base
```

If you just want to start a new project without the ng-build-base commit history then you can do:

```bash
git clone --depth=1 https://github.com/sefvef/ng-build-base.git <your-project-name>
```

The `depth=1` tells git to only pull down one commit worth of historical data.

### Install Dependencies

We have two kinds of dependencies in this project: tools and angular framework code.  The tools help
us manage and test the application.

* We get the tools we depend upon via `npm`, the [node package manager][npm].
* We get the angular code via `bower`, a [client-side code package manager][bower].

We have preconfigured `npm` to automatically run `bower` so we can simply do:

```
npm install
```

Behind the scenes this will also call `bower install`.  You should find that you have two new
folders in your project.

* `node_modules` - contains the npm packages for the tools we need
* `app/bower_components` - contains the angular framework files

*Note that the `bower_components` folder would normally be installed in the root folder but
angular-seed changes this location through the `.bowerrc` file.  Putting it in the app folder makes
it easier to serve the files by a webserver.*

### Build the Application

To have a set of available **gulp** options and tasks, run

```
gulp help
```
Running ```gulp -c dev``` will build the application in "dev" mode (without optimizations like
file minification, concatenation, html2js...)


### Version bumping

The version is automatically updated each time you build the application (not in watch mode).
The version is usually in the form '1.2.3-build.4', where:
1. is the **major** version
2. is the **minor** version
3. is the **patch** version
4. is the **prerelease** version

If no option is provided, then the prerelease version is automatically incremented.
To increment major, minor or patch version, run ```gulp -v major```, ```gulp -v minor``` or ```gulp -v patch```
If a version is incremented, all lower versions are resetted, e.g. running ```gulp -v minor``` will
increment the minor version, and reset the patch and prerelease version.

To set an arbitrary version number, run ```gulp -v 0.0.0``` (replace 0.0.0 with the version number)

####Examples:

- 1.0.2-build.3  ->  ```gulp```  ->  1.0.2-build.4
- 1.0.2-build.3  ->  ```gulp -v minor```  ->  1.1.0
- 1.0.2-build.3  ->  ```gulp -v major```  ->  2.0.0
- 1.0.2-build.3  ->  ```gulp -v 1.2.3```  ->  1.2.3


### Run the Application

There is a simple development web server.  The simplest way to start
this server is:

```
npm start
```

Now browse to the app at `http://localhost:8000/build/index.html`.



## Directory Layout

```
app/                  --> all of the source files for the application
  feat/                 --> all app specific features
    <feature A>/              --> files related to feature "A"
      ctrl/                    --> controllers related to feature "A"
      tmpl/                    --> templates related to feature "A"
  less/                       --> LESS files
    styles.less               --> main LESS file
  app.js                --> main application module
  index.html            --> app layout file (the main html template file of the app)
karma.conf.js         --> config file for running unit tests with Karma
e2e-tests/            --> end-to-end tests
  protractor-conf.js    --> Protractor config file
  scenarios.js          --> end-to-end scenarios to be run by Protractor
gulpfile.js           --> Gulp tasks definition
  gulp/               --> build configuration files

build/                --> the compiled application files
```



### Running Unit Tests

The app comes preconfigured with unit tests. These are written in
[Jasmine][jasmine], which we run with the [Karma Test Runner][karma]. There is a Karma
configuration file to run them.

* the configuration is found at `karma.conf.js`
* the unit tests are found next to the code they are testing and are named as `..._test.js`.

The easiest way to run the unit tests is to use the supplied npm script:

```
npm test
```

This script will start the Karma test runner to execute the unit tests. Moreover, Karma will sit and
watch the source and test files for changes and then re-run the tests whenever any of them change.
This is the recommended strategy; if your unit tests are being run every time you save a file then
you receive instant feedback on any changes that break the expected code functionality.

You can also ask Karma to do a single run of the tests and then exit.  This is useful if you want to
check that a particular version of the code is operating as expected.  The project contains a
predefined script to do this:

```
npm run test-single-run
```


### End to end testing

The build configuration comes with end-to-end tests, again written in [Jasmine][jasmine]. These tests
are run with the [Protractor][protractor] End-to-End test runner.  It uses native events and has
special features for Angular applications.

* the configuration is found at `e2e-tests/protractor-conf.js`
* the end-to-end tests are found in `e2e-tests/scenarios.js`

Protractor simulates interaction with our web app and verifies that the application responds
correctly. Therefore, our web server needs to be serving up the application, so that Protractor
can interact with it.

```
npm start
```

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


## Updating Angular

You can update the tool dependencies by running:

```
npm update
```

This will find the latest versions that match the version ranges specified in the `package.json` file.

You can update the Angular dependencies by running:

```
bower update
```

This will find the latest versions that match the version ranges specified in the `bower.json` file.


### Running the App during Development

The angular-seed project comes preconfigured with a local development webserver.  It is a node.js
tool called [http-server][http-server].  You can start this webserver with `npm start` but you may choose to
install the tool globally:

```
sudo npm install -g http-server
```

Then you can start your own development web server to serve static files from a folder by
running:

```
http-server -a localhost -p 8000
```

Alternatively, you can choose to configure your own webserver, such as apache or nginx. Just
configure your server to serve the files under the `build/` directory.
