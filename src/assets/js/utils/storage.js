var Storage = {};
window.Storage = Storage;

Storage.get = function get(key) {
  var string = localStorage.getItem(key);
  if(string) {
    var value = JSON.parse(string);
    var time = new Date().getTime();
    if(value.expires > time) {
      return value.data;
    } else {
      Storage.clear(key);
      return null;
    }
  }
};

Storage.clear = function(key) {
  localStorage.removeItem(key);
};


Storage.set = function set(key, value, timeout) {
  var time = new Date().getTime();
  timeout = timeout || 300 * 1000; // default to 5 min.
  var data = {data: value, expires: time + timeout};
  localStorage.setItem(key, JSON.stringify(data));
};
