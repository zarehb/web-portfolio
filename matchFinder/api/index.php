<?php
if(session_id() == '') {
	session_start();
}

define("LOCAL",true);
error_reporting(E_ALL);

// Report all PHP errors
error_reporting(-1);
require 'Slim/Slim.php';

$app = new Slim();
$app -> get('/user/:id', 'getUser');
$app -> get('/messages/:id', 'getMessages');
$app -> put('/messages/:id', 'addMessage');
$app -> get('/verification/:email/:id', 'verifyEmail');
$app -> post('/user', 'createNewUser');
$app -> put('/user', 'saveUser');
$app -> get('/user', 'findUser');
$app -> get('/properties', 'getOptions');
$app -> get('/match/:min/:max/:page', 'findMatch');
$app -> get('user/image/:userName', 'getImage');
/*
 $app->get('/users/:id/reports',	'getReports');
 $app->get('/users/search/:query', 'getusersByName');
 $app->get('/users/modifiedsince/:timestamp', 'findByModifiedDate');

 */
$app -> run();

function getImage($userName) {
	//TODO
}

function addMessage() {
	if (isset($_SESSION['user'])) {
		$userId = $_SESSION['user'];
		$request = Slim::getInstance() -> request();
		$message = json_decode($request -> getBody());	

		if(!isBlocked($userId,$message->id)) {
			$sql = "INSERT INTO `USER_MESSAGE` (fromUser,toUser,message) VALUES(:from,:to,:content)";
			$db = getConnection();
			$stmt = $db->prepare($sql);
			$stmt->bindParam('from',$userId);
			$stmt->bindParam("to",$message->id);
			$stmt->bindParam("content",$message->content);
			$stmt->execute();
			getMessages($message->id);
		}
	$db = null;
	} else {
		exit ('{"error":{"text":"There isn\'t such a user"}}');
	}
}

function getMessages($userId) {
	if (isset($_SESSION['user'])) {
		$currentUser = $_SESSION['user'];
		$db = getConnection();
		$sql = "select * from USER_MESSAGE where (fromUser = $userId or toUser = $userId) and (fromUser = $currentUser or toUser = $currentUser)";
		$stmt = $db -> prepare($sql);
		$stmt -> execute();
		$messages = $stmt -> fetchAll(PDO::FETCH_OBJ);
		
		$sql = "select firstName,id from SITE_USER where id = $userId";
		$stmt = $db -> prepare($sql);
		$stmt -> execute();
		$user = $stmt -> fetchAll(PDO::FETCH_OBJ);

		$messageHistory = $user[0];
		$messageHistory->messages = $messages;
		$messageHistory->content = "";
		echo json_encode($messageHistory);
		$db = null;
	} else {
		exit ('{"error":{"text":"There isnt such a user"}}');
	}
}

function isBlocked() {
	// TODO
	return false;
}

function findMatch($min,$max,$page) {
	$pageSize = 200;
	$min = floor($min/10);
	$max = ceil($max/10);
	if (isset($_SESSION['user'])) {
		$user = $_SESSION['user'];
	} else {
		exit("User Should be logged in to search for matches");
	}
	
	$db = getConnection();
	
	$sql = "Select * from USER_INFO where user_id =" . $user;
	$stmt = $db -> prepare($sql);
	$stmt -> execute();
	$props = $stmt -> fetchAll(PDO::FETCH_OBJ);
	
	$key = "";
	for($i = 0 ; $i < sizeof($props); $i++) {
..................
	}
	$key = substr($key, 0,strlen($key) -1);
	
	$limit1 = ($page-1) * $pageSize;
	$limit2 = $pageSize; 
..................
	$stmt = $db -> prepare($sql);
	$stmt -> execute();
	$matches = $stmt -> fetchAll(PDO::FETCH_OBJ);
	$ids = '';
	if(!sizeof($matches)) {
		exit ("[]");
	}
	for($i = 0 ; $i < sizeof($matches); $i++) {
		$ids .= "'" .$matches[$i]->user_id . "',";
	}
	$ids = substr($ids, 0,strlen($ids) -1);
	
	$sql = "select id,firstName from SITE_USER where id in ($ids)" ;
	$stmt = $db -> prepare($sql);
	$stmt -> execute();
	$users = $stmt -> fetchAll(PDO::FETCH_OBJ);
	for($i = 0 ; $i < sizeof($matches); $i++) {
		$matches[$i]->firstName = $users[$i]->firstName;
		$matches[$i]->id = $users[$i]->id;
	}
	echo json_encode($matches);
	$db = null;
}

