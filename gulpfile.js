var
	fs = require('fs'),
	gulp = require('gulp'),
	del = require('del'),
	Q = require('q'),
	through = require('through2'),
	template = require('gulp-template'),
	headerfooter = require('gulp-headerfooter'),
	sass = require('gulp-sass'),
	uglify = require('gulp-uglify'),
	rename = require("gulp-rename"),
	// ghPages = require('gulp-gh-pages'),
	// importJson = require('gulp-sass-import-json'),
	gutil = require('gulp-util'),
	browserSync = require('browser-sync').create();

// FILE PATHS
var basePaths = {
	src: 'src',
	dest: 'dist'
};
var paths = {
	lib: basePaths.dest + '/lib',
	partials: basePaths.src + '/partials',
	media: {
		src: basePaths.src + '/media',
		dest: basePaths.dest + '/media'
	},
	project: {
		src: basePaths.src + '/project',
		dest: basePaths.dest + '/project'
	},
	scripts: {
		src: basePaths.src + '/js',
		dest: basePaths.dest + '/js'
	},
	php: {
		src: basePaths.src + '/php',
		dest: basePaths.dest + '/php'
	},
	styles: {
		src: basePaths.src + '/scss',
		dest: basePaths.dest + '/css'
	}
};

var cardsHtmlSource = '';


// cleanPath method with a specific path (returns a promise)
function cleanPath(path) {
	return del(path);
}

var createProjectCards = function() {
	var deferred = Q.defer();
	var projects = JSON.parse(fs.readFileSync(`${paths.partials}/projects.json`));
	var projectFilename = '';
	var templateCard = `${paths.partials}/card-template.html`;

    var promises = Object.keys(projects).map(function (key) {
        var deferred = Q.defer();
        var proj = projects[key];

		gutil.log('\t Building Card: ' + gutil.colors.blue(proj['slug']));
		projectFilename = `${proj['slug']}.html`;

		gulp.src(templateCard)
			.pipe(template({
				slug: 		proj['slug'],
				thumb: 		proj['thumb'],
				title: 		proj['title'],
				subtitle: 	proj['subtitle'],
				button: 	proj['button'],
				link: 		proj['link'],
			}))
			.pipe(rename('card-' + projectFilename))
			.pipe(gulp.dest(`${paths.project.dest}`))
			.pipe(through.obj(function (chunk, enc, cb) {
                deferred.resolve();
			}));
        return deferred.promise;
    });
    return Q.all(promises);
};

/*
	var templateProject = `${paths.partials}/project-template.html`;
	var projectDest = `${paths.project.dest}`;


	var promises = Object.keys(projects).map(function (key) {
        var deferred = Q.defer();
        var proj = projects[key];

        projectFilename = `${proj['slug']}.html`;
		destinationProject = `${projectDest}/${projectFilename}`;


		// Go over each of those files, and inject project details
		gutil.log(`\t Creating ` + gutil.colors.green(`[${projectFilename}]` ));

		gulp.src(templateProject)
			.pipe(template({
				slug: projects[key]['slug'],
				title: projects[key]['title'],
				subtitle: projects[key]['subtitle'],
				detail: projects[key]['detail'],
				media: '',
			}))
			// rename to eg: `fifa-gate.html`
			.pipe(rename(projectFilename))
			// output file above to `/dist/projects/`
			.pipe(gulp.dest(paths.project.dest))
			.on('end', function() {
				gutil.log(`\t destinationProject ` + gutil.colors.green(`[${destinationProject}]` ));
			  	return deferred.promise;
			});
    });
    return Q.all(promises);*/

// Clean tasks for various purposes
gulp.task('clean-css', function (cb) {
	return del(`${paths.styles.dest}/**/*`, cb);
});
gulp.task('clean-html', function (cb) {
	return del(`${basePaths.dest}/**/*.html`, cb);
});


// Inject the page header and footer, copy them to destination folder
gulp.task('headerfooter', function () {
	gutil.log(`\t Started ` + gutil.colors.green(`headerfooter`) + ` task`);

	return gulp.src(basePaths.src + '/*.html')
		.pipe(headerfooter.header(paths.partials + '/header.html'))
		.pipe(headerfooter.footer(paths.partials + '/footer.html'))
		.pipe(gulp.dest(basePaths.dest))
		.on('end', function() {
			gutil.log(`>> Finished ` + gutil.colors.green(`headerfooter`) + ` task`);
		});
});

