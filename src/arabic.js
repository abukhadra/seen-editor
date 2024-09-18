// src : https://en.wikipedia.org/wiki/Arabic_script_in_Unicode#Contextual_forms
const AR_CONTEXT_CHARS = {
    "الف": { 
                general:    { char: 'ا', code: '\u0627' },     
                isolated:   { char: 'ﺍ', code: '\uFE8D' },     
                end:        { char: 'ﺎ', code: '\uFE8E' }
    },                                           
    "باء": { 
                general:    { char: 'ب', code: '\u0628' },
                isolated:   { char: 'ﺏ', code: '\uFE8F' },
                end:        { char: 'ﺐ', code: '\uFE90' },
                middle:     { char: 'ﺒ', code: '\uFE92' },      
                beginning:  { char: 'ﺑ', code: '\uFE91' }
    },
    "تاء": { 
                general:    { char: 'ت', code: '\u062A' },     
                isolated:   { char: 'ﺕ', code: '\uFE95' },
                end:        { char: 'ﺖ', code: '\uFE96' },
                middle:     { char: 'ﺘ', code: '\uFE98' },
                beginning:  { char: 'ﺗ', code: '\uFE97' }
    },
    "ثاء": { 
                general:    { char: 'ث', code: '\u062B' },     
                isolated:   { char: 'ﺙ', code: '\uFE99' },      
                end:        { char: 'ﺚ', code: '\uFE9A' },      
                middle:     { char: 'ﺜ', code: '\uFE9C' },      
                beginning:  { char: 'ﺛ', code: '\uFE9B' }
    },
    "جيم": { 
                general:    { char: 'ج', code: '\u062C' },
                isolated:   { char: 'ﺝ', code: '\uFE9D' },
                end:        { char: 'ﺞ', code: '\uFE9E' },
                middle:     { char: 'ﺠ', code: '\uFEA0' },
                beginning:  { char: 'ﺟ', code: '\uFE9F' }
    },
    "حاء": { 
                general:    { char: 'ح', code: '\u062D' },
                isolated:   { char: 'ﺡ', code: '\uFEA1' },
                end:        { char: 'ﺢ', code: '\uFEA2' },
                middle:     { char: 'ﺤ', code: '\uFEA4' },
                beginning:  { char: 'ﺣ', code: '\uFEA3' }
    },
    "خاء": { 
                general:    { char: 'خ', code: '\u062E' },
                isolated:   { char: 'ﺥ', code: '\uFEA5' },
                end:        { char: 'ﺦ', code: '\uFEA6' },
                middle:     { char: 'ﺨ', code: '\uFEA8' },
                beginning:  { char: 'ﺧ', code: '\uFEA7' }
    },
    "دال": { 
                general:    { char: 'د', code: '\u062F' },
                isolated:   { char: 'ﺩ', code: '\uFEA9' },
                end:        { char: 'ﺪ', code: '\uFEAA' }
    },
    "ذال": { 
                general:    { char: 'ذ', code: '\u0630' },
                isolated:   { char: 'ﺫ', code: '\uFEAB' },
                end:        { char: 'ﺬ', code: '\uFEAC' }       
    },
    "راء": { 
                general:    { char: 'ر', code: '\u0631' },
                isolated:   { char: 'ﺭ', code: '\uFEAD' },
                end:        { char: 'ﺮ', code: '\uFEAE' }
    },
    "زين": { 
                general:    { char: 'ز', code: '\u0632' },
                isolated:   { char: 'ﺯ', code: '\uFEAF' },
                end:        { char: 'ﺰ', code: '\uFEB0' }    
    }, 
    "سين": { 
                general:    { char: 'س', code: '\u0633' },
                isolated:   { char: 'ﺱ', code: '\uFEB1' },
                end:        { char: 'ﺲ', code: '\uFEB2' },
                middle:     { char: 'ﺴ', code: '\uFEB4' },
                beginning:  { char: 'ﺳ', code: '\uFEB3' }    
    },
    "شين": { 
                general:    { char: 'ش', code: '\u0634' },
                isolated:   { char: 'ﺵ', code: '\uFEB5' },
                end:        { char: 'ﺶ', code: '\uFEB6' },
                middle:     { char: 'ﺸ', code: '\uFEB8' },
                beginning:  { char: 'ﺷ', code: '\uFEB7' }
    },
    "صاد": { 
                general:    { char: 'ص', code: '\u0635' },
                isolated:   { char: 'ﺹ', code: '\uFEB9' },
                end:        { char: 'ﺺ', code: '\uFEBA' },
                middle:     { char: 'ﺼ', code: '\uFEBC' },
                beginning:  { char: 'ﺻ', code: '\uFEBB' }
    },
    "ضاض": { 
                general:    { char: 'ض', code: '\u0636' },
                isolated:   { char: 'ﺽ', code: '\uFEBD' },
                end:        { char: 'ﺾ', code: '\uFEBE' },
                middle:     { char: 'ﻀ', code: '\uFEC0' },
                beginning:  { char: 'ﺿ', code: '\uFEBF' }     
    },
    "طاء": { 
                general:    { char: 'ط', code: '\u0637' },
                isolated:   { char: 'ﻁ', code: '\uFEC1' },
                end:        { char: 'ﻂ', code: '\uFEC2' },
                middle:     { char: 'ﻄ', code: '\uFEC4' },
                beginning:  { char: 'ﻃ', code: '\uFEC3' }   
    },       
    "ظاء": {
                general:    { char: 'ظ', code: '\u0638' },
                isolated:   { char: 'ﻅ', code: '\uFEC5' },
                end:        { char: 'ﻆ', code: '\uFEC6' },
                middle:     { char: 'ﻈ', code: '\uFEC8' },
                beginning:  { char: 'ﻇ', code: '\uFEC7' }      
    },
    "عين": { 
                general:    { char: 'ع', code: '\u0639' },
                isolated:   { char: 'ﻉ', code: '\uFEC9' },
                end:        { char: 'ﻊ', code: '\uFECA' },
                middle:     { char: 'ﻌ', code: '\uFECC' },
                beginning:  { char: 'ﻋ', code: '\uFECB' }      
    },
    "غين": { 
                general:    { char: 'غ', code: '\u063A' },
                isolated:   { char: 'ﻍ', code: '\uFECD' },
                end:        { char: 'ﻎ', code: '\uFECE' },
                middle:     { char: 'ﻐ', code: '\uFED0' },
                beginning:  { char: 'ﻏ', code: '\uFECF' }      
    },
    "فاء": {
                general:    { char: 'ف', code: '\u0641' },
                isolated:   { char: 'ﻑ', code: '\uFED1' },
                end:        { char: 'ﻒ', code: '\uFED2' },
                middle:     { char: 'ﻔ', code: '\uFED4' },
                beginning:  { char: 'ﻓ', code: '\uFED3' }      
     },
    "قاف": { 
                general:    { char: 'ق', code: '\u0642' },
                isolated:   { char: 'ﻕ', code: '\uFED5' },
                end:        { char: 'ﻖ', code: '\uFED6' },
                middle:     { char: 'ﻘ', code: '\uFED8' },
                beginning:  { char: 'ﻗ', code: '\uFED7' }     
    },
    "كاف": { 
                general:    { char: 'ك', code: '\u0643' },
                isolated:   { char: 'ﻙ', code: '\uFED9' },
                end:        { char: 'ﻚ', code: '\uFEDA' },
                middle:     { char: 'ﻜ', code: '\uFEDC' },
                beginning:  { char: 'ﻛ', code: '\uFEDB' }
    },
    "لام": { 
                general:    { char: 'ل', code: '\u0644' },
                isolated:   { char: 'ﻝ', code: '\uFEDD' },
                end:        { char: 'ﻞ', code: '\uFEDE' },
                middle:     { char: 'ﻠ', code: '\uFEE0' },
                beginning:  { char: 'ﻟ', code: '\uFEDF' }    
    },
    "ميم": { 
                general:    { char: 'م', code: '\u0645' },
                isolated:   { char: 'ﻡ', code: '\uFEE1' },
                end:        { char: 'ﻢ', code: '\uFEE2' },
                middle:     { char: 'ﻤ', code: '\uFEE4' },
                beginning:  { char: 'ﻣ', code: '\uFEE3' }     
    },
    "نون": { 
                general:    { char: 'ن', code: '\u0646' },
                isolated:   { char: 'ﻥ', code: '\uFEE5' },
                end:        { char: 'ﻦ', code: '\uFEE6' },
                middle:     { char: 'ﻨ', code: '\uFEE8' },
                beginning:  { char: 'ﻧ', code: '\uFEE7' }     
    },
    "هاء": { 
                general:    { char: 'ه', code: '\u0647' },
                isolated:   { char: 'ﻩ', code: '\uFEE9' },
                end:        { char: 'ﻪ', code: '\uFEEA' },
                middle:     { char: 'ﻬ', code: '\uFEEC' },
                beginning:  { char: 'ﻫ', code: '\uFEEB' }       
    },
    "واو": { 
                general:    { char: 'و', code: '\u0648' },
                isolated:   { char: 'ﻭ', code: '\uFEED' },
                end:        { char: 'ﻮ', code: '\uFEEE' }      
    },
    "ياء": { 
                general:    { char: 'ي', code: '\u064A' },
                isolated:   { char: 'ﻱ', code: '\uFEF1' },
                end:        { char: 'ﻲ', code: '\uFEF2' },
                middle:     { char: 'ﻴ', code: '\uFEF4' },
                beginning:  { char: 'ﻳ', code: '\uFEF3' }     
    },
    "الف_مد": { 
                general:    { char: 'آ', code: '\u0622' },
                isolated:   { char: 'ﺁ', code: '\uFE81' },
                end:        { char: 'ﺂ', code: '\uFE82' }
    },
    "تاء_مربوطة": { 
                general:    { char: 'ة', code: '\u0629' },
                isolated:   { char: 'ﺓ', code: '\uFE93' },
                end:        { char: 'ﺔ', code: '\uFE94' }    
    },
    "الف_مقصورة": { 
                general:    { char: 'ى', code: '\u0649' },
                isolated:   { char: 'ﻯ', code: '\uFEEF' },
                end:        { char: 'ﻰ', code: '\uFEF0' }    
    },
    // Arabic Presentation Forms-B
    // https://en.wikipedia.org/wiki/Arabic_Presentation_Forms-B 
    "همزة_ياء": {
                general:    { char: "ئ", code: '\u0626' },
                isolated:   { char: "ﺉ", code: '\uFE89' },
        	    end:        { char: "ﺊ", code: '\uFE8A' },
                middle:     { char: "ﺌ", code: '\uFE8C'},
            	beginning:  { char: "ﺋ", code: '\uFE8B' },            
    }
};


