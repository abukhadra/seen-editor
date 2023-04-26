
//================
//   OPERATORS
//================
const OPERATORS = [
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
  "&",    "ࢱ",
  "\^", "⊕",
  "\|",
  "&&",   "ࢱࢱ",
  "\|\|",
  "\|>",
  "=",    "\+=",   "\-=",   "\*=",   "×=",
  "/=",   "÷=",   "&=",   "ࢱ=",   "\|=", 
  "\^=",   ">>=",  "<<=",  

// separators and other symbols:
"@",  "\$",   "%",
"⎔",  "~" ,
"\]",   "\{",   "\}",     "\\)",
"\'",   "\"", "»", "«", "‹" , "›"

];


//================
//   KEYWORDS
//================
// order in arabic is significant ( since we can't use \b), longest match should come first ( e.g: ليكن before ل )
const KEYWORDS = {
    let:        { ar: "ليكن",         en: "let" },  
    _for:       { ar: "لكل",          en: "for"},
    _in:        { ar: "في",           en: "in"},
    match:      { ar: "طابق",         en: "match"},
    ret:        { ar: "⏎",            en: "ret"},

    // not keywords but for highlighting purposes:
    res:        { ar: "\u{1EE4D}",    en: "\u{1EE4D}"},
    ok:         { ar: "✓",            en: "✓"},
    err:        { ar: "✗",            en: "✗"}        

  };
  
//================
//   ATOMS
//================
const ATOMS = {
      float:      { ar: "عائم",               en:"float"},
      int:        { ar: "صحيح",               en:"int"},
      str:        { ar: "سلسلة",              en:"str"},
      bool:       { ar: "منطقي",              en:"bool"},
      char:       { ar: "محرف",               en:"char"},
  };
  
//================
//   BUILTINS
//================
const BUILTINS = {
      _true:      { ar: "صواب",               en:"true"},
      _false:     { ar: "خطا",                en:"false"},
      
  };

//================
//   RESERVED
//================
const RESERVED = {
    ...KEYWORDS, 
    ...ATOMS, 
    ...BUILTINS
};

//================
//   Patterns
//================
const idStart = "[\\p{L}_]";
const idPart = "[\\p{L}\\p{N}_]";
const id = `(?:${idStart}${idPart}*)`;
const notIdPart = "[^\\p{L}\\p{N}_]";

const easternDigit = "[٠-٩]";
const easternDecimal = `(?:,${easternDigit}+)`;
const easternFloat = `${easternDigit}+${easternDecimal}?`;

const westernDigit = "[0-9]";
const westernDecimal = `(?:\\.${westernDigit}+)`;
const westernFloat = `${westernDigit}+${westernDecimal}?`;

const backslash  = `\\\\`;
const slash  = `\\/`;
const star = `\\*`;

const openCurly = `\\{`;
const closeCurly = `\\}`;
const openParen = `\\(`;
const closeParen = `\\)`;

const space = `\\s`;

const params = `${openParen}?${space}*${closeParen}?`;

const attrRegex = () => RegExp(`(?:(?:@|⎔)${id})`, "u");
const fnRegex = () => RegExp(`(?:${id}?${space}*${params}${space}*->)`, "u");

//================
//   Common Rules
//================
const commonStartRules = [
  {regex: attrRegex(), token:"meta"},
  {regex: fnRegex(), token:["def", null,"operator",null,"operator",null,"operator","operator"]},  
  {regex: RegExp(`[${OPERATORS.join('')}]+`), token: "operator"},
  {regex: /[\{\[\(]>/, indent: true},
  {regex: /[\}\]\)]/, dedent: true},  
];
const meta = {
  dontIndentStates: ["comment"],
  electricInput: /^\s*\}$/,
  fold: "brace"
};
