"use strict";

import plugins from "gulp-load-plugins";
import yargs from "yargs";
import browser from "browser-sync";
import gulp from "gulp";
import panini from "panini";
import rimraf from "rimraf";
import sherpa from "style-sherpa";
import yaml from "js-yaml";
import fs from "fs";
import sassLint from "gulp-sass-lint";
import gulpRename from "gulp-rename";
import _ from "lodash";
import requireDir from "require-dir";
import stripCssComments from "gulp-strip-css-comments";

// Load all Gulp plugins into one variable
const $ = plugins();

// load subtasks
requireDir("./gulp/tasks");

// Check for --production flag
const PRODUCTION = !!yargs.argv.production;

// Load settings from settings.yml
const { COMPATIBILITY, PORT, UNCSS_OPTIONS, PATHS } = loadConfig();

function loadConfig() {
  let ymlFile = fs.readFileSync("config.yml", "utf8");
  return yaml.load(ymlFile);
}

// Lint task
gulp.task("lint", function() {
  return gulp
    .src("src/assets/scss/**/*.s+(a|c)ss")
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError());
});

// Resets Panini so that we can assemble using different layouts for the iframes and building block pages
function getNewPanini(options) {
  var p = new panini.Panini(options);
  p.loadBuiltinHelpers();
  p.refresh();
  return p.render();
}

gulp.task(
  "copy",
  gulp.parallel(copyAssets, copyData, copyBBImages, copyBBFiles, copyKitImages)
);

// Build the "dist" folder by running all of the below tasks
gulp.task(
  "build",
  gulp.series(
    clean,
    "lint",
    gulp.parallel(pages, sass, javascript, images, copyAssets),
    styleGuide
  )
);

// Build the site, run the server, and watch for file changes
gulp.task("static", gulp.series("build", server, watchStatic));

gulp.task(
  "dynamic-pages",
  gulp.series(
    kitIndex,
    "kits-pages",
    "building-block-indices",
    "building-block-pages"
  )
);

gulp.task(
  "bb-iframe",
  gulp.series(
    clean,
    "building-block-meta",
    buildingBlockBaseStyles,
    buildingBlockSass,
    buildingBlockJS,
    "dynamic-pages",
    "copy",
    "zip",
    sass,
    javascript,
    images
  )
);

// Create Building Blocks
gulp.task("bb", gulp.series("bb-iframe", server, watch));

// Delete the "dist" folder
// This happens every time a build starts
function clean(done) {
  rimraf(PATHS.dist, () => rimraf(PATHS.build, done));
}

// Copy files out of the assets folder
// This task skips over the "img", "js", and "scss" folders, which are parsed separately
function copyAssets() {
  return gulp.src(PATHS.assets).pipe(gulp.dest(PATHS.dist + "/assets"));
}

// Copy files out of the assets folder
// This task skips over the "img", "js", and "scss" folders, which are parsed separately
function copyData() {
  return gulp
    .src(PATHS.build + "/data/*")
    .pipe(gulp.dest(PATHS.dist + "/data"));
}

// Copy files out of the assets folder
// This task skips over the "img", "js", and "scss" folders, which are parsed separately
function copyBBImages() {
  return gulp
    .src("src/building-blocks/**/*.{png,jpg}")
    .pipe(gulp.dest(PATHS.dist + "/assets/img/building-block/"));
}

function copyKitImages() {
  return gulp
    .src(PATHS.kit.img)
    .pipe(gulp.dest(PATHS.dist + "/assets/img/kits/"));
}

function copyBBFiles() {
  return gulp
    .src([
      "src/building-blocks/**/*.{html,js,scss}",
      "dist/building-blocks/**/*.css",
      "!dist/building-blocks/**/layout.css"
    ])
    .pipe(gulp.dest(PATHS.dist + "/files/building-blocks/"));
}

