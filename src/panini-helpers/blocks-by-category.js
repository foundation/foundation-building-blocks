var _ = require('lodash');

module.exports = function(blocks, options) {
  var blocksByCategory = {}
  _.each(blocks, function(block) {
    blocksByCategory[block.category] = blocksByCategory[block.category] || [];
    blocksByCategory[block.category].push(block);
  });
  let content = '';
  _.each(blocksByCategory, function(blocks, category) {
    content = content + options.fn({category: category, blocks: blocks});
  });
  return content;
};
