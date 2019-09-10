var toggleHTML = $('[data-toggle-HTML]');
var toggleStyles = $('[data-toggle-styles]');
var toggleJS   = $('[data-toggle-JS]');

if($('#codeBoxJS code').text().trim().length === 0) {
  toggleJS.addClass('is-disabled');
}
else {
  toggleJS.addClass('is-active');
  $('#codeBoxJS').addClass('is-active');
}

if($('#codeBoxStyles code').text().trim().length === 0) {
  toggleStyles.addClass('is-disabled');
}
else {
  toggleStyles.addClass('is-active');
  $('#codeBoxStyles').addClass('is-active');
}

$(window).on("load resize", function() {
  //On small only show one at a time
  if (Foundation.MediaQuery.current == 'small') {
    toggleHTML.addClass('is-active');

    toggleStyles.removeClass('is-active');
    $('#codeBoxStyles').removeClass('is-active');

    toggleJS.removeClass('is-active');
    $('#codeBoxJS').removeClass('is-active');

    // toggles trigger for the code boxes
    toggleHTML.off('click').on('click', function(e) {
      $(this).addClass('is-active');
      $('#codeBoxHTML').addClass('is-active');

      toggleStyles.removeClass('is-active');
      $('#codeBoxStyles').removeClass('is-active');

      toggleJS.removeClass('is-active');
      $('#codeBoxJS').removeClass('is-active');

      e.preventDefault();
    });

    toggleStyles.off('click').on('click', function(e) {
      $(this).addClass('is-active');
      $('#codeBoxStyles').addClass('is-active');

      toggleHTML.removeClass('is-active');
      $('#codeBoxHTML').removeClass('is-active');

      toggleJS.removeClass('is-active');
      $('#codeBoxJS').removeClass('is-active');
      e.preventDefault();
    });

    toggleJS.off('click').on('click', function(e) {
      $(this).addClass('is-active');
      $('#codeBoxJS').addClass('is-active');

      toggleHTML.removeClass('is-active');
      $('#codeBoxHTML').removeClass('is-active');

      toggleStyles.removeClass('is-active');
      $('#codeBoxStyles').removeClass('is-active');

      e.preventDefault();
    });
  }

  else {
    // toggles trigger for the code boxes
    toggleHTML.off('click').on('click', function(e) {
      if( toggleStyles.hasClass('is-active') || toggleJS.hasClass('is-active') ) {
        $(this).toggleClass('is-active');
        $('#codeBoxHTML').toggleClass('is-active');
      }
      e.preventDefault();
    });

    toggleStyles.off('click').on('click', function(e) {
      if( toggleHTML.hasClass('is-active') || toggleJS.hasClass('is-active') ) {
        $(this).toggleClass('is-active');
        $('#codeBoxStyles').toggleClass('is-active');
      }
      e.preventDefault();
    });

    toggleJS.off('click').on('click', function(e) {
      if( toggleHTML.hasClass('is-active') || toggleStyles.hasClass('is-active') ) {
        $(this).toggleClass('is-active');
        $('#codeBoxJS').toggleClass('is-active');
      }
      e.preventDefault();
    });
  }
});
