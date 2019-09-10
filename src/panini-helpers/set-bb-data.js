module.exports = function(context, options) {
  if(context.page && context['building-blocks'][context.page]) {
    context.block = context['building-blocks'][context.page];
    return options.fn(context);
  } else {
    return options.fn(context);
  }
}
