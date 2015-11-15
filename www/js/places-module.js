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

angular.module('places',
    [
        'ngCordova',
        'ionic',
        'ngGeolocation',
        'ngResource',
        'ngMessages'
    ])

    .constant("PlacesConfig", {
        'FEED_URL': 'https://quarkyapp.com/wp-json/posts/',
        'OHANA_URL': 'https://soulhole-api.herokuapp.com/api/',   // Production
        'OHANA_TOKEN': 'db8473ec53916f6dad2be7fad3f38d5c',                             // Production
        //'OHANA_URL': 'http://localhost:8080/api/',                  // Dev
        //'OHANA_TOKEN': '219c7eaef3f68dac0b0849033d64b059',          // Dev
        'PAGE_SIZE': 70,
        'CATEGORY': 'eGuru',
        'STATUS': 'publish',
        'TAG': 'elevate1',
        'ORDER_BY': 'title', // author, title, name (slug), date, modified
        'ORDER': 'ASC' // ASC or DESC
    })
    .factory('OhanaAPI', function($resource, PlacesConfig) {
        return $resource(PlacesConfig.OHANA_URL,
            {
            },
            {
                locations: {
                    method: 'GET',
                    isArray:true,
                    url: PlacesConfig.OHANA_URL+':verb',
                    params: {
                        verb: 'search',
                        keyword: '@keyword',
                        lat_lng: '@lat_lng',
                        radius : '@radius',
                        per_page : 100
                    },
                    headers: {
                        'Accept': 'application/vnd.ohanapi+json; version=1'
                    }
                },
                location: {
                    method: 'GET',
                    url: PlacesConfig.OHANA_URL+'locations/:id',
                    params: {
                        id: '@id'
                    },
                    headers: {
                        'Accept': 'application/vnd.ohanapi+json; version=1'
                    }
                },
                organizations: {
                    method: 'GET',
                    isArray:true,
                    url: PlacesConfig.OHANA_URL+':verb',
                    params: {
                        verb: 'search',
                        org_name: '@org_name', // the google places name
                        per_page : 100
                    },
                    headers: {
                        'Accept': 'application/vnd.ohanapi+json; version=1'
                    }
                },
                categories: {
                    method: 'GET',
                    isArray:true,
                    url: PlacesConfig.OHANA_URL+':verb',
                    params: {
                        verb: 'categories'
                    },
                    headers: {
                        'Accept': 'application/vnd.ohanapi+json; version=1'
                    }
                },
                createOrg: {
                    method: 'POST',
                    url: PlacesConfig.OHANA_URL+'organizations',
                    headers: {
                        'X-Api-Token': PlacesConfig.OHANA_TOKEN,
                        'Content-Type': 'application/json'
                    }
                },
                createLoc: {
                    method: 'POST',
                    url: PlacesConfig.OHANA_URL+'organizations/:organization_id/locations',
                    params: {
                        organization_id: '@organization_id'
                    },
                    headers: {
                        'X-Api-Token': PlacesConfig.OHANA_TOKEN,
                        'Content-Type': 'application/json'
                    }
                },
                createLocPhone: {
                    method: 'POST',
                    url: PlacesConfig.OHANA_URL+'locations/:location_id/phones',
                    params: {
                        location_id: '@location_id'
                    },
                    headers: {
                        'X-Api-Token': PlacesConfig.OHANA_TOKEN,
                        'Content-Type': 'application/json'
                    }
                },
                createLocService: {
                    method: 'POST',
                    url: PlacesConfig.OHANA_URL+'locations/:location_id/services',
                    params: {
                        location_id: '@location_id'
                    },
                    headers: {
                        'X-Api-Token': PlacesConfig.OHANA_TOKEN,
                        'Content-Type': 'application/json'
                    }
                },
                createSvcCategory: {
                    method: 'PUT',
                    url: PlacesConfig.OHANA_URL+'services/:service_id/categories',
                    params: {
                        service_id: '@service_id'
                    },
                    headers: {
                        'X-Api-Token': PlacesConfig.OHANA_TOKEN,
                        'Content-Type': 'application/json'
                    }
                }
            }

        );
    })

    .controller('PlacesMasterCtrl', function ($scope, $rootScope, $state, PlacesService,
                                              $ionicScrollDelegate, $ionicLoading,
                                              $ionicHistory, $ionicPopup,
                                              $cordovaGeolocation, $ionicPlatform) {
        $scope.posts = [];
        $rootScope.geoWatch = null;

        $scope.updateSearch = function(key, value) {
            if(key == 'text') $scope.search.text = value;
            if(key == 'radius') $scope.search.radius = value;
            console.log('Updatesearch to: ', $scope.search);
        }

        $scope.doSearch = function (srch) {
            if (srch && srch.length) $scope.search = {'text': srch};
            if (!$scope.search) return; // hit 'go' but nothing to do

            console.log('doSearch() with: ', $scope.search);

            if (!$rootScope.myPosition) {
                $ionicPopup.alert({
                    title: 'Location',
                    template: 'Getting position, try again shortly'
                });
                return;
            }
            if (!$scope.search.text) $scope.search.text = "fun";
            if (!$scope.search.radius) $scope.search.radius = "25";
            console.log('doSearch: ', $scope.search)

            $state.go('app.places-articles', {
                searchParams: {
                    'text': $scope.search.text,
                    'radius': $scope.search.radius
                }
            });
        };

        $scope.doGallery = function (aTopic) {
            if (!aTopic) return; // shouldn't happen
            console.log('doGallery() with: ', aTopic);

            //ensure we have a position
            if (!$rootScope.myPosition) {
                $ionicPopup.alert({
                    title: 'Location',
                    template: 'Getting position, try again shortly'
                });
                return;
            }

            if(!$scope.search) {
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
        }

        function watchLocation() {

            $ionicLoading.show({
                template: 'Locating...'
            });

            var posOptions = {
                // enableHighAccuracy: true, maximumAge:3000, timeout: 5000
                // enableHighAccuracy: false, maximumAge:3000, timeout: 30000
                maximumAge: 3000,
                timeout: 30000,
                enableHighAccuracy: false
            };

            console.log('going to watchPosition');
            $rootScope.geoWatch = $cordovaGeolocation.watchPosition(posOptions);
            $rootScope.geoWatch.then(
                null,
                function (err) {
                    // error
                    $ionicLoading.hide();
                    console.log("error in watch position", err.message);
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

                },
                function (position) {
                    console.log("got watch position", $rootScope.geoWatch);
                    $rootScope.myPosition = position;
                    $rootScope.geolat = position.coords.latitude
                    $rootScope.geolong = position.coords.longitude
                    $ionicLoading.hide();
                });
        }

        $scope.$on('$ionicView.enter', function () {
            console.log('ionicView enter, posts=', $scope.posts, ' search is: ', $scope.search);
            $ionicPlatform.ready(function () {
                console.log('ionicPlatform ready');
                watchLocation();
            });
        });

        $scope.$on('$ionicView.leave', function () {
            $cordovaGeolocation.clearWatch($rootScope.geoWatch.watchID);
            console.log("cleared watch: ", $rootScope.geoWatch);
            console.log('leaving geolocation view');
        });
    })
    .controller('PlacesGalleryCtrl', function ($scope, $rootScope, PlacesService,
                                               $state, $stateParams, $ionicPopup) {
        var postId = '';
        $scope.postName = null;
        $scope.posts = [];

        console.log('placesGallery stateparams: ', $stateParams);
        postId = $stateParams.galleryParams.ID;
        $scope.search = {
            'text': $stateParams.galleryParams.srch_text,
            'radius': $stateParams.galleryParams.srch_radius
        }

        $scope.postName = $stateParams.galleryParams.name;
        $scope.posts = PlacesService.getListData(postId);
        console.log('placesGallery items: ', $scope.posts);

        $scope.doSearch = function (srch) {
            // search the category specified by the gallery item
            if (srch && srch.length) $scope.search.text = srch;
            if (!$scope.search) return; // hit 'go' but nothing to do

            console.log('gallery doSearch() with: ', $scope.search);

            if (!$rootScope.myPosition) {
                $ionicPopup.alert({
                    title: 'Location',
                    template: 'Getting position, try again shortly'
                });
                return;
            }

            console.log('PlacesGallery search: ', $scope.search)

            $state.go('app.places-articles', {searchParams: {'text': $scope.search.text, 'radius': $scope.search.radius}});
        };

    })
    .controller('PlacesArticlesCtrl', function ($scope, $rootScope, $state,
                                                $ionicScrollDelegate, $stateParams,
                                                $ionicLoading, $ionicPopup, OhanaAPI, auth) {

        var _search = $stateParams.searchParams;
        $scope.placeHeader = $stateParams.searchParams.text;
        $scope.auth = auth;
        console.log("stateParams: ", $stateParams);


        // Quarky(Ohana) Places list ----------------->
        $scope.searchOhanaPlaces = function(search) {
            $scope.noresult = null;
            var lat_lng = $rootScope.geolat +','+$rootScope.geolong;
            if(!search || search==null) search = _search;

            var request = {};
            request.keyword = search.text;
            request.lat_lng = lat_lng;
            request.radius = search.radius;

            console.log("searchOhanaPlaces request: ", request);
            $ionicLoading.show({template: 'Loading...'});
            OhanaAPI.locations(request).$promise
                .then(function(result){
                    console.log('Ohana Promise result: ', result);
                    var matches = result.map(function (o) {
                        o.formatted_address = null;
                        if(o.address) {
                            o.formatted_address =
                                (o.address.address_1 || '') + ', ' +
                                (o.address.address_2 || '') + ', ' +
                                (o.address.city || '') +', ' +
                                (o.address.state_province || '') +', '+
                                (o.address.postal_code || '');
                        }
                        return {
                            id: o.id,
                            reference: o.id,
                            name: o.name,
                            description: o.description,
                            formatted_address: o.formatted_address || 'no address given',
                            icon: 'img/quarkycon.png'
                            //location: {longitude: o.geometry.location.lng(), latitude: o.geometry.location.lat()}
                        };
                    });
                    $scope.quarkyMatches = matches;
                    $ionicLoading.hide();
                    $ionicScrollDelegate.resize();
                    if (matches.length === 0) {
                        $scope.noresult = "Sorry, there are no Quarky matches.";
                    }
                })
                .catch(function(err){
                    console.log('ERROR calling Ohana: ', err);
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'error calling Ohana: '+err.statusText
                    });
                });
        }
        // Google Places list ----------------->
        $scope.searchGooglePlaces = function(search) {
            $scope.noresult = null;
            var lat = $rootScope.geolat;
            var lng = $rootScope.geolong;

            if(!search || search==null) search = _search;

            var request = {};
            request.location = new google.maps.LatLng(lat, lng);
            request.radius = search.radius ? (search.radius * 1609) : 5 * 1609;
            request.query = search.text || "Fun";

            console.log("searchGooglePlaces request: ", request);
            var service = new google.maps.places.PlacesService(document.createElement("div"));
            $ionicLoading.show({template: 'Loading...'});
            service.textSearch(request, googleCallback);
        }
        function googleCallback(result) {
            var matches = result.map(function (o) {
                return {
                    id: o.id,
                    reference: o.reference,
                    name: o.name,
                    address: o.vicinity,
                    formatted_address: o.formatted_address,
                    icon: o.icon,
                    location: {longitude: o.geometry.location.lng(), latitude: o.geometry.location.lat()}
                };
            });
            $scope.googleMatches = matches;
            $ionicLoading.hide();
            $ionicScrollDelegate.resize();
            //console.log("Matches", $scope.matches.length, $scope.matches);
            if (matches.length === 0) {
                $scope.noresult = "Sorry, there are no Google matches.";
            }
            $scope.$apply();
        }
        // Google Places list -----------------|

        $scope.searchOhanaPlaces(_search);
    })
    .controller('PlacesOhanaDetailCtrl', function ($scope, $stateParams, $rootScope,
                                                   $ionicSlideBoxDelegate, $ionicLoading,
                                                   $cordovaInAppBrowser, OhanaAPI,
                                                   $ionicScrollDelegate, $ionicPopup) {
        $rootScope.notHome = true;
        $scope.placeId = $stateParams.placeId;
        var options = {
            location: 'yes',
            clearcache: 'yes',
            toolbar: 'yes'
        };
        $scope.showPage = function (url) {
            $cordovaInAppBrowser.open(url, '_blank', options)
                .then(function (event) {
                    // success
                })
                .catch(function (event) {
                    // error
                    console.log(event);
                });
        }

        var request = { id: $scope.placeId };
        $ionicLoading.show({template: 'Loading...'});
        OhanaAPI.location(request).$promise
            .then(function(o){
                console.log('here is o: ',o);
                $scope.name = o.name;
                $scope.description = o.description;
                $scope.icon = 'img/quarkycon.png';
                $scope.latitude = o.latitude;
                $scope.longitude = o.longitude;
                if(o.address) {
                    $scope.hasAddress = true;
                    $scope.formatted_address =
                        (o.address.address_1 || '') + ', ' +
                        (o.address.address_2 || '') + ', ' +
                        (o.address.city || '') +', ' +
                        (o.address.state_province || '') +', '+
                        (o.address.postal_code || '');
                } else $scope.hasAddress = false;
                if(o.website) {
                    $scope.hasWebsite = true;
                    $scope.website = o.website;
                } else $scope.hasWebsite = false;
                if(o.phones) {
                    $scope.hasPhones = true;
                    $scope.phones = o.phones;
                } else $scope.hasPhones = false;
                $ionicLoading.hide();
                $ionicScrollDelegate.resize();
            })
            .catch(function(err){
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'error getting location: '+err.statusText
                });
            });

    })
    .controller('PlacesDetailCtrl', function ($scope, $stateParams, $rootScope,
                                              $ionicSlideBoxDelegate, $ionicLoading,
                                              $cordovaInAppBrowser, $ionicModal,
                                              OhanaAPI, $filter, $ionicPopup) {
        $rootScope.notHome = true;
        $scope.placeId = $stateParams.placeId;


        OhanaAPI.categories().$promise
            .then(function(res){
                $ionicLoading.hide();
                var matches = $filter('filter')(res, { "depth": 0}, true);
                console.log('Ohana cats matches: ', matches);
                $scope.ohanaCats = matches;
                $ionicLoading.hide();
                return matches;
            })
            .catch(function(err){
                console.log('problem getting ohana cats: ', err);
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'error getting categories: '+err.statusText
                });
            })


        var options = {
            location: 'yes',
            clearcache: 'yes',
            toolbar: 'yes'
        };
        $scope.showPage = function (url) {
            $cordovaInAppBrowser.open(url, '_blank', options)
                .then(function (event) {
                    // success
                })
                .catch(function (event) {
                    // error
                    console.log(event);
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'error showing page: '+event.statusText
                    });
                });
        }


        //console.log('placeId is: ', $scope.placeId);

        $ionicLoading.show({template: 'Loading...'});
        var service = new google.maps.places.PlacesService(document.createElement("div"));
        service.getDetails({reference: $scope.placeId}, function (res) {
            console.dir(res);
            //modify res so we can use loc easier
            res.position = {longitude: res.geometry.location.lng(), latitude: res.geometry.location.lat()};

            if (res.opening_hours) {
                $scope.hasOpen = true;
            } else $scope.hasOpen = false;

            $scope.price = "";
            if (res.price_level) {
                if (res.price_level === 0) $scope.price = "Free";
                if (res.price_level === 1) $scope.price = "Inexpensive";
                if (res.price_level === 2) $scope.price = "Moderate";
                if (res.price_level === 3) $scope.price = "Expensive";
                if (res.price_level === 4) $scope.price = "Very expensive";
            }

            if (res.photos) {
                $scope.hasPhotos = true;
                for (var x = 0; x < res.photos.length; x++) {
                    res.photos[x].url = res.photos[x].getUrl({'maxWidth': 300, 'maxHeight': 300});
                }
            } else $scope.hasPhotos = false;

            $scope.place = res;

            console.log('Looking for existing org called', $scope.place.name);
            OhanaAPI.organizations({
                org_name: $scope.place.name
            }).$promise
                .then(function(res){
                    console.log('Ohana orgs: ', res);
                    $scope.existingOrgs = res;
                    return res;
                })
                .catch(function(err){
                    console.log('problem getting ohana orgs: ', err);
                    $scope.existingOrgs = 'an error occurred';
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'error getting organizations: '+err.statusText
                    });
                })

            $scope.ohanaform = {
                org_select: $scope.org_select || '',
                org_name: $scope.place.name || '',
                org_description : $scope.place.name || '',
                org_website : $scope.place.website || '',
                loc_name: $scope.place.name || '',
                loc_description : $scope.place.name || '',
                loc_website : $scope.place.website || '',

                loc_addy_address_1 : getAddressComponent($scope.place, 'street_number', 'long') + ' '+ getAddressComponent($scope.place, 'route', 'long'),
                loc_addy_address_2 : '',
                loc_addy_city : getAddressComponent($scope.place, 'locality', 'long'),
                loc_addy_state_province : getAddressComponent($scope.place, 'administrative_area_level_1', 'short'), //2-letter US state_province abbreviation
                loc_addy_postal_code : parseInt(getAddressComponent($scope.place, 'postal_code', 'long')), // make it a number for the user
                loc_addy_country : getAddressComponent($scope.place, 'country', 'short'), //2-letter ISO 3361-1 country code

                loc_lat : $scope.place.position.latitude || 'N/A',
                loc_lng : $scope.place.position.longitude || 'N/A',
                loc_phone_number: $scope.place.formatted_phone_number,
                loc_phone_number_type: 'voice',
                svc_name: $scope.svc_name || '',
                svc_description: $scope.svc_description || '',
                svc_status: $scope.svc_status || '',
                svc_category: $scope.svc_category || ''
            };
            $ionicSlideBoxDelegate.update();

            $scope.$apply();
            $ionicLoading.hide();
        });

        // ============= Add to Quarky =============================

        function getAddressComponent(address, component, type) {
            var element = null;
            angular.forEach(address.address_components, function (address_component) {
                if (address_component.types[0] == component) {
                    element = (type == 'short') ? address_component.short_name : address_component.long_name;
                }
            });

            console.log("getAddy: ",element);
            return element;
        }
        function createOhanaOrg(form) {
            // once done, then call createOhanaLocation()!
            // OPTIONAL - CREATE ORG -------------------------------
            // POST https://ohana-api-demo.herokuapp.com/api/organizations
            // form.org_select.$modelValue == ID of org
            // form.org_name.$modelValue
            // form.org_description.$modelValue
            // form.org_website.$modelValue
            var _body =
                {
                    "description": form.org_description,
                    "name": form.org_name,
                    "website": form.org_website
                };
            console.log("ORG JSON: ",_body);
            OhanaAPI.createOrg(_body).$promise
                .then(function(res){
                    console.log("CREATED ORG: ",res);
                    form.org_select = res.id;
                    return createOhanaLocation(form);
                })
                .catch(function(err){
                    console.log("ERROR CREATING ORG: ", err);
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'error creating org: '+err.statusText
                    });
                    return err;
                });
        }
        function createOhanaLocation (form) {
            // CREATE LOCATION -------------------------------
            // POST https://ohana-api-demo.herokuapp.com/api/organizations/:organization_id/locations
            var _body =
            {
                "description": form.loc_description,
                "name": form.loc_name,
                "website": form.loc_website,
                "latitude": angular.isNumber(form.loc_lat) ? form.loc_lat : parseFloat(form.loc_lat),
                "longitude": angular.isNumber(form.loc_lng) ? form.loc_lng : parseFloat(form.loc_lng),
                "address_attributes" : {
                    "address_1": form.loc_addy_address_1,
                    "address_2": form.loc_addy_address_2,
                    "city": form.loc_addy_city,
                    "state_province": form.loc_addy_state_province,
                    "postal_code": angular.isNumber(form.loc_addy_postal_code) ? form.loc_addy_postal_code.toString() : form.loc_addy_postal_code,
                    "country": form.loc_addy_country
                }
            };
            console.log("CREATING LOCATION with JSON: ",_body);
            //TODO: pass in the organization.id
            OhanaAPI.createLoc(
                {organization_id: form.org_select},
                _body)
                .$promise
                .then(function(res){
                    form.loc_id = res.id;
                    console.log("CREATED LOC: ",res);
                    return createOhanaLocPhone(form);
                })
                .catch(function(err){
                    console.log("ERROR CREATING LOC: ", err);
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'error creating LOC: '+err.statusText
                    });
                    return err;
                });



            // CREATE PHONE ------------------------------------
            // POST https://ohana-api-demo.herokuapp.com/api/locations/:location_id/phones
            // loc_phone_number, loc_phone_type
            //
            // CREATE SERVICE ------------------------------------
            // POST https://ohana-api-demo.herokuapp.com/api/locations/:location_id/services
            // svc_name
            // svc_description
            // svc_status
            //
            // UPDATE SVC CATEGORIES ------------------------------------
            // PUT https://ohana-api-demo.herokuapp.com/api/services/:service_id/categories
            // svc_category // An array of valid oe_ids. --- {"oe_ids": ["101", "102"]}
            //

        }
        function createOhanaLocPhone (form) {
            var _body =
            {
                "number": angular.isNumber(form.loc_phone_number) ? form.loc_phone_number.toString() : form.loc_phone_number,
                "number_type": angular.isNumber(form.loc_phone_number_type) ? form.loc_phone_number_type.toString() : form.loc_phone_number_type
            };
            console.log("CREATING PHONE with JSON: ",_body);
            OhanaAPI.createLocPhone(
                {location_id: form.loc_id},
                _body)
                .$promise.then(function(res){
                    console.log("CREATED PHONE: ",res);
                    //TODO: service, categories
                    return createOhanaLocService(form);
                })
                .catch(function(err){
                    console.log("ERROR CREATING PHONE: ", err);
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'error creating Phone: '+err.statusText
                    });
                    return err;
                });

        }
        function createOhanaLocService(form) {
            //createLocService
            var _body =
            {
                "name": form.svc_name,
                "description": form.svc_description,
                "status": form.svc_status
            };
            console.log("CREATING SERVICE with JSON: ",_body);
            OhanaAPI.createLocService(
                {location_id: form.loc_id},
                _body)
                .$promise.then(function(res){
                    form.svc_id = res.id;
                    console.log("CREATED SERVICE: ",res);
                    return createOhanaSvcCategory(form);
                })
                .catch(function(err){
                    console.log("ERROR CREATING SERVICE: ", err);
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'error creating SERVICE: '+err.statusText
                    });
                    return err;
                });

        }
        function createOhanaSvcCategory(form) {
            //createSvcCategory
            var _body =
            //{ "taxonomy_ids": ["101", "102"] }; // for testing
            { "taxonomy_ids": [ form.svc_category ] };

            console.log("CREATING SVC_CAT with JSON: ",_body, " svc id is: ", form.svc_id);
            OhanaAPI.createSvcCategory(
                {service_id: form.svc_id},
                _body)
                .$promise.then(function(res){
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title: 'Success!',
                        template: 'You have added a new Place to Quarky'
                    });
                    $scope.closeModal();
                    return res;
                })
                .catch(function(err){
                    console.log("ERROR CREATING SERVICE: ", err);
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'error creating SERVICE: '+err.statusText
                    });
                    return res;
                });


        }

        $scope.submitOhana = function(form) {
            if(form.$valid) {
                var foo = {};
                foo.loc_addy_address_1      = form.loc_addy_address_1.$modelValue;
                foo.loc_addy_address_2      = form.loc_addy_address_2.$modelValue;
                foo.loc_addy_city           = form.loc_addy_city.$modelValue;
                foo.loc_addy_country        = form.loc_addy_country.$modelValue;
                foo.loc_addy_postal_code    = angular.isNumber(form.loc_addy_postal_code.$modelValue) ?
                                                form.loc_addy_postal_code.$modelValue.toString() :
                                                form.loc_addy_postal_code.$modelValue,
                foo.loc_addy_state_province = form.loc_addy_state_province.$modelValue;
                foo.loc_description         = form.loc_description.$modelValue;
                foo.loc_name                = form.loc_name.$modelValue;
                foo.loc_phone_number        = form.loc_phone_number.$modelValue;
                foo.loc_phone_number_type   = form.loc_phone_number_type.$modelValue;
                foo.loc_website             = form.loc_website.$modelValue;
                foo.loc_lat                 = angular.isNumber(form.loc_lat.$modelValue) ?
                                                form.loc_lat.$modelValue :
                                                parseFloat(form.loc_lng.$modelValue),
                foo.loc_lng                 = angular.isNumber(form.loc_lng.$modelValue) ?
                                                form.loc_lng.$modelValue :
                                                parseFloat(form.loc_lng.$modelValue),
                foo.org_description         = form.org_description.$modelValue;
                foo.org_name                = form.org_name.$modelValue;
                foo.org_select              = form.org_select.$modelValue;
                foo.org_website             = form.org_website.$modelValue;
                foo.svc_category            = form.svc_category.$modelValue;
                foo.svc_description         = form.svc_description.$modelValue;
                foo.svc_name                = form.svc_name.$modelValue;
                foo.svc_status              = form.svc_status.$modelValue;
                console.log("SUBMITTING FOO: ", foo);

                if(!foo.org_select || foo.org_select == "") {
                    createOhanaOrg(foo); // new org
                } else {
                    createOhanaLocation(foo); // use existing org
                }
            } else {
                console.log("got invalid form ", form);
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'Got invalid form'
                });
            }
        };

        $ionicModal.fromTemplateUrl('templates/add-to-quarky.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });
        $scope.openModal = function() {
            $scope.modal.show();
        };
        $scope.closeModal = function() {
            $scope.modal.hide();
            $ionicLoading.hide();
        };
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
            $ionicLoading.hide();
        });
        // Execute action on hide modal
        $scope.$on('modal.hidden', function() {
            // Execute action
            $ionicLoading.hide();
        });
        // Execute action on remove modal
        $scope.$on('modal.removed', function() {
            // Execute action
            $ionicLoading.hide();
        });


    })
    .service('PlacesService', ['$http', 'PlacesConfig', PlacesService]);


