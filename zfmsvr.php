<?php
include "config.php";
include "kits.php";

$disk_config = new DISK_CONFIG();

$data = file_get_contents("php://input");
$objData = json_decode($data);
if (isset($objData->bm)) {
	$objData->bm = intval($objData->bm);
} else {
	$objData->bm = 0;
}

function getSpace($dir) {
	$free = disk_free_space($dir);
	$total = disk_total_space($dir);
	return array(
		"dir" => $dir,
		"total" => $total,
		"free" => $free,
		"used" => $total - $free,
		"htotal" => human_filesize($total),
		"hfree" => human_filesize($free),
		"hused" => human_filesize($total - $free)
	);
}

function getList($dir) {
	return scandir($dir);
}

switch ($objData->rq) {
	case 'dirs':
		echo json_encode(array(
			$objData->rq => $disk_config->dirs
		));
		break;
	case 'list':
		$dst_dir = $disk_config->dirs[$objData->bm]["path"] . "/" . (isset($objData->dir) ? $objData->dir : "");
		$dir_list = dir_list($dst_dir);
		$dir_list[] = array(
			'name' => '..',
			'size' => '-',
			'hsize' => '-',
			'perm' => '-',
			'type' => 'dir',
			'type_name' => 'dir_..',
			'time' => '-'
		);
		echo json_encode(array(
			$objData->rq => array(
				"files" => $dir_list,
				"space" => getSpace($disk_config->dirs[$objData->bm]["path"])
			)
		));
		break;
	case 'all':
		echo json_encode(array(
			$objData->rq => array(
				"allfiles" => dir_list($disk_config->dirs[$objData->bm]["path"]),
				"space" => getSpace($disk_config->dirs[$objData->bm]["path"])
			)
		));
		break;
	default:
		echo json_encode(array(
			$objData->rq => "N/A"
		));
		break;
}
?>
