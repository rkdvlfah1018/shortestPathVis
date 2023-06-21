let navbarHeight = $("#Title").height();
let viewportHeight = window.innerHeight;
let viewportWidth = window.innerWidth;
let gridTotalHeight = viewportHeight - navbarHeight;
let btnStatus = "nothing";
let algoStatus = "nothing";

class node{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.weight = 1;
        this.neighbor = [];
        this.start = false;
        this.end = false;
        this.isWall = false;
        this.parent = null;
        this.distance = Number.MAX_SAFE_INTEGER;
        this.status = "undiscovered";
        this.next = null;
        this.fScore = Number.MAX_SAFE_INTEGER;
        this.gScore = Number.MAX_SAFE_INTEGER;
        this.containedInQ = false;
        // this.name = "r" + x + "c" + y;
    }
}

//creating queue

class Queue {
    constructor() {
      this.arr = [];
    }
    enqueue(item) {
      this.arr.push(item);
    }
    dequeue() {
      return this.arr.shift();
    }
    size(){
        return this.arr.length;
    }
}

//creating heap
class minHeap{
    constructor(){
        this.heap = [];
    }

    getLeftChildIndex(parentIndex){
        return parentIndex * 2 + 1;
    }
    getRightChildIndex(parentIndex){
        return parentIndex * 2 + 2;
    }
    getParentIndex(childIndex){
        return Math.floor((childIndex-1)/2);
    }
    getMin(){
        return this.heap[0];
    }
    insert(key, value){
        const heapItem = {
            node: key, 
            distance: value
        }
        this.heap.push(heapItem);
        this.heapifyUp();
    }
    heapifyUp(){
        let index = this.heap.length - 1;
        const lastInsertedNode = this.heap[index]; //you shouldn't call this function more than once after you add a new node
        while(index > 0){
            let parentIndex = this.getParentIndex(index);
            if (this.heap[parentIndex].distance > lastInsertedNode.distance){
                this.heap[index] = this.heap[parentIndex];
                index = parentIndex;
            }
            else{
                break;
            }
        }
        this.heap[index] = lastInsertedNode;
    }
    heapifyUpFrom(i){
        let index = i;
        const lastInsertedNode = this.heap[index];
        while(index > 0){
            let parentIndex = this.getParentIndex(index);
            if (this.heap[parentIndex].distance > lastInsertedNode.distance){
                this.heap[index] = this.heap[parentIndex];
                index = parentIndex;
            }
            else{
                break;
            }
        }
        this.heap[index] = lastInsertedNode;
    }
    extractMin(){
        const count = this.heap.length;
        let rootNode = this.heap[0];

        if (count <= 0){
            return undefined;
        }
        if (count === 1){
            this.heap = [];
        }
        else{
            this.heap[0] = this.heap.pop();
            this.heapifyDown();
        }
        return rootNode;
    }
    heapifyDown(){
        let index = 0;
        const count = this.heap.length;
        let rootNode = this.heap[0];

        while(this.getLeftChildIndex(index) < count){
            let leftChildIndex = this.getLeftChildIndex(index);
            let rightChildIndex = this.getRightChildIndex(index);
            let smallerChildIndex = leftChildIndex;
            if (rightChildIndex < count){
                if (this.heap[rightChildIndex].distance < this.heap[leftChildIndex].distance){
                    smallerChildIndex = rightChildIndex;
                }
            }
            if (this.heap[smallerChildIndex].distance < rootNode.distance){
                this.heap[index] = this.heap[smallerChildIndex];
                index = smallerChildIndex;
            }
            else{
                break;
            }
        }
        this.heap[index] = rootNode;
    }
}

class minPriorityQueue extends minHeap{
    constructor() {
        super();
    }
    enqueue(queueItem, distance){
        this.insert(queueItem, distance);
        queueItem.containedInQ = true;
    }
    extractMinQueue(){
        return this.extractMin();
    }
    getMinQueue(){
        return this.getMin();
    }
    isEmpty(){
        return (this.heap.length <= 0);
    }
}

