/*
These are the core controllers used by the app.
There are other controllers too. They are contained in the features:
eguru,

 */

angular.module('quarky.controllers', [])

    .controller('MenuCtrl', function(store, $scope, $location, auth, $ionicActionSheet){
        $scope.auth = auth;
        $scope.login = function() {
            auth.signin({
                socialBigButtons: true,
                forceJSONP: true,
                icon: 'http://quarkyapp.com/wp-content/uploads/2015/03/quarkycon.png',
                authParams: {
                    scope: 'openid offline_access',
                    device: 'Mobile device'
                }
            }, function(profile, token, accessToken, state, refreshToken) {
                // Success callback
                store.set('profile', profile);
                store.set('token', token);
                store.set('refreshToken', refreshToken);
                $location.path('/');
            }, function() {
                // Error callback
            });
        }
        $scope.logout = function() {
            auth.signout();
            store.remove('token');
            store.remove('profile');
            store.remove('refreshToken');
            $state.go('login');
        }
        $scope.showHotlineActionsheet = function() {

            $ionicActionSheet.show({
                titleText: 'National Hotlines',
                buttons: [
                    { text: 'National Suicide Hotline' },
                    { text: 'National Runaway Safeline' },
                    { text: 'Adolescent Crisis Intervention & Counseling Nineline' },
                    { text: 'TXT 4 HELP' }
                ],
                //destructiveText: 'Delete',
                cancelText: 'Cancel',
                cancel: function() {
                    //console.log('CANCELLED');
                },
                buttonClicked: function(index) {
                    //console.log('BUTTON CLICKED', index);
                    if(index==0) window.open('tel:1-800-273-8255','_system'); // National Suicide Hotline
                    if(index==1) window.open('tel:1-800-786-2929','_system'); // National Runaway Safeline
                    if(index==2) window.open('tel:1-800-999-9999','_system'); // Adolescent Crisis Intervention & Counseling Nineline
                    if(index==3) window.open('sms:69866'); // Text SAFE and your current location
                    return true;
                },
                destructiveButtonClicked: function() {
                    //console.log('DESTRUCT');
                    return true;
                }
            });
        };

    })

    .controller('ResourcesCtrl', function($scope) {
        $scope.resources = [
            { title: 'NKCH', id: 1 },
            { title: 'Marc', id: 2 },
            { title: 'United Way', id: 3 },
            { title: 'Osanam', id: 4 },
            { title: 'Monkey Bizness', id: 5 }
        ];
    })

    .controller('ResourceCtrl', function($scope, $stateParams) {
    });
