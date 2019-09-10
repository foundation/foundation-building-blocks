module.exports = function(context, options) {
  if(context.page && context['kits'] && context['kits'][context.page]) {
    context.kit = context['kits'] && context['kits'][context.page];
    return options.fn(context);
  } else {
    return options.fn(context);
  }
}

