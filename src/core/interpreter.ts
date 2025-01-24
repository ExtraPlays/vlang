import { IExtension } from "../interfaces/IExtension";
import { ASTNode } from "./parser";
import { Scope } from "./scope";

export class Interpreter {
  private globalScope: Scope;

  constructor(private ast: ASTNode) {
    this.globalScope = new Scope(); // Cria o escopo global
  }

  public run() {
    this.evaluate(this.ast, this.globalScope);
  }

  public registerExentension(extension: IExtension) {
    extension.registerExtension(this.globalScope);
  }

  private evaluate(node: ASTNode, scope: Scope): any {
    switch (node.type) {
      case "Program":
        return this.evaluateProgram(node, scope);

      case "VariableDeclaration":
        return this.evaluateVariableDeclaration(node, scope);

      case "FunctionDeclaration":
        return this.evaluateFunctionDeclaration(node, scope);

      case "IfStatement":
        return this.evaluateIfStatement(node, scope);

      case "ReturnStatement":
        return this.evaluateReturnStatement(node, scope);

      case "ExpressionStatement":
        return this.evaluate(node.expression, scope);

      case "CallExpression":
        return this.evaluateCallExpression(node, scope);

      case "ArrayExpression":
        return this.evaluateArrayExpression(node, scope);

      case "ObjectExpression":
        return this.evaluateObjectExpression(node, scope);

      case "MemberExpression":
        return this.evaluateMemberExpression(node, scope);

      case "BinaryExpression":
        return this.evaluateBinaryExpression(node, scope);

      case "Literal":
        return node.value;

      case "Identifier":
        return scope.get(node.name);

      default:
        throw new Error(`Unknown AST node type: ${node.type}`);
    }
  }

  private evaluateProgram(node: ASTNode, scope: Scope) {
    for (const statement of node.body) {
      this.evaluate(statement, scope);
    }
  }

  private evaluateVariableDeclaration(node: ASTNode, scope: Scope) {
    const value = this.evaluate(node.value, scope);
    scope.define(node.identifier, value);
  }

  private evaluateFunctionDeclaration(node: ASTNode, scope: Scope) {
    scope.define(node.name, (...args: any[]) => {
      const localScope = new Scope(scope); // Cria um escopo local
      node.params.forEach((param: any, index: number) => {
        localScope.define(param.name, args[index]); // Passa os argumentos para o escopo local
      });

      for (const statement of node.body) {
        const result = this.evaluate(statement, localScope);
        if (statement.type === "ReturnStatement") {
          return result; // Retorna o valor da função
        }
      }
    });
  }

  private evaluateIfStatement(node: ASTNode, scope: Scope) {
    const test = this.evaluate(node.test, scope);
    if (test) {
      const localScope = new Scope(scope); // Cria um novo escopo para o bloco
      for (const statement of node.consequent) {
        this.evaluate(statement, localScope);
      }
    } else if (node.alternate) {
      const localScope = new Scope(scope); // Cria um novo escopo para o bloco
      for (const statement of node.alternate) {
        this.evaluate(statement, localScope);
      }
    }
  }

  private evaluateReturnStatement(node: ASTNode, scope: Scope) {
    return this.evaluate(node.value, scope);
  }

  private evaluateCallExpression(node: ASTNode, scope: Scope) {
    const fn = this.evaluate(node.callee, scope);
    const args = node.arguments.map((arg: any) => this.evaluate(arg, scope));
    if (typeof fn === "function") {
      return fn(...args);
    } else {
      throw new Error(`'${node.callee.name}' is not a function`);
    }
  }

  private evaluateArrayExpression(node: ASTNode, scope: Scope): any {
    return node.elements.map((element: ASTNode) =>
      this.evaluate(element, scope)
    );
  }

  private evaluateObjectExpression(node: ASTNode, scope: Scope): any {
    const obj: { [key: string]: any } = {};
    node.properties.forEach(
      ({ key, value }: { key: string; value: ASTNode }) => {
        obj[key] = this.evaluate(value, scope);
      }
    );
    return obj;
  }

  private evaluateMemberExpression(node: ASTNode, scope: Scope): any {
    const object = this.evaluate(node.object, scope); // Avalia o array ou objeto
    const property = this.evaluate(node.property, scope); // Avalia o índice ou chave

    if (Array.isArray(object)) {
      if (typeof property !== "number") {
        throw new Error(`Array index must be a number, got '${property}'`);
      }
      return object[property];
    }

    if (typeof object === "object" && object !== null) {
      if (typeof property !== "string") {
        throw new Error(`Object property must be a string, got '${property}'`);
      }
      return object[property];
    }

    throw new Error(`Cannot access property '${property}' on non-array object`);
  }

  private evaluateBinaryExpression(node: ASTNode, scope: Scope) {
    const left = this.evaluate(node.left, scope);
    const right = this.evaluate(node.right, scope);

    switch (node.operator) {
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "*":
        return left * right;
      case "/":
        return left / right;
      case ">":
        return left > right;
      case "<":
        return left < right;
      case ">=":
        return left >= right;
      case "<=":
        return left <= right;
      case "==":
        return left === right;
      case "!=":
        return left !== right;
      default:
        throw new Error(`Unknown operator: ${node.operator}`);
    }
  }
}
