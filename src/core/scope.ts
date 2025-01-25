export class Scope {
  private variables: Map<string, any> = new Map();
  private constants: Set<string> = new Set();
  private parent: Scope | null;

  constructor(parent: Scope | null = null) {
    this.parent = parent;
  }

  define(name: string, value: any, isConst: boolean = false): void {
    if (this.variables.has(name)) {
      throw new Error(`Variable '${name}' is already defined`);
    }
    this.variables.set(name, value);
    if (isConst) {
      this.constants.add(name);
    }
  }

  assign(name: string, value: any): void {
    if (this.constants.has(name)) {
      throw new Error(`Cannot assign to constant variable '${name}'`);
    }
    if (this.variables.has(name)) {
      this.variables.set(name, value);
    } else if (this.parent) {
      this.parent.assign(name, value);
    } else {
      throw new Error(`Variable '${name}' is not defined`);
    }
  }

  get(name: string): any {
    if (this.variables.has(name)) {
      return this.variables.get(name);
    } else if (this.parent) {
      return this.parent.get(name);
    } else {
      throw new Error(`Variable '${name}' is not defined`);
    }
  }

  isConstant(name: string): boolean {
    if (this.constants.has(name)) {
      return true;
    } else if (this.parent) {
      return this.parent.isConstant(name);
    }
    return false;
  }
}
