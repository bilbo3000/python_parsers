#!/bin/sh

# exit if incorrect number of parameters. 
if [ $# -ne 2 ]; then
	echo "Shell script $0 requires two parameters. Exit. ";
	exit; 
fi

# function that takes two string parameter and return 
# the similarity based on overlap. 
computeSimilarity()
{
        # invoke the "text_similarity.pl" tool to calculate similarity
	# and return the score
	text_similarity.pl --type=Text::Similarity::Overlaps --string $1 $2; 
}

# function call that pass two strings as parameters.
value=$(computeSimilarity $1 $2);
echo $value;
