var zfm = angular
	.module("zfmClient", ['ngSanitize', 'ngCookies', 'ngDialog']);

zfm.controller('zfmController', function($window, $cookieStore, $scope, $http, ngDialog) {
	$scope.url = "zfmsvr.php";
	
	$scope.idxCurBM = 0;
	$scope.rlDir = ".";
	$scope.dstDir = "";
	
	/**
	 * from local
	 */
	$scope.openDialog = function(template) {
		ngDialog.open({
			template: template,
			showClose: false
		});
	};
	
	$scope.openPage = function(template) {
		ngDialog.open({
			template: template,
			showClose: false,
			overlay: false,
			closeByEscape: false
		});
	};
	
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
		if (rtn_dir == "./.") return ".";
		return rtn_dir;
	}
		
	$scope.dirClick = function(dir, row) {
		if (row.type === "dir") {
			$scope.dstDir = row.name;
			if (row.name == "..") {
				if ($scope.rlDir == ".") {
					$scope.openDialog('ngDialogTemplateWarning');
					return false;
				}
			}
			$scope.askFor("list");
		}
		return true;
	}
	
	$scope.bmClick = function(idxBM) {
		$scope.idxCurBM = idxBM;
		$scope.rlDir = ($scope.dstDir = ".");
		$scope.askFor("list");
		return true;
	}
	
	$scope.uploadClick = function() {
		$scope.openDialog("ngDialogTemplateWarning");
		return false;
	}
	
	/**
	 * to server
	 */
	$scope.askFor = function(rq) {
		$http.post($scope.url, {
			"rq" : rq,
			"bm" : $scope.idxCurBM,
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
							if (list[row]["name"] == "..") {
								list[row]["file"] = '<a href="#' + (date.getMilliseconds() + row) + '"><i class="fa fa-level-up"></i> [' + list[row]["name"] + ']</a>';
							} else {
								list[row]["file"] = '<a href="#' + (date.getMilliseconds() + row) + '"><i class="fa fa-folder"></i> [' + list[row]["name"] + ']</a>';
							}
						} else if (list[row]["type"] == "file") {
							list[row]["file"] = '<i class="fa fa-file-o"></i> ' + list[row]["name"];
						} else if (list[row]["type"] == "link") {
							list[row]["file"] = '<i class="fa fa-link"></i> ' + list[row]["name"];
						}
					}
					$scope.list = $scope.sortJson(list, "type_name", true);
					if ($scope.dstDir != "") {
						$scope.rlDir = $scope.rlDir + "/" + $scope.dstDir;
					}
					$scope.rlDir = $scope.shrinkRlDir();
					break;
				case 'dirs':
					var dirs = data.dirs;
					for (var i in dirs) {
						dirs[i]["alias"] = 
							'<a href="#"><span class="fa fa-bookmark-o"> ' 
							+ dirs[i]["alias"] + '</span></a>';
						dirs[i]["idx"] = i;
					}
					$scope.dirs = dirs;
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
	
	$scope.leave = function() {
		$cookieStore.remove("username");
		$window.location.href = "sign-in.html";
	}
	/**
	 * verified if sign in approved
	 */
	$scope.username = $cookieStore.get("username");
	if (angular.isUndefined($scope.username) || $scope.username == "") {
		$window.location.href = "sign-in.html";
		return;
	} else {
		$scope.rq = "dirs";
		$scope.ask();
		$scope.rq = "list";
		$scope.ask();
	}
});
