module.exports = function(currentPage, options) {
  var ret = '';
  var pages = [1, 2];
  var prevPagesOffset = currentPage - 3;
  for(var i = 0; i < pages.length; i++) {
    if (pages[i] < prevPagesOffset ) {
      ret = ret + options.fn({pageNum: pages[i]});
    }
  }
  return ret;
}

