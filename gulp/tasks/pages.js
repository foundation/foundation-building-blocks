'use strict';
import gulp         from 'gulp';
import plugins      from 'gulp-load-plugins';
import yargs        from 'yargs';
import fs           from 'fs';
import panini       from 'panini';
import yaml         from 'js-yaml';
import async        from 'async';
import path         from 'path';

// Load all Gulp plugins into one variable
const $ = plugins();

const { COMPATIBILITY, PORT, UNCSS_OPTIONS, PATHS } = loadConfig();

// Check for --production flag
const PRODUCTION = !!(yargs.argv.production);


function loadConfig() {
  let ymlFile = fs.readFileSync('config.yml', 'utf8');
  return yaml.load(ymlFile);
}

function kitYaml(kits, prefix, datafile, cb) {
  async.eachOf(kits, (kit, name, callback) => {
    var obj = {total: kit.total, blocks: kit.blocks};
    obj.filename = name + '.html'
    obj.datafile = datafile;
    obj.datakey = name;
    obj.blocks = kit.blocks

    var str = "---\n" + yaml.safeDump(obj) + "---\n"
    fs.writeFile(PATHS.build + "/" + prefix + obj.filename, str, callback)
  }, cb)
}

// Resets Panini so that we can assemble using different layouts for the iframes and building block pages
function getNewPanini(options) {
  var p = new panini.Panini(options);
  p.loadBuiltinHelpers();
  p.refresh();
  return p.render()
}


function defaultTemplate(filename, blockname) {

  var text= '<div class="{{#if block.containerClass}}{{block.containerClass}}{{else}}row column container-padded{{/if}}">{{> ' + blockname + '}}</div>'
  var src = require('stream').Readable({ objectMode: true })
  src._read = function () {
    this.push(new $.util.File({
      cwd: "",
      base: "",
      path: filename,
      contents: new Buffer(text)
    }))
    this.push(null)
  }
  return src
}

// Create building block layouts
function buildingBlockFrameLayouts() {
  return gulp.src(['src/building-blocks/*', '!src/building-blocks/*.scss'])
  .pipe($.foreach(function(stream, file) {
    var fileName = file.path.substr(file.path.lastIndexOf(path.sep) + 1);
      var layout = file.path + "/layout.html";
      if (fs.existsSync(layout)) {
        return gulp.src(layout)
        .pipe($.rename(function(path) {
          path.basename = fileName;
         }))
        .pipe(gulp.dest(PATHS.build + '/blocks/'));
      } else {
        return defaultTemplate(fileName + '.html', fileName)
        .pipe(gulp.dest(PATHS.build + '/blocks/'));
      }
    }));
}

// Create a building block
function buildingBlockIframe() {
  return gulp.src(PATHS.build + '/blocks/*.{html,hbs,handlebars}')
    .pipe(getNewPanini({
      root: PATHS.build,
      layouts: 'src/layouts/building-blocks/iframe/',
      partials: 'src/building-blocks/*',
      data: ['src/data/', PATHS.build + '/data'],
      helpers: 'src/panini-helpers/'
    }))
    .pipe($.rename(function (path) {
      path.basename += "-iframe";
    }))
    .pipe($.if(PRODUCTION, $.revTimestamp()))
    .pipe(gulp.dest(PATHS.dist + "/blocks/"));
  }

// Compiles the building block pages
function buildingBlockPage() {
  return gulp.src(PATHS.build + '/blocks/*.{html,hbs,handlebars}')
    .pipe(getNewPanini({
      root: PATHS.build,
      layouts: 'src/layouts/building-blocks/page/',
      partials: 'src/partials',
      data: ['src/data/', PATHS.build + '/data'],
      helpers: 'src/panini-helpers/'
    }))
    .pipe($.if(PRODUCTION, $.revTimestamp()))
    .pipe(gulp.dest(PATHS.dist + "/blocks/"));
}

function kitsStarters(cb) {
  var kits = JSON.parse(fs.readFileSync(PATHS.build + '/data/kits.json', 'utf8'));
  fs.mkdir(PATHS.build + '/kits', () => {kitYaml(kits, 'kits/', 'kits.json', cb)})
}

// Compiles the building block pages
function kitsPages() {
  return gulp.src(PATHS.build + '/kits/*.{html,hbs,handlebars}')
    .pipe(getNewPanini({
      root: PATHS.build,
      layouts: 'src/layouts/kits/page/',
      partials: 'src/partials',
      data: ['src/data/', PATHS.build + '/data'],
      helpers: 'src/panini-helpers/'
    }))
    .pipe($.if(PRODUCTION, $.revTimestamp()))
    .pipe(gulp.dest(PATHS.dist + "/kits/"));
}

gulp.task('kits-pages', gulp.series(kitsStarters, kitsPages));
gulp.task('building-block-pages', gulp.series(buildingBlockFrameLayouts, buildingBlockIframe, buildingBlockPage));
