export enum TokenType {
  Keyword = "Keyword",
  Identifier = "Identifier",
  Number = "Number",
  String = "String",
  Operator = "Operator",
  Separator = "Separator",
  EOF = "EOF",
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

const KEYWORDS = [
  "var",
  "val",
  "fun",
  "function",
  "if",
  "else",
  "while",
  "for",
  "return",
  "async",
  "await",
];
const OPERATORS = [
  "=",
  "+",
  "-",
  "*",
  "/",
  ":",
  "{",
  "}",
  "(",
  ")",
  "[",
  "]",
  ";",
  ",",
  ">",
  "<",
  ">=",
  "<=",
  "==",
  "!=",
  ".",
];

const WHITESPACE = /\s/;
const NUMBER = /[0-9]/;
const LETTER = /[a-zA-Z_]/;

export class Lexer {
  private source: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;

  constructor(source: string) {
    this.source = source;
  }

  private peek(): string {
    return this.source[this.position] || "";
  }

  private advance(): string {
    const char = this.peek();
    this.position++;
    if (char === "\n") {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  private skipWhitespace() {
    while (WHITESPACE.test(this.peek())) {
      this.advance();
    }
  }

  private readWhile(condition: (char: string) => boolean): string {
    let result = "";
    while (condition(this.peek())) {
      result += this.advance();
    }
    return result;
  }

  private readNumber(): Token {
    const startColumn = this.column;
    const number = this.readWhile((char) => NUMBER.test(char) || char === ".");
    return {
      type: TokenType.Number,
      value: number,
      line: this.line,
      column: startColumn,
    };
  }

  private readIdentifier(): Token {
    const startColumn = this.column;
    const identifier = this.readWhile(
      (char) => LETTER.test(char) || NUMBER.test(char)
    );
    const type = KEYWORDS.includes(identifier)
      ? TokenType.Keyword
      : TokenType.Identifier;
    return {
      type,
      value: identifier,
      line: this.line,
      column: startColumn,
    };
  }

  private readString(): Token {
    const startColumn = this.column;
    this.advance(); // Skip opening quote
    const string = this.readWhile((char) => char !== '"');
    this.advance(); // Skip closing quote
    return {
      type: TokenType.String,
      value: string,
      line: this.line,
      column: startColumn,
    };
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];
    while (this.position < this.source.length) {
      this.skipWhitespace();

      const char = this.peek();

      if (char === "/" && this.source[this.position + 1] === "/") {
        // Comentário de linha
        while (this.peek() !== "\n") {
          this.advance();
        }
        continue;
      }

      if (char === "/" && this.source[this.position + 1] === "*") {
        this.advance(); // Consome o '/'
        this.advance(); // Consome o '*'
        while (
          !(this.peek() === "*" && this.source[this.position + 1] === "/") &&
          this.peek() !== null
        ) {
          // Avança até encontrar '*/' ou o final da entrada
          this.advance();
        }
        if (this.peek() === "*" && this.source[this.position + 1] === "/") {
          this.advance(); // Consome '*'
          this.advance(); // Consome '/'
        }
        continue;
      }

      if (!char) break;

      if (NUMBER.test(char)) {
        tokens.push(this.readNumber());
      } else if (LETTER.test(char)) {
        tokens.push(this.readIdentifier());
      } else if (char === '"') {
        tokens.push(this.readString());
      } else if (
        OPERATORS.some((op) => this.source.startsWith(op, this.position))
      ) {
        // Identifica o operador mais longo que combina
        const operator = OPERATORS.find((op) =>
          this.source.startsWith(op, this.position)
        )!;
        this.position += operator.length; // Avança o comprimento do operador
        tokens.push({
          type: TokenType.Operator,
          value: operator,
          line: this.line,
          column: this.column,
        });
        this.column += operator.length;
      } else {
        throw new Error(
          `Unexpected character: '${char}' at ${this.line}:${this.column}`
        );
      }
    }

    tokens.push({
      type: TokenType.EOF,
      value: "",
      line: this.line,
      column: this.column,
    });
    return tokens;
  }
}