// Page-specific meta tags (title, description, etc)
// Must wait on headerfooter task to complete
gulp.task('inject-tags', ['clean-html', 'headerfooter'], function () {
	var metaTags = JSON.parse(fs.readFileSync(`${paths.partials}/metatags.json`));

	// Inject page titles and meta description tags
	for (var key in metaTags) {
		var destinationFile = `${basePaths.dest}/${metaTags[key]['file']}.html`;
		gutil.log(`\t Adding tags to ` + gutil.colors.green(`[ ${destinationFile} ]` ));
		gulp.src(destinationFile)
			.pipe(template({
				title: metaTags[key]['title'],
				description: metaTags[key]['description'],
			}))
			.pipe(gulp.dest(`${basePaths.dest}`));
	} // End for loop through meta tags
});

// Create project pages
gulp.task('project-pages', function () {

});

gulp.task('cards', function() {
	createProjectCards()
		.then(function(data) {
			// Append project card HTML source
				// destinationCard = `${paths.project.dest}/card-${projectFilename}`;
				// gutil.log(`\t destinationCard ` + gutil.colors.green(`[${destinationCard}]` ));
                //  gutil.log(cardsHtmlSource);
	    	gutil.log(' >>>> DONE');
	    	// gutil.log(cardsHtmlSource);
	 	});
});
// Create project cards on the fly
gulp.task('project-cards', function () {
	var projects = JSON.parse(fs.readFileSync(`${paths.partials}/projects.json`));
	var templateCard = `${paths.partials}/card-template.html`;

	var projectFilename = '';
	var destinationCard = '';

	// Placeholder for project cards HTML

	/*
	 * Create individual project card HTML files while appending their contents
	 * to an HTML string for the parent `projects.html` page.
	 */

	return Promise.all([
		new Promise(function(resolve, reject) {
			var key = 0;
			//Object.keys(projects).map(function (key) {
				var proj = projects[key];

				projectFilename = `${proj['slug']}.html`;
	        	destinationCard = `${paths.project.dest}/card-${projectFilename}`;


				gulp.src(templateCard)
					.pipe(template({
						slug: 		proj['slug'],
						thumb: 		proj['thumb'],
						title: 		proj['title'],
						subtitle: 	proj['subtitle'],
						button: 	proj['button'],
						link: 		proj['link'],
					}))
					.pipe(rename('card-' + projectFilename))
					.pipe(gulp.dest(`${paths.project.dest}`))
					.pipe(through.obj(function (chunk, enc, cb) {
						// Append project card HTML source
						cardsHtmlSource += fs.readFileSync(destinationCard, { encoding: 'utf-8' });
						//deferred.resolve();
					}))
					.on('end', resolve);
			//});
			gutil.log(gutil.colors.green(' Promise 1 completed '));

		}),
		new Promise(function(resolve, reject) {
			gutil.log(gutil.colors.green(' Promise 2 STARTED '));

			gutil.log(cardsHtmlSource);

			// Inject project details into project pages, delete temp card files when done
			gulp.src(`${basePaths.dest}/projects.html`)
				.pipe(template({
					projects: cardsHtmlSource,
				}))
				.pipe(gulp.dest(`${basePaths.dest}`))
				.on('end', resolve);

			/*
			gulp.src(src + '/*.md')
				.pipe(plugin())
				.on('error', reject)
				.pipe(gulp.dest(dist))
				.on('end', resolve); */
			gutil.log(gutil.colors.green(' Promise 2 completed '));
		})
	])
	.then(function () {
		gutil.log(gutil.colors.green(' .then reached '));
		console.log(cardsHtmlSource);
		// Other actions
	});

	/*
 	var promises = Object.keys(projects).map(function (key) {
        var deferred = Q.defer();
        var proj = projects[key];

		projectFilename = `${proj['slug']}.html`;
        destinationCard = `${paths.project.dest}/card-${projectFilename}`;

		gulp.src(templateCard)
			.pipe(template({
				slug: 		proj['slug'],
				thumb: 		proj['thumb'],
				title: 		proj['title'],
				subtitle: 	proj['subtitle'],
				button: 	proj['button'],
				link: 		proj['link'],
			}))
			.pipe(rename('card-' + projectFilename))
			.pipe(gulp.dest(`${paths.project.dest}`))
			.pipe(through.obj(function (chunk, enc, cb) {
				// Append project card HTML source
				cardsHtmlSource += fs.readFileSync(destinationCard, { encoding: 'utf-8' });
                deferred.resolve();
			}));

        return deferred.promise;
    });
    return Q.all(promises);
    */
});

