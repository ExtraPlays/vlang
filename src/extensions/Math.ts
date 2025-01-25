import { IExtension } from "../interfaces/IExtension";
import { Scope } from "../core/scope";

class MathExtension implements IExtension {
  registerExtension(scope: Scope): void {
    scope.define("sum", this.sum);
    scope.define("sub", this.sub);
    scope.define("random", this.random);
    scope.define("randomBetween", this.randomBetween);
  }

  sum = (a: number, b: number) => a + b;
  sub = (a: number, b: number) => a - b;
  random = () => Math.random();
  randomBetween = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
}

export default MathExtension;
