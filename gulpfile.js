/* eslint-disable angular/typecheck-object, angular/timeout-service */

var gulp = require('gulp');
var doc  = require('gulp-task-doc').patchGulp();
var args = require('yargs').argv; // plugin for supplying command line arguments e.g 'gulp eslint --verbose --nofix'
var browserSync = require('browser-sync');
var config = require('./gulp.config')(); // execute to get the value load
var del = require('del');
var $ = require('gulp-load-plugins')({lazy: true}); //lazy load plugins as used
var port = process.env.PORT || config.defaultPort;

// var eslint = require('gulp-eslint');
// var eslintIfFixed = require('gulp-eslint-if-fixed');
// var gulpprint = require('gulp-print');
// var gulpif = require('gulp-if');
// var plumber = require('gulp-plumber');

/**
 * provides task listing 
 */
gulp.task('taskListing', $.taskListing); // list all available tasks in this gulp file.

/**
 * This is the main help task 
 * @verbose
 */
gulp.task('help', (args.nodetail) ? ['taskListing'] : ['taskListing', 'taskListComments']);

/**
 * This task will provide detail comments on each task
 * @verbose
 */
gulp.task('taskListComments', doc.help());

/**
 * call the help task for task listing and details
 * @verbose
 */
gulp.task('default',['help']); 

/**
 * Lint js and save them back to the source
 * --verbose will print files that will be affected
 * --nofix CLI argument will lint but not fix the source 
 */
gulp.task('es-lint', function()
{
	log('linting source files with eslint');
	// ESLint ignores files with "node_modules" paths. 
    // So, it's best to have gulp ignore the directory as well. 
    // Also, Be sure to return the stream from the task; 
    // Otherwise, the task may end before the stream has finished.
	return gulp.src(config.alljs)
	.pipe($.plumber({
			errorHandler: errorLogger
		}))
	// if argument --verbose is supplied print the files that are affected
	.pipe($.if(args.verbose, $.print()))
	// eslint() attaches the lint output to the "eslint" property 
	// of the file object so it can be used by other modules. 
	.pipe($.if(args.nofix, $.eslint(), $.eslint({ fix: true })))
	// eslint.format() outputs the lint results to the console. 
	// Alternatively use eslint.formatEach() (see Docs). 
	.pipe($.eslint.format())
	// if argument --nofix is supplied then dont change source files
	.pipe($.if(args.nofix, $.plumber.stop()))
	//if fixed will write files back to its source
	.pipe($.eslintIfFixed('src'));
	// .pipe(eslint.result(function (result) {
    //     // Called for each ESLint result. 
    //     console.log('ESLint result:' +  result.filePath);
	// 	console.log('# Messages:' + result.messages.length);
    //     console.log('# Warnings:' +  result.warningCount);
    //     console.log('# Errors: ' + result.errorCount);
    // }));
	// To have the process exit with an error code (1) on 
	// lint error, return the stream and pipe to failAfterError last. 
	//.pipe(eslint.failAfterError())
	//.pipe(gulp.dest('.'));// <-- update original files
});

/**
 * Compile less to CSS
 * Calls Autoprefixer where browsers in market with last 2 version has greater than 5% market
 * Streams CSS to inject into Browser if BrowserSync is enabled
 */
gulp.task('styles', ['clean-styles'], function() {
	log('Compiling Less --> CSS');

	return gulp
		.src(config.less)
		.pipe($.plumber())
		// .pipe($.plumber({
		// 	errorHandler: errorLogger
		// }))
		.pipe($.less())
		//.on('error', errorLogger)
		.pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
		.pipe(gulp.dest(config.temp))
		.pipe($.if(browserSync.active, browserSync.stream())); // if BrowserSync is enabled and working then inject Stream CSS to Browsers

});

/**
 * Deletes build fonts folder and Copies fonts to Build
 */
gulp.task('fonts', ['clean-fonts'], function(){
	log('Copying fonts');

	return gulp.src(config.fonts)
		.pipe(gulp.dest(config.build + 'fonts'));
});

/**
 * Deletes build images folder and Copies images to Build after minifying them with Level 4 optimization
 */
gulp.task('images', ['clean-images'],function(){
	log('Copying images and compressing images');

	return gulp.src(config.images)
		.pipe($.imagemin({optimizationLevel: 4}))
		.pipe(gulp.dest(config.build + 'images'));
});

/**
 * Deletes everything in build and temp folder
 */
gulp.task('clean', function(done){
	var delconfig = [].concat(config.build, config.temp);
	log('Cleaning: ' + $.util.colors.blue(delconfig));
	del(delconfig, done);
});

/**
 * Delete CSS in Temp Folder
 */
gulp.task('clean-styles', function(done){
	// make use of call back 'done' to make sure depenent tasks wait for this task to finish
	clean(config.temp + '**/*.css', done);
});

/**
 * Delete Everything in build fonts folder
 */
gulp.task('clean-fonts', function(done){
	// make use of call back 'done' to make sure depenent tasks wait for this task to finish
	clean(config.build + 'fonts/**/*.*', done);
});

/**
 * Delete Everything in build images folder
 */
