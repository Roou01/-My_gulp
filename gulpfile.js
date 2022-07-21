// ------------------ ПЛАГИНЫ --------------------
const gulp = require("gulp"); // сам Gulp
const { src, dest, watch, parallel, series } = require("gulp"); // основыне методы Gulp
const sass = require("gulp-sass")(require("sass")); // препроцессор Sass
const browserSync = require("browser-sync").create(); // для автоматического обновления браузера
const del = require("del"); // удаляет файлы и директории
const autoprefixer = require("gulp-autoprefixer"); // автоматически добавляет префиксы в css //! в package.json нужно добавить "browserslist":["last 5 versions"]
const cleanCSS = require("gulp-clean-css"); // удаляет пробелы в css
const uglify = require("gulp-uglify-es").default; // минифицирует файлы script
const babel = require("gulp-babel"); // компилятор для поддрежки "древних" версий JS
const imagemin = require("gulp-imagemin"); // сжатие изображений //! использовать npm i gulp-imagemin@7.1.0, если более новая версия не работает
const newer = require("gulp-newer"); // для обработки только вновь добавленных файлов
const htmlmin = require("gulp-htmlmin"); // минифицирует html

// ------------------ ПУТИ -----------------------
const paths = {
  html: {
    src: "src/*.html",
    dest: "dist/",
  },
  styles: {
    src: "src/sass/**/*.scss",
    dest: "dist/styles",
  },
  scripts: {
    src: "src/scripts/**/*.js",
    dest: "dist/scripts",
  },
  media: {
    src: "src/media/**",
    dest: "dist/media",
  },
};

// ------------------- ФУНКЦИИ --------------------
//* обработка html
function buildHtml() {
  return src(paths.html.src)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(paths.html.dest));
}

//* обработка sass, создание стилей
function buildStyles() {
  return src(paths.styles.src)
    .pipe(sass().on("error", sass.logError))
    .pipe(
      autoprefixer({
        // browsers: ["last 5 versions"],
        cascade: true,
      })
    )
    .pipe(cleanCSS())
    .pipe(dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

//* обработка скриптов
function buildScripts() {
  return src(paths.scripts.src)
    .pipe(
      babel({
        presets: ["@babel/preset-env"],
      })
    )
    .pipe(uglify())
    .pipe(dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

//* наблюдатель
function watchFiles() {
  browserSync.init({
    server: "dist",
    notify: false,
  });
  watch(paths.html.src, buildHtml).on("change", browserSync.reload);
  watch(paths.styles.src, buildStyles);
  watch(paths.scripts.src, buildScripts);
  watch(paths.media.src, imgMin);
}

//* сжатие изображений
function imgMin() {
  return src(paths.media.src)
    .pipe(newer(paths.media.dest))
    .pipe(imagemin())
    .pipe(dest(paths.media.dest));
}

//* очистка папки dist
function clean() {
  return del(["dist/**", "!dist/media"]);
}

//! СБОРЩИК
const buildAll = series(
  clean,
  parallel(buildHtml, buildStyles, buildScripts, imgMin),
  watchFiles
);

// ------------------- ЭКСПОРТЫ--------------------
exports.buildStyles = buildStyles;
exports.buildScripts = buildScripts;
exports.watchFiles = watchFiles;
exports.buildHtml = buildHtml;
exports.clean = clean;
exports.imgMin = imgMin;
exports.buildAll = buildAll;

exports.default = buildAll; //! default
