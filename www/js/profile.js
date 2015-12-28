angular.module('profile', ['ionic-datepicker', 'ngResource'])
    .constant("ModuleConfig", {
        'FEED_URL': 'http://soul-hole.net/wp-json/wp/v2/',
        'PAGE_SIZE': -1, // get them all
        'STATUS': 'publish',
//        'TAG': 'elevate1',
        'ORDER_BY': 'title', // author, title, name (slug), date, modified
        'ORDER': 'ASC' // ASC or DESC
    })
    .factory('auth0metadata', function ($resource) {
        return $resource('https://quarky.auth0.com/api/v2/users/:user',
            {
                user: '@user'
            },
            {
                update: {
                    method: 'PATCH'
                }
            }
        );
    })
    .factory('wordpressAPI', function ($resource, ModuleConfig) {
        return $resource(ModuleConfig.FEED_URL,
            {},
            {
                getMe: {
                    method: 'GET',
                    url: ModuleConfig.FEED_URL + 'users/me'
                },
                getPosts: {
                    method: 'GET',
                    isArray: true,
                    url: ModuleConfig.FEED_URL + ':verb',
                    params: {
                        verb: 'posts',
                        'filter[posts_per_page]': ModuleConfig.PAGE_SIZE,
                        'filter[orderby]': ModuleConfig.ORDER_BY,
                        'filter[post_status]': ModuleConfig.STATUS,
                        'filter[order]': ModuleConfig.ORDER
                    },
                    headers: {}
                },
                getPost: {
                    method: 'GET',
                    url: ModuleConfig.FEED_URL + 'posts/:id',
                    params: {
                        id: '@id'
                    },
                    headers: {}
                },
                createPost: {
                    method: 'POST',
                    url: ModuleConfig.FEED_URL + 'posts',
                    headers: {
                        'Content-Type': 'application/json'
                    }
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
    .controller('ProfileCtrl', function ($scope, $rootScope, $ionicPlatform, auth,
                                         store, $ionicLoading, $ionicPopup, $state, $ionicHistory,
                                         auth0metadata, wordpressAPI) {

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

