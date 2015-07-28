'use strict';

angular.module('sv', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngResource', 'ui.router', 'ui.bootstrap'])
   .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      });

    //DropboxProvider.config('4nl4o8v9y9wqv1i', 'https://ermaxw.github.io/components/ngDropbox/callback.html');
        
    $urlRouterProvider.otherwise('/');
  })
  .filter('startFrom', function() {
    return function(input, start) {
        start = +start;
		return input.slice(start);		
    };
  });
  
 $(function(){
	$("#gitUser").keyup(function (e) {
		if (e.keyCode == 13) {
			angular.element('#gitUser').scope().usernameChange();
		}
	});
 });
