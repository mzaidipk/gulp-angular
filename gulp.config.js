module.exports = function(){
    // variable to reuse source client
    var root = './';
    var client = './src/client/';
    var clientApp = client + 'app/';
    var temp = './.tmp/';
    var report = './report/';
    var server = './src/server/';
    var specRunnerFile = 'specs.html';
    var wiredep = require('wiredep');
    var bowerFiles = wiredep({devDependencies: true})['js']; 
    var config = {
        /**
         * File paths
         */
        alljs: [
            //'./src/client/app/customers/*.js'
            './src/**/*.js',
            '!node_modules/**'
            //'./*.js'
	    ],
        build: './build/',
        client: client,
        css: temp + 'styles.css',
        fonts: './bower_components/font-awesome/fonts/**/*.*',
        html: clientApp  + '/**/*.html',
        htmlTemplates: clientApp + '**/*.html',
        images: client + 'images/**/*.*',
        index: client + 'index.html',
        js: [
            clientApp + '**/*.module.js', // get modules first
            clientApp + '**/*.js', // get remaining js files
            '!' + clientApp + '**/*.spec.js'
        ],
        less:  client + 'styles/styles.less',
        report: report,
        root: root,
        server: server,
        temp: temp,
        /**
         * template cache
         */
        templateCache: {
            file: 'templates.js',
            options: {
                module: 'app.core',
                standAlone: false, // if true then we need to app to depend on this module e.g angular.module(app, ['app.core''])
                root: 'app/' // this is to tell angular to start from here and not to worry about prefix
            }
        },
        /**
         * BrowserSync configs
         */
        browserReloadDelay: 1000,
        /**
         * Bower and NPM locations
         */
        bower: {
            json: require('./bower.json'),
            directory: './bower_components',
            ignorePath: '../..'
        },
        packages: [
            './package.json',
            './bower.json'
        ],

        /**
         * specs.html, our HTML spec runner
         */
        specRunner: client + specRunnerFile,
        specRunnerFile: specRunnerFile,
        testlibraries: [
           'node_modules/mocha/mocha.js',
           'node_modules/chai/chai.js',
           'node_modules/mocha-clean/index.js',
           'node_modules/sinon-chai/lib/sinon-chai.js'
        ],
        specs: [clientApp + '**/*.spec.js'],

        /**
         * Karma and testing settings
         */
        specHelpers: [client + 'test-helpers/*.js'],
        serverIntegrationSpecs: [client + 'tests/server-integration/**/*.spec.js'],

        /**
         * Node Settings
         */
        defaultPort: 7203,
        nodeServer: './src/server/app.js'
    };

    config.getWiredepDefaultOptions = function () {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        };
        return options;
    };
    
    config.karma = getKarmaOtions();

    return config;
    
    ////////

    function getKarmaOtions() {
        var options = {
            files: [].concat(
                bowerFiles, 
                config.specHelpers,
                client + '**/*.module.js',
                client + '**/*.js',
                temp + config.templateCache.file,
                config.serverIntegrationSpecs
            ),
            exclue: [],
            coverage: {
                dir: report + 'coverage',
                reporters: [
                    {type: 'html', subdir: 'report-html'},
                    {type: 'lcov', subdir: 'report-lcov'},
                    {type: 'text-summary'},
                ]
            },
            preprocessors: {}
        };
        options.preprocessors[clientApp + '**/!(*.spec)+(.js)'] = ['coverage'];
        return options;
    }
};