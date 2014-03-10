PREFERENTIAL SOURCE CODE
Version 0.7
------------------------
This directory contains the current release version of the
preferential source code.

The source is designed to be packaged in an XPI format.  See 
www.xulplanet.com for more details.

RELEASE NOTES
-------------

0.7		- 	Updated to work with FF/TB extension manager.  More prefs, thanks to green_man, alanjstr, 
			Bill Phillips, David E. Ross, Marc-Jano Kopp, Nathan Schiffer, Christian Eyrich, 
			Tim Powell and dr mario.
0.6.1a		-	Fix version reference and update prefs list
0.6.1		-	Addition of tool to generate JavaScript code to append to user.js.
		-	More preferences documented, particularly in the ldap_1.*, ldap_2.* and mail.* areas.
0.6		-	Over 650 preferences documented!  Many thanks to
			Mike C and all other contributors.
		-	Implemented 'proper' progress meter.
		-	Implemented wildcarding of preferences to allow proper
			documentation of preferences even when 'generated' by the user.
0.5.3		-	Added Thunderbird support.
		-	Fixed bug when editing string-type preferences.
0.5.2		-	Added case-insensitive search.
0.5.1		-	Fixed bug preventing Preferential working under 
			FireBird 0.6.
0.5		-	Added Search function!
0.4.3		-	500 Preferences documented!
		-	Fixed a bug in the Help -> About screen.
0.4.2		-	400 Preferences documented!
		-	All browser.* preferences are now documented.
		-	Thanks to Mike K for documenting ~100 preferences covering 
			the network.*, print.* and security.* preference branches.
		-	Thanks also to Brant, Stephan and Xial for their help.
		-	Fixed bug allowing people to enter non-documented value 
			in enumerated preference window.
		-	Fixed localisation bug in New Preference window (thanks 
			asbin).
		-	Added Reload menu entry allowing refresh of preferences
			window on call.
0.4.1		-	Fixed major bug that prevented successful editing of
			Integer and String preferences (bug 2877).
		-	Fixed bug that caused unsuccessful loading of preferences
			when RDF file not 'loaded in time' (bug 2585 - thanks to 
			Matthew Buckett for the patch).
		-	Added descriptions and hint text (now 230+ preferences 
			documented -- thx Brant for your help!)

0.4		-	Added support for enumerated hints when adjusting relevant 
			preferences (eg. 1=Default, 2=Once Only, 3=Never).
		-	Added descriptions and hint text for 140+ preferences, 60+ 
			navigation menus.
		
0.3.1		-	Added support for the Phoenix web browser (tested against 
			version 0.4).

0.3		-	Added Expand/Collapse/Expand All/Collapse All menu options.
		-	Added shortcut keys and access keys for all menu items.
		-	Created working description field, although this is still
			mainly unpopulated.
		-	Added description box for editing/deleting windows.
		-	Added progress meter (currently unanimated) and status bar 
			while loading data for window.

0.2.1		-	Fixed critical bug that prevented people from using 
			Preferential full stop.

0.2		-	More user-friendly description of preferences, eg. string,
			boolean, integer &amp; whether preference with default or 
			a user set value.
		-	Improved localization and internationalisation of code.
		-	Fixed bug in handling of boolean preference editing.

0.1		-	Initial release.


FEEDBACK
--------
Feedback is more than welcome.  Contact Stephen Bounds [GuruJ@mbox.com.au]
with your comments.
