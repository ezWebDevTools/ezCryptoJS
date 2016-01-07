/**
 * http://www.html5rocks.com/en/tutorials/file/dndfiles/
 */

var thisFile = null;
var thisFileProcess = null;
var showHelp = false;
document.getElementById('file-received').style.display = 'none';
toggleHelp();

function toggleHelp(evt){

    if ( typeof evt != 'undefined') {
        evt.stopPropagation();
        evt.preventDefault();
    }
    if ( window.showHelp == false ){
        var styleDisplay = 'none';
        window.showHelp = true;
    } else{
        var styleDisplay = '';
        window.showHelp = false;
    }

    var explanation = document.getElementsByClassName('explanation');
    for (var i = 0, f; f = explanation[i]; i++) {
        explanation[i].style.display = styleDisplay;
    }
}
document.getElementById('help').addEventListener('click', toggleHelp, false);


// hide the Encrypt / Decrypt until we're sure we hava pw.
// Note: This is somewhat a workaround to the original SJCL which doesn't (seem to) check for a blank pw once you've entered a pw.
document.getElementById('buttons').style.display = 'none';
var passWord = document.getElementById('password');
passWord.onkeyup = function(evt){
    if (this.value != ''){
        document.getElementById('buttons-msg').style.display = 'none';
        document.getElementById('buttons').style.display = '';
    } else{
        document.getElementById('buttons').style.display = 'none';
        document.getElementById('buttons-msg').style.display = '';
    }
};


function toggleDivs(toggle){
    if (toggle == 'file-received'){
        if (window.thisFileProcess == 'plaintext' || window.thisFileProcess == 'ciphertext' ){
            processThisFile(window.thisFileProcess);
        }
        document.getElementById('file-ask').style.display = 'none';
        document.getElementById('file-received').style.display = '';
        return;
    }
    if (toggle == 'cancel'){
        // TODO - other clean up
        window.thisFile = null;
        document.getElementById('file-received').style.display = 'none';
        document.getElementById('file-ask').style.display = '';
        document.getElementById('drop-zone').className = 'ready-drop';

        return;
    }
}

// Using form input for selecting
function handleFileSelect(evt) {

    var files = evt.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
        output.push('<span class="file-name">', escape(f.name), '</span>','<span class="file-meta">',
            f.size, ' bytes', ', ', 'Last Modified: ',
            f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a', '</span>'
        );
    }
    document.getElementById('file-received').innerHTML =  output.join('');
    window.thisFile = files[0];
    toggleDivs('file-received');
}

document.getElementById('input-type-file').addEventListener('change', handleFileSelect, false);

//
function handleFileDrop(evt) {

    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
        output.push('<span class="file-name">', escape(f.name), '</span>','<span class="file-meta">',
            f.size, ' bytes', ', ', 'Last Modified: ',
            f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a', '</span>'
        );
    }
    document.getElementById('file-received').innerHTML = output.join('');
    window.thisFile = files[0];
    console.log(window.thisFile);
    toggleDivs('file-received');
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    evt.target.className = (evt.type == "dragover" ? "hover-drop" : "");
}

// Setup the dnd listeners.
var dropZone = document.getElementById('drop-zone');
// http://www.sitepoint.com/html5-file-drag-and-drop/
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('dragleave', handleDragOver, false);
dropZone.addEventListener('drop', handleFileDrop, false);


// prevent a file drop that misses the drop zone from being displayed in the browser.
// http://stackoverflow.com/questions/6756583/prevent-browser-from-loading-a-drag-and-dropped-file
window.addEventListener("dragover", function (evt) {
    evt = evt || event;
    evt.preventDefault();
}, false);
window.addEventListener("drop", function (evt) {
    evt = evt || event;
    evt.preventDefault();
}, false);


//
function processThisFile(eleValue){

    var reader = new FileReader();

    var processFile = document.getElementById(eleValue);

    // Closure to capture the file information.
    reader.onload = (function(theFile) {
        return function(e) {
            processFile.value = e.target.result;
        };
    })(window.thisFile);

    reader.readAsText(window.thisFile);
}


// the radios for file type
var processFile = document.getElementsByName('process-file');
for (var i=0, iLen=processFile.length; i<iLen; i++) {
    processFile[i].onclick = function(ele) {
        document.getElementById('plaintext').value = '';
        document.getElementById('ciphertext').value = '';
        console.log(this.value);
        window.thisFileProcess = this.value;
        if (this.value == 'cancel'){
            toggleDivs('cancel');
        } else if (thisFile != null) {
            processThisFile(this.value);
        }
    };
}

/**
 * Use Javascript to save Textarea as a txt file
 * http://code.runnable.com/U5HC9xtufQpsu5aj/use-javascript-to-save-textarea-as-a-txt-file
 */
function saveTextAsFile(saveType) {
	
// grab the content of the form field and place it into a variable
    var textToWrite = document.getElementById("ciphertext").value;
    if (textToWrite == ''){
        alert ('Ciphertext is empty.')
        return;
    }
	
	if (saveType == 'text'){
		var fileExt = '.txt';
		//  create a new Blob (html5 magic) that conatins the data from your form feild
		var textFileAsBlob = new Blob([textToWrite], {type: 'application/text'});
		
	} else {
		var fileExt = '.json';
		//  create a new Blob (html5 magic) that conatins the data from your form feild
		var textFileAsBlob = new Blob([textToWrite], {type: 'application/json'});
	}


    var fileSuffix = '';
    if (window.thisFileProcess == 'plaintext'){
        fileSuffix = '-ezcryptojs';
    }
	
	if (window.thisFile){
		// strip the .ext from the thisFile.name (since it might change)
		var fileNameNoExt = thisFile.name.substr(0, thisFile.name.lastIndexOf('.')) || thisFile.name;
	} else {
		var fileNameNoExt = 'ezCryptoJS';
	}
// Specify the name of the file to be saved
    var fileNameToSaveAs =  fileNameNoExt + fileSuffix + fileExt;

// Optionally allow the user to choose a file name by providing
// an imput field in the HTML and using the collected data here
// var fileNameToSaveAs = txtFileName.text;

// create a link for our script to 'click'
    var downloadLink = document.createElement("a");
//  supply the name of the file (from the var above).
// you could create the name here but using a var
// allows more flexability later.
    downloadLink.download = fileNameToSaveAs;
// provide text for the link. This will be hidden so you
// can actually use anything you want.
    downloadLink.innerHTML = "My Hidden Link";

// allow our code to work in webkit & Gecko based browsers
// without the need for a if / else block.
    window.URL = window.URL || window.webkitURL;

// Create the link Object.
    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
// when link is clicked call a function to remove it from
// the DOM in case user wants to save a second file.
    downloadLink.onclick = destroyClickedElement;
// make sure the link is hidden.
    downloadLink.style.display = "none";
// add the link to the DOM
    document.body.appendChild(downloadLink);

// click the new link
    downloadLink.click();
}

function destroyClickedElement(event)
{
// remove the link from the DOM
    document.body.removeChild(event.target);
}