gulp.task('clean-images', function(done){
	// make use of call back 'done' to make sure depenent tasks wait for this task to finish
	clean(config.build + 'images/**/*.*', done);
});

/**
 * Delete html and js files in build folder also js files in temp folder
 */
gulp.task('clean-code', function(done){
	var files = [].concat(
		config.temp + '**/*.js',
		config.build + '**/*.html',
		config.build + 'js/**/*.js'
	);
	// make use of call back 'done' to make sure depenent tasks wait for this task to finish
	clean(files, done);
});

/**
 * Wire up the bower css js and our app js into the html
 */
gulp.task('wiredep',function () {
	log('Wire up the bower css js and our app js into the html');

	var options = config.getWiredepDefaultOptions();
	var wiredep = require('wiredep').stream;

	return gulp
		.src(config.index)
		.pipe(wiredep(options))
		.pipe($.inject(gulp.src(config.js)))
		.pipe(gulp.dest(config.client));
});

/**
 * Wire up app css into the html, and call wiredep
 */
gulp.task('inject', ['wiredep', 'styles', 'templatecache'], function () {
	log('Wire up app css into the html, and call wiredep');

	return gulp
		.src(config.index)
		.pipe($.inject(gulp.src(config.css)))
		.pipe(gulp.dest(config.client));
});

/**
 * optimizing the javascript, css, html for build
 * inject templateCache in the html
 */
gulp.task('optimize', ['inject'], function () {
	log('optimizating the javascript, css, html');
	var templateCache = config.temp + config.templateCache.file;
	var assets = $.useref({searchPath: './'});

	return gulp
		.src(config.index)
		.pipe($.plumber())
		// find the templateCache file location don't read it as stream yet
		// supply option to find start tag in config.html to inject changes
		.pipe($.inject(gulp.src(templateCache, {read: false}),{
			starttag: '<!-- inject:templates:js -->'
		}))
		.pipe(assets)
		.pipe(gulp.dest(config.build));
});

/**
 * start the App by Cranking up node server using express
 * will start browserSync automatically once server is Started 
 * this task is dependent upon inject
 */
gulp.task('serve-dev', ['inject'], function(){
	var isDev = true;

	var nodeOptions = {
		script: config.nodeServer,
		delayTime: 1, //1 sec
		env: {
			'PORT' : port,
			'NODE_ENV': isDev ? 'dev' : 'build'
		},
		watch: [config.server]
	};
	return $.nodemon(nodeOptions)
			.on('restart', function(ev){
				log('*** nodemon restarted ***');
				log('files changed on restart: \n' + ev);
				setTimeout(function () {
					browserSync.notify('reloading now ...');
					browserSync.reload({stream: false});
				}, config.browserReloadDelay);
			})
			.on('start', function(){
				log('*** nodemon Started ***');
				startBrowserSync();
			})
			.on('crash', function(){
				log('*** nodemon Crashed: script crahsed for some reason ***');
			})
			.on('exit', function(){
				log('*** nodemon exited cleanly ***');
			});
});

/**
 * will watch config.less files and on change will start 'styles'' task
 */
gulp.task('less-watcher', function(){
	gulp.watch([config.less], ['styles']);
});

/**
 * will call clean-code first and then minify html and
 * then create AngularJs $templateCache based on config.templateCache settings
 */
gulp.task('templatecache', ['clean-code'], function(){
	log('creating AngularJs $templateCache');

	return	gulp.src(config.htmlTemplates)
				.pipe($.minifyHtml({empty: true}))
				.pipe($.angularTemplatecache( //gulp-angular-templatecache
						config.templateCache.file,
						config.templateCache.options
						)) 
				.pipe(gulp.dest(config.temp));
});




///////

function changeEvent(event) {
	var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
	log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
}

function startBrowserSync() {
	if(args.nosync || browserSync.active){ // do nothing if CLI passed --nosync or is already active
		return;
	}
	log('Starting browser-sync on port ' + port);

	gulp.watch([config.less], ['styles'])
		.on('change', function (event) {
			changeEvent(event);
		});

	gulp.watch(
		[	
			config.client + '**/*.*',
			'!' + config.less
		])
		.on('change', browserSync.reload);

	var options = {
		proxy:  'localhost:' + port,
		port: 3000,
		watchOptions: {
			ignoreInitial: true,
			ignored: '!' + config.less
		},
		// files: [
		// 	config.client + '**/*.*',
		// 	'!' + config.less,
		// 	config.temp + '**/*.css'
		// ],
		ghostMode: {
			clicks: true,
			location: false,
			forms: true,
			scroll: true
		},
		injectChanges: true,
		logFileChanges: true,
		logLevel: 'debug',
		logPrefix: 'gulp-patterns',
		notify: true,
		reloadDelay: 1000 // 1 sec
	};

	browserSync(options);	
}

function errorLogger (error) {
	$.util.beep();
	log('*** Start of Error ***');
	console.log(error);
	log('*** End of Error ***');
	this.emit('end');
}



function clean(path, done) {
	log('Cleaning: ' + $.util.colors.blue(path));
	//Call the Callback function 'done' passed after deleting
	del(path, done());
}

function log(msg) {
    if (typeof(msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}