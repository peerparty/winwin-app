(function() {

  let counter = 0
  let userId = crypto.randomUUID() 
  let userCount = -1
  let serverId = -1
  let timerId
  let results = []
  let done = false
  //const apiUrl = `${window.location.protocol}://${window.location.host}/api/`
  const apiUrl = '/api'
  let lastCmd = ''
  let lastTxt = ''

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
    document.querySelector('.background').classList.remove('ubermate')
    document.querySelector('.background').classList.remove('consensus')
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
    playAudio()
    // Ubermate then go - JBG
    document.querySelector('.background').classList.add('ubermate')
    setTimeout(() => {
      if(id == 'welcome') {
        const sid = getCookie('server_id')
        handleSend({
          cmd: 'USER_HELLO',
          user_id: userId,
          server_id: sid ? parseInt(sid.split(' ')[0]) : -1,
        })
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
    node.querySelector('button').addEventListener('click',
      e => handleClick('welcome'))
  }

  function showTil() {
    cleanup()
    showScreen('til')
    /*
    console.log("showTIL", userCount)
    let color = 'blue'
    if(userCount == 1) color = 'red'
    else if(userCount == 2) color = 'green'
    else if(userCount == 3) color = 'white'
    document.querySelector('#content .dots span').classList.add(color)
    */
  }

  function showLoading() {
    cleanup()
    const node = showScreen('loading')
  } 

  function showTutorial() {
    cleanup()
    const node = showScreen('tutorial')
    node.querySelector('button').addEventListener('click', e => {
      const elm = document.querySelector('#bg-audio')
      //elm.paused ? elm.play() : elm.pause()
      showLoading()
    })
  } 

  function showReady(count) {
    cleanup()
    const node = showScreen('ready') 
    //node.querySelector('.disagree').addEventListener('click',
    //  e => handleClick('ready', false))
    //node.querySelector('.agree').addEventListener('click',
    //  e => handleClick('ready', true))
    document.querySelector('#content .ready span').innerHTML = count
  }  

  function showQuestion(txt, secs) {
    cleanup()
    const node = showScreen('question') 
    startTimer(secs, document.querySelector('#content .question .counter'))
    document.querySelector('#content .question .stmt').innerHTML = txt
    node.querySelector('.disagree').addEventListener('click',
      e => handleClick('question', false))
    node.querySelector('.agree').addEventListener('click',
      e => handleClick('question', true))
  }  

  function showWaiting() {
    cleanup()
    showScreen('waiting') 
  }  

  function submitPrompt(e) {
    e.preventDefault()
    // Ubermate and go - JBG
    document.querySelector('.background').classList.add('ubermate')
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
    document.querySelector('#content .prompt .dynamic').innerHTML = ans ? 'Agree' : 'Disagree'
    document.querySelector('#content .prompt .dynamic').classList.add(ans ? 'yes' : 'no')
    document.querySelector('#content .prompt .dynamic').classList.remove(ans ? 'no' : 'yes')
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
    node.querySelector('button').addEventListener('click',
      e => handleClick('consensus'))
  }  

  function showConsensless() {
    cleanup()
    showScreen('consensless') 
    document.querySelector('button').addEventListener('click',
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
    document.querySelector('button').addEventListener('click',
      e => { window.location = window.location })
  } 

  function sendResponse(res) {
    handleSend({
      cmd: 'USER_RESPONSE',
      id: userId,
      server_id: serverId,
      val: res 
    })
  }

  function sendAnswer(ans) {
    handleSend({
      cmd: 'USER_ANSWER',
      id: userId,
      server_id: serverId,
      val: ans
    })
  }

  function sendPrompt(val) {
    handleSend({
      cmd: 'USER_PROMPT',
      id: userId,
      server_id: serverId,
      val: val
    })
  }

  // Message processing - JBG

  function handleMsg(res) {
    const cmd = res['cmd']
    const txt = res['txt']
    if(cmd === lastCmd && txt === lastTxt) return
    console.log(JSON.stringify(res))
    lastCmd = cmd
    lastTxt = txt 
    switch(cmd) {
      case 'USER':
        //userId = res['id']
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
        showLoading()
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
        //setTimeout(() => showReady(res['count']), 5000)
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
        showError("Please wait for instructions.")
        break
      case 'USER_FULL':
        showError("Sorry! There is a session in progress please wait for the next.")
        break
      default:
        console.log('Unknown CMD: ' + cmd)
        break
    }
  }

  function handleSend(data) {
    const str = JSON.stringify(data)
    //ws.send(str)
    console.log('handleSend', data)
    fetch(`${apiUrl}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: str
    })
      .then(response => response.json())
      .then(data => {
        console.log('handleSend Success:', data)
      })
      .catch((err) => {
        console.error('Error:', err)
      })
  }

  async function handleGet() {
    if(userId != -1) {
      //console.log('handleGet', `${apiUrl}/${userId}`)
      fetch(`${apiUrl}/${userId}`)
        .then(response => response.json())
        .then(data => {
          handleMsg(data)
        })
        .catch((err) => {
          console.error('Error:', err)
        })
    }
  }

  // Websocket stuff - JBG

  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const ws = new WebSocket(`${proto}://${window.location.host}/ws/`)

  ws.onopen = function(e) {
    console.log('Websocket open.')
  }

  ws.onclose = function(e) {
    console.log('Websocket closed.')
    if(!done) showError("Please wait for instructions.")
  }

  ws.onerror = function(e) {
    console.log('Websocket errored.')
  }

  ws.onmessage = function(e) {
    console.log(e.data)
    const res = JSON.parse(e.data)
    handleMsg(res)
  }

  showWelcome() 
//  showTil()
//  showTutorial()
//  showReady()
//  showWaiting()
//  showPrompt()
//  showConsensus()
//  showConsensless()
//  showError()
//  showResults()

  setInterval(handleGet, 1000)

})()

