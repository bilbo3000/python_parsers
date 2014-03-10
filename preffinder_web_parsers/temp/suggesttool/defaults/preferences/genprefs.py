#!/usr/bin/python

# This project generates certain number of 
# artificial prefs to test the capacity of 
# firefox prefs hash table. 
# Dongpu Jin
# 11/05/2012

n = 1000000; 
fileobj = open("overflow.js", 'w');
baseName = "extensions.suggesttool.numOfPrefs";
for i in range(n):
	prefName = baseName + str(i);  
	txt = "pref(\"" + prefName + "\", 1);\n";
	fileobj.write(txt);  
fileobj.close(); 
