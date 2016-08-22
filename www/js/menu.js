angular.module('menu', ['auth0'])
    .controller('MenuCtrl', ['$ionicPopup', '$cordovaSms', '$cordovaSocialSharing', 'store', '$scope', '$location', '$state', 'auth', '$ionicActionSheet', '$ionicHistory', '$timeout',
        function ($ionicPopup, $cordovaSms, $cordovaSocialSharing, store, $scope, $location, $state, auth, $ionicActionSheet, $ionicHistory, $timeout) {
            'use strict';
            $scope.auth = auth;
            $scope.showHotlineActionsheet = function () {
                $ionicActionSheet.show({
                    titleText: 'Help Now',
                    buttons: [
                        {text: 'National Suicide Hotline'},
                        {text: 'National Runaway Safeline'},
                        {text: 'Crisis Intervention & Counseling'},
                        {text: 'Crisis Text Line'},
                        {text: 'KC Youth Crisis'},
                        {text: 'Report Bullying or Threat'}
                    ],
                    destructiveText: '911',
                    destructiveButtonClicked: function () {
                        window.open('tel:911', '_system');
                        return true;
                    },
                    //destructiveText: 'Delete',
                    cancelText: 'Cancel',
                    cancel: function () {
                    },
                    buttonClicked: function (index) {

                        if (index === 0) {
                            window.open('tel:1-800-273-8255', '_system'); // National Suicide Hotline
                        }
                        if (index === 1) {
                            window.open('tel:1-800-786-2929', '_system'); // National Runaway Safeline
                        }
                        if (index === 2) {
                            window.open('tel:1-800-999-9999', '_system'); // Crisis Intervention & Counseling Nineline
                        }
                        if (index === 3) {
                            if (ionic.Platform.isWebView()) { // we're on cordova

                                //CONFIGURATION
                                var options = {
                                    replaceLineBreaks: false, // true to replace \n by a new line, false by default
                                    android: {
                                        intent: 'INTENT'  // send SMS with the native android SMS messaging
                                        //intent: '' // send SMS without open any other app
                                    }
                                };

                                $cordovaSms
                                    .send('741741', 'START', options)
                                    .then(function () {
                                        //
                                        console.log('Success! SMS was sent');
                                    }, function (error) {
                                        console.log('error $cordovaSms.send: ', error);
                                        $ionicPopup.alert({
                                            title: 'SMS',
                                            template: 'Can not send SMS. Error: ' + error
                                        });
                                    });
                                /*     $cordovaSocialSharing
                                 .canShareVia('sms', '741741', null, null)
                                 .then(function(result) {
                                 console.log('success canShareVia: ', result);
                                 $cordovaSocialSharing
                                 .shareViaSMS('START', '741741')
                                 .then(function(result) {
                                 console.log('success shareViaSMS: ', result);
                                 }, function(err) {
                                 console.log('error shareViaSMS: ', err);
                                 $ionicPopup.alert({
                                 title: 'SMS',
                                 template: 'Can not send SMS to Crisis Text Line, try again. Error: '+err
                                 });
                                 });
                                 }, function(err) {
                                 $ionicPopup.alert({
                                 title: 'SMS not found',
                                 template: 'Quarky unable to find SMS app on your device.'
                                 });
                                 console.log('error canShareVia: ', err);
                                 }); */

                                 } else {
                                 $ionicPopup.alert({
                                 title: 'Crisis Text Line',
                                 template: 'You must be on a real phone or tablet'
                                 });
                                 }
                        }
                        if (index === 4) {
                            window.open('tel:1-888-233-1639', '_system');   // KC Youth Crisis
                        }
                        if (index === 5) {
                            window.open('http://report.sprigeo.com', '_system');    // report bullying
                        }
                        return true;
                    }
                });
            };
            $scope.goPlaces = function() {
                console.log('goPlaces viewHistory: ', $ionicHistory.viewHistory());
                $ionicHistory.nextViewOptions({
                    disableAnimate: true,
                    disableBack: true,
                    historyRoot: true
                });
                $state.go('app.places-master');
                // $timeout(function() { $state.go('app.places-master'); });
            };
        }])
    .controller('LoginCtrl', ['$scope', 'auth', '$state', 'store', 'UserSettings', 'PushWoosh', '$ionicHistory', '$ionicSlideBoxDelegate',
        function ($scope, auth, $state, store, UserSettings, PushWoosh, $ionicHistory, $ionicSlideBoxDelegate) {
            'use strict';
            var currentPlatform = 'Mobile';
            var currentPlatformVersion = 'Device';
            ionic.Platform.ready(function () {
                currentPlatform = ionic.Platform.platform();
                currentPlatformVersion = ionic.Platform.version();
            });
            $scope.next = function () {
                $ionicSlideBoxDelegate.next();
            };
            $scope.previous = function () {
                $ionicSlideBoxDelegate.previous();
            };
            // Called each time the slide changes
            $scope.slideChanged = function (index) {
                $scope.slideIndex = index;
            };
            $scope.doAuth = function () {
                auth.signin({
                    sso: false,
                    focusInput: false,
                    closable: true,
                    icon: 'img/quarkycon.png',
                    //socialBigButtons: true,
                    primaryColor: '#000000',
                    authParams: {
                        scope: 'openid offline_access',
                        device: currentPlatform + ' ' + currentPlatformVersion
                    }
                }, function (profile, token, accessToken, state, refreshToken) {
                    store.set('profile', profile);
                    store.set('token', token);
                    store.set('accessToken', accessToken);
                    store.set('refreshToken', refreshToken);
                    // put auth'd user settings into UserSettings
                    angular.extend(UserSettings, profile.user_metadata);
                    console.log('doAuth - UserSettings: ', UserSettings);
                    // Google Analytics
                    if (typeof analytics !== 'undefined') {
                        console.log('Google Analytics user-id: ', auth.profile.user_id);
                        analytics.setUserId(auth.profile.user_id);
                    }
                    PushWoosh.setTags({
                        name: auth.profile.name,
                        user_id: auth.profile.user_id,
                        gender: UserSettings.gender || '',
                        birthday: new Date(UserSettings.birthday) || 0
                    });
                    $state.go('app.home-list');
                }, function (err) {
                    // Error callback
                    console.log('doAuth: ', err);
                    $ionicHistory.nextViewOptions({
                        disableAnimate: true,
                        disableBack: true
                    });
                    $state.go('login');
                });
            };
            $scope.logout = function () {
                auth.signout();

                store.remove('profile');
                store.remove('token');
                store.remove('accessToken');
                store.remove('refreshToken');

                $ionicHistory.nextViewOptions({
                    disableAnimate: true,
                    disableBack: true
                });
                $state.go('login');
            };
            $scope.$on('$ionic.reconnectScope', function () {
                if (!auth.isAuthenticated) {
                    $ionicHistory.nextViewOptions({
                        disableAnimate: true,
                        disableBack: true
                    });
                    $state.go('login');
                }
            });
        }]);