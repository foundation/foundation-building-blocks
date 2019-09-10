var _ = require('lodash');

module.exports = function(context, number, options) {
  if(context.page && context['building-blocks'][context.page]) {
    var ret = '';
    var currentBlock = context['building-blocks'][context.page];
    var category = context['building-blocks'][context.page].category;
    var relatedBlocks = _.filter(context.categories[category].blocks, function(b) {
      return b.name !== currentBlock.name;
    });
    var list = _.shuffle(relatedBlocks).slice(0, number);
    for(var i = 0; i < list.length; i++) {
      ret = ret + options.fn({currentBlock: list[i]});
    }
    return ret;
  }
}
