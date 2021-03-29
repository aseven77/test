const { src, dest, parallel , gulp , watch, series } = require('gulp');
const pug 			= require('gulp-pug');
const sass 			= require('gulp-sass');
const concat 		= require('gulp-concat');
const cssbeautify 	= require('gulp-cssbeautify');
const browserSync	= require('browser-sync'); 
const cssnano		= require('gulp-cssnano');
const rename		= require('gulp-rename');
const del 			= require('del');
const imagemin 		= require('gulp-imagemin');
const autoprefixer	= require('gulp-autoprefixer');
const csscomb 		= require('gulp-csscomb');
const svgSprite 	= require("gulp-svg-sprites");
const svgstore 		= require('gulp-svgstore');
const gcmq 			= require('gulp-group-css-media-queries');


var autoprefixerList = [
	'Chrome >= 45',
	'Firefox ESR',
	'Edge >= 12',
	'Explorer >= 10',
	'iOS >= 9',
	'Safari >= 9',
	'Android >= 4.4',
	'Opera >= 30'
];


function browser_sync() {
	browserSync({
		server: {
            baseDir: "app/"
        },
		notify: false
	});
}


function pages() {
	return src('app/page/*.pug')
	.pipe( pug({
		pretty: true
	}) )
	.pipe(dest('app/'))
	.pipe(browserSync.reload({stream: true}));
}

function pagesBlocks() {
	return src('app/blocks/**/*.pug')
	.pipe( pug({
		pretty: true
	}) )
	.pipe(dest('app/blocks'))
	.pipe(browserSync.reload({stream: true}));
}

function scss() {
  return src('app/scss/**/*.scss')
	.pipe(sass())
	.pipe(autoprefixer({ 
        browsers: autoprefixerList
	}))
	.pipe(gcmq())
	.pipe(csscomb())
	.pipe(cssbeautify())	
	.pipe(dest('app/style'))
	.pipe(browserSync.reload({stream: true}));
}

function css_libs() {
	parallel('scss');
	return src([
		'node_modules/normalize.css/normalize.css'
	])
	.pipe(concat('libs.min.css'))
	.pipe(cssnano())
	.pipe(dest('app/style'));
}



function svgSprites() {
	return src('app/images/sprite/*.svg')
		.pipe(svgstore({
			prefix: 'icon-'
			}))
		.pipe(rename('sprite.svg'))
		.pipe(dest('app/images'));
}

function watchFiles() {
	watch("app/page/**/*", pages);
	watch("app/blocks/**/*.pug", pages);
	watch("app/scss/**/*", scss);
	watch("app/blocks/**/*.scss", scss);
	watch("app/component/**/*.scss", scss);
}

function clean() {
	return del(["dist"]);
}


//Вывод файлов на продакшн
function build() {
	buildCss = src(['app/style/*.css'])
	.pipe(dest('dist/style'));

	buildImages = src('app/images/**/*')
	.pipe(dest('dist/images'));
	
	buildHtml = src('app/*.html')
	.pipe(dest('dist'));
};

exports.scss = scss;
exports.pages = pages;
exports.browser_sync = browser_sync;
exports.css_libs = css_libs;
exports.watchFiles = watchFiles;
exports.clean = clean;
exports.pagesBlocks = pagesBlocks;
exports.build = build;

exports.svgSprites = svgSprites;
exports.default = parallel(watchFiles, css_libs , browser_sync);
exports.product = series(clean , pages , scss, css_libs, build);
