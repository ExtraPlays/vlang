import { Scope } from "../core/scope";

export interface IExtension {
  registerExtension(scope: Scope): void;
}
