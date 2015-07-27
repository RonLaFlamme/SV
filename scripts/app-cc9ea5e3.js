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
  }]);

/*svApp.filter('startFrom', function() {
    return function(input, start) {
        start = +start;
        return input.slice(start);
    };
});
  */
var loginClicked = function(){
	if(!$scope.dbClient.isAuthenticated()){
		$scope.dbClient.authDriver(new Dropbox.AuthDriver.Popup({ receiverUrl:  'https://ronlaflamme.github.io/sv/oauth_receiver.html' }));
		$scope.dbClient.authenticate(function(authError){
		if(authError || !$scope.dbClient.isAuthenticated()){
			alert("Cannot login to Dropbox!");
		}
		else if($scope.dbClient.isAuthenticated()){
			alert("You're logged in to Dropbox!");
		}});
	}
	
	if($scope.dbClient.isAuthenticated()){
		alert("You're logged in to Dropbox!");
	}
};

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
    $scope.currentPage = 0;
    $scope.pageSize = 10;
	
	//var dbClient = new Dropbox.Client({ key: 'ul8h8jpx9o164n1'});
	if(!$scope.dbClient){
		$scope.dbClient = new Dropbox.Client({ key: '4nl4o8v9y9wqv1i' });
	}
	
	if($scope.dbClient.isAuthenticated()){
		angular.element("loginDropbox").text("Dropbox account linked");	
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
		$scope.user.currentBranch = '';
		$scope.user.currentCommits = [];
		
        GithubAPI.getBranches($scope.user.username, $scope.user.currentRepo).then(function(data){
            angular.forEach(data, function(branch){
                $scope.user.branches.push(branch.name);
            });
			$scope.user.currentBranch = 'master';
        });
    }
	$scope.$watch("user.currentBranch", function(newVal){
		if (newVal){
			branchChanged();
		}
	});

    var branchChanged = function(){
		$scope.user.currentCommits = [];
		$scope.user.initialCommits = [];
		
        GithubAPI.getCommits($scope.user.username, $scope.user.currentRepo, $scope.user.currentBranch).then(function(data){
            			
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
					
					$scope.user.initialCommits.push({
							'timestamp': commitDate, 
							'hostId':  "Updating...",
							'commit':  commit.sha,
							'previousCommitDate': previousCommitDate});
					
				}
				
				angular.forEach($scope.user.initialCommits, function(currentCommit){
					GithubAPI.getCommit($scope.user.username, $scope.user.currentRepo,
										currentCommit.commit).then(function(commitInfo){											
											
					if(commitInfo.hasOwnProperty("files") &&
						commitInfo.files.length > 0){	
						
						// grab first file in commit and retrieve DB host_id
						var filename = $scope.user.currentRepo + '/' + commitInfo.files[0].filename;
						
						$scope.dbClient.history(filename, function(error, revisions){
							if(error){  
								currentCommit.hostId = error.responseText;
							}
							else if(revisions && revisions.length > 0){		
								currentCommit.hostId = "Not found";				
								for(var j = 0; j < revisions.length; j++){
									var revisionDate = revisions[j].modifiedAt;
									if(revisionDate <= new Date(currentCommit.timestamp) &&
										revisionDate >= new Date(currentCommit.previousCommitDate)){
										currentCommit.hostId = revisions[j]["host_id"];										
										break;
									}										
								}								
							}
							else{
								currentCommit.hostId = "Not available";
							}
							$timeout(function(){
							$scope.user.currentCommits.push({
								'timestamp': currentCommit.timestamp, 
								'hostId':  currentCommit.hostId,
								'commit':  currentCommit.commit,
							});		});					
						});
					}
					});
					
				});
			}	
			else{
				alert("Please refresh page to login to Dropbox");
			}
			
		});
    }
		
	$scope.saveToDropboxClick = function(){
		
		if($scope.user.currentBranch){			
				
			if(!$scope.dbClient.isAuthenticated()){
				$scope.dbClient.authDriver(new Dropbox.AuthDriver.Popup({ receiverUrl:  'https://ronlaflamme.github.io/sv/oauth_receiver.html' }));
				$scope.dbClient.authenticate(function(authError){
				if(authError || !$scope.dbClient.isAuthenticated()){
					alert("Cannot login to Dropbox!");
				}});
			}
			
			if($scope.dbClient.isAuthenticated()){
				var filename = $scope.dbFilename ? $scope.dbFilename : Date() + ".log";
				var foldername = $scope.user.currentRepo + "_log/";
				filename = filename.replace(/:/g, "_").replace(/Z/g, "");
				$scope.dbClient.writeFile(foldername + filename, 
					JSON.stringify($scope.user.currentCommits), 
					function(error, stat) {
					if (error) {
						alert(error);
					}
					else{ 
						alert("File saved to " + foldername.replace("/", "") + " in Dropbox.");
					}
				});
			}
		}
		else{
			alert("Please select a branch to save.");
		}
	};
  }]);

