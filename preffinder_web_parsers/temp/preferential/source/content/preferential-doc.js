/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 * The contents of this file are subject to the Netscape Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/NPL/
 * 
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 * 
 * The Original Code is Mozilla Communicator client code, released
 * March 31, 1998.
 * 
 * The Initial Developer of the Original Code is Netscape
 * Communications Corporation. Portions created by Netscape are
 * Copyright (C) 1998-1999 Netscape Communications Corporation. All
 * Rights Reserved.
 *
 * Contributors:
 *  Stephen Bounds <guruj@mbox.com.au>
 *  Chip Clark <chipc@netscape.com>
 *  Seth Spitzer <sspitzer@netscape.com>
 *  Matthew Bucket <buckett@bumph.org>
 */

/*
 * TODO: remove DEBUG code lines
 */

/* NB:
 * requires "chrome://preferential/content/tree-utils.js" preloaded in XUL
 */

/* ------ Custom View definition ------ */

var prefsTree = new XULTreeView();

function PrefsRecord (pref, lock, type, value, hint) 
{
    this.setColumnPropertyName ("prefCol", "pref");
    this.setColumnPropertyName ("lockCol",  "lock");    
    this.setColumnPropertyName ("typeCol",  "type");    
    this.setColumnPropertyName ("valueCol", "value");    
    this.setColumnPropertyName ("hintCol", "hint");    
    this.pref = pref;
    this.lock = lock;
    this.type = type;
    this.value = value;
    this.hint = hint;
}

PrefsRecord.prototype.getCellProperties = 
    function prf_cellprops(index, col, prop) {};

PrefsRecord.prototype = new XULTreeViewRecord(prefsTree.share);

/* ----- Data generation variables/constants ----- */

// XPCOM constant shortcuts

const nsIPrefLocalizedString = Components.interfaces.nsIPrefLocalizedString;
const nsISupportsString = Components.interfaces.nsISupportsString;

// Preference status & type information lookup
var gBundle;
var gLockStrs;
var gTypeStrs;

const kDefault = 0;  const kUserSet = 1;  const kLocked = 2;
const kStrType = 0;  const kIntType = 1;  const kBoolType = 2;

// Last string searched for
var findText = "";

/* ----- Load RDF files (hints & enums) ----- */

// The rdf service
const RDF_URI = '@mozilla.org/rdf/rdf-service;1';
var RDF = Components.classes[RDF_URI].getService();
RDF = RDF.QueryInterface(Components.interfaces.nsIRDFService);

// The rdf-container service
const RDF_CONTAINER_URI = '@mozilla.org/rdf/container;1';
var RDFC = Components.classes[RDF_CONTAINER_URI].getService();
RDFC = RDFC.QueryInterface(Components.interfaces.nsIRDFContainer);

// constants identifying the hints RDF
const HINT_URI = "chrome://preferential/locale/preferential-descriptions.rdf";
const HINT_ID = "http://preferential.mozdev.org/HINT-rdf#";
const HINT_VALUE_ID = HINT_ID + 'value';
const HINT_TYPE_ID = HINT_ID + 'type';
const HINT_PREFIX = "urn:preferential:hint:";

var hint_rds = RDF.GetDataSource(HINT_URI);

// constants identifying the hints RDF
const ENUM_URI = "chrome://preferential/locale/preferential-enums.rdf";
const ENUM_ID = "http://preferential.mozdev.org/ENUM-rdf#";
const ENUM_HINT_ID = ENUM_ID + 'hint';
const ENUM_VALUE_ID = ENUM_ID + 'value';
const ENUM_PREFIX = "urn:preferential:enum:";

var enum_rds = RDF.GetDataSource(ENUM_URI);

/* ----- Global Pref Vars ----- */

// global pref vars
var prefCount = {value:0};
var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
var prefBranch = prefService.getBranch(null);
var prefArray = prefBranch.getChildList("" , prefCount);
// Once array is sorted, we can create hierarchy trees based upon
// similarities and finding '.'s
prefArray.sort();
var prefName, prefType, prefValue, prefIndex, prefLockState;

// these arrays contain preference hierarchy information to determine
// when new headings are required to be started/finished
var thisHierarchy = new Array();
var lastHierarchy = new Array();

