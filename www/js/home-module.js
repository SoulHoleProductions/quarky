angular.module('home-module', ['ionicLazyLoad', 'ngCordova'])
    .controller('HomeListCtrl', function ($scope, $rootScope, $window, $sce, auth, $sanitize,
                                          wordpressAPI, wordpressConfig, $ionicPlatform, Bookmark,
                                          $ionicPopup, $ionicModal, $cordovaSocialSharing) {

        $scope.posts = [];
        $scope.pagenum = null;
        $scope.infiniteLoad = false;

        // --------------------- IONIC.IO
        if(auth.isAuthenticated) {

            var user = null;
            // kick off the platform web client
            Ionic.io();

            Ionic.User.load(auth.profile.user_id).then(
                //success
                function(loadedUser) {
                    //console.log("loaded a user: ", loadedUser);
                    // if this user should be treated as the current user,
                    // you will need to set it as such:
                    Ionic.User.current(loadedUser);

                    // assuming you previous had var user = Ionic.User.current()
                    // you will need to update your variable reference
                    user = Ionic.User.current();
                    //console.log("current user is: ", user);
                    saveUser(user);
                },
                // failed to load user from platform
                function(err) {
                    //failure loading user
                    console.log('failed to laod user from ionic.io, assume new user: ', err);

                    user.id = auth.profile.user_id;
                    saveUser(user);
                });

        } else {
            console.log('Oops, no user authenticated!');
        }

        function saveUser(user) {
            user.set('name', auth.profile.name );
            user.set('email', auth.profile.email );
            user.set('picture', auth.profile.picture );
            user.set('nickname', auth.profile.nickname );

            if(auth.profile.user_metadata && auth.profile.user_metadata.birthday) {
                var _date = new Date(auth.profile.user_metadata.birthday);
                user.set('birthday', _date.toLocaleDateString("en-US"));
            }

            if(auth.profile.user_metadata && auth.profile.user_metadata.gender) {
                user.set('gender', auth.profile.user_metadata.gender);
            } else {
                user.set('gender', 'neuter');
            }

            if(auth.profile.user_metadata && auth.profile.user_metadata.want_add_places) {
                user.set('want_add_places', auth.profile.user_metadata.want_add_places);
            } else {
                user.set('want_add_places', 'No');
            }

            if(auth.profile.app_metadata && auth.profile.app_metadata.can_add_places) {
                user.set('can_add_places', auth.profile.app_metadata.can_add_places.toString());
            } else {
                user.set('can_add_places', 'false');
            }
            console.log('About to SAVE USER to ionic.io: ', user);
            user.save().then(
                function(response) {
                    console.log('user was saved: ', response);
                },
                function(error) {
                    console.log('user was NOT saved, error:', error);
                }
            );
        }

        // -------------------- IONIC.IO

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
                $scope.getRemoteFeed();
            }
            $scope.$broadcast("scroll.refreshComplete");
            $scope.infiniteLoad = true;
        };
        $scope.getRemoteFeed = function () {
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
                    console.log('Network error! ', data, status);
                    $scope.$broadcast("scroll.infiniteScrollComplete");
                    $scope.$broadcast("scroll.refreshComplete");
                    $scope.infiniteLoad = false;
                    $rootScope.$broadcast('loading:hide')
                    $ionicPopup.alert({
                        title: 'Network Error!',
                        template: 'Try again when you have a network connection.'
                    });
                    return data;
                });
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
            $scope.bookmarked = Bookmark.check(aPost.ID.toString());
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

        // Bookmarking
        $scope.bookmarkItem = function (id) {
            if ($scope.bookmarked) {
                Bookmark.remove(id);
                $scope.bookmarked = false;
            } else {
                Bookmark.set(id);
                $scope.bookmarked = true;
            }
        };

        // ----------------- modal

    });
