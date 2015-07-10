var zfm = angular.module("zfmClient", ['ngSanitize']);
zfm.controller('zfmController', ['$scope', '$http', function($scope, $http) {
	$scope.url = "zfmsvr.php";
	
	$scope.rlDir = ".";
	$scope.dstDir = "";
	
	/**
	 * from local
	 */
	$scope.sortJson = function(json, key, asc) {
		return json.sort(function(a, b) {
			var x = a[key]; var y = b[key];
			if (asc == true) {
				return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			} else {
				return ((x > y) ? -1 : ((x < y) ? 1 : 0));
			}
		});
	}
	
	$scope.shrinkRlDir = function() {
		var dirs = $scope.rlDir.split("/");
		for (var i = 0; i < dirs.length; i++) {
			if (dirs[i] == "..") {
				if (i > 1) {
					dirs.splice(i - 1, 2);
					i -= 2;
				}
			}
		}
		var rtn_dir = "";
		for (var i = 0; i < dirs.length; i++) {
			rtn_dir += (dirs[i]);
			if (i+1 != dirs.length) {
				rtn_dir += "/";
			}
		}
		return rtn_dir;
	}
		
	$scope.dirClick = function(dir, row) {
		if (row.type === "dir") {
			$scope.dstDir = row.name;
			if (row.name == "..") {
				if ($scope.rlDir == ".") {
					alert("not allowed!");
					return false;
				}
			}
			$scope.askFor("list");
		}
		return true;
	}
	
	/**
	 * to server
	 */
	$scope.askFor = function(rq) {
		$http.post($scope.url, {
			"rq" : rq,
			"dir" : $scope.rlDir + "/" + $scope.dstDir
		})
		.success(function(data, status) {
			$scope.answers = data;
			for (var key in data) {
				switch (key) {
				case 'list':
					var list = data.list;
					for (var row in list) {
						var date = new Date();
						if (list[row]["type"] == "dir") {
							list[row]["file"] = '<a href="#' + (date.getMilliseconds() + row) + '">[' + list[row]["name"] + ']</a>';
						}
					}
					$scope.list = $scope.sortJson(list, "type_name", true);
					if ($scope.dstDir != "") {
						$scope.rlDir = $scope.rlDir + "/" + $scope.dstDir;
					}
					$scope.rlDir = $scope.shrinkRlDir();
					break;
				}
				break;
			}
		})
		.error(function(data, status) {
			$scope.answers = data || "failed";
			for (var key in data) {
				switch (key) {
				case 'list':
					$scope.list = data.list || "failed";
					break;
				}
				break;
			}
		});
	}
	
	$scope.ask = function() {
		$scope.askFor($scope.rq);
		$scope.rq = "";
	}
	
	$scope.rq = "list";
	$scope.ask();
}]);
