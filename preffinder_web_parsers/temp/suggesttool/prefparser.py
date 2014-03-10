#!/usr/bin/python

import re; 
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
 	global outfile; 
        if isDiv and isSpan: 
	    data = re.sub('\(', '{', data);
	    data = re.sub('\)', '}', data);
	    data = re.sub('\"', ' ', data); 
            if isName:  # name span field
                #print "Name: ", data; 
		outfile.write("NAME: " + data + ' '); 
		isSpan = 0; 
                isName = 0; 
            if isHint:  # hint span field
		#print "Hint: ", data;
		outfile.write("HINT: " + data + '\n');  
                isSpan = 0;   
                isHint = 0; 
 
  
# instantiate a parser instance       
parser = MyHTMLParser();  

# open file for parsing
filepath = "/home/djin/work/prefparser/preferential.html";
inputfile = open(filepath);
html = inputfile.read(); # read input file
# initialize global variable
isDiv= 0; 
isSpan = 0;
isName = 0; 
isHint = 0; 
outfile = open("./prefDesc.txt", 'w');
outfile.write("Firefox preferences descriptions\n"); 
parser.feed(html); 

parser.close(); 
outfile.close(); # close output file
