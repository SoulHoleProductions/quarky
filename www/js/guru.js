/**
 * Created by derekbaron on 3/6/15.
 *
 * The controllers and services supporting the eGuru functionality
 * Used to get Wordpress content related to the parent category "eGuru"
 *
 */
var QuarkyGuru = angular.module("quarky.guru", ["ionic"]);

QuarkyGuru.controller("QuarkyGuruCtrl",
    ["$scope", "$sce", "$ionicLoading", "QuarkyGuruService", "$log", "$ionicModal", "$cordovaSocialSharing", QuarkyGuruCtrl]);

QuarkyGuru.service("QuarkyGuruService",
    [ "$http", "$log", QuarkyGuruService ]);

function QuarkyGuruCtrl($scope, $sce, $ionicLoading, QuarkyGuruService, $log, $ionicModal, $cordovaSocialSharing) {
    $scope.posts = [];
    $scope.pagenum = null;
    $scope.infiniteLoad = false;

    $scope.shareNative = function() {
        $cordovaSocialSharing.share(
            "This is your message",
            "This is your subject",
            "www/imagefile.png",
            "http://quarkyapp.com"
        );
    }

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

    // Load the modal from the given template URL
    $ionicModal.fromTemplateUrl('templates/guru-card.html', function($ionicModal) {
        $scope.modal = $ionicModal;
    }, {
        // Use our scope for the scope of the modal to keep it simple
        scope: $scope,
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'
    });
    $scope.openModal = function(aPost) {
        $scope.aPost = aPost;
        $scope.modal.show()
    }

    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });
}

function QuarkyGuruService($http, $log) {
    this.loadBlogs = function(pagenum) {
        /*if (!page) page = 1;*/
        var params = {
            "filter[category_name]":"eGuru",
            "filter[posts_per_page]": 6, // 6 results per page
            "page": pagenum
        };
        //console.log(params);
        var quarkyGuru = "http://quarkyapp.com/wp-json/posts/";

        return ($http.get(quarkyGuru, {
            params: params
        }));
    }
}
