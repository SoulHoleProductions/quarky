angular.module('profile', ['ionic-datepicker', 'ngResource', 'ngCordova'])

    .controller('BookmarksCtrl', function ($scope, UserSettings, UserStorageService, $sanitize,
                                           wordpressAPI, $ionicModal, $sce, $cordovaSocialSharing) {

        // when a widget is changed, come here an update the setting object too
        function changeSetting(type, value) {
            $scope[type] = value;
            UserSettings[type] = value;
            UserStorageService.serializeSettings();
        };

        function updateView() {

            var bookmarkCacheKeys;
            $scope.bookmarks = UserSettings.bookmarks;

            try {
                bookmarkCacheKeys = Object.keys($scope.bookmarks);
            } catch(e) {
                bookmarkCacheKeys = [];
            }

            $scope.hasBookmarks = bookmarkCacheKeys.length > 0 ? true : false;

            $scope.posts = [];

            angular.forEach(bookmarkCacheKeys, function (value, key) {
                wordpressAPI.getPost({
                        "ID": value
                    })
                    .$promise
                    .then(function (result) {
                        $scope.posts.push(result);
                    })
                    .catch(function (err) {
                        console.log("error getting bookmark: ", err);
                        // remove the bookmark TODO: test err to get the right value
                        /*
                        var change = $scope.bookmarks;
                        delete change[err];
                        changeSetting('bookmarks', change);
                        */
                    })

            });

        }

        $scope.toTrusted = function (text) {
            return ($sce.trustAsHtml(text));
        }

        $scope.$on('$ionicView.enter', function (e) {
            updateView();
        });

        // Social Sharing
        // -------------------------------------
        $scope.shareNative = function (message, subject, image, url) {
            function htmlToPlaintext(text) {
                return text ? String(text).replace(/<[^>]+>/gm, '') : '';
            }

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

        // Bookmarking
        $scope.bookmarks = UserSettings.bookmarks;
        function checkBookmark(id) {
            var keys;
            try {
                keys = Object.keys($scope.bookmarks);
            } catch(e) {
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
        function changeSetting(type, value) {
            $scope[type] = value;
            UserSettings[type] = value;
            UserStorageService.serializeSettings();
        };
        $scope.bookmarkItem = function (id) {
            if ($scope.bookmarked) {
                var change = $scope.bookmarks;
                delete change[id];
                changeSetting('bookmarks', change);
                $scope.bookmarked = false;
            } else {
                var change = $scope.bookmarks;
                change[id] = "bookmarked";
                changeSetting('bookmarks', change);
                $scope.bookmarked = true;
            }
        };

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
            $scope.bookmarked = checkBookmark(aPost.ID.toString());
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
            updateView();
        });

        // ----------------- modal


    })
    .controller('ProfileCtrl', function ($scope, $rootScope, $ionicPlatform, auth,
                                         store, $ionicLoading, $ionicPopup, $state, $ionicHistory,
                                         UserSettings, UserStorageService) {

        $scope.auth = auth;
        $scope.posts = [];

        $scope.launch = function(url) {
            window.open(url, '_system', 'location=yes');
        }

        console.log('ProfileCtrl: UserSettings: ',UserSettings);

        // when a widget is changed, come here an update the setting object too
        function changeSetting(type, value) {
            $scope[type] = value;
            UserSettings[type] = value;
            UserStorageService.serializeSettings();
        };

        // BIRTHDAY
        $scope.datepickerObject = {
            titleLabel: 'Birthday',  //Optional
            todayLabel: 'Today',  //Optional
            closeLabel: 'Close',  //Optional
            setLabel: 'Set',  //Optional
            setButtonType: 'button-balanced',  //Optional
            todayButtonType: 'button-stable',  //Optional
            closeButtonType: 'button-assertive',  //Optional
            mondayFirst: true,    //Optional
            templateType: 'popup', //Optional
            showTodayButton: 'true', //Optional
            modalHeaderColor: 'bar-dark', //Optional
            modalFooterColor: 'bar-dark', //Optional
            from: new Date(1950, 1, 1),   //Optional
            to: new Date(),    //Optional
            callback: function (val) {    //Mandatory
                datePickerCallback(val);
            }
        };
        var datePickerCallback = function (val) {
            if (typeof(val) === 'undefined') {
                console.log('No date selected');
            } else {
                console.log('Selected date is : ', val);
                $scope.datepickerObject.inputDate = val;
                changeSetting('birthday', val);
            }
        };
        $scope.birthday = UserSettings.birthday;
        $scope.datepickerObject.inputDate = new Date(UserSettings.birthday);

        // GENDER
        $scope.gender = UserSettings.gender;
        $scope.setGender = function () {
            // An elaborate, custom popup
            var myPopup = $ionicPopup.show({
                template: '<ion-radio ng-model="$parent.gender" ng-value="\'male\'">Male</ion-radio>' +
                '<ion-radio ng-model="$parent.gender" ng-value="\'female\'">Female</ion-radio>',
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
                template: '<ion-radio ng-model="$parent.want_add_places" ng-value="false" >No Thanks</ion-radio>' +
                '<ion-radio ng-model="$parent.want_add_places" ng-value="true" >Yes - I want to help</ion-radio>',
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
            $scope.currentPlatform = "unknown";
            $scope.currentPlatformVersion = ionic.Platform.version();
            if (ionic.Platform.isIPad())
                $scope.currentPlatform = "iPad";
            if (ionic.Platform.isIOS())
                $scope.currentPlatform = "iOS";
            if (ionic.Platform.isAndroid())
                $scope.currentPlatform = "Android";
            if (ionic.Platform.isWindowsPhone())
                $scope.currentPlatform = "Windows Phone";
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
    });

