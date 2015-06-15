'use strict';

angular.module('sv', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngResource', 'ui.router', 'ui.bootstrap'])
  .config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      });

    //DropboxProvider.config('4nl4o8v9y9wqv1i', 'https://ermaxw.github.io/components/ngDropbox/callback.html');
        
    $urlRouterProvider.otherwise('/');
  }])
;

'use strict';

angular.module('sv')
  .controller('NavbarCtrl', ["$scope", function ($scope) {
    $scope.date = new Date();
  }]);

(function (){
    angular.module('sv').factory('GithubAPI', GithubAPI);
    GithubAPI.$inject = ['$http', '$q'];
    function GithubAPI($http, $q){
        var baseURL = 'https://api.github.com';
        var getRepos = function(username)
        {
            var deferred = $q.defer();
            $http.get(baseURL+'/users/'+username+'/repos').
                success(function (data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function (data, status, headers, config) {
                    deferred.resolve({'error': 'Could not make request'});
                });
            return deferred.promise;
        }

        var getBranches = function(username, reponame)
        {
            var deferred = $q.defer();
            $http.get(baseURL+'/repos/'+username+'/'+reponame+'/branches').
                success(function (data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function (data, status, headers, config) {
                    deferred.resolve({'error': 'Could not make request'});
                });
            return deferred.promise;
        }

        var getCommits = function(username, reponame, branchname)
        {
            var deferred = $q.defer();
            $http.get(baseURL+'/repos/'+username+'/'+reponame+'/commits?author='+username+'&sha='+branchname).
                success(function (data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function (data, status, headers, config) {
                    deferred.resolve({'error': 'Could not make request'});
                });
            return deferred.promise;
        }
        
        return {
            getRepos: getRepos,
            getBranches: getBranches,
            getCommits: getCommits
            
        };
    }
})();
'use strict';

angular.module('sv')
  .controller('MainCtrl', ["$scope", "GithubAPI", function ($scope, GithubAPI) {
	
    $scope.user = {'username': '', 'repos':[], 'branches':[], 'currentRepo':'', 'currentBranch': 'master', 'currentCommits':[]}
    $scope.usernameChange = function(){
        GithubAPI.getRepos($scope.user.username).then(function(data){
            $scope.user.repos = [];
            angular.forEach(data, function(repo){
                $scope.user.repos.push(repo.full_name.split("/").pop());
            });
        });
    }
    
    $scope.repoChanged = function(){
        $scope.user.branches = [];
        GithubAPI.getBranches($scope.user.username, $scope.user.currentRepo).then(function(data){
            angular.forEach(data, function(branch){
                $scope.user.branches.push(branch.name);
            });
        });
    }


    $scope.branchChanged = function(){
        GithubAPI.getCommits($scope.user.username, $scope.user.currentRepo, $scope.user.currentBranch).then(function(data){
            $scope.user.currentCommits = [];
            
			//var dbClient = new Dropbox.Client({ key: 'ul8h8jpx9o164n1'});
			var dbClient = new Dropbox.Client({ key: '4nl4o8v9y9wqv1i' });
			dbClient.authDriver(new Dropbox.AuthDriver.Popup({ receiverUrl:  'https://ronlaflamme.github.io/sv/oauth_receiver.html' }));
			dbClient.authenticate(function(authError){
				if(authError || !dbClient.isAuthenticated()){
					alert("Cannot login to Dropbox!");
				}
			});
				
            angular.forEach(data, function(commit){
                var commits = commit.commit.message.split(':');
				if(dbClient.isAuthenticated()){
					dbClient.revisions("sv/bower.json", function(error, revisions){
						var modified;
						if(error){
							modified = error;
						}
						else{
							modified = revisions[0].modifiedAt;
						}
						
						$scope.user.currentCommits.push({
							'timestamp': commit.commit.committer.date, 
							'dbTimestamp':  modified,
							'commit': commit.sha});
						
					});
				}
			});
		});
    }
		
	$scope.saveToDropboxClick = function(){
		//create byte stream
		angular.forEach($scope.user.currentCommits, function(commit){
			//add to byte stream
		});
		
		//store to Dropbox
		
	}
  }]);

angular.module("sv").run(["$templateCache", function($templateCache) {$templateCache.put("app/main/main.html","<div class=\"container\"><div ng-include=\"\'app/components/navbar/navbar.html\'\"></div><div class=\"jumbotron text-center\"><h1>LaFlamme\'s Github</h1><p class=\"lead\">Commit Audit Log</p><input type=\"text\" ng-model=\"user.username\" placeholder=\"user name\"> <input type=\"button\" ng-click=\"usernameChange()\" value=\"Fetch Repos\"><select ng-change=\"repoChanged()\" ng-model=\"user.currentRepo\" ng-options=\"o as o for o in user.repos\"></select><select ng-change=\"branchChanged()\" ng-model=\"user.currentBranch\" ng-options=\"o as o for o in user.branches\"></select></div><div class=\"row\"><table class=\"table table-condensed table-striped table-condensed\"><thead><tr><th>Time Stamp</th><th>Host ID</th><th>Commit</th></tr></thead><tbody><tr ng-repeat=\"commit in user.currentCommits track by $index\"><td>{{commit.timestamp}}</td><td>{{commit.dbTimestamp}}</td><td><a ng-href=\"#\">{{commit.commit}}</a></td></tr></tbody></table></div><div><input type=\"button\" ng-click=\"saveToDropboxClick()\" value=\"Save to Dropbox\"></div></div>");
$templateCache.put("app/components/navbar/navbar.html","<nav class=\"navbar navbar-static-top navbar-inverse\" ng-controller=\"NavbarCtrl\"><div class=\"container-fluid\"><div class=\"navbar-header\"><a class=\"navbar-brand\" href=\"/\"><span class=\"glyphicon glyphicon-home\"></span> SV</a></div><div class=\"collapse navbar-collapse\" id=\"bs-example-navbar-collapse-6\"><ul class=\"nav navbar-nav\"><li class=\"active\"><a ng-href=\"#\">Home</a></li><li><a ng-href=\"#\">About</a></li><li><a ng-href=\"#\">Contact</a></li></ul><ul class=\"nav navbar-nav navbar-right\"><li>Current date: {{ date | date:\'yyyy-MM-dd\' }}</li></ul></div></div></nav>");}]);