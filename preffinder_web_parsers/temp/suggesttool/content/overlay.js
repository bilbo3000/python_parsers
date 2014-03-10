var gSuggestTool = {
	// initialization
	init: function(){
	}, 
	
	// uninitialization 
	uninit: function(){
	}, 
	
	find: function(){
	    // open main window
		window.openDialog("chrome://suggesttool/content/main.xul", "", "chrome, dialog, modal, resizable=yes").focus();
	},
	
	// save values when click Search button 
	saveValues: function(){
	    // get path to prof dir
	    var profPath = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
	    profPath.append("extensions"); 
	    //window.alert(profPath.path);
        //mytest.append("extensions");
        //mytest.append("djin@cse.unl.edu"); 
        //mytest.append("rank.txt");
		
		// get values from text box and radio button
		let textValue = document.getElementById("suggesttoolTextbox").value; 
		let radioValue = document.getElementById("suggesttoolRadiogroup").selectedItem.value; 
		
		// get pref service and set pref value
		var pref = Components.classes['@mozilla.org/preferences-service;1']
		    .getService(Components.interfaces.nsIPrefBranch);
		pref.setIntPref('extensions.suggesttool.numOfPrefs', radioValue);
		
		// create an nsILocalFile for the executable
        var file = Components.classes["@mozilla.org/file/local;1"]
            .createInstance(Components.interfaces.nsILocalFile);       
        file.initWithPath("/home/djin/work/suggesttool/simCheck");
                     
		// create process instance
		var process = Components.classes["@mozilla.org/process/util;1"]
		    .createInstance(Components.interfaces.nsIProcess);
		process.init(file);
		
		var args = [textValue, radioValue, profPath.path];
		// var args = []; 
		process.run(false, args, args.length); // run c++ executable
		
		profPath.append("rank.txt"); // the path to the ourput file 
		var n = 0; 
		var timer = setInterval(function(){myTimer();}, 3000); 
	    function myTimer(){
	        if (n < 10){
	            n = n + 1; 
	            if(profPath.exists()){ // finish writing the file
	                clearInterval(timer);
	                
	                // open an input stream from file
                    var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
                    istream.init(profPath, 0x01, 0444, 0);
                    istream.QueryInterface(Components.interfaces.nsILineInputStream);
                     
                    // read lines into array
                    var line = {}, lines = "", hasmore;
                    do {
                      //radioValue = radioValue - 1; 
                      hasmore = istream.readLine(line);
                      //lines.push(line.value);   
                      lines = lines + line.value + '\n\n';  
                    } while(hasmore);         
                    //} while(hasmore && radioValue > 0);
                     
                    istream.close();
                     
                    document.getElementById("suggesttoolResults").value = lines;
                    
                }
            }else{ // > 30 sec, time out
                clearInterval(timer);
                window.alert("Time out (>30sec)"); 
            }
        }
	}, 
	

	
};

window.addEventListener("load", function(){
gSuggestTool.init(); }, false);
window.addEventListener("unload", function(){
gSuggestTool.uninit(); }, false);
