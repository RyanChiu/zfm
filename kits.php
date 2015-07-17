<?php
/**
 * from "http://php.net/manual/zh/function.readdir.php"
 */
function read_all_files($root = '.'){
  $files  = array('files'=>array(), 'dirs'=>array());
  $directories  = array();
  $last_letter  = $root[strlen($root)-1];
  $root  = ($last_letter == '\\' || $last_letter == '/') ? $root : $root.DIRECTORY_SEPARATOR;
 
  $directories[]  = $root;
 
  while (sizeof($directories)) {
    $dir  = array_pop($directories);
    if ($handle = opendir($dir)) {
      while (false !== ($file = readdir($handle))) {
        if ($file == '.' || $file == '..') {
          continue;
        }
        $file  = $dir.$file;
        if (is_dir($file)) {
          $directory_path = $file.DIRECTORY_SEPARATOR;
          array_push($directories, $directory_path);
          $files['dirs'][]  = $directory_path;
        } elseif (is_file($file)) {
          $files['files'][]  = $file;
        }
      }
      closedir($handle);
    }
  }
 
  return $files;
}

/**
 * from "http://php.net/manual/zh/function.readdir.php"
 */
function permission($filename)
{
    $perms = fileperms($filename);

    if     (($perms & 0xC000) == 0xC000) { $info = 's'; }
    elseif (($perms & 0xA000) == 0xA000) { $info = 'l'; }
    elseif (($perms & 0x8000) == 0x8000) { $info = '-'; }
    elseif (($perms & 0x6000) == 0x6000) { $info = 'b'; }
    elseif (($perms & 0x4000) == 0x4000) { $info = 'd'; }
    elseif (($perms & 0x2000) == 0x2000) { $info = 'c'; }
    elseif (($perms & 0x1000) == 0x1000) { $info = 'p'; }
    else                                 { $info = 'u'; }

    // владелец
    $info .= (($perms & 0x0100) ? 'r' : '-');
    $info .= (($perms & 0x0080) ? 'w' : '-');
    $info .= (($perms & 0x0040) ? (($perms & 0x0800) ? 's' : 'x' ) : (($perms & 0x0800) ? 'S' : '-'));

    // группа
    $info .= (($perms & 0x0020) ? 'r' : '-');
    $info .= (($perms & 0x0010) ? 'w' : '-');
    $info .= (($perms & 0x0008) ? (($perms & 0x0400) ? 's' : 'x' ) : (($perms & 0x0400) ? 'S' : '-'));

    // все
    $info .= (($perms & 0x0004) ? 'r' : '-');
    $info .= (($perms & 0x0002) ? 'w' : '-');
    $info .= (($perms & 0x0001) ? (($perms & 0x0200) ? 't' : 'x' ) : (($perms & 0x0200) ? 'T' : '-'));

    return $info;
}

/**
 * from "http://php.net/manual/zh/function.readdir.php"
 */
function dir_list($dir)
{
    if ($dir[strlen($dir)-1] != '/') $dir .= '/';

    if (!is_dir($dir)) return array();

    $dir_handle  = opendir($dir);
    $dir_objects = array();
    while ($object = readdir($dir_handle))
        if (!in_array($object, array('.','..')))
        {
            $filename = $dir . $object;
            $filetype = filetype($filename);
            $file_object = array(
            	'file' => $object,
            	'name' => $object,
                'size' => ($filetype == 'dir' || $filetype == 'link') ? '-' : sprintf("%u", filesize($filename)),
                'perm' => permission($filename),
                'type' => $filetype,
            	'type_name' => $filetype . '_' . $object,
                'time' => date("Y-m-d H:i:s", filemtime($filename))
            );
            $dir_objects[] = $file_object;
        }

    return $dir_objects;
} 
?>