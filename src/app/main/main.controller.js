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
				for(var i = 0; i < data.length; i++){
					var commit = data[i];
					var commitDate = commit.commit.committer.date;
					var previousCommitDate = i + 1 < data.length ? 
										data[i+1].commit.committer.date : null;
					$timeout(function(){
						$scope.user.currentCommits.push({
								'timestamp': commitDate, 
								'hostId':  "Not found",
								'commit':  commit.sha,
								'previousCommitDate': previousCommitDate});
					});
				}
				
				angular.forEach($scope.user.currentCommits, function(currentCommit){
					GithubAPI.getCommit($scope.user.username, $scope.user.currentRepo,
										 currentCommit.commit).then(function(commitInfo){
											
											
					if(commitInfo.hasOwnProperty("files") &&
						commitInfo.files.length > 0){	
						
						// grab first file in commit and retrieve DB host_id
						var filename = $scope.user.currentRepo + '/' + commitInfo.files[0].filename;
						
						$scope.dbClient.history(filename, function(error, revisions){
							var hostID;
							if(error){  
								currentCommit.hostID = error.responseText;
							}
							else if(revisions && revisions.length > 0){			
								for(var i = 0; i < revisions.length; i++){
									var revisionDate = revisions[i].modifiedAt;
									if(revisionDate <= new Date(currentCommit.timestamp) &&
										revisionDate >= new Date(currentCommit.previousCommitDate)){
											currentCommit.hostID = revisions[i]["host_id"];
											break;
										}										
								}								
							}
							else{
								hostId = "Unable to retrieve revision history for commit";
							}
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