function PlacesService($http, PlacesConfig) {
    var _navdata = [
        {
            "ID": 2850,
            "order": 1,
            "name": "Fun",
            "featured_image": {
                "ID": 1,
                "source": "",
                "local": "img/places/Places-for-Fun.jpg"
            }

        },
        {
            "ID": 2848,
            "order": 2,
            "name": "Help",
            "featured_image": {
                "ID": 2,
                "source": "",
                "local": "img/places/Places-for-Help.jpg"
            }
        },
        {
            "ID": 3949,
            "order": 3,
            "name": "Service", // from Options to Story
            "featured_image": {
                "ID": 3,
                "source": "",
                "local": "img/places/Places-to-Serve.jpg"
            }
        }
    ];
    var _comingSoon = [
        {
            "ID": 0000,
            "slug": "coming-soon",
            "featured_image": {
                "ID": 3007,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/06/Coming-Soon.png",
                "local": "img/guru-nav/Coming-Soon.png"
            }
        }
    ];
    var _funGallery = [
        {
            "ID": 3941,
            "name": "Sports and Rec",
            "order": 11,
            "featured_image": {
                "ID": 3937,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/07/Sports-and-Rec1.png",
                "local": "img/places/fun/Sports-and-Rec1.png"
            }

        },
        {
            "ID": 3939,
            "name": "Shop and Travel",
            "order": 10,
            "featured_image": {
                "ID": 3936,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/07/Shop-and-Travel.png",
                "local": "img/places/fun/Shop-and-Travel.png"
            }

        },
        {
            "ID": 3933,
            "name": "Random Fun",
            "order": 9,
            "featured_image": {
                "ID": 3934,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/07/Random-Fun.png",
                "local": "img/places/fun/Random-Fun.png"
            }

        },
        {
            "ID": 3931,
            "name": "Free",
            "order": 6,
            "featured_image": {
                "ID": 3923,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/07/Free.png",
                "local": "img/places/fun/Free.png"
            }

        },
        {
            "ID": 3929,
            "name": "Outdoors",
            "order": 8,
            "featured_image": {
                "ID": 3923,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/08/Outdoors.png",
                "local": "img/places/fun/Outdoors.png"
            }

        },
        {
            "ID": 3927,
            "name": "Hobbies",
            "order": 7,
            "featured_image": {
                "ID": 3924,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/07/Hobbies.png",
                "local": "img/places/fun/Hobbies.png"
            }

        },
        {
            "ID": 3921,
            "name": "Food and Events",
            "order": 5,
            "featured_image": {
                "ID": 4366,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/08/Food-and-Events.png",
                "local": "img/places/fun/Food-and-Events.png"
            }

        },
        {
            "ID": 3919,
            "name": "Expression",
            "order": 4,
            "featured_image": {
                "ID": 3913,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/07/Expression.png",
                "local": "img/places/fun/Expression.png"
            }

        },
        {
            "ID": 3917,
            "name": "Clubs and Organizations",
            "order": 3,
            "featured_image": {
                "ID": 3912,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/07/Clubs.png",
                "local": "img/places/fun/Clubs.png"
            }

        },
        {
            "ID": 3915,
            "name": "Build Skills",
            "order": 2,
            "featured_image": {
                "ID": 4364,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/08/Build-Skills1.png",
                "local": "img/places/fun/Build-Skills.png"
            }

        },
        {
            "ID": 3908,
            "name": "A and E Venues",
            "order": 1,
            "featured_image": {
                "ID": 3910,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/07/AE-Venues.png",
                "local": "img/places/fun/AE-Venues.png"
            }

        }
    ];
    var _helpGallery = [
        {
            "ID": 3854,
            "name": "Work",
            "order": 10,
            "featured_image": {
                "ID": 3835,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/05/Work.png",
                "local": "img/places/help/Work.png"
            }

        },
        {
            "ID": 3852,
            "name": "Transit",
            "order": 6,
            "featured_image": {
                "ID": 4367,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/07/Transit.png",
                "local": "img/places/help/Transit.png"
            }

        },
        {
            "ID": 3850,
            "name": "Money",
            "order": 4,
            "featured_image": {
                "ID": 3832,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/05/Money.png",
                "local": "img/places/help/Money.png"
            }

        },
        {
            "ID": 3848,
            "name": "Legal",
            "order": 11,
            "featured_image": {
                "ID": 3831,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/05/Legal.png",
                "local": "img/places/help/Legal.png"
            }

        },
        {
            "ID": 3846,
            "name": "Housing",
            "order": 3,
            "featured_image": {
                "ID": 3830,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/05/Housing.png",
                "local": "img/places/help/Housing.png"
            }

        },
        {
            "ID": 3844,
            "name": "Health",
            "order": 7,
            "featured_image": {
                "ID": 3829,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/05/Health.png",
                "local": "img/places/help/Health.png"
            }

        },
        {
            "ID": 3842,
            "name": "Goods",
            "order": 5,
            "featured_image": {
                "ID": 3828,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/05/Goods.png",
                "local": "img/places/help/Goods.png"
            }

        },
        {
            "ID": 3840,
            "name": "Food",
            "order": 2,
            "featured_image": {
                "ID": 4363,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/08/Food.png",
                "local": "img/places/help/Food.png"
            }

        },
        {
            "ID": 3838,
            "name": "Education",
            "order": 9,
            "featured_image": {
                "ID": 3825,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/05/Education.png",
                "local": "img/places/help/Education.png"
            }

        },
        {
            "ID": 3836,
            "name": "Care",
            "order": 8,
            "featured_image": {
                "ID": 3824,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/05/Care.png",
                "local": "img/places/help/Care.png"
            }

        },
        {
            "ID": 2855,
            "name": "Emergency",
            "order": 1,
            "featured_image": {
                "ID": 3826,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/05/Emergency.png",
                "local": "img/places/help/Emergency.png"
            }

        }
    ];
    var _serviceGallery = [
        {
            "ID": 3106,
            "name": "Worship",
            "order": 4,
            "featured_image": {
                "ID": 3107,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/07/worship-1.png",
                "local": "img/places/service/worship-1.png"
            }

        },
        {
            "ID": 3104,
            "name": "Recycle",
            "order": 3,
            "featured_image": {
                "ID": 3095,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/05/recycle.png",
                "local": "img/places/service/recycle.png"
            }

        },
        {
            "ID": 3102,
            "name": "Volunteer",
            "order": 2,
            "featured_image": {
                "ID": 3096,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/05/Volunteer-1.png",
                "local": "img/places/service/Volunteer-1.png"
            }

        },
        {
            "ID": 3100,
            "name": "Donate",
            "order": 1,
            "featured_image": {
                "ID": 4365,
                "source": "https://quarkyapp.com/wp-content/uploads/2015/08/donate.png",
                "local": "img/places/service/donate.png"
            }

        }
    ];

    this.getServiceGallery = function() {
        console.log('service gallery');
        return _serviceGallery;
    }

    this.getHelpGallery = function () {
        console.log('help gallery');
        return _helpGallery;
    }
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
    this.getListData = function (id) {
        console.log("getting list data for ", id);
        switch (id) {
            case 2631:
                return this.getPlacesNav();
                break;
            case 2850:
                return this.getFunGallery();
                break;
            case 2848:
                return this.getHelpGallery();
                break;
            case 3949:
                return this.getServiceGallery();
                break;
            default:
                return this.getComingSoon();
        }
        return;
    };
}

