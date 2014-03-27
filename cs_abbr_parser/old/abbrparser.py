#!/usr/bin/python
'''
A Python parser that parses the file of 
computer science abbreviations. 
Author: Dongpu Jin
Date: January 24, 2013
'''
abbrlist = []; # list of abbreviations

for line in open("input/computer_acronyms_list.html"): 
    line = line.rstrip('\n');
    if (line[0] == '.'): # abbr line, extensions
        abbrlist.append(line[1:]);  
    elif (line[0].isupper()): # first char is upper case
        if (line[1] == ' '): # abbr line, single char 
            abbrlist.append(line); 
        elif(not line[1].islower()): # abbr line, spetial
            abbrlist.append(line);  
        else: # desc line
            abbrlist[len(abbrlist) - 1] += line; 
    else: # desc line 
        abbrlist[len(abbrlist) - 1] += line; 
      
# write to output file 
fout = open("output/cs_abbr.txt", 'w');  
for abbr in abbrlist: 
    fout.write(abbr + '\n');   
fout.close(); 
        
