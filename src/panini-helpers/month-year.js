module.exports = function() {
  var month = new Date().getMonth() + 1;
  var year = new Date().getFullYear();

  return month + '-' + year;
}
