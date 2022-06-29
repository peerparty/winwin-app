// Settings
let debug = true;


// Global variables
let userId = -1
let userCount = -1
let serverId = -1

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


let previousStatement = ""

// Change the data
function changeData(data) {
	
        //data = json[current]
	// Detect structure (tree / branch / consensus) 
	cmd = data.cmd;

	// Counter through the cmds
	if(debug) {
		console.log(data)
		// document.getElementById('current').innerHTML = "Step " + current 
	}

	// Create a round
	switch(cmd) {
		case 'SCREEN_INIT':
			// Add the first (?) statement
			appendLabel(data.stmt, rounds)
			break;	
		case 'USER_NONE':
			rounds.innerHTML = "";
			break;
		case 'USER':
                        userId = data['id']
                        serverId = data['server_id']
                        //setCookie('server_id', serverId)
                        //setCookie('user_id', userId)
                        //console.log(document.cookie)
                        console.log('User id: ' + userId)
                        userCount = data['count']
                        console.log('USER COUNT', userCount, data['count'])

			appendLabel('You entered the algorithm! Waiting for people to join...', rounds)
			appendBalls(1, rounds, "normal")
			break;
		case 'USER_JOIN':
			totalParticipants = data.count;
			rounds.innerHTML = "";
			appendLabel('Waiting for people to join... ' + data.count + ' participants', rounds)
			appendBalls(data.count, rounds, "normal")
			break;
		case 'USER_QUESTION':
			rounds.innerHTML = "";
			if(data.branch.length > 2) {
				appendLayers(data.branch);
			}
			appendVote(data, rounds);
			addTimer(data.time, rounds)
			break;
		case 'USER_PROMPT':
			rounds.innerHTML = "";
			appendPrompt("<span class='statement'>You responded " + (data.ans ? "Agree" : "Disagree")  + " to </span>" + data.txt, rounds);
			explainAnswer('Respond with a statement that elaborates on why you ' + (data.ans ? "AGREE" : "DISAGREE"), rounds);
			addTimer(data.time, rounds)
			break;
		case 'USER_DONE':
			showConsensus(data.data) 
			break;
	}

	// Store as previous command 
	prevCmd = cmd 

        /*
	if(current < json.length -1  ) {
		current ++;
	} else if(previousStatement == 'USER_DONE')  {
		reset()
	}
        */

	previousStatement = cmd
}



function addTimer(duration, parent) {
	var timer = document.createElement('div')
	timer.classList.add('timer');
	var bar = document.createElement('div');
	bar.classList.add('bar')
	bar.setAttribute('style', 'animation: timerBar ' + duration + 's linear 1 forwards')
	timer.append(bar)
	parent.append(timer)
}

/*
document.body.addEventListener('keydown', function(e) {
	changeData()
})
*/

// Show previous questions
function appendLayers(branches) {
	console.log(branches)
	let previousBranches = document.createElement('div')
	previousBranches.classList.add('previous-branches')
	for(let i = 1; i < branches.length-1; i++) {
		console.log(branches[i])
		let previousBranch = document.createElement('div')
		previousBranch.classList.add('previous-branch')
		previousBranch.classList.add('voting-round');
		let previousBranchContent = document.createElement('div')
		previousBranchContent.classList.add('previous-branch-content')

		let agree = 0;
		let disagree = 0;
		let total = 0;

		for(let j = 0; j < branches[i].answers.length; j++) {
			if(branches[i].answers[j].val == 0) {
				agree++;
			} else {
				disagree++;
			}
			total++;
		}
		let agreeDiv = document.createElement('div')
			agreeDiv.classList.add('bar');
			// agreeDiv.innerHTML = '<span class="margin-bottom">' + 'Agree' + '</span>';
			agreeDiv.classList.add('left');
			agreeDiv.style.width = (agree/total)*100 + "%";
			previousBranchContent.append(agreeDiv);
		
		let disagreeDiv = document.createElement('div')
			disagreeDiv.style.width = (disagree/total)*100 + "%";
			// disagreeDiv.innerHTML = '<span class="margin-bottom">' + 'Disagree' + '</span>';
			disagreeDiv.classList.add('bar');
			disagreeDiv.classList.add('right');
			previousBranchContent.append(disagreeDiv);

		appendLabel(branches[i].name, previousBranchContent) 
		previousBranch.append(previousBranchContent)
		
		previousBranches.append(previousBranch)
	}

	let toggle = document.createElement('div')
	toggle.classList.add('toggle-branches') 
	toggle.onclick = function() { toggleLayers(this) }

	rounds.append(toggle)
	rounds.append(previousBranches)
}


