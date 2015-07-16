<?php
include "config.php";

$account_config = new ACCOUNT_CONFIG();

$data = file_get_contents("php://input");
$objData = json_decode($data);

$approved = false;
if (isset($objData->username) && isset($objData->password)) {	
	foreach ($account_config->users as $user) {
		if (($objData->username == $user["username"]) && ($objData->password == md5($user["password"]))) {
			$approved = true;
			break;
		}
	}
}

echo json_encode(array(
	'approved' => $approved,
	'msg' => $approved ? 'Signed in...' : 'Invalid user name and password.',
	'tag' => $objData->username . ":" . $objData->password . "_" . md5($account_config->users[0]["password"])
));
?>
