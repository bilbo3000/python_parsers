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
 */

/* ----- Global Variables ----- */
var pref, lock, type, value, enumArray, gBundle;

// Load string constants from properties bundle

/* ----- Event Trigger Functions ----- */

function onPrefEditLoad()
{
    // convert window arguments to friendly names
    pref  = window.arguments[0];
    lock  = window.arguments[1];
    type  = window.arguments[2];
    value = window.arguments[3];
    hint  = window.arguments[4];
    enumArray = window.arguments[5];
    gBundle = window.arguments[6];


    // set pref 
    document.getElementById('prefKeyText').value = pref;
    document.getElementById('hintText').value = hint;

    // populate popup listbox here
    for (var i=0; i<enumArray.length; i++) {
       document.getElementById('valueEnum').appendItem(
           enumArray[i].label + ' (' + enumArray[i].value + ')', enumArray[i].value);
       // if current option matches current value, mark this as 'selected'
       // and set box value to that of 'hint text' instead
       if (enumArray[i].value == value) {
           document.getElementById('valueEnum').selectedIndex = i;
           document.getElementById('valueEnum').value = enumArray[i].label;
       }
    }
    // set current value
    document.getElementById('valueEnum').value = value;
}

function onPrefEditAccept()
{
    var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    var prefBranch = prefService.getBranch(null);
    
    try {
        // check for selectedIndex -- if -1, then must be a custom value
        if (document.getElementById('valueEnum').selectedIndex == -1) {
            var prefVal = document.getElementById('valueEnum').value;
        }
        else {
            // otherwise look up from array
            var prefVal = enumArray[document.getElementById('valueEnum').selectedIndex].value;
        }

        switch (type) {
            case gBundle.getString("typeChar") : 
                prefBranch.setCharPref(pref, prefVal);
                break;
            case gBundle.getString("typeInt") :
                prefBranch.setIntPref(pref, prefVal);
                break;
            case gBundle.getString("typeBool") :
                prefBranch.setBoolPref(pref, prefVal);
                break;
            default:
                alert(gBundle.getString("msgErrorNoType"));
                window.close();
        }
        var msg = gBundle.getString("msgSuccessEdit");
    }
    catch (e) {
        var msg = gBundle.getString("msgErrorEdit");
    }
    // Reload source prefs window
    reload(msg);
    
    window.close();
}

function onPrefEditCancel()
{
    window.close();
}

function reload(msg)
{
    if(window.confirm(msg + "\u000a\u000a" + gBundle.getString("msgConfirmReload"))) {
      window.opener.location.reload();
      return true;
    }
    else 
      return false;
}