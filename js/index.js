(function() {

  let counter = 0
  let userId = -1
  let serverId = -1
  let timerId

  function buttonAudio() {
    var audio = new Audio('fg.mpeg')
    audio.play()
  }

  function init() {
    document.addEventListener('swipe', e => {
      console.log('swipe', e.detail)
      handleSwipe(e.detail, e.explicitOriginalTarget.classList[0])
    })

  }

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
      elm.innerHTML = tstr
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
    const tmp = document.querySelector(`#templates .${clazz}`).cloneNode(true)
    const content = document.querySelector('#content')
    content.removeChild(content.firstChild)
    content.appendChild(tmp)
  }

  function showWelcome() {
    cleanup()
    showScreen('welcome') 
    setupSwipe('welcome', 1)
  }

  function showTil(t) {
    cleanup()
    showScreen('til')
    startTimer(t, document.querySelector('#content .til .counter'))
  }

  function showTutorial() {
    cleanup()
    showScreen('tutorial')
  } 

  function showReady(count) {
    cleanup()
    showScreen('ready') 
    setupSwipe('ready', 2)
    document.querySelector('#content .ready span').innerHTML = count
  }  

  function showQuestion(txt, secs) {
    cleanup()
    showScreen('question') 
    setupSwipe('question', 2)
    startTimer(secs, document.querySelector('#content .question .counter'))
    document.querySelector('#content .question .stmt').innerHTML = txt 
  }  

  function showWaiting() {
    cleanup()
    showScreen('waiting') 
  }  

  function showPrompt(txt, ans, secs) {
    cleanup()
    showScreen('prompt') 
    document.querySelector('#content .prompt .question h3').innerHTML = txt 
    document.querySelector('#content .prompt .answer').innerHTML = ans ? 'Agree' : 'Disagree'
    document.querySelector('#content .prompt .answer').classList.add(ans ? 'yes' : 'no')
    document.querySelector('#content .prompt .answer').classList.remove(ans ? 'no' : 'yes')
    document.querySelector('#content .prompt textarea').focus()

    document.querySelector('#content .prompt .submit').addEventListener('click', e => {
      showWaiting()
      // Ubermate and go - JBG
      setTimeout(() => sendPrompt(document.querySelector('textarea').value), 3000)
    })

    //startTimer(secs, document.querySelector('#waiting .counter'))
  } 

  function showConsensus() {
    cleanup()
    showScreen('consensus') 
    setupSwipe('consensus', 1)
    document.querySelector('body').classList.add('consensus')
  }  

  function showConsensless() {
    cleanup()
    showScreen('consensless') 
  } 

  function showMoments() {
    cleanup()
    showScreen('moments') 
    document.querySelector('body').classList.add('consensus')
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

  function handleSwipe(screen, id) {
    // Ubermate then go - JBG
    document.querySelector('body').classList.add('ubermate')
    setTimeout(() => {
      showWaiting()
      console.log('handleSwipe', screen, id)
      if(screen == 1 && id == 'welcome') ws.send(JSON.stringify({ cmd: 'USER_HELLO' }))
      else if(id == 'ready') sendResponse(screen ? 1 : 0)
      else if(id == 'question') sendAnswer(screen ? 1 : 0)
    }, 3000)

  }

  // Websocket stuff - JBG

  //const ws = new WebSocket('wss://winwin.peerparty.org/ws/')
  //const ws = new WebSocket('ws://localhost:8000/')
  const ws = new WebSocket('ws://localhost/ws/')

  ws.onopen = function(e) {
    console.log('Websocket open.')
    //ws.send(JSON.stringify({ cmd: 'USER_HELLO' }))
  }

  ws.onclose = function(e) {
    console.log('Websocket closed.')
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
        console.log('User id: ' + userId )
        showTil(((res['start_time'] * 1000) - Date.now()) / 1000)
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

        break
      case 'USER_JOIN':
        //Ask user if they would like to force start - JBG
        showReady(res['count'])
        break
      case 'USER_TUTORIAL':
        showTutorial()
        break
      default:
        console.log('Unknown CMD: ' + cmd)
        break
    }
  }

  init()
  showWelcome()

})()

