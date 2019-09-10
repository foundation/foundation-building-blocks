module.exports = function(page) {
  if(page) {
    return './' + page.split('.')[0] + '-iframe.html'
  }
}

//<iframe src="{{bb-iframe-path page}}"/>
