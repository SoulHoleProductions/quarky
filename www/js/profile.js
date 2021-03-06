angular.module('profile', [
        'ionic-datepicker',
        'ngResource',
        'ngCordova',
    'quarky'
    ])
    .controller('BookmarksCtrl', ['$scope', 'UserSettings', 'UserStorageService', '$sanitize', 'wordpressAPI', '$ionicModal', '$sce', '$cordovaSocialSharing', 'ArticleModalService',
        function ($scope, UserSettings, UserStorageService, $sanitize, wordpressAPI, $ionicModal, $sce, $cordovaSocialSharing, ArticleModalService) {
            'use strict';
            ionic.Platform.ready(function () {
            });


            function updateView() {
                var bookmarkCacheKeys;
                $scope.bookmarks = UserSettings.bookmarks;
                try {
                    bookmarkCacheKeys = Object.keys($scope.bookmarks);
                } catch (e) {
                    bookmarkCacheKeys = [];
                }
                $scope.hasBookmarks = bookmarkCacheKeys.length > 0 ? true : false;
                $scope.posts = [];
                angular.forEach(bookmarkCacheKeys, function (value, key) {
                    //return wordpressAPI.getPost({'ID': value}).$promise.then(function (result) {
                    //    $scope.posts.push(result);
                    //    return result;
                    wordpressAPI.getPost({'ID': value}).$promise.then(function (result) {
                        return $scope.posts.push(result);
                    }).catch(function (err) {
                        console.log('error getting bookmark: ', err);
                        return err;  // remove the bookmark TODO: test err to get the right value
                        /*
                         var change = $scope.bookmarks;
                         delete change[err];
                         changeSetting('bookmarks', change);
                         */
                    });
                });
            }

            $scope.toTrusted = function (text) {
                return $sce.trustAsHtml(text);
            };
            $scope.$on('$ionicView.enter', function (e) {
                updateView();
            });

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

    .controller('ProfileCtrl', ['$scope', '$rootScope', '$ionicPlatform', 'auth', '$window', 'store', '$ionicLoading',
        '$ionicPopup', '$state', '$ionicHistory', 'wordpressAPIv2', 'ionicDatePicker',
        '$http', 'UserSettings', 'UserStorageService',
        function ($scope, $rootScope, $ionicPlatform, auth, $window, store, $ionicLoading,
                  $ionicPopup, $state, $ionicHistory, wordpressAPIv2, ionicDatePicker,
                  $http, UserSettings, UserStorageService) {
            'use strict';
            $scope.auth = auth;
            $scope.posts = [];
            $scope.lastPush = store.get('lastPush') || '{}';

            $scope.launch = function (url) {
                window.open(url, '_system', 'location=yes');
            };
            /*
             * WP-API v2
             */
            $scope.WPgetUser = function (anID) {
                wordpressAPIv2.getUser({id: anID}).$promise.then(function (result) {
                    var txt = '';
                    for (var x in result) {
                        txt += result[x];
                    }
                    console.log('success -> getUser: ', result, txt);
                }).catch(function (err) {
                    var status = err.status;
                    var message = err.statusText;
                    var alertTitle = 'Error: ' + err.status;
                    if (status >= 400 && status < 500) {
                        alertTitle = 'Client Error';
                    }
                    if (status >= 500 && status < 600) {
                        alertTitle = 'Server Error';
                    }
                    var alertPopup = $ionicPopup.alert({
                        title: alertTitle,
                        template: message
                    });
                    alertPopup.then(function (res) {
                        console.log('error: ', err);
                    });
                });
            };
            $scope.WPgetMe = function () {
                wordpressAPIv2.getMe().$promise.then(function (result) {
                    var txt = '';
                    for (var x in result) {
                        txt += result[x];
                    }
                    console.log('success -> getMe: ', result.body, txt);
                }).catch(function (err) {
                    var status = err.status;
                    var message = err.statusText;
                    var alertTitle = 'Error: ' + err.status;
                    if (status >= 400 && status < 500) {
                        alertTitle = 'Client Error';
                    }
                    if (status >= 500 && status < 600) {
                        alertTitle = 'Server Error';
                    }
                    var alertPopup = $ionicPopup.alert({
                        title: alertTitle,
                        template: message
                    });
                    alertPopup.then(function (res) {
                        console.log('error: ', err);
                    });
                });
            };
            $scope.WPcreatePost = function () {
                wordpressAPIv2.createPost({title: 'This is a test post'}).$promise.then(function (result) {
                    var txt = '';
                    for (var x in result) {
                        txt += result[x];
                    }
                    console.log('success -> createPost: ', result, txt);
                }).catch(function (err) {
                    var status = err.status;
                    var message = err.statusText;
                    var alertTitle = 'Error: ' + err.status;
                    if (status >= 400 && status < 500) {
                        alertTitle = 'Client Error';
                    }
                    if (status >= 500 && status < 600) {
                        alertTitle = 'Server Error';
                    }
                    var alertPopup = $ionicPopup.alert({
                        title: alertTitle,
                        template: message
                    });
                    alertPopup.then(function (res) {
                        console.log('error: ', err);
                    });
                });
            };
            $scope.WPtestComments = function () {
                wordpressAPIv2.testComment({
                    content: 'This is a test comment' + Math.random().toString(36).substring(7),
                    post: 2508
                }).$promise.then(function (result) {
                    console.log('success -> testComment: ', result, JSON.stringify(result));
                }).catch(function (err) {
                    var status = err.status;
                    var message = err.statusText;
                    var alertTitle = 'Error: ' + err.status;
                    if (status >= 400 && status < 500) {
                        alertTitle = 'Client Error';
                    }
                    if (status >= 500 && status < 600) {
                        alertTitle = 'Server Error';
                    }
                    var alertPopup = $ionicPopup.alert({
                        title: alertTitle,
                        template: message
                    });
                    alertPopup.then(function (res) {
                        console.log('error: ', err);
                    });
                });
            };
            /**/
            //console.log('ProfileCtrl: UserSettings: ', UserSettings);
            // when a widget is changed, come here an update the setting object too
            function changeSetting(type, value) {
                $scope[type] = value;
                UserSettings[type] = value;
                UserStorageService.serializeSettings();
            }

            // BIRTHDAY
            var ipObj1 = {
                callback: function (val) {
                    //Mandatory
                    console.log('Return value from the datepicker popup is : ' + val, new Date(val));
                    if (typeof val === 'undefined') {
                        console.log('No date selected');
                    } else {
                        console.log('Selected date is : ', val);
                        this.inputDate = val;
                        changeSetting('birthday', val);
                    }
                },
                mondayFirst: true,
                //Optional
                closeOnSelect: false,
                //Optional
                templateType: 'popup'  //Optional
            };
            $scope.openDatePicker = function () {
                ionicDatePicker.openDatePicker(ipObj1);
            };
            $scope.birthday = UserSettings.birthday;
            ipObj1.inputDate = new Date(UserSettings.birthday);
            // GENDER
            $scope.gender = UserSettings.gender;
            $scope.setGender = function () {
                // An elaborate, custom popup
                var myPopup = $ionicPopup.show({
                    template: '<ion-radio ng-model="$parent.gender" ng-value="\'male\'">Male</ion-radio>' + '<ion-radio ng-model="$parent.gender" ng-value="\'female\'">Female</ion-radio>',
                    title: 'Select your Gender',
                    subTitle: 'male or female',
                    scope: $scope,
                    buttons: [
                        {text: 'Cancel'},
                        {
                            text: '<b>Save</b>',
                            type: 'button-positive',
                            onTap: function (e) {
                                console.log('onTap', $scope.gender);
                                return $scope.gender;
                            }
                        }
                    ]
                });
                myPopup.then(function (res) {
                    console.log('Tapped!', res);
                    changeSetting('gender', res);
                });
            };
            // VOLUNTEER - want_add_places
            $scope.want_add_places = UserSettings.want_add_places;
            $scope.setVolForPlaces = function () {
                var myPopup = $ionicPopup.show({
                    template: '<ion-radio ng-model="$parent.want_add_places" ng-value="false" >No Thanks</ion-radio>' + '<ion-radio ng-model="$parent.want_add_places" ng-value="true" >Yes - I want to help</ion-radio>',
                    title: 'Help us add places',
                    subTitle: 'Register to Volunteer',
                    scope: $scope,
                    buttons: [
                        {text: 'Cancel'},
                        {
                            text: '<b>Save</b>',
                            type: 'button-positive',
                            onTap: function (e) {
                                return $scope.want_add_places;
                            }
                        }
                    ]
                });
                myPopup.then(function (res) {
                    console.log('Tapped!', res);
                    changeSetting('want_add_places', res);
                });
            };
            ionic.Platform.ready(function () {
                $scope.currentPlatform = 'unknown';
                $scope.currentPlatformVersion = ionic.Platform.version();
                if (ionic.Platform.isIPad()) {
                    $scope.currentPlatform = 'iPad';
                }
                if (ionic.Platform.isIOS()) {
                    $scope.currentPlatform = 'iOS';
                }
                if (ionic.Platform.isAndroid()) {
                    $scope.currentPlatform = 'Android';
                }
                if (ionic.Platform.isWindowsPhone()) {
                    $scope.currentPlatform = 'Windows Phone';
                }
            });
            $scope.logout = function () {
                auth.signout();
                store.remove('profile');
                store.remove('token');
                store.remove('refreshToken');
                $ionicHistory.nextViewOptions({
                    disableAnimate: true,
                    disableBack: true
                });
                $state.go('login');
            };
        }]);