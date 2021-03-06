(function() {

  let counter = -1
  let serverId = -1
  let timerId
  let userCount = 0
  const screenTime = 42000

  function addContent(template) {
    const content = document.querySelector(`template.${template}`).content
    const elm = document.querySelector('#content')
    elm.innerHTML = ''
    const node = document.importNode(content.firstElementChild, true)
    elm.appendChild(node)
    return node
  }

  function updateCounts() {
    const counts = Array.from(document.querySelectorAll('.count'))
    counts.forEach(c => c.innerHTML = userCount)
  }

  function updateStmts(data) {
    const stmts = Array.from(document.querySelectorAll('.consensus h2'))
    for(let i = 0; i < 5; i++) {
      stmts[i].innerHTML = data['data'][i].stmt
    }
  }

  function updateStmt(data) {
    document.querySelector('.block3 .stmt').innerHTML = data.stmt
  }

  function showInit(data) {
    addContent('people')
    const templates = Array.from(document.querySelectorAll('template'))
    const classes = templates.map(t => t.classList[0]) 
    let i = 0
    setInterval(() => {
      const clazz = classes[i % classes.length]
      console.log("updating content", i % classes.length, clazz)
      addContent(clazz)
      if(clazz === 'stmts') updateStmts(data)
      else if(clazz == 'people') {
        updateCounts(userCount)
        updateStmt(data)
      }
      i++
    }, screenTime)
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
        userCount = res.count
        showInit(res)
        updateStmt(res)
        break
      case 'SCREEN_USER_COUNT':
        userCount = res.count
        updateCounts()
        break
      case 'SCREEN_CONSENSUS':
        //showConsensus(res['data'])
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

