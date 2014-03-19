#!/usr/bin/python

'''
Parser that extracts preferences along with their descriptions from 
html web pages (particularly from preferential.html). 

Dongpu Jin
3/10/2014
'''

import re; 
import os; 
from HTMLParser import HTMLParser; 
    
class MyHTMLParser(HTMLParser): 
    # encounter a start tag
    def handle_starttag(self, tag, attrs): 
        global isDiv; 
        global isSpan;  
        global isName; 
        global isHint; 
        # start a div tag
        if tag == "div" and attrs[0][0] == "class" and attrs[0][1] == "pref": 
            isDiv = 1; 
        # start a span tag
        if tag == "span": 
            isSpan = 1; 
            if attrs[0][0] == "class" and attrs[0][1] == "name": 
                isName = 1;  
                isHint = 0; 
            if attrs[0][0] == "class" and attrs[0][1] == "hint":
                isName = 0; 
                isHint = 1;  
            
    # encounter a end tag
    def handle_endtag(self, tag):
        global isDiv; 
        global isSpan; 
        global isName; 
        global isHint; 
        # closing div tag
        if tag == "div" and isDiv == 1: 
            isDiv = 0; 
            isName = 0; 
            isHint = 0;
        # closing span tag
        if tag == "span" and isSpan == 1:
            isSpan = 0;
            isName = 0; 
            isHint = 0; 
        
    # encounter a data field
    def handle_data(self, data): 
        global isDiv; 
        global isSpan; 
        global isName; 
        global isHint;
        global fileid; 
        global filePath; 
 		
        if isDiv and isSpan:  
            if isName:  # name span field 
				fileid = fileid + 1; 
				filePath = os.path.join("output_preferential", "preferential_out_" + str(fileid) + ".txt");
				with open(filePath, 'w') as f:
					f.write(data + '\n');  

            if isHint:  # hint span field
				if os.path.exists(filePath): 
					with open(filePath, 'a') as f: 
						f.write(data + '\n'); 
 
  
# instantiate a parser instance       
parser = MyHTMLParser(); 

# Create output directory 
if not os.path.exists("output_preferential"):
	os.makedirs("output_preferential"); 

# open file for parsing
filepath = "preferential.html";
inputfile = open(filepath);
html = inputfile.read(); # read input file

# initialize global variable
isDiv= 0; 
isSpan = 0;
isName = 0; 
isHint = 0; 
fileid = -1; 

parser.feed(html); 
parser.close(); 
