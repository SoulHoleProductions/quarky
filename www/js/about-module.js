angular.module('about-module', ['ionicLazyLoad', 'ngCordova'])
    .controller('AboutMasterCtrl', function ($scope, $rootScope, $window, $http,
                                             $sce, posts, $ionicPlatform) {

        $scope.posts = posts;

        $ionicPlatform.ready(function () {
        });

        // -------------- UI helpers
        $scope.toTrusted = function (text) {
            return ($sce.trustAsHtml(text));
        }

    })
    .controller('AboutListCtrl', function ($scope, $rootScope, $window, $sce, $sanitize,
                                           post, AboutService2, $ionicPlatform, $ionicModal,
                                           $cordovaSocialSharing, Bookmark,
                                           wordpressAPI, wordpressConfig) {

        $scope.post = post;
        $scope.postlist = null;

        $ionicPlatform.ready(function () {
        });

        $scope.loadPostList = function (slug) {

            wordpressAPI.getPosts({
                    "filter[category_name]": slug,
                    "filter[posts_per_page]": '100',
                    "filter[orderby]": wordpressConfig.ORDER_BY,
                    "filter[post_status]": wordpressConfig.STATUS,
                    "filter[order]": wordpressConfig.ORDER,
                    "page": 1
                })
                .$promise
                .then(function (data) {
                    console.log("loadPost got remoteData: ", data);
                    $scope.postlist = data;
                    return data;
                })
                .catch(function (err) {
                    console.log("error: ", data);
                    return data;
                });

        }

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
    })
    .factory('AboutService2', ['$q', AboutService2]);


function AboutService2($q) {
    var _posts = [
        {
            id: '1',
            name: 'Partners',
            localImage: 'img/guru-nav/about/Partners.png',
            slug: 'partner-articles'
        },
        {
            id: '2',
            name: 'Acknowledgements',
            localImage: 'img/guru-nav/about/Credits.png',
            slug: 'acknowledgements-articles'

        },
        {
            id: '3',
            name: 'Legal Disclaimers',
            localImage: 'img/guru-nav/about/legal-disclaimers.png',
            slug: 'legal-disclaimers-articles'

        },
        {
            id: '4',
            name: 'Tips and Tricks',
            localImage: 'img/guru-nav/about/Tips-Tricks.png',
            slug: 'tips-tricks-articles'

        }
    ];
    return {
        getAboutPosts: getAboutPosts,
        getPost: getPost
    };
    function getAboutPosts() {
        console.log("getPosts", _posts);
        return _posts;
    };
    function getPost(postId) {
        var dfd = $q.defer();
        _posts.forEach(function (post) {
            if (post.slug === postId) {
                dfd.resolve(post);
            }
        });

        return dfd.promise;
    }
}
