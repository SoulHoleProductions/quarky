function AboutService2($q) {
    'use strict';
    var _posts = [
        {
            id: '1',
            name: 'Tips and Tricks',
            localImage: 'img/guru-nav/about/Tips-Tricks.png',
            slug: 'tips-tricks-articles'
        },
        {
            id: '2',
            name: 'Partners',
            localImage: 'img/guru-nav/about/Partners.png',
            slug: 'partner-articles'
        },
        {
            id: '3',
            name: 'Acknowledgements',
            localImage: 'img/guru-nav/about/Credits.png',
            slug: 'acknowledgements-articles'
        }  // ----- removed legal disclaimers
           //{
           //    id: '4',
           //    name: 'Legal Disclaimers',
           //    localImage: 'img/guru-nav/about/legal-disclaimers.png',
           //    slug: 'legal-disclaimers-articles'
           //
           //}
    ];

    function getAboutPosts() {
        console.log('getPosts', _posts);
        return _posts;
    }

    function getPost(postId) {
        var dfd = $q.defer();
        _posts.forEach(function (post) {
            if (post.slug === postId) {
                dfd.resolve(post);
            }
        });
        return dfd.promise;
    }

    return {
        getAboutPosts: getAboutPosts,
        getPost: getPost
    };

}

angular.module('about-module', [
        'ionicLazyLoad',
        'ngCordova'
    ])
    .controller('AboutMasterCtrl', ['$scope', '$rootScope', '$window', '$http', '$sce', 'posts', '$ionicPlatform',
        function ($scope, $rootScope, $window, $http, $sce, posts, $ionicPlatform) {
            'use strict';
            $scope.posts = posts;
            $ionicPlatform.ready(function () {
            });
            // -------------- UI helpers
            $scope.toTrusted = function (text) {
                return $sce.trustAsHtml(text);
            };
        }])
    .controller('AboutListCtrl', ['$scope', '$rootScope', '$window', '$sce', '$sanitize', 'post', 'AboutService2', '$ionicPlatform', '$ionicModal',
        '$cordovaSocialSharing', 'UserSettings', 'UserStorageService', 'wordpressAPI', 'wordpressConfig', 'ArticleModalService',
        function ($scope, $rootScope, $window, $sce, $sanitize, post, AboutService2, $ionicPlatform, $ionicModal,
                  $cordovaSocialSharing, UserSettings, UserStorageService, wordpressAPI, wordpressConfig, ArticleModalService) {
            'use strict';
            $scope.post = post;
            $scope.postlist = null;
            $ionicPlatform.ready(function () {
            });
            $scope.loadPostList = function (slug) {
                wordpressAPI.getPosts({
                    'filter[category_name]': slug,
                    'filter[posts_per_page]': '100',
                    'filter[orderby]': wordpressConfig.ORDER_BY,
                    'filter[post_status]': wordpressConfig.STATUS,
                    'filter[order]': wordpressConfig.ORDER,
                    'page': 1
                }).$promise.then(function (data) {
                    console.log('loadPost got remoteData: ', data);
                    $scope.postlist = data;
                    return data;
                }).catch(function (data) {
                    console.log('error: ', data);
                    return data;
                });
            };
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

        }])
    .factory('AboutService2', [
        '$q',
        AboutService2
    ]);
