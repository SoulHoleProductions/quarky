angular.module('profile', ['ionic-datepicker'])
    .factory('auth0metadata', function($resource) {
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
    .controller('ProfileCtrl', function ($scope, $rootScope, $ionicPlatform, auth,
                                         store, $ionicLoading, $state, $ionicHistory,
                                         auth0metadata) {

        $scope.auth = auth;
        console.log("User profile: ", auth);

        $scope.datepickerObject = {
            titleLabel: 'Birthday',  //Optional
            todayLabel: 'Today',  //Optional
            closeLabel: 'Close',  //Optional
            setLabel: 'Set',  //Optional
            setButtonType : 'button-balanced',  //Optional
            todayButtonType : 'button-stable',  //Optional
            closeButtonType : 'button-assertive',  //Optional
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
                    "user_metadata" :
                        {
                            "birthday": val
                        }
                };

                auth0metadata.update(request,body).$promise
                    .then(function(o){
                        console.log("updated Auth0: ", o);
                        $ionicLoading.hide();
                    })
                    .catch(function(err){
                        console.log("error updating Auth0: ", err);
                        $ionicLoading.hide();
                    });
            }
        };

        $scope.updateVolForPlaces = function(choice) {
            if(choice && choice != "") {
                var request = {};
                request.user = auth.profile.user_id;

                var body = {
                    "user_metadata" :
                    {
                        "want_add_places": choice
                    }
                };

                auth0metadata.update(request,body).$promise
                    .then(function(o){
                        console.log("updated Auth0: ", o);
                        $ionicLoading.hide();
                    })
                    .catch(function(err){
                        console.log("error updating Auth0: ", err);
                        $ionicLoading.hide();
                    });
            }
        };
        $scope.updateGender = function(gender) {
            if(gender && gender != "") {
                var request = {};
                request.user = auth.profile.user_id;

                var body = {
                    "user_metadata" :
                    {
                        "gender": gender
                    }
                };

                auth0metadata.update(request,body).$promise
                    .then(function(o){
                        console.log("updated Auth0: ", o);
                        $ionicLoading.hide();
                    })
                    .catch(function(err){
                        console.log("error updating Auth0: ", err);
                        $ionicLoading.hide();
                    });
            }
        };

        if(auth.profile.user_metadata && auth.profile.user_metadata.birthday) {
            $scope.datepickerObject.inputDate = new Date(auth.profile.user_metadata.birthday);
        } else {
            $scope.datepickerObject.inputDate = new Date();
        }

        if(auth.profile.user_metadata && auth.profile.user_metadata.gender) {
            //$scope.profileData.gender = auth.profile.app_metadata.gender;
            $scope.selectGender = auth.profile.user_metadata.gender;
        } else $scope.selectGender = '';


        ionic.Platform.ready(function () {
            $scope.deviceInfo = ionic.Platform.device();
            $scope.currentPlatform = ionic.Platform.platform();
            $scope.currentPlatformVersion = ionic.Platform.version();

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

