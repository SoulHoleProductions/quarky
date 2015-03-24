/**
 * Created by derekbaron on 3/6/15.
 *
 * The controllers and services supporting the eGuru functionality
 * Used to get Wordpress content related to the parent category "eGuru"
 *
 */
var QuarkyGuru = angular.module("quarky.guru", ["ionic"]);

QuarkyGuru.controller("QuarkyGuruCtrl",
    ["$scope", "$sce", "$ionicLoading", "QuarkyGuruService", "$log", QuarkyGuruCtrl]);

QuarkyGuru.service("QuarkyGuruService",
    [ "$http", "$log", QuarkyGuruService ]);

function QuarkyGuruCtrl($scope, $sce, $ionicLoading, QuarkyGuruService, $log) {
    $scope.posts = [];
    $scope.pagenum = null;
    $scope.infiniteLoad = false;
    $scope.viewBlog = function(url) {
        window.open(url, "_blank", "location=no");
    }
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
    $scope.moreBlogs = function() {
        $ionicLoading.show({ template: "Loading..."});
        QuarkyGuruService.loadBlogs($scope.pagenum)
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
}

function QuarkyGuruService($http, $log) {
    this.loadBlogs = function(pagenum) {
        /*if (!page) page = 1;*/
        var params = {
            "filter[category_name]":"eGuru",
            "filter[posts_per_page]": 6, // 6 results per page
            "page": pagenum
        };
        console.log(params);
        var quarkyGuru = "http://quarkyapp.com/wp-json/posts/";

        return ($http.get(quarkyGuru, {
            params: params
        }));
    }
}
