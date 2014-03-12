#!/usr/bin/python

'''
Parser that extracts preferences along with their descriptions from 
html web pages (particularly from MozillaZine.html). 

Dongpu Jin
3/10/2014
'''

import re; 
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
        
        if istd and len(re.sub(r'\s+', "", data)) != 0 and (cnt == 0 or cnt == 2): 
        	print re.sub(r'\s+$', "", data);  
 
  
# instantiate a parser instance       
parser = MyHTMLParser();

# Initialize global variable 
isGoodTable = False; 
istbody = False;  
istr = False; 
istd = False; 
cnt = -1;  

# open file for parsing
filepath = "MozillaZine.html";
inputfile = open(filepath);
html = inputfile.read(); # read input file

outfile = open("./prefDesc_Zine.txt", 'w'); 
parser.feed(html); 

parser.close(); 
outfile.close(); # close output file
