const { invoke } = window.__TAURI__.tauri;
const shell = window.__TAURI__.shell;
const {emit, listen} = window.__TAURI__.event;
const dialog = window.__TAURI__.dialog;
const {readTextFile, writeTextFile} = window.__TAURI__.fs; 
const WebviewWindow = window.__TAURI__.window.WebviewWindow;
const appWindow = window.__TAURI__.window.appWindow;
const windowLabel = appWindow.label;

import {INDEX_LABELS as LABELS} from "./labels.js";
import {setLabels} from "./common.js";
// import {handleArabizi} from "./arabizi.js";

//================
//   Globals
//================
let arabizi = false;    // FIXME: turnoff for now, feature not ready.
let fontSize = 12;
let editorLang = await invoke('editor_lang');
let projLang = editorLang;
let projPath = await invoke('home_dir');  
let direction = editorLang === "ar"? "rtl" : "ltr";
let editorDirection = direction;
let openPath;
let selectedTab;
let terminateBtnClicked;


//================
//   commonKeyMap
//================
const commonKeyMap = {
  "Ctrl-Q": (cm) => cm.foldCode(cm.getCursor()),    
  "Tab" : () => indent(),
  "Shift-Tab" : () =>dedent(),  
  "Ctrl-'": () => { insertChar("‹›");},
  "Shift-Ctrl-'": () => { insertChar("«»");},
  "Shift-Ctrl-7": () => { insertChar('ࢱ');},
  "Shift-Ctrl-4": () => {  insertChar('\u{1EE4D}');},
  "Shift-Ctrl-5": () => {  insertChar('∈');},
  "Shift-Ctrl--": () => {  insertChar('⏎');},
  "Shift-Ctrl-1": () => {  insertChar('✓');},
  "Shift-Ctrl-0": () => {  insertChar('✗');},
  "Shift-Ctrl-2": () => {  insertChar('⎔');},
  "Ctrl-=": () => {  increaseFont();},
  "Ctrl--": () => {  decreaseFont();},
}

const qwertyKeyMap = {
  // mapping for typing with a qwerty keyboard
  "Shift-Ctrl-`": () => {  insertChar('~');},
  "Shift-Ctrl-8": () => { insertChar('×');},
  "Shift-Ctrl-/": () => { insertChar('÷');},
  "Ctrl-;": () => { insertChar('؛'); },
  "Shift-Ctrl-;": () => { insertChar(':'); },
  "Ctrl-.": () => { insertChar('.'); },
  "Ctrl-,": () => { insertChar('،'); },
  "Ctrl-/": () => { insertChar('/'); },
  "Ctrl-[": () => { insertChar(']'); },
  "Ctrl-]": () => { insertChar('[]'); },
//   "Shift-Ctrl-[": () => { insertChar('}'); },
//   "Shift-Ctrl-]": () => { insertChar('{}'); },  
  "Shift-Ctrl-,": () => { insertChar('}'); },   // BUG! Shift-Ctrl-[ is conlficting with this one
  "Shift-Ctrl-.": () => { insertChar('{}'); },     // BUG! Shift-Ctrl-] is conlficting with this one
  
//   "Esc": () => {  insertSymbol();},  
//   "Ctrl-Space": "autocomplete",
};

//================
//   CodeMirror.fromTextArea()
//================
const editor = CodeMirror.fromTextArea(document.querySelector('#code'), {
  lineNumbers: true,
  lineWrapping: true,
  direction: editorDirection,
  scrollbarStyle: "simple",
  indentUnit: 4, 
  tabSize: 4,
  styleActiveLine: true,
  matchBrackets: true,
  autoCloseBrackets: true,
  lineNumberFormatter: lineNumberFormatter(editorDirection),

  // FIXME:users might need to type english characters in  strings // comments , since the code is auto switching characters to ar, the symbol lookup dropdownlist should 
  //      allow arabic users to select the english equivalent. 
  // FIXME: the assumption here is only a QWERTY keyboard layout, more control and multi-support needs to be provided for non-QWERTY keyboard users. 
  extraKeys: {
    ...commonKeyMap,
    ...qwertyKeyMap
  },
  foldGutter: true,
  gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]      

});

