'use strict';

angular.module('topProgrammingBlogsApp')
  .controller('MainCtrl', function ($scope, $http, $firebaseObject, $firebaseArray) {
  
    var ref = new Firebase("https://top-programming.firebaseio.com/"); // Instantiate the Firebase service with the new operator.

    // download the data into a local object
    $scope.data = $firebaseObject(ref);

    // create a synchronized array
    $scope.blogs = $firebaseArray(ref);

    // synchronize the object with a three-way data binding
    //syncObject.$bindTo($scope, "data");
    
    // Facebook login
    var ref = new Firebase("https://top-programming.firebaseio.com/");
    ref.authWithOAuthPopup("facebook", function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        console.log("Authenticated successfully with payload:", authData);
        $scope.currentUid = authData.uid;
        $scope.userName = authData.facebook.displayName;
      }
    });
  
    // encode64() was written by Tyler Akins and has been placed in the
    // public domain.  It would be nice if you left this header intact.
    // Base64 code from Tyler Akins -- http://rumkin.com
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  
    function encode64(input) {
	var output = "";
	var chr1, chr2, chr3;
	var enc1, enc2, enc3, enc4;
	var i = 0;

	while (i < input.length) {
		chr1 = input.charCodeAt(i++);
		chr2 = input.charCodeAt(i++);
		chr3 = input.charCodeAt(i++);

		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;

		if (isNaN(chr2)) {
			enc3 = enc4 = 64;
		} else if (isNaN(chr3)) {
			enc4 = 64;
		}

		output += (keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4));
   }
   
   return output.toString();
    }  
  
    // Encode signature
    var accessId = "mozscape-07bc82a137";
    var secretKey = "cd446f269d9e9192dbf0220a549e8001";
    var apiExpires = moment().unix() + 300;
    console.log(apiExpires);
    
    //var stringToSign = accessId+"<br>"+apiExpires;
    var message = accessId + "\n" + apiExpires;
  
    //hmac sha1 hash
    //var hash = CryptoJS.SHA1(stringToSign,secretKey);
    var hmacString = Crypto.HMAC(Crypto.SHA1, message, secretKey, { asString: true });
    //console.log(hash);
    
    //urlencode and 64bit encode
    //var signatureEncoded = encodeURIComponent(btoa(hash));
    var signature = encode64(hmacString);
    //console.log(signatureEncoded);
    console.log(signature);
    
  
    // Mozscape API
    mozUri = 'http://lsapi.seomoz.com/linkscape/url-metrics/moz.com%2fblog?Cols=34359754788&AccessID=mozscape-07bc82a137&Expires='+apiExpires+'&Signature='+signature
    $http.jsonp(mozUri)
      .success(function(siteData) {
        console.log('success', siteData);
        $scope.siteData = siteData;
      })
      .error(function(err) {
        console.log(err);
      })
    
    // this will never print antying sicne siteData at this point is still nil.  It has not been set
    // by the success callback.
    console.log($scope.siteData);

  
    // W3Schools API
    $http.get("http://www.w3schools.com/angular/customers.php")
  .success(function (response) {$scope.names = response.records;});

    // Twitter API
    $http.jsonp('https://api.twitter.com/1.1/followers/list.json?cursor=-1&screen_name=twitterdev&skip_status=true&include_user_entities=false?callback=JSON_CALLBACK')
    .success(function(tweets){
        $scope.twitterFollowers = tweets;
    });
  
    // Racers API  
    $http.get('http://ergast.com/api/f1/2013/driverStandings.json')
    .success(function(racers){
        $scope.racerNames = racers;
    });
    
  
    console.log($scope.awesomeThings);
  
    $scope.addBlog = function() { 
      var getBlog = $scope.newContent;
      var getUrl = $scope.newUrl;
      var newBlog = {
        name: getBlog,
        url: getUrl, 
        pageauthority: 50, 
        linkingsites: 25,
        mozrank: 3,
        pagerank: 5,
        votes: [1],
        latestarticle: "Why Inline CSS Must Die in 2015 or Be Replaced With a New Method"
      };

      $scope.blogs.$add(newBlog);
      $scope.blogs.$save(newBlog); 
    }
    
    $scope.addVote = function(number) {
      if($scope.blogs[number].votes.indexOf($scope.currentUid) < 0) {
        var blog = $scope.blogs[number];
        blog.votes.push($scope.currentUid);
        $scope.blogs.$save(blog);
      }
      else {
        alert("Sorry! You've already voted for this blog.");
      }
    }
    
    
    /*$http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
    }); 
    */

  });