function getOptions() {
	$db = getConnection();
	$propertiesSql = "select * from PROPERTIES";
	$stmt = $db -> prepare($propertiesSql);
	$stmt -> execute();
	$props = $stmt -> fetchAll(PDO::FETCH_OBJ);
	for ($i = 0; $i < sizeof($props); $i++) {
		$opsSql = "select *,(select @curRank := @curRank + 1 AS rank  from OPTIONS,  (SELECT @curRank := 0) r  WHERE id =  ops.id ) as rank from OPTIONS ops where propertyID = " . $props[$i] -> id;
		$stmt = $db -> prepare($opsSql);
		$stmt -> execute();
		$ops = $stmt -> fetchAll(PDO::FETCH_OBJ);
		$props[$i] -> properties = $ops;

	}
	echo json_encode($props);
	$db = null;
	return $props;
}

function findUser() {
	if (isset($_SESSION['user'])) {
		return getUser($_SESSION['user'], true);
	} else {
		echo '{"error":{"text":"There isnt such a user"}}';
	}
}

function getFbUserId() {
	require_once('facebook/facebook.php');
	if(LOCAL) {
		$config = array(
	    'appId' => '......',
	    'secret' => '......',
	  );
	} else {
	  $config = array(
	    'appId' => '.....',
	    'secret' => '......',
	  );
	}

  $facebook = new Facebook($config);
  $user_id = $facebook->getUser();
  return $user_id;
}

function saveUser() {
	if (isset($_SESSION['user'])) {
			
		$db = getConnection();
		$request = Slim::getInstance() -> request();
		$user = json_decode($request -> getBody());
		
		if(sizeof($user -> options)<5) {
			exit("{'error': 'At least five options are required'}");
		}
		$sql = "DELETE FROM USER_INFO WHERE user_id = " . $_SESSION['user'];
		$stmt = $db -> prepare($sql);
		$stmt -> execute();
		$code = "";
		
		$sql = "UPDATE SITE_USER set virgin = 0 where id = " . $_SESSION['user'] ;
		$stmt = $db -> prepare($sql);
		$stmt -> execute();
		
		for ($i = 0; $i < sizeof($user -> options); $i++) {
			$option = $user -> options[$i];
			
			//return;
			//$code .= $user -> options[$i]->rank;
			
			$sql = "INSERT INTO USER_INFO (user_id,option_id,propertyId,optionKey) VALUES(:userId,:optionId,:propId,:opkey)";
			$key = $option -> propertyId . ":" . $option -> option_id;
			$stmt = $db -> prepare($sql);
			$stmt -> bindParam("userId", $_SESSION['user']);
			$stmt -> bindParam("optionId", $option -> option_id);
			$stmt -> bindParam("propId", $option ->  propertyId);
			$stmt -> bindParam("opkey", $key );
			$stmt -> execute();
		}
		
		//TODO: for creating the keys
		$sql = "update USER_INFO  set key = CONCAT_WS(\":\",propertyId,option_id)"; 
		 
		$db = null;
		echo $code;
	}
	
}

