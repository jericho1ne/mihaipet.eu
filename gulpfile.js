var
	fs = require('fs'),
	gulp = require('gulp'),
	del = require('del'),
	merge = require('merge-stream'),
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


// cleanPath method using a wildcard path (returns a promise)
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
				thumb: 		proj['media']['thumb'],
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

var getCardsHtml = function() {
	var projects = JSON.parse(fs.readFileSync(`${paths.partials}/projects.json`));
	var cardsHtmlSource = '';
	var destinationCard = '';

	for (var i in projects) {
		var proj = projects[i];
		destinationCard = `${paths.project.dest}/card-${proj['slug']}.html`;
		gutil.log(`\t Appending ` + gutil.colors.green(`[${destinationCard}]` ));
		// Append project card HTML source, forcing a synchronous read
		cardsHtmlSource += fs.readFileSync(destinationCard, { encoding: 'utf-8' });
	}
	return cardsHtmlSource;
};

// Clean tasks for various purposes
gulp.task('clean-css', function (cb) {
	return del(`${paths.styles.dest}/**/*`, cb);
});
gulp.task('clean-html', function (cb) {
	return del(`${basePaths.dest}/**/*.html`, cb);
});

// Create project pages
gulp.task('project-pages', function () {
	var projects = JSON.parse(fs.readFileSync(`${paths.partials}/projects.json`));
	var templateProject = `${paths.partials}/project-template.html`;
	var projectDest = `${paths.project.dest}`;
	var projectFilename = '';

	// Loop through projects array, spawing individual project files
	var promises = Object.keys(projects).map(function (key) {
		var deferred = Q.defer();
		var proj = projects[key];
		var imageHolder = '';

		projectFilename = `${proj['slug']}.html`;
		destinationProject = `${projectDest}/${projectFilename}`;

		gutil.log(`\t Creating ` + gutil.colors.green(`[${projectFilename}]` ));

		// If image files exist, create parent elemen to hold them
		if (proj['media']['images'].length) {
			gutil.log(proj['media']['images']);
			for (var i in proj['media']['images']) {
				imageHolder +=
					`<div class=\"\"><img class="img-fluid" src=\"${proj['media']['images'][i]}\"></div>`;
			}
		}
		// Use `project-template.html` as the template
		gulp.src(templateProject)
			.pipe(template({
				slug: 		proj['slug'],
				title: 		proj['title'],
				subtitle: 	proj['subtitle'],
				detail: 	proj['detail'],
				tech: 		proj['tech'],
				embed: 		proj['media']['embed'],
				media: 		imageHolder,
			}))
			// rename to eg: `{project-slug}.html`
			.pipe(rename(projectFilename))
			// output file above to `/dist/projects/`
			.pipe(gulp.dest(paths.project.dest))
			.on('end', function() {
				return deferred.promise;
			});
	});
	return Q.all(promises);
});

// Create project cards on the fly
gulp.task('project-cards', ['copy-html'], function() {
	return new Promise(function(resolve, reject) {
		createProjectCards()
			.then(function() {
				// Get HTML string of all project cards
				var cardsHtmlSource = getCardsHtml();

				// Delete the physical files
				cleanPath('dist/project/card-*.html');

				gutil.log(`\t Injecting card html > ` + gutil.colors.green(`${basePaths.dest}/projects.html`));

				// Inject project details into project pages, delete temp card files when done
				gulp.src(`${basePaths.dest}/projects.html`)
					.pipe(template({
						projects: cardsHtmlSource,
					}))
					.pipe(rename('projects.html'))
					.pipe(gulp.dest(`${basePaths.dest}`))
					.on('end', resolve);
			});
	}); // End Promise
});

// Inject the page header and footer, copy them to destination folder
// Has to wait for `project-cards` to finish
gulp.task('main-headerfooter', ['project-cards'], function () {
	gutil.log(`\t Starting ` + gutil.colors.green(`main-headerfooter`) + ` task`);

	// Only perform this task on `dist/{main-file}.html`
	return gulp.src(basePaths.dest + '/*.html')
		.pipe(headerfooter.header(paths.partials + '/header.html'))
		.pipe(headerfooter.footer(paths.partials + '/footer.html'))
		.pipe(gulp.dest(basePaths.dest))
		.on('end', function() {
			gutil.log(`Finished ` + gutil.colors.green(`main-headerfooter`) + ` task`);
		});
});

