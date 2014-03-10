# This module contains all the functions 
# that is required in pyparser
# 
# Author: Dongpu Jin
# Date: 9/29/2012

import re; 
import string; 

# this function parse the given file
# and returns the value-key pair
def parseLine(line):
    isdefault = 1; 
    if line[:9] == "user_pref":
        isdefault = 0; 
    lindex = line.find('(');
    rindex = line.rfind(");"); 
    line = line[lindex + 1 : rindex]; # extrace key and value
    line = re.sub('\s+', '', line); # remove all whitespaces
    line = re.sub('"', '', line); # remove all quotation marks
    pair = re.split(',', line);
    if isdefault: 
        pair.append("default");
    else: 
        pair.append("user");
    return pair; 

# this function checks if there is duplicated
# prefs in the table, and returns dup items
def checkDup(table): 
    dupList = []; # a list holds duplicate items
    table.sort(mycomp); # sort table
    for i in range(0, len(table) - 1): # loop each item in the table
        if table[i][0] == table[i + 1][0]: 
            dupList.append(table[i]); 
    return dupList; 
    
# pass into sort(), compare x,y base on their key
def mycomp(x, y):
	return cmp(x[0], y[0]);
	
# print pref table
def printPrefTable(prefTable):
    for i in range(len(prefTable)):
        print prefTable[i]; 
        
# find items that in a but not in b
# a, b are pref tables
def findMissing(a, b):
    missing = []; 
    for i in range(len(a)):
        found = 0; 
        for j in range(len(b)): 
            if a[i][0] == b[j][0]: 
                found = 1; 
                break; 
        if found == 0: # not found 
            missing.append(a[i]); # append missing pref
    return missing; 
    
# search a string in a given file. 
def searchText(textFile, text): 
    if text in open(textFile).read(): 
        print "#### ", text, " in ", textFile;
        
# search a pref in preference dump. 
def searchPrefDump(prefDumpTable, text):
    for pref in prefDumpTable: 
        if pref[0] == text: 
            print "#### Find ", text, " in ", pref, " pref dump."; 

