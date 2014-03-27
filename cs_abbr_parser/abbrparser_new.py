#!/usr/bin/python
'''
A Python parser that parses the file of 
computer science abbreviations. 
(Newer version)

Author: Dongpu Jin
Date: 3/262013
'''

import re; 

abbrdict = {}; # map abbr. to the meanings
currKey = ""; 
desc = ""; 

# Function that adds a key-val pair to dictionary 
def addToDict(key, val): 
	global abbrdict; 
	
	if (currKey in abbrdict): 
		abbrdict[key].append(val); 
	else: 
		tempList = []; 
		tempList.append(val);
		abbrdict[key] = tempList;  

# Loop through and parse abbr input html file 
for line in open("input/computer_acronyms_list2.html"): 
    line = line.rstrip('\n');
    
    if (line[0] != ' '):  # Current line starts a new abbr
    	if (len(currKey) != 0):  # Handle the first abbr
    		addToDict(currKey, desc); 
    	
    	currKey = ""; 
    	desc = "";   
    	temp = re.split("\s+", line, 1); # [0]: abbr; [1]: desc 
        currKey = temp[0]; 
        desc = temp[1]; 
    else:  # Current line continues an existing abbr
        temp = re.sub(r"\s+", "", line, 1);  # remove leading spaces 
        desc = desc + " " + temp; 
# end of for loop 

# Handle last abbr
if (len(currKey) != 0):
	addToDict(currKey, desc);
# --> abbrdict maps each abbr to a list of descriptions (include '+')
	
# Post processing abbr desc
# 1. split at +
for key in abbrdict: 
	descs = abbrdict[key]; 
	newDescs = []; 
	
	# Loop each desc
	for desc in descs: 
		# Split at '+' to separate meanings	for current desc 
		temp = desc.split("+"); 
		
		for item in temp: 
			# Remove leading and trailing spaces 
			item = item.lstrip(); 
			item = item.rstrip(); 
			newDescs.append(item);
	
	abbrdict[key] = newDescs;  
# --> abbrdict maps each abbr to a list of descriptions 	  
	
# write to output file 
fout = open("output/cs_abbr.txt", 'w');  

for key in abbrdict: 
    fout.write(key);  
    
    for desc in abbrdict[key]: 
    	fout.write(',' + desc);
    	
    fout.write('\n');   
fout.close();         
