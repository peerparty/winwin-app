(function() {

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

  let msg, prevMsg

  ws.onmessage = function(e) {
    console.log(e.data)
    prevMsg = msg
    msg = JSON.parse(e.data)
    handleData(msg, prevMsg)
  }

})()
