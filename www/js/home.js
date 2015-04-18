/**
 * Created by derekbaron on 3/14/15.
 *
 * The controllers and services supporting the app Home view
 *
 * This view shows a set of ionic cards
 * from Wordpress within the parent category of 'Home'
 *
 */
var QuarkyHome = angular.module("quarky.home", ["ionic"]);

QuarkyHome.controller("QuarkyHomeCtrl",
    ["$scope", "$sce", "$ionicLoading", "QuarkyHomeService", "$log", "$cordovaSocialSharing", QuarkyHomeCtrl]);

QuarkyHome.service("QuarkyHomeService",
    [ "$http", "$log", QuarkyHomeService ]);

function QuarkyHomeCtrl($scope, $sce, $ionicLoading, QuarkyHomeService, $log, $cordovaSocialSharing) {
    $scope.posts = [];
    $scope.pagenum = null;
    $scope.infiniteLoad = false;

    $scope.loadBlogs = function() {
        $scope.infiniteLoad = false;
        $scope.pagenum = 1;
        if ($scope.posts.length) {
            $scope.posts = [];
            $scope.moreBlogs();
        }
        $scope.$broadcast("scroll.refreshComplete");
        $scope.infiniteLoad = true;
    }

 /*   $scope.loadBlogs = function() {
        $ionicLoading.show({ template: "Loading..."});
        QuarkyHomeService.loadBlogs()
            .success(function(result) {
                //console.log(result);
                $scope.posts = $scope.posts.concat(result);
                $ionicLoading.hide();

            });
    }*/

    $scope.moreBlogs = function() {
        $ionicLoading.show({ template: "Loading..."});
        QuarkyHomeService.loadBlogs($scope.pagenum)
            .success(function(result) {
                //console.log(result);
                (result.length == 6) ? $scope.pagenum++ : $scope.pagenum = 1; // 6 results per page
                $scope.posts = $scope.posts.concat(result);
                $scope.$broadcast("scroll.infiniteScrollComplete");
                $ionicLoading.hide();

            });
    }

    $scope.toTrusted = function(text) {
        return ($sce.trustAsHtml(text));
    }

    // return the right ionic icon for the given category
    $scope.categoryIcon = function(cat) {
        var catIcon = "icon ion-quote";
        switch (cat.name) {
            case "Quarky News":
                catIcon = "icon ion-information-circled";
                break;
            case "Quotables":
                catIcon = "icon ion-quote";
                break;
            case "Notification":
                catIcon = "icon ion-speakerphone";
                break;
            case "Life Tip":
                catIcon = "icon ion-lightbulb";
                break;
            case "Home":
                catIcon = "icon ion-home";
                break;
            default:
                catIcon = "icon ion-quote";
        }
        return catIcon;
    }

    $scope.shareNative = function(message, subject, image, url) {
        if(!message) message = "I am using QuarkyApp, maybe you should too :)";
        if(!subject) subject = "Checkout QuarkyApp!";
        if(!image) image = "http://quarkyapp.com/wp-content/uploads/2015/03/quarkycon.png";
        if(!url) url = "http://quarkyapp.com";
        $cordovaSocialSharing.share(message, subject, image, url);
    }
}


// TODO: tell wordpress to give more items per page
// limited to 10 right now
// "filter[posts_per_page]":100
function QuarkyHomeService($http, $log) {
    this.loadBlogs = function(pagenum) {
        var params = {
            "filter[category_name]":"Home",
            "filter[posts_per_page]": 6, // 6 results per page
            "page": pagenum
        };
        //console.log(params);
        var quarkyHome = HOME_ARTICLE_API;

        return ($http.get(quarkyHome, {
            params: params
        }));
    }
}
