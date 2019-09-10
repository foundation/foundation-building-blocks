module.exports = function(currentPage, numPages, options) {
  var ret = '';
  var pages = [numPages - 1, numPages];
  var nextPagesOffset = currentPage + 3;
  for(var i = 0; i < pages.length; i++) {
    if (pages[i] > nextPagesOffset ) {
      ret = ret + options.fn({pageNum: pages[i]});
    }
  }
  return ret;
}