class linkedList{
    constructor(){
        this.arr = [];
        this.next = null;
    }
    insert(item){
        if (this.arr.length === 0){
            this.arr.push(item);
        }
        else{
            let arrLength = this.arr.length;
            this.arr[arrLength-1].next = item;
            this.arr.push(item);
        }
    }
} 

var nodeList = [];

// creating grid

let numRows = 20;
let length = gridTotalHeight / numRows;
let numCols = Math.floor(viewportWidth/length);

for (let i = 0; i < numRows; i++){ //creates grid
    $("table").append("<tr class='untreated'></tr>");
    var tempArrList = [];
    for(let j = 0; j < numCols; j++){
        $(".untreated").append("<td class ='untreatedData'></td>");
        $(".untreatedData").addClass("r" + i + "c" + j);
        $(".untreatedData").removeClass("untreatedData");
        var tempNode = new node(i, j);
        tempArrList.push(tempNode);
    }
    nodeList.push(tempArrList);
    $(".untreated").removeClass("untreated");
}

//controlling neighbors
for (let i = 0; i < numRows; i++){
    for(let j = 0; j < numCols; j++){
        if((i-1) >= 0){
            nodeList[i][j].neighbor.push(nodeList[i-1][j]);
        }
        if((i+1) < numRows){
            nodeList[i][j].neighbor.push(nodeList[i+1][j])
        }
        if((j-1) >= 0){
            nodeList[i][j].neighbor.push(nodeList[i][j-1]);
        }
        if((j+1) < numCols){
            nodeList[i][j].neighbor.push(nodeList[i][j+1]);
        }
    }
}

$("td").css({"height": length, "width": length, "border-width": 1});

$("td").click(function(){
    //should be a switch statement for start end wall & weight nodes
    let tempClass = $(this).attr("class");
    let iAndj = tempClass.match(/(\d+)/g);
    let i = iAndj[0];
    let j = iAndj[1];
    switch(btnStatus){
        case 'addStart':
            if($(".startNode").length > 0){
                //there already exists a start node
                $(".startNode").html("");
                $(".startNode").removeClass("startNode");
            }
            $(this).addClass("startNode");
            nodeList[i][j].start = true;
            $('.startNode').html("<i class='fa-solid fa-chevron-right icon'></i>");
            break;
        case 'addEnd':
            if($(".endNode").length > 0){
                $(".endNode").html("");
                $(".endNode").removeClass("endNode");
                for (let k = 0; k < numRows; k++){
                    for (let h = 0; h < numCols; h++){
                        nodeList[k][h].end = false;
                    }
                }
            }
            $(this).addClass("endNode");
            nodeList[i][j].end = true; 
            $(".endNode").html("<i class='fa-solid fa-stop icon'></i>");
            break;
        case 'addWall':
            if($(this).hasClass("startNode") || $(this).hasClass("endNode")){
                alert("You cannot place a wall on the starting or the ending node");
            }
            else{
                $(this).addClass("wallNode");
                nodeList[i][j].isWall = true;
            }
            break;
        case 'addWeight':
            if($(this).hasClass("startNode") || $(this).hasClass("endNode")){
                alert("You cannot place weight(s) on the starting or the ending node");
            }
            else{
                if (!$(this).hasClass("weightNode")){
                    $(this).addClass("weightNode");
                }
                nodeList[i][j].weight += 1;
                $(this).html("<i class='fa-solid fa-weight-hanging'></i>");
                $(".fa-weight-hanging", this).text(nodeList[i][j].weight);
            }
            break;
        default:
            break;
    }
        
});

$(".startNodeBtn").click(function(){
    btnStatus = "addStart";
});

$(".endNodeBtn").click(function(){
    btnStatus = "addEnd";
});

$(".wallBtn").click(function(){
    btnStatus = "addWall";
});

$(".weightBtn").click(function(){
    btnStatus = "addWeight";
});

$(".clearBtn").click(function(){
    btnStatus = "clearBoard";
    clearBoard();
});

