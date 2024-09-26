import * as fs from 'fs';

start()

function start() {
    fs.readFile('./dist/src/sedit.html', 'utf8', (err, data) => {
      if (err) { console.error(err); return; }
      data = data.replace(/\\|`|\$/g, '\\$&');
      const fn = `export function SeenEditor(id, parent, opts) { 
                opts.mode = 'editor'
                const code = \`${data}\`
                const iframe = document.createElement('iframe');
                iframe.id = id;
                iframe.sandbox = 'allow-forms allow-scripts allow-same-origin';
                iframe.setAttribute("style","width:100%; height: 100%;");
                // iframe.src = 'data:text/html,'; 
                parent.replaceChildren()
                parent.appendChild(iframe)
                const iframe_win = iframe.contentWindow || iframe;                
                // iframe_win.opts = opts ;
                iframe.srcdoc = \` \$\{code.replace("'%SEEN_EDITOR__OPTS%'", \`\$\{JSON.stringify(opts)}\`)} \`;
                return iframe
              }

              export function SeenCode(id, parent, opts) { 
                opts.mode = 'code'
                const code = \`${data}\`
                const iframe = document.createElement('iframe');
                iframe.id = id;
                iframe.sandbox = 'allow-forms allow-scripts allow-same-origin';
                iframe.setAttribute("style","width:100%; height: 100%;");
                // iframe.src = 'data:text/html,'; 
                parent.replaceChildren()
                parent.appendChild(iframe)
                const iframe_win = iframe.contentWindow || iframe;                
                // iframe_win.opts = opts ;
                iframe.srcdoc = \` \$\{code.replace("'%SEEN_EDITOR__OPTS%'", \`\$\{JSON.stringify(opts)}\`)} \`;
                return iframe
              }                
              `
      writeToJS(fn)
    });
}

function writeToJS(data) {
  fs.writeFile('./dist/sedit.js', data, err => {
  if (err) { console.error(err);  return; }
});
}
