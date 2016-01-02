angular.module('guru', ['ngCordova'])
    .service('GuruService', [GuruService])
    .controller('GuruListCtrl', function ($scope,
                                          $ionicPlatform, GuruService,
                                          $stateParams) {
        var postId = $stateParams.id;
        $scope.postName = GuruService.getNavName(postId).name;
        console.log("in GuruListCtrl, postId is:  ", postId);
        $scope.posts = GuruService.getListData(postId);
    })
    .controller('GuruDetailCtrl', function ($scope, auth, $sanitize, Bookmark,
                                            $ionicPlatform, GuruService,
                                            $stateParams, $ionicModal,
                                            wordpressAPI, wordpressConfig,
                                            $sce, $cordovaSocialSharing) {

        $scope.noItems = false;
        $scope.post = {'slug': $stateParams.id};
        $scope.postTitle = $stateParams.id.replace(/-/g, ' ');
        $scope.postlist = null;


        // Infinite FEED ----
        $scope.posts = [];
        $scope.pagenum = null;
        $scope.infiniteLoad = false;

        $scope.preLoadFeed = function (slug) {
            $scope.pagenum = 1;
            $scope.getRemoteFeed(slug);
            $scope.infiniteLoad = true;
        }
        $scope.initRemoteFeed = function (slug) {
            console.log('initRemoteFeed: posts.length: ', $scope.posts.length);
            $scope.infiniteLoad = false;
            $scope.pagenum = 1;
            if ($scope.posts.length) {
                $scope.posts = [];
                $scope.getRemoteFeed(slug);
            }
            $scope.$broadcast("scroll.refreshComplete");
            $scope.infiniteLoad = true;
        };
        $scope.getRemoteFeed = function (slug) {

            var PAGE_SIZE = 8;

            var params = {
                "filter[category_name]": slug ? slug : 'eGuru',
                "page": $scope.pagenum,
                'filter[posts_per_page]': PAGE_SIZE,
                //"filter[tag]": 'elevate1'
            }

            console.log("call WP with params: ", params);

            wordpressAPI.getPosts(params)
                .$promise
                .then(function (result) {
                    console.log("from service: ", result, " pagenum: ", $scope.pagenum);
                    (result.length == PAGE_SIZE) ? $scope.pagenum++ : $scope.pagenum = 1;
                    if (result.length) {
                        $scope.posts = $scope.posts.concat(result);
                    }
                    if ($scope.pagenum ==1 && result.length <= 0) $scope.noItems = true;
                    if(result.length > 0 && result.length < PAGE_SIZE)
                        $scope.infiniteLoad = false;

                    $scope.$broadcast("scroll.infiniteScrollComplete");
                    $scope.$broadcast('scroll.resize');
                    return result;
                })
                .catch(function (err) {
                    console.log('Network error! ', data, status);
                    $scope.$broadcast("scroll.infiniteScrollComplete");
                    $scope.$broadcast("scroll.refreshComplete");
                    $scope.infiniteLoad = false;
                    $rootScope.$broadcast('loading:hide')
                    $ionicPopup.alert({
                        title: 'Network Error!',
                        template: 'Try again when you have a network connection.'
                    });
                    $scope.noItems = true;
                    return data;
                });
        };
        // FEED ----


   /*     $scope.loadPostList = function (slug) {
            GuruService.getRemoteFeed(1, slug).success(function (data) {
                console.log("loadPost got remoteData: ", data);
                $scope.postlist = data;
                if (data.length == 0) $scope.noItems = true;
                return data;
            }).error(function (data) {
                console.log("error: ", data);
                $scope.noItems = true;
                return data;
            });
        }
*/

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
    .controller('GuruCtrl', function ($scope, GuruService) {
        $scope.posts = [];

        $scope.bootstrapFeed = function () {
            $scope.posts = GuruService.bootstrapGuruNav();
        }
    });

function GuruService() {
    var _navdata = [
        {
            "ID": 2631,
            "name": "Info",
            "order": 1,
            "featured_image": {
                "ID": 2713,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/ElevateYourInfo2.png",
                "local": "img/guru-nav/ElevateYourInfo.png"
            }

        },
        {
            "ID": 2655,
            "order": 2,
            "name": "Skills",
            "featured_image": {
                "ID": 2712,
                "source": "https:\/\/quarkyapp.com\/wp-content\/uploads\/2015\/04\/ElevateYourskills2.png",
                "local": "img/guru-nav/ElevateYourskills.png"
            }
        },
        {
            "ID": 2638,
            "order": 3,
            "name": "Story", // from Options to Story
            "featured_image": {
                "ID": 2714,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/ElevateYourStory.png",
                "local": "img/guru-nav/ElevateYourStory.png"
            }
        },
        {
            "ID": 2670,
            "name": "Game",
            "order": 4,
            "featured_image": {
                "ID": 2717,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/ElevateYourgame2.png",
                "local": "img/guru-nav/ElevateYourgame.png"
            }
        },
        {
            "ID": 2642,
            "name": "Yourself",
            "order": 5,
            "featured_image": {
                "ID": 2715,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/ElevateYourself2.png",
                "local": "img/guru-nav/ElevateYourself.png"
            }

        },
        {
            "ID": 2652,
            "name": "Spirit",
            "order": 6,
            "featured_image": {
                "ID": 3026,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/ElevateYourspirit3.png",
                "local": "img/guru-nav/ElevateYourspirit.png"
            }

        }
    ];
    var _elevateSkills = [
        {
            "ID": 2689,
            "slug": "reasoning-articles",
            "featured_image": {
                "ID": 2739,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/REASONS.png",
                "local": "img/guru-nav/eSkills/Reasons.png"
            }

        },
        {
            "ID": 2692,
            "slug": "relationship-articles",
            "featured_image": {
                "ID": 2736,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/Relationships.png",
                "local": "img/guru-nav/eSkills/Relationships.png"
            }
        },
        {
            "ID": 2695,
            "slug": "recognizing-articles",
            "featured_image": {
                "ID": 2734,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/Recognize.png",
                "local": "img/guru-nav/eSkills/Recognize.png"
            }

        },
        {
            "ID": 2699,
            "slug": "responding-articles",
            "featured_image": {
                "ID": 2738,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/Response.png",
                "local": "img/guru-nav/eSkills/Response.png"
            }

        },


        {
            "ID": 2702,
            "slug": "referring-articles",
            "featured_image": {
                "ID": 2735,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/Refferals.png",
                "local": "img/guru-nav/eSkills/Refferals.png"
            }
        },
        {
            "ID": 2708,
            "slug": "resilience-articles",
            "featured_image": {
                "ID": 2737,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/resilience.png",
                "local": "img/guru-nav/eSkills/Resilience.png"
            }
        }
    ];
    var _elevateInfo = [
        {
            "ID": 2761,
            "slug": "a-d-articles",
            "featured_image": {
                "ID": 2759,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/A-D.png",
                "local": "img/guru-nav/eInfo/A-D.png"
            }
        },
        {
            "ID": 2757,
            "slug": "e-h-articles",
            "featured_image": {
                "ID": 2758,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/E-H.png",
                "local": "img/guru-nav/eInfo/E-H.png"
            }

        },
        {
            "ID": 2770,
            "slug": "i-l-articles",
            "featured_image": {
                "ID": 2771,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/I-L.png",
                "local": "img/guru-nav/eInfo/I-L.png"
            }

        },
        {
            "ID": 2776,
            "slug": "m-p-articles",
            "featured_image": {
                "ID": 2768,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/M-P.png",
                "local": "img/guru-nav/eInfo/M-P.png"
            }

        },
        {
            "ID": 2773,
            "slug": "q-t-articles",
            "featured_image": {
                "ID": 2779,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/Q-T-1.png",
                "local": "img/guru-nav/eInfo/Q-T.png"
            }
        },
        {
            "ID": 2777,
            "slug": "u-z-articles",
            "featured_image": {
                "ID": 2774,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/U-Z.png",
                "local": "img/guru-nav/eInfo/U-Z.png"
            }
        },
    ];
    var _elevateOptions = [
        {
            "ID": 3004,
            "slug": "good-bad-articles",
            "featured_image": {
                "ID": 3005,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/06/Good-Advice-Bad-Advice.png",
                "local": "img/guru-nav/eOptions/Good-Advice-Bad-Advice.png"
            }
        },
        {
            "ID": 3002,
            "slug": "share-your-stories-articles",
            "featured_image": {
                "ID": 3000,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/06/Share-Your%E2%80%A2-Story-%E2%80%A2-1.png",
                "local": "img/guru-nav/eOptions/Share-Your-Story.png"
            }

        },
        {
            "ID": 2994,
            "slug": "stories-with-support-articles",
            "featured_image": {
                "ID": 2998,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/06/Stories-with-Support-1.png",
                "local": "img/guru-nav/eOptions/Stories-with-Support-1.png"
            }

        }, {
            "ID": 2992,
            "slug": "ask-jason-article",
            "featured_image": {
                "ID": 3036,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/06/Ask-Jason-2.png",
                "local": "img/guru-nav/eOptions/Ask-Jason.png"
            }

        }
    ];
    var _elevateGame = [
        {
            "ID": 2780,
            "slug": "game-plans-articles",
            "featured_image": {
                "ID": 2990,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/Game-Plans-1.png",
                "local": "img/guru-nav/eGame/Game-Plans-1.png"
            }

        },
        {
            "ID": 3138,
            "slug": "get-a-job-articles",
            "featured_image": {
                "ID": 3139,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/07/Get-a-job.png",
                "local": "img/guru-nav/eGame/Get-a-job.png"
            }

        },
        {
            "ID": 4195,
            "slug": "money-smart-articles",
            "featured_image": {
                "ID": 4181,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/Money-Smart.png",
                "local": "img/guru-nav/eGame/Money-Smart.png"
            }

        },
        {
            "ID": 4197,
            "slug": "read-articles",
            "featured_image": {
                "ID": 4198,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/08/Books-that-Matter.png",
                "local": "img/guru-nav/eGame/Books-that-Matter.png"
            }

        },
        {
            "ID": 2785,
            "slug": "equipment-articles",
            "featured_image": {
                "ID": 2783,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/Equpment.png",
                "local": "img/guru-nav/eGame/Equpment.png"
            }

        },
        {
            "ID": 2788,
            "slug": "boot-camp-articles",
            "featured_image": {
                "ID": 2989,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/Boot-Camp-1.png",
                "local": "img/guru-nav/eGame/Boot-Camp-1.png"
            }
        }
    ];
    var _elevateSelf = [
        {
            "ID": 3008,
            "slug": "share-an-inspiration-articles",
            "featured_image": {
                "ID": 3007,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/06/Share-your-inspiration.png",
                "local": "img/guru-nav/eSelf/Share-your-inspiration.png"
            }
        },
        {
            "ID": 2744,
            "slug": "who-am-i-articles",
            "featured_image": {
                "ID": 2722,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/whoAmI.png",
                "local": "img/guru-nav/eSelf/whoAmI.png"
            }
        },
        {
            "ID": 2740,
            "slug": "attitude-articles",
            "featured_image": {
                "ID": 2723,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/attitude.png",
                "local": "img/guru-nav/eSelf/attitude.png"
            }

        },
        {
            "ID": 2742,
            "slug": "encouragement-articles",
            "featured_image": {
                "ID": 2724,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/encouragement.png",
                "local": "img/guru-nav/eSelf/encouragement.png"
            }

        },
        {
            "ID": 2750,
            "slug": "friends-articles",
            "featured_image": {
                "ID": 2726,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/Friends.png",
                "local": "img/guru-nav/eSelf/Friends.png"
            }
        },
        {
            "ID": 2748,
            "slug": "love-articles",
            "featured_image": {
                "ID": 2720,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/Love.png",
                "local": "img/guru-nav/eSelf/Love.png"
            }

        },
        {
            "ID": 2752,
            "slug": "family-articles",
            "featured_image": {
                "ID": 2725,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/family.png",
                "local": "img/guru-nav/eSelf/family.png"
            }

        },
        {
            "ID": 2746,
            "slug": "higher-learning-articles",
            "featured_image": {
                "ID": 2727,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/higherlearning.png",
                "local": "img/guru-nav/eSelf/higherlearning.png"
            }

        },
        {
            "ID": 2754,
            "slug": "random-articles",
            "featured_image": {
                "ID": 2721,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/random.png",
                "local": "img/guru-nav/eSelf/random.png"
            }

        },

    ];
    var _elevateSpirit = [
        {
            "ID": 4185,
            "slug": "worth-articles",
            "featured_image": {
                "ID": 4241,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/08/Worth.png",
                "local": "img/guru-nav/eSpirit/Worth.png"
            }
        },
        {
            "ID": 4183,
            "slug": "belong-articles",
            "featured_image": {
                "ID": 4212,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/08/Belonging2.png",
                "local": "img/guru-nav/eSpirit/Belonging2.png"
            }
        },
        {
            "ID": 4187,
            "slug": "concern-articles",
            "featured_image": {
                "ID": 4213,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/08/Concern-for-Others2.png",
                "local": "img/guru-nav/eSpirit/Concern-for-Others2.png"
            }
        },
        {
            "ID": 4189,
            "slug": "meaning-articles",
            "featured_image": {
                "ID": 4180,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/Meaning-1.png",
                "local": "img/guru-nav/eSpirit/Meaning-1.png"
            }
        },
        {
            "ID": 4191,
            "slug": "hope-articles",
            "featured_image": {
                "ID": 4214,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/08/hope2.png",
                "local": "img/guru-nav/eSpirit/hope2.png"
            }
        },
        {
            "ID": 4193,
            "slug": "life-death-articles",
            "featured_image": {
                "ID": 4179,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/04/Life-and-Death.png",
                "local": "img/guru-nav/eSpirit/Life-and-Death.png"
            }
        }
    ];
    var _comingSoon = [
        {
            "ID": 0000,
            "slug": "coming-soon",
            "featured_image": {
                "ID": 3007,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/06/Coming-Soon.png",
                "local": "img/guru-nav/Coming-Soon.png"
            }
        }
    ];

    this.getNavName = function (id) {
        console.log("getnavname: ", id);
        for (var i = 0; i < _navdata.length; i++) {
            if (_navdata[i].ID == id) {
                console.log("get nav name returning: ", _navdata[i]);
                return _navdata[i];
            }
        }
    };
    this.getListData = function (id) {
        console.log("getting list data for ", id);
        switch (id) {
            case '2631':
                return this.getElevateInfo();
                break;
            case '2655':
                return this.getElevateSkills();
                break;
            case '2638':
                return this.getElevateOptions();
                break;
            case '2670':
                return this.getElevateGame();
                break;
            case '2642':
                return this.getElevateSelf();
                break;
            case '2652':
                return this.getElevateSpirit();
                break; // TODO finish elevateYourSpirit
            default:
                return this.getComingSoon();
        }
        return;
    }
    this.getComingSoon = function () {

        return _comingSoon;
    }
    this.getElevateSpirit = function () {
        //https://quarkyapp.com/wp-json/posts?filter[category_name]=elevate-your-spirit&filter[posts_per_page]=30&filter[tag]=elevate2
        return _elevateSpirit;
    };
    this.getElevateSelf = function () {
        //https://quarkyapp.com/wp-json/posts?filter[category_name]=inspiration&filter[posts_per_page]=30&filter[tag]=elevate2
        return _elevateSelf;
    };
    this.getElevateGame = function () {
        //https://quarkyapp.com/wp-json/posts?filter[category_name]=elevate-your-game&filter[posts_per_page]=30&filter[tag]=elevate2
        return _elevateGame;
    };
    this.getElevateOptions = function () {
        //https://quarkyapp.com/wp-json/posts?filter[category_name]=options&filter[posts_per_page]=30&filter[tag]=elevate2
        return _elevateOptions;
    };
    this.getElevateSkills = function () {
        //https://quarkyapp.com/wp-json/posts?filter[category_name]=skills&filter[posts_per_page]=30&filter[tag]=elevate2
        return _elevateSkills;
    };
    this.getElevateInfo = function () {
        return _elevateInfo;
    };
    this.bootstrapGuruNav = function () {
        return _navdata;

    };
}