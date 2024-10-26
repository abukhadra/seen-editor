export const OPERATORS = [
  "\!",    "\?",    "؟",
  "_",
  "\[",
  "\(",
  "\.",
  "\*",    "×",   "/",   "÷", 
  "\+",    "\-",
  "<",    "<=",  "≤",   ">",    ">=",   "≥", 
  "==",   "\!=",    "≠",
  "<<",   ">>",
  "&",    "ࢱ", "\|و\|",
  "\^", "⊕",
  "\|", "\|ء\|",
  "&&",   "ࢱࢱ", "\|وو\|",
  "\|\|", "\|ءء\|",
  ":>",
  "\|>", 
  "\|\|>",
  "=",    "\+=",   "\-=",   "\*=",   "×=",
  "/=",   "÷=",   "&=",   "ࢱ=",   "\|=", 
  "\^=",   ">>=",  "<<=",  ":+",  "::",

// separators and other symbols:
"@",  "\$",   "%", "٪" , "#",
"⎔",  "~" ,
"\]",   "\{",   "\}",     "\\)",
"\'",   "\"", "»", "«", "‹" , "›"

];


// order in arabic is significant ( since we can't use \b), longest match should come first ( e.g: ليكن before ل )
export const KEYWORDS = {   
    use:      { ar: "احضر",         en: "use"},
    where:      { ar: "حيث",          en: "where"},
    when:       { ar: "عندما",        en: "when"},
    ret:        { ar: "اعد",           en: "return"},
    _let:       { ar: "عرف",          en: "let"},
    _const:     { ar: "ثابت",         en: "const"},
    _var:       { ar: "متغير",        en: "var"},
    fn:         { ar: "دل",           en: "fn"},
    struct:     { ar: "نوع",          en: "type"},
    impl:       { ar: "اضافة",        en: "impl"}, 
    trait:      { ar: "سمة",          en: "trait"},
    // not keywords but for highlighting purposes:
    res:        { ar: "\u{1EE4D}",    en: "\u{1EE4D}"},
    ok:         { ar: "✓",            en: "✓"},
    err:        { ar: "✗",            en: "✗"},        
  };
  
  export const ATOMS = {
      float:      { ar: "عائم",               en:"float"},
      int:        { ar: "صحيح",               en:"int"},
      str:        { ar: "سلسلة",              en:"str"},
      bool:       { ar: "منطقي",              en:"bool"},
      char:       { ar: "محرف",               en:"char"},      
  };
  

  export const BUILTINS = {
      _true:      { ar: "صحيح",               en:"true"},
      _false:     { ar: "غير_صحيح",            en:"false"},    
      void:       { ar: "لا_شيء",        en: "void"},
  };


  export const RESERVED = {
    ...KEYWORDS, 
    ...ATOMS, 
    ...BUILTINS
};


//================
//   Patterns
//================
export const idStart = "[\\p{L}_]";
export const idPart = "[\\p{L}\\p{N}_]";
export const id = `(?:${idStart}${idPart}*)`;
export const notIdPart = "[^\\p{L}\\p{N}_]";

export const easternDigit = "[٠-٩]";
export const easternDecimal = `(?:,${easternDigit}+)`;
export const easternFloat = `${easternDigit}+${easternDecimal}?`;

export const westernDigit = "[0-9]";
export const westernDecimal = `(?:\\.${westernDigit}+)`;
export const westernFloat = `${westernDigit}+${westernDecimal}?`;

export const backslash  = `\\\\`;
export const slash  = `\\/`;
export const dash  = `\\-`;
export const star = `\\*`;

export const openCurly = `\\{`;
export const closeCurly = `\\}`;
export const openParen = `\\(`;
export const closeParen = `\\)`;

export const space = `\\s`;
export const params = `${openParen}?${space}*${closeParen}?`;

export const attrRegex = () => RegExp(`(?:(?:#|#)${id})`, "u");
export const fnRegex = () => RegExp(`(?:~${id}?${space}*${params}${space}*->)`, "u");


export const commonStartRules = [
  {regex: attrRegex(), token:"meta"},
  {regex: fnRegex(), token:["def", null,"operator",null,"operator",null,"operator","operator"]},  
  {regex: RegExp(`[${OPERATORS.join('')}]+`), token: "operator"},
  {regex: /[\{\[\(]>/, indent: true},
  {regex: /[\}\]\)]/, dedent: true},  
];
export const meta = {
  dontIndentStates: ["comment"],
  electricInput: /^\s-\}$/,
  fold: "brace"
};

