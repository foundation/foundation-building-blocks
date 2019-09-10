'use strict';
import gulp         from 'gulp';
import plugins      from 'gulp-load-plugins';
import yargs        from 'yargs';
import _            from 'lodash';
import fs           from 'fs';
import yaml         from 'js-yaml';
import async        from 'async';
import panini       from 'panini';

// Load all Gulp plugins into one variable
const $ = plugins();

const { COMPATIBILITY, PORT, UNCSS_OPTIONS, PATHS } = loadConfig();

const PAGE_SIZE = 12;

// Check for --production flag
const PRODUCTION = !!(yargs.argv.production);

function loadConfig() {
  let ymlFile = fs.readFileSync('config.yml', 'utf8');
  return yaml.load(ymlFile);
}

// From https://stackoverflow.com/questions/23230569/how-do-you-create-a-file-from-a-string-in-gulp
function categoryYaml(categories, prefix, datafile, cb) {
  async.eachOf(categories, (category, name, callback) => {
    var numPages = Math.ceil((category.total + 1) / PAGE_SIZE);
    var objs = []
    var blocks = _.sortBy(category.blocks, function(block) { return -(new Date(block.dateUpdated));});
    var start = 0;
    for(var i = 0; i < numPages; i++) {
      var obj = {total: category.total, currentPage: i + 1, numPages: numPages, versions: category.versions};
      if(numPages > 1) { obj.paginate = true;}
      obj.filename = ((obj.currentPage === 1) ? name : name + '-' + obj.currentPage) + '.html';
      obj.datafile = datafile;
      obj.datakey = name;
      obj.blocks = blocks.slice(start, start + PAGE_SIZE);
      if (i === 0) {
        obj.show_ad = true;
      }
      objs.push(obj);
      start = start + PAGE_SIZE;
    }
    async.each(objs, (obj, innerCallback) => {
      var str = "---\n" + yaml.safeDump(obj) + "---\n"
      fs.writeFile(PATHS.build + "/" + prefix + obj.filename, str, innerCallback)
    }, callback);
  }, cb)
}

function buildingBlocksCategoryStarters(cb) {
  var categories = JSON.parse(fs.readFileSync(PATHS.build + '/data/categories.json', 'utf8'));
  fs.mkdir(PATHS.build, () => {categoryYaml(categories, '', 'categories.json', cb)})
}

function buildingBlocksTagsStarters(cb) {
  var tags = JSON.parse(fs.readFileSync(PATHS.build + '/data/tags.json', 'utf8'));
  fs.mkdir(PATHS.build + '/tags', () => {categoryYaml(tags, 'tags/', 'tags.json', cb)})
}

function buildingBlocksCategoryPages() {
  panini.refresh();
  return gulp.src([PATHS.build + '/*.html'])
    .pipe(panini({
      root: '_build/',
      layouts: 'src/layouts/building-blocks/index',
      partials: 'src/partials/',
      data: 'src/data/',
      helpers: 'src/panini-helpers/'
    }))
    .pipe($.if(PRODUCTION, $.revTimestamp()))
    .pipe(gulp.dest(PATHS.dist));
  }

gulp.task('building-blocks-categories', buildingBlocksCategoryPages);
gulp.task('building-block-indices',
  gulp.series(buildingBlocksCategoryStarters, buildingBlocksCategoryPages));
