angular.module('home-module', ['ionicLazyLoad', 'ngCordova'])
    .controller('HomeListCtrl', function ($scope, $rootScope, $window, $sce, auth, $sanitize,
                                          wordpressAPI, wordpressConfig, $ionicPlatform,
                                          UserSettings, UserStorageService, $ionicPopup,
                                          $ionicModal, $cordovaSocialSharing) {

        $scope.posts = [];
        $scope.pagenum = null;
        $scope.infiniteLoad = false;


        $ionicPlatform.ready(function () {
        });


        // FEED ----
        $scope.preLoadFeed = function () {
            $scope.pagenum = 1;
            $scope.getRemoteFeed();
            $scope.infiniteLoad = true;
        }
        $scope.initRemoteFeed = function () {
            console.log('initRemoteFeed: posts.length: ', $scope.posts.length);
            $scope.infiniteLoad = false;
            $scope.pagenum = 1;
            if ($scope.posts.length) {
                $scope.posts = [];
                $scope.getRemoteFeed(true);
            }
            $scope.$broadcast("scroll.refreshComplete");
            $scope.infiniteLoad = true;
        };
        $scope.getRemoteFeed = function (refresh) {
            if(refresh && refresh == true) {
                wordpressAPI.getFreshPosts(
                    {
                        "filter[category_name]": 'home',
                        "page": $scope.pagenum
                    }

                    )
                    .$promise
                    .then(function(result) {
                        console.log("from service: ", result, " pagenum: ", $scope.pagenum);
                        (result.length == wordpressConfig.PAGE_SIZE) ? $scope.pagenum++ : $scope.pagenum = 1;
                        if (result.length) {
                            $scope.posts = $scope.posts.concat(result);
                        }
                        $scope.$broadcast("scroll.infiniteScrollComplete");
                        return result;
                    })
                    .catch(function(err){
                        $scope.$broadcast("scroll.infiniteScrollComplete");
                        $scope.$broadcast("scroll.refreshComplete");
                        $scope.infiniteLoad = false;
                        return err.data;
                    });
            }
            else {
                wordpressAPI.getPosts(
                    {
                        "filter[category_name]": 'home',
                        "page": $scope.pagenum
                    }

                    )
                    .$promise
                    .then(function(result) {
                        console.log("from service: ", result, " pagenum: ", $scope.pagenum);
                        (result.length == wordpressConfig.PAGE_SIZE) ? $scope.pagenum++ : $scope.pagenum = 1;
                        if (result.length) {
                            $scope.posts = $scope.posts.concat(result);
                        }
                        $scope.$broadcast("scroll.infiniteScrollComplete");
                        return result;
                    })
                    .catch(function(err){
                        $scope.$broadcast("scroll.infiniteScrollComplete");
                        $scope.$broadcast("scroll.refreshComplete");
                        $scope.infiniteLoad = false;
                        return err.data;
                    });
            }
        };
        // FEED ----

        $scope.toTrusted = function (text) {
            return ($sce.trustAsHtml(text));
        }
        // Social Sharing
        // -------------------------------------
        $scope.shareNative = function (message, subject, image, url) {
            function htmlToPlaintext(text) {
                return text ? String(text).replace(/<[^>]+>/gm, '') : '';
            }

            console.log("shareNative, message: ", message, " subject: ", subject, " image: ", image, " url: ", url);
            if(message) {
                message = htmlToPlaintext($sanitize(message));
            } else {
                message = "I am using QuarkyApp, maybe you should too :)";
            }

            if(subject){
                subject = htmlToPlaintext($sanitize(subject));
            } else {
                subject = "Found this on Quarky App!";
            }

            if (!image) image = "https://quarkyapp.com/wp-content/uploads/2015/06/quarkycon1.jpg";
            if (!url) url = "https://quarkyapp.com";

            console.log("shareNative, message: ", message, " subject: ", subject, " image: ", image, " url: ", url);

            if(ionic.Platform.isWebView()) { // cordova app
                $cordovaSocialSharing.share(message, subject, image, url);
            }
        }


        // --------------- modal from the given template URL

        // Bookmarking
        $scope.bookmarks = UserSettings.bookmarks;
        function checkBookmark(id) {
            var keys;
            try {
                keys = Object.keys($scope.bookmarks);
            } catch(e) {
                keys = [];
            }
            console.log('bookmark keys: ', keys);
            var index = keys.indexOf(id);
            if (index >= 0) {
                return true;
            } else {
                return false;
            }
        }
        function changeSetting(type, value) {
            $scope[type] = value;
            UserSettings[type] = value;
            UserStorageService.serializeSettings();
        };
        $scope.bookmarkItem = function (id) {
            if ($scope.bookmarked) {
                var change = $scope.bookmarks;
                delete change[id];
                changeSetting('bookmarks', change);
                $scope.bookmarked = false;
            } else {
                var change = $scope.bookmarks;
                change[id] = "bookmarked";
                changeSetting('bookmarks', change);
                $scope.bookmarked = true;
            }
        };

        $ionicModal.fromTemplateUrl('templates/article-modal.html', function ($ionicModal) {
            $scope.modal = $ionicModal;
        }, {
            // Use our scope for the scope of the modal to keep it simple
            scope: $scope,
            // The animation we want to use for the modal entrance
            animation: 'slide-in-up'
        });
        $scope.openModal = function (aPost) {
            $scope.aPost = aPost;
            $scope.bookmarked = checkBookmark(aPost.ID.toString());
            $scope.modal.show()
        }
        $scope.closeModal = function () {
            $scope.modal.hide();
        };
        $scope.$on('$destroy', function () {
            $scope.modal.remove();
        });
        // Execute action on hide modal
        $scope.$on('modal.hidden', function() {
        });

        // ----------------- modal

    });
