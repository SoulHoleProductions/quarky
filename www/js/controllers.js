/*
 These are the core controllers used by the app.
 There are other controllers too. They are contained in the features:
 eguru,

 */

angular.module('quarky.controllers', [])

    .controller('LoginCtrl', function($scope, auth, $state, store) {
        function doAuth() {
            auth.signin({
                //closable: false,
                // This asks for the refresh token
                // So that the user never has to log in again
                authParams: {
                    scope: 'openid offline_access'
                }
            }, function(profile, idToken, accessToken, state, refreshToken) {
                store.set('profile', profile);
                store.set('token', idToken);
                store.set('refreshToken', refreshToken);
                //$state.go('login');
                $location.path('/');
            }, function(error) {
                console.log("There was an error logging in", error);
            });
        }

        $scope.$on('$ionic.reconnectScope', function() {
            doAuth();
        });

        doAuth();

    })

    .controller('MenuCtrl', function(store, $scope, $location, $state, auth, $ionicActionSheet){
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
            }, function(error) {
                // Error callback
                console.log("There was an error logging in", error);
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

