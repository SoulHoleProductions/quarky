'use strict';

// used in views to dynamically update the headers

angular.module('quarky.filters', []).filter('nicetitle', function() {
  return function(input) {
	input = input.replace(/_/g," ");
	//credit: http://stackoverflow.com/a/196991/52160
	return input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  };
});
