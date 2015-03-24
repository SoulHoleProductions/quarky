// QuarkyApp by Derek Baron

angular.module('quarky', ['ionic',
    'quarky.controllers',
    'quarky.filters',
    'quarky.guru',
    'quarky.home',
    'places.controllers',
    'ngCordova',
    'auth0',
    'angular-storage',
    'angular-jwt'])

    .run(function($ionicPlatform) {
        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .run(function($rootScope, $location) {
        // the following is used by the Places feature
        $rootScope.goHome = function() {
            $location.path('/app/places-servicelist');
        };
    })


    .config(function($stateProvider, $urlRouterProvider, authProvider, $httpProvider,
                     jwtInterceptorProvider) {
        $stateProvider
            .state('app', {
                url: "/app",
                abstract: true,
                templateUrl: "templates/menu.html",
                controller: 'MenuCtrl',
                data: {
                    // This tells Auth0 that this state requires the user to be logged in.
                    // If the user isn't logged in and he tries to access this state
                    // he'll be redirected to the login page
                    requiresLogin: false
                }
            })
            .state('login', {
                url: "/login",
                templateUrl: "templates/login.html",
                controller: "LoginCtrl"
            })

            .state('app.home', {
                url: "/home",
                views: {
                    'menuContent': {
                        templateUrl: "templates/home.html",
                        controller: 'QuarkyHomeCtrl'
                    }
                },
                data: {
                    requiresLogin: false
                }
            })
            .state('app.about', {
                url: "/about",
                views: {
                    'menuContent': {
                        templateUrl: "templates/about.html"
                        //controller: 'AboutCtrl'   ---> no controller needed yet
                    }
                },
                data: {
                    requiresLogin: false
                }
            })
            .state('app.profile', {
                url: "/profile",
                views: {
                    'menuContent': {
                        templateUrl: "templates/profile.html"
                    }
                },
                data: {
                    requiresLogin: true
                }
            })
            .state('app.guru', {
                url: "/guru",
                views: {
                    'menuContent': {
                        templateUrl: "templates/guru.html",
                        controller: 'QuarkyGuruCtrl'
                    }
                },
                data: {
                    requiresLogin: false
                }
            })
            .state('app.places-home', {
                url: '/places-home',
                views: {
                    'menuContent':{
                        controller: 'PlacesHomeCtrl',
                        templateUrl: 'templates/places-home.html'
                    }
                },
                data: {
                    requiresLogin: false
                }
            })
            .state('app.places-servicelist', {
                url: '/places-servicelist',
                views: {
                    'menuContent':{
                        controller: 'ServiceListCtrl',
                        templateUrl: 'templates/places-servicelist.html'
                    }
                },
                data: {
                    requiresLogin: false
                }
            })
            .state('app.places-servicedetail', {
                url: '/places-servicedetail/:serviceId',
                views: {
                    'menuContent':{
                        controller: 'ServiceDetailCtrl',
                        templateUrl: 'templates/places-servicedetail.html'
                    }
                },
                data: {
                    requiresLogin: false
                }
            })
            .state('app.places-card', {
                url: '/place/:placeId',
                views: {
                    'menuContent':{
                        controller: 'PlaceDetailCtrl',
                        templateUrl: 'templates/places-card.html'
                    }
                },
                data: {
                    requiresLogin: false
                }
            });

        // Configure Auth0
        authProvider.init({
            domain: AUTH0_DOMAIN,
            clientID: AUTH0_CLIENT_ID,
            loginState: 'app.home'
        });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/home');

        jwtInterceptorProvider.tokenGetter = function(store, jwtHelper, auth) {
            var idToken = store.get('token');
            var refreshToken = store.get('refreshToken');
            if (!idToken || !refreshToken) {
                return null;
            }
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
    }).run(function($rootScope, auth, store) {
        $rootScope.$on('$locationChangeStart', function() {
            if (!auth.isAuthenticated) {
                var token = store.get('token');
                if (token) {
                    auth.authenticate(store.get('profile'), token);
                }
            }

        });
    });
