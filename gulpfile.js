var MY_SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';

var gulp         = require('gulp'),
    postcss      = require('gulp-postcss'),
    scss         = require('gulp-sass'),
    sourcemaps   = require('gulp-sourcemaps'),
    pug          = require('gulp-pug'),
    doiuse       = require('doiuse'),
    browserSync  = require('browser-sync'),
    del          = require('del'),
    lost         = require('lost'),
    babel        = require('gulp-babel'),
    rename       = require('gulp-rename'),
    plumber      = require('gulp-plumber'),
    notify       = require('gulp-notify'),
    autoprefixer = require('gulp-autoprefixer'),
    slack        = require('slack-notify')(MY_SLACK_WEBHOOK_URL);

var paths = {
  scss: {
    source: './app/assets/styles/scss/**/*.scss',
    dest: './app/assets/styles/css/'
  },
  pug: {
    source: './app/**/*.pug',
    views: '!./app/views/**/*.pug',
    dest: './app/'
  },
  js: {
    source: './app/assets/scripts/babel/**/*.js',
    dest: './app/assets/scripts/js/'
  }
};

// SCSS -> CSS
gulp.task('scss', function() {
  var onError = function(err) {
    notify.onError({
      title:    "Gulp - SCSS",
      message:  "Ошибка: <%= error.messageOriginal %>\nСтрока: <%= error.line %>:<%= error.column %>",
      sound:    "Beep"
    })(err);

    slack.send({
      channel: '#dev',
      icon_url: 'https://cdn.serptop.ru/assets/icons/gulp.png',
      text: '',
      unfurl_links: 1,
      attachments: [
        {
          fallback: '',
          color: '#d01616',
          fields: [
            { title: 'Хост:', value: __dirname, short: false },
            { title: 'Плагин:', value: err.plugin, short: false },
            { title: 'Описание ошибки:', value: err.messageOriginal, short: false },
            { title: 'Файл с ошибкой:', value: err.relativePath, short: false },
            { title: 'Строка:', value: err.line + ':' + err.column, short: false },
          ]
        }
      ],
      username: 'Gulp'
    });
    this.emit('end');
  };

  return gulp.src(paths.scss.source)
             .pipe(plumber({errorHandler: onError}))
             .pipe(sourcemaps.init())
             .pipe(scss({outputStyle: 'compact'}))
             .pipe(postcss([
               lost()
             ]))
             .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
             .pipe(sourcemaps.write('./maps/'))
             .pipe(gulp.dest(paths.scss.dest))
             .pipe(browserSync.reload({stream: true}));
});

// PUG -> HTML
gulp.task('pug', function() {
  var onError = function(err) {
    notify.onError({
      title:    "Gulp - Pug",
      message:  "Ошибка: <%= error.msg %>\nСтрока: <%= error.line %>:<%= error.column %>",
      sound:    "Beep"
    })(err);

    slack.send({
      channel: '#dev',
      icon_url: 'https://cdn.serptop.ru/assets/icons/gulp.png',
      text: '',
      unfurl_links: 1,
      attachments: [
        {
          fallback: '',
          color: '#d01616',
          fields: [
            { title: 'Хост:', value: __dirname, short: false },
            { title: 'Плагин:', value: err.plugin, short: false },
            { title: 'Описание ошибки:', value: err.msg, short: false },
            { title: 'Файл с ошибкой:', value: err.filename, short: false },
            { title: 'Строка:', value: err.line + ':' + err.column, short: false },
          ]
        }
      ],
      username: 'Gulp'
    });
    this.emit('end');
  };

  return gulp.src([paths.pug.source, paths.pug.views])
             .pipe(plumber({errorHandler: onError}))
             .pipe(pug({
               pretty: true
             }))
             .pipe(gulp.dest(paths.pug.dest))
             .pipe(browserSync.reload({stream: true}));
});

// Babel -> JS
gulp.task('js', function() {
  var onError = function(err) {
    notify.onError({
      title:    "Gulp - JavaScript",
      message:  "Ошибка: <%= error.messageOriginal %>\nСтрока: <%= error.line %>:<%= error.column %>",
      sound:    "Beep"
    })(err);
    this.emit('end');
  };

  return gulp.src(paths.js.source)
             .pipe(plumber({errorHandler: onError}))
             .pipe(babel({
               presets: ['env']
             }))
             .pipe(gulp.dest(paths.js.dest))
             .pipe(browserSync.reload({stream: true}));
});

// Livereload
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: 'app'
    },
    notify: false
  });
});

gulp.task('watch', gulp.parallel('browser-sync', 'scss', 'js', 'pug', function() {
  gulp.watch(paths.scss.source, gulp.series('scss'));
  gulp.watch(paths.js.source, gulp.series('js'));
  gulp.watch(paths.pug.source, gulp.series('pug'));
}));

// Очистка
gulp.task('clean', function() {
  return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('default', gulp.series('watch'));
