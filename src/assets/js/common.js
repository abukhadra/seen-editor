//================
//   Constants
//================
const THEME_DIR = "assets/codemirror/theme";

const THEME_CSS = [
    "colorforth",
    "eclipse",
    "idea",
    "monokai",
    "night",
    "solarized",
    "the-matrix"
];

//================
//  EXPORT
//   setLabels()
//================
export function setLabels(LABELS, langId) {
    for(let [k, v] of Object.entries(LABELS)) {
        let el = document.querySelector(`#${k}`);
        if(el) { el.textContent = v[langId] };
        if(v.icon) { el.appendChild(v.icon())}
    }
} 


//================
//  EXPORT
//   appendThemesToHead()
//================
export function appendThemesToHead() {
    let links = [];
    THEME_CSS.forEach(name => links.push(`<link rel="stylesheet" href="${THEME_DIR}/${name}.css">`))
    document.head.innerHTML += links.join('\n');
}