/* 

if(arabizi) {
    editor.on('keypress', (cm, e) => {
        console.log(e.key);
        handleArabizi(e.key, cm);
  });  
}
 */

await setupListeners();
await init(editorLang);
await tabToSpaces();
await setTheme("default");

// TESTING:
// addSeenTab("main.seen");
// addSeenTab("رئيسي.س");


//================
//   init()
//================
async function init(langId) {
  await setEditorLang(langId);
  
  projLang = langId;
  setFontSize(fontSize);
  setTitle(langId);
  setDirection(langId);
  setLabels(LABELS, langId);
  setSyntaxHighlighter(langId);
  editor.setValue("");
  selectedTab = -1;
  openPath = "";
  terminateBtnClicked = false;
  editor.clearHistory();			  

  setCursorPosition(1,1);
  setPath("\u00A0");    // prevent div from collapsing 

  if(projPath) {
    openProj(projPath); 
  }
}

//================
//   setEditorLang()
//================
async function setEditorLang(id) {
  editorLang = id;
  await invoke("set_editor_lang",  { id: id });
}

//================
//   setTitle()
//================
async function setTitle(langId, text) {
  if (langId === "ar") {
    text = text === undefined? "محرر س" : text;
    await appWindow.setTitle(text);
  } else {
    text = text === undefined? "Seen Editor" : text;
    await appWindow.setTitle(text);
  }
}

//================
//   setPath()
//================
async function setPath(path) {
  let el = document.querySelector("#path");
  el.textContent = path;  
}

//================
//   setDirection()
//================
async function setDirection(langId) {
  let dir = "ltr";
  if (langId === "ar") {
    dir = "rtl";
  }
  // editor.setDirection(projLang === "ar"? "rtl" : "ltr");
  document.querySelector("html").setAttribute("dir", dir);
  document.querySelector("#container").setAttribute("dir", dir);
  document.querySelector("#project_explorer").setAttribute("dir", dir);
  document.querySelector("#editor_output").setAttribute("dir", dir);
  document.querySelector("#output").setAttribute("dir", dir);
  document.querySelector("#status_bar").setAttribute("dir", dir);
  document.querySelector("#status_bar").style.textAlign = dir === "rtl"? "left" : "right";
}

//================
//   setCursorPosition()
//================
function setCursorPosition(line, ch) {
    document.querySelector("#status_bar").textContent = 
      editorLang === "ar"? 
          `سطر ${toEasternDigits(line)}, عامود ${toEasternDigits(ch)}`  :
          `Ln ${line}, Col ${ch}`;
}

//================
//   insertChar()
//================
function insertChar(char) {
  let c = char;

  if(direction === "rtl") {    
    const cursor = editor.doc.getCursor();
    const line = cursor.line;  
    editor.doc.replaceRange(c, cursor); 
    editor.doc.setCursor(line, cursor.ch + c.length);
  } else { 
    return CodeMirror.Pass; 
  } 

}

//================
//   replaceChar()
//================
function replaceChar(c) {
    const cursor = editor.doc.getCursor();
    const line = cursor.line;  
    editor.doc.replaceRange(c, cursor); 
    editor.doc.setCursor(line, cursor.ch + c.length + 1);
}
/* 

//================
//   insertSymbol()
//================
// FIXME : TESTING CODE, REMOVE
function insertSymbol() {
  // let el = document.createElement("span");
  // el.classList.add("ayah");
  // el.innerText = "٣٣";
  const cursor = editor.doc.getCursor();
  const {line, ch} = cursor;
  // editor.doc.setBookmark({line, ch}, {widget: el});
  editor.doc.replaceRange("٣٣", {line,ch});
  editor.doc.markText({line,ch},{line,ch: ch + 2}, {css: "font-family:UthmanicHafs"} );
}

 */

