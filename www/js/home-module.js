angular.module('home-module', [
    'ionicLazyLoad',
    'ngCordova'
])
    .controller('HomeListCtrl', ['$scope', '$rootScope', '$window', '$sce', 'auth', '$sanitize',
    'wordpressAPI', 'wordpressConfig', '$ionicPlatform', 'UserSettings', 'UserStorageService',
    '$ionicPopup', '$ionicModal', '$cordovaSocialSharing', 'ArticleModalService',
    function ($scope, $rootScope, $window, $sce, auth, $sanitize,
                                        wordpressAPI, wordpressConfig, $ionicPlatform, UserSettings, UserStorageService,
                                        $ionicPopup, $ionicModal, $cordovaSocialSharing, ArticleModalService) {
    'use strict';
    $scope.posts = [];
    $scope.pagenum = null;
    $scope.infiniteLoad = false;
    $ionicPlatform.ready(function () {
        // Google Analytics
        if (typeof analytics !== 'undefined') {
            console.log('Google Analytics user-id: ', auth.profile.user_id);
            analytics.setUserId(auth.profile.user_id);
        }
    });
    // FEED ----
    $scope.preLoadFeed = function () {
        $scope.pagenum = 1;
        $scope.getRemoteFeed();
        $scope.infiniteLoad = true;
    };
    $scope.initRemoteFeed = function () {
        console.log('initRemoteFeed: posts.length: ', $scope.posts.length);
        $scope.infiniteLoad = false;
        $scope.pagenum = 1;
        if ($scope.posts.length) {
            $scope.posts = [];
            $scope.getRemoteFeed(true);
        }
        $scope.$broadcast('scroll.refreshComplete');
        $scope.infiniteLoad = true;
    };
    $scope.getRemoteFeed = function (refresh) {
        if (refresh && refresh === true) {
            wordpressAPI.getFreshPosts({
                'filter[category_name]': 'home',
                'page': $scope.pagenum
            }).$promise.then(function (result) {
                console.log('from service: ', result, ' pagenum: ', $scope.pagenum);
                if (result.length === wordpressConfig.PAGE_SIZE) {
                    $scope.pagenum++;
                } else {
                    $scope.pagenum = 1;
                }
                if (result.length) {
                    $scope.posts = $scope.posts.concat(result);
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
                return result;
            }).catch(function (err) {
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $scope.$broadcast('scroll.refreshComplete');
                $scope.infiniteLoad = false;
                return err.data;
            });
        } else {
            wordpressAPI.getPosts({
                'filter[category_name]': 'home',
                'page': $scope.pagenum
            }).$promise.then(function (result) {
                console.log('from service: ', result, ' pagenum: ', $scope.pagenum);

                if (result.length === wordpressConfig.PAGE_SIZE) {
                    $scope.pagenum++;
                } else {
                    $scope.pagenum = 1;
                }

                if (result.length) {
                    $scope.posts = $scope.posts.concat(result);
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
                return result;
            }).catch(function (err) {
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $scope.$broadcast('scroll.refreshComplete');
                $scope.infiniteLoad = false;
                return err.data;
            });
        }
    };
    // FEED ----
    $scope.toTrusted = function (text) {
        return $sce.trustAsHtml(text);
    };

        $scope.openModal2 = function (aPost) {
            $scope.aPost = aPost;
            //$scope.bookmarked = checkBookmark(aPost.ID.toString());
            ArticleModalService.init($scope).then(function(modal){
                modal.show();
                // Google Analytics
                if (typeof analytics !== 'undefined') {
                    analytics.trackEvent('Article', 'Open', aPost.title, 15);
                    console.log('GA tracking Article Open event for: ', aPost.title);
                }
            });
        };

}]);