<?php
/* 
 * 
 * Created on : ‎30 ‎Nov ‎2015, ‏‎9:07:19 AM
 * Author     : Prateek Kedia
 * Code written with explainatory methods and properties barely needs comments
 * 
 */

ini_set('post_max_size', '200M');
ini_set('upload_max_filesize', '200M');
ini_set('max_execution_time', 0);
ini_set("memory_limit", "-1");
set_time_limit(0);
ini_set('max_file_uploads', '200');

ini_set('display_errors', 1);
error_reporting(E_ALL); // E_ALL

$output_dir = "../uploadedFiles/";
$fileNameAndExtension = explode(".", $_FILES["file"]["name"]);
$fileInfo['uniqID'] = uniqid();
$fileInfo['extension'] = end($fileNameAndExtension);

if (isset($_FILES["file"])) {
//Filter the file types , if you want.
    if ($_FILES["file"]["error"] > 0) {
        echo '{"Error":"' . $_FILES["file"]["error"] . '"}';
    } else {
        move_uploaded_file($_FILES["file"]["tmp_name"], $output_dir . $fileInfo['uniqID'] . "." . $fileInfo['extension']);
        echo json_encode($fileInfo);
    }
}
