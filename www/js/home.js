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
    ["$scope", "$sce", "$ionicLoading", "QuarkyHomeService", "$log", QuarkyHomeCtrl]);

QuarkyHome.service("QuarkyHomeService",
    [ "$http", "$log", QuarkyHomeService ]);

function QuarkyHomeCtrl($scope, $sce, $ionicLoading, QuarkyHomeService, $log) {
    $scope.posts = [];

    $scope.loadBlogs = function() {
        $ionicLoading.show({ template: "Loading..."});
        QuarkyHomeService.loadBlogs()
            .success(function(result) {
                //console.log(result);
                $scope.posts = $scope.posts.concat(result);
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
}

function QuarkyHomeService($http, $log) {
    this.loadBlogs = function() {
        var params = {
            "filter[category_name]":"Home"
        };
        //console.log(params);
        var quarkyHome = "http://quarkyapp.com/wp-json/posts/";

        return ($http.get(quarkyHome, {
            params: params
        }));
    }
}
