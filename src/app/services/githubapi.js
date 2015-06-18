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
            $http.get(baseURL+'/repos/'+username+'/'+reponame+'/commits?author=combiths&sha='+branchname+ '&client_id=806e681c8e84253e21ee&client_secret=8683fce7615e8304aba4fdb9b0659832659d1cbe').
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