#include<iostream> 
#include<fstream> 
#include<stdlib.h>
#include<string>
#include<cassert>
#include<cstring>
#include<cstdlib>
#include<math.h>
#include<time.h>

#define CMD "text_similarity.pl --type=Text::Similarity::Overlaps --string "

using namespace std; 

// node struct for each pref pair 
typedef struct Node{
    double score;  
    string name; 
    string hint; 
    Node & operator=(Node &node){
        this->score = node.score; 
        this->name = node.name; 
        this->hint = node.hint; 
        return *this; 
    }
} Node; 

// construct the heap from buttom up
void heapBottomUp(Node * prefHeap, int n){
    int parent = floor(n / 2); // index of last parent 
    for (int i = parent; i >= 1; i--){
        int k = i; // k: current
        Node v = prefHeap[k]; 
        bool heap = false; 
        while(!heap && 2 * k <= n){
            int j = 2 * k; 
            if (j < n) // there are two children 
                if (prefHeap[j].score > prefHeap[j + 1].score) j = j + 1; 
            if (v.score <= prefHeap[j].score)
                heap = true; 
            else{
                prefHeap[k] = prefHeap[j]; 
                k = j; 
            }
        }
        prefHeap[k] = v; 
    }
} 

// restore heap properties 
void heapify(Node * prefHeap, int i, int n){
    int l = 2 * i; 
    int r = 2 * i + 1; 
    int smallest = i; // determine smallest index among the three
    if (l <= n && prefHeap[l].score < prefHeap[i].score){
        smallest = l; 
    }
    
    if(r <= n && prefHeap[r].score < prefHeap[smallest].score){
        smallest = r; 
    }
    if(smallest != i){
        // swap
        Node * tempNode = new Node();
        *tempNode = prefHeap[i]; // save current node
        prefHeap[i] = prefHeap[smallest]; 
        prefHeap[smallest] = *tempNode;
        delete tempNode; 
         
        heapify(prefHeap, smallest, n); // recursive call 
    }
}

// heap sort the prefHeap in decreasing order 
void heapsort(Node * prefHeap, int n){
    int num = n; 
    for (int i = n; i >= 1; i--){
        // swap
        Node * tempNode = new Node();
        *tempNode = prefHeap[1]; // save current node
        prefHeap[1] = prefHeap[i]; 
        prefHeap[i] = *tempNode;
        delete tempNode; 
        // heapify the rest of heap
        n = n - 1; 
        heapify(prefHeap, 1, n);
    }
}

int main(int argc, char* argv[]){

    
	assert(argc >= 4);  // ensure num of params
    char * userText = argv[1]; // get user text
    int num = atoi(argv[2]);  // get number to suggest
    char * extDirChar = argv[3]; // get extension path
    
    /*
    string userText = "web"; // get user text
    int num = 10;  // get number to suggest
    string rankFilePath = "/home/djin/work/suggesttool";
    string prefDescPath = "/home/djin/work/suggesttool";
    */
    
    string rankFilePath(extDirChar);
    rankFilePath.append("/rank.txt"); // form rank file path
    string prefDescPath(extDirChar);
    prefDescPath.append("/prefDesc.txt");  // form pref description path
    
    // remove old rank.txt
    ifstream oldRank(rankFilePath.c_str()); 
    if(oldRank.good()){
	    remove(rankFilePath.c_str()); 
	}
	
	ifstream infile(prefDescPath.c_str());  
	string line; // current pref line
	
	if(infile.is_open()){ // successfully open the input file 
	    FILE * fp; // file pointer
	    Node * prefHeap = new Node[num + 1]; // index start with 1 
	    int cnt = 1; // available spot index in the heap
	    
	    
	    // scan through each line of the file 
		while(infile.good()){ 
			getline(infile, line); // get current line 
			if(line.compare(0, 5, "NAME:") == 0){ // a pref line
			    int index = line.find("HINT:"); 
			    // get name-hint pair
			    string name = line.substr(6, index - 6);
			    string hint = line.substr(index + 6, line.length() - index - 6); 
			    // form command  
			    string cmdstr = ""; 
			    cmdstr += CMD; // base command
			    cmdstr += '\"';
			    cmdstr += hint; // from file
			    cmdstr += '\"';
			    cmdstr += ' '; 
                cmdstr += '\"';
			    cmdstr += userText;  // user input
			    cmdstr += '\"';
			    
			    // execute the command 
			    fp = popen(cmdstr.c_str(), "r");  
			    // get output
	            // while(fgets(buf, 99, fp) != NULL ){
	            char buf[99]; // buffer to store output
	            if(fgets(buf, 99, fp) != NULL ){
	                int len = strlen(buf);
	                if(buf[len - 1] == '\n') buf[len - 1] = 0; 
	                double score = atof(buf); // convert score to double
	                Node * newNode = new Node();  // build a new node 
	                newNode->score = score; 
	                newNode->name = name; 
	                newNode->hint = hint; 
	                // insert node into heap
	                if (cnt < num){ // heap is not full
	                    prefHeap[cnt] = *newNode; 
	                    cnt++; 
	                }else if (cnt == num){ // reconstruct the heap 
	                    prefHeap[cnt] = *newNode; // insert at last spot
	                    cnt++; 
	                    // construct the heap 
	                    heapBottomUp(prefHeap, num);
	                }else{ // heap is full
	                    if (newNode->score > prefHeap[1].score){
	                        prefHeap[1] = *newNode; 
	                        heapify(prefHeap, 1, num); 
	                    }
	                }
		            delete newNode; 
	            } // end getting input from pipe
	            pclose(fp); // close pipe
			} 
		} // end of while loop 
		
		heapsort(prefHeap, num); // heap sort in decreasing order 
		// write to rank.txt
		
		ofstream outfile(rankFilePath.c_str());
		for (int i = 1; i <= num; i++){
		    outfile << "[Score: " << prefHeap[i].score << "], "; 
		    outfile << "[Pref: " << prefHeap[i].name << "], "; 
		    outfile << "[Description: " << prefHeap[i].hint << "]" << endl;
		 }
		delete [] prefHeap; // don't forget to delete the heap 
		outfile.close(); // close output file 
		
		infile.close(); // close input file
	}
 	 
	return 0; 
}
