angular.module('about-module', ['ionicLazyLoad', 'ngCordova'])
    .constant("AboutConfig", {
        'FEED_URL': 'https://quarkyapp.com/wp-json/posts/',
        'PAGE_SIZE': 20,
        'CATEGORY': 'about-app',
        'STATUS': 'publish',
        //'TAG': 'elevate1',
        'ORDER_BY': 'modified', // author, title, name (slug), date, modified
        'ORDER': 'DESC' // ASC or DESC
    })
    .controller('AboutMasterCtrl', function ($scope, $rootScope, $window, $http,
                                             $sce, posts, AboutConfig, $ionicPlatform) {

        $scope.posts = posts;

        $ionicPlatform.ready(function () {});

        // -------------- UI helpers
        $scope.toTrusted = function (text) {
            return ($sce.trustAsHtml(text));
        }

        //TODO: temp for testing a post to wordpress
        $scope.makePost = function(accessToken) {

            var newPost = {'title':'Hello World!','content':'some Content'};
            var postURL = 'https://public-api.wordpress.com/rest/v1/sites/95387847/posts/new';
            var req = {
                method: 'POST',
                url: postURL,
                headers: {
                    'Authorization': 'Bearer '+ accessToken
                },
                data: newPost
            };

            $http(req)
                .success(function(data, status, headers, config) {
                    $scope.res = data.title;
                    console.log('data: ', data);
                    console.log('status: ',status);
                    console.log('headers: ', headers);
                    console.log('config: ', config);
                })
                .error(function(data, status, headers, config) {
                    console.log('ERROR data: ', data);
                    console.log('ERROR status: ',status);
                    console.log('ERROR headers: ', headers);
                    console.log('ERROR config: ', config);
                    $rootScope.$broadcast('loading:hide')
                });

        }


        // TODO: This function won't work for nested objects
        function serializeData( data ) {
            // If this is not an object, defer to native stringification.
            if ( ! angular.isObject( data ) ) {
                return( ( data == null ) ? "" : data.toString() );
            }

            var buffer = [];

            // Serialize each key in the object.
            for ( var name in data ) {
                if ( ! data.hasOwnProperty( name ) ) {
                    continue;
                }

                var value = data[ name ];

                buffer.push(
                    encodeURIComponent( name ) + "=" + encodeURIComponent( ( value == null ) ? "" : value )
                );
            }

            // Serialize the buffer and clean it up for transportation.
            var source = buffer.join( "&" ).replace( /%20/g, "+" );
            return( source );
        }
        // TODO: Test this function for deep nexted objects to paramaterize them
        function paramDataDeep(obj) {

            if ( ! angular.isObject( obj) ) {
                return( ( obj== null ) ? "" : obj.toString() );
            }
            var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

            for(name in obj) {

                value = obj[name];
                if(value instanceof Array) {
                    for(i in value) {

                        subValue = value[i];
                        fullSubName = name + '[' + i + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }

                } else if(value instanceof Object) {
                    for(subName in value) {

                        subValue = value[subName];
                        fullSubName = name + '[' + subName + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                }
                else if(value !== undefined && value !== null)
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
            }

            return query.length ? query.substr(0, query.length - 1) : query;
        };

        $scope.oauthPost = function() {

            var authPost = {
                'client_id': '41643',
                'client_secret': 'UAcoH257k2E43GEhlrAwfbLlsqNNJxC0BueLbw94faCX6PdhT95O5rBSHk5JphBr',
                'grant_type': 'password',
                'username': 'dbaronks',
                'password': 'Vonbaron1'
            };
            var getTokenURL = 'https://public-api.wordpress.com/oauth2/token';

            var oauthReq = {
                method: 'POST',
                url: getTokenURL,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                //headers: {
                //'Authorization': 'Bearer eyJhbGciOiJIUzIsNiIsInR5cCI6IkpXVCJ9.eyJjb250ZW50IjoiVGhpcyBpcyB5b3VyIHVzZXIgSldUIHByb3ZpZGVkIGJ5IHRoZSBBdXRoMCBzZXJ2rXIifQ.b47GoWoY_5n4jIyGghPTLFEQtSegnVydcvl6gpWNeUE'
                //},
                data: serializeData(authPost)
            };

            $http(oauthReq)
                .success(function(data, status, headers, config) {
                    //$scope.res = data.title;
                    console.log('data: ', data);
                    console.log('status: ',status);
                    console.log('headers: ', headers);
                    console.log('config: ', config);
                    $scope.makePost(data.access_token);
                })
                .error(function(data, status, headers, config) {
                    console.log( 'Post POST error.',data );
                    $rootScope.$broadcast('loading:hide')
                });

        }


    })
    .controller('AboutListCtrl', function ($scope, $rootScope, $window, $sce, AboutConfig,
                                           post, AboutService2, $ionicPlatform, $ionicModal,
                                           $cordovaSocialSharing) {

        $scope.post = post;
        $scope.postlist = null;

        $ionicPlatform.ready(function () {});

        $scope.loadPostList = function (slug) {
            AboutService2.getRemoteFeed(1, slug).success(function (data) {
                console.log("loadPost got remoteData: ", data);
                $scope.postlist = data;
                return data;
            }).error(function (data) {
                console.log("error: ", data);
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
        $ionicModal.fromTemplateUrl('templates/about-modal.html', function ($ionicModal) {
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
.factory('AboutService2', ['$q', '$http', 'AboutConfig', '$window', AboutService2]);


function AboutService2($q, $http, AboutConfig, $window) {
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
        getRemoteFeed: getRemoteFeed,
        getPosts: getPosts,
        getPost: getPost
    };

    function getPosts() {
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

    function getRemoteFeed(pagenum, cat) {
        pagenum = pagenum || 1;
        cat = cat || AboutConfig.CATEGORY;

        var params = {
            "filter[category_name]": cat,
            "filter[posts_per_page]": AboutConfig.PAGE_SIZE,
            //"filter[tag]": AboutConfig.TAG,
            "filter[orderby]": AboutConfig.ORDER_BY,
            "filter[post_status]": AboutConfig.STATUS,
            "filter[order]": AboutConfig.ORDER,
            "page": pagenum
        };

        var service = $http.get(AboutConfig.FEED_URL, {
            params: params
        });


        return service.success(function (result) {
            return result;
        }).error(function (data) {
            console.log('get remotefeed error! ', data);
            return;
        });
    };

}
