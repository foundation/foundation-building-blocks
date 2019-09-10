module.exports = function(page, dataType, navigationData) {
  var re = /(.*?)(\-\d+)?$/
  var array = re.exec(page)
  if(array && array[1] && navigationData && navigationData[array[1]]) {
    return navigationData[array[1]][dataType];
  }
  return null;
}
