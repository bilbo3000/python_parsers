#!/usr/bin/python 

'''
A parser that reads firefox preferences and their types 
and categorize them base on types into separate files. 

Dongpu Jin
11/7/2013
'''

import os; 
import string; 

# Define input and output file paths
finPath = os.path.join(os.curdir, "input", "dictOut.txt");
foutDir = os.path.join(os.curdir, "output");
foutBooleanPath = os.path.join(foutDir, "boolean.txt"); 
foutIntegerPath = os.path.join(foutDir, "integer.txt");
foutStringPath = os.path.join(foutDir, "string.txt");

# Open files for write
foutBoolean = open(foutBooleanPath, 'w');
foutInteger = open(foutIntegerPath, 'w');
foutString = open(foutStringPath, 'w');

# Loop the input file 
with open(finPath, 'r') as f: 
    for line in f: 
        line = line.rstrip('\n'); 
        result = string.split(line, ',', 1);

        if (result[0] == "bool"): 
            foutBoolean.write(result[1] + '=' + result[0] + '\n'); 
        elif (result[0] == "int"): 
            foutInteger.write(result[1] + '=' + result[0] + '\n'); 
        elif (result[0] == "string"): 
            foutString.write(result[1] + '=' + result[0] + '\n'); 

foutBoolean.close(); 
foutInteger.close(); 
foutString.close(); 
