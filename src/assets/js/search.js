var Search = function(options) {
  this.$input = $(options.input);
  this.$searchContainer = $(options.searchContainer);
  this.$kitContainer = $(options.kitContainer);
  this.onSearch = options.onSearch;
  this.initialQuery = options.initialQuery;
  this.blockSource = options.blockTemplate || '#building-block-card';
  this.kitSource = options.kitTemplate || '#kit-card';
  this.setup();
};

Search.prototype.setup = function() {
  this.updateSearch = this.updateSearch.bind(this)
  this.loadTemplates();
  this.globalFileName = $('meta[name="bbfile"]').prop('content');
  this.kitFileName = $('meta[name="kitfile"]').prop('content');
  this.localFileName = $('meta[name="datafile"]').prop('content');
  this.datakey = $('meta[name="datakey"]').prop('content');
  this.rootpath = $('meta[name="rootpath"]').prop('content');
  this.loadData();
  this.sort = 'newest';
  this.filter = 'all';
  this.$input.on('keyup', this.updateSearch);
};


Search.prototype.setFilter = function(type) {
  this.filter = type;
  this.updateSearch();
};

Search.prototype.setSort = function(type) {
  this.sort = type;
  this.updateSearch();
};

Search.prototype.loadTemplates = function() {
  this.blockTemplate = Handlebars.compile($(this.blockSource).html());
  this.kitTemplate = Handlebars.compile($(this.kitSource).html());
};

Search.prototype.loadData = function() {
  var self = this;
  $.getJSON(this.globalFileName, function(res) {
    self.data = res;
    self.searchableData = _.map(_.values(res), function(object) {
      var content = [object.author.name, object.name, object.category].concat(object.tags).join(' ').toLowerCase()
      return [content, object];
    });

    if(self.initialQuery && self.data && self.kitData && self.localData) {
      self.$input.val(self.initialQuery);
      self.updateSearch();
    }
  });
  $.getJSON(this.kitFileName, function(res) {
    self.kitData = res;
    self.searchableKitData = _.map(_.values(res), function(object) {
      var content = [object.name].join(' ').toLowerCase()
      return [content, object];
    });
    if(self.initialQuery && self.data && self.kitData && self.localData) {
      self.$input.val(self.initialQuery);
      self.updateSearch();
    }
  });
  $.getJSON(this.localFileName, function(res) {
    self.localData = res[self.datakey].blocks;
    self.searchableLocalData = _.map(self.localData, function(object) {
      var content = [object.author.name, object.name, object.category].concat(object.tags).join(' ').toLowerCase()
      return [content, object];
    });
    if(self.initialQuery && self.data && self.kitData && self.localData) {
      self.$input.val(self.initialQuery);
      self.updateSearch();
    }
  });
};

Search.prototype.updateSearch = function(event) {
  var term = this.$input.val();
  var blockResults, kitResults;
  if(term.length > 0) {
    blockResults = this.findResults(term.toLowerCase());
    kitResults = this.findKitResults(term.toLowerCase());
  } else {
    blockResults = this.localData;
  }

  blockResults = this.sortResults(this.filterResults(blockResults));

  console.log('results', blockResults);

  var blockTemplate = this.blockTemplate;
  var kitTemplate = this.kitTemplate;
  var self = this;

  var blockHTML = _.map(blockResults, function(result) {
    return blockTemplate(_.extend({root: self.rootpath},result));
  }).join('');

  this.$searchContainer.html(blockHTML).foundation();
  if(kitResults) {
    var kitHTML = _.map(kitResults, function(result) {
      return kitTemplate(_.extend({root: self.rootpath},result));
    }).join('');
    this.$kitContainer.html(kitHTML).foundation();
  }
  if(this.onSearch) {this.onSearch(term, this.filter, this.sort, blockResults, kitResults);}
};

Search.prototype.findResults = function(value) {
  if (!this.data) { return []; }
  var data;
  data = this.searchableData;

  var results = _.map(_.filter(data, function(pair) {
    return pair[0].indexOf(value) !== -1;
  }), function(pair) {return pair[1]});
  // TODO: Actual results;
  return results;
};

Search.prototype.findKitResults = function(value) {
  if (!this.kitData) { return []; }
  var data;
  data = this.searchableKitData;

  var results = _.map(_.filter(data, function(pair) {
    return pair[0].indexOf(value) !== -1;
  }), function(pair) {return pair[1]});
  // TODO: Actual results;
  return results;
};

Search.prototype.compareFn = function() {
  if(this.sort === 'newest') {
    return function(val) {
      return -(new Date(val.dateUpdated));
    }
  } else if (this.sort === 'oldest') {
    return function(val) {
      return new Date(val.dateUpdated);
    }
  } else if (this.sort === 'alphabetical') {
    return function(val) {
      return val.name.toLowerCase();
    }
  } else {
    return function() { return 1; };
  }
};

Search.prototype.filterFn = function() {
  if(this.filter === "all") {
    return function() { return true; };
  } else {
    var version = this.filter;
    return function(elem) {
      return !!_.find(elem.versions, function(v) {
        return v.indexOf(version) == 0;
      });
    }
  }
}

Search.prototype.sortResults = function(results) {
  return _.sortBy(results, this.compareFn());
};

Search.prototype.filterResults = function(results) {
  return _.filter(results, this.filterFn());
};
