module.exports = function(context, offset, absolutePage) {
  var pageNum;
  if(offset) {
    pageNum = context.currentPage + offset;
  } else {
    pageNum = absolutePage;
  }

  var page = context.page.split(/\-\d+/)[0];
  if (pageNum === 1) {
    return page + '.html'
  } else {
    return page +'-' + pageNum + '.html'
  }
}
