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
var pref, lock, type, value;

/* ----- Event Trigger Functions ----- */

function onPrefDeleteLoad()
{
    // convert window arguments to friendly names
    pref  = window.arguments[0];
    lock  = window.arguments[1];
    type  = window.arguments[2];
    value = window.arguments[3];
    hint  = window.arguments[4];
    gBundle = window.arguments[5];

    document.getElementById('prefKeyText').value = pref;
    document.getElementById('hintText').value = hint;
}

function onPrefDeleteAccept()
{
    var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    var prefBranch = prefService.getBranch(null);
    
    if (document.getElementById('deleteType').value == "reset") {
        try {
            prefBranch.clearUserPref(pref);
            var msg = gBundle.getString("msgSuccessReset");
        }
        catch (e) {
            var msg = gBundle.getString("msgErrorReset");
        }
    }
    else {
        try {
            prefBranch.deleteBranch(pref);
            var msg = gBundle.getString("msgSuccessDelete");
        }
        catch (e) {
            var msg = gBundle.getString("msgErrorDelete");
        }       
    }
    // Reload source prefs window
    reload(msg);
    window.close();
}

function onPrefDeleteCancel()
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