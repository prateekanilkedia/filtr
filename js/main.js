/* 
 * 
 * Created on : 30 Nov, 2015, 6:32:22 AM
 * Author     : Prateek Kedia
 * Code written with explainatory methods and properties barely needs comments
 * 
 */
"use strict";

$(function () {
    var dropbox = $("body");
    var btnAddFiles = $("#btnAddFiles");
    var isFirstImage = true;

    var newFilterButton = function (thisImageCell, btnType) {
        var returnableArray = [];

        function newButton(btnType) {
            switch (btnType) {
                case "getBWImage":
                case "getSepiaImage1":
                case "getSepiaImage2":
                case "getNegativeImage":
                    var btn = $("<div class='filterButton' data-btntype='" + btnType + "'>" + btnType + "</div>");
                    btn.click(function () {
                        if (thisImageCell.status === "Upload Successful") {
                            var filenameOnServer = thisImageCell.imageCellDOMElement.data("filenameonserver");
                            var form = $("<form></form>");
                            form.attr("action", "ws/filter.php");
                            form.attr("method", "post");
                            form.append($('<input type="text" name="filename" value="' + filenameOnServer + '">'));
                            form.append($('<input type="text" name="option" value="' + btnType + '">'));
                            form.append($('<input type="submit" value="Submit">'));

                            form.submit(function () {
                                this.target = '_blank';
                            });

                            form.submit();
                        } else if (thisImageCell.status === "Uploading") {
                            alert("Upload in progress...");
                        } else if (thisImageCell.status === "Upload Failed") {
                            alert("Upload Failed! Kindly re-upload to apply some awesome filtrs :)");
                        }
                    });
                    return btn;
                    break;
                default:
                    return null;
            }
        }

        if (Object.prototype.toString.call(btnType) === "[object Array]") {
            for (var i in btnType) {
                returnableArray.push(newButton(btnType[i]));
            }
        } else if (Object.prototype.toString.call(btnType) === "[object String]") {
            returnableArray.push(newButton(btnType));
        } else {
            return null;
        }

        return returnableArray;
    };

    var progressBar = function (action) {
        var thisProgBar = this;
        thisProgBar.progressBarContainer = $("<div class='progressBarContainer'></div>");
        thisProgBar.numberOfProgressBarsAdded = 0;
        thisProgBar.addBar = function () {
            var bar = $("<div class='progressBar'></div>");
            var cssBottomPercentage = (10 * thisProgBar.numberOfProgressBarsAdded).toString() + '%';
            bar.css("bottom", cssBottomPercentage);
            thisProgBar.numberOfProgressBarsAdded++;
            thisProgBar.progressBarContainer.append(bar);
            if ("100%" === cssBottomPercentage) {
                thisProgBar.removeProgbarContainer();
            }
        };
        thisProgBar.removeProgbarContainer = function () {
            thisProgBar.progressBarContainer.remove();
        };
        action(this.progressBarContainer);
    };

    var imageCell = function (action) {
        var thisImageCell = this; //Caching this
        thisImageCell.imageCellDOMElement = $('<div class="imageCell"></div>');
        thisImageCell.imgElement = $('<img class="grow" alt=Loading.../>');
        thisImageCell.imageCellDOMElement.append(thisImageCell.imgElement);
        thisImageCell.progressBar = new progressBar(function (element) {
            thisImageCell.imageCellDOMElement.append(element);
        });
        thisImageCell.imageCellDOMElement.click(function () {
            return (function () {
                var imageMainView = $("#imageMainView");
                var img = $("<img />");
                var imgSrc = thisImageCell.imgElement.attr("src");
                img.attr("src", imgSrc);

                var filterButtonsContainer = $("<div class='filterButtonsContainer'></div>");
                var filterButtons = newFilterButton(thisImageCell, [
                    "getBWImage",
                    "getSepiaImage1",
                    "getSepiaImage2",
                    "getNegativeImage"
                ]);
                filterButtonsContainer.append(filterButtons);

                $(".imageCell").removeClass("selected");
                thisImageCell.imageCellDOMElement.addClass("selected");

                imageMainView.html("");
                imageMainView.append([
                    img,
                    filterButtonsContainer
                ]);
            }());
        });

        if (isFirstImage) {
            isFirstImage = false;
            thisImageCell.imgElement.on("load", function () {
                thisImageCell.imageCellDOMElement.click();
            });
        }

        action(thisImageCell.imageCellDOMElement);
    };

    var uploadFile = function (files, action) {
        var imagesTable = $("#imagesTable");
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (file.type === "image/png" || file.type === "image/jpeg") {
                var imgCell = new imageCell(function (element) {
                    imagesTable.prepend(element);
                });
                var fileSize = file.size;
                var reader = new FileReader();
                reader.onload = (function (imgCell) {
                    return function (event) {
                        imgCell.imgElement.attr("src", event.target.result);
                    };
                })(imgCell);
                reader.readAsDataURL(file);
                var formData = new FormData();
                formData.append('file', file);

                if (i === files.length - 1) {
                    isFirstImage = true;
                }

                action(formData, imgCell, fileSize);
            } else {
                alert("One of the files you are trying to upload is not a valid image. Only jpeg's and png's are accepted!");
            }
        }
    };

    function prepareForUploadAndDispatch(files) {
        uploadFile(files, function (formData, imageCell, fileSize) {
            $.ajax({
                xhr: function () {
                    var xhr = $.ajaxSettings.xhr();
                    if (xhr.upload) {
                        xhr.upload.addEventListener('progress', function (event) {
                            var percent = 0;
                            var position = event.loaded || event.position;
                            var total = fileSize;
                            if (event.lengthComputable) {
                                percent = Math.ceil(position / total * 100);
                            }

                            var progressBars = imageCell.progressBar.numberOfProgressBarsAdded;
                            if (progressBars !== parseInt(percent / 10)) {
                                imageCell.progressBar.addBar();
                            }
                            imageCell.status = "Uploading";
                        }, false);
                        xhr.upload.addEventListener('error', function (event) {
                            var uploadFailedMessage = $("<div class='uploadFailedMessage'><span>Upload Failed</span></div>");
                            uploadFailedMessage.css({
                                height: imageCell.imageCellDOMElement.height(),
                                width: imageCell.imageCellDOMElement.width()
                            });
                            imageCell.imgElement.css({
                                "-webkit-filter": "blur(2px)",
                                "-moz-filter": "blur(2px)",
                                "-o-filter": "blur(2px)",
                                "-ms-filter": "blur(2px)"
                            });
                            imageCell.progressBar.progressBarContainer.css({
                                "-webkit-filter": "blur(2px)",
                                "-moz-filter": "blur(2px)",
                                "-o-filter": "blur(2px)",
                                "-ms-filter": "blur(2px)"
                            });
                            imageCell.imageCellDOMElement.append(uploadFailedMessage);
                            imageCell.status = "Upload Failed";
                        }, false);
                    }
                    return xhr;
                },
                url: "ws/upload.php",
                type: "POST",
                contentType: false,
                processData: false,
                cache: false,
                data: formData,
                success: function (data) {
                    data = JSON.parse(data);
                    if (data.Error) {
                        alert("Error occured at server");
                        imageCell.status = "Upload Failed";
                        return;
                    }

                    imageCell.progressBar.removeProgbarContainer();
                    imageCell.imageCellDOMElement.attr("data-filenameonserver", data.uniqID + '.' + data.extension);
                    imageCell.status = "Upload Successful";
                }
            });
        });
    }

    dropbox.on('dragenter', function (event) {
        event.stopPropagation();
        event.preventDefault();
    });
    dropbox.on('dragover', function (event) {
        event.stopPropagation();
        event.preventDefault();
    });
    dropbox.on('drop', function (event) {
        event.preventDefault();
        var files = event.originalEvent.dataTransfer.files;
        prepareForUploadAndDispatch(files);
    });

    btnAddFiles.click(function () {
        var fileDialogBox = $("<input id='file' type='file' multiple target='_blank'/>");
        fileDialogBox.click();

        fileDialogBox.change(function (event) {
            var files = event.currentTarget.files;
            prepareForUploadAndDispatch(files);
        });
    });
});
