module.exports = function(){
    // variable to reuse source client
    var client = './src/client/';
    var clientApp = client + 'app/';
    var temp = './.tmp/';
    var server = './src/server/';

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
        htmlTemplates: clientApp + '**/*.html',
        images: client + 'images/**/*.*',
        index: client + 'index.html',
        js: [
            clientApp + '**/*.module.js', // get modules first
            clientApp + '**/*.js', // get remaining js files
            '!' + clientApp + '**.*.spec.js'
        ],
        less:  client + 'styles/styles.less',
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

    return config;
};