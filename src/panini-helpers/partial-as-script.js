var fs = require('fs')
module.exports = function(id, filename) {
  var content = fs.readFileSync('src/partials/' + filename, 'utf-8');
  return "<script type='text/handlebars' id='" + id + "'>" + content + "</script>";
}