// max number of splits for preference hierarchies
const splitLimit = 6;
// how often to update the progress bar
const SLICE_SIZE = 50;
// how long to wait between slices
const LOAD_DELAY = 0;
// contains the tree items currently being worked on in the hierarchy
var level = new Array(splitLimit);  

/* ----- Event Trigger Functions ----- */

function onPrefLoad()
{
    // Load string constants from properties bundle
    gBundle = document.getElementById("bundle");

    // Preference status & type information lookup
    gLockStrs = [gBundle.getString("statusDefault"),
                     gBundle.getString("statusUser"),
                     gBundle.getString("statusLocked")];

    gTypeStrs = [gBundle.getString("typeChar"),
                     gBundle.getString("typeInt"),
                     gBundle.getString("typeBool")];

    // tie prefsTree var to prefsTree in DOM
    var gTree = document.getElementById("prefsTree");
    // PREMOZ 1.8 NIGHTLIES gTree.treeBoxObject.view = prefsTree;
    gTree.view = prefsTree;

    // load tree values next
    setTimeout('prefLoadTree(0)', LOAD_DELAY);

    // Done!
    progressBar(100);    
}

function prefLoadTree(slice)
{
    var i = slice * SLICE_SIZE;   // Counter for iterating through preferences

    // call prefLoadItem to load defs for this slice
    while(i < prefCount.value && i < (slice+1)*SLICE_SIZE) {
      prefLoadItem(i);
      // update progress meter
      i++;
    }
    progressBar(Math.round(100*(i/prefCount.value)));
    // call again for next slice
    if (i < prefCount.value) 
      setTimeout('prefLoadTree('+(slice+1)+')', LOAD_DELAY);
}

function onPrefUnload()
{

}

