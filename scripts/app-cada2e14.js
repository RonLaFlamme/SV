'use strict';

angular.module('sv', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 
						'ngResource', 'ui.router', 'ui.bootstrap', 'dropbox'])
  .config(["$stateProvider", "$urlRouterProvider", "DropboxProvider", function ($stateProvider, $urlRouterProvider, DropboxProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      });

    DropboxProvider.config('i2nozuhaiuos08j', 'https://ronlaflamme.github.io/components/ngDropbox/callback.html');
     
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
  .controller('MainCtrl', ["$scope", "GithubAPI", "Dropbox", function ($scope, GithubAPI, Dropbox) {
	console.log(Dropbox.stat("sv"));
    /*var client = new Dropbox.Client({ key: '4nl4o8v9y9wqv1i' });
    client.authDriver(new Dropbox.AuthDriver.Popup({ receiverUrl:  'https://ronlaflamme.github.io/sv/oauth_receiver.html' }));
    client.authenticate({ interactive: true });
    if (client.isAuthenticated()) {
        // If we're authenticated, update the UI to reflect the logged in status.
    } else {
        // Otherwise show the login button.
        $('#login').show();
    }

    client.getAccountInfo(function(error, accountInfo) {
        if (error) {
            console.log(error);
            //return showError(error);  // Something went wrong.
        }

        alert("Hello, " + accountInfo.name + "!");
    });
*/
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
            //"This is my test change for commit : 192.168.1.134\n\n: f8:16:54:7d:94:75",

            angular.forEach(data, function(commit){
                var commits = commit.commit.message.split(':');
                var ip = '';
                var mac = '';
                if(commits[1]){
                    ip = commits[1].replace(/(\r\n|\n|\r)/gm,"");
                }
                if(commits[2]){
                    mac = commit.commit.message.split(':').slice(2).join(':');
                }

                /*client.stat('/', function(error, stat, result) {
                        console.log(error);
                        //alert(stat);
                    }
                );*/
				
                $scope.user.currentCommits.push({'timestamp': commit.commit.committer.date , 'mac': mac, 'ip': ip, 'commit': commit.sha});
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

angular.module("sv").run(["$templateCache", function($templateCache) {$templateCache.put("app/main/main.html","<div class=\"container\"><div ng-include=\"\'app/components/navbar/navbar.html\'\"></div><div class=\"jumbotron text-center\"><h1>LaFlamme\'s Github</h1><p class=\"lead\">Commit Audit Log</p><input type=\"text\" ng-model=\"user.username\" placeholder=\"user name\"> <input type=\"button\" ng-click=\"usernameChange()\" value=\"Fetch Repos\"><select ng-change=\"repoChanged()\" ng-model=\"user.currentRepo\" ng-options=\"o as o for o in user.repos\"></select><select ng-change=\"branchChanged()\" ng-model=\"user.currentBranch\" ng-options=\"o as o for o in user.branches\"></select></div><div class=\"row\"><table class=\"table table-condensed table-striped table-condensed\"><thead><tr><th>Time Stamp</th><th>Host ID</th><th>Commit</th></tr></thead><tbody><tr ng-repeat=\"commit in user.currentCommits track by $index\"><td>{{commit.timestamp}}</td><td>empty</td><td><a ng-href=\"#\">{{commit.commit}}</a></td></tr></tbody></table></div><div><input type=\"button\" ng-click=\"saveToDropboxClick()\" value=\"Save to Dropbox\"></div></div>");
$templateCache.put("app/components/navbar/navbar.html","<nav class=\"navbar navbar-static-top navbar-inverse\" ng-controller=\"NavbarCtrl\"><div class=\"container-fluid\"><div class=\"navbar-header\"><a class=\"navbar-brand\" href=\"/\"><span class=\"glyphicon glyphicon-home\"></span> SV</a></div><div class=\"collapse navbar-collapse\" id=\"bs-example-navbar-collapse-6\"><ul class=\"nav navbar-nav\"><li class=\"active\"><a ng-href=\"#\">Home</a></li><li><a ng-href=\"#\">About</a></li><li><a ng-href=\"#\">Contact</a></li></ul><ul class=\"nav navbar-nav navbar-right\"><li>Current date: {{ date | date:\'yyyy-MM-dd\' }}</li></ul></div></div></nav>");}]);