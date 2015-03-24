// QuarkyApp by Derek Baron

angular.module('quarky', ['ionic',
    'quarky.controllers',
    'quarky.filters',
    'quarky.guru',
    'quarky.home',
    'places.controllers',
    'auth0',
    'angular-storage',
    'angular-jwt'])

    .run(function($rootScope, auth, store, jwtHelper, $location) {
        // the following is used by the Places feature
        $rootScope.goHome = function() {
            $location.path('/app/places-servicelist');
        };

        // This events gets triggered on refresh or URL change
        $rootScope.$on('$locationChangeStart', function() {
            if (!auth.isAuthenticated) {
                var token = store.get('token');
                if (token) {
                    if (!jwtHelper.isTokenExpired(token)) {
                        auth.authenticate(store.get('profile'), token);
                    } else {
                        // Either show Login page or use the refresh token to get a new idToken
                        $location.path('/');
                    }
                }
            }
        });
    })

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
            .state('app.resources', {
                url: "/resources",
                views: {
                    'menuContent': {
                        templateUrl: "templates/resources.html",
                        controller: 'ResourcesCtrl'
                    }
                },
                data: {
                    requiresLogin: false
                }
            })
            .state('app.single', {
                url: "/resources/:playlistId",
                views: {
                    'menuContent': {
                        templateUrl: "templates/resource.html",
                        controller: 'ResourceCtrl'
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

        authProvider.init({
            domain: 'quarky.auth0.com',
            clientID: 'DoMMtmruuSqicU4qjeyvZTXEB0TImsqy',
            loginState: 'app'
        });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/home');

    })

    .run(function(auth) {
        // This hooks all auth events to check everything as soon as the app starts
        auth.hookEvents();
    });