//================
//   indent()
//================
function indent() {
    
    // src: https://gist.github.com/danieleds/326903084a196055a7c3#file-gistfile1-js 
    if (editor.somethingSelected()) {
       var sel = editor.getSelection("\n");
        // Indent only if there are multiple lines selected, or if the selection spans a full line
        if (sel.length > 0 && (sel.indexOf("\n") > -1 || sel.length === editor.getLine(editor.getCursor().line).length)) {
          editor.indentSelection("add");
            return  CodeMirror.Pass;    
        }
      }
      //======== end src =========//
    
    var spaces = Array(editor.getOption("indentUnit") + 1).join(" ");
    editor.replaceSelection(spaces);
}


//---------------------
//   dedent()
//---------------------  
function dedent() {
      // src: https://gist.github.com/danieleds/326903084a196055a7c3#file-gistfile1-js 
      editor.indentSelection("subtract");
}    

//================
//   increaseFont()
//================
function increaseFont() { fontSize++; setFontSize(fontSize); }

//================
//   decreaseFont()
//================
function decreaseFont() { fontSize--; setFontSize(fontSize); }

//================
//   setTheme()
//================
export async function setTheme(name) {

    const updateThemeClass = (el, name) => {
        [...el.classList].forEach(className => {        
            if(className.startsWith("cm-s")) {
              el.classList.remove(className);
            }
        });
        name.split(' ').forEach(name=> {
            el.classList.add(`cm-s-${name}`);
        });
    }
    editor.setOption("theme", name); 
    await invoke("set_theme", {name: name});

    updateThemeClass(document.querySelector("#wrapper") , name);
    updateThemeClass(document.querySelector("#project_explorer") , name);
    updateThemeClass(document.querySelector("#editor_output") , name);
    updateThemeClass(document.querySelector("#output") , name);
    setFooterTheme();    
} 

//================
//   setFooterTheme()
//================
export function setFooterTheme() {
    const status_bar = document.querySelector("#status_bar");
    const output_style = window.getComputedStyle(document.querySelector("#output"));
    status_bar.style.fontSize = output_style.getPropertyValue("font-size");
    status_bar.style.color = output_style.getPropertyValue("color");
    status_bar.style.backgroundColor = output_style.getPropertyValue("background-color");
}

//================
//   setFontSize()
//================
export function setFontSize(size) {
    let els = document.querySelectorAll(".CodeMirror");
    els = [...els, ...document.querySelectorAll("button")];
    els.push(document.querySelector("#status_bar"));
    els.forEach(el => {
        el.style.fontSize = `${size}px`;
    });
}


//================
//   setSyntaxHighlighter()
//================
export function setSyntaxHighlighter(langId) {
  const mode = langId === "ar"? "seen-ar" : "seen-en";
  editor.setOption("mode", mode);
}

//================
//   createSeenFileIcon()
//================
function createSeenFileIcon() {
  const icon = document.createElement("span");
  icon.classList.add("file_type_icon");
  icon.textContent = 'س';
  return icon;
}

//================
//   addSeenTab()
//================
function addSeenTab(filename) { 
  addTab(createSeenFileIcon(), filename); 
}

//================
//   closeTabButton()
//================
function tabCloseButton() {
  const btn = document.createElement("button");
  btn.classList.add("close_tab");
  btn.textContent = 'x';
  btn.addEventListener( 'click', (e) => closeTab(e.target.parentElement));

  return btn;
}

//================
//   addTab()
//================
function addTab(icon, filename) {
  
  const title = document.createElement("span");
  title.classList.add("tab_title");
  title.textContent = filename;
  title.setAttribute("dir","rtl");    // "ltr"  does not work for arabic, "rtl" works for both ar/en

  const close_btn = tabCloseButton();
  const tab = document.createElement("span");
  tab.classList.add("tab");
  editorLang === "ar"? tab.style.borderLeft = "1px solid" : tab.style.borderRight = "1px solid";
  
  tab.appendChild(icon);
  tab.appendChild(title);
  tab.appendChild(close_btn);
  
  document.querySelector("#tabs").appendChild(tab);

  
}

