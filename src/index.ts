import { Interpreter } from "./core/interpreter";
import { Lexer } from "./core/lexer";
import { Parser } from "./core/parser";

import fs from "fs";

import InputExtension from "./extensions/InputExtension";
import UtilsExtension from "./extensions/Utils";
import MathExtension from "./extensions/Math";
import DateExtension from "./extensions/Date";
import HttpExtension from "./extensions/Http";

// Lê o código do arquivo
const code = fs.readFileSync("src/test/script.vl", "utf-8");

const lexer = new Lexer(code);
const tokens = lexer.tokenize();

//console.log(tokens);

const parser = new Parser(tokens);
const ast = parser.parse();

//console.log("AST:", JSON.stringify(ast, null, 2));

const interpreter = new Interpreter(ast);

interpreter.registerExentension(new MathExtension());
interpreter.registerExentension(new InputExtension());
interpreter.registerExentension(new UtilsExtension());
interpreter.registerExentension(new DateExtension());
interpreter.registerExentension(new HttpExtension());

try {
  interpreter.run();
} catch (error) {
  console.log(error);
}
