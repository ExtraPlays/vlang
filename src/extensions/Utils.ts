import { IExtension } from "../interfaces/IExtension";
import { Scope } from "../core/scope";

import fs from "fs";

class UtilsExtension implements IExtension {
  registerExtension(scope: Scope): void {
    scope.define("print", this.print);
  }

  print(...args: any[]) {
    const output = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
      )
      .join(" ");
    console.log(output);
  }
}

export default UtilsExtension;
