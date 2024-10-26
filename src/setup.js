  import {toEasternDigits} from './arabic.js'
  import {INDEX_LABELS , TOOLTIP_LABELS} from './labels.js'
  import {setLabels, setTooltipLabels} from './common.js'
  import {Compiler} from '#seen-compiler/scomp.js'

  const DEFAULT_DARK_THEME = 'panda-syntax'
  const DEFAULT_LIGHT_THEME = 'ttcn_modified'

  const USER_ALLOWED_OPTS = ['mode', 'lang', 'theme', 'statusbar']
  const CODE_OPTS = {
    lang: 'en',
    mode: 'code',
    theme: 'light',
    output: false,
    toolbar: false,
    readonly: true,
    statusbar: true,
    copy: false
  }
  const EDITOR_OPTS = {
    lang: 'en',
    mode: 'editor',
    theme: 'light',
    output: true,
    toolbar: true,
    readonly: false,
    statusbar: true,
    copy: false    
  }
  const userOpts = window.opts 
  const optMode = userOpts.mode || 'code'
  let opts

  switch ( optMode ) {
      case 'code'       : opts = CODE_OPTS ;           break;
      case 'editor'     : opts = EDITOR_OPTS ;         break;    
      default           : throw new Error('invalid mode! : ' + optMode)
  }  

  let langFromURL =  new URLSearchParams(window.location.search).get('lang')
  let lang = langFromURL || userOpts.lang

  Object.keys(userOpts).forEach(k => { 
    if (!USER_ALLOWED_OPTS.includes(k)) { throw new Error('invalid option: ' + k) }
    opts[k] = userOpts[k] 
  })

  const verbose = true

  window.console["log"] = data => writeP(data)
  window.console["error"] = err => { 

    if(isChrome()) {
      verbose? writeP(err.message, ERROR_COLOR) : writeP(err.stack, ERROR_COLOR) 
    }  else { 
      verbose? writeP(err.message, ERROR_COLOR) : writeP(err, ERROR_COLOR)    
    }
  }

  const ERROR_COLOR = 'rgb(217 83 77)'
  const RUNNING_COLOR = 'rgb(108 141 211)'

  const jsBeautifyOptions = {
    "indent_size": "4",
    "indent_char": " ",
    "max_preserve_newlines": "5",
    "preserve_newlines": true,
    "keep_array_indentation": false,
    "break_chained_methods": false,
    "indent_scripts": "normal",
    "brace_style": "collapse",
    "space_before_conditional": false,
    "unescape_strings": false,
    "jslint_happy": false,
    "end_with_newline": false,
    "wrap_line_length": "0",
    "indent_inner_html": false,
    "comma_first": false,
    "e4x": false,
    "indent_empty_lines": false
  }

  const commonKeyMap = {
    "Ctrl-9": (cm) => cm.foldCode(cm.getCursor()),    
    "Tab" : () => indent(),
    "Shift-Tab" : () => dedent(),  
    "Ctrl-'": () => { insertChar("«»")},
    "Ctrl-0": () => {  run()},  
    "Ctrl-=": () => { increaseFont()},
    "Ctrl--": () => { decreaseFont()},
  }

  const CM_COMMANDS = [ "findCtrl" ]

  const eval_div = document.querySelector('#eval')
  const previewArea = document.querySelector('#preview_area')
  const observer = new MutationObserver( ( mutationsList, observer) => { if(onPageLoad) { onPageLoad = false } else { showPreview() }} );
  observer.observe(previewArea, {characterData: false, childList: true, attributes: true});

  
  export const editor = CodeMirror.fromTextArea(document.querySelector('#code'), {
    lineNumbers: true,
    lineWrapping: true,
    direction: getDir(lang),
    scrollbarStyle: "simple",
    indentUnit: 4, 
    tabSize: 4,
    styleActiveLine: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    lineNumberFormatter: lineNumberFormatter(getDir(lang)),

    extraKeys: {
      ...commonKeyMap,
    },
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],    
    commands: CM_COMMANDS,
  });

  const targetEditor = CodeMirror.fromTextArea(document.querySelector('#target_code'), {
    lineNumbers: true,
    lineWrapping: true,
    direction: "ltr",
    scrollbarStyle: "simple",
    indentUnit: 4, 
    tabSize: 4,
    styleActiveLine: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    mode: "javascript",
    lineNumberFormatter: lineNumberFormatter("ltr"),
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],     
    commands: CM_COMMANDS,

  });

  targetEditor.setSize(460)

  let keydown = {}
  let isMaghrib
  let isArabic
  let fontSize
  let editorLang
  let projLang
  let projPath
  let direction
  // let editorDirection
  let onPageLoad

  function isChrome() { return navigator.userAgentData? true : false  }
  function getDir(lang) { return lang === 'ar'? 'rtl' : 'ltr'}

  const SAMPLE_CODE= { 
    ar: 
  `دل بدء {
    اطبع_سطر(«السلام عليكم!»)  
}`,
    en: 
  `fn main { 
    println('hello world') 
}`
  }

  await init(lang);
  await setupListeners();

  async function init(langId) {

    isMaghrib = langId === 'ar_m'
    isArabic = langId.startsWith('ar')
    let lang = langId.startsWith('ar')? 'ar' : 'en';
    fontSize = 14;
    editorLang = lang;
    
    projLang = lang;
    projPath = "";
    // direction = isArabic === "ar"? "rtl" : "ltr";
    // editorDirection = direction;
    onPageLoad = true
    
    document.querySelector("#right_side").style.display="none"  // hide after targetEditor is created, otherwise gutters will not display properly
    document.querySelector("#preview").style.display="none"
    
    document.querySelector('body').style.visibility = 'hidden'
    await setEditorLang(lang);
    document.querySelector("#left_side_label").innerText = editorLang === "ar"? "س" : "seen";
    document.querySelector("#preview_label").innerText = editorLang === "ar" ? "العرض الأولي" : "Preview";

    projLang = lang;
    setFontSize(fontSize);
    setTitle(lang);
    setDirection(lang);
    setLabels(INDEX_LABELS, lang);
    setTooltipLabels(TOOLTIP_LABELS, lang);
    setSyntaxHighlighter(lang);
    editor.setValue(lang === "ar" ? SAMPLE_CODE.ar : SAMPLE_CODE.en);
    editor.clearHistory();			  
    arSetup(lang)
    setCursorPosition(1,1);
    if(projPath) { openProj(projPath); }
    // await setThemeFromOptions()

    await setTheme(opts.theme)

    if( isCodeMode() ) { codeMode() }
    if( !opts.statusbar) { removeStatusBar() }
    document.querySelector('body').style.visibility = 'visible'
  }

  function isCodeMode() { return opts.mode === 'code' }
  function isEditorMode() { return opts.mode === 'editor' }

  function removeStatusBar() { document.querySelector('#status_bar').setAttribute('style',  'display: none;') }

  function codeMode() {
      document.querySelector('#output_container').setAttribute('style',  'display: none;') 
      document.querySelector('#editor_toolbar').setAttribute('style',  'display: none;') 
      document.querySelector('#left_side_titlebar').setAttribute('style',  'display: none;') 
      document.querySelector('#right_side_titlebar').setAttribute('style',  'display: none;') 
      document.querySelector('#tabs_toolbar').setAttribute('style',  'display: none;')     
      document.querySelector('#tabs_toolbar').setAttribute('style',  'display: none;')     
      document.querySelector('#side_by_side').setAttribute('style',  'margin-top: 0;')     
  }

  async function setEditorLang(lang) { editorLang = lang; }

  async function setTitle(lang, text) {
    if (lang === "ar") {
      text = text === undefined? "محرر س" : text;
      document.title = text;
    } else {
      text = text === undefined? "Seen Editor" : text;
      document.title = text;
    }
  }

  async function arSetup(lang) {
    if(lang === "ar" ) {
      document.querySelector("#left_side_label").innerText = "س";
      document.querySelector("#left_side_label").style.fontSize = "17px";
      document.querySelector("#left_side_label").style.marginLeft = "0px";
      document.querySelector("#left_side_label").style.marginRight = "5px";
      document.querySelector("#right_side_label").style.marginLeft = "0px"; 
      document.querySelector("#right_side_label").style.marginRight = "5px"; 
      document.querySelector("#right_side_close").style.cssFloat = "left";
      document.querySelector("#right_side_toolbar").style.cssFloat = "left";
      document.querySelector("#preview_label").style.marginLeft = "0px"; 
      document.querySelector("#preview_label").style.marginRight = "5px"; 
      document.querySelector("#preview_close").style.cssFloat = "left";
    }
  }

  async function setDirection(lang) {
    let dir = getDir(lang)
    editor.setOption('direction', dir)
    document.querySelector("html").setAttribute("dir", dir);
    document.querySelector("#container").setAttribute("dir", dir);
    document.querySelector("#editor_output").setAttribute("dir", dir);
    document.querySelector("#preview").setAttribute("dir", dir);
    document.querySelector("#preview_area").setAttribute("dir", dir);  
    document.querySelector("#output").setAttribute("dir", dir);  
    document.querySelector("#status_bar").setAttribute("dir", dir);
    document.querySelector("#status_bar").style.textAlign = dir === "rtl"? "left" : "right";
  }

  function setCursorPosition(line, ch) {
      document.querySelector("#status_bar").textContent = 
        editorLang === "ar"? 
            `سطر ${toEasternDigits(line)}, عمودي ${toEasternDigits(ch)}`  :
            `Ln ${line}, Col ${ch}`;
  }

  function insertChar(char) {
    let c = char;
    if(isArabic) {    
      const cursor = editor.doc.getCursor();
      const line = cursor.line;  
      editor.doc.replaceRange(c, cursor); 
      editor.doc.setCursor(line, cursor.ch + c.length);
    } else { 
      return CodeMirror.Pass; 
    } 
  }

  function indent() {    
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

  function dedent() {
        editor.indentSelection("subtract");
  }    

  function increaseFont() { fontSize++; setFontSize(fontSize); }
  function decreaseFont() { fontSize--; setFontSize(fontSize); }

  async function setThemeFromOptions() {
      let themes = document.querySelector("#theme")
      let name = themes.options[themes.selectedIndex].value  
      await setTheme(name)
  }

  export async function setTheme(name) {

      if(name === 'dark') { 
        name = DEFAULT_DARK_THEME
        document.querySelector('#theme').value = DEFAULT_DARK_THEME
      }
      else if(name === 'light') { 
        name = DEFAULT_LIGHT_THEME
        document.querySelector('#theme').value = 'ttcn'
      }


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
      targetEditor.setOption("theme", name); 
      updateThemeClass(document.querySelector("#wrapper") , name);
      updateThemeClass(document.querySelector("#editor_output") , name);
      updateThemeClass(document.querySelector("#output") , name); 
      setFooterTheme();    
      const inherited =  window.getComputedStyle(document.querySelector('#run')).getPropertyValue('color');
      document.querySelector('#theme').style.backgroundImage=`url("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20512%20512'%3e%3c!--!Font%20Awesome%20Free%206.6.0%20by%20@fontawesome%20-%20https://fontawesome.com%20License%20-%20https://fontawesome.com/license/free%20Copyright%202024%20Fonticons,%20Inc.--%3e%3cpath%20fill='${inherited}'%20d='M512%20256c0%20.9%200%201.8%200%202.7c-.4%2036.5-33.6%2061.3-70.1%2061.3L344%20320c-26.5%200-48%2021.5-48%2048c0%203.4%20.4%206.7%201%209.9c2.1%2010.2%206.5%2020%2010.8%2029.9c6.1%2013.8%2012.1%2027.5%2012.1%2042c0%2031.8-21.6%2060.7-53.4%2062c-3.5%20.1-7%20.2-10.6%20.2C114.6%20512%200%20397.4%200%20256S114.6%200%20256%200S512%20114.6%20512%20256zM128%20288a32%2032%200%201%200%20-64%200%2032%2032%200%201%200%2064%200zm0-96a32%2032%200%201%200%200-64%2032%2032%200%201%200%200%2064zM288%2096a32%2032%200%201%200%20-64%200%2032%2032%200%201%200%2064%200zm96%2096a32%2032%200%201%200%200-64%2032%2032%200%201%200%200%2064z'/%3e%3c/svg%3e")`
  } 



  function setFooterTheme() {
      const status_bar = document.querySelector("#status_bar");
      const output_style = window.getComputedStyle(document.querySelector("#output"));
      status_bar.style.fontSize = output_style.getPropertyValue("font-size");
      status_bar.style.color = output_style.getPropertyValue("color");
      status_bar.style.backgroundColor = output_style.getPropertyValue("background-color");
  }

  function setFontSize(size) {
      let els = document.querySelectorAll(".CodeMirror");
      els = [...els, ...document.querySelectorAll("button")];
      els.push(document.querySelector("#status_bar"));
      els.forEach(el => {
          el.style.fontSize = `${size}px`;
      });
  }

  function setSyntaxHighlighter(lang) {
    const mode = lang === "ar"? "seen-ar" : "seen-en";
    editor.setOption("mode", mode);
  }

  function showRightSide() { document.querySelector("#right_side").style.display = "flex"; }
  export function hideRightSide() { document.querySelector("#right_side").style.display = "none"; }

  function showPreview() { document.querySelector("#preview").style.display = "flex";  }
  export function hidePreview() { document.querySelector("#preview").style.display = "none"; }

  export function resetOutput() { output.replaceChildren() }

  function runInsideIframe(code) { 
    eval_div.replaceChildren()
    const iframe = document.createElement("iframe"); 
    eval_div.appendChild(iframe)
    const iframe_win = iframe.contentWindow || iframe
    const iframe_doc = iframe.contentDocument || iframe.contentWindow.document
    const html = 
    ` <head>
        <script>window.console=window.parent.console</script>
        <script>${code}</script>
      </head>
      <body>
      </body>`
      iframe_doc.open();
      iframe_doc.write(html);
      iframe_doc.close();     
  }

  async function run() {   
      hideRightSide()
      hidePreview()
      resetOutput()
      try {        
          let compiler = await genJS()
              
          runInsideIframe(await compiler.get_code())
          // writeOutput(divider())          
          const END = editorLang === 'ar' ? 'انتهى': 'End'
          writeP('\n')
          writeP(`--- ${END} ---\n` , RUNNING_COLOR)
        } catch (err) {
          console.error(err)
        }    
  }

  async function closeRightSide() {
      hideRightSide()
      targetEditor.setValue("")  
  }

  async function closePreview() {
    hidePreview()
    previewArea.replaceChildren()
  }


  async function js() {
    hidePreview()  
    showRightSide()
    await genJS() ;  
  }

  async function genJS() {

    let content = editor.getValue()
    let compiler = new Compiler()
    
    let target_opts = { ignore_export: true, }
    const main_args = { 
      preview_id: '#preview_area' ,
      معرف_منطقة_العرض : '#preview_area'
    }
    compiler.init(content, main_args , editorLang, target_opts)
    
    await compiler.run()
    document.querySelector("#right_side_label").innerText = editorLang === "ar"? "نص البرنامج" : "Code";
    // let code = compiler.gen_code
    let code = js_beautify(compiler.gen_code, jsBeautifyOptions)
    
    targetEditor.setOption("mode", "javascript");
    targetEditor.setOption("direction", "ltr");
    targetEditor.setOption("lineNumberFormatter", lineNumberFormatter("ltr"))      
    targetEditor.setValue(code)  

    return compiler
  }

  async function clear() { document.querySelector("#output").innerHTML = ''; }

  async function setupListeners() {
    document.querySelector('body').addEventListener('keydown', (e) => handleKeydown(e));
    document.querySelector('body').addEventListener('keyup', (e) => { keydown[e.key] = false } );
    document.querySelector('#theme').addEventListener('change', () => setThemeFromOptions());
    document.querySelector('#run').addEventListener('click', () => run());
    document.querySelector('#srccode').addEventListener('click', () => js());
    document.querySelector('#right_side_close').addEventListener('click', () => closeRightSide());
    document.querySelector('#preview_close').addEventListener('click', () => closePreview());
    document.querySelector('#clear').addEventListener('click', () => clear());  
    editor.on('cursorActivity', (args) => { 
      let {line, ch} = editor.getCursor();
      line += 1;
      ch += 1;
      setCursorPosition(line, ch);
    }); 
  }

  function lineNumberFormatter(dir) {
    if(dir === "rtl") {
      return (n) => toEasternDigits(n)
    } else {
      return (n) => n
    }
  }

  function handleKeydown(e) {
    keydown[e.key] = true   
    let keys = '';
    //console.log(keys)
    Object.entries(keydown).forEach( ([k,v]) => { if(keydown[k]) {keys += k}   })
    switch(keys.toLowerCase()) {
      case '0control' : case 'control0' : run();       break
      case '-control' : case 'control-' : increaseFont();       break
      case '=control' : case 'control=' : decreaseFont();       break
      default: 
    }
  }

  function writeOutput(el) {
    var output = document.querySelector('#output');
    output.appendChild(el);
    output.scrollTop = output.scrollHeight;
  }

  function writeP(text, color) {
    if(text === '') { console.log('\n')}  // FIXME: WORKAROUND println('') will be ignored. insert it here if we receive an empty string 
                                          // however, you need to fix this when we support a print() function

    if(isArabic) {
      // console.warn(text)
      if(text) { text  = toArabicPunctuations(text) }
      if(!isMaghrib) { if(text) { text = toMashriqNumerals(text) }  } 
    }
    const p = document.createElement("p");
    p.textContent = text;
    p.setAttribute("dir", getDir(editorLang));
    p.style.whiteSpace = "pre-wrap";
    if(color) { 
      p.style.color = color;
    }
    writeOutput(p);
  }

  // FIXME: also need to change commas, semicolons ...etc
  function toArabicPunctuations(text) {
      const p = /["'](.*?)["']/gi
      return  text.toString().replace(p, (matched, g1) => {
        if(matched) { 
            return `«${g1}»`
        } else {
          return text
        }
      })
  }

  function toMashriqNumerals(text) {
    function toMashriqNum(n) {
        let v = ""
        let i = 0
        while(i < n.length) {
            const c = n[i]
            switch(c) {
                case "0": v += '٠' ; break
                case "1": v += '١' ; break
                case "2": v += '٢' ; break
                case "3": v += '٣' ; break
                case "4": v += '٤' ; break
                case "5": v += '٥' ; break
                case "6": v += '٦' ; break
                case "7": v += '٧' ; break
                case "8": v += '٨' ; break
                case "9": v += '٩' ; break
                case ".": v += '٫' ; break
                default: panic()
            }
            i += 1
        }
        return v
  }

    const p = /([0123456789]+)(\.)?([0123456789]+)?/gi
    text= text.replace(p, (matched, g1, g2, g3 ) => {
      if(matched) {
        // console.warn(matched, g1,g2,g3)
        let v = `${toMashriqNum(g1)}`
        if(g2) {
          v += ","
          if(g3) {
            v += `${toMashriqNum(g3)}`
          }
        }
        return v
      } else {
        return text
      }
    })
    return text
  }

  function panic(v) { throw new Error(v) }