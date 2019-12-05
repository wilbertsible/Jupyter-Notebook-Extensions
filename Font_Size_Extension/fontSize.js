/*
Sizes are defined in the fontSize.css
This code is used to change the size of the selected text to the menu option selected 
*/



function fullCellSize(cell_text,scheme) {
    
    return '<div class='+'"'+scheme+'"'+'>\n'+cell_text+'</div>'
}

function addSize(text,scheme) {
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

function changeSizeInCmdMode(event, scheme) {
    var cell = IPython.notebook.get_selected_cell()
    var cm = IPython.notebook.get_selected_cell().code_mirror
    var selectedText = window.getSelection().toString();
    var cell_text = cell.get_text();
    if (selectedText.length==0){
        cell_text=fullCellSize(cell_text,scheme);
    }
    else{
        var identifiedText = align(selectedText,cell_text);
        cell_text = cell_text.replace(identifiedText,addSize(identifiedText,scheme));
    }
    cell.set_text(cell_text);
    cell.render();
    return false;
}

function changeSizeInEditMode(event, scheme) {
    var cell = IPython.notebook.get_selected_cell()
    var cm = cell.code_mirror
    var selectedText = cm.getSelection()
    if (selectedText.length==0){
        var cell_text = cell.get_text();
        cell_text=fullCellSize(cell_text,scheme);
        cell.set_text(cell_text);
    }
    else{
        cm.replaceSelection(addSize(selectedText,scheme))
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
function changeTextSize(scheme) {
    var cell = IPython.notebook.get_selected_cell();
    var cellType = cell.cell_type;
    if (cellType != "code")
    {
        var rendered = cell.rendered;
        if (rendered) changeSizeInCmdMode("", scheme);
        else changeSizeInEditMode("", scheme);
    }
    else {
        window.alert("The font of code cells cannot be modified");
    }
}

//create the toolbar extension 
//modify here for new font          
function build_toolbar () {
var test = ' <div id="hgl" class="btn-group" role="toolbar"> \
<div class="dropdown">\
  <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\
    <i class="fa fa-text-height"></i> <i id="menu-hgl" class="fa fa-caret-down"></i>  </button>\
  </button>\
  <div class="dropdown-menu" aria-labelledby="dropdownMenuButton" style="font-size:20px">\
    <a class="dropdown-item" id="font8Button" href="#">8     </a>\
    <a class="dropdown-item" id="font10Button" href="#">10    </a>\
    <a class="dropdown-item" id="font12Button" href="#">12    </a>\
    <a class="dropdown-item" id="font14Button" href="#">14    </a>\
    <a class="dropdown-item" id="font16Button" href="#">16    </a>\
    <a class="dropdown-item" id="font18Button" href="#">18    </a>\
    <a class="dropdown-item" id="font20Button" href="#">20    </a>\
    <a class="dropdown-item" id="font22Button" href="#">22    </a>\
    <a class="dropdown-item" id="font24Button" href="#">24     </a>\
    <a class="dropdown-item" id="font26Button" href="#">26     </a>\
    <a class="dropdown-item" id="font28Button" href="#">28     </a>\
    <a class="dropdown-item" id="font30Button" href="#">30     </a>\
    <a class="dropdown-item" id="font32Button" href="#">32     </a>\
    <a class="dropdown-item" id="font34Button" href="#">34     </a>\
  </div>\
</div>\
</div>'             

//addd the extension to the toolbar
$("#maintoolbar-container").append(test);
$("#test").css({
    'padding': '5px'
});

//Actions
$("#font_menu").attr('title', 'Change font of selected text');



$("#font8Button")
    .on('click', function() {
        changeTextSize("font8");
        
    })

$("#font10Button")
.on('click', function() {
    changeTextSize("font10");
})

$("#font12Button")
.on('click', function() {
    changeTextSize("font12");
})

$("#font14Button")
.on('click', function() {
    changeTextSize("font14");
})

$("#font16Button")
.on('click', function() {
    changeTextSize("font16");
})

$("#font18Button")
.on('click', function() {
    changeTextSize("font18");
})

$("#font20Button")
.on('click', function() {
    changeTextSize("font20");
})

$("#font22Button")
.on('click', function() {
    changeTextSize("font22");
})

$("#font24Button")
    .on('click', function() {
        changeTextSize("font24");
    })

$("#font26Button")
    .on('click', function() {
        changeTextSize("font26");
    })

$("#font28Button")
    .on('click', function() {
        changeTextSize("font28");
    })

$("#font30Button")
    .on('click', function() {
        changeTextSize("font30");
    })

$("#font32Button")
    .on('click', function() {
        changeTextSize("font32");
    })

$("#font34Button")
    .on('click', function() {
        changeTextSize("font34");
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

        console.log("[font] Loading font.css");
        load_css('./font.css')

        
        build_toolbar();

        var _on_reload = true; /* make sure cells render on reload */

 


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

console.log("Loading ./fontSize.js");

