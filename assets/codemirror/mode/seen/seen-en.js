import {
  openCurly, closeCurly, backslash, dash, westernFloat,
  commonStartRules, KEYWORDS, ATOMS, BUILTINS, id, meta, 
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

const escapeChar = `[nrt'"]`;
const unicode = `u${openCurly}[\\da-fA-F]{1,6}${closeCurly}`;
const noQuoteOrBslash = `[^'${backslash}]`;
const noDoubleQuoteOrBslash = `[^"${backslash}]`;

function wordsToRegex(WORDS) {
  let res =[];
  Object.values(WORDS).forEach(v => res.push(v.en));
  return RegExp(`\\b(?:${res.join('|')})\\b`);
}

const startMultilineComment = () => RegExp(`${openCurly}${dash}`); 
const multilineComment = () => RegExp(`.*`);
const closeMultilineComment = () => RegExp(`.*?${dash}${closeCurly}`);
const comment = () => RegExp(`${dash}${dash}.*`);
const escape = `${backslash}(?:${escapeChar}|${unicode})`;
const char = () => RegExp(`'(?:${noQuoteOrBslash}|${escape})'`);
const startMultilineString = () => RegExp(`b?"""`);
const multilineString = () => RegExp(`(?:[^"]|"(?!""))*`)
const endMultilineString = () => RegExp(`"""`);
const startString = () => RegExp(`b?'`);
const string = () => RegExp(`(?:${noQuoteOrBslash}|${backslash}(?:.|$))*`);
const endString = () => RegExp(`'`);
const number = () => RegExp(`(?:${westernFloat})`);
const variableRegex = () =>  RegExp(`${id}`,"u");
const keywordRegex = () => wordsToRegex(KEYWORDS)
const atomRegex = () => wordsToRegex(ATOMS)
const builtinRegex = () => wordsToRegex(BUILTINS)

CodeMirror.defineSimpleMode("seen-en",{
  start: [
    {regex: startMultilineComment(), token: "comment", next: "multiline_comment"},  
    {regex: comment(), token: "comment"},
    {regex: startMultilineString(), token: "string", next: "multiline_string"},
    {regex: startString(), token: "string", next: "string"},
    {regex: char(), token: "string-2"},
    {regex: number(),token: "number"},
    ...commonStartRules,
    {regex: keywordRegex(), token: "keyword"},
    {regex: atomRegex(), token: "atom"},
    {regex: builtinRegex(), token: "builtin"},
    {regex: variableRegex(), token: "variable"},  
  ],
  multiline_comment: [
    {regex: closeMultilineComment(), token: "comment", next: "start"},
    {regex: multilineComment(), token: "comment"}
  ],  
  multiline_string: [
    {regex: endMultilineString(), token: "string", next: "start"},
    {regex: multilineString(), token: "string"}
  ],  
  string: [
    {regex: endString(), token: "string", next: "start"},
    {regex: string(), token: "string"}
  ],
  meta: meta,  
});

CodeMirror.defineMIME("text/x-seen-en-src", "seen-en");
CodeMirror.defineMIME("text/seen-en", "seen-en");
});