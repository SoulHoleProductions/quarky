angular.module('quarky', ['ionic',
        'ionic.service.core',
        'ionic.service.analytics',
        'ionic.service.push',
        'ngCordova',
        'about-module',
        'home-module',
        'menu',
        'profile',
        'guru',
        'places',
        'auth0',
        'angular-storage',
        'angular-jwt',
        'ngResource',
        'ion-autocomplete'
    ])
    .constant("wordpressV2Config", {
        'FEED_URL': 'https://soul-hole.net/wp-json/wp/v2/',
        'PAGE_SIZE': -1, // get them all
        'STATUS': 'publish',
//        'TAG': 'elevate1',
        'ORDER_BY': 'title', // author, title, name (slug), date, modified
        'ORDER': 'ASC' // ASC or DESC
    })
    .factory('wordpressAPIv2', function ($resource, wordpressV2Config) {
        return $resource(wordpressV2Config.FEED_URL,
            {},
            {
                getMe: {
                    method: 'GET',
                    cache: true,
                    url: wordpressV2Config.FEED_URL + 'users/me'
                },
                getPosts: {
                    method: 'GET',
                    cache: true,
                    isArray: true,
                    url: wordpressV2Config.FEED_URL + ':verb',
                    params: {
                        verb: 'posts',
                        'filter[posts_per_page]': wordpressV2Config.PAGE_SIZE,
                        'filter[orderby]': wordpressV2Config.ORDER_BY,
                        'filter[post_status]': wordpressV2Config.STATUS,
                        'filter[order]': wordpressV2Config.ORDER
                    },
                    headers: {}
                },
                getPost: {
                    method: 'GET',
                    cache: true,
                    url: wordpressV2Config.FEED_URL + 'posts/:id',
                    params: {
                        id: '@id'
                    },
                    headers: {}
                },
                createPost: {
                    method: 'POST',
                    url: wordpressV2Config.FEED_URL + 'posts',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            }
        );
    })
    .constant("wordpressConfig", {
        'FEED_URL': 'https://quarkyapp.com/wp-json/',
        'PAGE_SIZE': 6, // 70 for guru, 6 for home
        'CATEGORY': 'eGuru', // 'eGuru' vs 'Home'
        'STATUS': 'publish',
        'TAG': 'elevate1', // home DOES NOT use this
        'ORDER_BY': 'modified', // author, title, name (slug), date, modified
        'ORDER': 'DESC' // ASC or DESC
    })
    .factory('wordpressAPI', function ($resource, wordpressConfig) {
        return $resource(wordpressConfig.FEED_URL,
            {},
            {
                getPosts: {
                    method: 'GET',
                    cache: true,
                    isArray: true,
                    url: wordpressConfig.FEED_URL + ':verb',
                    params: {
                        verb: 'posts',
                        'filter[posts_per_page]': wordpressConfig.PAGE_SIZE,
                        'filter[orderby]': wordpressConfig.ORDER_BY,
                        'filter[post_status]': wordpressConfig.STATUS,
                        'filter[order]': wordpressConfig.ORDER
                    },
                    headers: {}
                },
                getPost: {
                    method: 'GET',
                    cache: true,
                    url: wordpressConfig.FEED_URL + 'posts/:ID',
                    params: {
                        ID: '@ID'
                    },
                    headers: {}
                }
            }
        );
    })
    .filter('capitalize', function () {
        return function (input, scope) {
            if (input != null) {
                input = input.toString();
                var stringArr = input.split(" ");
                var result = "";
                var cap = stringArr.length;
                for (var x = 0; x < cap; x++) {
                    stringArr[x].toLowerCase();
                    if (x === cap - 1) {
                        result += stringArr[x].substring(0, 1).toUpperCase() + stringArr[x].substring(1);
                    } else {
                        result += stringArr[x].substring(0, 1).toUpperCase() + stringArr[x].substring(1) + " ";
                    }
                }
                return result;
            }
        }
    })
    .filter('hrefToJS', function ($sce, $sanitize) {
        return function (text) {
            var regex = /href="([\S]+)"/g;
            var newString = $sanitize(text).replace(regex, "href=\"#\" onClick=\"window.open('$1', '_system', 'location=yes')\"");
            return $sce.trustAsHtml(newString);
        }
    })
    .value('UserSettings', // These are the default user settings for a new user
        {
            "birthday": new Date(),
            "want_add_places": false,
            "gender": "male",
            "searchModel": {
                "radius": "25",
                "per_page": "15",
                "showCategories": false,
                "showGooglePlaces": false,
                "lastPlaceSearch": "",
            },
            "bookmarks": {}
        }
    )
    .factory('auth0metadata', function($resource) {
        var FEED_URL = 'https://quarky.auth0.com/api/v2/';
        return $resource(FEED_URL,
            {},
            {
                updateUser: {
                    method: 'PATCH',
                    url: FEED_URL + 'users/:user',
                    params: {
                        user: '@user'
                    },
                    headers: {}
                },
                getUser: {
                    method: 'GET',
                    cache: false,
                    url: FEED_URL + 'users/:user',
                    params: {
                        user: '@user'
                    },
                    headers: {}
                }
            }
        );

    })
    .service("UserStorageService", function (UserSettings, auth, auth0metadata, $ionicPopup) {

        deserializeSettings();

        // API
        return {
            serializeSettings: serializeSettings,
            deserializeSettings: deserializeSettings
        };

        function getAuth0User() {
            var userid = auth.profile.user_id;
            console.log('getAuth0User: ', userid );
            return userid;
        }
        function updateAuth0() {
            console.log("UserSettings to update: ", UserSettings);
            var request = {};
            request.user = getAuth0User();

            var body = {
                "user_metadata": UserSettings
            };

            return auth0metadata.updateUser(request, body).$promise;
        }

        function serializeSettings() {
            updateAuth0()
                .then(function (o) {
                    console.log("User Settings saved: ", o.user_metadata);
                })
                .catch(function (err) {
                    console.log("Error: User Settings not saved", err);
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'Could not save your settings'
                    });
                });
        }
        function deserializeSettings() {

            auth0metadata.getUser( { user : getAuth0User() } ).$promise
                .then(function(o){
                    //console.log('deserialize got o: ', o);
                    if(o.user_metadata) {
                        angular.extend(UserSettings, o.user_metadata);
                        console.log("User Settings restored: ", o.user_metadata);
                        console.log("UserSettings: ", UserSettings);
                    } else {
                        // we don't have user_metadata, so create them
                        console.log("we don't have user_metadata, so create them...");
                        serializeSettings();
                    }
                    /*var newSettings, rawSettings = o;
                    if (rawSettings) {
                        newSettings = JSON.parse(rawSettings);
                        if (newSettings) {
                            // use extend since it copies one property at a time
                            angular.extend(UserSettings, newSettings);
                            console.log("User Settings restored");
                        }
                    }*/

                })
                .catch(function(err){
                    console.log("Unable to restore settings: ", err);
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'Could not restore your settings'
                    });
                });

        }
    })
    .service('setupIonicIO', function (auth, $ionicAnalytics, $ionicPush) {
        this.forUser = function(user) {
            // update ionic user settings from auth (just in case)
            user.set('name', auth.profile.name);
            user.set('email', auth.profile.email);
            user.set('picture', auth.profile.picture);
            user.set('nickname', auth.profile.nickname);
            if (auth.profile.app_metadata && auth.profile.app_metadata.can_add_places) {
                user.set('can_add_places', auth.profile.app_metadata.can_add_places.toString());
            } else {
                user.set('can_add_places', 'false');
            }

            // setup analytics once we have User set (no anonymous events are wanted)
            $ionicAnalytics.register({
                dryRun: false, // send events to backend? TODO: change to false before publish
                silent: false  // silent logger
            });

            //register for push notifications
            //if on cordova
            if(ionic.Platform.isWebView()) {
                $ionicPush.register(
                    function (pushToken) {
                        console.log('$ionicPush registered token:', pushToken.token);
                        user.addPushToken(pushToken);
                        user.save().then(
                            function (response) {
                                console.log('$ionicPush user.save during auth reg: ', response);
                            },
                            function (error) {
                                console.log('$ionicPush user.save ERROR during auth reg:', error);
                            }
                        );
                    }
                );
            } else {
                // still save the user if not on cordova...
                user.save().then(
                    function (response) {
                        console.log('not cordova user.save during auth reg: ', response);
                    },
                    function (error) {
                        console.log('not cordova user.save ERROR during auth reg:', error);
                    }
                );
            }
        }
    })
    .run(function ($ionicPlatform, $ionicAnalytics, $ionicPush, $ionicUser,
                   auth, $rootScope, store, $state, $ionicPopup, $window,
                   jwtHelper, $location, $ionicLoading) {


        $ionicPlatform.ready(function () {
            ionic.Platform.isFullScreen ? console.log("quarky is fullscreen") : console.log("quarky is NOT fullscreen");
            ionic.Platform.isIOS() ? console.log("quarky is iOS") : console.log("quarky is NOT iOS");
            ionic.Platform.isAndroid() ? console.log("quarky is Android") : console.log("quarky is NOT Android");
            ionic.Platform.isWebView() ? console.log("quarky is Cordova") : console.log("quarky is NOT Cordova");

            // kick off the platform web client
            Ionic.io();

            // only if on cordova
            if(ionic.Platform.isWebView()) {
                $ionicPush.init({
                    "debug": false,
                    "onNotification": function(notification) {
                        var payload = notification.payload;
                        console.log('$ionicPush onNotification(): ', notification, payload);
                        var lastPush = {
                            title: notification.title || 'Message from Quarky:',
                            template: notification.text || 'Just checking in...'
                        };
                        $window.localStorage['lastPush'] = JSON.stringify(lastPush);
                        $ionicLoading.hide()
                        $ionicPopup.alert({
                            title: 'A new message',
                            template: notification.text || 'Please check your Profile'
                        });
                    },
                    "onRegister": function(data) {
                        console.log('$ionicPush onRegister() token: ', data.token);
                    },
                    "onError": function(err) {
                        console.log('$ionicPush onError(): ', err.message);
                    },
                    "pluginConfig": {
                        "ios": {
                            "alert": "true",
                            "badge": "true",
                            "sound": "true"
                        },
                        "android": {
                            "senderID": "586634803974",
                            "icon": "icon",
                            "iconColor": "black"
                        }
                    }
                });
            }

            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                //StatusBar.styleDefault();
                StatusBar.styleBlackTranslucent();
            }
            if (window.cordova && window.cordova.plugins.inAppBrowser) {
                window.open = cordova.InAppBrowser.open;
            }

            if (auth.isAuthenticated) {
                console.log('authenticated, move to home-list');
                /*
                 // ----- update push tokens
                 var push = new Ionic.Push();
                 var user = Ionic.User.current();
                 var callback = function(pushToken) {
                 console.log('Updated push Registered token:', pushToken.token);
                 console.log('Updated push token for:', auth.profile.name, ': ', myAuth.profile.user_id);
                 user.addPushToken(pushToken);
                 user.save(); // you NEED to call a save after you add the token
                 }
                 push.register(callback);
                 */
                // -------------------- IONIC.IO
                // load the user so we can add the new push token as needed
                $ionicUser.load(auth.profile.user_id)
                    .then(
                        // the auth'd user was found and loaded
                        function (loadedUser) {
                            console.log("$ionicUser.load(): ", loadedUser);
                            var user = $ionicUser.current(loadedUser); // now the current user and (stored)
                            setupIonicIO.forUser(user);
                        },
                        function (err) {
                            // auth'd user was NOT found, create new user
                            var user = $ionicUser.current();
                            if (!user.id || user.id != auth.profile.user_id) {
                                user.id = auth.profile.user_id;
                                setupIonicIO.forUser(user);
                            } else {
                                //couldn't load the user for some reason
                                console.log('$ionicUser load error during auth:', err);
                            }
                        });
                // -------------------- IONIC.IO

                $state.go('app.home-list');

            }
        });

        //-------------- global http loading
        $rootScope.$on('loading:show', function () {
            $ionicLoading.show({template: 'Loading...'})
        });
        $rootScope.$on('loading:hide', function () {
            $ionicLoading.hide()
        });
        $rootScope.$on('loading:offline', function () {
            $ionicLoading.hide()
            $ionicPopup.alert({
                title: 'No network',
                template: 'You seem to be offline...'
            });
        });

        //-------------- auth0
        var refreshingToken = null;
        $rootScope.$on('$locationChangeStart', function () {
            var token = store.get('token');
            var refreshToken = store.get('refreshToken');
            if (token) {
                if (!jwtHelper.isTokenExpired(token)) {
                    if (!auth.isAuthenticated) {
                        auth.authenticate(store.get('profile'), token);
                    }
                } else {
                    if (refreshToken) {
                        if (refreshingToken === null) {
                            refreshingToken = auth.refreshIdToken(refreshToken).then(function (idToken) {
                                store.set('token', idToken);
                                auth.authenticate(store.get('profile'), idToken);
                            }).finally(function () {
                                refreshingToken = null;
                            });
                        }
                        return refreshingToken;
                    } else {
                        $location.path('/login');// Notice: this url must be the one defined
                    }                          // in your login state. Refer to step 5.
                }
            }
        });
        auth.hookEvents();
    })

    .config(function ($stateProvider, $urlRouterProvider,
                      authProvider, $httpProvider, jwtInterceptorProvider) {


        $stateProvider

            .state('login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl'
            })
            .state('app', {
                url: "/app",
                abstract: true,
                templateUrl: "templates/menu.html",
                controller: 'MenuCtrl'
            })
            .state('app.profile', {
                url: "/profile",
                views: {
                    'menuContent': {
                        templateUrl: "templates/profile.html",
                        controller: 'ProfileCtrl'
                    }
                },
                data: {
                    // This tells Auth0 that this state requires the user to be logged in.
                    // If the user isn't logged in and he tries to access this state
                    // he'll be redirected to the login page
                    requiresLogin: true
                }
            })
            .state('app.bookmarks', {
                url: "/bookmarks",
                views: {
                    'menuContent': {
                        templateUrl: "templates/bookmarks.html",
                        controller: 'BookmarksCtrl'
                    }
                },
                data: {
                    // This tells Auth0 that this state requires the user to be logged in.
                    // If the user isn't logged in and he tries to access this state
                    // he'll be redirected to the login page
                    requiresLogin: true
                }
            })
            .state('app.guru', {
                url: "/guru",
                views: {
                    'menuContent': {
                        templateUrl: "templates/guru-nav.html",
                        controller: 'GuruCtrl'
                    }
                },
                data: {
                    // This tells Auth0 that this state requires the user to be logged in.
                    // If the user isn't logged in and he tries to access this state
                    // he'll be redirected to the login page
                    requiresLogin: true
                }
            })
            .state('app.guru-list', {
                url: "/guru/list/:id",
                views: {
                    'menuContent': {
                        templateUrl: "templates/guru-list.html",
                        controller: 'GuruListCtrl'
                    }
                }
            })
            .state('app.guru-detail', {
                url: "/guru/detail/:id",
                views: {
                    'menuContent': {
                        templateUrl: "templates/guru-detail.html",
                        controller: 'GuruDetailCtrl'
                    }
                },
                data: {
                    // This tells Auth0 that this state requires the user to be logged in.
                    // If the user isn't logged in and he tries to access this state
                    // he'll be redirected to the login page
                    requiresLogin: false
                }
            })
            .state('app.home-list', {
                url: "/home-list",
                views: {
                    'menuContent': {
                        templateUrl: "templates/home-list.html",
                        controller: 'HomeListCtrl'
                    }
                },
                data: {
                    requiresLogin: true
                }
            })
            .state('app.about-master', {
                url: "/about-master",
                views: {
                    'menuContent': {
                        templateUrl: "templates/about-master.html",
                        controller: 'AboutMasterCtrl'
                    }
                },
                data: {
                    // This tells Auth0 that this state requires the user to be logged in.
                    // If the user isn't logged in and he tries to access this state
                    // he'll be redirected to the login page
                    requiresLogin: true
                },
                resolve: {
                    posts: function (AboutService2) {
                        return AboutService2.getAboutPosts();
                    }
                }
            })
            .state('app.about-list', {
                url: "/about-list/:postId",
                views: {
                    'menuContent': {
                        templateUrl: "templates/about-list.html",
                        controller: 'AboutListCtrl'
                    }
                },
                resolve: {
                    post: function ($stateParams, AboutService2) {
                        return AboutService2.getPost($stateParams.postId);
                    }
                }
            })
            .state('app.places-master', {
                url: "/places-master",
                cache: false,
                views: {
                    'menuContent': {
                        templateUrl: "templates/places-master.html",
                        controller: 'PlacesMasterCtrl'
                    }
                },
                data: {
                    // This tells Auth0 that this state requires the user to be logged in.
                    // If the user isn't logged in and he tries to access this state
                    // he'll be redirected to the login page
                    requiresLogin: true
                }
            })
            .state('app.places-articles', {
                url: "/places-articles",
                cache: false,
                params: {searchParams: null},
                views: {
                    'menuContent': {
                        templateUrl: "templates/places-articles.html",
                        controller: 'PlacesArticlesCtrl'
                    }
                },
                data: {
                    // This tells Auth0 that this state requires the user to be logged in.
                    // If the user isn't logged in and he tries to access this state
                    // he'll be redirected to the login page
                    requiresLogin: false
                }
            })
            .state('app.places-gallery', {
                url: "/places/gallery",
                cache: false,
                params: {galleryParams: null},
                views: {
                    'menuContent': {
                        templateUrl: "templates/places-gallery.html",
                        controller: 'PlacesGalleryCtrl'
                    }
                },
                data: {
                    // This tells Auth0 that this state requires the user to be logged in.
                    // If the user isn't logged in and he tries to access this state
                    // he'll be redirected to the login page
                    requiresLogin: false
                }
            })
            .state('app.place-detail', {
                cache: false,
                url: "/place-detail/:placeId",
                views: {
                    'menuContent': {
                        templateUrl: "templates/place-detail.html",
                        controller: 'PlacesDetailCtrl'
                    }
                }
            })
            .state('app.place-ohana-detail', {
                cache: false,
                url: "/place-ohana-detail/:placeId",
                views: {
                    'menuContent': {
                        templateUrl: "templates/place-ohana-detail.html",
                        controller: 'PlacesOhanaDetailCtrl'
                    }
                }
            })

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/login');
        /*$urlRouterProvider.otherwise(function($injector, $location){
            var $state = $injector.get("$state");
            var myAuth = $injector.get("auth");

            if(myAuth.isAuthenticated) {
                // ----- update push tokens
                var push = new Ionic.Push();
                var user = Ionic.User.current();
                var callback = function(pushToken) {
                    console.log('Updated push Registered token:', pushToken.token);
                    console.log('Updated push token for:', myAuth.profile.name, ': ', myAuth.profile.user_id);
                    user.addPushToken(pushToken);
                    user.save(); // you NEED to call a save after you add the token
                }
                push.register(callback);

                $state.go('app.home-list');
            } else {
                $state.go('login');
            }
        });*/

        //-------------- auth0
        authProvider.init({
            domain: AUTH0_DOMAIN,
            clientID: AUTH0_CLIENT_ID,
            loginState: 'login'
        });
        /*authProvider.on('loginSuccess', function ($location, profilePromise, idToken, store, refreshToken) {
            console.log('got loginSuccess ');

            profilePromise.then(function (profile) {
                console.log('loginSuccess profile: ', profile);
                console.log('loginSuccess token: ', idToken);
                console.log('loginSuccess refreshToken: ', refreshToken);

                store.set('profile', profile);
                store.set('token', idToken);
                store.set('refreshToken', refreshToken);
                $location.path('/app/home-list');
            });
        });
        authProvider.on('authenticated', function ($location) {
            console.log('got authenticated ');
            $location.path('/app/home-list');
        });
        authProvider.on('loginFailure', function ($location, error, auth, store) {
            // Error callback
            console.log('loginFailure: ', error);
            auth.signout();
            store.remove('profile');
            store.remove('token');
            store.remove('refreshToken');
            $location.path('/login');
        });*/

        jwtInterceptorProvider.tokenGetter = function(store, jwtHelper, auth) {
            var idToken = store.get('token');
            var refreshToken = store.get('refreshToken');
            // If no token return null
            if (!idToken || !refreshToken) {
                return null;
            }
            // If token is expired, get a new one
            if (jwtHelper.isTokenExpired(idToken)) {
                return auth.refreshIdToken(refreshToken).then(function(idToken) {
                    store.set('token', idToken);
                    return idToken;
                });
            } else {
                return idToken;
            }
        }
        $httpProvider.interceptors.push('jwtInterceptor');

        //-------------- global http loading
        $httpProvider.interceptors.push(function ($rootScope, $q) {

            var handleError = function (response) {
                console.log('$resource Error: ', response);
                var status = response.status;
                if ((status >= 500) && (status < 600)) {
                    $rootScope.$broadcast('loading:offline')
                    return response;
                }
                if (status <= 0) {
                    $rootScope.$broadcast('loading:offline')
                    return response;
                }
                $rootScope.$broadcast('loading:hide');
                return response;
            }

            return {
                request: function (config) {
                    $rootScope.$broadcast('loading:show')
                    return config
                },
                response: function (response) {
                    $rootScope.$broadcast('loading:hide')
                    return response
                },
                responseError: function (response) {
                   return $q.reject(handleError(response));
                },
                requestError: function (response) {
                    return $q.reject(handleError(response));
                }
            }
        });

    });
