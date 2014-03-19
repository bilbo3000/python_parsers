#!/usr/bin/python

'''
Parser that extracts preferences along with their descriptions from 
html web pages (particularly from MozillaZine.html). 

Dongpu Jin
3/10/2014
'''

import re; 
import os; 
from HTMLParser import HTMLParser; 
    
class MyHTMLParser(HTMLParser): 
    # encounter a start tag
    def handle_starttag(self, tag, attrs): 
        global istbody; 
        global isGoodTable;  # whether the table contains pref 
        global istr;
        global istd;
        global cnt;   
        
        # start a tbody tag
        if tag == "tbody": 
            istbody = True;  
            
        # found a good table 
        if tag == "th" and istbody:  
        	isGoodTable = True;  
        	
       	# found preference a row
       	if tag == "tr" and isGoodTable: 
       		istr = True; 
       	
       	# found a preference data	
       	if tag == "td" and istr and isGoodTable:
       		istd = True;  
       		cnt = cnt + 1; 
       		cnt = cnt % 3;  
        	 
    # encounter a end tag
    def handle_endtag(self, tag):
        global istbody; 
        global isGoodTable; 
        global istr;
        global istd; 
        
        # closing div tag
        if tag == "tbody":
        	if istbody and isGoodTable:
        		isGoodTable = False;
    		istbody = False; 
        
        # closing td tag 
        if tag == "td": 
        	istd = False; 
        	
    # encounter a data field
    def handle_data(self, data): 
        global istbody; 
        global outfile;  
        global istd; 
        global cnt; 
        global fileid; 
        global filePath; 
        
        if istd and len(re.sub(r'\s+', "", data)) != 0: 
        	data = re.sub(r'\s+$', "", data);
        	data = re.sub(r'^\s+', "", data);
        	
        	# Pref name  
        	if (cnt == 0): 
        		fileid = fileid + 1; 
        		filePath = os.path.join("output_zine", "zine_out_" + str(fileid) + ".txt"); 
        		fout = open(filePath, 'w');    
		    	data = re.sub(r'\.\s+', ".", data);
		    	fout.write(data + '\n');  
		    	fout.close();
	    	if (cnt == 2): 
	    		print filePath;
	    		if os.path.exists(filePath): 
	    			with open(filePath, 'a') as f:
	    				f.write(data + '\n'); 
 
  
# instantiate a parser instance       
parser = MyHTMLParser();

# Initialize global variable 
isGoodTable = False; 
istbody = False;  
istr = False; 
istd = False; 
cnt = -1;  
fileid = -1; 

if not os.path.exists("output_zine"):
	os.makedirs("output_zine");  

# open file for parsing
filepath = "MozillaZine.html";
inputfile = open(filepath);
html = inputfile.read(); # read input file

outfile = open("./prefDesc_Zine.txt", 'w'); 
parser.feed(html); 

parser.close(); 
outfile.close(); # close output file
