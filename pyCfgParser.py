#!/usr/bin/python

import xml.parsers.expat; 
import os; 

propCnt = 0;
propCntGlobal = 0; 
numOfFiles = 0; 
currPath = ""; 
allPrefsList = []; 
prefFileList = []; 

# handler functions 
def start_element(name, attrs): 
    global propCnt; 
    global propCntGlobal; 
    global currPath; 
    global allPrefsList; 
    
    if (name == "prop"): 
        propCnt = propCnt + 1; 
        propCntGlobal = propCntGlobal + 1; 
        allPrefsList.append(os.path.join(currPath, attrs["oor:name"])); 
        
    if (name == "item"): 
        currPath = attrs["oor:path"];  # Start a new path 

def end_element(name):
    global currPath; 
    if (name == "item"): 
        currPath = "";   # Close the current path

def char_data(data): 
    pass; 
    #print 'Character data:', repr(data); 
    
def process_curr_directory(directoryPath): 
    global propCnt;
    global numOfFiles; 
    global prefFileList; 
    
    for root, subDirectories, files in os.walk(directoryPath): 
        # Process xcu files in the current dir 
        for filename in files:
            if (filename.endswith(".xcu") or filename.endswith(".xcd") or filename.endswith(".xcs")):
                p = xml.parsers.expat.ParserCreate(); 
                p.StartElementHandler = start_element; 
                p.EndElementHandler = end_element; 
                p.CharacterDataHandler = char_data; 
                
                filePath = os.path.join(root, filename); 
                prefFileList.append(filePath);  
                
                numOfFiles = numOfFiles + 1;  
                with open(filePath, "r") as f:
                    propCnt = 0; 
                    p.Parse(f.read());    

    for d in subDirectories: 
        process_curr_directory(d); 

# Start of the program
process_curr_directory(os.curdir); 

print "allPrefsList Length:", len(allPrefsList); 
print "allPrefsList Set Length: ", len(set(allPrefsList)); 
print "propCnt: ", propCntGlobal;  
print "numOfFiles: ", numOfFiles; 
print "prefFileList Length: ", len(prefFileList); 
