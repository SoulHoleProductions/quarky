/*
 Places Module
 The Quarky user can find places of interest near to them

 app.places-master -> This is the entry view for Places
 template: places-master.html
 controller: PlacesMasterCtrl

 app.places-gallery -> It shows the gallery of images for a selected filter from Master
 template: places-gallery.html
 controller: PlacesGalleryCtrl

 app.places-articles -> This is the list of articles for a given search or filter
 template: places-articles.html
 controller: PlacesArticlesCtrl

 app.place-detail -> Shows the details of any given place using a card
 template: place-detail.html
 controller: PlacesDetailCtrl

 app.place-ohana-detail -> Shows the details of any given place using a card
 template: place-ohana-detail.html
 controller: PlacesOhanaDetailCtrl

 */
function PlacesService($http, PlacesConfig) {
    'use strict';
    var _navdata = [
        {
            'ID': 2850,
            'order': 1,
            'name': 'Fun',
            'featured_image': {
                'ID': 1,
                'source': '',
                'local': 'img/places/Places-for-Fun.jpg'
            }
        },
        {
            'ID': 2848,
            'order': 2,
            'name': 'Help',
            'featured_image': {
                'ID': 2,
                'source': '',
                'local': 'img/places/Places-for-Help.jpg'
            }
        },
        {
            'ID': 3949,
            'order': 3,
            'name': 'Service',
            // from Options to Story
            'featured_image': {
                'ID': 3,
                'source': '',
                'local': 'img/places/Places-to-Serve.jpg'
            }
        }
    ];
    var _comingSoon = [{
        'ID': 0,
        'slug': 'coming-soon',
        'featured_image': {
            'ID': 3007,
            'source': 'https://quarkyapp.com/wp-content/uploads/2015/06/Coming-Soon.png',
            'local': 'img/guru-nav/Coming-Soon.png'
        }
    }];
    var _funGallery = [
        {
            'ID': 3941,
            'name': 'Sports and Rec',
            'search': 'sports',
            'order': 11,
            'featured_image': {
                'ID': 3937,
                'source': 'https://quarkyapp.com/wp-content/uploads/2015/07/Sports-and-Rec1.png',
                'local': 'img/places/fun/Sports-and-Rec1.png'
            }
        },
        {
            'ID': 3939,
            'name': 'Shop and Travel',
            'search': 'shop',
            'order': 10,
            'featured_image': {
                'ID': 3936,
                'source': 'https://quarkyapp.com/wp-content/uploads/2015/07/Shop-and-Travel.png',
                'local': 'img/places/fun/Shop-and-Travel.png'
            }
        },
        {
            'ID': 3933,
            'name': 'Random Fun',
            'search': 'fun',
            'order': 9,
            'featured_image': {
                'ID': 3934,
                'source': 'https://quarkyapp.com/wp-content/uploads/2015/07/Random-Fun.png',
                'local': 'img/places/fun/Random-Fun.png'
            }
        },
        {
            'ID': 3931,
            'name': 'Free',
            'search': 'free',
            'order': 6,
            'featured_image': {
                'ID': 3923,
                'source': 'https://quarkyapp.com/wp-content/uploads/2015/07/Free.png',
                'local': 'img/places/fun/Free.png'
            }
        },
        {
            'ID': 3929,
            'name': 'Outdoors',
            'search': 'outdoor',
            'order': 8,
            'featured_image': {
                'ID': 3923,
                'source': 'https://quarkyapp.com/wp-content/uploads/2015/08/Outdoors.png',
                'local': 'img/places/fun/Outdoors.png'
            }
        },
        {
            'ID': 3927,
            'name': 'Hobbies',
            'search': 'hobby',
            'order': 7,
            'featured_image': {
                'ID': 3924,
                'source': 'https://quarkyapp.com/wp-content/uploads/2015/07/Hobbies.png',
                'local': 'img/places/fun/Hobbies.png'
            }
        },
        {
            'ID': 3921,
            'name': 'Food and Events',
            'search': 'food',
            'order': 5,
            'featured_image': {
                'ID': 4366,
                'source': 'https://quarkyapp.com/wp-content/uploads/2015/08/Food-and-Events.png',
                'local': 'img/places/fun/Food-and-Events.png'
            }
        },
        {
            'ID': 3919,
            'name': 'Expression',
            'search': 'expression',
            'order': 4,
            'featured_image': {
                'ID': 3913,
                'source': 'https://quarkyapp.com/wp-content/uploads/2015/07/Expression.png',
                'local': 'img/places/fun/Expression.png'
            }
        },
        {
            'ID': 3917,
            'name': 'Clubs and Organizations',
            'search': 'clubs',
            'order': 3,
            'featured_image': {
                'ID': 3912,
                'source': 'https://quarkyapp.com/wp-content/uploads/2015/07/Clubs.png',
                'local': 'img/places/fun/Clubs.png'
            }
        },
        {
            'ID': 3915,
            'name': 'Build Skills',
            'search': 'skills',
            'order': 2,
            'featured_image': {
                'ID': 4364,
                'source': 'https://quarkyapp.com/wp-content/uploads/2015/08/Build-Skills1.png',
                'local': 'img/places/fun/Build-Skills.png'
            }
        },
        {
            'ID': 3908,
            'name': 'A and E Venues',
            'search': 'venues',
            'order': 1,
            'featured_image': {
                'ID': 3910,
                'source': 'https://quarkyapp.com/wp-content/uploads/2015/07/AE-Venues.png',
                'local': 'img/places/fun/AE-Venues.png'
            }
        }
    ];
    var _helpGallery = [
        {
            'ID': 3854,
            'name': 'Work',
            'search': 'work',
            'order': 10,
            'featured_image': {
                'ID': 3835,
                'source': 'https://quarkyapp.com/wp-content/uploads/2015/05/Work.png',
                'local': 'img/places/help/Work.png'
            }
        },
        {
            'ID': 3852,
            'name': 'Transit',
            'search': 'transit',
            'order': 6,
            'featured_image': {
                'ID': 4367,
                'source': 'https://quarkyapp.com/wp-content/uploads/2015/07/Transit.png',
                'local': 'img/places/help/Transit.png'
            }
        },
        {
            'ID': 3850,
            'name': 'Money',
            'search': 'money',
            'order': 4,
            'featured_image': {
                'ID': 3832,
                'source': 'https://quarkyapp.com/wp-content/uploads/2015/05/Money.png',
                'local': 'img/places/help/Money.png'
            }
        },
        {
            'ID': 3848,
            'name': 'Legal',
            'search': 'legal',
            'order': 11,
            'featured_image': {
                'ID': 3831,
                'source': 'https://quarkyapp.com/wp-content/uploads/2015/05/Legal.png',
                'local': 'img/places/help/Legal.png'
            }
        },
        {
            'ID': 3846,
            'name': 'Housing',
            'order': 3,
            'featured_image': {
                'ID': 3830,
                'source': 'https://quarkyapp.com/wp-content/uploads/2015/05/Housing.png',
                'local': 'img/places/help/Housing.png'
            }
        },
        {
            'ID': 3844,
            'name': 'Health',
            'search': 'health',
            'order': 7,
            'featured_image': {
                'ID': 3829,
                'source': 'https://quarkyapp.com/wp-content/uploads/2015/05/Health.png',
                'local': 'img/places/help/Health.png'
            }
        },
        {
            'ID': 3842,
            'name': 'Goods',
            'search': 'goods',
            'order': 5,
            'featured_image': {
                'ID': 3828,
                'source': 'https://quarkyapp.com/wp-content/uploads/2015/05/Goods.png',
                'local': 'img/places/help/Goods.png'
            }
        },
        {
            'ID': 3840,
            'name': 'Food',
            'search': 'food',
            'order': 2,
            'featured_image': {
                'ID': 4363,
                'source': 'https://quarkyapp.com/wp-content/uploads/2015/08/Food.png',
                'local': 'img/places/help/Food.png'
            }
        },
        {
            'ID': 3838,
            'name': 'Education',
            'search': 'education',
            'order': 9,
            'featured_image': {
                'ID': 3825,
                'source': 'https://quarkyapp.com/wp-content/uploads/2015/05/Education.png',
                'local': 'img/places/help/Education.png'
            }
        },
        {
            'ID': 3836,
            'name': 'Care',
            'search': 'care',
            'order': 8,
            'featured_image': {
                'ID': 3824,
                'source': 'https://quarkyapp.com/wp-content/uploads/2015/05/Care.png',
                'local': 'img/places/help/Care.png'
            }
        },
        {
            'ID': 2855,
            'name': 'Emergency',
            'search': 'emergency',
            'order': 1,
            'featured_image': {
                'ID': 3826,
                'source': 'https://quarkyapp.com/wp-content/uploads/2015/05/Emergency.png',
                'local': 'img/places/help/Emergency.png'
            }
        }
    ];
    var _serviceGallery = [
        {
            'ID': 3106,
            'name': 'Worship',
            'search': 'worship',
            'order': 4,
            'featured_image': {
                'ID': 3107,
                'source': 'https://quarkyapp.com/wp-content/uploads/2015/07/worship-1.png',
                'local': 'img/places/service/worship-1.png'
            }
        },
        {
            'ID': 3104,
            'name': 'Recycle',
            'search': 'recycle',
            'order': 3,
            'featured_image': {
                'ID': 3095,
                'source': 'https://quarkyapp.com/wp-content/uploads/2015/05/recycle.png',
                'local': 'img/places/service/recycle.png'
            }
        },
        {
            'ID': 3102,
            'name': 'Volunteer',
            'search': 'volunteer',
            'order': 2,
            'featured_image': {
                'ID': 3096,
                'source': 'https://quarkyapp.com/wp-content/uploads/2015/05/Volunteer-1.png',
                'local': 'img/places/service/Volunteer-1.png'
            }
        },
        {
            'ID': 3100,
            'name': 'Donate',
            'search': 'donate',
            'order': 1,
            'featured_image': {
                'ID': 4365,
                'source': 'https://quarkyapp.com/wp-content/uploads/2015/08/donate.png',
                'local': 'img/places/service/donate.png'
            }
        }
    ];
    this.getServiceGallery = function () {
        console.log('service gallery');
        return _serviceGallery;
    };
    this.getHelpGallery = function () {
        console.log('help gallery');
        return _helpGallery;
    };
    this.getFunGallery = function () {
        console.log('fun gallery');
        return _funGallery;
    };
    this.getPlacesNav = function () {
        console.log('nav data');
        return _navdata;
    };
    this.getComingSoon = function () {
        console.log('coming soon');
        return _comingSoon;
    };
    this.getAllGalleries = function () {
        var list = _funGallery;
        list = list.concat(_helpGallery);
        list = list.concat(_serviceGallery);
        return list;
    };
    this.getListData = function (id) {
        console.log('getting list data for ', id);
        switch (id) {
            case 2631:
                return this.getPlacesNav();

            case 2850:
                return this.getFunGallery();

            case 2848:
                return this.getHelpGallery();

            case 3949:
                return this.getServiceGallery();

            default:
                return this.getComingSoon();
        }
        return;
    };
}

