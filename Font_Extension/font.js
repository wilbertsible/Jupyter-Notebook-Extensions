/*
Fonts are definted in highlighter.css
The following functions modies the font of the selected text, according to the scheme chosen by a menu button. More precisely, they replace selected text, both in edit or command mode, by 
a span tag with a given class and the selected text as data.
if no text is selected, then the whole cell is highlighted (using a div tag and a class corresponding to the chosen scheme). A function to remove all csustom font is also provided. 
*/

//this needs to be modified after each font is added (modify here for new font)
function removeFullCellFont(cell_text) {
    cell_text = cell_text.replace(/<div class=(?:"ariel"|"times"|"impact"|"bebas"|"pacifico"|"righteous"|"bowbly"|"robotoblack"|"indie"|"josefin"|"ibarra"|"shadows")>\n([\s\S]*?)<\/div>/g, function(w, g) {
        return g
    })
    return cell_text
}

function fullCellFont(cell_text,scheme) {
    cell_text=removeFullCellFont(cell_text);
    return '<div class='+'"'+scheme+'"'+'>\n'+cell_text+'</div>'
}

function addFont(text,scheme) {
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

function changeFontInCmdMode(event, scheme) {
    var cell = IPython.notebook.get_selected_cell()
    var cm = IPython.notebook.get_selected_cell().code_mirror
    var selectedText = window.getSelection().toString();
    var cell_text = cell.get_text();
    if (selectedText.length==0){
        cell_text=fullCellFont(cell_text,scheme);
    }
    else{
        var identifiedText = align(selectedText,cell_text);
        cell_text = cell_text.replace(identifiedText,addFont(identifiedText,scheme));
    }
    cell.set_text(cell_text);
    cell.render();
    return false;
}

function changeFontInEditMode(event, scheme) {
    var cell = IPython.notebook.get_selected_cell()
    var cm = cell.code_mirror
    var selectedText = cm.getSelection()
    if (selectedText.length==0){
        var cell_text = cell.get_text();
        cell_text=fullCellFont(cell_text,scheme);
        cell.set_text(cell_text);
    }
    else{
        cm.replaceSelection(addFont(selectedText,scheme))
    }
    return false;
}

function removeFont() {
    var cell = IPython.notebook.get_selected_cell();
    var cell_text = removeFullCellFont(cell.get_text());
    //these need to be updated as classes are added
    cell_text = cell_text.replace(/<span class=(?:"ariel"|"times"|"impact")>([\s\S]*?)<\/span>/g, 
        function(w, g) {return g}
)
    cell.set_text(cell_text)
    cell.render();
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



// ***************** Keyboard shortcuts ******************************
//do this for three most popular fonts
var add_cmd_shortcuts = {
    'Alt-g': {
        help: 'highlight selected text',
        help_index: 'ht',
        handler: function(event) {
            changeFontInCmdMode("", mark);
            return false;
        }
    },
    'Alt-h': {
        help: 'highlight selected text',
        help_index: 'ht',
        handler: function(event) {
            changeFontInCmdMode("", burk);
            return false;
        }
    },
};


var add_edit_shortcuts = {
    'Alt-g': {
        help: 'highlight selected text',
        help_index: 'ht',
        handler: function(event) {
            var highlight = mark;
            changeFontInEditMode("", mark);
            return false;
        }
    },
    'Alt-h': {
        help: 'highlight selected text',
        help_index: 'ht',
        handler: function(event) {
            var highlight = burk;
            changeFontInEditMode("", burk);
            return false;
        }
    },
};


//******Toolbar buttons *************************************************

//check for code cells. We do not modify the font of code cells
function fontStyle(scheme) {
    var cell = IPython.notebook.get_selected_cell();
    var cellType = cell.cell_type;
    if (cellType != "code")
    {
        var rendered = cell.rendered;
        if (rendered) changeFontInCmdMode("", scheme);
        else changeFontInEditMode("", scheme);
    }
    else {
        window.alert("The font of code cells cannot be modified");
    }
}

//create the toolbar extension 
//modify here for new font          
function build_toolbar_fontStyle() {
var test = ' <div id="hgl" class="btn-group" role="toolbar"> \
<div class="dropdown">\
  <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\
    <i class="fa fa-font"></i> <i id="menu-hgl" class="fa fa-caret-right"></i>  </button>\
  </button>\
  <div class="dropdown-menu" aria-labelledby="dropdownMenuButton" style="font-size:20px">\
    <a class="dropdown-item" id="arielButton" href="#">Ariel</a>\
    <a class="dropdown-item" id="timesButton" href="#">TimesNewRoman</a>\
    <a class="dropdown-item" id="impactButton" href="#">Impact</a>\
    <a class="dropdown-item" id="bebasButton" href="#">Bebas Neue</a>\
    <a class="dropdown-item" id="pacificoButton" href="#">Pacifico</a>\
    <a class="dropdown-item" id="righteousButton" href="#">Righteous</a>\
    <a class="dropdown-item" id="bowblyButton" href="#">Bowlby One</a>\
    <a class="dropdown-item" id="robotoblackButton" href="#">Roboto</a>\
    <a class="dropdown-item" id="indieButton" href="#">Indie</a>\
    <a class="dropdown-item" id="josefinButton" href="#">Josefin Sans</a>\
    <a class="dropdown-item" id="ibarraButton" href="#">Ibarra Nova</a>\
    <a class="dropdown-item" id="shadowsButton" href="#">Shadows</a>\
    <a class="dropdown-item" id="removeFontButton" href="#">Default</a>\
  </div>\
</div>\
</div>'             

//addd the extension to the toolbar
$("#maintoolbar-container").append(test);
$("#test").css({
    'padding': '5px'
});

//Actions
$/*("#font_menu").attr('title', 'Change font of selected text');*/

$("#arielButton")
    .on('click', function() {
        fontStyle("ariel");
    })

$("#timesButton")
    .on('click', function() {
        fontStyle("times");
    })

$("#impactButton")
    .on('click', function() {
        fontStyle("impact");
    })

$("#bebasButton")
    .on('click', function() {
        fontStyle("bebas");
    })

$("#pacificoButton")
    .on('click', function() {
        fontStyle("pacifico");
    })

$("#righteousButton")
    .on('click', function() {
        fontStyle("righteous");
    })
    
$("#bowblyButton")
    .on('click', function() {
        fontStyle("bowbly");
    })

$("#robotoblackButton")
.on('click', function() {
    fontStyle("robotoblack");
})

$("#indieButton")
.on('click', function() {
    fontStyle("indie");
})

$("#josefinButton")
.on('click', function() {
    fontStyle("josefin");
})

$("#shadowsButton")
.on('click', function() {
    fontStyle("shadows");
})

$("#ibarraButton")
.on('click', function() {
    fontStyle("ibarra");
})

$("#removeFontButton")
    .on('click', function() {
        removeFont()
    })
    .attr('title', 'Remove highlightings in selected cell');


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

        IPython.keyboard_manager.edit_shortcuts.add_shortcuts(add_edit_shortcuts);
        IPython.keyboard_manager.command_shortcuts.add_shortcuts(add_cmd_shortcuts);

        build_toolbar_fontStyle();

        var _on_reload = true; /* make sure cells render on reload */

        //highlighter_init_cells(); /* initialize cells */


        /* on reload */
        $([Jupyter.events]).on('status_started.Kernel', function() {

            //highlighter_init_cells();
            console.log("[font] reload...");
            _on_reload = false;
        })

    }); //end of load_ipython_extension function

    return {
        load_ipython_extension: load_ipython_extension,
    };
}); //End of main function

console.log("Loading ./font.js");

