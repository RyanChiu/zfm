<?php
include "config.php";
include "kits.php";

$disk_config = new DISK_CONFIG();

$data = file_get_contents("php://input");
$objData = json_decode($data);

function getSpace($dir) {
	$free = disk_free_space($dir) / 1024 / 1024;
	$total = disk_total_space($dir) / 1024 / 1024;
	return array(
		"dir" => $dir,
		"total" => $total,
		"free" => $free
	);
}

function getList($dir) {
	return scandir($dir);
}

switch ($objData->rq) {
	case 'space':
		echo json_encode(array(
			$objData->rq => getSpace($disk_config->dirs[0])
		));
		break;
	case 'dirs':
		echo json_encode(array(
			$objData->rq => $disk_config->dirs
		));
		break;
	case 'list':
		$dst_dir = isset($objData->dir) ? $objData->dir : "";
		$dir_list = dir_list($disk_config->dirs[0] . '/' . $dst_dir);
		array_push($dir_list, array(
			'file' => '..',
			'name' => '..',
			'size' => '-',
			'perm' => '-',
			'type' => 'dir',
			'type_name' => 'dir_..',
			'time' => '-',
		));
		echo json_encode(array(
			$objData->rq => $dir_list
		));
		break;
	case 'all':
		echo json_encode(array(
			$objData->rq => array(
				"files" => dir_list($disk_config->dirs[0]),
				"spaces" => getSpace($disk_config->dirs[0])
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
