#!/usr/bin/python

# Dongpu Jin
# 10/01/2013

import xml.parsers.expat; 
import os; 

propCnt = 0;
propCntGlobal = 0; 
currPath = "";  # The current path to the pref
allPrefsList = [];  # A list of (distinct) prefs
prefFileList = [];  # A list of pref files
isValue = 0;  # Whether a value field
valueCnt = 0;  # Number of values
isNewPref = 0;   # Whether a new pref
boolTypeCnt = 0;  # Number of boolean types 
intTypeCnt = 0;  # Number of integer types 
otherTypeCnt = 0;  # Number of other types 
prefDict = {};   # A hashtable of pref count

# handler functions 
def start_element(name, attrs): 
    global propCnt; 
    global propCntGlobal; 
    global currPath; 
    global allPrefsList; 
    global isValue; 
    global isNewPref; 
    global prefDict; 
    
    if (name == "prop"): 
        propCnt = propCnt + 1; 
        propCntGlobal = propCntGlobal + 1; 
        prefPath = os.path.join(currPath, attrs["oor:name"]); 
        if (prefPath in prefDict):
            prefDict[prefPath] = prefDict[prefPath] + 1; 
        else:
            prefDict[prefPath] = 1; 
        
        if (prefPath not in allPrefsList):  
            isNewPref = 1;  # A new pref
            allPrefsList.append(prefPath); 
        else: 
            isNewPref = 0; 
            
    if (name == "item"): 
        currPath = attrs["oor:path"];  # Start a new path 

    if (name == "value"): 
        isValue = 1; 
        
def end_element(name):
    global currPath; 
    global isValue; 
    global isNewPref; 
    
    if (name == "item"): 
        isNewPref = 0;   # Reset new pref flag
        currPath = "";   # Close the current path

    if (name == "value"): 
        isValue = 0; 
        
def char_data(data): 
    global isValue; 
    global valueCnt; 
    global boolTypeCnt; 
    global intTypeCnt;
    global otherTypeCnt;
     
    if (isValue and isNewPref): 
        valueCnt = valueCnt + 1; 
        # print type(data);  
        # print type(data.encode("ascii", "ignore")); 
        dataStr = data.encode("ascii", "ignore"); 
        if (dataStr == "true" or dataStr == "false"):  # boolean type
            boolTypeCnt = boolTypeCnt + 1; 
        else:         
            try: 
                int(dataStr);   # If succeed, must be integer type 
                intTypeCnt = intTypeCnt + 1; 
            except Exception:   # If failed, must be other types 
                otherTypeCnt = otherTypeCnt + 1;  
    
def process_curr_directory(directoryPath): 
    global propCnt; 
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
                 
                with open(filePath, "r") as f:
                    propCnt = 0; 
                    p.Parse(f.read());    

    for d in subDirectories: 
        process_curr_directory(d); 

# Start of the program
process_curr_directory(os.curdir); 

print "allPrefList: ", allPrefsList; 
print "allPrefsList Length:", len(allPrefsList); 
print "allPrefsList Set Length: ", len(set(allPrefsList)); 
print "propCnt: ", propCntGlobal;  
print "prefFileList Length: ", len(prefFileList); 
print "value count: ", valueCnt; 
print "boolTypeCnt: ", boolTypeCnt; 
print "intTypeCnt: ", intTypeCnt; 
print "otherTypeCnt: ", otherTypeCnt; 
# print "prefDict: ", prefDict; 