angular.module('places', [
        'ngCordova',
        'ionic',
        'ngResource',
        'ngMessages'
    ])
    .constant('PlacesConfig', {
        'FEED_URL': 'https://quarkyapp.com/wp-json/posts/',
        'PAGE_SIZE': 70,
        'CATEGORY': 'eGuru',
        'STATUS': 'publish',
        'TAG': 'elevate1',
        'ORDER_BY': 'title',
        // author, title, name (slug), date, modified
        'ORDER': 'ASC'  // ASC or DESC
    })
    .factory('OhanaAPI', ['$resource', 'PlacesConfig', function ($resource, PlacesConfig) {
        'use strict';
        return $resource(PlacesConfig.OHANA_URL, {}, {
            locations: {
                method: 'GET',
                cache: true,
                isArray: true,
                url: PlacesConfig.OHANA_URL + ':verb',
                params: {
                    verb: 'search',
                    keyword: '@keyword',
                    lat_lng: '@lat_lng',
                    radius: '@radius',
                    per_page: '@per_page'
                },
                headers: {'Accept': 'application/vnd.ohanapi+json; version=1'}
            },
            location: {
                method: 'GET',
                cache: true,
                url: PlacesConfig.OHANA_URL + 'locations/:id',
                params: {id: '@id'},
                headers: {'Accept': 'application/vnd.ohanapi+json; version=1'}
            },
            organizations: {
                method: 'GET',
                cache: true,
                isArray: true,
                url: PlacesConfig.OHANA_URL + ':verb',
                params: {
                    verb: 'search',
                    org_name: '@org_name',
                    // the google places name
                    per_page: 100
                },
                headers: {'Accept': 'application/vnd.ohanapi+json; version=1'}
            },
            categories: {
                method: 'GET',
                cache: true,
                isArray: true,
                url: PlacesConfig.OHANA_URL + ':verb',
                params: {verb: 'categories'},
                headers: {'Accept': 'application/vnd.ohanapi+json; version=1'}
            },
            createOrg: {
                method: 'POST',
                url: PlacesConfig.OHANA_URL + 'organizations',
                headers: {
                    'X-Api-Token': PlacesConfig.OHANA_TOKEN,
                    'Content-Type': 'application/json'
                }
            },
            createLoc: {
                method: 'POST',
                url: PlacesConfig.OHANA_URL + 'organizations/:organization_id/locations',
                params: {organization_id: '@organization_id'},
                headers: {
                    'X-Api-Token': PlacesConfig.OHANA_TOKEN,
                    'Content-Type': 'application/json'
                }
            },
            createLocPhone: {
                method: 'POST',
                url: PlacesConfig.OHANA_URL + 'locations/:location_id/phones',
                params: {location_id: '@location_id'},
                headers: {
                    'X-Api-Token': PlacesConfig.OHANA_TOKEN,
                    'Content-Type': 'application/json'
                }
            },
            createLocService: {
                method: 'POST',
                url: PlacesConfig.OHANA_URL + 'locations/:location_id/services',
                params: {location_id: '@location_id'},
                headers: {
                    'X-Api-Token': PlacesConfig.OHANA_TOKEN,
                    'Content-Type': 'application/json'
                }
            },
            createSvcCategory: {
                method: 'PUT',
                url: PlacesConfig.OHANA_URL + 'services/:service_id/categories',
                params: {service_id: '@service_id'},
                headers: {
                    'X-Api-Token': PlacesConfig.OHANA_TOKEN,
                    'Content-Type': 'application/json'
                }
            }
        });
    }])
    .directive('reverseGeocode', function () {
        'use strict';
        return {
            restrict: 'E',
            template: '<div></div>',
            link: function (scope, element, attrs) {
                var geocoder = new google.maps.Geocoder();
                var latlng = new google.maps.LatLng(attrs.lat, attrs.lng);
                geocoder.geocode({'latLng': latlng}, function (results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        console.log('geocoder: ', JSON.stringify(results[1]));
                        if (results[1]) {
                            element.text(results[1].formatted_address);
                        } else {
                            element.text('Location not found');
                        }
                    } else {
                        element.text('Problem, try later: ' + status);
                    }
                });
            },
            replace: true
        };
    })
    .controller('PlacesMasterCtrl', ['$scope', '$rootScope', '$state', 'PlacesService', '$ionicScrollDelegate', '$ionicLoading',
        'auth', '$ionicHistory', '$ionicPopup', 'OhanaAPI', '$q', '$cordovaGeolocation', '$ionicPlatform',
        'UserSettings', 'UserStorageService', 'Place', 'OETaxonomy',
        function ($scope, $rootScope, $state, PlacesService, $ionicScrollDelegate, $ionicLoading,
                  auth, $ionicHistory, $ionicPopup, OhanaAPI, $q, $cordovaGeolocation, $ionicPlatform,
                  UserSettings, UserStorageService, Place, OETaxonomy) {
            'use strict';
            $scope.posts = [];
            //$scope.gPlace; // used with googleplace directive
            //$scope.selectedPlace; // used with googleplace directive
            $rootScope.geoWatch = null;
            // SEARCH SETTINGS ---------------
            $scope.searchModel = UserSettings.searchModel;
            function changeSetting(type, value) {
                $scope[type] = value;
                UserSettings[type] = value;
                UserStorageService.serializeSettings();
            }

            $scope.searchSettings = function () {
                if (!$rootScope.myPosition) {
                    $ionicPopup.alert({
                        title: 'Location',
                        template: 'Getting position, try again shortly'
                    });
                    return;
                }
                var myPopup = $ionicPopup.show({
                    template: '<li class="item item-toggle">Show categories first:<label class="toggle"><input ng-model="$parent.searchModel.showCategories" type="checkbox">' + '<div class="track"> <div class="handle"></div> </div> </label></li>' + //'<li class="item item-toggle" ng-show="auth.profile.app_metadata.can_add_places">Show Google Places:<label class="toggle"><input ng-model="$parent.searchModel.showGooglePlaces" type="checkbox">'+
                        //'<div class="track"> <div class="handle"></div> </div> </label></li>'+
                    '<div class="padding range range-dark"><i class="icon ion-android-walk"></i>' + '<input type="range" ng-model="$parent.searchModel.radius" name="distance" min="1" max="25">' + '<i class="icon ion-android-car"></i> {{ searchModel.radius}} miles </div>' + '<div class="padding range range-dark"><i class="icon ion-minus-circled"></i>' + '<input type="range" ng-model="$parent.searchModel.per_page" name="distance" min="1" max="100">' + '<i class="icon ion-plus-circled"></i> {{ searchModel.per_page}} results </div>' + '<button class="button button-full button-small button-dark icon ion-location">Your Location</button>' + '<reverse-geocode lat="' + $rootScope.geolat + '" lng="' + $rootScope.geolong + '" />' + '',
                    title: 'Search Settings',
                    scope: $scope,
                    buttons: [
                        {text: 'Cancel'},
                        {
                            text: '<b>Save</b>',
                            type: 'button-positive',
                            onTap: function (e) {
                                //console.log('my searchModel is: ', $scope.searchModel);
                                return $scope.searchModel;
                            }
                        }
                    ]
                });
                myPopup.then(function (res) {
                    console.log('Tapped!', res);
                    if (res !== undefined) {
                        changeSetting('searchModel', res);
                    }
                });
            };
            // Search Settings -----------------
            // ION-AUTOCOMPLETE
            $scope.autocompleteCallback = function (query, isInitializing) {
                if (!$rootScope.myPosition) {
                    return [{name: 'Please try again, still locating you...'}];
                }
                if (isInitializing && $scope.searchModel.showCategories) {
                    // depends on the configuration of the `items-method-value-key` (items) and the `item-value-key` (name) and `item-view-value-key` (name)
                    //var galleries = PlacesService.getAllGalleries();
                    //return galleries;
                    return OETaxonomy.find().$promise.then(function (resp) {
                        return resp;
                    }).catch(function (err) {
                        return err;
                    });
                } else {
                    var params = {
                        lat: $rootScope.geolat,
                        lng: $rootScope.geolong,
                        search: query,
                        radius: Number($scope.searchModel.radius) * 1609,
                        // convert miles to meters
                        limit: Number($scope.searchModel.per_page)
                    };
                    console.log('nearBy with params: ', params);
                    return Place.nearBy(params).$promise.then(function (res) {
                        console.log('nearBy result: ', res);
                        return res.places;
                    }).catch(function (err) {
                        console.log('nearBy error: ', err);
                        return err;
                    });
                }  //}
            };
            $scope.autocompleteSelectedItem = function (callback) {
                console.log('autocompleteSelectedItem: ', callback);
                if ($scope.searchModel.showCategories) {
                    // we have a category result
                    $scope.doSearch(callback.item.name);
                } else {
                    $state.go('app.place-detail', {placeId: callback.item.id});
                }
            };
            // =================
            $scope.doSearch = function (srch) {
                if (!$rootScope.myPosition) {
                    $ionicPopup.alert({
                        title: 'Location',
                        template: 'Getting position, try again shortly'
                    });
                    return;
                }
                console.log('doSearch: ', $scope.searchModel);
                $state.go('app.places-articles', {
                    searchParams: {
                        'text': srch || $scope.searchModel.lastPlaceSearch || '',
                        'radius': $scope.searchModel.radius,
                        'per_page': $scope.searchModel.per_page
                    }
                });
            };
            //$scope.doSearch = function (srch) {
            //    if (srch && srch.length) $scope.search = {'text': srch};
            //    if (!$scope.search) return; // hit 'go' but nothing to do
            //
            //    console.log('doSearch() with: ', $scope.search);
            //
            //    if (!$rootScope.myPosition) {
            //        $ionicPopup.alert({
            //            title: 'Location',
            //            template: 'Getting position, try again shortly'
            //        });
            //        return;
            //    }
            //    if (!$scope.search.text) $scope.search.text = "fun";
            //    if (!$scope.search.radius) $scope.search.radius = "25";
            //    console.log('doSearch: ', $scope.search);
            //
            //    $state.go('app.places-articles', {
            //        searchParams: {
            //            'text': $scope.search.text,
            //            'radius': $scope.search.radius
            //        }
            //    });
            //};
            $scope.doGallery = function (aTopic) {
                if (!aTopic) {
                    return;
                }
                // shouldn't happen
                console.log('doGallery() with: ', aTopic);
                //ensure we have a position
                if (!$rootScope.myPosition) {
                    $ionicPopup.alert({
                        title: 'Location',
                        template: 'Getting position, try again shortly'
                    });
                    return;
                }
                if (!$scope.search) {
                    $scope.search = {};
                    $scope.search.text = aTopic.name;
                    $scope.search.radius = '25';
                }
                $state.go('app.places-gallery', {
                    galleryParams: {
                        'ID': aTopic.ID,
                        'name': aTopic.name,
                        'srch_text': $scope.search.text,
                        'srch_radius': $scope.search.radius
                    }
                });
            };
            $scope.bootstrapFeed = function () {
                $scope.posts = PlacesService.getPlacesNav();
            };
            function watchLocation() {
                $ionicLoading.show({template: 'Locating...'});
                var posOptions = {
                    // enableHighAccuracy: true, maximumAge:3000, timeout: 5000
                    // enableHighAccuracy: false, maximumAge:3000, timeout: 30000
                    maximumAge: 3000,
                    timeout: 30000,
                    enableHighAccuracy: false
                };
                //console.log('going to watchPosition');
                $rootScope.geoWatch = $cordovaGeolocation.watchPosition(posOptions);
                $rootScope.geoWatch.then(null, function (err) {
                    if (!$rootScope.myPosition) {
                        // we never got a position at all
                        $ionicLoading.hide();
                        console.log('error in watch position', err.message);
                        if (ionic.Platform.isAndroid()) {
                            $ionicPopup.alert({
                                title: 'No Location',
                                template: 'Please confirm GPS is enabled and try again'
                            });
                        }
                        $ionicHistory.nextViewOptions({
                            disableAnimate: true,
                            disableBack: true
                        });
                        $state.go('app.home-list');
                    } else {
                        // we did get a position
                        console.log('Did not get new position (using old one), error: ', err.message);
                        $ionicLoading.hide();
                    }
                }, function (position) {
                    console.log('got watch position', $rootScope.geoWatch);
                    $rootScope.myPosition = position;
                    $rootScope.geolat = position.coords.latitude;
                    $rootScope.geolong = position.coords.longitude;
                    $ionicLoading.hide();
                });
            }

            $scope.$on('$ionicView.enter', function () {
                //console.log('ionicView enter, posts=', $scope.posts, ' search is: ', $scope.search);
                $ionicPlatform.ready(function () {
                    watchLocation();
                });
            });
            $scope.$on('$ionicView.leave', function () {
                $cordovaGeolocation.clearWatch($rootScope.geoWatch.watchID);  //console.log("cleared watch: ", $rootScope.geoWatch);
                                                                              //console.log('leaving geolocation view');
            });
        }])
    .controller('PlacesGalleryCtrl', ['$scope', '$rootScope', 'PlacesService', 'UserSettings', '$state', '$stateParams', '$ionicPopup',
        function ($scope, $rootScope, PlacesService, UserSettings, $state, $stateParams, $ionicPopup) {
            'use strict';
            var postId = '';
            $scope.postName = null;
            $scope.posts = [];
            $scope.searchModel = UserSettings.searchModel;
            console.log('placesGallery stateparams: ', $stateParams);
            postId = $stateParams.galleryParams.ID;
            $scope.search = {
                'text': $stateParams.galleryParams.srch_text,
                'radius': $stateParams.galleryParams.srch_radius
            };
            $scope.postName = $stateParams.galleryParams.name;
            $scope.posts = PlacesService.getListData(postId);
            console.log('placesGallery items: ', $scope.posts);
            $scope.doSearch = function (srch) {
                if (!$rootScope.myPosition) {
                    $ionicPopup.alert({
                        title: 'Location',
                        template: 'Getting position, try again shortly'
                    });
                    return;
                }
                console.log('gallery doSearch: ', $scope.searchModel);
                $state.go('app.places-articles', {
                    searchParams: {
                        'text': srch || $scope.searchModel.lastPlaceSearch || '',
                        'radius': $scope.searchModel.radius,
                        'per_page': $scope.searchModel.per_page
                    }
                });
            };
        }])
    .controller('PlacesArticlesCtrl', ['$scope', '$rootScope', '$state', 'Place', '$ionicScrollDelegate',
        '$stateParams', '$ionicLoading', '$ionicPopup', 'auth',
        function ($scope, $rootScope, $state, Place, $ionicScrollDelegate,
                  $stateParams, $ionicLoading, $ionicPopup, auth) {
            'use strict';
            var _search = $stateParams.searchParams;
            $scope.placeHeader = $stateParams.searchParams.text;
            $scope.auth = auth;
            console.log('stateParams: ', $stateParams);

            // Google Places list -----------------|
            $scope.searchQPlaces = function (search) {
                $ionicLoading.show({template: 'Loading...'});
                var request = {};
                request.search = search.text;
                request.lat = $rootScope.geolat;
                request.lng = $rootScope.geolong;
                request.radius = search.radius ? search.radius * 1609 : 5 * 1609;
                if (search.per_page) {
                    request.limit = search.per_page;
                }
                Place.nearBy(request).$promise.then(function (res) {
                    $scope.quarkyMatches = [];
                    var matches = angular.forEach(res.places, function (o, x) {
                        var icon = JSON.parse(o.photos);
                        var ret = {};
                        ret.id = o.id;
                        ret.name = o.name;
                        ret.description = o.description;
                        ret.formatted_address = o.formatted_address;
                        if (icon.length < 1) {
                            ret.iconurl = 'img/quarkycon.png';
                        }
                        else {
                            ret.iconurl = icon[0];
                        }
                        console.log('searchQPlaces ret:  ', ret);
                        $scope.quarkyMatches.push(ret);
                    });
                    console.log('received matches: ', matches);
                    $ionicLoading.hide();
                    $ionicScrollDelegate.resize();
                    if (matches.length === 0) {
                        $scope.noresult = 'No Places for this category, check back soon';
                    }
                }).catch(function (err) {
                    console.log('ERROR calling q-api: ', err);
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'error calling q-api: ' + err.statusText
                    });
                });
            };
            $scope.searchQPlaces(_search);
            $scope.$on('$ionicView.beforeEnter', function (event, data) {
                console.log('State Params: ', data.stateParams);
            });

        }])
    .controller('PlacesOhanaDetailCtrl', ['$scope', '$stateParams', '$rootScope', '$ionicSlideBoxDelegate', '$ionicLoading',
        '$cordovaInAppBrowser', 'OhanaAPI', '$ionicScrollDelegate', '$ionicPopup',
        function ($scope, $stateParams, $rootScope, $ionicSlideBoxDelegate, $ionicLoading,
                  $cordovaInAppBrowser, OhanaAPI, $ionicScrollDelegate, $ionicPopup) {
            'use strict';
            console.log('PlacesOhanaDetailCtrl: stateParams:', $stateParams);
            $rootScope.notHome = true;
            $scope.placeId = $stateParams.placeId;
            var options = {
                location: 'yes',
                clearcache: 'yes',
                toolbar: 'yes'
            };
            $scope.showPage = function (url) {
                $cordovaInAppBrowser.open(url, '_system', options).then(function (event) {
                }).catch(function (event) {
                    // error
                    console.log(event);
                });
            };
            var request = {id: $scope.placeId};
            $ionicLoading.show({template: 'Loading...'});
            OhanaAPI.location(request).$promise.then(function (o) {
                console.log('here is o: ', o);
                // Google Analytics
                if (typeof analytics !== 'undefined') {
                    analytics.trackEvent('Places', 'Open', o.name, 25);
                    console.log('GA tracking Places Open event for: ', o.name);
                }
                $scope.name = o.name;
                $scope.description = o.description;
                $scope.icon = 'img/quarkycon.png';
                $scope.latitude = o.latitude;
                $scope.longitude = o.longitude;
                if (o.address) {
                    $scope.hasAddress = true;
                    /*$scope.formatted_address =
                     (o.address.address_1 || '') + ', ' +
                     (o.address.address_2 || '') + ', ' +
                     (o.address.city || '') +', ' +
                     (o.address.state_province || '') +', '+
                     (o.address.postal_code || '');*/
                    $scope.formatted_address = '';
                    $scope.formatted_address += o.address.address_1 ? o.address.address_1 + ', ' : '';
                    $scope.formatted_address += o.address.address_2 ? o.address.address_2 + ', ' : '';
                    $scope.formatted_address += o.address.city ? o.address.city + ', ' : '';
                    $scope.formatted_address += o.address.state_province ? o.address.state_province + ', ' : '';
                    $scope.formatted_address += o.address.postal_code ? o.address.postal_code : '';
                } else {
                    $scope.hasAddress = false;
                }
                if (o.website) {
                    $scope.hasWebsite = true;
                    $scope.website = o.website;
                } else {
                    $scope.hasWebsite = false;
                }
                if (o.phones) {
                    $scope.hasPhones = true;
                    $scope.phones = o.phones;
                } else {
                    $scope.hasPhones = false;
                }
                $ionicLoading.hide();
                $ionicScrollDelegate.resize();
            }).catch(function (err) {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'error getting location: ' + err.statusText
                });
            });
        }])

    .controller('PlacesDetailCtrl', ['$scope', '$stateParams', '$rootScope', '$state',
        '$ionicSlideBoxDelegate', '$ionicLoading', '$cordovaInAppBrowser',
        '$ionicModal', 'Place', 'OETaxonomy', '$filter', '$ionicPopup', 'UserSettings',
        function ($scope, $stateParams, $rootScope, $state,
                  $ionicSlideBoxDelegate, $ionicLoading, $cordovaInAppBrowser,
                  $ionicModal, Place, OETaxonomy, $filter, $ionicPopup, UserSettings) {
            'use strict';
            $rootScope.notHome = true;
            $scope.placeId = $stateParams.placeId;
            console.log('PlacesDetail $stateParams is: ', $stateParams);
            $scope.options = {
                loop: false,
                effect: 'fade',
                speed: 500
            };
            var options = {
                location: 'yes',
                clearcache: 'yes',
                toolbar: 'yes'
            };
            $scope.showPage = function (url) {
                $cordovaInAppBrowser.open(url, '_system', options).then(function (event) {
                }).catch(function (event) {
                    // error
                    console.log(event);
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'error showing page: ' + event.statusText
                    });
                });
            };
            $scope.showHours = function (hours) {
                $ionicPopup.alert({
                    title: 'Hours / Availability',
                    scope: $scope,
                    templateUrl: 'templates/hours-list.html'
                });
            };
            $scope.makeCall = function (num) {
                console.log('makeCall() with: ', num);

                if (angular.isUndefined(num) || num === null) {
                    return;
                }

                if (angular.isNumber(num)) {
                    window.open('tel:' + num.toString(), '_system');
                } else if (angular.isString(num)) {
                    window.open('tel:' + num, '_system');
                } else {
                    console.log('makeCall() received invalid input');
                }
            };


            $ionicLoading.show({template: 'Loading...'});
            Place.findById({id: $scope.placeId}).$promise.then(function (res) {
                if (res.formatted_hours_array && res.formatted_hours_array.length > 0) {
                    $scope.hasOpen = true;
                    res.formatted_hours_array = JSON.parse(JSON.stringify(res.formatted_hours_array));
                    res.formatted_hours_array = res.formatted_hours_array.map(function (e) {
                        return {name: e};
                    });
                } else {
                    $scope.hasOpen = false;
                }
                if (res.photos) {
                    $scope.hasPhotos = true;
                    res.photos = JSON.parse(JSON.stringify(res.photos));
                    res.icon = res.photos[0];
                    res.photos = res.photos.map(function (e) {
                        return {url: e};
                    });
                    if (res.photos.length < 1) {
                        $scope.hasPhotos = false;
                        res.icon = 'img/quarkycon.png';
                    }
                } else {
                    $scope.hasPhotos = false;
                    res.icon = 'img/quarkycon.png';
                }
                // Google Analytics
                if (typeof analytics !== 'undefined') {
                    analytics.trackEvent('Places', 'Open', res.name, 25);
                    console.log('GA tracking Places Open event for: ', res.name);
                }
                $scope.placePhone = null;
                if (res.formatted_phone_number) {
                    var foo = res.formatted_phone_number;
                    $scope.placePhone = Number(foo.replace(/\D+/g, ''));
                }
                $scope.place = res;
                console.log('$scope.place: ', $scope.place);
                $ionicSlideBoxDelegate.update();
                //$scope.$apply();
                $ionicLoading.hide();
            }).catch(function (err) {
                console.log('$scope.place error: ', err);
                $ionicLoading.hide();
                $state.go('app.places-master');
            });
        }])
    .service('PlacesService', [
        '$http',
        'PlacesConfig',
        PlacesService
    ]);