// Copy page templates into finished HTML files
function kitIndex() {
  return gulp
    .src(["src/pages/kits.html", "src/pages/how-to.html"])
    .pipe(
      getNewPanini({
        root: PATHS.pages.dir,
        layouts: PATHS.layouts.dir,
        partials: PATHS.partials.dir,
        data: ["src/data/", PATHS.build + "/data"],
        helpers: "src/panini-helpers/"
      })
    )
    .pipe($.if(PRODUCTION, $.revTimestamp()))
    .pipe(gulp.dest(PATHS.dist));
}

gulp.task("kit-index", kitIndex);

// Copy page templates into finished HTML files
function pages() {
  return gulp
    .src(PATHS.pages.markup)
    .pipe(
      getNewPanini({
        root: PATHS.pages.dir,
        layouts: PATHS.layouts.dir,
        partials: PATHS.partials.dir,
        data: "src/data/",
        helpers: "src/panini-helpers/"
      })
    )
    .pipe(gulp.dest(PATHS.dist));
}

function buildingBlockBaseStyles() {
  return (
    gulp
      .src([
        "src/building-blocks/app.scss",
        "src/building-blocks/app-float.scss"
      ])
      .pipe(
        $.sass({
          includePaths: PATHS.sass
        }).on("error", $.sass.logError)
      )
      .pipe(
        $.autoprefixer({
          browsers: COMPATIBILITY
        })
      )
      // Comment in the pipe below to run UnCSS in production
      //.pipe($.if(PRODUCTION, $.uncss(UNCSS_OPTIONS)))
      .pipe($.if(PRODUCTION, $.cssnano()))
      .pipe(gulp.dest(PATHS.dist + "/building-block/"))
      .pipe(browser.reload({ stream: true }))
  );
}
// Compiles the Sass for the building blocks
function buildingBlockSass() {
  var blocks = JSON.parse(
    fs.readFileSync(PATHS.build + "/data/building-blocks.json", "utf8")
  );
  return gulp
    .src([PATHS.bb.sass])
    .pipe(
      $.insert.transform(function(contents, file) {
        var pieces = file.path.split("/");
        var bbName = pieces[pieces.length - 2];
        if (blocks[bbName]) {
          if (blocks.grid !== "float") {
            return (
              "@import 'settings';\n$global-flexbox:true;\n@import 'foundation';\n" +
              contents
            );
          } else {
            return "@import 'settings';\n@import 'foundation';\n" + contents;
          }
        } else {
          return contents;
        }
      })
    )
    .pipe(
      $.sass({
        includePaths: PATHS.sass,
        outputStyle: "expanded"
      }).on("error", $.sass.logError)
    )
    .pipe(stripCssComments())
    .pipe(
      $.autoprefixer({
        browsers: COMPATIBILITY
      })
    )
    .pipe(gulp.dest(PATHS.dist + "/building-block/"));
}

// Moves JS from the Building Blocks into the dist
function buildingBlockJS() {
  return gulp.src(PATHS.bb.js).pipe(gulp.dest(PATHS.dist + "/building-block/"));
}

// Load updated HTML templates and partials into Panini
function resetPages(done) {
  panini.refresh();
  done();
}

// Generate a style guide from the Markdown content and HTML template in styleguide/
function styleGuide(done) {
  sherpa(
    "src/styleguide/index.md",
    {
      output: PATHS.dist + "/styleguide.html",
      template: "src/styleguide/template.html"
    },
    done
  );
}

// Compile Sass into CSS
// In production, the CSS is compressed
function sass() {
  return (
    gulp
      .src("src/assets/scss/app.scss")
      .pipe($.sourcemaps.init())
      .pipe(
        $.sass({
          includePaths: PATHS.sass
        }).on("error", $.sass.logError)
      )
      .pipe(
        $.autoprefixer({
          browsers: COMPATIBILITY
        })
      )
      // Comment in the pipe below to run UnCSS in production
      //.pipe($.if(PRODUCTION, $.uncss(UNCSS_OPTIONS)))
      .pipe($.if(PRODUCTION, $.cssnano()))
      .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
      .pipe(gulp.dest(PATHS.dist + "/assets/css"))
      .pipe(browser.reload({ stream: true }))
  );
}

