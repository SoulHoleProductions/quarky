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
            $scope.page = 1;
            $scope.morePageExist = false;
            $scope.infiniteScroll = false;
            $scope.showWelcome = true;


            $ionicPlatform.ready(function () {
                // Google Analytics
                if (typeof analytics !== 'undefined') {
                    console.log('Google Analytics user-id: ', auth.profile.user_id);
                    analytics.setUserId(auth.profile.user_id);
                }
            });
            // FEED ----
            $scope.loadMore = function () {
                Array.prototype.pushArray = function () {
                    this.push.apply(this, this.concat.apply([], arguments));
                };

                return wordpressAPI.getFreshPosts({
                    'filter[category_name]': 'home',
                    'page': $scope.page
                }).$promise.then(function (data) {
                        var length = data.length;
                        $scope.showWelcome = false;
                        if (length > 0) {
                            $scope.posts.pushArray(data);
                            $scope.page++;
                            $scope.morePageExist = true;
                            if (length < 10) {
                                $scope.morePageExist = false;
                            }
                        }
                        else {
                            $scope.morePageExist = false;
                        }
                        return;
                    })
                    .catch(function (err) {
                        $scope.posts = [];
                        $scope.page = 1;
                        $scope.morePageExist = false;
                        $scope.infiniteScroll = false;
                        $scope.showWelcome = true;
                    })
                    .finally(function () {
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                        if ($scope.morePageExist === true) {
                            $scope.infiniteScroll = true;
                        } else {
                            $scope.infiniteScroll = false;
                        }
                    });
            };
            $scope.refreshPosts = function () {
                $scope.posts = [];
                $scope.page = 1;
                $scope.morePageExist = false;
                $scope.infiniteScroll = false;
                $scope.loadMore();
                $scope.$broadcast('scroll.refreshComplete');
            };

            // FEED ----
            $scope.toTrusted = function (text) {
                return $sce.trustAsHtml(text);
            };

            $scope.openModal2 = function (aPost) {
                $scope.aPost = aPost;
                //$scope.bookmarked = checkBookmark(aPost.ID.toString());
                ArticleModalService.init($scope).then(function (modal) {
                    modal.show();
                    // Google Analytics
                    if (typeof analytics !== 'undefined') {
                        analytics.trackEvent('Article', 'Open', aPost.title, 15);
                        console.log('GA tracking Article Open event for: ', aPost.title);
                    }
                });
            };

        }]);