//================
//   closeTab()
//================
function closeTab(tab) {
    tab.parentElement.removeChild(tab);
}

//================
//   newProj()
//================
export async function newProj() {
  var webviewWindow = new WebviewWindow(
    "new_proj", { 
      title: LABELS.new_proj[editorLang],
      url: "./new-proj.html",      
      width: 680,
      height: 256,
      alwaysOnTop: true
    });
  await webviewWindow.center();


  editor.setValue("");
  openPath = "";
  editor.clearHistory();			
}

//================
//   openProj()
//================
export async function openProj(path) {
  let selected;

  if(path) {
    selected = path;
  } else {
    selected = await dialog.open({
      multiple: false,
      directory: true,
  });
  }

if (Array.isArray(selected)) {
    // user selected multiple files
} else if (selected === null) {
    // user cancelled the selection
} else {
    // user selected a single file
    if(await invoke("is_proj_dir",  { path: selected })) {
      // invoke("open_proj", {path: selected});
      projLang = await invoke("proj_lang", {path: selected});
      editorDirection = projLang === "ar"? "rtl" : "ltr";

      const projName = await invoke("proj_name", {langId: projLang, path: selected});
      setTitle(projLang, projName);
      const mainPath = await invoke("main_path", {langId: projLang, path: selected});
      await invoke(
        "read_src",  
        { langId: projLang,
          path: selected 
        }
      ).then((src) => {
          editor.setOption("lineNumberFormatter", lineNumberFormatter(editorDirection));
          editor.setValue(src);
          editor.clearHistory();      
          // editor.setDirection(editorDirection);
          editor.setOption("direction", editorDirection);
          setSyntaxHighlighter(projLang);
          openPath = selected;     
          setPath(mainPath); // FIXME for now hardcoding the main.seen
      })
        .catch( async (error) => {
          console.log(error);
        });
    } else {
      let msg = "";
      let opts = {};
      if(editorLang === "ar") {
        msg =  "الدليل الذي تم اختياره لا يمثل مشروع س." + "\n" + `الدليل يجب أن يحتوي على ملف "هيئة.س"`;
        opts = { title: "فتح مشروع", type: "خطأ" };
      } else {
        msg = "Invalid project directory\ndirectory must contain the conf.seen file ";
        opts = { title: "Open Project", type: "error" };
      }

      await dialog.message(msg, opts);                
    }     
  }
}

//================
//   closeProj()
//================
export async function closeProj() {
  init(editorLang);
}


//================
//   save()
//================
export async function save() {
    let home = openPath;
    if(home === "") { 
        home = await dialog.save({
          filters: [{
            name: 'Source',
            extensions: ['seen', 'س']
          }]
        });
    }
    let content = editor.getValue();
    let mainPath = `${home}/${(projLang == "ar"? ("مصدر/" +  "رئيسي.س") : "src/main.seen")}`;
    await writeTextFile(mainPath, content);
    openPath = home;

}

//================
//   saveAs()
//================
// export async function saveAs() {
//   let path = await save({
//     filters: [{
//       name: 'Source',
//       extensions: ['seen', 'س']
//     }]
//   });
//   let content = editor.getValue();
//   await writeTextFile(path, content);  
//   openPath = path;
  
// });


// export async function compile() {

//   await invoke("compile", {path: openPath});
// }

//================
//   build()
//================
export async function build() {
  writeOutput(document.createElement("br"));
  await invoke("build", {path: openPath});
}

//================
//   run()
//================
export async function run() {
  writeOutput(document.createElement("br"));

  document.querySelector("#terminate").disabled = false;
  document.querySelector("#run").disabled = true;
  document.querySelector("#build").disabled = true;  

  await invoke("run", {path: openPath});
}

//================
//   terminate()
//================
export async function terminate() {
  writeOutput(document.createElement("br"));
  terminateBtnClicked = true;
  await invoke("terminate");
}


//================
//   clear()
//================
export async function clear() {
  document.querySelector("#output").innerHTML = '';
}

//================
//   setLang()
//================
export async function setLang(id) { await init(id); }

