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
  });
  
var loginClicked = function(){
	if(!$scope.dbClient.isAuthenticated()){
		$scope.dbClient.authDriver(new Dropbox.AuthDriver.Popup({ receiverUrl:  'https://ronlaflamme.github.io/sv/oauth_receiver.html' }));
		$scope.dbClient.authenticate(function(authError){
		if(authError || !$scope.dbClient.isAuthenticated()){
			alert("Cannot login to Dropbox!");
		}});
	}     
};