// Inject the page header and footer into the individual project files, which were
// dynamically created by the `project-pages` task
gulp.task('project-headerfooter', ['project-pages'], function () {
	gutil.log(`\t Started ` + gutil.colors.green(`project-headerfooter`) + ` task`);

	// Only perform this task on `dist/project/{project-name}.html`
	return gulp.src(basePaths.dest + '/project/*.html')
		.pipe(headerfooter.header(paths.partials + '/project-header.html'))
		.pipe(headerfooter.footer(paths.partials + '/project-footer.html'))
		.pipe(gulp.dest(basePaths.dest + '/project/'))
		.on('end', function() {
			gutil.log(`>> Finished ` + gutil.colors.green(`project-headerfooter`) + ` task`);
		});
});

// Page-specific meta tags (title, description, etc)
// Must wait on headerfooter task to complete
gulp.task('inject-main-tags', ['main-headerfooter'], function () {
	var metaTags = JSON.parse(fs.readFileSync(`${paths.partials}/main-tags.json`));
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

gulp.task('inject-project-tags', ['project-headerfooter'], function () {
	var projects = JSON.parse(fs.readFileSync(`${paths.partials}/projects.json`));
	// Inject page titles and meta description tags
	for (var key in projects) {
		var destinationFile = `${paths.project.dest}/${projects[key]['slug']}.html`;
		gutil.log(`\t Adding tags to ` + gutil.colors.green(`[ ${destinationFile} ]` ));
		gulp.src(destinationFile)
			.pipe(template({
				title: projects[key]['title'],
				description: projects[key]['subtitle'],
			}))
			.pipe(gulp.dest(`${paths.project.dest}`));
	} // End for loop through meta tags
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

gulp.task('copy-html', function() {
	return gulp.src([
			`${basePaths.src}/*.html`,
			// `${basePaths.src}/project/*.html`,
		]).pipe(gulp.dest(basePaths.dest));
});

// Copy lib libraries from /node_modules into /lib
gulp.task('copy', function() {
	gutil.log(`>> Started ` + gutil.colors.green(`copy`) + ` task`);

	// Copy html files, making sure this happens synchronously
	return merge(
		// Copy media files
		gulp.src([`${paths.media.src}/**/*`]).pipe(gulp.dest(paths.media.dest)),

		// Copy project files
		// gulp.src([`${paths.project.src}/**/*`]).pipe(gulp.dest(paths.project.dest)),

		// Copy PHP library files
		gulp.src([`${paths.php.src}/*`]).pipe(gulp.dest(paths.php.dest)),

		// Copy robots.txt
		gulp.src([`${basePaths.src}/*.txt`]).pipe(gulp.dest(basePaths.dest)),

		// Copy misc root items (favicons, sitemap) and project images
		gulp.src([
			`${basePaths.src}/*.js`,
			`${basePaths.src}/*.ico`,
			`${basePaths.src}/*.json`,
			`${basePaths.src}/*.png`,
			`${basePaths.src}/*.xml`,
			`${basePaths.src}/**/*.jpg`,
			`${basePaths.src}/.htaccess`,
		])
		.pipe(gulp.dest(basePaths.dest))
	);
	// NOTE: JS files are copied as part of MinifyJS task
});

//
// MAIN TASK
//

// Static Server + watch scss/html files
gulp.task('serve',
	[
		'clean-html',
		'copy-html',
		//'project-cards',
		'project-pages',
		'main-headerfooter',
		'project-headerfooter',
		'sass',
		'minify-css',
		'minify-js',
		'copy',
		'inject-main-tags',
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
			], ['project-cards', 'project-pages', 'main-headerfooter', 'project-headerfooter', 'inject-main-tags']);

		// Enable file watchers which will trigger a browser reload
		gulp.watch(paths.styles.src + '/*.scss', ['sass']);
		gulp.watch(paths.styles.dest + '/*.css', ['minify-css']);
		gulp.watch(paths.scripts.src + '/*.js' , ['minify-js']);

		// Copy over then reload) when these change
		gulp.watch([
			basePaths.src + '/*.js',
			basePaths.src + '/*.json'
		], ['copy']);

		gulp.watch([
			basePaths.dest + '/*.html',
			basePaths.dest + '/*.json',
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