function clearBoard(){
    for (let i = 0; i < numRows; i++){
        for (let j = 0; j < numCols; j++){
            nodeList[i][j].weight = 1;
            nodeList[i][j].start = false;
            nodeList[i][j].end = false;
            nodeList[i][j].isWall = false;
            nodeList[i][j].parent = null;
            nodeList[i][j].distance = Number.MAX_SAFE_INTEGER;
            nodeList[i][j].status = "undiscovered";
            nodeList[i][j].next = null;
            nodeList[i][j].fScore = Number.MAX_SAFE_INTEGER;
            nodeList[i][j].gScore = Number.MAX_SAFE_INTEGER;
            nodeList[i][j].containedInQ = false;
        }
    }
    //deals with start node
    $(".startNode").html("");
    $(".startNode").removeClass("startNode");

    //deals with end node
    $(".endNode").html("");
    $(".endNode").removeClass("endNode");

    //deals with walls
    $(".wallNode").removeClass("wallNode");

    //deals with weights
    $(".weightNode").html("");
    $(".weightNode").removeClass("weightNode");

    //deals with discovered / explored nodes
    $(".discovered").removeClass("discovered");
    $(".explored").removeClass("explored");

    //deals with path nodes
    $(".path").removeClass("path");
}

//selecting algorithm
$(".BFS").click(function(){
    algoStatus = "BFS";
    $(".description").text("BFS (Breadth First Search) is an unweighted single sourced shortest path algorithm with a runtime of O(|v| + |E|).");
});

$(".dijkstra").click(function(){
    algoStatus = "dijkstra";
    $(".description").text("Dijkstra is a weighted single sourced shortest path algorithm with a runtime of O(E*logV).");
});

$(".aStar").click(function(){
    algoStatus = "aStar";
    $(".description").text("A* is a weighted single sourced shortest path algorithm using a heuristic function.");
});

