#!/usr/bin/python

import os; 
import modules; 
from modules import *; 

# ----- Start of the Program -----
prefTable = []; # holds all firefox prefs from pref files 
prefDumpTable = []; # holds prefs dumped from hash dump
prefFileList = []; # a list of all the pref file paths

grePath = os.getenv("GRE"); # path to firefox executable 

# define directories 
userPrefPath = "/home/djin/.mozilla/firefox/7v5ee6fg.default"; 
defaultPrefPath = grePath + "/defaults/pref"; 
extensionPrefPath = grePath + "/defaults/preferences"; 

# collect user preference files
userPrefFiles = os.listdir(userPrefPath); # get all files names in profile dir
for userPrefFile in userPrefFiles:
    if userPrefFile == "prefs.js" or userPrefFile == "user.js":
        prefFileList.append(userPrefPath + '/' + userPrefFile);
        
# collect default preference files
prefFileList.append(grePath + "/greprefs.js"); 

defaultPrefFiles = os.listdir(defaultPrefPath);
for defaultPrefFile in defaultPrefFiles: 
    if defaultPrefFile[-3:] == ".js": 
        prefFileList.append(defaultPrefPath + '/' + defaultPrefFile); 

extensionPrefFiles = os.listdir(extensionPrefPath); 
for extensionPrefFile in extensionPrefFiles: 
    if extensionPrefFile[-3:] == ".js": 
        prefFileList.append(extensionPrefPath + '/' + extensionPrefFile);
        
# To this point, prefFileList should contain all paths to user/default pref files

for i in prefFileList: 
    print i
    
# parse prefs from files
for filepath in prefFileList: 
    cnt = 0; # number of prefs in each file
    for line in file(filepath): # loop each line in the file
        if line[:4] == "pref" or line[:9] == "user_pref": 
            prefTable.append(parseLine(line));  # append to table
            cnt = cnt + 1; 
    
# parse prefs dumped from hash table
for line in file(os.getenv("HOME") + "/work/prefdump/prefdump.txt"):
    line = line.rstrip('\n'); 
    pair = re.split(',', line);
    prefDumpTable.append(pair);    
                
# prefTable and prefDumpTable are ready after this point 

# ----- statistics analysis -----
print "#### number of prefs in hash table: ", len(prefDumpTable);
print "#### number of prefs in files: ", len(prefTable);

prefDumpMissing = findMissing(prefTable, prefDumpTable);
print "####", len(prefDumpMissing), "prefs in files but not in hash table: ";
printPrefTable(prefDumpMissing);

prefFileMissing = findMissing(prefDumpTable, prefTable);
print "####", len(prefFileMissing), "prefs in hash table but not in files: ";
printPrefTable(prefFileMissing);
 
print "### Duplicate prefs in files: ", len(checkDup(prefTable));
for i in range(len(checkDup(prefTable))):
    print checkDup(prefTable)[i];
    
print "### Duplicate prefs in hash dump: ", len(checkDup(prefDumpTable));
for i in range(len(checkDup(prefDumpTable))):
    print checkDumpTable[i];
    
# check if a given string is in pref files
for prefFile in prefFileList: 
    searchText(prefFile, "pref.browser.homepage.disable_button.bookmark_page"); 
    
# check if a given pref is in pref dump
searchPrefDump(prefDumpTable, "pref.browser.homepage.disable_button.bookmark_page"); 