// repeatedly call this function with setTimeout until we are at
// the end of the list
function prefLoadItem(i) {
    var x = 0;   // This is an internal counter for iterating through
                 // headings 

    // DEBUGGING flag
    var _DEBUG = false;

    // As of 1/1/02 capability prefs will be displayed, unless a 
    // good reason is made NOT to...
	    // avoid displaying "private" preferences
    //if((prefArray[i].indexOf("capability", 0) + 1) > 0) continue;
    //

    // generate tree row values
    if (prefBranch.prefIsLocked(prefArray[i]))
      prefLockState = gLockStrs[kLocked];
    else if(prefBranch.prefHasUserValue(prefArray[i]))
      prefLockState = gLockStrs[kUserSet];
    else
      prefLockState = gLockStrs[kDefault];

    const nsIPrefBranch = Components.interfaces.nsIPrefBranch;

    try {
        switch (prefBranch.getPrefType(prefArray[i])) {
            case nsIPrefBranch.PREF_INT:
                prefType = gTypeStrs[kIntType];
                // convert to a string
                prefValue = prefBranch.getIntPref(prefArray[i]).toString();
                    break;
            case nsIPrefBranch.PREF_BOOL:
                prefType = gTypeStrs[kBoolType];
                // convert to a string
                prefValue = prefBranch.getBoolPref(prefArray[i]).toString();
                    break;
            case nsIPrefBranch.PREF_STRING:
                prefType = gTypeStrs[kStrType];
                // Insert new code from about:config 23/5/2003
                prefValue = prefBranch.getComplexValue(prefArray[i], nsISupportsString).data;
                // Try in case it's a localized string (will throw an exception if not)
                if (prefLockState == gLockStrs[kDefault])
                  prefValue = prefBranch.getComplexValue(prefArray[i], nsIPrefLocalizedString).data;
                    break;
                // old code left here commented out
                //prefType = gTypeStrs[kStrType];
                //prefValue = htmlEscape(prefBranch.getCharPref(prefArray[i]));
                //  break;
            default:
                alert(gBundle.getString(msgErrorElement) + prefArray[i]);
        }
    }
    catch (e) {
        // catch cases where pref exists but has no default or user value
    }

    // copy old hierarchy
    delete lastHierarchy;
    for (x=0; x<thisHierarchy.length; x++) {
        lastHierarchy[x] = thisHierarchy[x];
    }

    // generate new hierarchy        
    delete thisHierarchy;
    thisHierarchy = htmlEscape(prefArray[i]).split('.',splitLimit);
    for (x=1; x<thisHierarchy.length; x++) {
        thisHierarchy[x] = thisHierarchy[x-1] + '.' + thisHierarchy[x];
    }

    if (_DEBUG) alert('this:\n' + 
             + thisHierarchy[0] + '\n' + thisHierarchy[1] + '\n'
             + thisHierarchy[2] + '\n' + thisHierarchy[3] + '\n'
 + 'last:\n' + lastHierarchy[0] + '\n' + lastHierarchy[1] + '\n\n'
             + lastHierarchy[2] + '\n' + lastHierarchy[3] + '\n');
    
    // insert new headings as required
    for (x=thisHierarchy.length-1; x >= 0; x--) {
        // unset values for any non-leaf entries
        if (x < thisHierarchy.length-1) {
            prefLockState=""; prefType=""; prefValue="";
        }

        // FURTHER UP THE TREE
        if (thisHierarchy[x] != lastHierarchy[x] || 
            lastHierarchy[x] == undefined) {
            if (_DEBUG) alert('creating record: (overwrite)');
            // GENERIC HINTS V2 START
            // check if this is a 'generic' (ie. FOO) hint
            deSpecPrefArray = despecifyPref(thisHierarchy[x]).split(",",2);
            thisPrefName = deSpecPrefArray[0];
            thisPrefInstance = deSpecPrefArray[1]; 
            
            // generate 'hint' if found in RDF datastore
		        var hint_node = hint_rds.GetTarget(
                 RDF.GetResource(HINT_PREFIX + thisPrefName),
                 RDF.GetResource(HINT_VALUE_ID),true);
            if (hint_node != undefined) {
                hint = hint_node.QueryInterface(Components.interfaces.nsIRDFLiteral).Value;
                if (thisPrefInstance) { hint = hint.replace(/FOO/, thisPrefInstance); }
            }
            else {
                // all falls through -- mark as blank
                hint = "";
            }
            // create the preferences node
            level[x] = new PrefsRecord(thisHierarchy[x], 
                prefLockState, prefType, prefValue, hint);
            nextAppendChild = true;
        }

        // append children (if any) to this node
        if (x < (thisHierarchy.length-1)) {
            if (thisHierarchy[x+1] != lastHierarchy[x+1]) {
                if (_DEBUG) alert(i + ': appending: ' + thisHierarchy[x+1] + ' to ' + thisHierarchy[x]);            
                if (level[x].childData == undefined)
                    level[x].reserveChildren();
                level[x].appendChild(level[x+1]);
            }
        }

        // SPECIAL HANDLING FOR ROOT ENTRIES (ie. x=0)
        if (x==0) {
            if (_DEBUG) alert(i + ': handle root');
            // append to root of tree each time base level changes
            if (thisHierarchy[x] != lastHierarchy[x] || 
               lastHierarchy[x] == undefined) {
                if (_DEBUG) alert(i + ': append to root: ' + thisHierarchy[x]);
                prefsTree.childData.appendChild(level[x]);
            }
        }
        if (_DEBUG) alert('done this loop');
    }
} 


function PrefNewClick()
{
    var row = prefsTree.childData.locateChildByVisualRow(prefsTree.selectedIndex);
    window.openDialog("chrome://preferential/content/preferential-new.xul",
                      "newPrefDialog","chrome,modal",row.pref,row.lock,row.type,row.value,gBundle);
}

