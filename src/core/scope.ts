export class Scope {
  private variables: Map<string, any> = new Map();
  private parent: Scope | null;

  constructor(parent: Scope | null = null) {
    this.parent = parent;
  }

  // Define uma variável no escopo atual
  define(name: string, value: any) {
    this.variables.set(name, value);
  }

  // Atribui valor a uma variável (busca no escopo atual ou nos pais)
  assign(name: string, value: any) {
    if (this.variables.has(name)) {
      this.variables.set(name, value);
    } else if (this.parent) {
      this.parent.assign(name, value);
    } else {
      throw new Error(`Variable '${name}' is not defined`);
    }
  }

  // Busca uma variável no escopo atual ou nos pais
  get(name: string): any {
    if (this.variables.has(name)) {
      return this.variables.get(name);
    } else if (this.parent) {
      return this.parent.get(name);
    } else {
      throw new Error(`Variable '${name}' is not defined`);
    }
  }
}
