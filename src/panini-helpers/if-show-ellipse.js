module.exports = function(current, numPages, direction, options) {
  if(direction < 0 && current > 6)  {
    return options.fn();
  } else if (direction > 0 && (numPages - current) > 5){
    return options.fn();
  }
} 
