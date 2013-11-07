#!/usr/bin/python

import xml.parsers.expat; 
import os; 

propCnt = 0;
propCntGlobal = 0; 

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
    for root, subDirectories, files in os.walk(directoryPath): 
        # Process xcu files in the current dir 
        for filename in files:
            if (filename.endswith('.xcu') or filename.endswith('.xcd')):
                p = xml.parsers.expat.ParserCreate(); 
                p.StartElementHandler = start_element; 
                p.EndElementHandler = end_element; 
                p.CharacterDataHandler = char_data; 
                
                filePath = os.path.join(root, filename); 
                print filePath; 
                with open(filePath, "r") as f:
                    propCnt = 0; 
                    p.Parse(f.read()); 
                    print propCnt;   

    for d in subDirectories: 
        process_curr_directory(d); 

# Start of the program
process_curr_directory(os.curdir); 
     
'''
f = open("registrymodifications.xcu");
line = f.readline();
cnt = 0; 
while(line): 
    print 'line: ', line; 
    p.Parse(line);
    cnt = cnt + 1; 
    line = f.readline(); 
print cnt; 
f.close(); 
'''

print 'propCnt: ', propCntGlobal;  
