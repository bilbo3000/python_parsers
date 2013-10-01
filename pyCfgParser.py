#!/usr/bin/python

import xml.parsers.expat; 
import os; 

propCnt = 0;
propCntGlobal = 0; 
numOfFiles = 0; 

# handler functions 
def start_element(name, attrs): 
    #print 'Start element:', name; 
    #print 'Start element attrs: ', attrs; 
    global propCnt; 
    global propCntGlobal; 
    if (name == 'prop'): 
        propCnt = propCnt + 1; 
        propCntGlobal = propCntGlobal + 1; 

def end_element(name):
    pass; 
    #print 'End element:', name; 

def char_data(data): 
    pass; 
    #print 'Character data:', repr(data); 
    
def process_curr_directory(directoryPath): 
    global propCnt;
    global numOfFiles; 
    for root, subDirectories, files in os.walk(directoryPath): 
        # Process xcu files in the current dir 
        for filename in files:
            if (filename.endswith('.xcu') or filename.endswith('.xcd') or filename.endswith('.xcs')):
                p = xml.parsers.expat.ParserCreate(); 
                p.StartElementHandler = start_element; 
                p.EndElementHandler = end_element; 
                p.CharacterDataHandler = char_data; 
                
                filePath = os.path.join(root, filename); 
                print filePath;
                numOfFiles = numOfFiles + 1;  
                with open(filePath, "r") as f:
                    propCnt = 0; 
                    p.Parse(f.read()); 
                    print propCnt;   

    for d in subDirectories: 
        process_curr_directory(d); 

# Start of the program
process_curr_directory(os.curdir); 

print 'propCnt: ', propCntGlobal;  
print 'numOfFiles: ', numOfFiles; 
