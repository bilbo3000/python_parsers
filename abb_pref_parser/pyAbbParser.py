#!/usr/bin/python 

'''
Parser for ABB preference file. 
Dongpu Jin
1/19/2014
'''

import os; 

finPath = os.path.join(os.curdir, "ABBc_preference_list_full.csv"); 
foutPath = os.path.join(os.curdir, "ABBc_preference_list_full.out"); 
fout = open(foutPath, 'w'); 

# Loop the file 
with open(finPath, 'r') as f: 
	for line in f: 
		line = line.split(','); 
		fout.write(line[0] + '.' + line[1] + '.' + line[2] + '\n'); 
		
# Close output file 
fout.close();  
