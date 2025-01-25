import { Token, TokenType } from "./lexer";

export interface ASTNode {
  type: string;
  [key: string]: any;
}

export class Parser {
  private tokens: Token[];
  private position: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return (
      this.tokens[this.position] || {
        type: TokenType.EOF,
        value: "",
        line: 0,
        column: 0,
      }
    );
  }

  private consume(): Token {
    return (
      this.tokens[this.position++] || {
        type: TokenType.EOF,
        value: "",
        line: 0,
        column: 0,
      }
    );
  }

  private expect(type: TokenType, value?: string): Token {
    const token = this.peek();
    if (token.type !== type || (value !== undefined && token.value !== value)) {
      throw new Error(
        `Expected ${type}${value ? ` ('${value}')` : ""}, but got ${
          token.type
        } ('${token.value}') at ${token.line}:${token.column}`
      );
    }
    return this.consume();
  }

  public parse(): ASTNode {
    const body: ASTNode[] = [];
    while (this.peek().type !== TokenType.EOF) {
      body.push(this.parseStatement());
    }
    return { type: "Program", body };
  }

  private parseStatement(): ASTNode {
    const token = this.peek();

    if (token.type === TokenType.Keyword) {
      if (token.value === "var" || token.value === "val") {
        return this.parseVariableDeclaration();
      } else if (token.value === "fun" || token.value === "function") {
        return this.parseFunctionDeclaration();
      } else if (token.value === "if") {
        return this.parseIfStatement();
      } else if (token.value === "return") {
        return this.parseReturnStatement();
      }
    }

    // Se for um identificador, trata como uma expressão
    if (token.type === TokenType.Identifier) {
      return this.parseExpressionStatement();
    }

    throw new Error(
      `Unexpected token: '${token.value}' at ${token.line}:${token.column}`
    );
  }

  private parseExpressionStatement(): ASTNode {
    const left = this.parseExpression();

    // Verifica se é uma atribuição
    if (
      left.type === "Identifier" &&
      this.peek().type === TokenType.Operator &&
      this.peek().value === "="
    ) {
      this.consume(); // Consome o operador '='
      const right = this.parseExpression();

      // Verifica e consome o ponto e vírgula
      this.expect(TokenType.Operator, ";");

      return {
        type: "AssignmentExpression",
        operator: "=",
        left,
        right,
      };
    }

    // Se não for uma atribuição, verifica se termina com ';'
    this.expect(TokenType.Operator, ";");

    return {
      type: "ExpressionStatement",
      expression: left,
    };
  }

  private parseVariableDeclaration(): ASTNode {
    const isConst = this.consume().value === "val";
    const identifier = this.expect(TokenType.Identifier).value;

    let type = null;
    if (this.peek().type === TokenType.Operator && this.peek().value === ":") {
      this.consume(); // Consume ':'
      type = this.expect(TokenType.Identifier).value;
    }

    // Verifica e consome o '='
    this.expect(TokenType.Operator, "=");
    const value = this.parseExpression();

    // Verifica e consome o ';'
    this.expect(TokenType.Operator, ";");

    return {
      type: "VariableDeclaration",
      isConst,
      identifier,
      value,
      valueType: type,
    };
  }

  private parseFunctionDeclaration(): ASTNode {
    this.consume(); // Consome 'fun'
    const name = this.expect(TokenType.Identifier).value;

    this.expect(TokenType.Operator); // Consome '('
    const params: { name: string; type: string | null }[] = [];
    while (
      this.peek().type !== TokenType.Operator ||
      this.peek().value !== ")"
    ) {
      const paramName = this.expect(TokenType.Identifier).value;
      let paramType = null;
      if (
        this.peek().type === TokenType.Operator &&
        this.peek().value === ":"
      ) {
        this.consume(); // Consome ':'
        paramType = this.expect(TokenType.Identifier).value;
      }
      params.push({ name: paramName, type: paramType });

      if (this.peek().value === ",") {
        this.consume(); // Consome ','
      }
    }
    this.consume(); // Consome ')'

    this.expect(TokenType.Operator); // Consome '{'
    const body: ASTNode[] = [];
    while (
      this.peek().type !== TokenType.Operator ||
      this.peek().value !== "}"
    ) {
      body.push(this.parseStatement());
    }
    this.consume(); // Consome '}'

    return { type: "FunctionDeclaration", name, params, body };
  }

  private parseIfStatement(): ASTNode {
    this.consume(); // Consume 'if'

    this.expect(TokenType.Operator); // Consume '('
    const test = this.parseExpression();
    this.expect(TokenType.Operator); // Consume ')'

    this.expect(TokenType.Operator); // Consume '{'
    const consequent: ASTNode[] = [];
    while (
      this.peek().type !== TokenType.Operator ||
      this.peek().value !== "}"
    ) {
      consequent.push(this.parseStatement());
    }
    this.consume(); // Consume '}'

    let alternate = null;
    if (
      this.peek().type === TokenType.Keyword &&
      this.peek().value === "else"
    ) {
      this.consume(); // Consume 'else'
      this.expect(TokenType.Operator); // Consume '{'
      alternate = [];
      while (
        this.peek().type !== TokenType.Operator ||
        this.peek().value !== "}"
      ) {
        alternate.push(this.parseStatement());
      }
      this.consume(); // Consume '}'
    }

    return { type: "IfStatement", test, consequent, alternate };
  }

  private parseExpression(): ASTNode {
    let left = this.parsePrimaryExpression();

    // Trata operadores binários (ex.: +, -, *, /)
    while (
      this.peek().type === TokenType.Operator &&
      ["+", "-", "*", "/", ">", "<", ">=", "<=", "==", "!="].includes(
        this.peek().value
      )
    ) {
      const operator = this.consume().value;
      const right = this.parsePrimaryExpression();
      left = {
        type: "BinaryExpression",
        operator,
        left,
        right,
      };
    }

    // Trata chamadas de função
    while (
      this.peek().type === TokenType.Operator &&
      this.peek().value === "("
    ) {
      this.consume(); // Consome '('
      const args: ASTNode[] = [];
      while (
        this.peek().type !== TokenType.Operator ||
        this.peek().value !== ")"
      ) {
        args.push(this.parseExpression());
        if (this.peek().value === ",") {
          this.consume(); // Consome ','
        }
      }
      this.consume(); // Consome ')'

      left = {
        type: "CallExpression",
        callee: left,
        arguments: args,
      };
    }

    // Trata acessos por índice ou propriedades (ex.: pessoa.nome, numeros[0])
    while (
      this.peek().type === TokenType.Operator &&
      (this.peek().value === "." || this.peek().value === "[")
    ) {
      const operator = this.consume().value;

      if (operator === ".") {
        const property = this.expect(TokenType.Identifier).value;
        left = {
          type: "MemberExpression",
          object: left, // O objeto sendo acessado
          property: { type: "Literal", value: property }, // A propriedade sendo acessada
        };
      } else if (operator === "[") {
        const index = this.parseExpression(); // Analisa o índice
        this.expect(TokenType.Operator, "]"); // Consome ']'
        left = {
          type: "MemberExpression",
          object: left, // O array ou objeto sendo acessado
          property: index, // O índice
        };
      }
    }

    return left;
  }

  private parsePrimaryExpression(): ASTNode {
    const token = this.peek();

    // Verifica se é um objeto
    if (token.type === TokenType.Operator && token.value === "{") {
      return this.parseObjectExpression();
    } else if (token.type === TokenType.Operator && token.value === "[") {
      return this.parseArrayExpression();
    } else if (token.type === TokenType.Number) {
      return { type: "Literal", value: parseFloat(this.consume().value) };
    } else if (token.type === TokenType.String) {
      return { type: "Literal", value: this.consume().value };
    } else if (token.type === TokenType.Identifier) {
      return { type: "Identifier", name: this.consume().value };
    }

    throw new Error(
      `Unexpected expression: '${token.value}' at ${token.line}:${token.column}`
    );
  }

  private parseReturnStatement(): ASTNode {
    this.consume(); // Consome a palavra-chave 'return'

    // Verifica se há uma expressão após o 'return'
    let value: ASTNode | null = null;
    if (this.peek().type !== TokenType.Operator || this.peek().value !== ";") {
      value = this.parseExpression();
    }

    // Consome o ponto e vírgula após a expressão (ou direto após 'return')
    this.expect(TokenType.Operator, ";");

    return { type: "ReturnStatement", value };
  }

  private parseArrayExpression(): ASTNode {
    this.expect(TokenType.Operator, "["); // Consome '['

    const elements: ASTNode[] = [];
    while (
      this.peek().type !== TokenType.Operator ||
      this.peek().value !== "]"
    ) {
      elements.push(this.parseExpression()); // Analisa cada elemento do array
      if (this.peek().value === ",") {
        this.consume(); // Consome ','
      }
    }

    this.expect(TokenType.Operator, "]"); // Consome ']'

    return { type: "ArrayExpression", elements };
  }

  private parseObjectExpression(): ASTNode {
    this.expect(TokenType.Operator, "{"); // Consome '{'

    const properties: { key: string; value: ASTNode }[] = [];
    while (
      this.peek().type !== TokenType.Operator ||
      this.peek().value !== "}"
    ) {
      const key = this.expect(TokenType.Identifier).value; // A chave deve ser um identificador
      this.expect(TokenType.Operator, ":"); // Consome ':'
      const value = this.parseExpression(); // O valor pode ser qualquer expressão
      properties.push({ key, value });

      if (this.peek().value === ",") {
        this.consume(); // Consome ',' se houver mais propriedades
      }
    }

    this.expect(TokenType.Operator, "}"); // Consome '}'

    return { type: "ObjectExpression", properties };
  }
}
