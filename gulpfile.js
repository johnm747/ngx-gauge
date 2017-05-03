/**
 * Author: Ashish Chopra H
 * Date: 20 Mar, 2017
 * 
 * This Gulp file contributes to the build of library into dist directory.
 * 
 * TODO:
 * 1. Add test framework support
 * 2. Add tslinting support
 * 3. Add SASS support for CSS.
 */

const gulp = require('gulp'),
    clean = require('gulp-clean'),
    runSequence = require('run-sequence'),
    ts = require('gulp-typescript'),
    inlineNg2Template = require('gulp-inline-ng2-template'),
    sourcemaps = require('gulp-sourcemaps'),
    rollup = require('gulp-better-rollup'),
    pkg = require('./package.json'),
    header = require('gulp-header');

const config = {
    root: '.',
    resources: [
        'LICENSE.md',
        'README.md',
        'package.json'
    ],
    src: {
        dir: 'src',
        files: 'src/**/*.ts'
    },
    dest: {
        dir: 'dist',
    },
    bundle: {
        dir: 'dist/bundle',
        src: 'dist/greeting.js',
    },
    tsConfigFilePath: 'tsconfig.json',
    banner:
    `/**
  * @license 
  * <%= pkg.name %> - <%= pkg.description %>
  *
  * @version: <%= pkg.version %>
  * Copyright (c) 2017 <%= pkg.author.name %>
  * 
  * Released under the <%= pkg.license %> license
  * https://github.com/ashish-chopra/ngx-gauge/blob/master/LICENSE
  */
  
  `
};

const onRollupWarning = (warning) => {
    const skipCodes = [
        'THIS_IS_UNDEFINED',
        'MISSING_GLOBAL_NAME'
    ];
    if (skipCodes.indexOf(warning.code) != -1) return;
    console.error(warning);
};

const sweeper = (path) => {
    return gulp.src(path, { read: false })
        .pipe(clean());
};

const ROLLUP_CONFIG = {
    format: 'umd',
    moduleName: 'ngx.gauge',
    external: [
        '@angular/core',
        '@angular/common'
    ],
    onwarn: onRollupWarning
};


gulp.task('clean', () => {
    return sweeper(config.dest.dir);
});


gulp.task('build', () => {
    var tsProject = ts.createProject(config.tsConfigFilePath);
    return gulp.src(config.src.files)
        .pipe(inlineNg2Template({ 
            base: config.src.dir, 
            useRelativePaths: true,
            removeLineBreaks: true }))
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(header(config.banner, { pkg: pkg }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.dest.dir));
});

gulp.task('bundle', () => {
    gulp.src(config.bundle.src)
        .pipe(sourcemaps.init())
        .pipe(rollup(ROLLUP_CONFIG))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.bundle.dir));
});

gulp.task('package', () => {
    return gulp.src(config.resources)
        .pipe(gulp.dest(config.dest.dir));
});

gulp.task('build:lib', (done) => {
    return runSequence('build', 'bundle', 'package', done);
})

gulp.task('build:watch',['build:lib'], () => {
    gulp.watch(config.src.dir + '/**/*.*', ['build:lib']);
});