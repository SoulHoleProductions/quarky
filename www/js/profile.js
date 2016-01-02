angular.module('profile', ['ionic-datepicker', 'ngResource'])

    .controller('BookmarksCtrl', function ($scope, Bookmark,
                                           wordpressAPI, CacheFactory, $ionicModal) {

        function updateView() {
            if (!CacheFactory.get('bookmarkCache')) {
                CacheFactory.createCache('bookmarkCache');
            }

            var bookmarkCacheKeys = CacheFactory.get('bookmarkCache').keys();

            $scope.hasBookmarks = bookmarkCacheKeys.length > 0 ? true : false;

            $scope.posts = [];

            angular.forEach(bookmarkCacheKeys, function (value, key) {
                wordpressAPI.getPost({
                        "ID": value
                    })
                    .$promise
                    .then(function (result) {
                        console.log("cachekey value: ", value, ' newPost: ', result);
                        $scope.posts.push(result);
                    })
                    .catch(function (err) {
                        console.log("error getting bookmark: ", err);
                        Bookmark.remove(value);
                    })

            });

        }

        $scope.$on('$ionicView.enter', function (e) {
            updateView();
        });


        // --------------- modal from the given template URL
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
            $scope.bookmarked = Bookmark.check(aPost.ID.toString());
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

        // Bookmarking
        $scope.bookmarkItem = function (id) {
            if ($scope.bookmarked) {
                Bookmark.remove(id);
                $scope.bookmarked = false;
            } else {
                Bookmark.set(id);
                $scope.bookmarked = true;
            }
        };

        // ----------------- modal

    })
    .controller('ProfileCtrl', function ($scope, $rootScope, $ionicPlatform, auth,
                                         store, $ionicLoading, $ionicPopup, $state, $ionicHistory,
                                         auth0metadata, wordpressAPIv2) {

        $scope.auth = auth;
        $scope.posts = [];


        /*       // ADD ARTICLE
         $scope.addArticle = function () {

         $ionicLoading.show({template: 'Adding...'});
         wordpressAPI.getMe().$promise
         .then(function (resp) {
         console.log('WP USER IS: ', JSON.stringify(resp));
         return wordpressAPI.createPost({
         "title": "Hello World!",
         "content_raw": "Derek's Content",
         "status": "publish",
         //"author": resp.id,
         "category_name": "derektest"
         })
         .$promise
         .then(function (resp) {
         $ionicLoading.hide();
         $ionicPopup.alert({
         title: 'success',
         template: 'added article ' + resp.title + ' ID: ' + resp.ID
         });
         return resp;
         })
         .catch(function (err) {
         return err;
         });
         })
         .catch(function (err) {
         console.log('ERROR: ', JSON.stringify(err));
         $ionicLoading.hide();
         $ionicPopup.alert({
         title: 'Error',
         template: 'error getting location: ' + err.statusText
         });
         return err;
         });


         };
         $scope.addArticle2 = function () {

         $ionicLoading.show({template: 'Creating post...'});
         wordpressAPI.createPost({
         "title": "Hello World!"
         // "content_raw": "Derek's Content",
         //"status": "publish",
         // "author": 1,
         //"category_name": "derektest"
         })
         .$promise
         .then(function (resp) {
         $ionicLoading.hide();
         $ionicPopup.alert({
         title: 'success',
         template: 'added article ' + resp.title + ' ID: ' + resp.ID
         });
         return resp;
         })
         .catch(function (err) {
         console.log('ERROR: ', JSON.stringify(err));
         $ionicLoading.hide();
         $ionicPopup.alert({
         title: 'Error',
         template: 'error: ' + err.statusText
         });
         return err;
         });
         };

         $ionicLoading.show({template: 'Getting articles...'});
         wordpressAPI.getPosts({
         //'filter[category_name]': 'derektest',
         page: 1
         })
         .$promise
         .then(function (res) {
         console.log('v2 POSTS: ', res);
         $scope.posts = res;
         })
         .catch(function (err) {
         $ionicLoading.hide();
         $ionicPopup.alert({
         title: 'Error',
         template: 'error getting location: ' + err.statusText
         });
         });
         */
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
                console.log('Selected date is : ', val)
                $scope.datepickerObject.inputDate = val;

                var request = {};
                request.user = auth.profile.user_id;

                var body = {
                    "user_metadata": {
                        "birthday": val
                    }
                };

                auth0metadata.update(request, body).$promise
                    .then(function (o) {
                        console.log("updated Auth0: ", o);
                        $scope.auth.profile.user_metadata.birthday = o.user_metadata.birthday;
                        $ionicLoading.hide();
                    })
                    .catch(function (err) {
                        console.log("error updating Auth0: ", err);
                        $ionicLoading.hide();
                    });
            }
        };
        if (auth.profile.user_metadata && auth.profile.user_metadata.birthday) {
            $scope.datepickerObject.inputDate = new Date(auth.profile.user_metadata.birthday);
        } else {
            $scope.datepickerObject.inputDate = null;
        }

        // GENDER
        $scope.setGender = function () {
            $scope.data = {};
            $scope.data.gender = $scope.selectGender;
            // An elaborate, custom popup
            var myPopup = $ionicPopup.show({
                template: '<ion-radio ng-model="data.gender" ng-value="\'male\'">Male</ion-radio>' +
                '<ion-radio ng-model="data.gender" checked ng-value="\'female\'">Female</ion-radio>',
                title: 'Select your Gender',
                subTitle: 'male or female',
                scope: $scope,
                buttons: [
                    {text: 'Cancel'},
                    {
                        text: '<b>Save</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            if (!$scope.data.gender) {
                                //don't allow the user to close unless he enters wifi password
                                e.preventDefault();
                            } else {
                                return $scope.data.gender;
                            }
                        }
                    }
                ]
            });

            myPopup.then(function (res) {
                console.log('Tapped!', res);
                updateGender(res);
            });

        };
        function updateGender(gender) {
            if (gender) {
                var request = {};
                request.user = auth.profile.user_id;

                var body = {
                    "user_metadata": {
                        "gender": gender
                    }
                };

                return auth0metadata.update(request, body).$promise
                    .then(function (o) {
                        console.log("updated Auth0: ", o);
                        $scope.selectGender = o.user_metadata.gender;
                        $ionicLoading.hide();
                        return o;
                    })
                    .catch(function (err) {
                        console.log("error updating Auth0: ", err);
                        $ionicLoading.hide();
                        return err;
                    });
            }
        };
        if (auth.profile.user_metadata && auth.profile.user_metadata.gender) {
            //$scope.profileData.gender = auth.profile.app_metadata.gender;
            $scope.selectGender = auth.profile.user_metadata.gender;
        } else $scope.selectGender = '';

        // VOLUNTEER - want_add_places
        if (auth.profile.user_metadata && auth.profile.user_metadata.want_add_places) {
            //$scope.profileData.gender = auth.profile.app_metadata.gender;
            $scope.selectVol = auth.profile.user_metadata.want_add_places;
        } else $scope.selectVol = '';
        $scope.setVolForPlaces = function () {
            $scope.data = {};
            $scope.data.vol = 'no';
            // An elaborate, custom popup
            var myPopup = $ionicPopup.show({
                template: '<ion-radio ng-model="data.vol" ng-value="\'no\'">No Thanks</ion-radio>' +
                '<ion-radio ng-model="data.vol" checked ng-value="\'yes\'">Yes - I want to help</ion-radio>',
                title: 'Help us add places',
                subTitle: 'Register to Volunteer',
                scope: $scope,
                buttons: [
                    {text: 'Cancel'},
                    {
                        text: '<b>Save</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            if (!$scope.data.vol) {
                                //don't allow the user to close unless he enters wifi password
                                e.preventDefault();
                            } else {
                                return $scope.data.vol;
                            }
                        }
                    }
                ]
            });

            myPopup.then(function (res) {
                console.log('Tapped!', res);
                updateVolForPlaces(res);
            });

        };
        function updateVolForPlaces(choice) {
            if (choice && choice != "") {
                var request = {};
                request.user = auth.profile.user_id;

                var body = {
                    "user_metadata": {
                        "want_add_places": choice
                    }
                };

                auth0metadata.update(request, body).$promise
                    .then(function (o) {
                        console.log("updated Auth0: ", o);
                        $ionicLoading.hide();
                        $scope.selectVol = o.user_metadata.want_add_places;
                    })
                    .catch(function (err) {
                        console.log("error updating Auth0: ", err);
                        $ionicLoading.hide();
                    });
            }
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

