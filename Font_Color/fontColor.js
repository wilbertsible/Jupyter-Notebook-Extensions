/*
Fonts are definted in highlighter.css
The following functions modies the font of the selected text, according to the scheme chosen by a menu button. More precisely, they replace selected text, both in edit or command mode, by 
a span tag with a given class and the selected text as data.
if no text is selected, then the whole cell is highlighted (using a div tag and a class corresponding to the chosen scheme). A function to remove all csustom font is also provided. 
*/

function removeFullCellColor(cell_text) {
    cell_text = cell_text.replace(/<div class=(?:"red"|"redOrange"|"orange"|"yellowOrange"|"yellow"|"yellowGreen"|"green"|"blueGreen"|"blue"|"blueViolet"|"violet"|"redViolet"|"black")>\n([\s\S]*?)<\/div>/g, function(w, g) {
        return g
    })
    return cell_text
}


function fullCellColor(cell_text,scheme) {
    cell_text=removeFullCellColor(cell_text);
    return '<div class='+'"'+scheme+'"'+'>\n'+cell_text+'</div>'
}

function addColor(text,scheme) {
    var scheme=scheme;
    // replace by a span, wile preserving leading and trailing spaces
    var rep=text.replace(/(\S[\S\s]*\S)/,function (w,internal_text){
        return '<span class='+'"'+scheme+'"'+'>'+internal_text+'</span>'})
    return rep
    //return '<span class='+'"'+scheme+'"'+'>'+text+'</span>'
}


function add_div(text) {
    if (text.match(/^<div>([\S\s]*)<\/div>$/)==null) {return '<div>'+text+'</div>'}
    else {return text}
}

function rem_div(text) {
    return text.replace(/^<div>([\S\s]*)<\/div>$/,function (w,g){return g})    
}

function changeColorInCmdMode(event, scheme) {
    var cell = IPython.notebook.get_selected_cell()
    var cm = IPython.notebook.get_selected_cell().code_mirror
    var selectedText = window.getSelection().toString();
    var cell_text = cell.get_text();
    if (selectedText.length==0){
        cell_text=fullCellColor(cell_text,scheme);
    }
    else{
        var identifiedText = align(selectedText,cell_text);
        cell_text = cell_text.replace(identifiedText,addColor(identifiedText,scheme));
    }
    cell.set_text(cell_text);
    cell.render();
    return false;
}

function changeColorInEditMode(event, scheme) {
    var cell = IPython.notebook.get_selected_cell()
    var cm = cell.code_mirror
    var selectedText = cm.getSelection()
    if (selectedText.length==0){
        var cell_text = cell.get_text();
        cell_text=fullCellColor(cell_text,scheme);
        cell.set_text(cell_text);
    }
    else{
        cm.replaceSelection(addColor(selectedText,scheme))
    }
    return false;
}


//*****************************************************************************************
// Utilitary functions for finding a candidate corresponding text from an unformatted selection

/* In case of text selection in rendered cells, the returned text retains no formatting 
therefore, when looking for this text in the actual formatted text, we need to do a 
kind of "fuzzy" alignment. Though there exists specialized libraries for such task, 
we have developed here a simple heuristics that should work 90% of the time, 
but the problem cannot get a perfect solution. 
A first point is to replace special characters that could be interpreded with 
a special meaning in regular expressions. Then the idea is to find the exact matches 
on the longest substring from the beginning of text, then the longest substring 
from the end of the text. Finally, given the locations of the two substring, 
we extract the corresponding global match in the original text. 
*/
function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "#");
    // return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    return str
}

// Extract the longest matching substring from the beginning of the text
function exsub_up(sub, text) {
    for (k = 0; k <= sub.length; k++) {
        if (text.match(sub.substr(0, k)) == null) {
            k = k - 2
            break
        }
    }
    return text.match(sub.substr(0, k + 1))
}

// Extract the longest matching substring from the end of the text
function exsub_down(sub, text) {
    var L = sub.length
    try {
        for (k = 0; k <= sub.length; k++) {
            tst = sub.substr(L - k - 1, L);
            if (text.match(tst) == null) {
                // console.log(tst)
                k = k - 1
                break
            }
        }
        return text.match(sub.substr(L - k - 1, L))
    } catch (e) {
        console.log('Error', e)
        return ""
    }

}

// Function that tries to find the best match of the unformatted 
// text in the formatted one. 

function align(tofind, text) {

    sub = escapeRegExp(tofind)
    textModified = escapeRegExp(text)
    //console.log(textModified.match(sub))
    if (textModified.match(sub) == null) {
        a = exsub_up(sub, textModified)
        b = exsub_down(sub, textModified)
        return text.substr(a.index, b.index + b[0].length - a.index)
    } else {
        var tmpMatch = textModified.match(sub)
        return text.substr(tmpMatch.index, tmpMatch[0].length)
    }
}




