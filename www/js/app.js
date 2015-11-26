angular.module('quarky', ['ionic',
        'ionic.service.core', 'ngCordova',
        'ionic.service.analytics',
        'about-module',
        'home-module',
        'menu',
        'profile',
        'guru',
        'places',
        'auth0',
        'angular-storage',
        'angular-jwt',
        'ngResource'
    ])

    .run(function ($ionicPlatform, $ionicAnalytics,
                   auth, $rootScope, store,
                   jwtHelper, $location, $ionicLoading) {

        $ionicPlatform.ready(function () {
            console.log('Platform ready');
            $ionicAnalytics.register();

            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }

            if (window.cordova && window.cordova.plugins.inAppBrowser) {
                window.open = cordova.InAppBrowser.open;
            }

  /*          if (ionic.Platform.isIOS())
                ionic.Platform.fullScreen();

            if (window.StatusBar) {
                return StatusBar.hide();
            }
*/
            if(window.StatusBar) {
                console.log('StatusBar!!');
                StatusBar.overlaysWebView(false);
                //StatusBar.style(1); //Light
                //StatusBar.style(2); //Black, transulcent
                //StatusBar.style(3); //Black, opaque
            }

        });

        //-------------- global http loading
        $rootScope.$on('loading:show', function () {
            $ionicLoading.show({template: 'Loading...'})
        });
        $rootScope.$on('loading:hide', function () {
            $ionicLoading.hide()
        });

        //-------------- auth0
        //This hooks all auth events
        auth.hookEvents();
        //This event gets triggered on URL change
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


    })

    .config(function ($stateProvider, $urlRouterProvider, authProvider, $httpProvider,
                      jwtInterceptorProvider) {
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
                    // This tells Auth0 that this state requires the user to be logged in.
                    // If the user isn't logged in and he tries to access this state
                    // he'll be redirected to the login page
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
                        return AboutService2.getPosts();
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


        //-------------- auth0
        authProvider.init({
            domain: AUTH0_DOMAIN,
            clientID: AUTH0_CLIENT_ID,
            loginState: 'login'
        });
        authProvider.on('loginSuccess', function ($location, profilePromise, idToken, store, refreshToken) {
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
        });
        jwtInterceptorProvider.tokenGetter = function (store, jwtHelper, auth) {
            var idToken = store.get('token');
            var refreshToken = store.get('refreshToken');
            // If no token return null
            if (!idToken || !refreshToken) {
                return null;
            }
            // If token is expired, get a new one
            if (jwtHelper.isTokenExpired(idToken)) {
                return auth.refreshIdToken(refreshToken).then(function (idToken) {
                    store.set('token', idToken);
                    return idToken;
                });
            } else {
                return idToken;
            }
        }
        $httpProvider.interceptors.push('jwtInterceptor');

        //-------------- global http loading
        $httpProvider.interceptors.push(function ($rootScope) {
            return {
                request: function (config) {
                    $rootScope.$broadcast('loading:show')
                    return config
                },
                response: function (response) {
                    $rootScope.$broadcast('loading:hide')
                    return response
                }
            }
        });

    });
