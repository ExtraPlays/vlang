import { StringifyOptions } from "querystring";
import { Scope } from "../core/scope";
import { IExtension } from "../interfaces/IExtension";

class HttpExtension implements IExtension {
  registerExtension(scope: Scope): void {
    scope.define("get", async (url: string) => {
      const data = await this.get(url);
      return data;
    });
  }

  private async get(url: string): Promise<any> {
    try {
      const response = fetch(url).then((response) => response.json());
      return response;
    } catch (error) {
      console.error("GET request error:", error);
      throw error;
    }
  }

  post = (url: string, data: any, options: StringifyOptions) => {};
}

export default HttpExtension;
