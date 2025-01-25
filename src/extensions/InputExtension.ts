import { IExtension } from "../interfaces/IExtension";
import { Scope } from "../core/scope";

import readline from "readline-sync";

class InputExtension implements IExtension {
  registerExtension(scope: Scope): void {
    scope.define("input", (promptMessage = ""): string => {
      return readline.question(promptMessage);
    });
  }
}

export default InputExtension;
