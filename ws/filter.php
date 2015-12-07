<?php
/* 
 * 
 * Created on : 29 ‎Nov, ‎2015, 1:32:49 AM
 * Author     : Prateek Kedia
 * Code written with explainatory methods and properties barely needs comments
 * 
 */

$fileName = $_POST['filename'];
$option = $_POST['option'];
$extension = end(explode('.', $fileName));
$photoPath = "../uploadedFiles/" . $fileName;

if ($extension === "jpeg" || $extension === "jpg") {
    $image = imagecreatefromjpeg($photoPath);
} else if ($extension === "png") {
    $image = imagecreatefrompng($photoPath);
}

if ($_POST['option'] === "getBWImage") {
    if ($image && imagefilter($image, IMG_FILTER_GRAYSCALE)) {
        imagejpeg($image, "../uploadedFiles/edits/" . $fileName);
    } else {
        echo 'Conversion to grayscale failed.';
    }
} else if ($_POST['option'] === "getSepiaImage1") {
    if ($image && imagefilter($image, IMG_FILTER_COLORIZE, 100, 59, 15)) {
        imagejpeg($image, "../uploadedFiles/edits/" . $fileName);
    } else {
        echo 'Sepia1 shading failed.';
    }
} else if ($_POST['option'] === "getSepiaImage2") {
    if ($image) {
        for ($x = 0; $x < imagesx($image); ++$x) {
            for ($y = 0; $y < imagesy($image); ++$y) {
                $index = imagecolorat($image, $x, $y);
                $rgb = imagecolorsforindex($image, $index);
                // $color = imagecolorallocate($im, 100, 59, 15);
                $outputRed = ($rgb['red'] * .393) + ($rgb['green'] * .769) + ($rgb['blue'] * .189);
                $outputRed = ($outputRed > 255 ? 255 : $outputRed);

                $outputGreen = ($rgb['red'] * .349) + ($rgb['green'] * .686) + ($rgb['blue'] * .168);
                $outputGreen = ($outputGreen > 255 ? 255 : $outputGreen);

                $outputBlue = ($rgb['red'] * .272) + ($rgb['green'] * .534) + ($rgb['blue'] * .131);
                $outputBlue = ($outputBlue > 255 ? 255 : $outputBlue);

                $color = imagecolorallocate($image, $outputRed, $outputGreen, $outputBlue);
                imagesetpixel($image, $x, $y, $color);
            }
        }
    }
    imagejpeg($image, "../uploadedFiles/edits/" . $fileName);
} else if ($_POST['option'] === "getNegativeImage") {
    for($x = 0; $x < imagesx($image); ++$x)
    {
        for($y = 0; $y < imagesy($image); ++$y)
        {
            $index = imagecolorat($image, $x, $y);
            $rgb = imagecolorsforindex($image, $index);
            $colorNegative = imagecolorallocate($image, 255 - $rgb['red'], 255 - $rgb['green'], 255 - $rgb['blue']);

            imagesetpixel($image, $x, $y, $colorNegative);
        }
    }
    imagejpeg($image, "../uploadedFiles/edits/" . $fileName);
    
}
imagedestroy($image);

if (file_exists("../uploadedFiles/edits/" . $fileName)) {
    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . $fileName. '"');
    header('Content-Transfer-Encoding: binary');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize("../uploadedFiles/edits/" . $fileName));
    readfile("../uploadedFiles/edits/" . $fileName);
    exit;
}
