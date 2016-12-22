var gulp = require('gulp');
var path = require('path');
var del = require('del')
var less = require('gulp-less');
var cssmin = require('gulp-cssmin');
var csslint = require('gulp-csslint');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify')
var gulpif = require('gulp-if');
var autoprefixer = require('gulp-autoprefixer');

var ifless = function (file) {
    var extname = path.extname(file.path);
    return extname === '.less' ? true : false;
};

gulp.task('css', function () {
    return gulp.src(['public/stylesheets/**/*.less'])
        .pipe(gulpif(ifless, less()))
        .pipe(autoprefixer({
            browsers: ['Firefox >= 3', 'Opera 12.1', 'Android > 1.5', 'Explorer >= 6', 'iOS >= 5'],
            cascade: false
        }))
        .pipe(csslint())
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('public/stylesheets/'));
});

gulp.task('script', function() {
    gulp.src('public/ueditor/ueditor.all.js')
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('public/ueditor/'))
})

gulp.task('clean', function (cb) {
    del(['public/stylesheets/**/*.min.css'], cb);
});

gulp.task('watch', function() {
    gulp.watch(['public/stylesheets/**/*.less', '!public/stylesheets/**/*.min.less'], ['css'])
        .on('change', function (event) {
            console.log('文件' + event.path + '有变更,运行less和css任务');
        });
});

gulp.task('default', ['clean', 'css']);

