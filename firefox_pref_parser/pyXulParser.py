#!/usr/bin/python

# Dongpu Jin
# 10/09/2013

import xml.parsers.expat; 
import os; 


# handler functions 
def start_element(name, attrs):  
    if (name == "preference"): 
        print attrs["name"]; 
        
def end_element(name): 
    pass; 
        
def char_data(data): 
    pass;  
    
# Helper functions
def remove_hashtag_lines(filePath):
    outFilePath = filePath + ".out"; 
    with open(filePath, "r") as fin, open(outFilePath, "w") as fout: 
        for line in fin: 
            if (line[0] != "#"): 
                fout.write(line);
                
def process_curr_directory(directoryPath): 
    
    for root, subDirectories, files in os.walk(directoryPath): 
        # Process xul files start from the current dir 
        for filename in files:
            if (filename.endswith(".xul")):
                p = xml.parsers.expat.ParserCreate(); 
                p.StartElementHandler = start_element; 
                p.EndElementHandler = end_element; 
                p.CharacterDataHandler = char_data; 
                
                filePath = os.path.join(root, filename);  
                # remove_hashtag_lines(filePath); 
                outFilePath = filePath + ".out";
                # print outFilePath;  
                
                with open(outFilePath, "r") as f:
                    p.Parse(f.read());    
                
    for d in subDirectories: 
        process_curr_directory(d);  
      
# Start of the program
process_curr_directory(os.curdir); 

