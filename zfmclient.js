var zfm = angular
	.module("zfmClient", ['ngSanitize', 'ngCookies', 'ngDialog', 'chart.js']);

zfm.controller('zfmController', function($window, $cookieStore, $scope, $http, ngDialog) {
	$scope.url = "zfmsvr.php";
	
	$scope.idxCurBM = 0;
	$scope.rlDir = ".";
	$scope.dstDir = "";
	
	$scope.spaceLabels = ["used", "free"];
	$scope.spaceColours = ["#F38630", "#69D2E7"];
	
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
	
	$scope.linkRlDir = function() {
		var _dirs = $scope.rlDir.split("/");
		var dirs = new Array();
		var rnf = ["", ""];
		for (var i = 0; i < _dirs.length; i++) {
			if (i == 0) {
				rnf[1] += _dirs[i];
			} else {
				rnf[1] += ("/" + _dirs[i]);
			}
			rnf[0] = "<a href='#" + rnf[1] + "'>" + _dirs[i] + "</a>";
			dirs[i] = [rnf[0], rnf[1]];
		}
		return dirs; 
	}
	
	$scope.rlDirs = $scope.linkRlDir();
		
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
	
	$scope.pathClick = function(rlDir) {
		$scope.dstDir = "";
		$scope.rlDir = rlDir;
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
					var files = data.list.files;
					for (var row in files) {
						var date = new Date();
						if (files[row]["type"] == "dir") {
							if (files[row]["name"] == "..") {
								files[row]["file"] = '<a href="#' + (date.getMilliseconds() + row) + '"><i class="fa fa-level-up"></i> [' + files[row]["name"] + ']</a>';
							} else {
								files[row]["file"] = '<a href="#' + (date.getMilliseconds() + row) + '"><i class="fa fa-folder"></i> [' + files[row]["name"] + ']</a>';
							}
						} else if (files[row]["type"] == "file") {
							files[row]["file"] = '<i class="fa fa-file-o"></i> ' + files[row]["name"];
						} else if (files[row]["type"] == "link") {
							files[row]["file"] = '<i class="fa fa-link"></i> ' + files[row]["name"];
						}
					}
					$scope.files = $scope.sortJson(files, "type_name", true);
					if ($scope.dstDir != "") {
						$scope.rlDir = $scope.rlDir + "/" + $scope.dstDir;
					}
					$scope.rlDir = $scope.shrinkRlDir();
					$scope.rlDirs = $scope.linkRlDir();
					
					$scope.space = data.list.space;
					$scope.spaceData = [$scope.space.used, $scope.space.free];
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
