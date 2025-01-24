import { MathExtension } from "./extensions/Math";
import { Interpreter } from "./core/interpreter";
import { Lexer } from "./core/lexer";
import { Parser } from "./core/parser";

const code = `
var pessoa = {
  nome: "Vitor"
};

print(pessoa.nome);
`;

const lexer = new Lexer(code);
const tokens = lexer.tokenize();

console.log(tokens);

const parser = new Parser(tokens);
const ast = parser.parse();

console.log("AST:", JSON.stringify(ast, null, 2));

const interpreter = new Interpreter(ast);

interpreter.registerExentension(new MathExtension());

// Adicionando a função 'print' no escopo global
interpreter["globalScope"].define("print", (message: any) => {
  console.log(message);
});

// Executa o código
interpreter.run();
