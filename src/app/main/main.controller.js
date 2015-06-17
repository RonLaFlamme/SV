'use strict';

angular.module('sv')
  .controller('MainCtrl', function ($scope, $timeout, GithubAPI) {
	
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
	$scope.$watch("user.currentBranch", function(newVal){
		if (newVal){
			branchChanged();
		}
	});

    var branchChanged = function(){
        GithubAPI.getCommits($scope.user.username, $scope.user.currentRepo, $scope.user.currentBranch).then(function(data){
            $scope.user.currentCommits = [];
			
			// set log filename to most recent commit date
			if(data && data.length > 0){
				$scope.dbFilename="SV_" + data[0].commit.committer.date + ".log";
			}
			
			if($scope.dbClient.isAuthenticated()){				
				angular.forEach(data, function(commit, key){
					GithubAPI.getCommit($scope.user.username, $scope.user.currentRepo,
										 commit.sha).then(function(commitInfo){
											 
					if(commitInfo.hasOwnProperty("files") &&
						commitInfo.files.length > 0){	
						
						// grab first file in commit and retrieve DB host_id
						var filename = $scope.user.currentRepo + '/' + commitInfo.files[0].filename;
						
						$scope.dbClient.history(filename, function(error, revisions){
							var hostID;
							if(error){
								hostID = error.responseText;
							}
							else{
								hostID = revisions[0]["host_id"];
							}
							
							$timeout(function(){
								$scope.user.currentCommits.push({
								'timestamp': commit.commit.committer.date, 
								'hostId':  hostID,
								'commit': commit.sha});
							});
							
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
		
		if($scope.dbClient.isAuthenticated()){
			var filename = $scope.dbFilename ? $scope.dbFilename : Date() + ".log";
			filename = filename.replace(/:/g, "_").replace(/Z/g, "");
			$scope.dbClient.writeFile("sv_log/" + filename, 
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
  });
