module.exports = function(page, options) {
  var ret = '';
  var pages = [page - 3, page - 2, page - 1];
  for(var i = 0; i < pages.length; i++) {
    if (pages[i] > 0) {
      ret = ret + options.fn({pageNum: pages[i]});
    }
  }
  return ret;
}
