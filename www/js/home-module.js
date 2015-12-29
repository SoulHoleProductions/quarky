angular.module('home-module', ['ionicLazyLoad', 'ngCordova'])
    .constant("HomeConfig", {
        //'FEED_URL': 'https://quarkyapp.com/wp-json/wp/v2/posts/',
        'FEED_URL': 'https://quarkyapp.com/wp-json/posts/',
        'PAGE_SIZE': 6,
        'CATEGORY': 'home',
        'STATUS': 'publish',
        //'TAG': 'elevate1',
        'ORDER_BY': 'modified', // author, title, name (slug), date, modified
        'ORDER': 'DESC' // ASC or DESC
    })
    .filter('hrefToJS', function ($sce, $sanitize) {
        return function (text) {
            //console.log('before hretToJS: ', text);
            var regex = /href="([\S]+)"/g;
            var newString = $sanitize(text).replace(regex, "href=\"#\" onClick=\"window.open('$1', '_system', 'location=yes')\"");
            //console.log('after hretToJS: ', newString);
            return $sce.trustAsHtml(newString);
        }
    })
    .controller('HomeListCtrl', function ($scope, $rootScope, $window, $sce, auth,
                                          HomeConfig, HomeService2, $ionicPlatform,
                                          $ionicPopup, $ionicModal, $cordovaSocialSharing) {

        $scope.posts = [];
        $scope.pagenum = null;
        $scope.infiniteLoad = false;

        // setup the Ionic User for Analytics
        if(auth.isAuthenticated) {
            // kick off the platform web client
            Ionic.io();
            var user = Ionic.User.current();// this will give you a fresh user or the previously saved 'current user'
            user.id = auth.profile.user_id;
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

            user.save().then(
                function(response) {
                    console.log('user was saved', response);
                },
                function(error) {
                    console.log('user was NOT saved, error:', error);
                }
            );
        } else {
            console.log('Oops, no user authenticated!');
        }


        $ionicPlatform.ready(function () {
        });

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
            HomeService2.getRemoteFeed($scope.pagenum)
                .success(function (result) {
                    console.log("from service: ", result, " pagenum: ", $scope.pagenum);
                    (result.length == HomeConfig.PAGE_SIZE) ? $scope.pagenum++ : $scope.pagenum = 1;
                    if (result.length) {
                            $scope.posts = $scope.posts.concat(result);
                    }
                    $scope.$broadcast("scroll.infiniteScrollComplete");
                    return result;
                    //$scope.infiniteLoad = false;
                }).error(function (data, status, headers, HomeConfig) {
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
        }

        $scope.toTrusted = function (text) {
            return ($sce.trustAsHtml(text));
        }

        // Social Sharing
        // -------------------------------------
        $scope.shareNative = function(message, subject, image, url) {
            if(!message) message = "I am using QuarkyApp, maybe you should too :)";
            if(!subject) subject = "Found this on QuarkyApp!";
            if(!image) image = "https://quarkyapp.com/wp-content/uploads/2015/06/quarkycon1.jpg";
            if(!url) url = "https://quarkyapp.com";
            $cordovaSocialSharing.share(message, subject, image, url);
        }

        // --------------- modal from the given template URL
        $ionicModal.fromTemplateUrl('templates/home-modal.html', function ($ionicModal) {
            $scope.modal = $ionicModal;
        }, {
            // Use our scope for the scope of the modal to keep it simple
            scope: $scope,
            // The animation we want to use for the modal entrance
            animation: 'slide-in-up'
        });
        $scope.openModal = function (aPost) {
            $scope.aPost = aPost;
            $scope.modal.show()
        }
        $scope.closeModal = function () {
            $scope.modal.hide();
        };
        $scope.$on('$destroy', function () {
            $scope.modal.remove();
        });

    })
    .factory('HomeService2', ['$q', '$http', 'HomeConfig', '$window', HomeService2]);


function HomeService2($q, $http, HomeConfig, $window) {

    return {
        getRemoteFeed: getRemoteFeed
    };

    function getRemoteFeed(pagenum, cat) {
        pagenum = pagenum || 1;
        cat = cat || HomeConfig.CATEGORY;

        var params = {
            "filter[category_name]": cat,
            "filter[posts_per_page]": HomeConfig.PAGE_SIZE,
            //"filter[tag]": HomeConfig.TAG,
            "filter[orderby]": HomeConfig.ORDER_BY,
            "filter[post_status]": HomeConfig.STATUS,
            "filter[order]": HomeConfig.ORDER,
            "page": pagenum
        };

        return $http.get(HomeConfig.FEED_URL, {
            params: params,
            cache: true
        });
    };

}
