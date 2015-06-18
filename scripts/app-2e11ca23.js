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
            $http.get(baseURL+'/users/'+username+'/repos?client_id=806e681c8e84253e21ee&client_secret=8683fce7615e8304aba4fdb9b0659832659d1cbe').
                success(function (data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function (data, status, headers, config) {
                    deferred.resolve({'error': 'Could not make request'});
                });
            return deferred.promise;
        };

        var getBranches = function(username, reponame)
        {
            var deferred = $q.defer();
            $http.get(baseURL+'/repos/'+username+'/'+reponame+'/branches?client_id=806e681c8e84253e21ee&client_secret=8683fce7615e8304aba4fdb9b0659832659d1cbe').
                success(function (data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function (data, status, headers, config) {
                    deferred.resolve({'error': 'Could not make request'});
                });
            return deferred.promise;
        };

        var getCommits = function(username, reponame, branchname)
        {
            var deferred = $q.defer();
            $http.get(baseURL+'/repos/'+username+'/'+reponame+'/commits?author='+username+'&sha='+branchname+ '&client_id=806e681c8e84253e21ee&client_secret=8683fce7615e8304aba4fdb9b0659832659d1cbe').
                success(function (data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function (data, status, headers, config) {
                    deferred.resolve({'error': 'Could not make request'});
                });  
            return deferred.promise;
        };
		
		var getCommit = function(username, reponame, commitId){
			var deferred = $q.defer();
            $http.get(baseURL+'/repos/'+username+'/'+reponame+'/commits/'+commitId+'?client_id=806e681c8e84253e21ee&client_secret=8683fce7615e8304aba4fdb9b0659832659d1cbe').
                success(function (data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function (data, status, headers, config) {
                    deferred.resolve({'error': 'Could not make request'});
                });
            return deferred.promise;
		};
        
        return {
            getRepos: getRepos,
            getBranches: getBranches,
            getCommits: getCommits,
            getCommit: getCommit
        };
    }
})();
'use strict';

angular.module('sv')
  .controller('MainCtrl', ["$scope", "$timeout", "GithubAPI", function ($scope, $timeout, GithubAPI) {
	
    $scope.user = {'username': '', 'repos':[], 'branches':[], 'currentRepo':'', 'currentBranch': '', 'currentCommits':[]}
    
	//var dbClient = new Dropbox.Client({ key: 'ul8h8jpx9o164n1'});
	if(!$scope.dbClient){
		$scope.dbClient = new Dropbox.Client({ key: '4nl4o8v9y9wqv1i' });
	}
	
	if(!$scope.dbClient.isAuthenticated()){
		$scope.dbClient.authDriver(new Dropbox.AuthDriver.Popup({ receiverUrl:  'https://ronlaflamme.github.io/sv/oauth_receiver.html' }));
		$scope.dbClient.authenticate(function(authError){
		if(authError || !$scope.dbClient.isAuthenticated()){
			alert("Cannot login to Dropbox!");
		}});
	}     
	
	$scope.usernameChange = function(){		
		$scope.user.branches = [];
		$scope.user.repos = [];
		$scope.user.currentRepo = '';
		$scope.user.currentBranch = '';
		$scope.user.currentCommits = [];
		
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
			$scope.user.currentBranch = 'master';
        });
    }
	/*$scope.$watch("user.currentBranch", function(newVal){
		if (newVal){
			branchChanged();
		}
	});*/

    var branchChanged = function(){
        GithubAPI.getCommits($scope.user.username, $scope.user.currentRepo, $scope.user.currentBranch).then(function(data){
            $scope.user.currentCommits = [];
			
			// set log filename to most recent commit date
			if(data && data.length > 0){  
				$scope.dbFilename=$scope.user.currentRepo+ "_" + data[0].commit.committer.date + ".log";
			}
			
			if($scope.dbClient.isAuthenticated()){				
				for(var i = 0; i < data.length; i++){
					var commit = data[i];
					var commitDate = commit.commit.committer.date;
					var previousCommitDate = i + 1 < data.length ? 
										data[i+1].commit.committer.date : null;
					
					$scope.user.currentCommits.push({
							'timestamp': commitDate, 
							'hostId':  "Updating...",
							'commit':  commit.sha,
							'previousCommitDate': previousCommitDate});
					
				}
				
				angular.forEach($scope.user.currentCommits, function(currentCommit){
					GithubAPI.getCommit($scope.user.username, $scope.user.currentRepo,
										 currentCommit.commit).then(function(commitInfo){
											
											
					if(commitInfo.hasOwnProperty("files") &&
						commitInfo.files.length > 0){	
						
						// grab first file in commit and retrieve DB host_id
						var filename = $scope.user.currentRepo + '/' + commitInfo.files[0].filename;
						
						$scope.dbClient.history(filename, function(error, revisions){
							if(error){  
								currentCommit.hostID = error.responseText;
							}
							else if(revisions && revisions.length > 0){		
								currentCommit.hostId = "Not found";				
								for(var i = 0; i < revisions.length; i++){
									var revisionDate = revisions[i].modifiedAt;
									if(revisionDate <= new Date(currentCommit.timestamp) &&
										revisionDate >= new Date(currentCommit.previousCommitDate)){
										currentCommit.hostId = revisions[i]["host_id"];
										break;
									}										
								}								
							}
							else{
								currentCommit.hostId = "Not available";
							}
							
							delete currentCommit.previousCommitDate;
						});
					}
					});
				});
			}	
		});
    }
		
	$scope.saveToDropboxClick = function(){
		
		if(!$scope.dbClient){
			$scope.dbClient = new Dropbox.Client({ key: '4nl4o8v9y9wqv1i' });
		}
			
		if(!$scope.dbClient.isAuthenticated()){
			$scope.dbClient.authDriver(new Dropbox.AuthDriver.Popup({ receiverUrl:  'https://ronlaflamme.github.io/sv/oauth_receiver.html' }));
			$scope.dbClient.authenticate(function(authError){
			if(authError || !$scope.dbClient.isAuthenticated()){
				alert("Cannot login to Dropbox!");
			}});
		}
		//test
		if($scope.dbClient.isAuthenticated()){
			var filename = $scope.dbFilename ? $scope.dbFilename : Date() + ".log";
			filename = filename.replace(/:/g, "_").replace(/Z/g, "");
			$scope.dbClient.writeFile($scope.user.currentRepo + "_log/" + filename, 
				JSON.stringify($scope.user.currentCommits), 
				function(error, stat) {
				if (error) {
					alert(error);
				}
				else{ 
					alert("File saved");
				}
			});
		}
	};
  }]);

