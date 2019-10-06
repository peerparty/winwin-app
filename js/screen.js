(function() {

  let counter = -1
  let serverId = -1
  let timerId

  const getRandomWidth = () => parseInt((Math.random() * Math.max(document.documentElement.clientWidth, window.innerWidth || 0)) + 1) + 'px'
  const getRandomHeight = () => parseInt((Math.random() * Math.max(document.documentElement.clientHeight, window.innerHeight || 0)) + 1) + 'px'
  const getRandomZ = ()  => 0 + 'px' //parseInt((Math.random() * 500) + 1) + 'px'
  const getRandomDuration = () => parseInt((Math.random() * 30000) + 10000)

  function cleanup() {
    document.querySelectorAll('#content .panel').forEach(p => p.remove())
    document.querySelectorAll('#content .screen').forEach(s => s.remove())
    if(timerId) clearInterval(timerId)
  }

  function keyframes() {
    let frames = []
    for(let i = 0; i < parseInt((Math.random() * 10) + 2); i++) {
      frames = [{ transform: 'translate3D(' + getRandomWidth() + ', ' + getRandomHeight() + ', ' + getRandomZ() +')'},...frames]
    }
    return frames
  }

  function animateDiv(p) {
    const ani = p.animate(keyframes(), { duration: getRandomDuration() })
    ani.onfinish = () => { animateDiv(p) }
  }

  function animatePanels() {
    document.querySelectorAll('#content .panel').forEach(p => animateDiv(p))
  }

  function addContent(clazz) {
    const tmp = document.querySelector(`#templates .${clazz}`).cloneNode(true)
    const content = document.querySelector('#content')
    content.appendChild(tmp)
    return tmp
  }

  function strPadLeft(str, pad, length) {
    return (new Array(length + 1).join(pad) + str).slice(-length)
  }

  function addPanels(data) {
    data.forEach(i => {
      const node = addContent('panel')
      node.querySelector('.stmt').innerHTML = i.stmt 
      const date = new Date(i.time)
      const timeStr = strPadLeft('' + date.getMinutes(), '0', 2) +
        ":" + strPadLeft('' + date.getSeconds(), '0', 2)
      node.querySelector('.time').innerHTML = timeStr 
    })
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

  function addNextSession(t) {
    counter = t
    const node = addContent('next-session')
    timerId = startTimer(t, node.querySelector('.time'))
  }

  function addNextStmt(stmt) {
    const node = addContent('next-stmt')
    node.querySelector('.stmt').innerHTML = stmt
  }

  function showInit(data) {
    secs = parseInt(data['start_time'] - (new Date().getTime() / 1000))
    cleanup()
    addPanels(data['data']) 
    addNextSession(secs)
    addNextStmt(data['stmt'])
    animatePanels()
  }

  function showConsensus(stmt) {
    cleanup()
    node = addContent('consensus')
    node.querySelector('.stmt').innerHTML = stmt
  }

  function showTree(data) {
    cleanup()
    node = addContent('tree')
    node.querySelector('p').innerHTML = JSON.stringify(data)
  }

  // Websocket stuff - JBG

  //const ws = new WebSocket('wss://winwin.peerparty.org/ws/')
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const ws = new WebSocket(`${proto}://${window.location.host}/ws/`)

  ws.onopen = function(e) {
    console.log('Websocket open.')
    ws.send(JSON.stringify({ cmd: 'SCREEN_JOIN' }))
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
      case 'SCREEN_INIT':
        showInit(res)
        break
      case 'SCREEN_CONSENSUS':
        showConsensus(res['data'])
        break
      case 'SCREEN_START':
        console.log('Session is starting...')
        break
      case 'SCREEN_TREE':
        console.log('New Discussion Tree')
        break
      case 'SCREEN_NOT_ENOUGH':
        console.log('Not enough users...')
        break
      default:
        console.log('Unknown CMD: ' + cmd)
        break
    }
  }

  //showTree({'foo': 'bar'})

})()

