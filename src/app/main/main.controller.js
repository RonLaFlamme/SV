'use strict';

angular.module('sv')
  .controller('MainCtrl', function ($scope, GithubAPI) {
	
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
			//angular.forEach(data, function(commit){
            for(int i = 0; i < data.length; i++){
				if(i > 3){break;}
				var commit = data[i];
				GithubAPI.getCommit($scope.user.username, $scope.user.currentRepo,
									 commit.sha).then(function(commitInfo){
										 
				if(commitInfo.hasOwnProperty("files") &&
					commitInfo.files.length > 0){	
					
					var filename = $scope.user.currentRepo + '/' + commitInfo.files[0].filename;
					
					if(dbClient.isAuthenticated()){
						dbClient.history(filename, function(error, revisions){
							var modified;
							if(error){
								modified = error;
							}
							else{
								modified = revisions[0]["host_id"];
							}
							
							$scope.user.currentCommits.push({
								'timestamp': commit.commit.committer.date, 
								'hostId':  modified,
								'commit': commit.sha});
							
						});
					}
				}
				});
			}//);
		});
    }
		
	$scope.saveToDropboxClick = function(){
		//create byte stream
		angular.forEach($scope.user.currentCommits, function(commit){
			//add to byte stream
		});
		
		//store to Dropbox
		/*client.writeFile("hello_world.txt", "Hello, world!\n", function(error, stat) {
		if (error) {
			return showError(error);  // Something went wrong.
		}
		  alert("File saved as revision " + stat.versionTag);
		});*/
	}
  });
