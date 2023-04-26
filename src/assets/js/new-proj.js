import {NEW_PROJECT_LABELS as LABELS}  from "./labels.js";
import {setLabels} from "./common.js";

const {appWindow} = window.__TAURI__.window;
const {open, save} = window.__TAURI__.dialog;
const {emit, listen} = window.__TAURI__.event;
const { invoke } = window.__TAURI__.tauri;

//================
//   Constants
//================
const NAME_PATTERN=/^[a-zA-Z_][a-zA-Z0-9_]{0,49}/;
const NAME_PATTERN_AR=/^[ا-ي_][ا-ي_((0-9)|٠-٩)]{0,49}/;

//================
//   Globals
//================
const name = document.querySelector('#name');
const path = document.querySelector('#path');
const template = document.querySelector('#template');
const lang = document.querySelector('#lang');

document.querySelector("input").setAttribute('autocomplete','none');


await setupListeners();

//================
//   init()
//================
export async function init() {
    
    const theme = await invoke('theme');
    const container =document.querySelector("#container");
    document.body.classList.add(`cm-s-${theme}`);
    container.classList.add(`cm-s-${theme}`);
    
    const langId = await invoke('editor_lang');
    if(langId === "ar") {
        document.querySelector("html").setAttribute("dir", "rtl");
        document.querySelector('#form').setAttribute("dir", "rtl");
    } 
    lang.value = langId;
    
    setLabels(LABELS, langId);    
}


//================
//   validateName()
//================
function validateName(name) {
    let v = name.value.trim();
    if(v === "") {
        name.setCustomValidity("must give a name to your project");    
    } else if(!NAME_PATTERN.test(v) && !NAME_PATTERN_AR.test(v)) {
        name.setCustomValidity("invalid name :\n name should be at least one character\ncan start with a letter or _\nfollowed by letters, digits or _  ");
    } else {
        name.setCustomValidity("")
        return true;
    }

    return false;
    
}

//================
//   validatePath()
//================
function validatePath(path) {
    let v = path.value.trim();
    if(v === "") {
        path.setCustomValidity("must specify the path of the project");    
    } else {
        path.setCustomValidity("")
        return true;
    }
    return false;
}        

//================
//   setupListeners()
//================
function setupListeners() {
    //---------------------
    //   click browse
    //---------------------      
    document.querySelector('#browse').addEventListener('click', async () => {
        const selected = await window.__TAURI__.dialog.open({
            multiple: false,
            directory: true,
        });
        if (Array.isArray(selected)) {
            // user selected multiple files
        } else if (selected === null) {
            // user cancelled the selection
        } else {
            // user selected a single file
            path.value= selected;
        }                            
    });
    
  //---------------------
  //   click ok
  //---------------------      
    document.querySelector('#ok').addEventListener('click', async () => {
        if(validateName(name) & validatePath(path)) {
            const values = {
                name: name.value.trim(), 
                path: path.value.trim(),
                template: template.value,
                lang: lang.value,
            }
            emit("new-proj", values);
            await appWindow.close();
        }
    
    });
    
  //---------------------
  //   click cancel
  //---------------------      
    document.querySelector('#cancel').addEventListener('click', async () => {await appWindow.close();});
    
}