let project_folder = "dist";
let source_folder = "src";
const zero_styles = source_folder + "/scss/zero_styles.scss";


const imagemin = require('gulp-imagemin');
let path = {
    build: {
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/img/",
        fonts: project_folder + "/fonts/",
    },
    src: {
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
        css: source_folder + "/scss/style.scss",
        js: source_folder + "/js/script.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: source_folder + "/fonts/*.ttf",
    },
    watch: {
        html: source_folder + "/**/*.html",
        css: source_folder + "/scss/**/*.scss",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    },
    clean: "./" + project_folder + "/",
}

let {src, dest} = require('gulp'),
    gulp = require('gulp'),
    browser_sync = require('browser-sync').create(),
    file_include = require("gulp-file-include"),
    scss = require('gulp-sass')(require('sass')),
    del = require("del"),
    autoprefixer = require("gulp-autoprefixer"),
    group_media = require("gulp-group-css-media-queries"),
    clean_css = require("gulp-clean-css"),
    rename = require("gulp-rename"),
    uglify = require("gulp-uglify-es").default;

function browserSyncInit() {
    browser_sync.init({
        server: {
            baseDir: "./" + project_folder + "/",
        },
        port: 3000,
        notify: true
    })
}

function html() {
    return src(path.src.html)
        .pipe(file_include())
        .pipe(dest(path.build.html))
        .pipe(browser_sync.stream())
}

function images() {
    return src(path.src.img)
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                interlaced: true,
                optimizationLevel: 3
            })
        )
        .pipe(dest(path.build.img))
        .pipe(browser_sync.stream())
}

function js() {
    return src(path.src.js)
        .pipe(file_include())
        .pipe(dest(path.build.js))
        .pipe(
            uglify()
        )
        .pipe(
            rename({
                extname: ".min.js"
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browser_sync.stream())
}

function css() {
    return src([path.src.css, zero_styles]) // Добавляем zero_styles.scss в список источников
        .pipe(
            scss({outputStyle: 'expanded'}).on('error', scss.logError)
        )
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["Last 5 version"],
                cascade: true,
            })
        )
        .pipe(
            group_media()
        )
        .pipe(dest(path.build.css))
        .pipe(
            clean_css()
        )
        .pipe(
            rename({
                extname: ".min.css"
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browser_sync.stream());
}


function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js),
        gulp.watch([path.watch.img], images);
}

function clean() {
    return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(css, html, js, images));
let watch = gulp.parallel(build, watchFiles, browserSyncInit);
gulp.task('css', css);
gulp.task('js', js);
gulp.task('html', html);
gulp.task('build', build);
gulp.task('watch', watch);
gulp.task('default', watch);
gulp.task('images', images);