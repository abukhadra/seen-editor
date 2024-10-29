class Err {
  msg;
  start_loc;
  end_loc;
  constructor(msg, start_loc, end_loc) {
    this.msg = msg;
    this.start_loc = start_loc;
    this.end_loc = end_loc;
  }
}
const SUPPORTED_GEN = [
  "js",
  "node",
  "react-native",
  "html",
  "css"
];
const AR_KEYWORD = {
  "???": "as",
  "صحيح": "true",
  "غير_صحيح": "false",
  "عندما": "when",
  "كرر": "for",
  "احضر": "use",
  "عرف": "let",
  "ثابت": "const",
  "دل": "fn",
  "نوع": "type",
  "تركيبة": "struct",
  "تعداد": "enum",
  "مستعار": "alias",
  "سمة": "trait",
  "اعد": "return",
  "نفذ": "do",
  "لا_شيء": "void"
};
const EN_KEYWORD = {
  "as": "???",
  "true": "صحيح",
  "false": "غير_صحيح",
  "when": "عندما",
  "for": "كرر",
  "use": "احضر",
  "let": "عرف",
  "const": "ثابت",
  "fn": "دل",
  "type": "نوع",
  "struct": "تركيبة",
  "enum": "تعداد",
  "alias": "مستعار",
  "trait": "سمة",
  "return": "اعد",
  "do": "نفذ",
  "void": "لا_شيء"
};
const MASHRIQ_DIGIT = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
const MAGHRIB_DIGIT$2 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const TATWEEL = "ـ";
const ANY_LETTER = regexp("\\p{L}");
const ANY_NUM = regexp("\\p{N}");
function is_none(x) {
  return x == null;
}
function is_list$2(x) {
  return x instanceof Array;
}
function contains$2(list, el) {
  return list.includes(el);
}
function replace(array, i, v2) {
  array[i] = v2;
}
function is_empty(list) {
  return Array.isArray(list) && list.length === 0;
}
function to_str$2(obj, indent) {
  let objects = [];
  const eliminateCircular = (k, v2) => {
    if (v2 && typeof v2 === "object") {
      if (objects.includes(v2)) {
        return "[CIRCULAR]";
      } else {
        objects.push(v2);
      }
    }
    return v2;
  };
  {
    return JSON.stringify(obj, eliminateCircular);
  }
}
function regexp(expr) {
  return new RegExp(expr, "u");
}
function pprint(obj, indent) {
  if (obj == null) {
    console.log("undefined");
  } else {
    {
      console.log(JSON.stringify(obj));
    }
  }
}
function panic$2(v2) {
  throw new Error(v2);
}
function clone(obj) {
  return { ...obj };
}
function to_lowercase(str) {
  return str.toLowerCase();
}
class Loc {
  line;
  column;
  constructor(line, column) {
    this.line = line;
    this.column = column;
    return this;
  }
}
class Token {
  v;
  loc;
  constructor(v2, loc) {
    this.v = v2;
    this.loc = loc;
    return this;
  }
}
class Lexer {
  lang;
  code;
  start_loc;
  end_loc;
  tokens;
  errs;
  current_index;
  current;
  lookbehind;
  ignore_cmts_ws;
  init(lang, code, ignore_cmts_ws) {
    this.lang = lang;
    this.code = code;
    this.start_loc = new Loc(1, 1);
    this.end_loc = new Loc(1, 1);
    this.tokens = [];
    this.errs = [];
    this.current_index = -1;
    this.current = null;
    this.lookbehind = null;
    this.ignore_cmts_ws = ignore_cmts_ws;
  }
  run() {
    if (this.lang === "ar") {
      this.ar();
    } else if (this.lang === "en") {
      this.en();
    }
    this.start_loc = clone(this.end_loc);
    this.add_token("$eof");
  }
  add_token(v2) {
    const tk = new Token(v2, clone(this.start_loc));
    this.tokens.push(tk);
  }
  next() {
    this.lookbehind = this.current;
    this.current_index += 1;
    const c = this.code[this.current_index];
    this.current = c;
    if (c === "\n") {
      this.end_loc.line += 1;
      this.end_loc.column = 1;
    } else {
      this.end_loc.column += 1;
    }
    return this.current;
  }
  lookahead() {
    return this.code[this.current_index + 1];
  }
  skip(count) {
    while (count > 0) {
      this.next();
      count -= 1;
    }
  }
  insert_err(msg) {
    const err = new Err(msg, clone(this.start_loc), clone(this.end_loc));
    this.errs.push(err);
  }
  last_token() {
    return this.tokens[this.tokens.length - 1];
  }
  skip_invalid_num_or_id() {
    while (this.expect_letter() || this.expect_num() || this.expect_underscore()) {
      this.skip(1);
    }
  }
  expect_tatweel() {
    return this.lookahead() === TATWEEL;
  }
  expect_nl_behind() {
    return this.lookbehind === "\n";
  }
  expect_none_behind() {
    return is_none(this.lookbehind);
  }
  expect_none_ahead() {
    return is_none(this.lookahead());
  }
  expect_ws_behind() {
    return this.lookbehind === "\n" || this.lookbehind === " " || this.lookbehind === "\r" || this.lookbehind === "	";
  }
  expect_space_ahead() {
    return this.lookahead() === " " || this.lookahead() === "	";
  }
  expect_ws_ahead() {
    return this.lookahead() === "\n" || this.lookahead() === " " || this.lookahead() === "\r" || this.lookahead() === "	";
  }
  expect_nl_ahead() {
    return this.lookahead() === "\n";
  }
  expect_separator_behind() {
    return this.lookbehind === "," || this.lookbehind === ";" || this.lookbehind === ";;" || this.lookbehind === ":" || this.lookbehind === "(" || this.lookbehind === "[" || this.lookbehind === "{" || this.lookbehind === "<";
  }
  expect_separator_ahead() {
    return this.lookahead() === "," || this.lookahead() === ";" || this.lookahead() === ";;" || this.lookahead() === ":" || this.lookahead() === ")" || this.lookahead() === "]" || this.lookahead() === "}" || this.lookahead() === ">";
  }
  expect_open_bracket() {
    return this.lookahead() === "[";
  }
  expect_open_paren() {
    return this.lookahead() === "(";
  }
  expect_letter() {
    if (this.lookahead()) {
      return this.lookahead().match(ANY_LETTER);
    }
  }
  expect_num() {
    return this.lookahead().match(ANY_NUM);
  }
  expect_underscore() {
    return this.lookahead() === "_";
  }
  expect_eof() {
    return is_none(this.lookahead());
  }
  expect_eol() {
    return this.lookahead() === "\n" || this.lookahead() === "\r" || this.expect_eof();
  }
  multi_comment() {
    if ("-" === this.lookahead()) {
      let v2 = "";
      const levels = [];
      while (!this.expect_eof()) {
        if ("{" === this.current && "-" === this.lookahead()) {
          v2 += this.next() + this.next();
          levels.push(clone(this.end_loc));
        } else if ("-" === this.current && "}" === this.lookahead()) {
          if (levels.length > 1) {
            v2 += this.next() + this.next();
            levels.pop();
          } else {
            v2 += this.next();
            levels.pop();
            break;
          }
        } else {
          v2 += this.next();
        }
      }
      const loc = levels.pop();
      if (loc) {
        this.start_loc = clone(loc);
        this.insert_err("unclosed comment");
      }
      if (!this.ignore_cmts_ws) {
        this.add_token(["--", v2]);
      }
      return true;
    }
  }
  ar_escape_char() {
    let sym = this.current;
    if ("٪" === sym) {
      let c = this.next();
      switch (c) {
        case "(":
          c = this.next();
          switch (c) {
            case "س":
              c = "\n";
              break;
            case "ر":
              c = "\r";
              break;
            case "ج":
              c = "	";
              break;
            case "‹":
              c = "‹";
              break;
            case "›":
              c = "›";
              break;
            case "«":
              c = "«";
              break;
            case "»":
              c = "»";
              break;
          }
          if (this.next() !== ")") {
            this.insert_err("invalid_escape_character: " + c);
          }
          break;
        case "٪":
          c = "٪";
          break;
        case "{":
          c = "${";
          break;
        default: {
          this.insert_err("invalid escape character: " + c);
        }
      }
      return c;
    } else {
      return this.current;
    }
  }
  en_escape_char() {
    const sym = this.current;
    if ("%" === sym) {
      let c = this.next();
      switch (c) {
        case "n":
          c = "\n";
          break;
        case "r":
          c = "\r";
          break;
        case "t":
          c = "	";
          break;
        case "'":
          c = "'";
          break;
        case '"':
          c = '"';
          break;
        case "%":
          c = "%";
          break;
        case "{":
          c = "${";
          break;
        default:
          {
            this.insert_err("invalid escape character: " + c);
          }
          break;
      }
      return c;
    } else {
      return this.current;
    }
  }
  enclosed_val(sym) {
    let v2 = "";
    while (!this.expect_eof()) {
      this.next();
      if (sym === this.current) {
        break;
      }
      if (this.expect_eol()) {
        this.insert_err("unclosed literal, expecting: " + sym);
        break;
      }
      if (this.lang === "ar") {
        v2 += this.ar_escape_char();
      } else {
        v2 += this.en_escape_char();
      }
    }
    return v2;
  }
  ar_str() {
    if ("«" === this.lookahead()) {
      this.ar_multi_str();
    } else {
      this.add_token(["str", this.enclosed_val("»")]);
    }
  }
  en_str() {
    if ('"' === this.lookahead()) {
      this.en_multi_str();
    } else {
      this.add_token(["str", this.enclosed_val("'")]);
    }
  }
  multi_str(sym) {
    let c = "";
    let v2 = "";
    while (!this.expect_eof()) {
      this.next();
      if (this.expect_eof()) {
        this.insert_err("unclosed multiline String literal, expecting " + sym);
        break;
      }
      if (sym === this.current && sym === this.lookahead()) {
        this.skip(1);
        if (this.lookahead() === sym) {
          this.skip(1);
          this.add_token(["str", v2]);
          break;
        } else {
          c += sym + sym;
        }
      } else {
        if (this.lang === "ar") {
          v2 += this.ar_escape_char();
        } else {
          v2 += this.en_escape_char();
        }
        v2 += c;
      }
    }
  }
  ar_multi_str(sym) {
    this.skip(1);
    if ("«" === this.lookahead()) {
      this.skip(1);
      this.multi_str("»");
    } else {
      this.add_token(["str", ""]);
    }
  }
  en_multi_str(sym) {
    this.skip(1);
    if ('"' === this.lookahead()) {
      this.skip(1);
      this.multi_str('"');
    } else {
      this.add_token(["str", ""]);
    }
  }
  equal() {
    const sym = [];
    while ("=" === this.lookahead()) {
      sym.push(this.next());
    }
    if (sym.length === 0) {
      this.add_token("=");
    } else if (sym.length === 1) {
      this.add_token("==");
    } else if (sym.length > 1) {
      if (!this.ignore_cmts_ws) {
        this.add_token(["===", sym.length + 1]);
      }
    } else {
      return false;
    }
    return true;
  }
  thick_arrow() {
    if (">" === this.lookahead()) {
      this.next();
      this.add_token("=>");
      return true;
    }
  }
  add_asgmt() {
    if ("=" === this.lookahead()) {
      this.next();
      this.add_token("+=");
      return true;
    }
  }
  add() {
    this.add_token("+");
    return true;
  }
  sub_asgmt() {
    if ("=" === this.lookahead()) {
      this.next();
      this.add_token("-=");
      return true;
    }
  }
  thin_arrow() {
    if (">" === this.lookahead()) {
      this.next();
      this.add_token("->");
      return true;
    }
  }
  dash() {
    const sym = [];
    while ("-" === this.lookahead()) {
      sym.push(this.next());
    }
    if (sym.length === 0) {
      this.add_token("-");
    } else if (sym.length > 1) {
      if (!this.ignore_cmts_ws) {
        this.add_token(["---", sym.length + 1]);
      }
    } else {
      return false;
    }
    return true;
  }
  tilde() {
    if ("~" === this.lookahead()) {
      this.next();
      this.add_token("~");
      return true;
    }
  }
  mul_asgmt() {
    if ("=" === this.lookahead()) {
      this.next();
      this.add_token("*=");
      return true;
    }
  }
  mul() {
    this.add_token("*");
    return true;
  }
  asterisk() {
    let sym = "*";
    while ("*" === this.lookahead()) {
      sym += this.next();
    }
    if (sym.length === 1) {
      this.mul();
    } else {
      return false;
    }
    return true;
  }
  ar_div_asgmt() {
    if ("=" === this.lookahead()) {
      this.next();
      this.add_token("\\=");
      return true;
    }
  }
  div_asgmt() {
    if ("=" === this.lookahead()) {
      this.next();
      this.add_token("/=");
      return true;
    }
  }
  comment() {
    if ("-" === this.lookahead()) {
      let v2 = "";
      while (!this.expect_eof()) {
        if (this.expect_eol()) {
          break;
        } else {
          v2 += this.next();
        }
      }
      if (!this.ignore_cmts_ws) {
        this.add_token(["--", v2]);
      }
      return true;
    }
  }
  ar_div() {
    this.add_token("\\");
    return true;
  }
  div() {
    this.add_token("/");
    return true;
  }
  ne() {
    if ("=" === this.lookahead()) {
      this.next();
      this.add_token("!=");
      return true;
    }
  }
  exclamation() {
    this.add_token("!");
    return true;
  }
  ge() {
    if ("=" === this.lookahead()) {
      this.next();
      this.add_token(">=");
      return true;
    }
  }
  gt() {
    this.add_token(">");
    return true;
  }
  le() {
    if ("=" === this.lookahead()) {
      this.next();
      this.add_token("<=");
      return true;
    }
  }
  lt() {
    this.add_token("<");
    return true;
  }
  and() {
    if (this.lookahead() === "&") {
      this.skip(1);
      this.add_token("&&");
      return true;
    } else {
      this.add_token("&");
      return true;
    }
  }
  or_listpipe() {
    if (this.lookahead() === "|") {
      this.skip(1);
      if (this.lookahead() === ">") {
        this.skip(1);
        this.add_token("||>");
        return true;
      }
      this.add_token("||");
      return true;
    }
  }
  pipe() {
    if (this.lookahead() === ">") {
      this.skip(1);
      this.add_token("|>");
      return true;
    }
  }
  bar() {
    this.add_token("|");
    return true;
  }
  mashriq_float() {
    if (contains$2(MASHRIQ_DIGIT, this.lookahead())) {
      v = this.current + this.mashriq_fract();
      this.add_token(["float", v]);
    } else {
      this.insert_err("ill-formed floating point number");
    }
  }
  maghrib_float() {
    if (contains$2(MAGHRIB_DIGIT$2, this.lookahead())) {
      v = this.current + this.maghrib_fract();
      this.add_token(["float", v]);
      return true;
    }
  }
  ddot() {
    if ("." === this.lookahead()) {
      this.skip(1);
      this.add_token("..");
      return true;
    }
  }
  dot() {
    this.add_token(".");
    return true;
  }
  deconstruct() {
    if (this.lookahead() === ">") {
      this.skip(1);
      this.add_token(":>");
      return true;
    }
  }
  decl() {
    if (this.lookahead() === "=") {
      this.skip(1);
      this.add_token(":=");
      return true;
    }
  }
  dcolon() {
    if (this.lookahead() === ":") {
      this.skip(1);
      if (this.lookahead() === "=") {
        this.skip(1);
        this.add_token("::=");
      } else {
        this.add_token("::");
      }
      return true;
    }
  }
  colon() {
    this.add_token(":");
    return true;
  }
  ar_semicolon() {
    this.add_token(";");
    return true;
  }
  en_semicolon() {
    this.add_token(";");
    return true;
  }
  mashriq_num() {
    let v2 = this.current;
    while (true) {
      if (contains$2(MASHRIQ_DIGIT, this.lookahead())) {
        v2 += this.next();
      } else if (contains$2(MAGHRIB_DIGIT$2, this.lookahead())) {
        this.insert_err("you can either use Mashriq digits (٠ - ٩) or Maghrib digits (0 - 9) but not a mix: " + this.current);
        this.skip_invalid_num_or_id();
      } else if ("," === this.lookahead()) {
        v2 += this.next();
        v2 += this.maghrib_fract();
      } else {
        break;
      }
      if (this.expect_eof()) {
        break;
      }
    }
    if (this.is_float) {
      this.add_token(["float", v2]);
    } else {
      this.add_token(["int", v2]);
    }
  }
  maghrib_num() {
    let v2 = this.current;
    let is_float = false;
    while (true) {
      if (contains$2(MAGHRIB_DIGIT$2, this.lookahead())) {
        v2 += this.next();
      } else if (contains$2(MASHRIQ_DIGIT, this.lookahead())) {
        this.insert_err("you can either use Eastern Arabic digits (٠ - ٩) or Western (0 - 9) but not a mix: " + this.current);
        this.skip_invalid_num_or_id();
      } else if ("." === this.lookahead()) {
        v2 += this.next();
        is_float = true;
        v2 += this.maghrib_fract();
      } else {
        break;
      }
      if (this.expect_eof()) {
        break;
      }
    }
    if (is_float) {
      this.add_token(["float", v2]);
    } else {
      this.add_token(["int", v2]);
    }
  }
  ar_id() {
    let v2 = this.current;
    while (!this.expect_eof()) {
      if (this.expect_letter() || this.expect_num() || this.expect_underscore()) {
        if (this.expect_tatweel()) {
          this.skip(1);
        } else {
          v2 += this.next();
        }
      } else {
        break;
      }
    }
    if (AR_KEYWORD[v2]) {
      this.add_token(["key", AR_KEYWORD[v2]]);
    } else {
      this.add_token(["id", v2]);
    }
  }
  en_id() {
    let v2 = this.current;
    while (!this.expect_eof()) {
      if (this.expect_letter() || this.expect_num() || this.expect_underscore()) {
        v2 += this.next();
      } else {
        break;
      }
    }
    if (EN_KEYWORD[v2]) {
      this.add_token(["key", v2]);
    } else {
      this.add_token(["id", v2]);
    }
  }
  mashriq_fract() {
    let v2 = "";
    while (!this.expect_eof()) {
      if (contains$2(MASHRIQ_DIGIT, this.lookahead())) {
        v2 += this.next();
      } else {
        break;
      }
    }
    return v2;
  }
  maghrib_float() {
    if (contains$2(MAGHRIB_DIGIT$2, this.lookahead())) {
      const v2 = this.current + this.maghrib_fract();
      this.add_token(["float", v2]);
      return true;
    }
  }
  maghrib_fract() {
    let v2 = "";
    while (!this.expect_eof()) {
      if (contains$2(MAGHRIB_DIGIT$2, this.lookahead())) {
        v2 += this.next();
      } else {
        break;
      }
    }
    return v2;
  }
  new_line() {
    let count = 1;
    while (true) {
      if (this.lookahead() === "\n") {
        this.skip(1);
        count += 1;
      } else {
        if (this.last_token() && this.last_token().v !== "\n") {
          this.add_token(["\n", count]);
        }
        break;
      }
    }
  }
  ar() {
    while (!this.expect_eof()) {
      this.start_loc = clone(this.end_loc);
      const c = this.next();
      switch (c) {
        case "؟":
          this.add_token("?");
          break;
        case "٪":
          this.add_token("%");
          break;
        case ",":
          this.mashriq_float();
          break;
        case ".":
          this.maghrib_float() || this.ddot() || this.dot();
          break;
        case "،":
          this.add_token(",");
          break;
        case "×":
          this.mul_asgmt() || this.mul();
          break;
        case "*":
          this.mul_asgmt() || this.asterisk();
          break;
        case "÷":
        case "/":
          this.div_asgmt() || this.div();
          break;
        case "\\":
          this.ar_div_asgmt() || this.ar_div();
          break;
        case "؛":
          this.ar_semicolon();
          break;
        case "«":
          this.ar_str();
          break;
        default: {
          if (contains$2(MASHRIQ_DIGIT, c)) {
            this.mashriq_num();
          } else if (contains$2(MAGHRIB_DIGIT$2, c)) {
            this.maghrib_num();
          } else {
            if (c === "_" || c.match(ANY_LETTER)) {
              this.ar_id();
            } else {
              this.common(c);
            }
          }
        }
      }
    }
  }
  en() {
    while (!this.expect_eof()) {
      this.start_loc = clone(this.end_loc);
      const c = this.next();
      switch (c) {
        case "?":
          this.add_token("?");
          break;
        case "%":
          this.add_token("%");
          break;
        case ".":
          this.maghrib_float() || this.ddot() || this.dot();
          break;
        case ",":
          this.add_token(",");
          break;
        case "*":
          this.mul_asgmt() || this.asterisk();
          break;
        case "/":
          this.div_asgmt() || this.div();
          break;
        case ";":
          this.en_semicolon();
          break;
        case "'":
          this.en_str();
          break;
        default: {
          if (contains$2(MAGHRIB_DIGIT$2, c)) {
            this.maghrib_num();
          } else if (contains$2(MASHRIQ_DIGIT, c)) {
            this.insert_err("only English Numerals are allowed in English source files: " + this.current);
            this.skip_invalid_num_or_id();
          } else {
            if (c === "_" || c.match(ANY_LETTER)) {
              this.en_id();
            } else {
              this.common(c);
            }
          }
        }
      }
    }
  }
  common(c) {
    switch (c) {
      case "\n":
        this.new_line();
        break;
      case "\r":
      case "	":
      case " ":
        {
          if (!this.ignore_cmts_ws) {
            this.add_token(c);
          }
        }
        break;
      case "&":
        this.and();
        break;
      case "|":
        this.pipe() || this.or_listpipe() || this.bar();
        break;
      case "+":
        this.add_asgmt() || this.add();
        break;
      case "-":
        this.comment() || this.sub_asgmt() || this.thin_arrow() || this.dash();
        break;
      case "~":
        this.tilde();
        break;
      case "^":
        this.add_token("^");
        break;
      case "=":
        this.thick_arrow() || this.equal();
        break;
      case "!":
        this.ne() || this.exclamation();
        break;
      case ">":
        this.ge() || this.gt();
        break;
      case "<":
        this.le() || this.lt();
        break;
      case ":":
        this.deconstruct() || this.decl() || this.dcolon() || this.colon();
        break;
      case "`":
        this.transl();
        break;
      case "@":
        this.add_token("@");
        break;
      case "$":
        this.add_token("$");
        break;
      case "[":
        this.add_token("[");
        break;
      case "]":
        this.add_token("]");
        break;
      case "(":
        this.add_token("(");
        break;
      case ")":
        this.add_token(")");
        break;
      case "{":
        this.multi_comment() || this.add_token("{");
        break;
      case "}":
        this.add_token("}");
        break;
      default:
        this.insert_err("unrecognized character: " + this.current);
    }
  }
}
class Symtab {
  /*tmp*/
  fns;
  /*tmp*/
  structs;
  /*tmp*/
  receivers;
  root;
  stack;
  current;
  constructor() {
    this.fns = [];
    this.structs = [];
    this.enums = [];
    this.receivers = {};
    this.root = new Table(null);
    this.stack = [];
    this.stack.push(this.root);
    this.current = this.root;
  }
  /*tmp*/
  insert_fn(fn) {
    this.fns.push(fn);
  }
  /*tmp*/
  insert_struct(struct) {
    this.structs.push(struct);
  }
  /*tmp*/
  insert_enum(_enum) {
    this.enums.push(_enum);
  }
  /*tmp*/
  insert_receiver(id, instance, fns) {
    const _fns = fns.map((fn) => [fn, instance]);
    if (!this.receivers[id]) {
      this.receivers[id] = _fns;
    } else {
      this.receivers[id] = [...this.receivers[id], ..._fns];
    }
  }
  begin_scope() {
    const table = new Table(this.current);
    const entry = new Entry("", "table", { table });
    this.current.insert(entry);
    this.stack.push(table);
    this.current = this.stack[this.stack.length - 1];
    return entry;
  }
  end_scope() {
    this.current = this.stack.pop();
    return this.current;
  }
  insert_fn(id, arity, rtype) {
    const entry = new Entry(id, "fn", { arity, rtype });
    this.current.insert(entry);
    return entry;
  }
  insert_type(id, fields) {
    const entry = new Entry(id, "t", { fields });
    this.current.insert(entry);
    return entry;
  }
  insert_const(id, t) {
    const entry = new Entry(id, "const", { t });
    this.current.insert(entry);
    return entry;
  }
  insert_var(id, t) {
    const entry = new Entry(id, "var", { t });
    this.current.insert(entry);
    return entry;
  }
  insert_ref(id) {
    const entry = new Entry(id, "ref", {});
    this.current.insert(entry);
    return entry;
  }
}
class Table {
  parent;
  entries;
  inner_scope;
  constructor(parent) {
    this.parent = parent;
    this.entries = [];
    this.inner_scope = [];
  }
  insert(entry) {
    this.entries.push(entry);
  }
}
class Entry {
  id;
  t;
  attrs;
  constructor(id, t, attrs) {
    this.id = id;
    this.t = t;
    this.attrs = attrs;
  }
}
class Node {
  id;
  t;
  v;
  constructor(id, t, v2) {
    this.id = id, this.t = t, this.v = v2;
  }
}
class Type {
  t;
  o;
  constructor(t, o) {
    this.t = t;
    this.o = o;
  }
}
class Struct {
  name;
  fields;
  constructor(name, fields) {
    this.name = name;
    this.fields = fields;
  }
}
class Enum {
  name;
  variants;
  constructor(name, variants) {
    this.name = name;
    this.variants = variants;
  }
}
class Receiver {
  trait;
  instance;
  type;
  fns;
  constructor(trait, instance, type, fns) {
    this.trait = trait;
    this.instance = instance;
    this.type = type;
    this.fns = fns;
  }
}
class TypeTempl {
  t;
  ts;
  o;
  constructor(t, ts, o) {
    this.t = t;
    this.ts = ts;
    this.o = o;
  }
}
class EnumPat {
  name;
  variant;
  constructor(name, variant) {
    this.name = name;
    this.variant = variant;
  }
}
class Pair {
  k;
  v;
  constructor(k, v2) {
    this.k = k;
    this.v = v2;
  }
}
class Uni {
  opr;
  op;
  constructor(opr, op) {
    this.opr = opr;
    this.op = op;
  }
}
class Bin {
  lopr;
  op;
  ropr;
  constructor(lopr, op, ropr) {
    this.lopr = lopr;
    this.op = op;
    this.ropr = ropr;
  }
}
class Fn {
  name;
  params;
  ret_types;
  body;
  constructor(name, params, ret_types, body) {
    this.name = name;
    this.params = params;
    this.ret_types = ret_types;
    this.body = body;
  }
}
class FnParam {
  _pat;
  t;
  constructor(_pat2, t) {
    this._pat = _pat2;
    this.t = t;
  }
}
class StructLEl {
  k;
  v;
  constructor(k, v2) {
    this.k = k;
    this.v = v2;
  }
}
class Asgmt {
  lhs;
  t;
  rhs;
  constructor(lhs, t, rhs) {
    this.lhs = lhs;
    this.t = t;
    this.rhs = rhs;
  }
}
class When {
  expr;
  arms;
  constructor(expr, arms) {
    this.expr = expr;
    this.arms = arms;
  }
}
class WhenArm {
  pats;
  expr;
  constructor(pats, expr) {
    this.pats = pats;
    this.expr = expr;
  }
}
const BIN_OP = ["+", "-", "*", "/", "[", "~=", "::", ":=", "=", "+=", "-=", "*=", "/=", "|=", "&=", "==", "!=", ">", ">=", "<", "<=", "|", "||", "|>", "||>", ":>", "&", "&&", ".", ".."];
const PREFIX_UNI_OP = [".", "!", "not", "-", "+"];
const POSTFIX_UNI_OP = ["?", "!", "%"];
const BIN_R_ASSOC = ["=", ":", "::", ":=", "~=", "+=", "-=", "*=", "/=", "÷=", "&=", "&&=", "|=", "||="];
class Parser {
  tokens;
  current_index;
  skipped_new_line;
  current;
  ast;
  symtab;
  attrs;
  errs;
  init(tokens) {
    this.tokens = tokens;
    this.current_index = -1;
    this.skipped_new_line = false;
    this.current = null;
    this.ast = [];
    this.symtab = new Symtab();
    this.attrs = [];
    this.errs = [];
  }
  run() {
    this.next();
    while (!this.is_eof()) {
      if (!this.maybe_use()) {
        break;
      }
    }
    while (!this.is_eof()) {
      let parsed = this.maybe_global_const();
      if (!parsed) {
        this.maybe_attrs();
        this.maybe_modifier();
        parsed = this.maybe_global_fn() || this.maybe_struct() || this.maybe_enum() || this.maybe_receiver();
      }
      if (!parsed) {
        panic$2("invalid syntax: " + to_str$2(this.current));
      }
    }
  }
  next(nl) {
    this.current_index += 1;
    const tk = this.tokens[this.current_index];
    this.current = tk;
    if (tk.v[0] === "\n") {
      this.skipped_new_line = true;
      this.next(true);
    } else {
      if (!nl) {
        this.skipped_new_line = false;
      }
    }
    return this.current;
  }
  backtrack() {
    this.current_index -= 1;
    const tk = this.tokens[this.current_index];
    this.current = tk;
    if (tk.v[0] === "\n") {
      this.backtrack();
    }
  }
  skip() {
    return this.next();
  }
  lookahead() {
    return this.lookahead_n(1);
  }
  lookahead_n(n) {
    let j = this.current_index;
    while (n > 0) {
      j += 1;
      while (true) {
        const tk = this.tokens[j];
        let nl;
        if (tk) {
          nl = tk.v[0] === "\n";
        }
        if (nl) {
          j += 1;
        } else {
          break;
        }
      }
      n -= 1;
    }
    return this.tokens[j];
  }
  lookahead_ws() {
    const i = this.current_index + 1;
    return this.tokens[i];
  }
  is_eof() {
    return this.current.v === "$eof";
  }
  is_newline() {
    return this.skipped_new_line;
  }
  is_asterisk() {
    return this.current.v === "*";
  }
  is_at() {
    return this.current.v === "@";
  }
  is_asgmt() {
    return this.current.v === "=";
  }
  is_hash() {
    return this.current.v === "--";
  }
  is_percent() {
    return this.current.v === "%";
  }
  is_dpercent() {
    return this.current.v === "%%";
  }
  is_behind_none() {
    return is_none(this.lookbehind);
  }
  is_behind_nl() {
    return this.lookbehind === "\n";
  }
  is_dot() {
    return this.current.v === ".";
  }
  is_colon() {
    return this.current.v === ":";
  }
  is_dcolon() {
    return this.current.v === "::";
  }
  is_caret() {
    return this.current.v === "^";
  }
  is_semicolon() {
    return this.current.v === ";";
  }
  is_comma() {
    return this.current.v === ",";
  }
  is_backtick() {
    return this.current.v === "`";
  }
  is_tbacktick() {
    return this.current.v[0] === "```";
  }
  is_underscore() {
    return this.is_id() && this.current.v[1] === "_";
  }
  is_plus() {
    return this.current.v === "+";
  }
  is_minus() {
    return this.current.v === "-";
  }
  is_exclamation() {
    return this.current.v === "!";
  }
  is_question() {
    return this.current.v === "?";
  }
  is_bar() {
    return this.current.v === "|";
  }
  is_thin_arrow() {
    return this.current.v === "->";
  }
  is_thick_arrow() {
    return this.current.v === "=>";
  }
  is_tilde() {
    return this.current.v === "~";
  }
  is_void() {
    return this.is_keyword("void");
  }
  is_or() {
    return this.is_keyword("or");
  }
  is_and() {
    return this.is_keyword("and");
  }
  is_not() {
    return this.is_keyword("not");
  }
  is_use() {
    return this.is_keyword("use");
  }
  is_let() {
    return this.is_keyword("let");
  }
  is_if_let() {
    return this.is_keyword("if_let");
  }
  is_const() {
    return this.is_keyword("const");
  }
  is_var() {
    return this.is_keyword("var");
  }
  is_then() {
    return this.is_keyword("then");
  }
  is_do() {
    return this.is_keyword("do");
  }
  is_end() {
    return this.is_keyword("end");
  }
  is_fn() {
    return this.is_keyword("fn");
  }
  is_alias() {
    return this.is_keyword("alias");
  }
  is_typedef() {
    return this.is_keyword("type");
  }
  is_struct() {
    return this.is_keyword("struct");
  }
  is_enum() {
    return this.is_keyword("enum");
  }
  is_open_paren() {
    return this.current.v === "(";
  }
  is_close_paren() {
    return this.current.v === ")";
  }
  is_open_curly() {
    return this.current.v === "{";
  }
  is_close_curly() {
    return this.current.v === "}";
  }
  is_open_bracket() {
    return this.current.v === "[";
  }
  is_close_bracket() {
    return this.current.v === "]";
  }
  is_open_angle() {
    return this.current.v === "<";
  }
  is_close_angle() {
    return this.current.v === ">";
  }
  is_double_close_angle() {
    return this.current.v === ">>";
  }
  is_if() {
    return this.is_keyword("if");
  }
  is_else() {
    return this.is_keyword("else");
  }
  is_ret() {
    return this.is_keyword("return");
  }
  is_break() {
    return this.is_keyword("break");
  }
  is_when() {
    return this.is_keyword("when");
  }
  is_for() {
    return this.is_keyword("for");
  }
  is_in() {
    return this.is_keyword("in");
  }
  is_while() {
    return this.is_keyword("while");
  }
  is_bool() {
    return this.is_keyword("true") || this.is_keyword("false");
  }
  is_char() {
    return this.current.v[0] === "char";
  }
  is_str() {
    return this.current.v[0] === "str";
  }
  is_int() {
    return this.current.v[0] === "int";
  }
  is_float() {
    return this.current.v[0] === "float";
  }
  is_modifier() {
    const plus_or_minus = this.expect_plus() || this.expect_minus() && this.lookahead_n(2).v === ")";
    return this.is_open_paren() && plus_or_minus;
  }
  is_this() {
    return this.is_keyword("this");
  }
  is_keyword(id) {
    return this.current.v[0] === "key" && this.current.v[1] === id;
  }
  is_id() {
    return this.current.v[0] === "id";
  }
  is_id_pat() {
    return this.current.v[0] === "id";
  }
  is_bool_pat() {
    return this.current.v[0] === "bool";
  }
  is_char_pat() {
    return this.current.v[0] === "char";
  }
  is_str_pat() {
    return this.current.v[0] === "str";
  }
  is_int_pat() {
    return this.current.v[0] === "int";
  }
  is_float_pat() {
    return this.current.v[0] === "float";
  }
  is_tuple_pat() {
    return this.is_open_paren();
  }
  is_list_pat() {
    return this.is_open_bracket();
  }
  is_structl_pat() {
    return this.is_open_curly();
  }
  is_enum_pat() {
    return this.is_dot();
  }
  is_pat() {
    return this.is_bool_pat() || this.is_char_pat() || this.is_str_pat() || this.is_int_pat() || this.is_float_pat() || this.is_list_pat() || this.is_tuple_pat() || this.is_structl_pat() || this.is_enum_pat() || this.is_id_pat() || this.is_underscore();
  }
  is_assoc_fn() {
    if (!is_list$2(this.current.v)) {
      return;
    }
    return this.is_fn() && this.lookahead().v === "^";
  }
  is_method() {
    if (!is_list$2(this.current.v)) {
      return;
    }
    return this.is_fn() && this.lookahead().v !== "^";
  }
  expect_short_asgmt() {
    return this.lookahead().v === ":=";
  }
  expect_colon() {
    return this.lookahead().v === ":";
  }
  expect_comma() {
    return this.lookahead().v === ",";
  }
  expect_plus() {
    return this.lookahead().v === "+";
  }
  expect_minus() {
    return this.lookahead().v === "-";
  }
  expect_id() {
    const tk = this.lookahead().v;
    return tk[0] === "id";
  }
  expect_str() {
    const tk = this.lookahead().v;
    return tk[0] === "str";
  }
  expect_eof() {
    return this.lookahead().v === "$eof";
  }
  expect_close_paren() {
    return this.lookahead().v === ")";
  }
  expect_close_bracket() {
    return this.lookahead().v === "]";
  }
  expect_open_curly() {
    return this.lookahead().v === "{";
  }
  expect_close_curly() {
    return this.lookahead().v === "}";
  }
  expect_astrisk() {
    return this.lookahead().v === "*";
  }
  expect_asgmt() {
    return this.lookahead().v === "=";
  }
  maybe_asgmt() {
    if (this.is_asgmt()) {
      this.next();
      return true;
    }
  }
  maybe_comma() {
    if (this.is_comma()) {
      this.next();
      return true;
    }
  }
  optional_comma() {
    if (this.is_newline() || this.is_close_curly() || this.is_close_paren() || this.is_close_bracket() || this.is_close_angle() || this.is_thin_arrow() || this.is_thick_arrow()) {
      return this.maybe_comma();
    } else {
      return this.req_comma();
    }
  }
  maybe_colon() {
    if (this.is_colon()) {
      this.next();
      return true;
    }
  }
  maybe_open_curly() {
    if (this.is_open_curly()) {
      this.next();
      return true;
    }
  }
  maybe_id() {
    if (this.is_id()) {
      const id = this.current;
      this.next();
      return id;
    }
  }
  maybe_asterisk() {
    if (this.is_asterisk()) {
      this.current;
      this.next();
      return this.asterisk;
    }
  }
  maybe_open_paren() {
    if (is_open_paren()) {
      this.next();
      return true;
    }
  }
  maybe_modifier() {
    if (!this.is_modifier()) {
      return;
    }
    this.next();
    const n = new Node("modif", "", this.current);
    this.next();
    this.req_close_paren();
    this.ast.push(n);
    return true;
  }
  maybe_attrs() {
    while (this.is_hash()) {
      this.skip();
      const id = this.maybe_id();
      if (!this.id) {
        panic$2("expecting an id: " + to_str$2(this.current));
      }
      this.attrs.push(id);
      if (this.lookahead().v !== ",") {
        return null;
      } else {
        this.skip();
      }
    }
    if (this.attrs.length > 0) {
      return true;
    }
  }
  maybe_pat() {
    if (this.is_pat()) {
      return this.prim_pat();
    }
  }
  req_in() {
    if (this.is_in()) {
      this.next();
      return true;
    } else {
      panic$2('expecting "in" : ' + to_str$2(this.current));
    }
  }
  req_asgmt() {
    if (!this.maybe_asgmt()) {
      panic$2("expecting '=' : " + to_str$2(this.current));
    }
    return true;
  }
  req_comma() {
    if (this.is_comma()) {
      this.next();
      return true;
    } else {
      panic$2("expecting ',' after : " + to_str$2(this.current));
    }
  }
  req_backtick() {
    if (this.is_backtick()) {
      this.next();
      return true;
    } else {
      panic$2("expecting '`' after : " + to_str$2(this.current));
    }
  }
  req_tbacktick() {
    if (this.is_tbacktick()) {
      this.next();
      return true;
    } else {
      panic$2("expecting '```' after : " + to_str$2(this.current));
    }
  }
  req_terminator() {
    return this.is_newline() || this.is_eof();
  }
  req_open_paren() {
    if (this.is_open_paren()) {
      this.next();
      return true;
    } else {
      panic$2("expecting '(' : " + to_str$2(this.current));
    }
  }
  req_close_paren() {
    if (this.is_close_paren()) {
      this.next();
      return true;
    } else {
      panic$2("expecting ')' : " + to_str$2(this.current));
    }
  }
  req_open_curly() {
    if (this.is_open_curly()) {
      this.next();
      return true;
    } else {
      panic$2("expecting '{' : " + to_str$2(this.current));
    }
  }
  req_close_curly() {
    if (this.is_close_curly()) {
      this.next();
      return true;
    } else {
      panic$2("expecting '}' : " + to_str$2(this.current));
    }
  }
  req_close_angle() {
    if (this.is_close_angle()) {
      this.next();
      return true;
    } else {
      panic$2("expecting '>' : " + to_str$2(this.current));
    }
  }
  req_colon() {
    if (this.is_colon()) {
      this.next();
      return true;
    } else {
      panic$2("expecting a colon ':' " + to_str$2(this.current));
    }
  }
  req_dcolon() {
    if (this.is_dcolon()) {
      this.next();
      return true;
    } else {
      panic$2("expecting a double colon '::' " + to_str$2(this.current));
    }
  }
  req_open_bracket() {
    if (this.is_open_bracket()) {
      this.next();
      return true;
    } else {
      panic$2("expecting '[' : " + to_str$2(this.current));
    }
  }
  req_close_bracket() {
    if (this.is_close_bracket()) {
      this.next();
      return true;
    } else {
      panic$2("expecting ']' : " + to_str$2(this.current));
    }
  }
  req_thin_arrow() {
    if (this.is_thin_arrow()) {
      this.next();
      return true;
    } else {
      panic$2("expecting '->' : " + to_str$2(this.current));
    }
  }
  req_thick_arrow() {
    if (this.is_thick_arrow()) {
      this.next();
      return true;
    } else {
      panic$2("expecting '=>' : " + to_str$2(this.current));
    }
  }
  req_then() {
    if (this.is_then()) {
      this.next();
      return true;
    } else {
      panic$2("expecting 'then' : " + to_str$2(this.current));
    }
  }
  req_pat() {
    const _pat2 = this.maybe_pat();
    if (_pat2) {
      return _pat2;
    } else {
      panic$2("expecting a pattern: " + to_str$2(this.current));
    }
  }
  prim_pat() {
    if (this.is_underscore()) {
      const n = new Node("_", "pat", "");
      this.next();
      return n;
    } else if (this.is_bool_pat()) {
      return this.bool_pat();
    } else if (this.is_char_pat()) {
      return this.char_pat();
    } else if (this.is_str_pat()) {
      return this.str_pat();
    } else if (this.is_int_pat()) {
      return this.int_pat();
    } else if (this.is_float_pat()) {
      return this.float_pat();
    } else if (this.is_list_pat()) {
      return this.list_pat();
    } else if (this.is_tuple_pat()) {
      return this.tuple_pat();
    } else if (this.is_structl_pat()) {
      return this.structl_pat();
    } else if (this.is_enum_pat()) {
      return this.enum_pat();
    } else if (this.is_id_pat()) {
      return this.id_pat();
    }
  }
  bool_pat() {
    const n = new Node("bool", "pat", this.current);
    this.next();
    return n;
  }
  char_pat() {
    const n = new Node("char", "pat", this.current);
    this.next();
    return n;
  }
  str_pat() {
    const n = new Node("str", "pat", this.current);
    this.next();
    return n;
  }
  int_pat() {
    const n = new Node("int", "pat", this.current);
    this.next();
    return n;
  }
  float_pat() {
    const n = new Node("float", "pat", this.current);
    this.next();
    return n;
  }
  list_pat() {
    if (!this.is_open_bracket()) {
      return;
    }
    this.next();
    const items = [];
    this.maybe_comma();
    while (true) {
      if (items.length > 0) {
        if (!this.req_comma()) {
          return;
        }
      }
      const _pat2 = this.maybe_pat();
      if (_pat2) {
        return items.push(_pat2);
      } else {
        break;
      }
    }
    this.maybe_comma();
    this.req_close_bracket();
    const n = new Node("[", "pat", items);
    return n;
  }
  tuple_pat() {
    if (!this.is_open_paren()) {
      return;
    }
    this.next();
    const items = [];
    this.maybe_comma();
    while (true) {
      if (items.length > 0) {
        this.req_comma();
      }
      const _pat2 = this.maybe_pat();
      if (_pat2) {
        return items.push(_pat2);
      } else {
        break;
      }
    }
    this.maybe_comma();
    this.req_close_paren();
    const n = new Node("(", "pat", items);
    return n;
  }
  structl_pat() {
    if (!this.is_open_curly()) {
      return;
    }
    this.next();
    const items = [];
    this.maybe_comma();
    while (true) {
      if (items.length > 0) {
        this.maybe_comma() || this.req_terminator();
      }
      const id = this.maybe_id();
      if (!id) {
        break;
      }
      let v2;
      if (this.is_colon()) {
        this.next();
        v2 = this.req_pat();
      }
      const el = new StructLEl(id, v2);
      items.push(el);
    }
    this.maybe_comma();
    this.req_close_curly();
    const n = new Node("{", "pat", items);
    return n;
  }
  enum_pat() {
    panic$2("enum patterns are not supported yet");
    const id = this.current;
    this.next();
    const p = new EnumPat(id, _pat);
    if (_pat) {
      const n = new Node("enum_pat", "pat", p);
      return n;
    }
  }
  id_pat() {
    const id = this.current;
    this.next();
    const n = new Node("id", "pat", id);
    return n;
  }
  req_body() {
    const stmts = this.stmts();
    const n = new Node("body", "body", stmts);
    return n;
  }
  req_body_ret() {
    const body = this.req_body();
    this.implicit_return(body.v);
    return body;
  }
  maybe_stmt() {
    if (this.is_eof() || this.is_modifier()) {
      return;
    }
    return this.maybe_break() || this.maybe_const() || this.maybe_let() || this.maybe_expr() || this.maybe_semicolon();
  }
  req_stmts() {
    const token = this.current;
    const stmts = this.stmts();
    if (is_empty(stmts)) {
      panic$2("expecting a statement : " + to_str$2(token));
    } else {
      return stmts;
    }
  }
  stmts() {
    let _stmts = [];
    let stmt;
    while (true) {
      stmt = this.maybe_stmt();
      if (stmt) {
        _stmts.push(stmt);
      }
      if (!stmt) {
        break;
      }
    }
    return _stmts;
  }
  maybe_ret() {
    if (!this.is_ret()) {
      return;
    }
    this.next();
    const expr = this.maybe_expr();
    const n = new Node("return", "expr", expr);
    return n;
  }
  maybe_break() {
    if (!this.is_break()) {
      return;
    }
    this.next();
    const n = new Node("break", "stmt", null);
    return n;
  }
  maybe_global_const() {
    let c = this.maybe_const();
    if (c) {
      this.ast.push(c);
      return true;
    }
    return false;
  }
  maybe_global_fn() {
    let fn = this.maybe_fn();
    if (fn) {
      this.ast.push(fn);
      return true;
    }
    return false;
  }
  maybe_receiver() {
    if (!this.is_at()) {
      return;
    }
    this.next();
    let trait = this.maybe_id();
    this.req_open_paren();
    let instance = this.req_id();
    this.req_colon();
    let type = this.req_id();
    this.req_close_paren();
    let fns = [];
    if (this.maybe_open_curly()) {
      while (!this.is_eof() || !this.is_close_curly()) {
        let fn = this.maybe_fn();
        if (fn) {
          fns.push(fn);
        } else {
          break;
        }
      }
      this.req_close_curly();
    } else {
      fns.push(this.req_fn());
    }
    const receiver = new Receiver(trait, instance, type, fns);
    const n = new Node("receiver", "def", receiver);
    this.symtab.insert_receiver(type.v[1], instance.v[1], fns);
    this.ast.push(n);
    return true;
  }
  maybe_const() {
    if (!this.is_const()) {
      return;
    }
    this.next();
    const _pat2 = this.req_pat();
    const t = this.maybe_tannotation();
    this.req_asgmt();
    const rhs = this.req_expr();
    const asgmt = new Asgmt(_pat2, t, rhs);
    const n = new Node("const", "stmt", asgmt);
    return n;
  }
  maybe_let() {
    if (!this.is_let()) {
      return;
    }
    this.next();
    const _pat2 = this.req_pat();
    const t = this.maybe_tannotation();
    this.req_asgmt();
    const rhs = this.req_expr();
    const asgmt = new Asgmt(_pat2, t, rhs);
    const n = new Node("var", "stmt", asgmt);
    return n;
  }
  req_expr() {
    const token = this.current;
    const expr = this.maybe_expr();
    if (expr) {
      return expr;
    } else {
      panic$2("expecting expression : " + to_str$2(token));
    }
  }
  maybe_do_block_ret() {
    const block = this.maybe_do_block();
    if (block) {
      this.implicit_return(block.v);
      return block;
    }
  }
  req_do_block_ret() {
    const block = this.req_do_block();
    this.implicit_return(block.v);
    return block;
  }
  maybe_do_block() {
    if (!this.is_do()) {
      return;
    }
    this.next();
    const stmts = [];
    this.req_open_curly();
    while (true) {
      if (this.is_eof() || this.is_close_curly()) {
        break;
      }
      const stmt = this.maybe_stmt();
      if (stmt) {
        stmts.push(stmt);
      } else {
        break;
      }
    }
    this.req_close_curly();
    const n = new Node("do_block", "expr", stmts);
    return n;
  }
  req_do_block() {
    const token = this.current;
    const expr = this.maybe_do_block();
    if (expr) {
      return expr;
    } else {
      panic$2("expecting 'do' block : " + to_str$2(token));
    }
  }
  maybe_block() {
    if (!this.is_open_curly()) {
      return;
    }
    this.next();
    const stmts = [];
    while (true) {
      if (this.is_eof() || this.is_end()) {
        break;
      }
      const stmt = this.maybe_stmt();
      if (stmt) {
        stmts.push(stmt);
      } else {
        break;
      }
    }
    this.implicit_return(stmts);
    this.req_end();
    const n = new Node("block", "expr", stmts);
    return n;
  }
  maybe_semicolon() {
    if (!this.is_semicolon()) {
      return;
    }
    const tk = this.next();
    const n = new Node(";", "expr", tk);
    return n;
  }
  is_bin_op() {
    if (this.current.v === "(" || this.current.v === "{" || this.current.v === "[") {
      if (!this.is_newline()) {
        return true;
      }
    } else {
      return contains$2(BIN_OP, this.current.v);
    }
  }
  is_postfix_uni_op() {
    return contains$2(POSTFIX_UNI_OP, this.current.v);
  }
  req_list_index() {
    const expr = this.req_expr();
    if (expr) {
      if (this.req_close_bracket()) {
        return expr;
      }
    } else {
      panic$2("expecting  an index [...]: " + to_str$2(this.current));
    }
  }
  req_access(lopr) {
    let n = this.req_expr();
    return n;
  }
  req_call_args() {
    const args = [];
    while (true) {
      if (this.is_eof() || this.is_close_paren()) {
        break;
      }
      if (args.length > 0) {
        if (this.is_newline()) {
          this.maybe_comma();
        } else {
          this.req_comma();
        }
      }
      let expr = this.maybe_expr();
      if (expr) {
        args.push(expr);
      }
    }
    this.req_close_paren();
    const n = new Node("args", "expr", args);
    return n;
  }
  maybe_lopr_prefix_postfix(expr, postfix_op) {
    const opr = expr.v.opr;
    const op = expr.v.op;
    if (expr.id === "prefix") {
      if (this.prec_uni(postfix_op) >= this.prec_uni(op)) {
        const postfix = new Uni(opr, postfix_op);
        const postfix_n = new Node("postfix", "expr", postfix);
        const prefix = new Uni(postfix_n, op);
        const prefix_n = new Node("prefix", "expr", prefix);
        this.next();
        return prefix_n;
      } else {
        const postfix = new Uni(expr, postfix_op);
        const n = new Node("postfix", "expr", postfix);
        this.next();
        return n;
      }
    }
  }
  maybe_lopr_bin_postfix(expr, postfix_op) {
    if (expr.id === "bin") {
      const op = expr.v.op;
      const ropr = expr.v.ropr;
      const lopr = expr.v.lopr;
      if (this.prec_uni(postfix_op) >= this.prec_bin(op)) {
        const postfix = new Uni(ropr, postfix_op);
        const postfix_n = new Node("postfix", "expr", postfix);
        const bin = new Bin(lopr, op, postfix_n);
        const bin_n = new Node("bin", "expr", bin);
        this.next();
        return bin_n;
      } else {
        const postfix = new Uni(expr, postfix_op);
        const postfix_n = new Node("postfix", "expr", postfix);
        this.next();
        return postfix_n;
      }
    }
  }
  maybe_lopr_prefix_bin(expr, bin_op) {
    const op = expr.v.op;
    let opr = expr.v.opr;
    if (expr.id === "prefix") {
      if (this.prec_uni(op) >= this.prec_bin(bin_op)) {
        opr = this.req_op(opr);
        const prefix = new Uni(opr, op);
        const prefix_n = new Node("prefix", "expr", prefix);
        return prefix_n;
      } else {
        const ropr = this.req_ropr(expr);
        const bin = new Bin(opr, bin_op, ropr);
        const bin_n = new Node("bin", "expr", bin);
        const prefix = new Uni(bin_n, op);
        const prefix_n = new Node("prefix", "expr", prefix);
        return prefix_n;
      }
    }
  }
  get_lopr(lopr, op) {
    let opr = this.maybe_lopr_prefix_postfix(lopr, op);
    if (!opr) {
      opr = this.maybe_lopr_bin_postfix(lopr, op);
      if (!opr) {
        const postfix = new Uni(lopr, op);
        opr = new Node("postfix", "expr", postfix);
        this.next();
      }
    }
    return opr;
  }
  req_ropr(lopr) {
    let ropr;
    const token = this.current;
    if (this.is_open_bracket()) {
      this.next();
      ropr = this.req_list_index();
    } else if (this.is_dot()) {
      this.next();
      ropr = this.req_access(lopr);
    } else if (this.is_open_paren()) {
      this.next();
      ropr = this.req_call_args();
    } else {
      this.next();
      ropr = this.maybe_expr();
    }
    if (!ropr) {
      panic$2("expecting right operand: " + to_str$2(token));
    }
    return ropr;
  }
  prec_uni(v2) {
    switch (v2.v) {
      case "%":
        return 60;
      case ".":
        return 50;
      case "!":
      case "?":
        return 16;
      case "+":
      case "-":
      case "_!":
      case "not":
        return 15;
      case "⏎":
        return 0;
      default:
        panic$2("unexpected unary operator: " + to_str$2(v2));
    }
  }
  prec_bin(v2) {
    switch (v2.v) {
      case "[":
        return 20;
      case "(":
      case "{":
        return 19;
      case ".":
        return 18;
      case "*":
      case "×":
      case "/":
      case "÷":
        return 13;
      case "+":
      case "-":
        return 12;
      case "<":
      case "<=":
      case ">":
      case ">=":
        return 11;
      case "==":
      case "!=":
        return 10;
      case "<<":
      case ">>":
        return 8;
      case "&":
        return 7;
      case "**":
      case "⊕":
        return 6;
      case "|":
        return 5;
      case "&&":
        return 4;
      case "||":
        return 3;
      case "|>":
      case "||>":
      case ":>":
        return 2;
      case "=":
      case ":=":
      case "::":
      case "~=":
      case "+=":
      case "-=":
      case "*=":
      case "×=":
      case "/=":
      case "÷=":
      case "&=":
      case "|=":
      case "^=":
      case ">>=":
      case "<<=":
        return 1;
      default:
        panic$2("unexpected binary operator: " + to_str$2(v2));
    }
  }
  is_bin_rassoc(v2) {
    return contains$2(BIN_R_ASSOC, v2);
  }
  maybe_op(lopr) {
    const op = this.current;
    if (this.is_postfix_uni_op()) {
      return this.get_lopr(lopr, op);
    } else if (this.is_bin_op()) {
      const opr = this.maybe_lopr_prefix_bin(lopr, op);
      if (opr) {
        return opr;
      }
      let ropr = this.req_ropr(lopr);
      if (ropr) {
        if (ropr.id === "bin") {
          ropr = this.while_op(ropr, this.prec_bin(ropr.v.op) > this.prec_bin(op) || this.prec_bin(ropr.v.op) === this.prec_bin(op) && this.is_bin_rassoc(ropr.v.op));
        } else if (ropr.id === "prefix") {
          ropr = this.while_op(ropr, this.prec_bin(op) > this.prec_uni(ropr.v.op) || this.is_bin_rassoc(op));
        } else {
          ropr = this.while_op(ropr, false);
        }
      }
      const bin = new Bin(lopr, op, ropr);
      const n = new Node("bin", "expr", bin);
      return n;
    }
  }
  req_op(lopr) {
    const op = this.maybe_op(lopr);
    if (op) {
      return op;
    }
    panic$2("expect an operation: " + to_str$2(this.lookahead()));
  }
  while_op(lopr, cond) {
    let expr = clone(lopr);
    if (this.is_eof()) {
      return expr;
    }
    while (this.is_bin_op() || this.is_postfix_uni_op()) {
      if (cond === false) {
        break;
      }
      expr = this.req_op(expr);
    }
    return expr;
  }
  maybe_expr() {
    let expr = this.maybe_prim();
    if (expr) {
      expr = this.while_op(expr);
      return expr;
    }
  }
  req_id() {
    const id = this.maybe_id();
    if (id) {
      return id;
    } else {
      panic$2("expecting an ID: " + to_str$2(this.current));
    }
  }
  maybe_void() {
    if (this.is_void()) {
      this.next();
      const n = new Node("void", "expr");
      return n;
    }
  }
  // maybe_unit() {
  //     if(this.is_open_paren() && this.expect_close_paren()) {
  //         this.next()
  //         this.next()
  //         const n = new Node("()", "expr", "()")
  //         return n
  //     }
  // }
  // FIXME: a workaround that only handles using id params
  maybe_afn(els) {
    const to_params = () => {
      if (!els) {
        return;
      }
      if (!is_list$2(els)) {
        els = [els];
      }
      const params = [];
      els.forEach((el) => {
        el.id = "id";
        el.type = "pat";
        params.push(new Node("param", "pat", new FnParam(el)));
      });
      return params;
    };
    if (this.is_thick_arrow()) {
      const params = to_params();
      this.next();
      this.req_open_curly();
      const body = this.req_body_ret();
      this.req_close_curly();
      const _afn = new Fn("", params, null, body);
      const n = new Node("afn", "expr", _afn);
      return n;
    }
  }
  maybe_tuple_afn_group() {
    if (this.is_open_paren()) {
      const loc = this.current.loc;
      this.next();
      if (this.is_id() && this.expect_colon()) {
        return this.req_named_tuple();
      } else {
        let expr = null;
        expr = this.maybe_expr();
        if (expr) {
          let arg = expr;
          if (this.is_comma()) {
            const tuple = [arg];
            while (true) {
              const comma_close_paren = this.is_comma() && this.expect_close_paren();
              if (this.is_eof() || this.is_close_paren() || comma_close_paren) {
                break;
              }
              this.req_comma();
              arg = this.maybe_expr();
              if (arg) {
                tuple.push(arg);
              } else {
                panic$2("expected an argument: " + loc);
              }
            }
            this.maybe_comma();
            this.req_close_paren();
            const afn = this.maybe_afn(tuple);
            if (afn) {
              return afn;
            } else {
              const n = new Node("tuple", "expr", tuple);
              return n;
            }
          } else {
            this.req_close_paren();
            const afn = this.maybe_afn(expr);
            if (afn) {
              return afn;
            } else {
              expr.grouped = true;
              return expr;
            }
          }
        }
      }
    }
  }
  req_named_tuple() {
    let named_tuple = [];
    while (!(this.is_eof() || this.is_close_paren())) {
      let name = this.req_id();
      this.req_colon();
      let expr = this.req_expr();
      named_tuple.push([name, expr]);
      this.optional_comma();
    }
    this.req_close_paren();
    return new Node("named_tuple", "expr", named_tuple);
  }
  is_prefix_uni_op() {
    return contains$2(PREFIX_UNI_OP, this.current.v);
  }
  maybe_prefix_uni_op() {
    if (this.is_prefix_uni_op()) {
      const op = this.current;
      this.next();
      const prefix = new Uni(this.req_prim(), op);
      const n = new Node("prefix", "expr", prefix);
      return n;
    }
  }
  maybe_literal() {
    let expr = this.maybe_primitivel();
    if (!expr) {
      expr = this.maybe_list();
    }
    if (!expr) {
      expr = this.maybe_tuple();
    }
    return expr;
  }
  maybe_primitivel() {
    let expr = this.maybe_bool();
    if (!expr) {
      expr = this.maybe_char();
    }
    if (!expr) {
      expr = this.maybe_str();
    }
    if (!expr) {
      expr = this.maybe_int();
    }
    if (!expr) {
      expr = this.maybe_float();
    }
    return expr;
  }
  maybe_bool() {
    if (this.is_bool()) {
      const n = new Node("bool", "expr", this.current);
      this.next();
      return n;
    }
  }
  maybe_char() {
    if (this.is_char()) {
      const n = new Node("char", "expr", this.current);
      this.next();
      return n;
    }
  }
  maybe_str() {
    if (this.is_str()) {
      const n = new Node("str", "expr", this.current);
      this.next();
      return n;
    }
  }
  maybe_int() {
    if (this.is_int()) {
      const num = this.current;
      this.next();
      let suffix;
      if (this.is_id() && !this.is_newline()) {
        suffix = this.current;
        this.next();
      }
      const n = new Node("int", "expr", [num, suffix]);
      return n;
    }
  }
  maybe_float() {
    if (this.is_float()) {
      const num = this.current;
      this.next();
      let suffix;
      if (this.is_id() && !this.is_newline()) {
        suffix = this.current;
        this.next();
      }
      const n = new Node("float", "expr", [num, suffix]);
      return n;
    }
  }
  maybe_list() {
    if (this.is_open_bracket()) {
      const els = [];
      this.next();
      this.maybe_comma();
      while (true) {
        const comma_close_bracket = this.is_comma() && this.expect_close_bracket();
        if (this.is_eof() || this.is_close_bracket() || comma_close_bracket) {
          break;
        }
        if (els.length > 0) {
          if (this.is_newline()) {
            this.maybe_comma();
          } else {
            this.req_comma();
          }
        }
        els.push(this.req_expr());
      }
      this.maybe_comma();
      this.req_close_bracket();
      const n = new Node("[", "expr", els);
      return n;
    }
  }
  maybe_tuple() {
    if (this.is_open_paren()) {
      const els = [];
      this.skip();
      this.maybe_comma();
      let named_tuple = false;
      if (this.is_id && this.expect_colon()) {
        named_tuple = true;
      }
      while (true) {
        if (els.length > 0) {
          this.req_comma();
        }
        let name;
        if (named_tuple) {
          name = this.req_id();
          this.req_colon();
        }
        let expr = this.req_expr();
        if (named_tuple) {
          els.push([name, expr]);
        } else {
          els.push([expr]);
        }
        if (this.is_close_paren()) {
          break;
        }
      }
      this.maybe_comma();
      this.req_close_paren();
      if (named_tuple) {
        return new Node("(:", "expr", els);
      } else {
        return new Node("(", "expr", els);
      }
    }
  }
  maybe_call(id) {
    const maybe_args = () => {
      const args2 = [];
      if (!this.is_open_paren()) {
        return;
      }
      this.next();
      while (!(this.is_eof() || this.is_close_paren())) {
        let arg_name;
        if (this.is_id() && this.expect_colon()) {
          arg_name = this.current;
          this.next();
          this.next();
        }
        let arg;
        if (arg_name) {
          arg = new Node("named_arg", "expr", [arg_name, this.req_expr()]);
        } else {
          arg = this.maybe_expr();
        }
        if (!arg) {
          break;
        }
        args2.push(arg);
        this.optional_comma();
      }
      this.req_close_paren();
      return args2;
    };
    const maybe_children = () => {
      if (!this.is_dcolon()) {
        return;
      }
      this.next();
      if (this.is_open_curly()) {
        this.next();
        const children2 = [];
        while (!(this.is_eof() || this.is_close_curly())) {
          const expr = this.maybe_expr();
          if (!expr) {
            break;
          }
          children2.push(expr);
          this.optional_comma();
        }
        this.req_close_curly();
        children2.push();
        return children2;
      } else {
        children.push(this.req_expr());
        return children;
      }
    };
    const args = maybe_args();
    const children = maybe_children();
    if (!(args || children)) {
      return;
    }
    const n = new Node("call", "expr", [id, args, children]);
    return n;
  }
  req_ref() {
    const id = this.current;
    this.next();
    const n = new Node("ref", "expr", id);
    return n;
  }
  maybe_call_or_ref() {
    if (this.is_id()) {
      const ref = this.req_ref();
      return this.maybe_call(ref) || ref;
    }
  }
  maybe_when_arm() {
    const pats = [];
    while (!this.is_thin_arrow()) {
      pats.push(this.req_pat());
      if (this.is_bar()) {
        this.next();
      } else {
        break;
      }
    }
    this.req_thin_arrow();
    const expr = this.req_expr();
    const arm = new WhenArm(pats, expr);
    const n = new Node("arm", "", arm);
    return n;
  }
  maybe_when() {
    if (!this.is_when()) {
      return;
    }
    this.next();
    this.req_open_paren();
    const expr = this.maybe_expr();
    this.req_close_paren();
    this.req_open_curly();
    const arms = [];
    this.maybe_comma();
    while (true) {
      if (this.is_eof() || this.is_close_curly()) {
        break;
      }
      if (arms.length > 0) {
        this.optional_comma();
        if (this.is_eof() || this.is_close_curly()) {
          break;
        }
      }
      const arm = this.maybe_when_arm();
      if (arm) {
        arms.push(arm);
      } else {
        break;
      }
    }
    this.maybe_comma();
    this.req_close_curly();
    const _when = new When(expr, arms);
    const n = new Node("when", "expr", _when);
    return n;
  }
  maybe_prim() {
    let expr = this.maybe_void();
    if (!expr) {
      expr = this.maybe_tuple_afn_group();
    }
    if (!expr) {
      expr = this.maybe_prefix_uni_op();
    }
    if (!expr) {
      expr = this.maybe_call_or_ref();
    }
    if (!expr) {
      expr = this.maybe_literal();
    }
    if (!expr) {
      expr = this.maybe_when();
    }
    if (!expr) {
      expr = this.maybe_do_block_ret();
    }
    if (!expr) {
      expr = this.maybe_ret();
    }
    if (!expr) {
      expr = this.maybe_semicolon();
    }
    return expr;
  }
  req_prim() {
    const prim = this.maybe_prim();
    if (!prim) {
      panic$2("expecting an expression: " + to_str$2(this.current));
    }
    return prim;
  }
  maybe_fn() {
    this.current;
    if (!this.is_fn()) {
      return;
    }
    this.next();
    const _fn = this.req_fn();
    if (_fn && contains$2(["main", "بدء"], _fn.v.name.v[1])) {
      const n = new Node("main", "fn", _fn.v);
      return n;
    } else {
      const n = new Node("fn", "fn", _fn.v);
      return n;
    }
  }
  maybe_use() {
    if (!this.is_use()) {
      return;
    }
    this.next();
    const path = [];
    if (!this.is_id()) {
      return false;
    }
    while (this.is_id()) {
      path.push(this.current);
      this.next();
      if (this.is_dot()) {
        this.skip();
        if (!this.is_id()) {
          panic$2("expecting an idnetifier after " + to_str$2(this.current));
        }
      } else {
        break;
      }
    }
    const n = new Node("use", "stmt", path);
    this.ast.push(n);
    return true;
  }
  maybe_optional() {
    if (this.is_question()) {
      this.next();
      return true;
    }
  }
  maybe_simple_type() {
    if (this.is_id()) {
      let n;
      const t = this.req_id();
      if (this.is_open_angle()) {
        const ts = [];
        this.next();
        this.maybe_comma();
        while (true) {
          if (this.is_eof() || this.is_close_angle()) {
            break;
          }
          if (ts.length > 0) {
            this.req_comma();
          }
          ts.push(this.req_type());
        }
        this.maybe_comma();
        this.req_close_angle();
        const _type = new TypeTempl(t, ts, this.maybe_optional());
        n = new Node("<", "t", _type);
      } else {
        const _type = new Type(t, this.maybe_optional());
        n = new Node("t", "t", _type);
      }
      return n;
    }
  }
  maybe_list_type() {
    if (this.is_open_bracket()) {
      this.next();
      const t = this.req_type();
      this.req_close_bracket();
      const _type = new Type(t, this.maybe_optional());
      return new Node("[", "t", _type);
    }
  }
  // maybe_dynamic_type() { 
  //     if(this.is_open_curly()) {
  //         this.next()
  //         const fields = []
  //         this.maybe_comma()
  //         while(true) {
  //             if(this.is_eof() || this.is_close_curly()) { break }
  //             if(fields.length > 0) {  this.req_comma()  }
  //             const k = this.maybe_id()
  //             let t
  //             if(k) { 
  //                 if(this.is_colon()) {
  //                     this.next()
  //                     t = this.req_type()
  //                 }
  //             }
  //             const pair = new Pair(k, t)
  //             fields.push(pair)
  //         }
  //         this.maybe_comma()
  //         this.req_close_curly()
  //         const _type = new TypeDynamic(fields, this.maybe_optional())
  //         n = new Node("{", "t", _type) 
  //         return n
  //     } 
  // }
  maybe_type() {
    return this.maybe_simple_type() || this.maybe_list_type();
  }
  req_type() {
    let n = this.maybe_type();
    if (!n) {
      panic$2("type required: " + to_str$2(this.current));
    }
    return n;
  }
  maybe_tannotation() {
    if (!this.is_colon()) {
      return;
    }
    this.next();
    return this.maybe_type();
  }
  req_tannotation() {
    const tannotation = this.maybe_tannotation();
    if (!tannotation) {
      panic$2("requires type annotation: " + to_str$2(this.current));
    }
    return tannotation;
  }
  maybe_fn_params() {
    const params = [];
    if (!this.is_open_paren()) {
      return params;
    }
    this.next();
    this.maybe_comma();
    while (true) {
      if (this.is_close_paren() || this.is_eof()) {
        break;
      }
      if (params.length > 0) {
        this.req_comma();
      }
      const _pat2 = this.req_pat();
      const t = this.maybe_tannotation();
      const param = new FnParam(_pat2, t);
      const n = new Node("param", "pat", param);
      if (_pat2.id !== "id") {
        panic$2("only parameters with id patterns are currently supported");
      }
      params.push(n);
    }
    this.maybe_comma();
    this.req_close_paren();
    return params;
  }
  maybe_fn_ret_types() {
    const ret_types = [];
    if (this.is_thin_arrow()) {
      this.next();
      while (this.is_id()) {
        let id = this.next();
        if (this.is_exclamation()) {
          this.next();
          ret_types.push({
            id,
            _t: "throw"
          });
        } else {
          ret_types.push({
            id,
            _t: "ret_type"
          });
        }
        this.optional_comma();
      }
    }
    return ret_types;
  }
  req_fn() {
    const name = this.req_id();
    this.symtab.insert_fn(name.v[1]);
    const params = this.maybe_fn_params();
    const ret_types = this.maybe_fn_ret_types();
    if (this.is_open_curly()) {
      this.next();
      const body = this.req_body_ret();
      const _fn = new Fn(name, params, ret_types, body);
      const n = new Node("fn", "fn", _fn);
      this.req_close_curly();
      return n;
    } else {
      this.req_asgmt();
      const body = this.req_body_ret();
      const _fn = new Fn(name, params, ret_types, body);
      const n = new Node("fn", "fn", _fn);
      return n;
    }
  }
  maybe_fields() {
    const fields = [];
    while (this.is_id()) {
      const key = new Node("id", "expr", this.req_id());
      const v2 = this.req_tannotation();
      const pair = new Pair(key, v2);
      const field = new Node("field", "", pair);
      fields.push(field);
      if (this.is_close_paren()) {
        break;
      }
      this.optional_comma();
    }
    return fields;
  }
  /* maybe_typedef() {
          const maybe_fields = () => {
              const fields = []
              if(!this.is_open_paren()) { return }
              this.next()
              while (!(this.is_eof() || this.is_close_paren())) {
                  let field_name 
                  if(this.is_id() && this.expect_colon()) { 
                      field_name = this.current 
                      this.next()
                      this.next()
                  }
                  let field
                  if(field_name) {  
                      field = new Node("field", "expr", [field_name, this.req_type()])
                  } else { 
                      field = this.maybe_expr() 
                  }
                  if(!field) { break }
                  fields.push(field) 
                  this.optional_comma()
              }
              this.req_close_paren()        
              return fields
          }
      
          const  maybe_children = () => {
              if(!this.is_dcolon()) { return }
              this.next()
              if(this.is_open_curly()) { 
                  this.next()
                  const children = []
                  while (!(this.is_eof() || this.is_close_curly())) {
                      const expr = this.maybe_expr()  // FIXME: for typedef: this should be types not exprs
                      if(!expr) { break }
                      children.push(expr) 
                      this.optional_comma()
                  }        
                  this.req_close_curly()
                  children.push()
                  return children
              } else {
                  children.push(this.req_expr())
                  return children
              }
          }
  
          if(!this.is_typedef()) { return }
          this.next()
          const id = this.req_id()
          this.symtab.insert_struct(id.v[1])
          let fields  = maybe_fields() || []
          const children = maybe_children()
          if(!(fields || children)) { return }        
          if(children) {
              const id = {v:['id','sn__'], loc:{"line":0,"column":0}}
              const t = {"id":"[","t":"t","v":{"t":{"id":"t","t":"t","v":{"t":{"v":["id","any"],"loc":{"line":0,"column":0}}}}}}
              const field = new Node("field", "expr", [id, t])
              fields.push(field)
          }
          // pprint('typedef: ')
          // pprint(fields)
          const _t = new TypeDef(id, fields, children)
          const n = new Node("type", "def", _t)
          this.ast.push(n)
  
          return true
      }
       */
  maybe_struct() {
    const maybe_fields = () => {
      const fields2 = [];
      if (!this.is_open_curly()) {
        return;
      }
      this.next();
      while (!(this.is_eof() || this.is_close_curly())) {
        let field_name;
        if (this.is_id() && this.expect_colon()) {
          field_name = this.current;
          this.next();
          this.next();
        }
        let field;
        if (field_name) {
          field = new Node("field", "def", [field_name, this.req_type()]);
        }
        if (!field) {
          const type = this.maybe_list_type();
          if (type) {
            field = new Node("field", "def", ["sn__", type]);
          }
          if (field) {
            fields2.push(field);
          }
          break;
        }
        fields2.push(field);
        this.optional_comma();
      }
      this.req_close_curly();
      return fields2;
    };
    if (!this.is_struct()) {
      return;
    }
    this.next();
    const id = this.req_id();
    this.symtab.insert_struct(id.v[1]);
    let fields = maybe_fields() || [];
    if (!fields) {
      return;
    }
    const _t = new Struct(id, fields);
    const n = new Node("struct", "def", _t);
    this.ast.push(n);
    return true;
  }
  maybe_enum() {
    const maybe_inner_type = () => {
      if (!this.is_open_paren()) {
        return;
      }
      this.next();
      let _t2 = this.maybe_type();
      this.req_close_paren();
      return _t2;
    };
    const maybe_variants = () => {
      const variants2 = [];
      if (!this.is_open_curly()) {
        return;
      }
      this.next();
      while (!(this.is_eof() || this.is_close_curly())) {
        let variant_name;
        if (this.is_id()) {
          variant_name = this.current;
          this.next();
        }
        let variant;
        if (variant_name) {
          variant = new Node("variant", "def", [variant_name, maybe_inner_type()]);
        }
        if (!variant) {
          break;
        }
        variants2.push(variant);
        this.optional_comma();
      }
      this.req_close_curly();
      return variants2;
    };
    if (!this.is_enum()) {
      return;
    }
    this.next();
    const id = this.req_id();
    this.symtab.insert_enum(id.v[1]);
    let variants = maybe_variants() || [];
    if (!variants) {
      return;
    }
    const _t = new Enum(id, variants);
    const n = new Node("enum", "def", _t);
    this.ast.push(n);
    return true;
  }
  implicit_return(_stmts) {
    if (!_stmts || _stmts.length <= 0) {
      return;
    }
    const last_index = _stmts.length - 1;
    const last = _stmts[last_index];
    if (contains$2(["when", "while", "if", "for", "return", "let", "var", "const"], last.id) || last.id === "bin" && last.v.op.v === ":=") {
      return;
    }
    if (last.id === ";") {
      return;
    }
    if (last.id === "bin" && last.v.op.v === "=") {
      return;
    }
    if (last.id === "bin" && last.v.lopr.id === "ref" && contains$2(["println", "اطبع_سطر"], last.v.lopr.v.v[1])) {
      return;
    }
    if (last.t === "expr") {
      const n = new Node("iret", "expr", last);
      return replace(_stmts, last_index, n);
    }
  }
}
class Semantic {
  ast;
  symtab;
  constructor(ast, symtab) {
    this.ast = ast;
    this.symtab = symtab;
  }
  run() {
    console.log(JSON.stringify(this.symtab.root));
  }
}
const HYPHENATED = [
  "min_width",
  "min_height",
  "background_color",
  "background_image",
  "background_position",
  "background_repeat",
  "background_size",
  "background_attachment",
  "_webkite_background_size",
  "aspect_ratio",
  "border_right",
  "border_left",
  "border_top",
  "border_bottom",
  "border_radius",
  "border_style",
  "margin_top",
  "margin_bottom",
  "margin_right",
  "margin_left",
  "align_items",
  "text_align",
  "justify_content",
  "justify_items",
  "text_justify",
  "object_fit",
  "font_size",
  "font_family",
  "box_sizing",
  "scrollbar_width",
  "user_select",
  "_ms_user_select",
  "_webkit_user_select",
  "_moz_user_select",
  "box_shadow",
  "_webkit_box_shadow",
  "_moz_box_shadow",
  "no_repeat",
  "border_box",
  "space_between",
  "flex_direction",
  "inter_word"
];
const BOOL_ATTRS = [
  "readonly"
];
const ELEMENTS_WITH_DIR = [
  "html",
  "body",
  "div",
  "span",
  "p",
  "textarea",
  "field"
];
const MAGHRIB_DIGIT$1 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
function is_maghrib_num$1(n) {
  return contains$1(MAGHRIB_DIGIT$1, n[0]);
}
function to_maghrib_num$1(n) {
  if (!is_maghrib_num$1(n)) {
    let v2 = "";
    let i = 0;
    while (i < n.length) {
      const c = n[i];
      switch (c) {
        case "٠":
          v2 += "0";
          break;
        case "١":
          v2 += "1";
          break;
        case "٢":
          v2 += "2";
          break;
        case "٣":
          v2 += "3";
          break;
        case "٤":
          v2 += "4";
          break;
        case "٥":
          v2 += "5";
          break;
        case "٦":
          v2 += "6";
          break;
        case "٧":
          v2 += "7";
          break;
        case "٨":
          v2 += "8";
          break;
        case "٩":
          v2 += "9";
          break;
        case ",":
          v2 += ".";
          break;
        default:
          panic$1();
      }
      i += 1;
    }
    return v2;
  } else {
    return n;
  }
}
function is_list$1(x) {
  return x instanceof Array;
}
function contains$1(list, el) {
  return list.includes(el);
}
function to_str$1(obj, indent) {
  let objects = [];
  const eliminateCircular = (k, v2) => {
    if (v2 && typeof v2 === "object") {
      if (objects.includes(v2)) {
        return "[CIRCULAR]";
      } else {
        objects.push(v2);
      }
    }
    return v2;
  };
  {
    return JSON.stringify(obj, eliminateCircular);
  }
}
function panic$1(v2) {
  throw new Error(v2);
}
class HtmlWriter {
  jsGen;
  constructor(jsGen) {
    jsGen.init();
    this.jsGen = jsGen;
    return this;
  }
  write_html(el, page) {
    switch (el.id) {
      case "call":
        let tag = el.v[0].v.v[1];
        let attrs = el.v[1] || [];
        let children = el.v[2] || [];
        if (tag === "br") {
          return page += "<br>";
        }
        switch (tag) {
          case "select":
            page = this.write_css(attrs, page) + "} ";
            break;
          case "font_face":
            page = this.write_css_fontface(attrs, page);
            break;
          case "keyframes":
            page = this.write_css_keyframes(attrs, children, page);
            break;
          default:
            page += `<${tag}`;
            attrs.forEach((attr, i) => {
              if (i === 0 && attr.id === "str") {
                page += ` id='${attr.v.v[1]}'`;
              } else if (attr.id === "named_arg") {
                const attr_name = attr.v[0].v[1];
                if (BOOL_ATTRS.includes(attr_name)) {
                  page += ` ${attr_name} `;
                } else {
                  page += ` ${attr_name}= `;
                  if (attr.v[1].id === "str") {
                    page += `'${attr.v[1].v.v[1]}'`;
                  } else if (attr.v[1].id === "int" || attr.v[1].id === "float") {
                    const num = attr.v[1].v[0].v[1];
                    const suffix = attr.v[1].v[1].v[1] || "";
                    page += `${num}${suffix}`;
                  } else if (attr.v[1].id === "bool") {
                    page += `${attr_name}`;
                  } else {
                    panic$1("not supported: " + to_str$1(attr));
                  }
                }
              } else {
                panic$1("not supported: " + to_str$1(attr));
              }
            });
            page += ">";
            children.forEach((c) => {
              page = this.write_html(c, page);
            });
            page += `</${tag}>`;
        }
        break;
      case "str":
        page += el.v.v[1];
        break;
      default:
        panic$1("unknown html element: " + to_str$1(el));
    }
    return page;
  }
  write_css(attrs, page) {
    attrs.forEach((attr) => {
      const k = maybe_hyphenated(attr.v[0].v[1]);
      const v2 = attr.v[1];
      if (k === "element") {
        page = this.write_css_selector(v2, page);
        page += " {";
      } else {
        page += `${k} : `;
        page = this.write_css_attr_value(v2, page);
        page += `; `;
      }
    });
    return page;
  }
  write_css_selector(v2, page) {
    if (is_list$1(v2.v)) {
      page += " ";
      v2.v.forEach((x, i) => {
        page += `${x.v.v[1]} `;
        if (i < v2.v.length - 1) {
          page += ",";
        }
      });
    } else {
      page += ` ${v2.v.v[1]}`;
    }
    return page;
  }
  write_css_attr_value(v2, page) {
    switch (v2.id) {
      case "int":
      case "float":
        const num = v2.v[0].v[1];
        const suffix = v2.v[1] && v2.v[1].v[1] || "";
        page += num + suffix;
        break;
      case "prefix":
        page += v2.v.op.v;
        page = this.write_css_attr_value(v2.v.opr, page);
        break;
      case "postfix":
        page = this.write_css_attr_value(v2.v.opr, page);
        page += v2.v.op.v;
        break;
      case "str":
        page += v2.v.v[1];
        break;
      case "ref":
        page += maybe_hyphenated(v2.v.v[1]);
        break;
      case "tuple":
        v2.v.forEach((el) => {
          page = this.write_css_attr_value(el, page + " ");
        });
        break;
      case "call":
        const ref = v2.v[0].v.v[1];
        const args = v2.v[1];
        page += ` ${ref}(`;
        args.forEach((arg) => {
          page = this.write_css_attr_value(arg, page);
        });
        page += `)`;
        break;
      case "bin":
        this.jsGen.write_expr(v2);
        const code = this.jsGen.get_code();
        page += "${" + code + "}".trim();
        break;
      default:
        panic$1(`not supported: html generations:  ${to_str$1(v2)}`);
    }
    return page;
  }
  write_css_fontface(attrs, page) {
    page += `@font-face { `;
    page = write_ar_css(attrs, page);
    page += "}";
    return page;
  }
  write_css_keyframes(attrs, children, page) {
    page += ` @keyframes ${attrs[0].v.v[1]} { `;
    children && children.forEach((c) => {
      const ref = c.v[0].v.v[1];
      const v2 = c.v[1];
      switch (ref) {
        case "at":
          const percentage = v2[0];
          const attrs2 = v2[1].v || [];
          page = this.write_css_attr_value(percentage, page);
          page += " {";
          attrs2.forEach((attr) => {
            if (attr.id === "named_tuple") {
              attr.v.forEach((el) => {
                const _k = maybe_hyphenated(el[0].v[1]);
                const _v = el[1];
                page += ` ${_k} : `;
                page = this.write_css_attr_value(_v, page);
                page += `; `;
              });
            } else {
              const _k = maybe_hyphenated(attr[0].v[1]);
              const _v = attr[1];
              page += ` ${_k} : `;
              page = this.write_css_attr_value(_v, page);
              page += `; `;
            }
          });
          page += "} ";
          break;
        default:
          panic$1("unsupported element: " + to_str$1(ref));
      }
    });
    page += "}";
    return page;
  }
}
const HTML_tag_en = {
  "صفحة_الشبكة": "html",
  "راس": "head",
  "نسق": "style",
  "متن": "body",
  "منطقة_النص": "textarea",
  "عنوان_راسي٣": "h3",
  "قسم": "div",
  "سطر": "br"
};
const HTML_attr_en = (id) => {
  switch (id) {
    case "صنف":
      return "class";
    case "اعمدة":
      return "cols";
    case "صفوف":
      return "rows";
    case "للقراءة_فقط":
      return "readonly";
    default:
      return id;
  }
};
const CSS_pseudo_en = {
  // FIXME: workaround
  "حوم": "hover"
};
const CSS_fn_en = (id) => {
  switch (id) {
    case "عند":
      return "at";
    case "ازاحة_س":
      return "translateX";
    case "عنوان":
      return "url";
    default:
      return id;
  }
};
const CSS_suffix_en = (id) => {
  switch (id) {
    case "ع_ص":
      return "px";
    case "ع_ط":
      return "vh";
    case "م_ج":
      return "rem";
    case "ث":
      return "s";
    case "٪":
      return "%";
    default:
      return id;
  }
};
const CSS_key_en = (id) => {
  switch (id) {
    case "عنصر":
      return "element";
    case "عرض":
      return "width";
    case "ادنى_عرض":
      return "min_width";
    case "ارتفاع":
      return "height";
    case "ادنى_ارتفاع":
      return "min_height";
    case "لون":
      return "color";
    case "اتجاه":
      return "direction";
    case "خلفية":
      return "background";
    case "لون_الخلفية":
      return "background_color";
    case "صورة_الخلفية":
      return "background_image";
    case "موقع_الخلفية":
      return "background_position";
    case "تكرار_الخلفية":
      return "background_repeat";
    case "ارفاق_الخلفية":
      return "background_attachment";
    case "ملائمة_العنصر":
      return "object_fit";
    case "حجم_الخلفية":
      return "background_size";
    case "_آبل_حجم_الخلفية":
      return "_webkite_background_size";
    case "فائض":
      return "overflow";
    case "عتامة":
      return "opacity";
    case "اظهار":
      return "display";
    case "هامش":
      return "margin";
    case "هامش_علوي":
      return "margin_top";
    case "هامش_سفلي":
      return "margin_bottom";
    case "هامش_ايمن":
      return "margin_right";
    case "هامش_ايسر":
      return "margin_left";
    case "بطانة":
      return "padding";
    case "تحجيم_الصندوق":
      return "box_sizing";
    case "ضبط_المحتوى":
      return "justify_content";
    case "ضبط_العناصر":
      return "justify_items";
    case "ضبط_النص":
      return "text_justify";
    case "محاذاة_العناصر":
      return "align_items";
    case "محاذاة_النص":
      return "text_align";
    case "حجم_الخط":
      return "font_size";
    case "فصيلة_الخط":
      return "font_family";
    case "فجوة":
      return "gap";
    case "حدود":
      return "border";
    case "قطر_الحدود":
      return "border_radius";
    case "نسق_الحدود":
      return "border_style";
    case "حدود_خارجية":
      return "outline";
    case "موضع":
      return "position";
    case "تحريك":
      return "animation";
    case "تحول":
      return "transform";
    case "اعادة_تحجيم":
      return "resize";
    case "مصدر":
      return "src";
    case "نسبة_س_ص":
      return "aspect_ratio";
    case "مرن_باتجاه":
      return "flex_direction";
    case "شريط_التمرير_عرض":
      return "scrollbar_width";
    case "قدرة_اختيار_النص":
      return "user_select";
    case "_مايكروسوفت_قدرة_اختيار_النص":
      return "_ms_user_select";
    case "_آبل_قدرة_اختيار_النص":
      return "_webkit_user_select";
    case "_موزيلا_قدرة_اختيار_النص":
      return "_moz_user_select";
    case "خيال_الصندوق":
      return "box_shadow";
    case "_آبل_خيال_الصندوق":
      return "_webkit_box_shadow";
    case "_موزيلا_خيال_الصندوق":
      return "_moz_box_shadow";
    default:
      return id;
  }
};
const CSS_value_en = (id) => {
  switch (id) {
    case "تلقائي":
      return "auto";
    case "حدود_الصندوق":
      return "border_box";
    case "بلا_قيمة":
      return "none";
    case "مطلق":
      return "absolute";
    case "مرن":
      return "flex";
    case "مخفي":
      return "hidden";
    case "مركز":
      return "center";
    case "مسافة_بين":
      return "space_between";
    case "بداية":
      return "start";
    case "نهاية":
      return "end";
    case "بارز":
      return "ridge";
    case "لا_نهاية":
      return "infinite";
    case "لا_تكرار":
      return "no_repeat";
    case "احتواء":
      return "contain";
    case "قطع":
      return "clip";
    case "ضعف":
      return "double";
    case "ضبط":
      return "justify";
    case "بين_الكلمات":
      return "inter_word";
    case "مهم":
      return "important";
    case "غير_مهم":
      return "!important";
    case "مثبت":
      return "fixed";
    case "من_اليمين":
      return "rtl";
    case "عمودي":
      return "column";
    case "افقي":
      return "row";
    case "سماوي_فاتح":
      return "lightskyblue";
    case "ابيض":
      return "white";
    case "اصفر":
      return "yellow";
    case "اسود":
      return "black";
    case "برتقالي":
      return "orange";
    default:
      return id;
  }
};
const CSS_str_en = (id) => {
  switch (id) {
    case "متن":
      return "body";
    case "صفحة_الشبكة":
      return "html";
    default:
      return id;
  }
};
class ArHtmlWriter {
  jsGen;
  constructor(jsGen) {
    jsGen.init();
    this.jsGen = jsGen;
    return this;
  }
  write_ar_html(el, page) {
    switch (el.id) {
      case "call":
        const id = el.v[0].v.v[1];
        const tag = HTML_tag_en[id] || id;
        const attrs = el.v[1] || [];
        const children = el.v[2] || [];
        if (tag === "br") {
          return page += "<br>";
        }
        switch (tag) {
          case "اختر":
            page = this.write_ar_css(attrs, page) + "} ";
            break;
          case "عرف_خط":
            page = this.write_ar_css_fontface(attrs, page);
            break;
          case "اطارات_رئيسية":
            page = this.write_ar_css_keyframes(attrs, children, page);
            break;
          default:
            page += `<${tag}`;
            if (ELEMENTS_WITH_DIR.includes(tag)) {
              page += ` dir='rtl'`;
            }
            attrs.forEach((attr, i) => {
              if (i === 0 && attr.id === "str") {
                page += ` id='${attr.v.v[1]}'`;
              } else if (attr.id === "named_arg") {
                const attr_name = HTML_attr_en(attr.v[0].v[1]);
                if (BOOL_ATTRS.includes(attr_name)) {
                  page += ` ${attr_name} `;
                } else {
                  page += ` ${attr_name}= `;
                  if (attr.v[1].id === "str") {
                    page += `'${attr.v[1].v.v[1]}'`;
                  } else if (attr.v[1].id === "int" || attr.v[1].id === "float") {
                    const num = to_maghrib_num$1(attr.v[1].v[0].v[1]);
                    const suffix = attr.v[1].v[1] ? CSS_suffix_en(attr.v[1].v[1].v[1]) || "" : "";
                    page += `${num}${suffix}`;
                  } else if (attr.v[1].id === "bool") {
                    page += `${HTML_attr_en(attr_name)}`;
                  } else {
                    panic$1("not supported: " + to_str$1(attr));
                  }
                }
              } else {
                panic$1("not supported: " + to_str$1(attr));
              }
            });
            page += ">";
            children.forEach((c) => {
              page = this.write_ar_html(c, page);
            });
            page += `</${tag}>`;
        }
        break;
      case "str":
        page += el.v.v[1];
        break;
      default:
        panic$1("unknown html element: " + to_str$1(el));
    }
    return page;
  }
  write_ar_css(attrs, page) {
    attrs.forEach((attr) => {
      const k = maybe_hyphenated(CSS_key_en(attr.v[0].v[1]));
      const v2 = attr.v[1];
      if (k === "element") {
        page = this.write_ar_css_selector(v2, page);
        page += " {";
      } else {
        page += `${k} : `;
        page = this.write_ar_css_attr_value(v2, page);
        page += `; `;
      }
    });
    return page;
  }
  write_ar_css_selector(v2, page) {
    const translate = (path) => {
      const get_regexp = (k) => RegExp(`(?<![p{L}\\p{N}_])${k}(?![\\p{L}\\p{N}_])`, "ug");
      Object.keys(HTML_tag_en).forEach((k) => {
        path = path.replaceAll(get_regexp(k), HTML_tag_en[k]);
      });
      Object.keys(CSS_pseudo_en).forEach((k) => {
        path = path.replaceAll(get_regexp(k), CSS_pseudo_en[k]);
      });
      return path;
    };
    if (is_list$1(v2.v)) {
      page += " ";
      v2.v.forEach((selector, i) => {
        let path = selector.v.v[1];
        page += translate(path);
        if (i < v2.v.length - 1) {
          page += ",";
        }
      });
    } else {
      const path = v2.v.v[1];
      page += translate(path);
    }
    return page;
  }
  write_ar_css_attr_value(v2, page) {
    switch (v2.id) {
      case "bool":
        panic$1();
        break;
      case "int":
      case "float":
        const num = to_maghrib_num$1(v2.v[0].v[1]);
        const suffix = CSS_suffix_en(v2.v[1] && v2.v[1].v[1]) || "";
        page += num + suffix;
        break;
      case "prefix":
        page += v2.v.op.v;
        page = this.write_ar_css_attr_value(v2.v.opr, page);
        break;
      case "postfix":
        page = this.write_ar_css_attr_value(v2.v.opr, page);
        page += v2.v.op.v;
        break;
      case "str":
        page += CSS_str_en(v2.v.v[1]);
        break;
      case "ref":
        page += maybe_hyphenated(CSS_value_en(v2.v.v[1]));
        break;
      case "tuple":
        v2.v.forEach((el) => {
          page = this.write_ar_css_attr_value(el, page + " ");
        });
        break;
      case "call":
        const ref = CSS_fn_en(v2.v[0].v.v[1]);
        const args = v2.v[1];
        page += ` ${ref}(`;
        args.forEach((arg) => {
          page = this.write_ar_css_attr_value(arg, page);
        });
        page += `)`;
        break;
      case "bin":
        this.jsGen.write_expr(v2);
        const code = this.jsGen.get_code();
        page += "${" + code + "}".trim();
        break;
      default:
        panic$1(`not supported: html generations:  ${to_str$1(v2)}`);
    }
    return page;
  }
  write_ar_css_fontface(attrs, page) {
    page += `@font-face { `;
    page = this.write_ar_css(attrs, page);
    page += "}";
    return page;
  }
  write_ar_css_keyframes(attrs, children, page) {
    page += ` @keyframes ${attrs[0].v.v[1]} { `;
    children && children.forEach((c) => {
      const ref = c.v[0].v.v[1];
      const v2 = CSS_value_en(c.v[1]);
      switch (ref) {
        case "عند":
          const percentage = v2[0];
          const attrs2 = v2[1].v || [];
          page = this.write_ar_css_attr_value(percentage, page);
          page += " {";
          attrs2.forEach((attr) => {
            if (attr.id === "named_tuple") {
              attr.v.forEach((el) => {
                const _k = maybe_hyphenated(CSS_key_en(el[0].v[1]));
                const _v = CSS_value_en(el[1]);
                page += ` ${_k} : `;
                page = this.write_ar_css_attr_value(_v, page);
                page += `; `;
              });
            } else {
              const _k = maybe_hyphenated(CSS_key_en(attr[0].v[1]));
              const _v = CSS_value_en(attr[1]);
              page += ` ${_k} : `;
              page = this.write_ar_css_attr_value(_v, page);
              page += `; `;
            }
          });
          page += "} ";
          break;
        default:
          panic$1("unsupported element: " + to_str$1(ref));
      }
    });
    page += "}";
    return page;
  }
}
function maybe_hyphenated(id) {
  if (HYPHENATED.includes(id)) {
    return id.replaceAll("_", "-");
  } else {
    return id;
  }
}
const MAGHRIB_DIGIT = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
function is_maghrib_num(n) {
  return contains(MAGHRIB_DIGIT, n[0]);
}
function to_maghrib_num(n) {
  if (!is_maghrib_num(n)) {
    let v2 = "";
    let i = 0;
    while (i < n.length) {
      const c = n[i];
      switch (c) {
        case "٠":
          v2 += "0";
          break;
        case "١":
          v2 += "1";
          break;
        case "٢":
          v2 += "2";
          break;
        case "٣":
          v2 += "3";
          break;
        case "٤":
          v2 += "4";
          break;
        case "٥":
          v2 += "5";
          break;
        case "٦":
          v2 += "6";
          break;
        case "٧":
          v2 += "7";
          break;
        case "٨":
          v2 += "8";
          break;
        case "٩":
          v2 += "9";
          break;
        case ",":
          v2 += ".";
          break;
        default:
          panic();
      }
      i += 1;
    }
    return v2;
  } else {
    return n;
  }
}
function is_list(x) {
  return x instanceof Array;
}
function contains(list, el) {
  return list.includes(el);
}
function to_str(obj, indent) {
  let objects = [];
  const eliminateCircular = (k, v2) => {
    if (v2 && typeof v2 === "object") {
      if (objects.includes(v2)) {
        return "[CIRCULAR]";
      } else {
        objects.push(v2);
      }
    }
    return v2;
  };
  {
    return JSON.stringify(obj, eliminateCircular);
  }
}
function panic(v2) {
  throw new Error(v2);
}
function repeat(str, times) {
  return str.repeat(times);
}
const HELPERS = `
//------------------------------------------------------------------------------
// js helper functions injected to workaround missing seen features that are yet to be added.
function is_none(x) { return x == null }        
function is_list(x) { return x instanceof Array }
function replace(array, i, v) {  array[i] = v }
function to_int(str) { return parseInt(str) }
function assign(x,y) { x = y }
function concat(x,y,id) { x[id] = x[id].concat(y[id]) }
function del(array, i) { delete array[i] }
function regexp(expr) { return RegExp(expr, 'ug') }
function match_regexp(v, expr) {return expr.exec(v) }
function print(v) { throw new Error('print() is not implemeted')}
function اطبع_سطر(v) { println(v) }
function println(v) {         
    if(v == null ) { console.log("undefined") } else { console.log(v) }
}
function panic(v) { throw new Error(v)}
function clone(obj) { return {...obj} }
function contains(list, el) { return list.includes(el) }
function is_empty(list) { return Array.isArray(list) && list.length === 0 }
function اطبع_تفاصيل(obj, indent) { pprint(obj, indent) }
function pprint(obj, indent) { 
    if( obj == null ) {
        console.log("undefined")
    } else {
        if(indent) {
            console.log(JSON.stringify(obj, null, indent)) 
        } else {
            console.log(JSON.stringify(obj)) 
        }       
    }
}
function to_str(obj, indent) { 
let objects = []
function eliminateCircular(k, v) {
    if (v && typeof v === 'object') {
        if (objects.includes(v)) { return "[CIRCULAR]" } else { objects.push(v) }
    }
    return v
}
if(indent) {
    return JSON.stringify(obj, eliminateCircular, indent)
} else {
    return JSON.stringify(obj, eliminateCircular)
}
}
function repeat(str, times) { return str.repeat(times) }
function c0_to_uppercase(str){ return str.charAt(0).toUpperCase() + str.slice(1) }
function to_lowercase(str) {return str.toLowerCase()}
function عرض_اولي(code, preview_id){ preview(code, preview_id) }
function preview(code, preview_id) { window.parent.document.querySelector(preview_id).srcdoc = code }
function هات_الافرع(س) {
    return س.children
}
function اختر(س,دالة) {
    return س.filter(دالة)
}
function هات(ق,فهرس) { return ق[فهرس]}
function عدد_العناصر(ق) { return ق.length}
async function read_url(url) {
    const response = await fetch(url);
    return response.text()
}

//------------------------------------------------------------------------------
`;
const AR_ID = {
  "بدء": "main",
  "اطبع_سطر": "println",
  "تعبير_نمطي": "regex",
  "هذا": "this",
  "مشيّد": "constructor",
  "انهاء": "panic"
};
const SPACES = 4;
class JSGen {
  current;
  indent_level;
  stack;
  astructs;
  ast;
  symtab;
  html_gen;
  main_args;
  opts;
  runtime;
  current_instance;
  init(lang, ast, symtab, html_gen, main_args, opts) {
    this.current = "";
    this.indent_level = 0;
    this.stack = [];
    this.astructs = [];
    this.ast = ast;
    this.symtab = symtab;
    this.html_gen = html_gen;
    this.main_args = main_args;
    this.opts = opts;
    this.current_instance = null;
  }
  init_with_HTML(lang, html_gen, ast, symtab, main_args, opts) {
    this.init(lang, ast, symtab, html_gen, main_args, opts);
    this.html_gen = html_gen;
  }
  init_with_runtime(lang, runtime, ast, symtab, main_args, opts) {
    this.init(lang, ast, symtab, null, main_args, opts);
    this.runtime = runtime;
  }
  run() {
    this.strict_mode();
    let main;
    let i = 0;
    while (i < this.ast.length) {
      const n = this.ast[i];
      if (n) {
        const v2 = n.v;
        switch (n.id) {
          case "use":
            this.write_use(v2);
            break;
          case "modif":
            this.write_modifier(v2);
            break;
          case "main":
            main = v2;
            break;
          case "const":
            this.write_const(v2);
            break;
          case "fn":
            this.write_fn(v2);
            break;
          case "struct":
            this.write_struct(v2);
            break;
          case "enum":
            this.write_enum(v2);
            break;
          case "receiver":
            break;
          default:
            panic("unsupported node: " + this.ast[i].id);
        }
      }
      i += 1;
    }
    this.write_helper_fns();
    if (main) {
      this.write_main(main);
    }
    const code = this.get_code();
    return code;
  }
  to_en_id(id) {
    if (!id.v && !is_list(id.v)) {
      return;
    }
    if (AR_ID[id.v[1]]) {
      id.v[1] = AR_ID[id.v[1]];
    }
  }
  push() {
    this.stack.push(this.current);
    this.current = "";
  }
  pop() {
    this.current = this.stack.pop() + this.current;
  }
  pop_prepend() {
    this.current = this.current + this.stack.pop();
  }
  prepend(code) {
    this.current = code + this.current;
  }
  append(code) {
    this.current += code;
  }
  appendi(code) {
    this.current += this.spaces();
    this.current += code;
  }
  spaces(level) {
    if (!level) {
      level = this.indent_level;
    }
    return repeat(" ", level * SPACES);
  }
  strict_mode() {
    this.append('"use strict";\n\n');
  }
  write_id_pat(id) {
    const v2 = id.v.v[1];
    this.append(v2 === "_" ? "default" : v2);
  }
  write_char_pat(c) {
    this.append("'" + c.v.v[1] + "'");
  }
  write_str_pat(str) {
    this.append('"' + str.v.v[1] + '"');
  }
  write_tuple_pat(tuple) {
    this.append("(");
    let i = 0;
    while (i < tuple.v.length) {
      this.write_pat(tuple.v[i]);
      if (i < tuple.v.length - 1) {
        this.append(", ");
      }
      i += 1;
    }
    this.append(")");
  }
  write_pat(p) {
    switch (p.id) {
      case "id":
        this.write_id_pat(p);
        break;
      case "bool":
        this.append(p.v.v[1]);
        break;
      case "int":
      case "float":
        this.append(to_maghrib_num(p.v.v[1][0]));
        break;
      case "char":
        this.write_char_pat(p);
        break;
      case "str":
        this.write_str_pat(p);
        break;
      case "tuple":
        this.write_tuple_pat(p);
        break;
      case "_":
        this.append("default");
        break;
      default:
        panic("unsupported pattern " + to_str(p));
    }
  }
  write_modifier(n) {
    if (this.opts.ignore_export) {
      return;
    }
    if (n.v === "+") {
      this.appendi("export ");
    }
  }
  write_use(n) {
    return;
  }
  write_main(_fn) {
    this.push();
    this.appendi("(");
    this.write_fn(_fn, this.main_args);
    this.appendi(")()\n");
    this.pop();
  }
  write_params(params) {
    this.append("(");
    let i = 0;
    while (i < params.length) {
      if (i > 0) {
        this.append(", ");
      }
      this.write_pat(params[i].v._pat);
      i += 1;
    }
    this.append(")");
  }
  write_do_block(block) {
    this.append(`(()=>`);
    this.write_block(block);
    this.append(`)() 
`);
  }
  write_block(block) {
    this.append(" {\n");
    this.push();
    this.indent_level += 1;
    let i = 0;
    const length = block.v.length;
    while (i < length) {
      const stmt = block.v[i];
      this.write_stmt(stmt);
      i += 1;
    }
    this.pop();
    this.indent_level -= 1;
    this.appendi("}\n");
  }
  write_fn(_fn, main_args) {
    this.push();
    if (_fn.t === "fn") {
      this.appendi("static ");
    }
    this.to_en_id(_fn.name);
    if (_fn.is_async) {
      this.append("async ");
    }
    this.append("function " + _fn.name.v[1]);
    if (main_args) {
      this.append("()");
    } else {
      this.write_params(_fn.params);
    }
    this.write_body(_fn.body, _fn.name === "main", main_args);
    this.pop();
  }
  write_method(_fn, instance) {
    this.push();
    this.to_en_id(_fn.name);
    if (_fn.is_async) {
      this.append("async ");
    }
    this.append(_fn.name.v[1]);
    this.write_params(_fn.params);
    this.current_instance = instance;
    this.write_body(_fn.body, false);
    this.current_instance = null;
    this.pop();
  }
  write_fields(fields) {
    const ids = [];
    fields.forEach((field) => {
      console.log(JSON.stringify(field));
      const id = field.v[0].v[1];
      ids.push(id);
    });
    ids.forEach((id) => {
      this.appendi(this.spaces() + "" + id + "\n");
    });
    this.write_init(ids);
  }
  write_init(ids) {
    this.append("\n");
    this.appendi("constructor(");
    let i = 0;
    while (i < ids.length) {
      this.append(ids[i]);
      if (i < ids.length - 1) {
        this.append(", ");
      }
      i += 1;
    }
    this.append(") {\n");
    this.indent_level += 1;
    i = 0;
    while (i < ids.length) {
      this.appendi("this." + ids[i] + " = " + ids[i] + "\n");
      i += 1;
    }
    this.appendi("return this\n");
    this.indent_level -= 1;
    this.appendi("}\n");
  }
  // write_typedef(_typedef) {
  //     this.appendi("class " + _typedef.name.v[1] + " {\n")
  //     this.indent_level += 1
  //     if(_typedef.fields) { this.write_fields(_typedef.fields) }
  //     let fns = this.symtab.receivers[_typedef.name.v[1]]
  //     fns && fns.forEach( (data) => {
  //         const fn = data[0]
  //         const instance = data[1]
  //         this.write_method(fn.v, instance) // FIXME: names are confusing , write_fn is handling fn.v, not fn 
  //     })
  //     this.append('child(x) { return this.children[x] }')
  //     this.append('children() { return this.children }')
  //     this.indent_level -= 1
  //     this.appendi("}\n\n")
  // }
  write_struct(_struct) {
    this.appendi("class " + _struct.name.v[1] + " {\n");
    if (_struct.fields) {
      this.write_fields(_struct.fields);
    }
    let fns = this.symtab.receivers[_struct.name.v[1]];
    fns && fns.forEach((data) => {
      const fn = data[0];
      const instance = data[1];
      this.write_method(fn.v, instance);
    });
    this.append("sn__(x) { return this.sn__[x] }");
    this.append("sn__() { return this.sn__}");
    this.appendi("}\n\n");
  }
  write_enum(_enum) {
    panic("enum is not implemented yet.");
  }
  write_const(_const) {
    this.appendi("const ");
    this.write_pat(_const.lhs);
    this.append(" = ");
    this.write_expr(_const.rhs);
    this.append("\n");
  }
  write_var(_var) {
    this.appendi("let ");
    this.write_pat(_var.lhs);
    if (_var.rhs) {
      this.append(" = ");
      this.write_expr(_var.rhs);
    }
    this.append("\n");
  }
  write_ret(n) {
    this.append("return ");
    if (n.v) {
      this.write_expr(n.v);
    }
  }
  write_break(expr) {
    this.append("break");
  }
  write_stmt(stmt) {
    if (stmt.t === "expr") {
      this.appendi("");
      this.write_expr(stmt);
      this.append("\n");
    } else if (stmt.id === "const") {
      this.write_const(stmt.v);
    } else if (stmt.id === "var") {
      this.write_var(stmt.v);
    } else if (stmt.id === "break") {
      this.write_break(stmt);
    } else {
      panic("cannot write stmt: " + to_str(stmt));
    }
  }
  write_body(body, is_main, main_args) {
    this.append(" {\n");
    this.push();
    this.indent_level += 1;
    if (main_args) {
      for (const [k, v2] of Object.entries(main_args)) {
        this.append(`const ${k} = '${v2}'
`);
      }
    }
    let i = 0;
    const length = body.v.length;
    while (i < length) {
      const stmt = body.v[i];
      this.write_stmt(stmt);
      i += 1;
    }
    this.pop();
    this.indent_level -= 1;
    this.appendi("}\n");
  }
  write_id(id) {
    this.append(id.v[1]);
  }
  write_ref(expr) {
    const _ref = expr.v.v[1];
    if (_ref === this.current_instance) {
      this.append("this");
    } else {
      this.append(_ref);
    }
  }
  write_str(expr) {
    const str = expr.v.v[1];
    const symbol2 = str.indexOf("${") === -1 ? '"' : "`";
    this.append(symbol2 + str + symbol2);
  }
  write_str_id(expr) {
    this.append(symbol + expr.v.v[1] + symbol);
  }
  is_call(expr) {
    return expr.v.id === "bin" && expr.v.v.op.v === "(";
  }
  write_iret(expr) {
    if (!(contains(["when", "while", "if", "for", "return"], expr.v.node) || expr.v.t === "()" || expr.v.t === "void" || expr.v.t === "" || this.is_call(expr) || expr.semicolon)) {
      this.append("return ");
    }
    if (this.is_call(expr)) {
      this.append("const temp_seen_var = ");
      this.write_expr(expr.v);
      this.append("\n");
      this.append("return temp_seen_var");
    } else {
      this.write_expr(expr.v);
    }
  }
  write_list(expr) {
    this.append("[");
    let i = 0;
    const length = expr.v.length;
    while (i < length) {
      this.write_expr(expr.v[i]);
      if (i < expr.v.length - 1) {
        this.append(", ");
      }
      i += 1;
    }
    this.append("]");
  }
  write_structl(expr) {
    const fields = expr.v;
    this.append("{");
    let i = 0;
    while (i < fields.length) {
      const field = fields[i];
      const key = field.k;
      if (key.v.v[1]) {
        this.write_id(key.v);
      } else {
        this.write_str_id(key.v);
      }
      const value = field.v;
      this.append(": ");
      this.write_expr(value);
      if (i < fields.length - 1) {
        this.append(", ");
      }
      i += 1;
    }
    this.append("}");
  }
  write_args(expr) {
    this.append("(");
    let i = 0;
    while (i < expr.v.length) {
      let _expr = expr.v[i];
      if (_expr.v.op && _expr.v.op.v === ":") {
        _expr = _expr.v.ropr;
      }
      this.write_expr(_expr);
      if (i < expr.v.length - 1) {
        this.append(", ");
      }
      i += 1;
    }
    this.append(")");
  }
  write_named_arg(narg) {
    narg.v[0].v[1];
    const v2 = narg.v[1];
    this.write_expr(v2);
  }
  write_tuple(expr) {
    this.append("[");
    let i = 0;
    while (i < expr.v.length) {
      let arg = expr.v[i];
      if (arg.id === "narg") {
        arg = expr.v[i].v[1];
      }
      this.write_expr(arg);
      if (i < expr.v.length - 1) {
        this.append(", ");
      }
      i += 1;
    }
    this.append("]");
  }
  write_named_tuple(expr) {
    this.append("{");
    expr.v.forEach((pair, i) => {
      const k = pair[0].v[1];
      const v2 = pair[1];
      this.append(k);
      this.append(": ");
      this.write_expr(v2);
      if (i < expr.v.length) {
        this.append(",");
      }
    });
    this.append("}");
  }
  write_when(expr) {
    this.appendi("switch(");
    this.write_expr(expr.v.expr);
    this.append(") {\n");
    this.indent_level += 1;
    let i = 0;
    while (i < expr.v.arms.length) {
      const arm = expr.v.arms[i];
      const pats = arm.v.pats;
      const _expr = arm.v.expr;
      let j = 0;
      while (j < pats.length) {
        if (pats[j].id !== "_") {
          this.appendi("case ");
        }
        this.write_pat(pats[j]);
        this.append(" :\n");
        j += 1;
      }
      this.indent_level += 1;
      this.appendi("");
      this.write_expr(_expr);
      this.append("\n");
      this.appendi("break\n");
      this.indent_level -= 1;
      i += 1;
    }
    this.indent_level -= 1;
    this.appendi("}\n");
  }
  write_prefix_uni(expr) {
    const op = expr.v.op.v;
    switch (op) {
      case ".":
        {
          if (expr.v.opr.v.v[1] === "none") {
            this.append("null");
            return;
          } else {
            panic("enum variants are not supported, found : (." + expr.v.opr.v.v[1] + ")");
          }
        }
        break;
      case "not":
        this.append("!");
        break;
      case "!":
      case "-":
        this.append(op);
        break;
      default:
        panic("unsupported op: " + op);
        break;
    }
    this.write_expr(expr.v.opr);
  }
  write_pipe(stack) {
    while (stack.length > 0) {
      let expr = stack.pop();
      switch (expr.id) {
        case "ref":
          this.write_expr(expr);
          if (stack.length > 0) {
            this.append("(");
            this.write_pipe(stack);
            this.append(")");
          }
          break;
        case "call":
          const lhs = expr.v[0];
          const rhs = expr.v[1];
          this.write_expr(lhs);
          this.append("(");
          this.write_pipe(stack);
          if (this.current.slice(-1) !== "(" && rhs.length > 0) {
            this.append(", ");
          }
          rhs.forEach((el, i) => {
            this.write_expr(el);
            if (i < rhs.length - 1) {
              this.append(", ");
            }
          });
          this.append(")");
          break;
        case "int":
        case "float":
        case "str":
        case "[":
        case "tuple":
        case "named_tuple":
          this.write_expr(expr);
          break;
        default:
          throw new Error("syntax error |> :" + to_str(expr));
      }
    }
  }
  write_runtime_fn() {
  }
  write_call(expr) {
    const runtime_impl = this.runtime && this.runtime.get_fn(expr);
    if (runtime_impl) {
      if (runtime_impl._import) {
        this.prepend(runtime_impl._import);
      }
      this.append(runtime_impl.code);
      return;
    }
    this.to_en_id(expr.v[0].v);
    if (expr.v[0].v.v[1] === "html") {
      const page = this.html_gen.en.write_html(expr, "");
      this.append(` (() => \`${page}\`)() `);
      return;
    } else if (expr.v[0].v.v[1] === "صفحة_الشبكة") {
      const page = this.html_gen.ar.write_ar_html(expr, "");
      this.append(`(() => \`${page}\`)()`);
      return;
    } else if (this.symtab.structs.includes(expr.v[0].v.v[1])) {
      this.append("new ");
    }
    this.write_expr(expr.v[0]);
    this.append("(");
    const args = expr.v[1];
    if (args) {
      args.forEach((arg, i) => {
        this.write_expr(arg);
        if (i < args.length - 1) {
          this.append(", ");
        }
      });
    }
    if (expr.v[2]) {
      if (args) {
        this.append(", ");
      }
      this.write_children(expr.v[2]);
    }
    this.append(")");
  }
  write_children(block) {
    if (!block || block.length === 0) {
      return;
    }
    this.append("[");
    block.forEach((expr) => {
      this.write_expr(expr);
      this.append(",");
    });
    this.append("]");
  }
  write_bin(expr) {
    const op = expr.v.op.v;
    switch (op) {
      case "[":
        {
          this.write_expr(expr.v.lopr);
          this.append("[");
          this.write_expr(expr.v.ropr);
          this.append("]");
        }
        break;
      case "=":
        {
          this.write_expr(expr.v.lopr);
          this.append("=");
          this.write_expr(expr.v.ropr);
        }
        break;
      case ":=":
        {
          this.append("let ");
          this.write_expr(expr.v.lopr);
          this.append(" = ");
          this.write_expr(expr.v.ropr);
          this.append("\n");
        }
        break;
      case "::":
        {
          this.appendi("const ");
          this.write_expr(expr.v.lopr);
          this.append(" = ");
          this.write_expr(expr.v.ropr);
          this.append("\n");
        }
        break;
      case ":":
        {
          this.appendi("let ");
          this.write_expr(expr.v.lopr);
          this.append("\n");
        }
        break;
      case "|>": {
        let stack = [];
        let lhs = expr.v.lopr;
        let rhs = expr.v.ropr;
        while (true) {
          stack.push(lhs);
          if (rhs.id === "bin" && rhs.v.op.v === "|>") {
            lhs = rhs.v.lopr;
            rhs = rhs.v.ropr;
          } else {
            stack.push(rhs);
            break;
          }
        }
        this.write_pipe(stack);
        break;
      }
      case "||>":
        throw new Error(" ||> : WIP , " + to_str(expr));
      case ":>":
        throw new Error(" :> : WIP , " + to_str(expr));
      case "==":
      case "!=":
      case "<":
      case "<=":
      case ">":
      case ">=":
      case "|":
      case "||":
      case "&":
      case "&&":
      case "+":
      case "-":
      case "/":
      case "*":
      case "+=":
      case "-=":
      case "*=":
      case "\\=":
      case ".":
        {
          this.write_expr(expr.v.lopr);
          this.append(op);
          if (op === "==" || op === "!=") {
            this.append("=");
          }
          this.write_expr(expr.v.ropr);
        }
        break;
      default:
        panic("cannot write binary operation: " + to_str(expr));
        break;
    }
  }
  write_afn(expr) {
    this.push();
    this.write_params(expr.v.params);
    this.append("=>");
    this.write_body(expr.v.body);
    this.pop();
  }
  write_expr(expr) {
    if (expr.grouped) {
      this.append("(");
    }
    switch (expr.id) {
      case "void":
        this.append("null");
        break;
      case ";":
        break;
      case "ref":
        this.write_ref(expr);
        break;
      case "bool":
        this.append(expr.v.v[1]);
        break;
      case "int":
      case "float":
        this.append(to_maghrib_num(expr.v[0].v[1]));
        break;
      case "char":
        this.append("'" + expr.v.v[1] + "'");
        break;
      case "str":
        this.write_str(expr);
        break;
      case "return":
        this.write_ret(expr);
        break;
      case "iret":
        this.write_iret(expr);
        break;
      case "[":
        this.write_list(expr);
        break;
      case "{":
        this.write_structl(expr);
        break;
      case "args":
        this.write_args(expr);
        break;
      case "named_arg":
        this.write_named_arg(expr);
        break;
      case "tuple":
        this.write_tuple(expr);
        break;
      case "named_tuple":
        this.write_named_tuple(expr);
        break;
      case "when":
        this.write_when(expr);
        break;
      case "do_block":
        this.write_do_block(expr);
        break;
      case "block":
        this.write_block(expr);
        break;
      case "prefix":
        this.write_prefix_uni(expr);
        break;
      case "call":
        this.write_call(expr);
        break;
      case "bin":
        this.write_bin(expr);
        break;
      case "afn":
        this.write_afn(expr);
        break;
      default:
        panic("cannot write expr: " + to_str(expr));
    }
    if (expr.grouped) {
      this.append(")");
    }
  }
  write_helper_fns() {
    this.append(HELPERS);
  }
  get_code() {
    return this.current;
  }
}
class HtmlCssJSGen {
  run(lang, ast, symtab, main_args, opts) {
    const en_html = new HtmlWriter(new JSGen());
    const ar_html = new ArHtmlWriter(new JSGen());
    const html_gen = {
      en: en_html,
      ar: ar_html
    };
    const js_gen = new JSGen();
    js_gen.init(
      lang,
      ast,
      symtab,
      html_gen,
      main_args,
      opts
    );
    return js_gen.run();
  }
}
class Gen {
  ast;
  symtab;
  main_args;
  target;
  target_opts;
  lang;
  init(ast, symtab, main_args, target, target_opts) {
    this.ast = ast;
    this.symtab = symtab;
    this.main_args = main_args;
    this.target = target;
    this.target_opts = target_opts;
  }
  // FIXME: setting lang separately , to avoid breaking the code for current release ,
  //              need to refactor later.
  set_lang(lang) {
    this.lang = lang;
  }
  async run() {
    let gen;
    const target = to_lowercase(this.target);
    if (target === "js") {
      gen = new HtmlCssJSGen();
    } else if (SUPPORTED_GEN.includes(target)) {
      const { default: Gen2 } = await import(url.pathToFileURL(this.target_opts.deps.path));
      gen = new Gen2();
    } else {
      panic$2('target "' + this.target + '" is not supported');
    }
    return gen.run(
      this.lang || en,
      this.ast,
      this.symtab,
      this.main_args,
      this.target_opts
    );
  }
}
class Compiler {
  src;
  main_args;
  target;
  target_opts;
  lang;
  tokens;
  ast;
  symtab;
  gen_code;
  init(src, main_args, lang, target_opts) {
    this.src = src;
    this.main_args = main_args;
    this.target = target_opts && target_opts.target || "js";
    this.target_opts = target_opts || {};
    this.lang = lang || "en";
  }
  init_ar(src, main_args, target_opts) {
    return this.init(src, main_args, "ar", target_opts);
  }
  async get_code() {
    if (!this.gen_code) {
      await this.run();
    }
    return this.gen_code;
  }
  async run() {
    this.scan(true);
    this.parse();
    await this.generate(this.target);
  }
  scan(ignore_cmts_ws) {
    const lexer = new Lexer();
    lexer.init(this.lang, this.src, ignore_cmts_ws);
    lexer.run();
    this.tokens = lexer.tokens;
    if (!is_empty(lexer.errs)) {
      pprint(lexer.errs);
      panic$2("");
    }
  }
  parse() {
    const parser = new Parser();
    parser.init(this.tokens);
    parser.run();
    this.ast = parser.ast;
    this.symtab = parser.symtab;
    if (!is_empty(parser.errs)) {
      pprint(parser.errs);
      panic$2("");
    }
  }
  semantic() {
    const semantic = new Semantic(this.ast, this.symtab);
    semantic.run();
    if (!is_empty(semantic.errs)) {
      pprint(semantic.errs);
      panic$2("");
    }
  }
  async generate(target) {
    const gen = new Gen();
    gen.init(this.ast, this.symtab, this.main_args, target, this.target_opts);
    gen.set_lang(this.lang);
    this.gen_code = await gen.run();
  }
}
export {
  Compiler
};
