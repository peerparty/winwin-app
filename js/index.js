(function() {

  let counter = 0
  let userId = -1
  let userCount = -1
  let serverId = -1
  let timerId
  let results = []
  let done = false

  function strPadLeft(str, pad, length) {
    return (new Array(length + 1).join(pad) + str).slice(-length)
  }

  function startTimer(t, elm) {
    counter = t
    timerId = setInterval(() => {
      const time = --counter
      const minutes = Math.floor(time / 60)
      const seconds = Math.floor(time - minutes * 60)
      const tstr = strPadLeft('' + minutes, '0', 2) +
        ":" +
        strPadLeft('' + seconds, '0', 2)
      if(elm) elm.innerHTML = tstr
    }, 1000)
  }

  function cleanup() {
    if(timerId) clearInterval(timerId)
    //const screens = document.querySelectorAll('.screen')
    //screens.forEach(s => s.style.display = 'none')
    document.querySelector('body').classList.remove('ubermate')
    document.querySelector('body').classList.remove('consensus')
  }

  function showScreen(clazz) {
    console.log(`#templates .${clazz}`)
    const tmp = document.querySelector(`#templates .${clazz}`).cloneNode(true)
    const content = document.querySelector('#content')
    if(content.firstChild) content.removeChild(content.firstChild)
    content.appendChild(tmp)
    return tmp
}

  function handleClick(id, res) {
    // Ubermate then go - JBG
    document.querySelector('body').classList.add('ubermate')
    setTimeout(() => {
      if(id == 'welcome') {
        const sid = getCookie('server_id')
        ws.send(JSON.stringify({
          cmd: 'USER_HELLO',
          server_id: sid ? parseInt(sid.split(' ')[0]) : -1,
        }))
      }
      else if(id == 'ready') sendResponse(res ? 1 : 0)
      else if(id == 'question') {
        showWaiting()
        sendAnswer(res ? 1 : 0)
        startTimer(counter, document.querySelector('#content .waiting .counter'))
      }
      else if(id == 'consensus') showResults()
      else if(id == 'consensless' || id == 'error') window.location = window.location
    }, 3000)
  }

  function showWelcome() {
    cleanup()
    const node = showScreen('welcome') 
    node.querySelector('.buttonagree').addEventListener('click',
      e => handleClick('welcome'))
      
  }

  function showTil() {
    cleanup()
    showScreen('til')
    console.log("showTIL", userCount)
    let color = 'blue'
    if(userCount == 1) color = 'red'
    else if(userCount == 2) color = 'green'
    else if(userCount == 3) color = 'white'
    document.querySelector('#content .dots span').classList.add(color)
  }

  function showTutorial() {
    cleanup()
    showScreen('tutorial')
    document.querySelector('.tutorial').addEventListener('click', e => {
      const elm = document.querySelector('#bg-audio')
      elm.paused ? elm.play() : elm.pause()
    })
  } 

  function showReady(count) {
    cleanup()
    const node = showScreen('ready') 
    node.querySelector('.buttondisagree').addEventListener('click',
      e => handleClick('ready', false))
    node.querySelector('.buttonagree').addEventListener('click',
      e => handleClick('ready', true))
    document.querySelector('#content .ready span').innerHTML = count
  }  

  function showQuestion(txt, secs) {
    cleanup()
    const node = showScreen('question') 
    startTimer(secs, document.querySelector('#content .question .counter'))
    document.querySelector('#content .question .stmt').innerHTML = txt
    node.querySelector('.buttondisagree').addEventListener('click',
      e => handleClick('question', false))
    node.querySelector('.buttonagree').addEventListener('click',
      e => handleClick('question', true))
  }  

  function showWaiting() {
    cleanup()
    showScreen('waiting') 
  }  

  function submitPrompt(e) {
    e.preventDefault()
    // Ubermate and go - JBG
    document.querySelector('body').classList.add('ubermate')
    buttonAudio()
    setTimeout(() => {
      sendPrompt(document.querySelector('#content .prompt textarea').value)
      showWaiting()
      startTimer(counter, document.querySelector('#content .waiting .counter'))
    }, 3000)
  }

  function showPrompt(txt, ans, secs) {
    cleanup()
    showScreen('prompt') 
    document.querySelector('#content .prompt .question h1').innerHTML = txt 
    document.querySelector('#content .prompt .answer').innerHTML = ans ? 'Agree' : 'Disagree'
    document.querySelector('#content .prompt .answer').classList.add(ans ? 'yes' : 'no')
    document.querySelector('#content .prompt .answer').classList.remove(ans ? 'no' : 'yes')
    document.querySelector('#content .prompt textarea').focus()
    document.querySelector('#content .prompt textarea').addEventListener('keyup', e => { if(e.keyCode === 13) submitPrompt(e) })
    startTimer(secs, document.querySelector('#content .prompt .counter'))
    document.querySelector('#content .prompt .submit').addEventListener('click', e => submitPrompt(e))
  } 

  function showConsensus() {
    cleanup()
    const node = showScreen('consensus') 
    document.querySelector('body').classList.add('consensus')
    document.querySelector('#content .consensus span').innerHTML = results.length
    node.querySelector('.buttonagree').addEventListener('click',
      e => handleClick('consensus'))
  }  

  function showConsensless() {
    cleanup()
    showScreen('consensless') 
    document.querySelector('.buttonagree').addEventListener('click',
      e => { window.location = window.location })
  } 

  function showResults() {
    cleanup()
    showScreen('results')
    results.forEach(r => {
      const node = document.createElement('li')
      const text = document.createTextNode(r)
      node.appendChild(text)
      document.querySelector('#content .results ul').appendChild(node)
    })
  }

  function showError(msg) {
    cleanup()
    showScreen('error') 
    document.querySelector('#content .error .msg').innerHTML = msg
    document.querySelector('.buttonagree').addEventListener('click',
      e => { window.location = window.location })
  } 

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
    //ws.send(JSON.stringify({ cmd: 'USER_HELLO' }))
  }

  ws.onclose = function(e) {
    console.log('Websocket closed.')
    if(!done) showError("ERROR: Something has gone terribly wrong.")
  }

  ws.onerror = function(e) {
    console.log('Websocket errored.')
  }

  ws.onmessage = function(e) {
    console.log(e.data)
    const res = JSON.parse(e.data)
    const cmd = res['cmd']
    switch(cmd) {
      case 'USER':
        userId = res['id']
        serverId = res['server_id']
        setCookie('server_id', serverId)
        setCookie('user_id', userId)
        console.log(document.cookie)
        console.log('User id: ' + userId)
        userCount = res['count']
        console.log('USER COUNT', userCount, res['count'])
        showTil()
        break
      case 'USER_QUESTION':
        console.log('Question is: ' + res['txt'])
        showQuestion(res['txt'], res['time'])
        break
      case 'USER_PROMPT':
        showPrompt(res['txt'], res['ans'], res['time'])
        break
      case 'USER_ANSWERS':
        //startCounter(15)
        //showInstruction("Waiting for everyone to make a choice...")
        break
      case 'USER_DONE':
        done = true
        results = res['data']
        ws.close()
        if(results.length > 0) showConsensus()
        else showConsensless()
        break
      case 'USER_JOIN':
        // Ask user if they would like to force start - JBG
        // Give the newest user a chance to check their color - JBG
        setTimeout(() => showReady(res['count']), 5000)
        break
      case 'USER_TUTORIAL':
        showTutorial()
        break
      case 'USER_WAIT':
        showTil()
        break
      case 'USER_NOT_ENOUGH':
        showError("Not enough people joined this session.")
        break
      case 'USER_ERROR':
        showError("ERROR: Something has gone terribly wrong.")
        break
      default:
        console.log('Unknown CMD: ' + cmd)
        break
    }
  }

  showWelcome() 

/*  showTil()*/
/*  showTutorial()*/
/*  showReady()*/
/*  showQuestion()*/
/*  showWaiting()*/
/*  showPrompt()*/
/*  showConsensus()*/
/*  showConsensless()*/
/*  showError()*/ 
/*  showResults()*/



})()


