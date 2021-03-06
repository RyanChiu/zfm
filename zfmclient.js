var zfm = angular
	.module("zfmClient", 
		[
		 	'ngSanitize', 'ngCookies', 'ngDialog', 'ngAnimate', 
		 	'emguo.poller',
		 	'chart.js', 'angular-loading-bar', 'toaster',
		 	'ui.bootstrap.contextMenu'
		]
	);

zfm.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
	cfpLoadingBarProvider.includeSpinner = false;
	cfpLoadingBarProvider.includeBar = true;
    cfpLoadingBarProvider.latencyThreshold = 500;
}]);

zfm.controller('zfmController', function($window, $cookieStore, $scope, $http, ngDialog, poller, toaster) {
	$scope.url = "zfmsvr.php";
	
	$scope.idxCurBM = 0;
	$scope.rlDir = ".";
	$scope.dstDir = "";
	$scope.hotFileName = "";
	$scope.hotFileNameChged = [];
	$scope.delFileName = "";
	$scope.delFileType = "unknown";
	
	$scope.spaceLabels = ["used", "free"];
	$scope.spaceColours = ["#F38630", "#69D2E7"];
	
	/**
	 * emguo.poller part
	 */
	var listPoller;
	$scope.pollList = function() {
		listPoller = poller.get($scope.url, {
			action: 'post',
			delay: 20000, //in ms
			smart: true,
			argumentsArray: [
				{
					"rq" : "list",
					"bm" : $scope.idxCurBM,
					"dir" : $scope.rlDir + "/" + $scope.dstDir
				}
			]
		});
	}
	
	$scope.pollList();
	$scope.debugCount = 0;
	listPoller.promise.then(null, null, function(response) {
		$scope.data1 = response.data.list;//for debug
		
		var files = response.data.list.files;
		//$scope.files = files;
		$scope.files = $scope.sortJson(files, "type_name", true);
		$scope.refreshContextMenus();
		if ($scope.dstDir != "") {
			$scope.rlDir = $scope.rlDir + "/" + $scope.dstDir;
			$scope.dstDir = "";
		}
		$scope.rlDir = $scope.shrinkRlDir();
		$scope.rlDirs = $scope.linkRlDir();
		
		$scope.space = response.data.list.space;
		$scope.spaceData = [$scope.space.used, $scope.space.free];
		
		$scope.debugCount++;
	});
	/**
	 * emguo.poller part end
	 */
	
	/**
	 * bootstrap contextMenu part start 
	 */
	$scope.refreshContextMenus = function() {
		for (var obj in $scope.files) {
			$scope.files[obj].menuOptions = [
			    ['Rename', function($itemScope) {
			    	//alert($itemScope.file.id);
			    	$scope.renameClick($itemScope.file.name, $itemScope.file.id);
			    }],
			    null,
			    ['Delete', function($itemScope) {
			    	//alert($itemScope.file.name);
			    	$scope.deleteClick($itemScope.file.name, $itemScope.file.type);
			    }],
			];
		}
	}
	/**
	 * bootstrap contextMenu part end 
	 */
	
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
			//rnf[0] = "<a href='#" + rnf[1] + "'>" + _dirs[i] + "</a>";
			rnf[0] = _dirs[i];
			dirs[i] = [rnf[0], rnf[1]];
		}
		return dirs; 
	}
	
	$scope.rlDir = $scope.shrinkRlDir();
	$scope.rlDirs = $scope.linkRlDir();
		
	$scope.dirClick = function(dir) {
		$scope.dstDir = dir;
		if (dir == "..") {
			if ($scope.rlDir == ".") {
				$scope.dstDir = "";
				//$scope.openDialog('templates/ngDialog/commonWarning.html');
				toaster.pop('error', "Warning", "Already the root level.");
				return false;
			}
		}
		//$scope.askFor("list");
		$scope.pollList();
		return true;
	}
	
	$scope.bmClick = function(idxBM) {
		$scope.idxCurBM = idxBM;
		$scope.rlDir = ($scope.dstDir = ".");
		//$scope.askFor("list");
		$scope.pollList();
		return true;
	}
	
	$scope.pathClick = function(rlDir) {
		$scope.dstDir = "";
		$scope.rlDir = rlDir;
		//$scope.askFor("list");
		$scope.pollList();
		return true;
	}

	var hotID = -1;
	$scope.hotFileNameChged[hotID] = "";
	$scope.renameClick = function(name, id) {
		//alert(name);
		hotID = id;
		$scope.hotFileName = name;
		$scope.hotFileNameChged[hotID] = name;
		listPoller.stop();
	}
	
	$scope.renameOK = function() {
		/*
		 * to do: actually send rename request to the server and deal with it
		 */
		$scope.askFor("rename");
		$scope.hotFileName = "";
		hotID = -1;
	}
	
	$scope.renameCancel = function() {
		/*
		 * to do: cancel rename
		 */
		$scope.hotFileName = "";
		hotID = -1;
		listPoller.start();
	}
	
	$scope.deleteClick = function(name, type) {
		/*
		 * to do: delete file(s)
		 */
		listPoller.stop();
		$scope.delFileName = name;
		$scope.delFileType = type;
		var dialog = ngDialog.open({
			template: 'templates/ngDialog/confirmDelete.html',
			scope: $scope,
			showClose: false
		});
		dialog.closePromise.then(function (data) {
		    if (data.value == 1) {
		    	//do delete
		    	$scope.askFor("remove");
		    	$scope.delFileName = "";
		    	$scope.delFileType = "unknown";
		    } else {
		    	//cancel
		    	$scope.delFileName = "";
		    	$scope.delFileType = "unknown";
		    	listPoller.start();
		    }
		});
	}
	
	$scope.colAlias = function(keyName) {
		switch (keyName) {
			case "name": return "Name";
			case "hsize": return "Size";
			case "perm": return "Permission";
			case "type": return "Type";
			case "time": return "Time";
			default: return keyName;
		}
	}
	
	$scope.getIconOfFile = function(type, name, mimetype) {
		if (type == "dir") {
			if (name == "..") {
				return '<i class="fa fa-level-up"></i>';
			} else {
				return '<i class="fa fa-folder-o"></i>';
			}
		} else if (type == "file") {
			if (mimetype != false) {
				var mt = mimetype.split("/");
                var iconstr_exist = "text,pdf,word,excel,powerpoint,photo,picture,image,zip,archive,sound,video,audio,movie,code";
                if (iconstr_exist.indexOf(mt[0]) != -1) {
    				return '<i class="fa fa-file-' + mt[0] + '-o"></i>';
                } else if (iconstr_exist.indexOf(mt[1]) != -1) {
                    return '<i class="fa fa-file-' + mt[1] + '-o"></i>';
                } else if (mt[1].indexOf("zip") != -1) {
                    return '<i class="fa fa-file-zip-o"></i>';
                } else if (mt[1].indexOf("mp4") != -1 || mt[1].indexOf("mpeg") != -1) {
                    return '<i class="fa fa-file-movie-o"></i>';
                } else {
                    return '<i class="fa fa-file-o"></i> [' + mt[0] + "," + mt[1] + "]";
                }
			} else
				return '<i class="fa fa-file-o"></i>';
		} else if (type == "link") {
			return '<i class="fa fa-link"></i>';
		}
	}
	
	/**
	 * to server
	 */
	$scope.askFor = function(rq) {
		$http.post($scope.url, {
			"rq": rq,
			"bm": $scope.idxCurBM,
			"dir": $scope.rlDir + "/" + $scope.dstDir,
			"oldname": $scope.rlDir + "/" + $scope.hotFileName,
			"newname": $scope.rlDir + "/" + $scope.hotFileNameChged[hotID],
			"delname": $scope.rlDir + "/" + $scope.delFileName
		})
		.success(function(data, status) {
			$scope.answers = data;// for debug
			for (var key in data) {
				switch (key) {
				case 'dirs':
					var dirs = data.dirs;
					for (var i in dirs) {
						dirs[i]["link"] = 
							'<a href="#">' + dirs[i]["alias"] + '</a>';
						dirs[i]["idx"] = i;
					}
					$scope.dirs = dirs;
					break;
				case 'rename':
					if (data.rename.error == "") {
						toaster.pop('success', "File", "renamed.");
					} else {
						toaster.pop('error', "File", "not renamed.");
					}
					listPoller.start();
					break;
				case 'remove':
					if (data.remove.error == "") {
						toaster.pop('success', "Object", "deleted.");
					} else {
						toaster.pop('error', "Object", "not deleted.");
					}
					listPoller.start();
					break;
				}
				break;
			}
		})
		.error(function(data, status) {
			$scope.answers = data || "failed";// for debug
			for (var key in data) {
				switch (key) {
				case 'rename':
					listPoller.start();
					break;
				case 'remove':
					listPoller.start();
					break;
				default:
					break;
				}
				break;
			}
		});
	}
	
	$scope.leave = function() {
		var dialog = ngDialog.open({
			template: 'templates/ngDialog/confirmLeave.html',
			showClose: false
		});
		dialog.closePromise.then(function (data) {
		    if (data.value == 1) {
		    	$cookieStore.remove("username");
		    	$window.location.href = "sign-in.html";
		    } else {
		    	//do nothing
		    }
		});
	}
	/**
	 * verified if sign in approved
	 */
	$scope.username = $cookieStore.get("username");
	if (angular.isUndefined($scope.username) || $scope.username == "") {
		$window.location.href = "sign-in.html";
		return;
	} else {
		$scope.askFor("dirs");
	}
});
