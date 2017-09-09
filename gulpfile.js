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

// Placeholder for project cards HTML
var cardsHtmlSource = '';

// cleanPath method with a specific path (returns a promise)
function cleanPath(path) {
	return del(path);
}

// Delete everything in destination directory
gulp.task('clean', function (cb) {
	return del(`${basePaths.dest}/**/*`, cb);
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
gulp.task('inject-tags', ['clean', 'headerfooter'], function () {
	var metaTags = JSON.parse(fs.readFileSync(`${paths.partials}/metatags.json`));

	// Inject page titles and meta description tags
	for (var key in metaTags) {
		var destinationFile = `${basePaths.dest}/${metaTags[key]['file']}.html`;

		gutil.log(`\t Adding tags to ` + gutil.colors.green(`[ ${destinationFile} ]` ));

		// gulp-template: Inject JSON into HTML header
		gulp.src(destinationFile)
			.pipe(template({
				title: metaTags[key]['title'],
				description: metaTags[key]['description'],
			}))
			.pipe(gulp.dest(`${basePaths.dest}`));
	} // End for loop through meta tags
});

// Create project pages on the fly
gulp.task('project-templates', ['inject-tags'], function () {
	var projects = JSON.parse(fs.readFileSync(`${paths.partials}/projects.json`));
	var sourceTemplate = fs.readFileSync(`${paths.partials}/project-template.html`);

	var templateCard = `${paths.partials}/card-template.html`;
	var templateProject = `${paths.partials}/project-template.html`;

	var projectFilename = '';
	var tempCardHtml = '';
	var cardPaths = [];

	var promises = [];

 	var promises = Object.keys(projects).map(function (key) {
        var deferred = Q.defer();
        var proj = projects[key];

		projectFilename = `${proj['slug']}.html`;
		projectTempCard = `card-${projectFilename}`;

        gutil.log(`\tProcessing ` + gutil.colors.green(`[${proj['slug']}]` ));

        var fullCardPath = `${paths.project.dest}/card-${projectFilename}`;

        //gutil.log('\t' + fullCardPath);

        // Create temporary individual project card HTML files
		gulp.src(templateCard)
			.pipe(template({
				slug: proj['slug'],
				thumb: proj['thumb'],
				title: proj['title'],
				subtitle: proj['subtitle'],
				button: proj['button'],
				link: proj['link'],
			}))
			.pipe(rename(projectTempCard))
			.pipe(gulp.dest(`${paths.project.dest}`))
			.pipe(through.obj(function (chunk, enc, cb) {
				// Append project card HTML source
				cardsHtmlSource += fs.readFileSync(fullCardPath, { encoding: 'utf-8' });
                deferred.resolve();
			}));

		// Use template project to create dummy project files
		// (eg:  /dist/projects/fifa-gate.html)
		gulp.src(templateProject)
			.pipe(rename(projectFilename))
			.pipe(gulp.dest(paths.project.dest));

		console.log(`${paths.project.dest}/${projectFilename}`);
		// Go over each of those files, and inject project details
		gulp.src(`${paths.project.dest}/${projectFilename}`)
			.pipe(template({
				slug: projects[key]['slug'],
				title: projects[key]['title'],
				subtitle: projects[key]['subtitle'],
				detail: projects[key]['detail'],
				media: '',
			}))
			.pipe(gulp.dest(paths.project.dest));

        return deferred.promise;
    });
    return Q.all(promises);


	/*
	 * Create individual project HTML files, while building up array of project cards
	 * for parent Projects page.
	 */

	/*
	for (var key in projects) {
		// cardPaths.push(fullCardPath);
	} // End for loop through projects.json
	*/
});

gulp.task('projects-page', ['project-templates'], function () {
	var sourceFile = `${basePaths.dest}/projects.html`;
	gutil.log(`\tInjecting all the project cards into ` + gutil.colors.green(sourceFile));

	// Inject project details into project pages, delete temp card files when done
	gulp.src(sourceFile)
		.pipe(template({
			projects: cardsHtmlSource,
		}))
		.pipe(gulp.dest(`${basePaths.dest}`))
		.on('end', function() {
			cleanPath('dist/project/card-*.html');
		});
});


// Compile SASS into CSS, auto-injecting changed files into browser
gulp.task('sass', function() {
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
gulp.task('copy', ['clean'], function() {
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
		'project-templates'
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
