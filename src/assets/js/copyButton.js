$('[data-clipboard]').each(function() {
  var self = this;
  var clipboard = new Clipboard(this, {text: function() {
    var text = $(self).parents('.code-box').find('code:visible').text().replace('&lt;', '<').replace('&gt;', '>');
    return text;
  }});
  clipboard.on('success', function(e) {
    var originalText = $(e.trigger).text();
    $(e.trigger).text('Copied!');
    e.clearSelection();
    setTimeout(function() {
      $(e.trigger).text(originalText);
    }, 15000)
  });
});

$('[data-copy-input]').each(function() {
  var self = this;
  var clipboard = new Clipboard(this, {text: function() {
    var text = $(self).parents('.input-group').find('input').val();
    return text;
  }});
  clipboard.on('success', function(e) {
    var originalText = $(e.trigger).val();
    $(e.trigger).val('Copied!');
    e.clearSelection();
    setTimeout(function() {
      $(e.trigger).val(originalText);
    }, 15000);
  });
});
