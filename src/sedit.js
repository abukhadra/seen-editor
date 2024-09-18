
// function SeenEditor(id, opt) {
//     const html = document.createElement('html')                                                                                           |~         
//     html.innerHTML = EDITOR_BODY                                                                                                |~         
//     const iframe = document.createElement('iframe')     
//     iframe.srcdoc = `${getEditorPage().innerHTML}`                                                                                        |~         
//     document.querySelector(`#${id}`).replaceWith(iframe) 
// }


// const EDITOR_BODY = ``

const iframe = document.createElement('iframe')
iframe.src = '../dist/sedit.html'
document.body.appendChild(iframe)
// console.log(iframe.innerHTML)