//******Toolbar buttons *************************************************

//check for code cells. We do not modify the font of code cells
function colorText(scheme) {
    var cell = IPython.notebook.get_selected_cell();
    var cellType = cell.cell_type;
    if (cellType != "code")
    {
        var rendered = cell.rendered;
        if (rendered) changeColorInCmdMode("", scheme);
        else changeColorInEditMode("", scheme);
    }
    else {
        window.alert("The font of code cells cannot be modified");
    }
}

//create the toolbar extension 
//modify here for new font          
function build_toolbar_fontColor () {
var test = ' <div id="hgl" class="btn-group" role="toolbar"> \
<div class="dropdown">\
  <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\
    <i class="fa fa-paint-brush"></i> <i id="menu-hgl" class="fa fa-caret-down"></i>  </button>\
  </button>\
  <div class="dropdown-menu" aria-labelledby="dropdownMenuButton" style="font-size:20px">\
    <a class="dropdown-item" id="redButton" href="#">Text</a>\
    <a class="dropdown-item" id="redOrangeButton" href="#">Text</a>\
    <a class="dropdown-item" id="orangeButton" href="#">Text</a>\
    <a class="dropdown-item" id="yellowOrangeButton" href="#">Text</a>\
    <a class="dropdown-item" id="yellowButton" href="#">Text</a>\
    <a class="dropdown-item" id="yellowGreenButton" href="#">Text</a>\
    <a class="dropdown-item" id="greenButton" href="#">Text</a>\
    <a class="dropdown-item" id="blueGreenButton" href="#">Text</a>\
    <a class="dropdown-item" id="blueButton" href="#">Text</a>\
    <a class="dropdown-item" id="blueVioletButton" href="#">Text</a>\
    <a class="dropdown-item" id="violetButton" href="#">Text</a>\
    <a class="dropdown-item" id="redVioletButton" href="#">Text</a>\
    <a class="dropdown-item" id="blackButton" href="#">Text</a>\
  </div>\
</div>\
</div>'             

//addd the extension to the toolbar
$("#maintoolbar-container").append(test);
$("#test").css({
    'padding': '5px'
});

//Action
$("#font_menu").attr('title', 'Change color of selected text');

$("#redButton")
    .on('click', function() {
        colorText("red");
    })

$("#redOrangeButton")
    .on('click', function() {
        colorText("redOrange");
    })

$("#orangeButton")
    .on('click', function() {
        colorText("orange");
    })

$("#yellowOrangeButton")
    .on('click', function() {
        colorText("yellowOrange");
    })

$("#yellowButton")
    .on('click', function() {
        colorText("yellow");
    })

$("#yellowGreenButton")
    .on('click', function() {
        colorText("yellowGreen");
    })
    
$("#greenButton")
    .on('click', function() {
        colorText("green");
    })

$("#blueGreenButton")
.on('click', function() {
    colorText("blueGreen");
})

$("#blueButton")
.on('click', function() {
    colorText("blue");
})

$("#blueVioletButton")
.on('click', function() {
    colorText("blueViolet");
})

$("#violetButton")
.on('click', function() {
    colorText("violet");
})

$("#redVioletButton")
.on('click', function() {
    colorText("redViolet");
})

$("#blackButton")
    .on('click', function() {
        colorText("black");
    })
    
} // end build_toolbar


//******************************* MAIN FUNCTION **************************

define(["require",
    'base/js/namespace'
], function(requirejs, Jupyter) {

    var security = requirejs("base/js/security")

    var load_css = function(name) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = requirejs.toUrl(name);
        document.getElementsByTagName("head")[0].appendChild(link);

    };

    //Load_ipython_extension
    var load_ipython_extension = requirejs(['base/js/namespace'], function(Jupyter) {
        "use strict";
        if (Jupyter.version[0] < 3) {
            console.log("This extension requires Jupyter or IPython >= 3.x")
            return
        }

        console.log("[font] Loading fontColor.css");
        load_css('./fontColor.css')

       
        build_toolbar_fontColor();

        var _on_reload = true; /* make sure cells render on reload */

        //highlighter_init_cells(); /* initialize cells */


        /* on reload */
        $([Jupyter.events]).on('status_started.Kernel', function() {

            //highlighter_init_cells();
            console.log("[highlighter] reload...");
            _on_reload = false;
        })

    }); //end of load_ipython_extension function

    return {
        load_ipython_extension: load_ipython_extension,
    };
}); //End of main function

console.log("Loading ./fontColor.js");