// Combine JavaScript into one file
// In production, the file is minified
function javascript() {
  return gulp
    .src(PATHS.javascript)
    .pipe($.sourcemaps.init())
    .pipe(
      $.babel({
        ignore: ["what-input.js", "handlebars.min.js", "lodash.min.js"]
      })
    )
    .pipe($.concat("app.js"))
    .pipe(
      $.if(
        PRODUCTION,
        $.uglify().on("error", e => {
          console.log(e);
        })
      )
    )
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(PATHS.dist + "/assets/js"));
}

// Copy images to the "dist" folder
// In production, the images are compressed
function images() {
  return gulp
    .src("src/assets/img/**/*")
    .pipe(
      $.if(
        PRODUCTION,
        $.imagemin({
          progressive: true
        })
      )
    )
    .pipe(gulp.dest(PATHS.dist + "/assets/img"));
}

// Start a server with BrowserSync to preview the site in
function server(done) {
  browser.init({
    server: PATHS.dist,
    port: PORT
  });
  done();
}

// Reload the browser with BrowserSync
function reload(done) {
  browser.reload(["**/*", "!**/*-iframe.html"]);
  done();
}

// Watch for changes to static assets, pages, Sass, and JavaScript
function watch() {
  gulp.watch(PATHS.assets, gulp.series("copy", reload));
  gulp.watch(PATHS.pages.html).on("all", gulp.series(kitIndex, reload));
  gulp
    .watch("src/{layouts,partials}/**/*.html")
    .on("all", gulp.series(kitIndex, "dynamic-pages", reload));
  gulp
    .watch(PATHS.bb.html)
    .on(
      "all",
      gulp.series("building-block-pages", "building-block-indices", reload)
    );
  gulp
    .watch(PATHS.bb.sass)
    .on("all", gulp.series(buildingBlockSass, "building-block-pages", reload));
  gulp
    .watch(PATHS.bb.js)
    .on("all", gulp.series(buildingBlockJS, "building-block-pages", reload));
  gulp
    .watch([PATHS.bb.png, PATHS.kit.png])
    .on("all", gulp.series("copy", reload));
  gulp
    .watch(PATHS.bb.yaml)
    .on("all", gulp.series("building-block-meta", "dynamic-pages", reload));
  gulp
    .watch(PATHS.kit.yaml)
    .on("all", gulp.series("building-block-meta", "dynamic-pages", reload));
  gulp
    .watch("src/assets/scss/**/*.scss")
    .on("all", gulp.series(sass, buildingBlockSass, reload));
  gulp
    .watch("src/assets/js/**/*.js")
    .on("all", gulp.series(javascript, reload));
  gulp.watch("src/assets/img/**/*").on("all", gulp.series(images, reload));
  gulp.watch("src/styleguide/**").on("all", gulp.series(styleGuide, reload));
}
// Watch for changes to static assets, pages, Sass, and JavaScript
function watchStatic() {
  gulp.watch(PATHS.assets, gulp.series("copy", reload));
  gulp.watch(PATHS.pages.html).on("all", gulp.series(pages, reload));
  gulp
    .watch("src/{layouts,partials}/**/*.html")
    .on("all", gulp.series(pages, reload));
  gulp.watch("src/assets/scss/**/*.scss").on("all", gulp.series(sass, reload));
  gulp
    .watch("src/assets/js/**/*.js")
    .on("all", gulp.series(javascript, reload));
  gulp.watch("src/assets/img/**/*").on("all", gulp.series(images, reload));
  gulp.watch("src/styleguide/**").on("all", gulp.series(styleGuide, reload));
}
