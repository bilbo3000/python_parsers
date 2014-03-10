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
        
        if istd: 
        	print data;   
 
  
# instantiate a parser instance       
parser = MyHTMLParser();

# Initialize global variable 
isGoodTable = False; 
istbody = False;  
istr = False; 
istd = False; 
cnt = 0;  

# open file for parsing
filepath = "MozillaZine.html";
inputfile = open(filepath);
html = inputfile.read(); # read input file

outfile = open("./prefDesc_Zine.txt", 'w'); 
parser.feed(html); 

parser.close(); 
outfile.close(); # close output file
