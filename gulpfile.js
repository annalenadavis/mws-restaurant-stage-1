'use strict';

const gulp = require('gulp');
const broswerSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const pump = require('pump');
const babel = require('gulp-babel');
const uglifycss = require('gulp-uglifycss');

//run server from dist folder
gulp.task('default', () => {
    broswerSync.init({
        server: './dist'
    });
});

//compress JS
gulp.task('compress', function (cb) {
    pump([
          gulp.src(['js/idblibrary.js', 'js/dbhelper.js', 'js/main.js', 'js/restaurant_info.js', 'sw.js'])
          .pipe(concat('all.js'))
          .pipe(babel({
            presets: ['env']
        })),
          uglify(),
          gulp.dest('dist')
      ],
      cb
    );
  });

//minify CSS
gulp.task('css', () => {
    gulp.src('css/*.css')
    .pipe(uglifycss({
        "maxLineLen": 80,
        "uglyComments": true 
    }))
    .pipe(gulp.dest('./dist/css'));
});

//Copy html to dist folder
gulp.task('copy-html', () => {
    gulp.src('*.html')
        .pipe(gulp.dest('./dist'));
});

//Copy images to dist folder
gulp.task('copy-images', () => {
    gulp.src('img/*')
        .pipe(gulp.dest('/dist/img'));
});

//copy manifest file to dist folder
gulp.task('copy-manifest', () => {
    gulp.src('manifest.json')
    .pipe(gulp.dest('./dist'));
})