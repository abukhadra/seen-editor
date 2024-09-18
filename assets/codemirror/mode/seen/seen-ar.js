import {tatweelRegex} from '../../../../src/arabic.js'
import {
  openCurly         , closeCurly    , slash         , 
  backslash         , dash          , westernFloat  ,
  easternFloat      , RESERVED      , notIdPart     ,
  commonStartRules  , KEYWORDS      , 
  ATOMS             , BUILTINS      , id            , 
  meta              , easternDigit  , westernDigit  ,
} from './common.js'

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../../../lib/codemirror"), require("../../../../addon/mode/simple"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror", "../../addon/mode/simple"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

  const escapeLetters = ['س','ر','ج'];
  const easternHexLetters = ['ا','ب','ج','د','ه','و'];  
  const escapeLettersPatterns = escapeLetters.map(c => tatweelRegex(c)).join('');
  const easternHexLetter = `[${easternHexLetters.map(c => tatweelRegex(c)).join('')}]`;
  const westernHexLetter = `[a-fA-F]`;
  const escapeChar = `[${escapeLettersPatterns}›»]`;
  const unicodePrefix = tatweelRegex('م');
  const easternUnicode = `(?:${unicodePrefix}${openCurly}(?:${easternDigit}|${easternHexLetter}){1,6}${closeCurly})`;
  const westernUnicode = `(?:${unicodePrefix}${openCurly}(?:${westernDigit}|${westernHexLetter}){1,6}${closeCurly})`;
  const unicode = `(?:${easternUnicode}|${westernUnicode})`;
  const noCloseQuoteOrSlash = `[^›${slash}]`;

  const wordsToRegex = (WORDS) => RegExp(anyWord(WORDS), 'u' );  
  const anyWord = (WORDS) => {
      let res =[];
      Object.values(WORDS).forEach(v => res.push(tatweelRegex(v.ar)) )      
      return `(?:${res.join('|')})`;
  }

  const startMultilineComment = () => RegExp(`${openCurly}-`, 'u'); 
  const multilineComment = () => RegExp(`.*`,'u');
  const closeMultilineComment = () => RegExp(`.*?-${closeCurly}`, 'u');
  const comment = () => RegExp(`--.*`, 'u');
  const escape = `${slash}(?:${escapeChar}|${unicode})`;
  const char = () => RegExp(`‹(?:${noCloseQuoteOrSlash}|${escape})›`, 'u');
  const startMultilineString = () => RegExp(`b?«««`, 'u');
  const multilineString = () => RegExp(`(?:[^»]|»(?!»»))*`, 'u')
  const endMultilineString = () => RegExp(`»»»`, 'u');  
  const startString = () => RegExp(`b?«`,'u');
  const string = () => RegExp(`(?:[^${slash}»]|${slash}(?:.|$))*`, 'u');
  const endString = () => RegExp(`»`,'u');
  const number = () => RegExp(`(?:${easternFloat})|(?:${westernFloat})`, 'u');
  const variableRegex = () =>  RegExp(`(?!${anyWord(RESERVED)}(?:${notIdPart}|\\s|$))${id}`,'u');
  const keywordRegex = () => wordsToRegex(KEYWORDS);
  const atomRegex = () => wordsToRegex(ATOMS);
  const builtinRegex = () => wordsToRegex(BUILTINS);

CodeMirror.defineSimpleMode("seen-ar",{
  start: [    
    {regex: startMultilineComment(), token: "comment", next: "multiline_comment"},      
    {regex: comment(), token: "comment"},
    {regex: startMultilineString(), token: "string", next: "multiline_string"},
    {regex: startString(), token: "string", next: "string"},
    {regex: char(), token: "string-2"},
    {regex: number(),token: "number"},
    ...commonStartRules,
    {regex: variableRegex(), token: "variable"},
    {regex: keywordRegex(), token: "keyword"},
    {regex: atomRegex(), token: "atom"},
    {regex: builtinRegex(), token: "builtin"},    
  ],
  multiline_comment: [
    {regex: closeMultilineComment(), token: "comment", next: "start"},
    {regex: multilineComment(), token: "comment"}
  ],  
  multiline_string: [
    {regex: endMultilineString(), token: "string", next: "start"},
    {regex: multilineString(), token: "string"}
  ],      
  string:[
    {regex: endString(), token: "string", next: "start"},
    {regex: string(), token: "string"}
  ],
  meta: meta,
});

CodeMirror.defineMIME("text/x-seen-ar-src", "seen-ar");
CodeMirror.defineMIME("text/seen-ar", "seen-ar");
});