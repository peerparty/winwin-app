// Settings
let debug = true;


// Global variables
let current = 0;
let rounds = document.getElementById('rounds')
let lastvotesAgree = 0;
let lastvotesDisagree = 0;
let cmd = ""
let prevCmd;
let thisRound;
let lastReplacedRound;
let level = 1;
let totalParticipants = 0;
let totalLevels = 0;
let deepestLevel = 0;


// Hard reset ;-)

function reset() {
	location.reload();
}

// Show/hide debug interface
function setDebug() {
	if(!debug) {
		document.getElementById('current').style.display = "none";
	}
}

setDebug() 

function changeData() {
  handleData(json[current], json[current-1])

  if(current < json.length - 1) {
	current++
  } else {
	current = 0
	reset()
  }
}

// Change the data
function handleData(msg, prevMsg) {
       	
	// Detect structure (tree / branch / consensus) 
	cmd = msg.cmd;

	// Counter through the cmds
	if(debug) {
		console.log(msg)
		// document.getElementById('current').innerHTML = "Step " + current 
	}

	// Create a round
	switch(cmd) {
		case 'SCREEN_INIT':
			// Add the first (?) statement
			appendLabel(msg.stmt, rounds)
			break	
		case 'SCREEN_USER_JOIN':
			appendBalls(1, rounds, "normal")
			break
		case 'SCREEN_USER_COUNT':
			totalParticipants = msg.count
			break
		case 'SCREEN_BRANCH':
			if(document.querySelector('.legend').classList.contains('hidden')) {
				document.querySelector('.legend').classList.remove('hidden')
			}
			// Check whether we switch between branches
			let prevName
			if(prevMsg && prevMsg.data[0] !== undefined) {
				prevName = prevMsg.data[0].name
			} else {
				prevName = msg.data[0].name
			}
			
			// If the current cmd is not the previous one
			// Or we switch a branch
			if( cmd !== prevCmd  || msg.data[0].name !== prevName ) {
				rounds.innerHTML = "";
				lastvotesAgree = 0;
				lastvotesDisagree = 0;
				createLevels(msg)
				createBranchRound(msg)
				showAllBranches()

			} else {
				// Voting on a branch
				let currentRound = document.querySelector('.state-1')
				addBallsWithinRound(msg, currentRound)
			}
			break;
		case 'SCREEN_TREE':
			// Reset the votes to count
			lastvotesAgree = 0;
			lastvotesDisagree = 0;

			rounds.innerHTML = "";
			createLevels(msg)
			recursiveTreeRound(msg.data, rounds)	
			showOnlyAncestorBranches()
			break;
		case 'SCREEN_CONSENSUS':
			showConsensus(msg)
			break;
	}

	// Store as previous command 
	prevCmd = cmd 
}


// Add label in the beginning (?)
function appendLabel(text, parent) {
	let label = document.createElement('div')
	label.classList.add('label')
	label.innerHTML = text;
	parent.append(label);
}


// Find the children in the trees
function recursiveTreeRound(data, parent) {
	if(data.children !== undefined) {	
		
		for(let c = 0; c < data.children.length; c++) {
				
				let child = data.children[c];
				let childRound = document.createElement('div')
				childRound.classList.add('voting-round');
				childRound.classList.add("state-" + data.children[c].state)
				childRound.classList.add('child-' + c)
				childRound.classList.add("level-" + level );
				childRound.id = "statement-" + data.children[c].id;

				// Set the branch tracing structure
				let parentAttribute = parent.getAttribute('name')
				let thisAttribute = parentAttribute + " " + 'level-' + level + "-branch-" + c;

				childRound.setAttribute('name', thisAttribute )

				// Label
				let label = document.createElement('div')
				label.classList.add('label')
				label.innerHTML = data.children[c].name;
				childRound.append(label);

				let answers = data.children[c].answers
				addPercentageBars(answers, childRound)
				
				let thisLevelDiv = document.querySelector("#level-" + level)
				insertAfter(childRound, thisLevelDiv)
				level++;
				recursiveTreeRound(child, childRound)
		}
			level--;
			// console.log('last one, going back a level')
	} else {
		// Going back one level
		level--;
	}
}

// "Mute" inactive branches
function showOnlyAncestorBranches() {
	let activeBranch = document.querySelector('.state-1');
	
	if(activeBranch !== null) {
		let activeBranchElements = activeBranch.getAttribute('name').split(" ")
		let branches = document.getElementsByClassName('voting-round')
		for(let i = 1; i < branches.length; i++) {
			if(branches[i].classList.contains('state-1')) {
				branches[i].classList.remove('inactive-branch')
			} else {
				branches[i].classList.add('inactive-branch')
			}
		}

		for(let l = 1; l < deepestLevel - 1; l++ ) {
			for(let i = 0; i < branches.length; i++ ) {
				// Find the correct attribute
				if(branches[i].classList.contains('state-1') ) {
					branches[i].classList.remove('inactive-branch')
				} else {
					let thisBranchContent = branches[i].getAttribute('name').split(" ")
					let thisBranch = thisBranchContent[l+1];
					let branchToLookFor = activeBranchElements[l+1]
					if(thisBranch !== undefined && branchToLookFor !== undefined ) {
						// console.log(branches[i], thisBranchContent, l+1,  branchToLookFor, thisBranch.includes(branchToLookFor) )
						if( thisBranch.includes(branchToLookFor)) {
							branches[i].classList.remove('inactive-branch')
						} 
						
					}
				}
			}
		}	
	}
}

//Show all branches again
function showAllBranches() {
	let allBranches = document.getElementsByClassName('voting-round')
	for(let i = 0; i < allBranches; i++ ) {
		allBranches[i].classList.remove('inactive-branch')
	}
}


