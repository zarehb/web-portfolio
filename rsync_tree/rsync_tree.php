<style>
	.rsync-tree {
		font-family: Verdana, Geneva, Arial, Helvetica, sans-serif;
		font-size: 12px;
		list-style: none;
	}
	.rsync-tree .folder {
		cursor: pointer;
		list-style-image: url('icons/folderClosed.gif');
	}
	
	.rsync-tree .file {
		list-style-image: url('icons/file.gif');
	}
	
	.rsync-tree .empty_folder {
		list-style-image: url('icons/folderEmpty.gif');
	}

	.rsync-tree .folder:hover {
		text-decoration: underline;
	}
	
	.rsync-tree .deleted_item {
		color: red;
	}
	
	.rsync-tree .new_item {
		color: green;
	}
	
	.rsync-tree .modified_item {
		color: blue;
	}
	
	

</style>
<script>
	function toggleList(event) {
		// get the itemId which is associated with the clicked folder
		var itemId = event.currentTarget.getAttribute('data-role');
		var item = document.getElementById(itemId);
		
		// interval is used to be sure long lists wont take forever to expand
		var interval = parseInt(Math.max(item.scrollHeight / 40, 1));
		
		if (parseInt(item.style.height) == 0) {
			animateOpen(item, interval);
		} else {
			animateClose(item, interval);
		}
	}

	function animateOpen(item, interval) {
		var height = parseInt(item.offsetHeight);
		if (height < parseInt(item.scrollHeight)) {
			height += interval;
			setTimeout(animateOpen, 1, item, interval);
		} else {
			height = '';
		}
		item.style.height = height;
	}

	function animateClose(item, interval) {
		var height = parseInt(item.offsetHeight);
		if (height > interval) {
			height -= interval;
			setTimeout(animateClose, 1, item, interval);
		} else {
			height = 0;
			animDone = true;
		}
		item.style.height = height;
	}
</script>

<ul class="rsync-tree">
<?php

// main array which holds the hierarchy
$root = array();
// keet track of styles based on the path
$styles = array();
// listId is used to serialize items, see collapse 
$listId = 0;

// read the file and create an array based on the changes
$file_handle = fopen("rsync.log", "r");
while (!feof($file_handle)) {
	$line = fgets($file_handle);
	$tokens = explode(' ', str_replace("   ", " ", $line));
	if (sizeof($tokens) == 2) {
		// populate all the styles
		$styles = array_merge($styles,array(trim($tokens[1])=>getClassName(trim($tokens[0]))));
		// populate paths; user recursive merge to prevent overriding by the adjacents
		$root = array_merge_recursive($root, pathToArray($tokens[1]));
	}
}
fclose($file_handle);

// create a tree from an array
arrayToList($root,"");

// get className based on the flags
function getClassName($flags) {
	if(strpos($flags, "deleting")) {
		return 'deleted_item';
	} elseif(strpos($flags, "+")) {
		return 'new_item';
	} elseif(preg_match('/Qc|s|p|o|gE/', substr($flags, 2)) ) {
		return 'modified_item';
	} else {
		return '';
	}
}

// recursively populate the array based on the path
function pathToArray($path) {
	$tokens = explode("/", $path);
	if (sizeof($tokens) > 1) {
		$value = pathToArray(substr($path, strpos($path, "/") + 1));
		return array(trim($tokens[0]."/") => $value);
	} elseif (strlen(trim($tokens[0]))) {
		return array(trim($tokens[0])  => "");
	}
}


// create list component based on the array
function arrayToList($array,$path) {
	global $listId;
	global $styles;
	
	foreach ($array as $key => $value) {
	$currentPath = $path. $key;
		if (is_array($value)) {
			$listId++;
			echo('<li class="folder '. $styles[$currentPath].'" data-role="item' . $listId . '" onclick="toggleList(event)">' . htmlspecialchars($key) . '</li><ul id="item' . $listId . '" style="height: 0px;overflow: hidden;">');
			arrayToList($value,$path."$key");
			echo('</ul>');
		} else if (!is_numeric($key)) {
			$isEmptyFolder = strpos($key, "/");
			$className = $isEmptyFolder ? "empty_folder " : "file ";
			echo('<li class="' . $className . $styles[$currentPath].'">' . htmlspecialchars($key) . '</li>');
		}
	}
}
?>
</ul>