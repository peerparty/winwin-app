window.addEventListener('DOMContentLoaded', e => {

  document.querySelectorAll('.logo').forEach(logo => {
    const txt = logo.innerHTML
    let str = ''
    for(let i = 0, j = 0; i < txt.length; i++) {
      if(txt[i] != ' ') {
        str += `<span class='logo${j % 6}'>${txt[i]}</span>`
        ++j
      }
    }
    logo.innerHTML = str
  })
  
})


