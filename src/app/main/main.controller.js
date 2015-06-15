'use strict';

angular.module('sv')
  .controller('MainCtrl', function ($scope, GithubAPI) {

    var client = new Dropbox.Client({ key: '4nl4o8v9y9wqv1i' });
    client.authDriver(new Dropbox.AuthDriver.Popup({ receiverUrl:  'https://ermaxw.github.io/sv/oauth_receiver.html' }));
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

                client.stat('/', function(error, stat, result) {
                        console.log(error);
                        alert(stat);
                    }
                );
                $scope.user.currentCommits.push({'timestamp': commit.commit.committer.date , 'mac': mac, 'ip': ip, 'commit': commit.sha});
            });
        });
    }
  });