function PrefEditClick()
{
    var row = prefsTree.childData.locateChildByVisualRow(prefsTree.selectedIndex);
    
    // boolean preferences get an enumerated window
    if (row.type == gTypeStrs[kBoolType]) {
        var enumArray = Array(2);
        enumArray[0] = {label:gBundle.getString("constTrue"), value:-1}; 
        enumArray[1] = {label:gBundle.getString("constFalse"), value:0};
        window.openDialog("chrome://preferential/content/preferential-edit-enum.xul",
                      "editPrefDialog","chrome,modal",row.pref,row.lock,row.type,row.value,row.hint,enumArray,gBundle);
    }
    // TODO: if RDF enum list found, open enumerated window
    else {
        try {
            var parent = RDF.GetResource(ENUM_PREFIX + row.pref);

            if (parent != undefined) {
                RDFC.Init(enum_rds, parent);
                var options_found = RDFC.GetElements();

                var enumEntries = 0; 
                var enumArray = Array(enumEntries);

                while(options_found.hasMoreElements()) {
                    var option_detail = options_found.getNext()
                            .QueryInterface(Components.interfaces.nsIRDFResource);
                    var option_hint = enum_rds.GetTarget(option_detail,
                                    RDF.GetResource(ENUM_HINT_ID),true)
                                    .QueryInterface(Components.interfaces.nsIRDFLiteral).Value;
                    var option_value = enum_rds.GetTarget(option_detail,
                                    RDF.GetResource(ENUM_VALUE_ID),true)
                                    .QueryInterface(Components.interfaces.nsIRDFLiteral).Value;
                    enumArray[enumEntries++] = {label:option_hint, value:option_value};
                }
            }

            if (enumEntries == 0)
                window.openDialog("chrome://preferential/content/preferential-edit.xul",
                                  "editPrefDialog","chrome,modal",row.pref,row.lock,row.type,row.value,row.hint,gBundle);
            else
                window.openDialog("chrome://preferential/content/preferential-edit-enum.xul",
                                  "editPrefDialog","chrome,modal",row.pref,row.lock,row.type,row.value,row.hint,enumArray,gBundle);

        }
        catch (e)
        {
            window.openDialog("chrome://preferential/content/preferential-edit.xul",
                              "editPrefDialog","chrome,modal",row.pref,row.lock,row.type,row.value,row.hint,gBundle);
        }
    }

}

function PrefDeleteClick()
{
    var row = prefsTree.childData.locateChildByVisualRow(prefsTree.selectedIndex);
    window.openDialog("chrome://preferential/content/preferential-delete.xul",
                      "deletePrefDialog","chrome,modal",row.pref,row.lock,row.type,row.value,row.hint,gBundle);
}

function PrefDisplayPrefsJSClick()
{
    var row = prefsTree.childData.locateChildByVisualRow(prefsTree.selectedIndex);
    window.openDialog("chrome://preferential/content/preferential-prefsjs.xul",
                      "prefsJSDialog","chrome,modal",row.pref,row.lock,row.type,row.value,row.hint,gBundle);
}

function PrefReloadClick()
{
    window.location.reload();
}

function PrefHelpAboutClick()
{
    window.openDialog("chrome://preferential/content/preferential-about.xul","aboutDialog","chrome");
}

function PrefExpandClick()
{
    var row = prefsTree.childData.locateChildByVisualRow(prefsTree.selectedIndex);
    if (row.isContainerOpen == false) {
        prefsTree.toggleOpenState(prefsTree.selectedIndex);
    }
}

function PrefCollapseClick()
{
    var row = prefsTree.childData.locateChildByVisualRow(prefsTree.selectedIndex);
    if (row.isContainerOpen == true) {
        prefsTree.toggleOpenState(prefsTree.selectedIndex);
    }
}

function PrefExpandAllClick()
{
    // Show undetermined progress bar
    progressBar(-1);

    var rowIndex = prefsTree.selectedIndex;
    var startIndex = rowIndex;
    // get initial indentation level
    var initialIndent = prefsTree.getLevel(rowIndex);

    // go down through each row and expand branches as we go until 
    // we drop below our original indentation level
    do {
        var row = prefsTree.childData.locateChildByVisualRow(rowIndex);
        if (("childData" in row) && row.isContainerOpen == false) {
            prefsTree.toggleOpenState(rowIndex);
        }
        rowIndex++;
    } while (prefsTree.getLevel(rowIndex) > initialIndent)

    // Finished!
    progressBar(100);
}

function PrefCollapseAllClick()
{
    // Show undetermined progress bar
    progressBar(-1);

    var rowIndex = prefsTree.selectedIndex;
    var startIndex = rowIndex;
    var row = prefsTree.childData.locateChildByVisualRow(rowIndex);
    // get initial indentation level
    var initialIndent = prefsTree.getLevel(rowIndex++);
    // find point at which we drop below our original indentation level;
    while (prefsTree.getLevel(rowIndex) > initialIndent)
        row = prefsTree.childData.locateChildByVisualRow(rowIndex++);
    // next, work back upwards, collapsing as we go until we reach starting
    // point again
    row = prefsTree.childData.locateChildByVisualRow(--rowIndex);  
    while (rowIndex >= startIndex && row != undefined) {
        if (("childData" in row) && row.isContainerOpen == true) {
            prefsTree.toggleOpenState(rowIndex);
        }        
        var row = prefsTree.childData.locateChildByVisualRow(--rowIndex);
    }

    // Finished!
    progressBar(100);
}

