$(document).foundation();

var _gaq = _gaq || [];
_gaq.push(
  ['_setAccount', 'UA-2195009-2'],
  ['_trackPageview'],
  ['b._setAccount', 'UA-2195009-27'],
  ['b._trackPageview']
);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'https://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
var _kmq = _kmq || [];
!function() {

var _kmq = _kmq || [];
var _kmk = _kmk || "d945f04ff5e68057c85f5323b46f185efb3826b3";
function _kms(u){
  setTimeout(function(){
    var d = document, f = d.getElementsByTagName('script')[0],
    s = d.createElement('script');
    s.type = 'text/javascript'; s.async = true; s.src = u;
    f.parentNode.insertBefore(s, f);
  }, 1);
}
_kms('https://i.kissmetrics.com/i.js');
_kms('https://doug1izaerwt3.cloudfront.net/' + _kmk + '.1.js');

}();

var mySVGsToInject = document.querySelectorAll('img.inject-me');

var likes = new window.Likes();
likes.populateLikesInPage();
likes.setupLike();

SVGInjector(mySVGsToInject);
var $searchInput = $('input[type="search"]')
var setupFilterable = function($current, $links, updateMethod) {
  $links.on('click', function(e) {
    e.preventDefault();
    var $el = $(e.currentTarget);
    var type = $el.data().type;
    $current.text($el.text());
    updateMethod(type);
    $links.each(function() {
      var $link = $(this);
      if (typeof($link.data().hideActive) === 'undefined') {
        if ($link.data().type === type) {
          $link.addClass('is-active');
        } else {
          $link.removeClass('is-active');
        }
      } else {
        if ($link.data().type === type) {
          $link.addClass('hide');
        } else {
          $link.removeClass('hide');
        }
      }
    });
  });
}
var params = getParams();
if($searchInput.is('*')) {
  if(params.q) {
    $('#bb-search-bar').removeClass('is-hidden').show();
    $searchInput.focus();
  }
  window.search = new Search({
    input: $('input[type="search"]'),
    searchContainer: $('#search-results-container .card-container'),
    kitContainer: $('#search-results-container .kit-container'),
    initialQuery: params.q,
    onSearch: function(term, filter, sort, results, kitResults) {
      if(term.length > 0 || filter !== 'all' || sort !== 'newest') {
        $('#main-results-container').hide();
        $('#search-results-container').show();
        $('#search-results-container').foundation();
        $('#result-count').text(results.length);
      } else {
        $('#main-results-container').show();
        $('#search-results-container').hide();
        $('#result-count').text(results.length);
      }
      likes.populateLikesInPage();
    }
  });
  var $currentSort = $('[data-sort-current]');
  var $sortLinks = $('[data-sort]');
  setupFilterable($currentSort, $sortLinks, window.search.setSort.bind(window.search));

  var $currentFilter = $('[data-filter-current]');
  var $filterLinks = $('[data-filter]');
  setupFilterable($currentFilter, $filterLinks, window.search.setFilter.bind(window.search));
  $('#bb-search-bar').on('close.zf.trigger', function() {
    $searchInput.val('');
    window.search.updateSearch();
  }).on('toggle.zf.trigger', function() {
    setTimeout( () => { $searchInput.focus();window.search.updateSearch();}, 1)
  });
}

function getParams() {
  var search = location.search.substring(1);
  return search?JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}',
                   function(key, value) { return key===""?value:decodeURIComponent(value) }):{}
}


function toggleCode() {
  $('#codeBoxSCSS').toggleClass('is-active');
  $('#scssToggle').toggleClass('is-active');
  $('#codeBoxCSS').toggleClass('is-active');
  $('#cssToggle').toggleClass('is-active');
}

$('#scssToggle').click(function(){
  if ($('#cssToggle').hasClass('is-active')) {
    toggleCode();
  }
});

$('#cssToggle').click(function(){
  if ($('#scssToggle').hasClass('is-active')) {
    toggleCode();
  }
});

var toggleHTML = $('[data-toggle-HTML]');
var toggleSCSS = $('[data-toggle-SCSS]');
var toggleJS   = $('[data-toggle-JS]');

// toggles trigger for the code boxes
toggleHTML.click(function(e) {
  if( toggleSCSS.hasClass('is-active') || toggleJS.hasClass('.is-active') ) {
    $(this).toggleClass('is-active');
    $('#codeBoxHTML').toggleClass('is-active');
  }
  e.preventDefault();
});

toggleSCSS.click(function(e) {
  if( toggleHTML.hasClass('is-active') || toggleJS.hasClass('.is-active') ) {
    $(this).toggleClass('is-active');
    $('#codeBoxSCSS').toggleClass('is-active');
  }
  e.preventDefault();
});

toggleSCSS.click(function(e) {
  if( toggleSCSS.hasClass('is-active') || toggleJS.hasClass('.is-active') ) {
    $(this).toggleClass('is-active');
    $('#codeBoxJS').toggleClass('is-active');
  }
  e.preventDefault();
});

var socialName = $('meta[name="og:title"]').prop('content');
var socialImage = $('meta[name="og:image"]').prop('content');
$('#bb-social').jsSocials({
  showLabel: false,
  showCount: false,
  text: "Download this " + socialName + " from Foundation Building Blocks",
  shares: [ { share: "twitter", via: "ZURBFoundation" }, "facebook", {share: "pinterest", media: socialImage, text: socialName + " from Foundation Building Blocks"}]
});

var setCalloutPosition = function(moveOver) {
  localStorage.setItem('course-callout-shrunk', '' + moveOver);
  $('.course-callout-alert').toggleClass('is-moved-over', moveOver);
}

$('[data-toggle-callout]').click(function() {
  setCalloutPosition(!$('.course-callout-alert').hasClass('is-moved-over'));
});

if(localStorage.getItem('course-callout-shrunk') === 'true') {
  $('.course-callout-alert').addClass('is-moved-over no-animate');
  setTimeout(function() {
    $('.course-callout-alert').removeClass('no-animate');
  }, 1);
}

var $footer = $('#footer');
var $window = $(window);
var $callout = $('.course-callout-alert');

if($callout.is('*')) {
  $(window).on("load scroll", function() {
      var footerOffset = $footer.offset().top;
      var myScrollPosition = $(this).scrollTop();
      var windowHeight = $window.height();
      var footerHeight = $footer.outerHeight();

      if ((myScrollPosition + windowHeight - footerHeight) > footerOffset) {
        $callout.addClass('absolute');
      } else {
        $callout.removeClass('absolute');
      }
  });
}
