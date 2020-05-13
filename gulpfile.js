const fs = require('fs');
const ssri = require('ssri');
const gulp = require('gulp');

// Loads all gulp plugins from 'nodes_modules'
const plugins = require('gulp-load-plugins')();
plugins.sass.compiler = require('node-sass');

var pkg = require('./package.json');
var src = 'src';
var dist = 'dist';


// TODO :
// -- Linter JS + CSS
// -- Image Optim


// ---------------------------------------------------------------------
// | Helper tasks                                                        |
// ---------------------------------------------------------------------

// JS
gulp.task('js:dev', () =>
  gulp.src(src + '/js/**/*.js')
    .pipe(plugins.concat('main.js'))
    .pipe(gulp.dest(dist + '/js'))
);

gulp.task('js:prod', () => 
  gulp.src(src + '/js/**/*.js')
    .pipe(sourcemaps.init())
      .pipe(plugins.concat('main.min.js'))
      .pipe(plugins.uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dist + '/js'))
);

// SASS
gulp.task('sass:dev', () =>
  gulp.src(src + '/sass/main.scss')
    .pipe(plugins.sass().on('error', plugins.sass.logError))
    .pipe(gulp.dest(dist + '/css'))
);

gulp.task('sass:prod', () => 
  gulp.src(src + '/sass/main.scss')
    .pipe(sourcemaps.init())
    .pipe(plugins.sass().on('error', plugins.sass.logError))
    .pipe(plugins.cssnano())
    .pipe(sourcemaps.write())
    .pipe(plugins.rename({ suffix: '.min' }))
    .pipe(gulp.dest(dist + '/css'))
);

// Watch changes
gulp.task('watch', () => {
  gulp.watch(src + '/sass/**/*.scss', gulp.series('sass:dev'));
  gulp.watch(src + '/js/**/*.js', gulp.series('js:dev'));
});


gulp.task('update:html', () => {
  const hash = ssri.fromData(
    fs.readFileSync('node_modules/jquery/dist/jquery.min.js'),
    { algorithms: ['sha256'] }
  );
  let version = pkg.devDependencies.jquery;
  let modernizrVersion = pkg.devDependencies.modernizr;

  return gulp.src(src + '/index.html')
    .pipe(plugins.replace(/{{JQUERY_VERSION}}/g, version))
    .pipe(plugins.replace(/{{MODERNIZR_VERSION}}/g, modernizrVersion))
    .pipe(plugins.replace(/{{JQUERY_SRI_HASH}}/g, hash.toString()))
    .pipe(gulp.dest(dist));
});


// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------

gulp.task('dev',
  gulp.series(
    gulp.parallel('sass:dev', 'js:dev')
  )
);

gulp.task('prod',
  gulp.series(
    gulp.parallel('sass:prod', 'js:prod', 'update')
  )
);

gulp.task('default',
  gulp.series(
    'dev',
    'watch'
  )
);

gulp.task('update',
  gulp.series(
    'update:html'
  )
);