const EXTENDABLE_CHARS = (() => {
    let chars = [];
    Object.values(AR_CONTEXT_CHARS).forEach( v => {
        if(v.middle) {
            chars.push(v.general.code);
            chars.push(v.middle.code);
            chars.push(v.beginning.code);
        }
    });
    return chars;
})();
  

function tatweelRegex(id) {
    let res = []
    id.split('').forEach(c => {
        if(EXTENDABLE_CHARS.includes(c)){
            res.push(`${c}ـ*`);
        } else if( c === 'ـ'){
            //skip
        } else {
            res.push(c);
        }
    })
    return res.join('');
}

function toEasternDigits(n) {
    let chars = ("" + n).split('')
    let ar = chars.map(d => {
    switch(d) {
      case '0' : return '٠'; 
      case '1' : return '١'; 
      case '2' : return '٢'; 
      case '3' : return '٣'; 
      case '4' : return '٤'; 
      case '5' : return '٥'; 
      case '6' : return '٦'; 
      case '7' : return '٧'; 
      case '8' : return '٨'; 
      case '9' : return '٩'; 
    }
    })
    return ar.join('')
  }

  export {
    AR_CONTEXT_CHARS,
    EXTENDABLE_CHARS,
    tatweelRegex,
    toEasternDigits,  
  }