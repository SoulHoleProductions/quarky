angular.module('menu', ['auth0'])
    .controller('MenuCtrl', ['store', '$scope', '$location', '$state', 'auth', '$ionicActionSheet',
        function (store, $scope, $location, $state, auth, $ionicActionSheet) {
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
                        //console.log('BUTTON CLICKED', index);
                        if (index === 0) {
                            window.open('tel:1-800-273-8255', '_system');
                        }
                        // National Suicide Hotline
                        if (index === 1) {
                            window.open('tel:1-800-786-2929', '_system');
                        }
                        // National Runaway Safeline
                        if (index === 2) {
                            window.open('tel:1-800-999-9999', '_system');
                        }
                        // Crisis Intervention & Counseling Nineline
                        if (index === 3) {
                            window.open('sms:741741');
                        }
                        // crisis text line
                        if (index === 4) {
                            window.open('tel:1-888-233-1639', '_system');
                        }
                        // KC Youth Crisis
                        if (index === 5) {
                            window.open('https://report.sprigeo.com', '_system');
                        }
                        // bullying
                        return true;
                    }
                });
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