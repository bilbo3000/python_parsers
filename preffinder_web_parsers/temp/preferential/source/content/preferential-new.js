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

function onPrefNewLoad()
{
    // convert window arguments to friendly names
    pref  = window.arguments[0];
    lock  = window.arguments[1];
    type  = window.arguments[2];
    value = window.arguments[3];
    gBundle = window.arguments[4];

    document.getElementById('prefKeyText').value = pref;
}

function onPrefNewAccept()
{
    var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    var prefBranch = prefService.getBranch(null);
    
    try {
        switch (document.getElementById('prefNewType').value) {
            case 'text' : 
                prefBranch.setCharPref(
                  document.getElementById('prefKeyText').value,
                  document.getElementById('valueText').value);
                break;
            case 'int' :
                prefBranch.setIntPref(
                  document.getElementById('prefKeyText').value,
                  document.getElementById('valueInt').value);
                break;
            case 'bool' :
                prefBranch.setBoolPref(
                  document.getElementById('prefKeyText').value,
                  document.getElementById('valueBool').value);
                break;
            default:
		    alert(gBundle.getString("msgErrorNoType"));
                window.close();
                return;
        }
        alert(gBundle.getString("msgSuccessAdd"));
        // Reload source prefs window
        reload();
        window.close();
    }
    catch (e) {
        alert(gBundle.getString("msgErrorAdd"));
    }
}

function onPrefNewCancel()
{
    window.close();
}

function reload()
{
    if(window.confirm(gBundle.getString("msgConfirmReload"))) {
      window.opener.location.reload();
      return true;
    }
    else 
      return false;
}