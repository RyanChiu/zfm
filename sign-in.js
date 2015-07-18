var sin = angular.module("sinClient", ['ngSanitize', 'ngCookies']);
sin.controller("sinController", function($window, $cookieStore, $scope, $http) {
	$scope.url = "entrance.php";
	
	$cookieStore.remove("username");
	$cookieStore.remove("password");
	
	$scope.signMeIn = function() {
		$http.post($scope.url, {
			"username" : $scope.username,
			"password" : hex_md5($scope.password)
		})
		.success(function(data, status) {
			if (data.approved) {
				$cookieStore.put("username", $scope.username);
				$window.location.href = "index.html";
			} else {
				
			}
			$scope.result = data.msg;
		})
		.error(function(data, status) {
			$scope.result = data;
			$scope.status = status;
		});
	}
});