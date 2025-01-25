# VL

Esta linguagem foi desenvolvida como um projeto educacional e experimental. O objetivo é oferecer uma base simples e extensível que suporte variáveis, funções, estruturas de controle, arrays, objetos, e extensões personalizadas, como entrada do usuário e exibição de mensagens.

## Estrutura Básica

### Variáveis

- `var` Declara uma variável mutável.
- `val` Declara uma constante imutável.

Sintaxe

```vl
var x = 10
val y = 20
```

Funções

- `fun` Declara uma função.

Sintaxe

```vl
fun teste(args){
  // Corpo da função
}
```

Chamada de função:

```vl
val resultado = sum(10, 20); // Sum é uma função global !!!
```

### Estruturas de Controle

- `if` Declara uma estrutura condicional.
- `else` Declara uma estrutura condicional alternativa.
- `while` Declara um loop condicional.
- `for` Declara um loop de iteração.

Sintaxe

```vl
if (x > 10){
  // Corpo do if
} else {
  // Corpo do else
}

while (x > 10){
  // Corpo do while
}

for (var i = 0; i < 10; i++){
  // Corpo do for
}
```

### Arrays

- `[]` Declara um array.

Futuras implementações:

- `push` Adiciona um elemento ao final do array.
- `pop` Remove o último elemento do array.
- `shift` Remove o primeiro elemento do array.

Sintaxe:

```vl
var arr = [1,2,3,4];
print(arr[0]); // 1
```

### Objetos

- `{}` Declara um objeto.

Futuras implementações:

- `.` Acessa uma propriedade do objeto.

Sintaxe:

```vl
var obj = {
  nome: "João",
  idade: 20
};

print(obj.nome); // João
```

## Extensões

A linguagem suporta extensões para adicionar funcionalidades personalizadas. As extensões podem ser registradas no escopo global e usadas diretamente no código.

### Exemplo: Extensão input

```vl
import { IExtension } from "../interfaces/IExtension";
import { Scope } from "../core/scope";

import readline from "readline-sync";

class InputExtension  implements IExtension {
  registerExtension(scope) {
    scope.define("input", (promptMessage = "") => {
      return readline.question(promptMessage);
    });
  }
}

export default InputExtension;
```

Uso:

```vl
val nome = input("Qual o seu nome? "); // Captura a entrada do usuário ex: João
print("Ola", nome); // Ola João
```
