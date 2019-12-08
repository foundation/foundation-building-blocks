// (function() {
//   var Likes = function() {};
//   window.Likes = Likes;

//   const LIKES_URL = "https://foundation.discourse.group/api/v1/likes";
//   //const LIKES_URL = "https://localhost:3000/api/v1/likes";
//   const MY_LIKES_URL = LIKES_URL + '/me';
//   const INCREMENT_LIKES_URL = LIKES_URL + '/increment';
//   const DECREMENT_LIKES_URL = LIKES_URL + '/decrement';
//   const LIKES_CACHE_KEY = "bb-likes-2";
//   const MY_LIKES_CACHE_KEY = "bb-my-likes";

//   Likes.prototype.getLikes = function getLikes(callback) {
//     if(this.likes) {
//       return callback(this.likes);
//     } else {
//       Likes.getAllLikes(function(likes) {
//         this.likes = likes;
//         callback(this.likes);
//       }.bind(this));
//     }
//   };

//   Likes.prototype.getMyLikes = function getMyLikes(callback) {
//     if(this.myLikes) {
//       return callback(this.myLikes);
//     } else {
//       Likes.getMyLikes(function(likes) {
//         this.myLikes = likes;
//         callback(this.myLikes);
//       }.bind(this));
//     }
//   };

//   Likes.prototype.getLikesForKey = function getLikesForKey(key, callback) {
//     this.getLikes(function(likes) {
//       callback(likes[key]);
//     })
//   };

//   Likes.prototype.getHasLikedForKey = function getHasLikedForKey(key, callback) {
//     this.getMyLikes(function(likes) {
//       callback(!!likes[key]);
//     })
//   };

//   Likes.prototype.likeKey = function likeKey(key, callback) {
//     $.post(INCREMENT_LIKES_URL, {key: key}, callback, 'json');
//   };

//   Likes.prototype.unlikeKey = function unlikeKey(key, callback) {
//     $.post(DECREMENT_LIKES_URL, {key: key}, callback, 'json');
//   };

//   Likes.prototype.swapLikeForKey = function swapLikeForKey(key, callback) {
//     var self = this;
//     this.getHasLikedForKey(key, function(hasLiked) {
//       var fn = hasLiked ? self.unlikeKey : self.likeKey;
//       fn(key, function(like) {
//         Likes.updateLike(like, !hasLiked, function(likes, myLikes) {
//           self.likes = likes;
//           self.myLikes = myLikes;
//           self.populateLikesInPage();
//           self.setupLike();
//           if(callback) {callback();}
//         });
//       });
//     });
//   };

//   Likes.prototype.setupLike = function setupLike() {
//     var $likeable = $('[data-like]');
//     if ($likeable[0]) {
//       var key = $likeable.data().like;
//       this.getHasLikedForKey(key, function(hasLiked) {
//         if (hasLiked) {
//           $likeable.addClass('liked');
//         } else {
//           $likeable.removeClass('liked');
//         }
//       });
//       $likeable.off('click').on('click', function() {
//         this.swapLikeForKey(key)
//       }.bind(this));
//     }
//   };

//   Likes.prototype.populateLikesInPage = function populateLikesInPage() {
//     var self = this;
//     self.getLikes(function() {
//       $('[data-likes]').each(function() {
//         var $elem = $(this);
//         var key = $(this).data().likes;
//         self.getLikesForKey(key, function(likes){
//           if(likes) {
//             $elem.text(likes.count);
//           } else {
//             $elem.text('0');
//           }
//         })
//       });
//     });
//   };

//   Likes.getMyLikes = function getMyLikes(callback) {
//     var cachedLikes = Storage.get(MY_LIKES_CACHE_KEY);
//     if(cachedLikes) {
//       return callback(cachedLikes);
//     } else {
//       Likes.getAndCacheMyLikes(callback);
//     }
//   }

//   Likes.getAllLikes = function getAllLikes(callback) {
//     var cachedLikes = Storage.get(LIKES_CACHE_KEY);
//     if(cachedLikes) {
//       return callback(cachedLikes);
//     } else {
//       Likes.getAndCacheLikes(callback);
//     }
//   };

//   Likes.updateLike = function updateLike(like, hasLiked, callback) {
//     Likes.getAllLikes(function(likes) {
//       likes[like.key] = like;
//       Storage.set(LIKES_CACHE_KEY, likes);
//       Likes.getMyLikes(function(myLikes) {
//         myLikes[like.key] = hasLiked;
//         Storage.set(MY_LIKES_CACHE_KEY, myLikes)
//         callback(likes, myLikes);
//       });
//     });
//   };


//   Likes.getAndCacheLikes = function getAndCacheLikes(callback) {
//     $.getJSON(LIKES_URL, function(array) {
//       var data = Likes.structureData(array)
//       Storage.set(LIKES_CACHE_KEY, data);
//       callback(data);
//     });
//   };

//   Likes.getAndCacheMyLikes = function getAndCacheMyLikes(callback) {
//     $.getJSON(MY_LIKES_URL, function(data) {
//       //var data = Likes.structureData(data)
//       Storage.set(MY_LIKES_CACHE_KEY, data);
//       callback(data);
//     });
//   };

//   Likes.structureData = function structureData(array) {
//     var obj = {};
//     _.each(array, function(item) {
//       obj[item.key] = item;
//     });
//     return obj;
//   };
// })();