//starting algo
$(".runBtn").click(function(){
    let tempClass = $(".startNode").attr("class");
    let xAndY = tempClass.match(/(\d+)/g);
    let startingX = xAndY[0];
    let startingY = xAndY[1];
    switch(algoStatus){
        case 'BFS':
            nodeList[startingX][startingY].distance = 0;
            nodeList[startingX][startingY].status = "discovered";
            $(".r" + startingX + "c" + startingY).addClass("discovered");
            let Q = new Queue();
            Q.enqueue(nodeList[startingX][startingY]);
            let endNode = null;
            function myBFSFunc(){
                if (Q.size() > 0){
                    let u = Q.dequeue();
                    if (u.end){
                        $(".r" + u.x + "c" + u.y).addClass("explored");
                        setTimeout(function(){
                            clearInterval(BFStimer);
                        });
                        endNode = u;
                        return u;
                    }
                    let N = u.neighbor;
                    for (let i = 0; i < N.length; i++){
                        if (N[i].isWall){
                            continue;
                        }
                        if(N[i].status === "undiscovered"){
                            N[i].status = "discovered";
                            $(".r" + N[i].x + "c" + N[i].y).addClass("discovered");
                            N[i].parent = u;
                            N[i].distance = u.distance + 1;
                            Q.enqueue(N[i]);
                        }
                    }
                    $(".r" + u.x + "c" + u.y).addClass("explored");
                }
            }
            myBFSFunc();
            let BFStimer = setInterval(function(){
                myBFSFunc();
                let currentPathNode = endNode;
                while(currentPathNode.parent != null){
                    $(".r" + currentPathNode.x + "c" + currentPathNode.y).addClass("path");
                         currentPathNode = currentPathNode.parent;
                    $(".r" + startingX + "c" + startingY).addClass("path");
                }
            }, 5);
            break;
        case 'dijkstra':
            nodeList[startingX][startingY].distance = 0;
            let priorityQ = new minPriorityQueue();
            let endNodeDijK = null;
            //insert starting node
            priorityQ.insert(nodeList[startingX][startingY], nodeList[startingX][startingY].distance);
            //perform dijkstra
            function dijkstra(){
                if (!priorityQ.isEmpty()){
                    let u = priorityQ.extractMinQueue();
                    $(".r" + u.node.x + "c" + u.node.y).addClass("explored");
                    if (u.node.end){
                        $(".r" + u.node.x + "c" + u.node.y).addClass("explored");
                        setTimeout(function(){
                            clearInterval(dijkstraTimer);
                        });
                        endNodeDijK = u.node;
                        return;
                    }
                    for (let i = 0; i < u.node.neighbor.length; i++){
                        if (u.node.neighbor[i].isWall){
                            continue;
                        }
                        if (u.node.parent == null || (u.node.neighbor[i] != u.node.parent.node)){
                            let alt = u.distance + u.node.neighbor[i].weight;
                            if ((alt < u.node.neighbor[i].distance) && (u.distance != Number.MAX_SAFE_INTEGER)){
                                $(".r" + u.node.neighbor[i].x + "c" + u.node.neighbor[i].y).addClass("discovered");
                                u.node.neighbor[i].distance = alt;
                                u.node.neighbor[i].parent = u;
                                //add the neighbors
                                priorityQ.insert(u.node.neighbor[i], u.node.neighbor[i].distance);
                            }
                        }
                    }
                }
            }

            dijkstra();
            let dijkstraTimer = setInterval(function(){
                dijkstra();
                let currentPathNode = endNodeDijK;
                while(currentPathNode.parent != null){
                    $(".r" + currentPathNode.x + "c" + currentPathNode.y).addClass("path");
                    currentPathNode = currentPathNode.parent.node;
                    $(".r" + startingX + "c" + startingY).addClass("path");
                }
                
            }, 5);
            
            break;
        case 'aStar':
            let openSet = new minPriorityQueue();
            nodeList[startingX][startingY].distance = 0;
            nodeList[startingX][startingY].gScore = 0;
            nodeList[startingX][startingY].fScore = 0;
            openSet.insert(nodeList[startingX][startingY], nodeList[startingX][startingY].fScore);
            function h(node){
                //using the euclidean distance
                return Math.sqrt((startingX-node.x)*(startingX-node.x) + (startingY-node.y)*(startingY-node.y));
            }
            function reconstructPath(endX, endY){
                let iterationItem = nodeList[endX][endY];
                while(iterationItem.parent != null){
                    let pathX = iterationItem.x;
                    let pathY = iterationItem.y;
                    $(".r" + pathX + "c" + pathY).addClass("path");
                    iterationItem = iterationItem.parent;
                }
                let pathX = iterationItem.x;
                let pathY = iterationItem.y;
                $(".r" + pathX + "c" + pathY).addClass("path");
                setTimeout(function(){
                    clearInterval(aStarTimer);
                });
            }
            function aStar(){
                if(!openSet.isEmpty()){
                    let current = openSet.extractMinQueue();
                    let currX = current.node.x;
                    let currY = current.node.y;
                    $(".r" + currX + "c" + currY).addClass("explored");
                    //if current is end node do something
                    if (current.node.end){
                        let endX = current.node.x;
                        let endY = current.node.y;
                        return reconstructPath(endX, endY);
                    }
                    for (let i = 0; i < current.node.neighbor.length; i++){
                        if (current.node.neighbor[i].isWall){
                            continue;
                        } 
                        $(".r" + current.node.neighbor[i].x + "c" + current.node.neighbor[i].y).addClass("discovered");
                        let tentative_gScore = current.node.gScore + (current.node.x - current.node.neighbor[i].x) + (current.node.y - current.node.neighbor[i].y) + current.node.neighbor[i].weight;
                        if (tentative_gScore < current.node.neighbor[i].gScore){
                            current.node.neighbor[i].parent = current.node;
                            current.node.neighbor[i].gScore = tentative_gScore;
                            current.node.neighbor[i].fScore = tentative_gScore + h(current.node.neighbor[i]);
                            if (!current.node.neighbor[i].containedInQ){
                                openSet.insert(current.node.neighbor[i], current.node.neighbor[i].fScore);
                            }
                        }
                    }
                }
            }
            aStar();
            let aStarTimer = setInterval(function(){
                aStar();
            }, 5);
            
            break;
        default:
            break;
    }
});
