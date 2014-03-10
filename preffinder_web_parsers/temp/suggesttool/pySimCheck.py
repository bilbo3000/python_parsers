#!/usr/bin/python

import os; 
import sys; 
import subprocess; 
import string; 

# function that takes two string parameter and compute similarity
def computeSimilarity(str1, str2):
	p = subprocess.Popen(["text_similarity.pl --type Text::Similarity::Overlaps --string " + str1 + " " + str2], shell=True, stdout=subprocess.PIPE);
	score = p.stdout.read();  
	return score; 
 
#value = computeSimilarity("hello", "hello world");

# process the pref description
prefPairs = []; # a list holds all pref-value pairs 
f = open("prefDesc.txt");
line = f.readline(); 
while line: 
	if (line[:5] == "NAME:"): # find pref line 
	    index = line.find('HINT:');
	    pair = []; # a single pair of pref-value pair
	    pair.append(line[6 : index]); # add name
	    pair.append(line[index + 6:].strip('\n'));  # add hint
	    prefPairs.append(pair); # add to overall list
	line = f.readline(); 
	
print prefPairs; 
f.close(); # don't forget to close the file 

f = open("mytest.txt", 'w'); 
f.write("test");
f.close(); 
