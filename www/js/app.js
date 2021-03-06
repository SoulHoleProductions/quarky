angular.module('quarky', [
        'ionic',
        'templates',
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
        'lbServices',
        'ion-autocomplete',
        'ionic-datepicker',
        'ionicLazyLoad'
    ])
    .constant('wordpressV2Config', {
        'FEED_URL': 'http://soul-hole.net/wp-json/wp/v2/',
        'PAGE_SIZE': -1,
        // get them all
        'STATUS': 'publish',
        //        'TAG': 'elevate1',
        'ORDER_BY': 'title',
        // author, title, name (slug), date, modified
        'ORDER': 'ASC'  // ASC or DESC
    })
    .factory('wordpressAPIv2', ['$resource', 'wordpressV2Config', function ($resource, wordpressV2Config) {
        'use strict';
        return $resource(wordpressV2Config.FEED_URL, {}, {
            getMe: {
                method: 'GET',
                url: wordpressV2Config.FEED_URL + 'users/me?_envelope'  //note: use 'body' from envelope
            },
            getUser: {
                method: 'GET',
                url: wordpressV2Config.FEED_URL + 'users/:id',
                params: {id: '@id'},
                headers: {}
            },
            getPosts: {
                method: 'GET',
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
                params: {id: '@id'},
                headers: {}
            },
            createPost: {
                method: 'POST',
                url: wordpressV2Config.FEED_URL + 'posts',
                headers: {'Content-Type': 'application/json'}
            },
            testComment: {
                method: 'POST',
                url: wordpressV2Config.FEED_URL + 'comments',
                headers: {'Content-Type': 'application/json'}
            }
        });
    }])
    .constant('wordpressConfig', {
        'FEED_URL': 'https://quarkyapp.com/wp-json/',
        'PAGE_SIZE': 10,
        // 70 for guru, 6 for home
        'CATEGORY': 'eGuru',
        // 'eGuru' vs 'Home'
        'STATUS': 'publish',
        'TAG': 'elevate1',
        // home DOES NOT use this
        'ORDER_BY': 'modified',
        // author, title, name (slug), date, modified
        'ORDER': 'DESC'  // ASC or DESC
    })
    .factory('wordpressAPI', ['$resource', 'wordpressConfig', function ($resource, wordpressConfig) {
        'use strict';

        return $resource(wordpressConfig.FEED_URL, {}, {
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
            getFreshPosts: {
                method: 'GET',
                cache: false,
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
                params: {ID: '@ID'},
                headers: {}
            }
        });
    }])
    .factory('PushWoosh', ['$q', '$rootScope', '$window', function ($q, $rootScope, $window) {
        'use strict';
        $window.addEventListener('push-notification', function (event) {
            //console.log('PushWoosh received push-notification: ', event);
            var notification = {};
            if (ionic.Platform.isIOS()) {
                notification.title = event.notification.aps.alert;
                notification.meta = event.notification.u;
            }
            if (ionic.Platform.isAndroid()) {
                notification.title = event.notification.title;
                notification.meta = event.notification.userdata;
            }
            $rootScope.$broadcast('event:push-notification', notification);
        });
        return {
            setTags: function (tags) {
                var defer = $q.defer();
                if (!tags) {
                    defer.reject('Please provide tags.');
                } else if (!window.plugins || !window.plugins.pushNotification) {
                    defer.reject('Push Notification not enabled.');
                } else {
                    var pushNotification = window.plugins.pushNotification;
                    pushNotification.setTags(tags, function (status) {
                        //success
                        defer.resolve();
                    }, function (status) {
                        defer.reject('setTags failed.');
                    });
                }
                return defer.promise;
            },
            setApplicationIconBadgeNumber: function (num) {
                if (ionic.Platform.isIOS()) {
                    var pushNotification = window.plugins.pushNotification;
                    pushNotification.setApplicationIconBadgeNumber(num);
                }
            },
            init: function (pwAppId, googleProjectNumber) {
                var defer = $q.defer();
                if (!pwAppId) {
                    defer.reject('Please provide your pushwoosh app id.');
                } else if (!window.plugins || !window.plugins.pushNotification) {
                    defer.reject('Push Notification not enabled.');
                } else {
                    var pushNotification = window.plugins.pushNotification;
                    if (ionic.Platform.isIOS()) {
                        pushNotification.onDeviceReady({pw_appid: pwAppId});
                    }
                    if (ionic.Platform.isAndroid()) {
                        pushNotification.onDeviceReady({
                            projectid: googleProjectNumber,
                            appid: pwAppId
                        });
                    }
                    defer.resolve();
                }
                return defer.promise;
            },
            registerDevice: function () {
                var defer = $q.defer();
                var pushNotification = window.plugins.pushNotification;
                pushNotification.registerDevice(function (status) {
                    var deviceToken;
                    if (ionic.Platform.isIOS()) {
                        deviceToken = status.deviceToken;
                        //reset badges on app start and device reg
                        pushNotification.setApplicationIconBadgeNumber(0);
                    }
                    if (ionic.Platform.isAndroid()) {
                        deviceToken = status;
                    }
                    defer.resolve(deviceToken);
                }, function (status) {
                    defer.reject(status);
                });
                return defer.promise;
            }
        };
    }])
    .filter('capitalize', [function () {
        'use strict';
        return function (input, scope) {
            if (input !== null) {
                input = input.toString();
                var stringArr = input.split(' ');
                var result = '';
                var cap = stringArr.length;
                for (var x = 0; x < cap; x++) {
                    stringArr[x].toLowerCase();
                    if (x === cap - 1) {
                        result += stringArr[x].substring(0, 1).toUpperCase() + stringArr[x].substring(1);
                    } else {
                        result += stringArr[x].substring(0, 1).toUpperCase() + stringArr[x].substring(1) + ' ';
                    }
                }
                return result;
            }
        };
    }])
    .filter('hrefToJS', ['$sce', '$sanitize', function ($sce, $sanitize) {
        'use strict';
        return function (text) {
            var regex = /href="([\S]+)"/g;
            var newString = $sanitize(text).replace(regex, 'href="#" onClick="window.open(\'$1\', \'_system\', \'location=yes\')"');
            return $sce.trustAsHtml(newString);
        };
    }])
    .value('UserSettings', // These are the default user settings for a new user
        {
            'birthday': new Date(),
            'want_add_places': false,
            'gender': 'male',
            'searchModel': {
                'radius': '10',
                'per_page': '3',
                'showCategories': false,
                'showGooglePlaces': false,
                'lastPlaceSearch': ''
            },
            'bookmarks': {}
        })
    .factory('auth0metadata', ['$resource', function ($resource) {
        'use strict';
        var FEED_URL = 'https://quarky.auth0.com/api/v2/';
        return $resource(FEED_URL, {}, {
            updateUser: {
                method: 'PATCH',
                url: FEED_URL + 'users/:user',
                params: {user: '@user'},
                headers: {}
            },
            getUser: {
                method: 'GET',
                cache: false,
                url: FEED_URL + 'users/:user',
                params: {user: '@user'},
                headers: {}
            }
        });
    }])
    .service('UserStorageService', ['UserSettings', 'auth', 'auth0metadata', '$ionicPopup', function (UserSettings, auth, auth0metadata, $ionicPopup) {
        'use strict';
        function getAuth0User() {
            var userid = auth.profile.user_id;
            //console.log('getAuth0User: ', userid);
            return userid;

        }

        function updateAuth0() {
            console.log('UserSettings to update: ', UserSettings);
            var request = {};
            request.user = getAuth0User();
            var body = {'user_metadata': UserSettings};
            return auth0metadata.updateUser(request, body).$promise;
        }

        function serializeSettings() {
            updateAuth0().then(function (o) {
                console.log('User Settings saved: ', o.user_metadata);
            }).catch(function (err) {
                console.log('Error: User Settings not saved', err);
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'Could not save your settings'
                });
            });
        }

        function deserializeSettings() {
            //console.log('deserializeSettings() auth is: ', auth);
            auth0metadata.getUser({user: getAuth0User()}).$promise.then(function (o) {
                //console.log('deserialize got o: ', o);
                if (o.user_metadata) {
                    angular.extend(UserSettings, o.user_metadata);
                    console.log('User Settings restored: ', o.user_metadata);
                    console.log('UserSettings: ', UserSettings);
                } else {
                    // we don't have user_metadata, so create them
                    console.log('we don\'t have user_metadata, so create them...');
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
            }).catch(function (err) {
                console.log('Unable to restore settings: ', err);
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'Could not restore your settings'
                });
            });

        }

        //deserializeSettings();

        //API
        return {
            serializeSettings: serializeSettings,
            deserializeSettings: deserializeSettings
        };


    }])
    .service('ArticleModalService', ['$ionicModal', '$rootScope', '$sanitize', '$cordovaSocialSharing', 'UserSettings', 'UserStorageService',
        function ($ionicModal, $rootScope, $sanitize, $cordovaSocialSharing, UserSettings, UserStorageService) {
            'use strict';

            var _scope = null;

            // Social Sharing
            // -------------------------------------
            function _shareNative(message, subject, image, url) {
                function htmlToPlaintext(text) {
                    return text ? String(text).replace(/<[^>]+>/gm, '') : '';
                }

                if (message) {
                    message = htmlToPlaintext($sanitize(message));
                } else {
                    message = 'I am using QuarkyApp, maybe you should too :)';
                }
                if (subject) {
                    subject = htmlToPlaintext($sanitize(subject));
                } else {
                    subject = 'Found this on Quarky App!';
                }
                if (!image) {
                    image = 'https://quarkyapp.com/wp-content/uploads/2015/06/quarkycon1.jpg';
                }

                if (!url) {
                    url = 'https://quarkyapp.com';
                }

                console.log('shareNative, message: ', message, ' subject: ', subject, ' image: ', image, ' url: ', url);
                if (ionic.Platform.isWebView()) {
                    // Google Analytics
                    if (typeof analytics !== 'undefined') {
                        analytics.trackEvent('Article', 'Share', subject, 100);
                        console.log('GA tracking Article Share event: ', subject);
                    }
                    $cordovaSocialSharing.share(message, subject, image, url);
                }
            }

            function _checkBookmark(id) {
                var keys;
                try {
                    keys = Object.keys(_scope.bookmarks);
                } catch (e) {
                    keys = [];
                }
                console.log('bookmark keys: ', keys);
                var index = keys.indexOf(id);
                if (index >= 0) {
                    return true;
                } else {
                    return false;
                }
            }

            function _changeSetting(type, value) {
                _scope[type] = value;
                UserSettings[type] = value;
                UserStorageService.serializeSettings();
            }

            function _bookmarkItem(id) {
                var change;
                if (_scope.bookmarked) {
                    change = _scope.bookmarks;
                    delete change[id];
                    _changeSetting('bookmarks', change);
                    _scope.bookmarked = false;
                } else {
                    change = _scope.bookmarks;
                    change[id] = 'bookmarked';
                    _changeSetting('bookmarks', change);
                    _scope.bookmarked = true;
                    // Google Analytics
                    if (typeof analytics !== 'undefined') {
                        analytics.trackEvent('Article', 'Bookmark', id.toString(), 50);
                        console.log('GA tracking Article Bookmark event for: ', id.toString());
                    }
                }
            }

            var init = function ($scope) {

                var promise;
                var tpl = 'templates/article-modal.html';
                $scope = $scope || $rootScope.$new();
                _scope = $scope;

                promise = $ionicModal.fromTemplateUrl(tpl, {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.modal = modal;
                    $scope.shareNative = _shareNative;
                    $scope.bookmarks = UserSettings.bookmarks;
                    $scope.checkBookmark = _checkBookmark;
                    $scope.changeSetting = _changeSetting;
                    $scope.bookmarkItem = _bookmarkItem;
                    if ($scope.aPost) {
                        $scope.bookmarked = _checkBookmark($scope.aPost.ID.toString());
                    }
                    return modal;
                });

                $scope.openModal = function () {
                    $scope.modal.show();
                };
                $scope.closeModal = function () {
                    $scope.modal.hide();
                };
                $scope.$on('$destroy', function () {
                    $scope.modal.remove();
                });

                return promise;
            };

            return {
                init: init
            };
        }])
    .run(['$ionicPlatform', 'auth', 'UserSettings', 'UserStorageService', '$rootScope', 'store', '$state', '$ionicPopup', '$window', 'jwtHelper', '$location', '$ionicLoading', 'PushWoosh',
        function ($ionicPlatform, auth, UserSettings, UserStorageService, $rootScope, store, $state, $ionicPopup, $window, jwtHelper, $location, $ionicLoading, PushWoosh) {
            'use strict';

            console.log('.run auth is: ', auth);

            $ionicPlatform.ready(function () {
                console.log('Device Ready for Quarky');
                /*ionic.Platform.isFullScreen ? console.log("quarky is fullscreen") : console.log("quarky is NOT fullscreen");
                 ionic.Platform.isIOS() ? console.log("quarky is iOS") : console.log("quarky is NOT iOS");
                 ionic.Platform.isAndroid() ? console.log("quarky is Android") : console.log("quarky is NOT Android");
                 ionic.Platform.isWebView() ? console.log("quarky is Cordova") : console.log("quarky is NOT Cordova");*/
                // Google Analytics
                if (typeof analytics !== 'undefined') {
                    analytics.startTrackerWithId('UA-57113932-2');
                    //set initial view once
                    if (auth.isAuthenticated) {
                        analytics.trackView('app.home-list');
                        console.log('GA tracking view: app.home-list');
                    } else {
                        analytics.trackView('login');
                        console.log('GA tracking view: login');
                    }
                    analytics.enableUncaughtExceptionReporting(true, function (s) {
                        console.log(s);
                    }, function (e) {
                        console.error(e);
                    });
                } else {
                    console.log('Google Analytics Unavailable');
                }
                // track view changes in google analytics
                $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                    if (typeof analytics !== 'undefined') {
                        analytics.trackView(toState.name);
                        console.log('GA tracking view: ', toState.name);
                    } else {
                        console.log('GA tracking view\'s not enabled');
                    }
                });
                // Cordova keyboard, statusbar and inappbrowser
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
                // Initialize PushWoosh Plugin
                if (window.cordova) {
                    PushWoosh.init('64DE6-A4DB5', '586634803974')  // pushwoosh ID, google GCM project ID
                        .then(function () {
                            // Register Device to get device token
                            PushWoosh.registerDevice().then(function (deviceToken) {
                                console.log('PushWoosh registerDevice token: ', deviceToken);
                                if (auth.isAuthenticated) {
                                    return PushWoosh.setTags({
                                        name: auth.profile.name,
                                        user_id: auth.profile.user_id,
                                        gender: UserSettings.gender || '',
                                        birthday: new Date(UserSettings.birthday) || 0
                                    });
                                }
                            }, function (err) {
                                console.log('PushWoosh registerDevice error: ', err);  // PushWoosh error
                            });
                        }, function (err) {
                            console.log('PushWoosh init error:', err);
                        });
                }
            });

            // Listen for push notification events
            $rootScope.$on('event:push-notification', function (event, notification) {
                console.log('event:push-notification: ', notification);
                $ionicPopup.alert({
                    title: 'Push Message',
                    template: notification.title
                });
                if (typeof analytics !== 'undefined') {
                    analytics.trackEvent('Push', 'Received', notification.title, 35);
                    console.log('GA tracking Push Notification: ', notification.title);
                }
                PushWoosh.setApplicationIconBadgeNumber(0);
            });

            //-------------- global http loading
            $rootScope.$on('loading:show', function () {
                $ionicLoading.show({template: 'Loading...'});
            });
            $rootScope.$on('loading:hide', function () {
                $ionicLoading.hide();
            });
            $rootScope.$on('loading:offline', function () {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'No network',
                    template: 'You seem to be offline...'
                });
            });

            //-------------- auth0

            // This hooks all auth events to check everything as soon as the app starts
            auth.hookEvents();

            $rootScope.$on('auth0.authenticated', function() {
                // Store user or do something
                //console.log('auth0.authenticated, auth is:', auth);
                UserStorageService.deserializeSettings();
            });


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
                            $state.go('login');
                            //$location.path('/login');// Notice: this url must be the one defined
                        }                            // in your login state. Refer to step 5.
                    }
                }
            });

        }])
    .config(['$stateProvider', '$urlRouterProvider', 'ionicDatePickerProvider', 'LoopBackResourceProvider', 'authProvider', '$httpProvider', 'jwtInterceptorProvider',
        function ($stateProvider, $urlRouterProvider, ionicDatePickerProvider, LoopBackResourceProvider, authProvider, $httpProvider, jwtInterceptorProvider) {
            'use strict';
            var datePickerObj = {
                inputDate: new Date(),
                setLabel: 'Set',
                todayLabel: 'Today',
                closeLabel: 'Close',
                mondayFirst: false,
                weeksList: [
                    'S',
                    'M',
                    'T',
                    'W',
                    'T',
                    'F',
                    'S'
                ],
                monthsList: [
                    'Jan',
                    'Feb',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'Aug',
                    'Sept',
                    'Oct',
                    'Nov',
                    'Dec'
                ],
                templateType: 'popup',
                showTodayButton: true,
                dateFormat: 'dd MMMM yyyy',
                closeOnSelect: false
            };
            ionicDatePickerProvider.configDatePicker(datePickerObj);
            LoopBackResourceProvider.setUrlBase('https://q-api.mybluemix.net/api');
            //        LoopBackResourceProvider.setUrlBase('http://localhost:6001/api');
            $stateProvider.state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'templates/menu.html',
                controller: 'MenuCtrl'
            }).state('app.profile', {
                url: '/profile',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/profile.html',
                        controller: 'ProfileCtrl'
                    }
                },
                data: {
                    // This tells Auth0 that this state requires the user to be logged in.
                    // If the user isn't logged in and he tries to access this state
                    // he'll be redirected to the login page
                    requiresLogin: true
                }
            }).state('app.bookmarks', {
                url: '/bookmarks',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/bookmarks.html',
                        controller: 'BookmarksCtrl'
                    }
                },
                data: {
                    // This tells Auth0 that this state requires the user to be logged in.
                    // If the user isn't logged in and he tries to access this state
                    // he'll be redirected to the login page
                    requiresLogin: true
                }
            }).state('app.guru', {
                url: '/guru',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/guru-nav.html',
                        controller: 'GuruCtrl'
                    }
                },
                data: {
                    // This tells Auth0 that this state requires the user to be logged in.
                    // If the user isn't logged in and he tries to access this state
                    // he'll be redirected to the login page
                    requiresLogin: true
                }
            }).state('app.guru-list', {
                url: '/guru/list/:id',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/guru-list.html',
                        controller: 'GuruListCtrl'
                    }
                }
            }).state('app.guru-detail', {
                url: '/guru/detail/:id',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/guru-detail.html',
                        controller: 'GuruDetailCtrl'
                    }
                },
                data: {
                    // This tells Auth0 that this state requires the user to be logged in.
                    // If the user isn't logged in and he tries to access this state
                    // he'll be redirected to the login page
                    requiresLogin: false
                }
            }).state('app.home-list', {
                url: '/home-list',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/home-list.html',
                        controller: 'HomeListCtrl'
                    }
                },
                data: {requiresLogin: true}
            }).state('app.about-master', {
                url: '/about-master',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/about-master.html',
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
            }).state('app.about-list', {
                url: '/about-list/:postId',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/about-list.html',
                        controller: 'AboutListCtrl'
                    }
                },
                resolve: {
                    post: function ($stateParams, AboutService2) {
                        return AboutService2.getPost($stateParams.postId);
                    }
                }
            }).state('app.places-master', {
                url: '/places-master',
                cache: false,
                views: {
                    'menuContent': {
                        templateUrl: 'templates/places-master.html',
                        controller: 'PlacesMasterCtrl'
                    }
                },
                data: {
                    // This tells Auth0 that this state requires the user to be logged in.
                    // If the user isn't logged in and he tries to access this state
                    // he'll be redirected to the login page
                    requiresLogin: true
                }
            }).state('app.places-articles', {
                url: '/places-articles',
                cache: false,
                params: {searchParams: null},
                views: {
                    'menuContent': {
                        templateUrl: 'templates/places-articles.html',
                        controller: 'PlacesArticlesCtrl'
                    }
                },
                data: {
                    // This tells Auth0 that this state requires the user to be logged in.
                    // If the user isn't logged in and he tries to access this state
                    // he'll be redirected to the login page
                    requiresLogin: false
                }
            }).state('app.places-gallery', {
                url: '/places/gallery',
                cache: false,
                params: {galleryParams: null},
                views: {
                    'menuContent': {
                        templateUrl: 'templates/places-gallery.html',
                        controller: 'PlacesGalleryCtrl'
                    }
                }
            }).state('app.place-detail', {
                cache: false,
                url: '/place-detail/:placeId',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/place-detail.html',
                        controller: 'PlacesDetailCtrl'
                    }
                }
            }).state('login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl'
            });
            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/app/home-list');

            //-------------- auth0
            authProvider.init({
                domain: 'quarky.auth0.com',
                clientID: 'DoMMtmruuSqicU4qjeyvZTXEB0TImsqy',
                loginState: 'login' // This is the name of the state where you'll show the login, which is defined above...
            });

            var refreshingToken = null;
            jwtInterceptorProvider.tokenGetter = ['store', 'jwtHelper', 'auth', function (store, jwtHelper, auth) {
                var idToken = store.get('token');
                var refreshToken = store.get('refreshToken');
                if (!idToken || !refreshToken) {
                    return null;
                }

                if (jwtHelper.isTokenExpired(idToken)) {

                    if (refreshToken) {
                        if (refreshingToken === null) { // avoid hitting rate limit
                            refreshingToken = auth.refreshIdToken(refreshToken).then(function (idToken) {
                                store.set('token', idToken);
                                return idToken;
                            }).finally(function () {
                                refreshingToken = null;
                            });
                        }
                        return refreshingToken;
                    } else {
                        return null; // for some reason the token expired and there's no refreshToken
                    }
                } else {
                    return idToken; // token not expired yet
                }

            }];

            $httpProvider.interceptors.push('jwtInterceptor');


            //-------------- global http loading
            $httpProvider.interceptors.push(['$rootScope', '$q', function ($rootScope, $q) {
                var handleError = function (response) {
                    console.log('$resource Error: ', response);
                    var status = response.status;
                    if (status >= 500 && status < 600) {
                        $rootScope.$broadcast('loading:offline');
                        return response;
                    }
                    if (status <= 0) {
                        $rootScope.$broadcast('loading:offline');
                        return response;
                    }
                    $rootScope.$broadcast('loading:hide');
                    return response;
                };
                return {
                    request: function (config) {
                        $rootScope.$broadcast('loading:show');
                        return config;
                    },
                    response: function (response) {
                        $rootScope.$broadcast('loading:hide');
                        return response;
                    },
                    responseError: function (response) {
                        return $q.reject(handleError(response));
                    },
                    requestError: function (response) {
                        return $q.reject(handleError(response));
                    }
                };
            }]);
        }]);