function createNewUser() {
	$request = Slim::getInstance() -> request();
	$user = json_decode($request -> getBody());
	
	if(!isset($user->fbId)) {
		session_unset();
		exit("{error: 'user object doesnt have any id'}");
	}
	
	
	try {
		$id = getFbUserId();
		if($user->fbId != $id) {
			throw new Exception('facebook id is not defined.');
		}
			
		$db = getConnection();
		$find_user_sql = "select * from SITE_USER where fbId = :fbId";
		$stmt = $db -> prepare($find_user_sql);
		$id = $user -> fbId;
		$stmt -> bindParam("fbId", $id);
		$stmt -> execute();
		$users = $stmt -> fetchAll(PDO::FETCH_OBJ);
		if (sizeof($users)) {
			updateUser($user);
			$_SESSION['user']  = $users[0]->id;
			getUser($users[0]->id);
		} else {
			$sql = "INSERT INTO SITE_USER (fbId,username,firstName,lastName,gender,location,facebookInfo,email) 
					VALUES (:fbId,:username,:first_name,:last_name,:gender,:location,:facebookInfo,:email) ";
			$stmt = $db -> prepare($sql);
			$stmt -> bindParam("fbId", $id);
			$stmt -> bindParam("username", $user->username);
			$stmt -> bindParam("first_name", $user->first_name);
			$stmt -> bindParam("last_name", $user->last_name);
			$stmt -> bindParam("gender", $user->gender);
			$stmt -> bindParam("location", $user->location);
			$stmt -> bindParam("facebookInfo", $user->facebookInfo);
			$stmt -> bindParam("email", $user->email);
			$stmt -> execute();
			$userId = $db->lastInsertId();
			
			$db = null;
			
			$_SESSION['user']  = $userId;
			// save the image:
			$thispath = "../userImages/$userId";
			if(!file_exists($thispath)) {
				mkdir($thispath, 0755);
			}
			$imageURL = "http://graph.facebook.com/$id/picture?type=square";
			$ch = curl_init($imageURL);
			$fp = fopen("../userImages/$userId/square.jpg", 'wb');
			curl_setopt($ch, CURLOPT_FILE, $fp);
			curl_setopt($ch, CURLOPT_HEADER, 0);
			curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
			curl_exec($ch);
			curl_close($ch);
			fclose($fp);
			
			$imageURL = "http://graph.facebook.com/$id/picture?type=large";
			$ch = curl_init($imageURL);
			$fp = fopen("../userImages/$userId/large.jpg", 'wb');
			curl_setopt($ch, CURLOPT_FILE, $fp);
			curl_setopt($ch, CURLOPT_HEADER, 0);
			curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
			curl_exec($ch);
			curl_close($ch);
			fclose($fp);
			getUser($userId,true);
			
		}
	} catch (Exception $e) {
		$db = null;
		echo '{"error":{"text":' . $e -> getMessage() . '}}';
	}
	/*
	 */
}
function checkVerification($user) {
	
}
function createVerificationCode($email) {
	return md5($email + "mesletoo");
}

function sendVerCode($verCode,$name) {
	
}

function updateUser($user) {
		// TODO
		//echo("updating user");
}

function updateOptionsCode() {
	$options = getOptions();
	$user = getUser($_SESSION['user'],true);
	$code = "";
	foreach($property as $options) {
		print_r($property);
	}
}

function getUser($id, $new = false) {
	$sql = "select * from SITE_USER where id = :id";
	try {
		$db = getConnection();
		$stmt = $db -> prepare($sql);
		$stmt -> bindParam("id", $id);
		$stmt -> execute();
		$users = $stmt -> fetchAll(PDO::FETCH_OBJ);

		$sql = "select * from USER_INFO where user_id = :id";
		$stmt = $db -> prepare($sql);
		$stmt -> bindParam("id", $id);
		$stmt -> execute();
		$options = $stmt -> fetchAll(PDO::FETCH_OBJ);

		$users[0] -> options = $options;
		$users[0]->new = $new;
		$db = null;

		// Include support for JSONP requests
		if (!isset($_GET['callback'])) {
			echo json_encode($users[0]);
		} else {
			echo $_GET['callback'] . '(' . json_encode($users[0]) . ');';
		}

	} catch(PDOException $e) {
		echo '{"error":{"text":' . $e -> getMessage() . '}}';
	}
}

function getConnection() {
	if(LOCAL) {
	$dbhost = "localhost";
	$dbuser = "root";
	$dbpass = "root";
	$dbname = "matchFinder";
	}
	else {
		..............
	}
	$dbh = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);
	$dbh -> setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	return $dbh;
}
?>