// Level creation function
function createLevels(msg) {
	level = 1
	totalLevels = 0;
	countLevels(msg.data)
	makeLevelsDivs()
}

// Count how many levels there are
function countLevels(data) {
	if(data.children !== undefined ) {
		totalLevels++;

		if(deepestLevel < totalLevels) {
			deepestLevel = totalLevels;
		}

		for(let i = 0; i < data.children.length; i++ ) {
			// console.log('total-levels')
			countLevels(data.children[i])
		}
		// if(totalLevels > 0) {
		// 	totalLevels --;
		// }
	} else {
		if(totalLevels > 0) {
			totalLevels --;
		}
	}
}

// Create the actual divs
function makeLevelsDivs() {
	for(let l = 1; l <= deepestLevel; l++) {
		let levelDiv = document.createElement('div');
		levelDiv.classList.add('level')
		levelDiv.classList.add('tiny')

		levelDiv.id = "level-" + l;
		levelDiv.innerHTML = "level " + l
		rounds.append(levelDiv)
	}
}

// Insert elements before or after
function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}


// Create a branch round
function createBranchRound(msg) {
	for(let i = 0; i < msg.data.length; i++ ) {
		if(msg.data[i].name !== 'Root') {
			thisRound = document.createElement('div')
			thisRound.classList.add('voting-round');
			thisRound.id =  "statement-" + msg.data[i].id;
			thisRound.classList.add("state-" + msg.data[i].state );

			// Label
			let label = document.createElement('div')
			label.classList.add('label')
			label.innerHTML = msg.data[i].name;
			thisRound.append(label);

			// Percentage
			if(msg.data[i].state == 4) {
				let answers = msg.data[i].answers; 
				addPercentageBars(answers, thisRound)
			} else if (msg.data[i].state == 1) {
				// Set answers
				let answers = msg.data[i].answers
				checkWhichBalls(answers, thisRound)
			}
			// Add it to the right level
			let thisLevel = deepestLevel - i
			let thisLevelDiv = document.querySelector("#level-" + thisLevel )
			insertAfter(thisRound, thisLevelDiv)

			lastReplacedRound = current;
		}
	}
}



// Show the consensus animations
function showConsensus(msg) {
	rounds.innerHTML = "";
	let round = document.createElement('div')
	round.classList.add('voting-round');
	round.classList.add("state-" + msg.data.state );

	addTicker("consensus", 20, round)

	let consensus = document.createElement('div');
	consensus.classList.add('consensus')

	let label = document.createElement('div')
	label.classList.add('label')
	label.innerHTML = 'CONSENSUS<br>' + msg.data;
	consensus.append(label);
	appendBalls(5, consensus, "normal")
	round.append(consensus)
	addTicker("consensus", 20, round)
	rounds.append(round)
}


// Add a ticker
function addTicker(text, num, parent) {
	let ticker = document.createElement('div')
	ticker.classList.add('ticker')
	let tickerContent = document.createElement('span')
	for(let i = 0; i < num; i++) {
		tickerContent.innerHTML += text.toUpperCase() + "   "
	}
	ticker.append(tickerContent)
	parent.append(ticker)
}


// Add a percentage bar
function addPercentageBars(answers, row) {
	let agree = 0
	let disagree  = 0

	for(let a = 0; a < answers.length; a++) {
		if( answers[a].val == 0 ) {
			agree++;
		} else {
			disagree++;
		}
	}

	if(agree > 0) {
		let agreeDiv = document.createElement('div')
		agreeDiv.classList.add('bar');
		agreeDiv.classList.add('left');
		agreeDiv.style.width = (agree / answers.length)*100 + "%";
		row.append(agreeDiv);
	}
	if(disagree > 0 ) {
		let disagreeDiv = document.createElement('div')
		disagreeDiv.style.width = (disagree / answers.length)*100 + "%";
		disagreeDiv.classList.add('bar');
		disagreeDiv.classList.add('right');
		row.append(disagreeDiv);
	}
}

// Add balls in round
function addBallsWithinRound(msg, round) {
	let answers = msg.data[0].answers
	checkWhichBalls(answers, round)
}

// Check which balls to add
function checkWhichBalls(answers, parent) {
	// console.log('check')
	let agree = 0
	let disagree  = 0

	for(let a = 0; a < answers.length; a++) {
		if( answers[a].val == 0 ) {
			agree++;
		} else {
			disagree++;
		}
	}

	if(lastvotesAgree < agree) {
		appendBalls( (agree-lastvotesAgree), parent, "agree-ball")
	}


	if(lastvotesDisagree < disagree) {
		appendBalls( (disagree-lastvotesDisagree) , parent, "disagree-ball")
	}

	lastvotesAgree = agree;
	lastvotesDisagree = disagree;
}


// Add the actual balls
function appendBalls(amount, parent, type) {
	let balls = []
	for(let i = 0; i < amount; i++) {
		let ball = document.createElement('div')
		ball.classList.add('div')
		ball.classList.add('ball')
		ball.classList.add(type)
		balls.push(ball)
	}
	for(let i = 0; i < balls.length; i++) {
		parent.append(balls[i])
	}
}

// 		Shortcuts 
window.addEventListener('keydown', function(e) {
	
	// W: 	toggle logo animation for breaks / intermezzos
	if(e.key == 'W' || e.key == 'w') {
		let logo = document.querySelector('.hidden-logo')
		if(logo.classList.contains('visible') ) {
			logo.classList.remove('visible')
		} else {
			logo.classList.add('visible')
		}
	}


})