//================
//   setupListeners()
//================
async function setupListeners() {

  //---------------------
  //   clicks
  //---------------------  
  document.querySelector('#build').addEventListener('click', () => build());
  document.querySelector('#run').addEventListener('click', () => run());
  document.querySelector('#terminate').addEventListener('click', () => terminate());
  document.querySelector('#clear').addEventListener('click', () => clear());
  
  //---------------------
  //   cursorActivity
  //---------------------  
  editor.on('cursorActivity', (args) => { 
    let {line, ch} = editor.getCursor();
    line += 1;
    ch += 1;
    setCursorPosition(line, ch);
  }); 
  
  //---------------------
  //   new-proj
  //---------------------
  await listen('new-proj', async (event) => {
    invoke("new", event.payload)
    .then(async () => {
      const path = event.payload.path;
      const name = event.payload.name;
  
      await openProj(`${path}/${name}`);    
    })
    .catch(async err => await dialog.message(err, { title: '', type: 'error' }));
  });
  
  //---------------------
  //   menu
  //---------------------  
  await listen('menu-new-proj', async(event) => await newProj());
  await listen('menu-open-proj', async(event) => await openProj());
  await listen('menu-close-proj', async(event) => await closeProj());
  await listen('menu-save', async(event) => await save());
  await listen('menu-build', async(event) => await build());
  await listen('menu-run', async(event) => await run());
  await listen('menu-theme', async(event) => await setTheme(event.payload));
  
  //---------------------
  //   seen-stdout
  //---------------------  
  await listen('seen-stdout', (event) => {
    if(event.payload.trim().startsWith("http")) {
      createBtnLink(event.payload);
    } else {
      writeP(event.payload);
    }
  
  });
  
  //---------------------
  //   seen-stderr
  //---------------------  
  await listen('seen-stderr', (event) => {
    if(event.payload.trim().startsWith("Error")) {
      createErrorSpan(event.payload);
    } else {
      writeP(event.payload);
    }
  });
  
  //---------------------
  //   proc-term
  //---------------------  
  await listen('proc-term', (event) => {
    if(terminateBtnClicked) {
      if(projLang === "ar") {
        writeP("انتهى.");
      } else {
        writeP("\nterminated.");
      }
  
      terminateBtnClicked = false;
    
    }
  
    document.querySelector("#terminate").disabled = true;
    document.querySelector("#run").disabled = false;
    // document.querySelector("#compile").disabled = false;
    document.querySelector("#build").disabled = false;
    
  });
  
}

//================
//   lineNumberFormatter()
//================
function lineNumberFormatter(dir) {
  if(dir === "rtl") {
    return (n) => toEasternDigits(n)
  } else {
    return (n) => n
  }
  
}

//================
//   writeOutput()
//================
function writeOutput(el) {
  var output = document.querySelector('#output');
  output.appendChild(el);
  output.scrollTop = output.scrollHeight;
}

//================
//   openLink()
//================
function openLink(link) {
  link = link.trim();
  shell.open(link)
}

//================
//   createBtnLink()
//================
function createBtnLink(text) {
  const btn = document.createElement("button");
  btn.classList.add("btn-link");
  const span = document.createElement("span");
  span.classList.add("cm-link");
  span.textContent = text;
  // btn.textContent = text;
  btn.addEventListener('click', () => openLink(text));
  const p = document.createElement("p");
  p.setAttribute("dir", editorDirection);
  btn.appendChild(span);
  p.appendChild(btn);  
  writeOutput(p);
}

//================
//   createErrorSpan()
//================
function createErrorSpan(text) {
    const span = document.createElement("span");
    span.classList.add("cm-error");
    span.textContent = text;
    const p = document.createElement("p");
    p.setAttribute("dir", editorDirection);
    p.appendChild(span);  
    writeOutput(p);    
}

//================
//   writeP()
//================
function writeP(text, color) {
  const p = document.createElement("p");
  p.textContent = text;
  p.setAttribute("dir", editorDirection);
  if(color) {
    p.style.color = color;
  }
  writeOutput(p);
}