// Toggle visibility of the layer
function toggleLayers(e) {
	let previousBranches = document.querySelector('.previous-branches')

	if(e.classList.contains('toggled') ) {
		e.classList.remove('toggled')
		previousBranches.classList.remove('toggled')
	} else {
		e.classList.add('toggled')
		previousBranches.classList.add('toggled')
	}
}

// Add the vote
function appendVote(data, parent) {
	let row = document.createElement('div')
	row.classList.add('voting-round')
	//row.onclick = function() { changeData() }

	let agreeDiv = document.createElement('div')
	agreeDiv.classList.add('bar');
	agreeDiv.innerHTML = '<span class="margin-bottom">' + 'Agree' + '</span>';

	agreeDiv.classList.add('left');
	agreeDiv.style.width = 50 + "%";
        agreeDiv.addEventListener('click', e => {
          sendAnswer(true)
          row.remove()
	  let previousBranches = document.querySelector('.previous-branches')
          if(previousBranches)
            document.querySelector('.toggle-branches').remove()
            previousBranches.remove()
        })
	row.append(agreeDiv);
	let disagreeDiv = document.createElement('div')
	disagreeDiv.style.width = 50 + "%";
        disagreeDiv.addEventListener('click', e => {
          sendAnswer(false)
          row.remove()
	  let previousBranches = document.querySelector('.previous-branches')
          if(previousBranches)
            document.querySelector('.toggle-branches').remove()
            previousBranches.remove()
        })
	disagreeDiv.innerHTML = '<span class="margin-bottom">' + 'Disagree' + '</span>';

	disagreeDiv.classList.add('bar');
	disagreeDiv.classList.add('right');

	row.append(disagreeDiv);
	appendLabel( "<span class='statement'>statement</span>" + data.txt, row);

	parent.append(row);
}

// Add label in the beginning (?)
function appendPrompt(text, parent) {
	let label = document.createElement('div')
	label.classList.add('prompt')
	label.innerHTML = text;
	parent.append(label);
}


// Add label in the beginning (?)
function appendLabel(text, parent) {
	let label = document.createElement('div')
	label.classList.add('label')
	label.innerHTML = text;
	parent.append(label);
}

// Add answer in the beginning (?)
function explainAnswer(text, parent) {
	let input = document.createElement('textarea')
	input.setAttribute('type', 'textarea')
	input.setAttribute('placeholder', text);
	input.classList.add('input')

	let submit = document.createElement('button')
	submit.setAttribute('type', 'submit')
        submit.addEventListener('click', e => {
          sendPrompt(input.value)
          input.remove()
          submit.remove()
        })
	submit.innerHTML = "Submit"
	submit.classList.add('submit')

	parent.append(input)
	parent.append(submit)

}

// Show the consensus animations
function showConsensus(consensuses) {
	rounds.innerHTML = "";
	rounds.innerHTML += "<span class='statement'>CONSENSUS</span>"
	for(let i = 0; i < consensuses.length; i++) {
		appendPrompt(consensuses[i], rounds)
	}

	let confetti = document.createElement('div');
	confetti.classList.add('confetti-container')
	for(let i = 0; i < 6; i++ ) {
		confetti.innerHTML += '<div class="confetti purple"></div>'
		confetti.innerHTML += '<div class="confetti yellow"></div>'
	}
	document.body.append(confetti)

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
/*
function addBallsWithinRound(round) {
	let answers = json[current].data[0].answers
	checkWhichBalls(answers, round)
}
*/

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

// Shortcuts 
/*
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
*/

function sendResponse(res) {
  ws.send(JSON.stringify({
    cmd: 'USER_RESPONSE',
    id: userId,
    server_id: serverId,
    val: res 
  }))
}

function sendAnswer(ans) {
  ws.send(JSON.stringify({
    cmd: 'USER_ANSWER',
    id: userId,
    server_id: serverId,
    val: ans
  }))
}

function sendPrompt(val) {
  ws.send(JSON.stringify({
    cmd: 'USER_PROMPT',
    id: userId,
    server_id: serverId,
    val: val
  }))
}

// Websocket stuff - JBG

const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
const ws = new WebSocket(`${proto}://${window.location.host}/ws/`)

ws.onopen = function(e) {
  console.log('Websocket open.')
  ws.send(JSON.stringify({ cmd: 'USER_HELLO' }))
}

ws.onclose = function(e) {
  console.log('Websocket closed.')
  //if(!done) showError("Please wait for instructions.")
}

ws.onerror = function(e) {
  console.log('Websocket errored.')
}

ws.onmessage = function(e) {
  console.log(e.data)
  const res = JSON.parse(e.data)
  changeData(res)
}
  
