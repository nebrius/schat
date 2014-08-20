/*
The MIT License (MIT)

Copyright (c) 2014 Bryan Hughes <bryan@theoreticalideations.com> (http://theoreticalideations.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var gulp = require('gulp');
var traceur = require('gulp-traceur');
var del = require('del');

gulp.task('default', ['clean'], function() {
  return gulp.start(['index.html', 'libs', 'css', 'js']);
});

gulp.task('index.html', function() {
  return gulp.src('client/index.html')
    .pipe(gulp.dest('client-dist'));
});

gulp.task('libs', function() {
  return gulp.src('client/lib/*')
    .pipe(gulp.dest('client-dist/lib'));
});

gulp.task('css', function() {
  return gulp.src('client/css/*')
    .pipe(gulp.dest('client-dist/css'));
});

gulp.task('js', function() {
  return gulp.src('client/js/**/*')
    .pipe(traceur({
      experimental: true,
      modules: 'amd'
    }))
    .pipe(gulp.dest('client-dist/js'));
});

gulp.task('clean', function(cb) {
  del(['client-dist'], cb);
});