function PrefFindClick()
{
    // get text to find
    var x = prompt(gBundle.getString("msgPromptFind"),"");

    if (x != null) { 
        findText = x;
        // now search for text
        PrefFind(0);
    }
}

function PrefFindNextClick()
{
    PrefFind(+1);
}

function PrefFind(offset)
{
    // Show undetermined progress bar
    progressBar(-1);

    // go to row offset specified (if there is one & it's possible)
    try {
        var rowIndex = prefsTree.selectedIndex + offset;
    }
    catch(e) {
        var rowIndex = prefsTree.selectedIndex;
    }

    var startIndex = rowIndex;
    var textFound = false;
    var endRows = false;

    if (findText == "") {
        alert(gBundle.getString("msgErrorFindIsBlank"));
        return;
    }

    // go down through each row and expand branches as we go until 
    // a match is found or the end of the tree is reached
    do {
        try {
            var row = prefsTree.childData.locateChildByVisualRow(rowIndex);
            // expand container if needed
            if (("childData" in row) && row.isContainerOpen == false) {
                prefsTree.toggleOpenState(rowIndex);
            }

            // check for matching text in this row using regular expression
            if (row.pref.search(eval('/'+findText+'/i')) > -1) textFound = true;
            if (row.value.search(eval('/'+findText+'/i')) > -1) textFound = true;
            if (row.hint.search(eval('/'+findText+'/i')) > -1) textFound = true;
        }
        // if we cannot get next row - we've hit bottom
        catch (e) {
           // ask if user wants to start again from the top
           if(window.confirm(gBundle.getString("msgConfirmNoMoreFindMatches"))) {
               rowIndex = 0;
           }
           else 
               endRows = true;
        }
        rowIndex++;
    } while (textFound == false && endRows == false)

    // Highlight row we've just visited
    prefsTree.selectedIndex = rowIndex - 1;
    prefsTree.scrollTo(rowIndex - 1, 0); // align: -1 = top; 0 = middle; +1 = bottom

    // Finished!
    progressBar(100);
}

function PrefFilterClick()
{
    // Show undetermined progress bar
    progressBar(-1);

    var filterText = prompt(gBundle.getString("msgPromptFilter"),"");

    if (filterText != null) {

        // go to start of list
        prefsTree.selectedIndex = 0;
        var rowIndex = prefsTree.selectedIndex;
        var startIndex = rowIndex;
        var textFound = false;

        if (filterText == "") {
            alert(gBundle.getString("msgErrorFilterIsBlank"));
            return;
        }

        // go down through each row and expand branches as we go until 
        // a match is found or the end of the tree is reached
        do {
            var textFound = false; var endRows = false;
            try {
                var row = prefsTree.childData.locateChildByVisualRow(rowIndex);
                // expand container if needed
                if (("childData" in row) && row.isContainerOpen == false) {
                    prefsTree.toggleOpenState(rowIndex);
                }

                // check for matching text in this row using regular expression
                if (row.pref.search(eval('/'+filterText+'/i')) > -1) textFound = true;
                if (row.value.search(eval('/'+filterText+'/i')) > -1) textFound = true;
                if (row.hint.search(eval('/'+filterText+'/i')) > -1) textFound = true;

                if ((textFound == false) && (row.isHidden == false)) {
                    row.hide();           // try row.unHide() to unHide row
                }
            }
            // bomb out if we cannot get next row
            catch (e) {
                endRows = true;
            }
            rowIndex++;
        } while (endRows == false)

        // Highlight top row
        prefsTree.selectedIndex = 0;
        prefsTree.scrollTo(0, -1); // align: -1 = top; 0 = middle; +1 = bottom
    }

    // Finished!
    progressBar(100);
}

