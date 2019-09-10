module.exports = function(page, numPages, options) {
  var ret = '';
  var pages = [page + 1, page + 2, page + 3];
  for(var i = 0; i < pages.length; i++) {
    if (pages[i] <= numPages) {
      ret = ret + options.fn({pageNum: pages[i]});
    }
  }
  return ret;
}

