'use strict';
import gulp         from 'gulp';
import plugins      from 'gulp-load-plugins';
import fs           from 'fs';
import yaml         from 'js-yaml';
import _            from 'lodash';

// Load all Gulp plugins into one variable
const $ = plugins();

const { COMPATIBILITY, PORT, UNCSS_OPTIONS, PATHS } = loadConfig();

function loadConfig() {
  let ymlFile = fs.readFileSync('config.yml', 'utf8');
  return yaml.load(ymlFile);
}

function zipBlocks() {
  return gulp.src(PATHS.dist + '/files/building-blocks/*')
    .pipe($.foreach(function(stream, file) {
      var fileName = file.path.substr(file.path.lastIndexOf("/") + 1);
      gulp.src(PATHS.dist + "/files/building-blocks/" + fileName+ "/**/*", {base: PATHS.dist + '/files/building-blocks/'})
        .pipe($.zip(fileName + ".zip"))
        .pipe(gulp.dest(PATHS.dist + '/files/building-blocks'));
      return stream;
    }));
}

// TODO: Once we add kits, add the ability to zip them up.
function zipKits(done) {
  return gulp.src(PATHS.build + '/data/kits.json')
    .pipe($.jsoncombine('kits.json', function(data) {
      _.each(data.kits, (value, key) => {
        var fileName = value.datakey;
        var blockFiles = _.map(value.blocks, (block) => {
          return PATHS.dist + "/files/building-blocks/" + block.datakey + "/**/*";
        });
        gulp.src(blockFiles, {base: PATHS.dist + '/files/building-blocks/'})
          .pipe($.rename(function(path) {
            path.dirname = fileName + "/" + path.dirname;
          }))
          .pipe($.zip(fileName + ".zip"))
          .pipe(gulp.dest(PATHS.dist + '/files/kits'));
      });
      return new Buffer(JSON.stringify(data));
    }));
}

gulp.task('zip', gulp.series(zipBlocks, zipKits));