function PrefUnfilterClick()
{
    // Show undetermined progress bar
    progressBar(-1);

    if(!window.confirm(gBundle.getString("msgPromptUnfilter"))) {
        return;
    }

    // only temporary until a better option is found
    PrefReloadClick();

//    // go to start of list
//    prefsTree.selectedIndex = 0;
//    var rowIndex = prefsTree.selectedIndex;
//    var startIndex = rowIndex;
//    var textFound = false;
//
//    // go down through each row and expand branches as we go until 
//    // a match is found or the end of the tree is reached
//    do {
//        var textFound = false; var endRows = false;
//        try {
//            var row = prefsTree.childData.locateChildByVisualRow(rowIndex);
//            // expand container if needed
//            if (("childData" in row) && row.isContainerOpen == false) {
//                prefsTree.toggleOpenState(rowIndex);
//            }
//            if (row.isHidden == true) row.unHide();
//        }
//        // bomb out if we cannot get next row
//        catch (e) {
//            endRows = true;
//        }
//        rowIndex++;
//    } while (endRows == false)
//
//    // Highlight starting row again
//    prefsTree.selectedIndex = 0;

    // Finished!
    progressBar(100);
}

function PrefBookmarkAddClick()
{
  // For bookmarks, we need to modify the preferential-bookmarks.rdf
  // datasource using Assert and so on.
}

function PrefBookmarkRemoveClick()
{

}


/* --------- UTILITY FUNCTIONS --------- */

function htmlEscape(s) 
{ 
    s = s.replace(/\&/g, "&amp;"); 
    s = s.replace(/\>/g, "&gt;"); 
    s = s.replace(/\</g, "&lt;"); 
    return s; 
}

function progressBar(percent)
{
    setTimeout('asyncProgressBar(' + percent + ')', 1);
}

function asyncProgressBar(percent)
{
    if (percent < 100)
        document.getElementById('dialog.progressText').value = gBundle.getString("msgProgressBuilding");
    else 
        document.getElementById('dialog.progressText').value = gBundle.getString("msgProgressDone");

    if (percent >= 0) {
        document.getElementById('dialog.progress').mode = 'determined';
        document.getElementById('dialog.progress').value = percent;
    }
    else {
        document.getElementById('dialog.progress').mode = 'undetermined';
    }
}

/* --------- HACK FUNCTIONS ----------- */
// This function allows the conversion of certain prefs that appear multiple
// times in the preference file (eg. ldap.bigfoot.name, ldap.whowhere.name)
// into a generic name (eg. ldap.FOO.name).
function despecifyPref(prefName)
{
  var specialCases = [ 	"^(capability\.policy\.)([^\.]+)(.*)", 
			      "^(editor\.history_title_)([^\.]+)(.*)",
				"^(editor\.history_url_)([^\.]+)(.*)",
				"^(editor\.publish\.site_data\.)(.+)(.*)",
				"^(editor\.publish\.site_name\.)(.+)(.*)",
				"^(editor\.toolbars\.showbutton\.)([^\.]+)(.*)",
				"^(font\.name-list\.)([^\.]+)(.*)",
				"^(font\.name\.)([^\.]+)(.*)",
				"^(font\.size\.)([^\.]+)(.*)",
				"^(games\.cards\.)([^\.]+)(.*)",
				"^(general\.startup\.)([^\.]+)(.*)",
				"^(intl\.charsetmenu\.browser\.more)(.+)(.*)",
				"^(intl\.fallbackCharsetList\.)([^\.]+)(.*)",
				"^(ldap_1\.directory)([^\.]+)(.*)",
				"^(ldap_2\.servers\.)([^\.]+)(.*)",
				"^(mail\.account\.)([^\.]+)(.*)",
				"^(mail\.identity\.)([^\.]+)(.*)",
				"^(mail\.server\.)([^\.]+)(.*)",
				"^(mail\.smtpserver\.)([^\.]+)(.*)",
                		"^(plugin\.scan\.)([^\.]+)(.*)",
				"^(mail\.toolbars\.showbutton\.)([^\.]+)(.*)",
				"^(security\.ssl2\.)([^\.]+)(.*)",
				"^(security\.ssl3\.)([^\.]+)(.*)"
                     ];

  var name = prefName;
  for (var index in specialCases) {
    caseMatch = specialCases[index]; var nameInstance = undefined;
    var regExp = eval("/"+caseMatch+"/");
    if (name.match(regExp)) nameInstance = name.match(regExp)[2];
    if (nameInstance != undefined) {
      genericName = name.replace(regExp, "$1"+"FOO"+"$3");
      return genericName+","+nameInstance;
    }
  }
  return prefName;
}