angular.module("sv").run(["$templateCache", function($templateCache) {$templateCache.put("app/main/main.html","<div class=\"container\"><div class=\"pyc-section-two\"><div class=\"pyc-section-two-content\"><div class=\"pyc-header-two\">2 Easy Steps</div><div class=\"steps-container\"><div class=\"steps-left\"><img src=\"images/icon-dropbox.jpg\"><br>1. Move your repo into your Dropbox root folder to get an independent stamp of all code change</div><div class=\"steps-right\"><div><a href=\"#\" onclick=\"loginClicked();\" id=\"loginDropbox\" class=\"btn-white\">Click here to link<br>Dropbox account</a></div><p class=\"fine-print\">*Requires desktop <a href=\"https://www.dropbox.com/downloading\">Dropbox client</a> to be installed</p></div><div class=\"clear-fix\"></div></div><div class=\"steps-container-bottom\"><div class=\"steps-left\"><img src=\"images/icon-github.jpg\"><br>2. Publish to GitHub and view your</div><div class=\"steps-right\"><div class=\"form-list\"><ul><li>Enter GitHub ID</li><li><input type=\"text\" ng-model=\"user.username\" placeholder=\"user name\"></li><li><a href=\"#\" class=\"btn-white\" ng-click=\"usernameChange()\">Fetch Repos<a></a></a></li></ul><ul><li>Select Repo</li><li><select ng-change=\"repoChanged()\" ng-model=\"user.currentRepo\" ng-options=\"o as o for o in user.repos\"></select></li></ul><ul><li>Select Branch</li><li><select ng-model=\"user.currentBranch\" ng-options=\"o as o for o in user.branches\"></select></li></ul></div></div><div class=\"clear-fix\"></div></div></div></div><div class=\"pyc-section-three\"><div class=\"pyc-header-three\">Report Results</div><table class=\"report-results\"><tr class=\"table-header\"><td class=\"report-titles\"><img src=\"images/icon-clock.jpg\"><br>Time</td><td class=\"report-titles\"><img src=\"images/icon-computer.jpg\"><br>Computer<br><span class=\"fine-print\">Dropbox Signature</span></td><td class=\"report-titles\"><img src=\"images/icon-closingtag.jpg\"><br>GitHub Commit</td></tr><tr ng-repeat=\"commit in user.currentCommits track by $index | startFrom:currentPage*pageSize | limitTo:pageSize\"><td>{{commit.timestamp | date:\'yyyy-MM-dd HH:mm:ss Z\'}}</td><td>{{commit.hostId}}</td><td>{{commit.commit}}</td></tr></table><div class=\"report-options\"><ul><li><a href=\"#\" ng-click=\"saveToDropboxClick()\" class=\"btn-black\">Save to Dropbox</a></li><li><a href=\"#\" ng-disabled=\"currentPage == 0\" ng-click=\"currentPage=currentPage-1\"><img src=\"images/arrow-left.jpg\"></a></li><li>Pagination {{currentPage+1}}/{{user.currentCommits.length/pageSize}}</li><li><a href=\"#\" ng-disabled=\"currentPage >= user.currentCommits.length/pageSize - 1\" ng-click=\"currentPage=currentPage+1\"><img src=\"images/arrow-right.jpg\"></a></li></ul></div></div></div>");
$templateCache.put("app/components/navbar/navbar.html","<nav class=\"navbar navbar-static-top navbar-inverse\" ng-controller=\"NavbarCtrl\"><div class=\"container-fluid\"><div class=\"navbar-header\"><a class=\"navbar-brand\" href=\"/\"><span class=\"glyphicon glyphicon-home\"></span> SV</a></div><div class=\"collapse navbar-collapse\" id=\"bs-example-navbar-collapse-6\"><ul class=\"nav navbar-nav\"><li class=\"active\"><a ng-href=\"#\">Home</a></li><li><a ng-href=\"#\">About</a></li><li><a ng-href=\"#\">Contact</a></li></ul><ul class=\"nav navbar-nav navbar-right\"><li>Current date: {{ date | date:\'yyyy-MM-dd\' }}</li></ul></div></div></nav>");}]);