angular.module("sv").run(["$templateCache", function($templateCache) {$templateCache.put("app/main/main.html","<div class=\"container\"><div ng-include=\"\'app/components/navbar/navbar.html\'\"></div><div class=\"jumbotron text-center\"><h1>LaFlamme\'s Github</h1><p class=\"lead\">Commit Audit Log</p><input type=\"text\" ng-model=\"user.username\" placeholder=\"user name\"> <input type=\"button\" ng-click=\"usernameChange()\" value=\"Fetch Repos\"><select ng-change=\"repoChanged()\" ng-model=\"user.currentRepo\" ng-options=\"o as o for o in user.repos\"></select><select ng-change=\"branchChanged()\" ng-model=\"user.currentBranch\" ng-options=\"o as o for o in user.branches\"></select></div><div class=\"row\"><table class=\"table table-condensed table-striped table-condensed\"><thead><tr><th>Time Stamp</th><th>Host ID</th><th>Commit</th></tr></thead><tbody><tr ng-repeat=\"commit in user.currentCommits track by $index\"><td>{{commit.timestamp}}</td><td>{{commit.hostId}}</td><td>{{commit.commit}}</td></tr></tbody></table></div><div><input type=\"button\" ng-click=\"saveToDropboxClick()\" value=\"Save to Dropbox\"></div></div>");
$templateCache.put("app/components/navbar/navbar.html","<nav class=\"navbar navbar-static-top navbar-inverse\" ng-controller=\"NavbarCtrl\"><div class=\"container-fluid\"><div class=\"navbar-header\"><a class=\"navbar-brand\" href=\"/\"><span class=\"glyphicon glyphicon-home\"></span> SV</a></div><div class=\"collapse navbar-collapse\" id=\"bs-example-navbar-collapse-6\"><ul class=\"nav navbar-nav\"><li class=\"active\"><a ng-href=\"#\">Home</a></li><li><a ng-href=\"#\">About</a></li><li><a ng-href=\"#\">Contact</a></li></ul><ul class=\"nav navbar-nav navbar-right\"><li>Current date: {{ date | date:\'yyyy-MM-dd\' }}</li></ul></div></div></nav>");}]);