gulp.task('projects-parent', ['project-cards'], function () {
	gutil.log(`\tInjecting cards > ` + gutil.colors.green(`${basePaths.dest}/projects.html`));

	// Inject project details into project pages, delete temp card files when done
	gulp.src(`${basePaths.dest}/projects.html`)
		.pipe(template({
			projects: cardsHtmlSource,
		}))
		.pipe(gulp.dest(`${basePaths.dest}`));
		/*
		.on('end', function() {
			cleanPath('dist/project/card-*.html');
		});
		*/
});


// Compile SASS into CSS, auto-injecting changed files into browser
gulp.task('sass', ['clean-css'], function() {
	return gulp.src(`${paths.styles.src}/styles.scss`)
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest(paths.styles.dest))
		.pipe(browserSync.stream());
});

// Minify JS
gulp.task('minify-js', function() {
	return gulp.src(`${paths.scripts.src}/*.js` )
		.pipe(uglify())
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest(paths.scripts.dest))
		.pipe(browserSync.stream());
});

// Minify compiled CSS
gulp.task('minify-css', ['sass'], function() {
	return gulp.src(`${paths.styles.dest}/styles.css`)
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest(paths.styles.dest))
		.pipe(browserSync.stream());
});

// Copy lib libraries from /node_modules into /lib
gulp.task('copy', function() {
	gutil.log(`>> Started ` + gutil.colors.green(`copy`) + ` task`);

	// Copy media files
	gulp.src([`${paths.media.src}/**/*`]).pipe(gulp.dest(paths.media.dest));

	// Copy project files
	gulp.src([`${paths.project.src}/**/*`]).pipe(gulp.dest(paths.project.dest));

	// Copy PHP library files
	gulp.src([`${paths.php.src}/*`]).pipe(gulp.dest(paths.php.dest));

	// Copy robots.txt
	gulp.src([`${basePaths.src}/*.txt`]).pipe(gulp.dest(basePaths.dest));

	// Copy misc root items: favicons, sitemap
	gulp.src([
		`${basePaths.src}/*.ico`,
		`${basePaths.src}/*.png`,
		`${basePaths.src}/*.xml`,
		`${basePaths.src}/.htaccess`,
	])
	.pipe(gulp.dest(basePaths.dest))
	.on('end', function() {
		gutil.log(`>> Finished ` + gutil.colors.green(`copy`) + ` task`);
	});
	// NOTE: JS files are copied as part of MinifyJS task
});

//
// MAIN TASK
//

// Static Server + watch scss/html files
gulp.task('serve',
	[
		'headerfooter',
		'sass',
		'minify-css',
		'minify-js',
		'copy',
		'inject-tags',
	], function() {
		// Initialize a local server in the styleguide root directory
		browserSync.init({
			server: basePaths.dest
		});

		// Watch all HTML files and the meta tags JSON
		gulp.watch([
				paths.partials + '/*.html',
				basePaths.src + '/*.html',
				paths.partials + '/*.json',
			], ['headerfooter', 'inject-tags', 'project-templates']);

		// Enable file watchers which will trigger a browser reload
		gulp.watch(paths.styles.src + '/*.scss', ['sass']);
		gulp.watch(paths.styles.dest + '/*.css', ['minify-css']);
		gulp.watch(paths.scripts.src + '/*.js' , ['minify-js']);

		gulp.watch([
			basePaths.dest + '/*.html',
			paths.scripts.dest + '/*.js',
		]).on('change', browserSync.reload);
	}
);

// Deploy to gh-pages branch
gulp.task('publish', function() {
  return gulp.src(basePaths.dest + '/**/*')
	.pipe(ghPages());
});

gulp.task('default', ['serve']);
