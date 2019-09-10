var _ = require('lodash');
module.exports = function(tags, options) {
  var ret = '';
  _.each(tags, function(tag) {
    var url = tag.toLowerCase().replace(' ', '-') + '.html';
    var opts = {href: 'tags/' + url, name: tag}
    ret = ret + options.fn(opts)
  });
  return ret;
}
