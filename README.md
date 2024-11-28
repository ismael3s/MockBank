# MockBank

Projeto para simular o funcionamento básico de um banco.

## Ponto importante

Para esse projeto na camada de application estamos referenciando pacotes do nestjs/cqrs e nestjs/common, decidi seguir dessa forma por considerar ser o mais pragmático, seguindo o Clean Arch by the book, o ideal seria isolar também a camada de application de dependências externas, porém com isso iriamos um esforço a mais para realizar a injeção de dependência

## Executando o projeto - Docker

Para executar o projeto deixei criado um `docker-compose` com isso basta executar:

```sh
docker-compose up -d
```

Deixei configurado para nessa API automaticamente executar as migrations

## Executando o projeto - Sem Docker

1. crie um arquivo `.env`
2. Copie e cole os valores do `.env.example`
3. Instale os pacotes e faça o build do projeto

```sh
npm ci;
npm run build;
```

4. Execute o projeto

```sh
npm run start:prod
```

## Executando os testes

Nesse projeto os testes integrados foram feitos utilizando Docker, então caso você não tenha o docker instalado eles iram falhar.

### Testes unitários

```sh
npm run test:unit
```

### Testes Integrados

Para cada teste é levantado uma instancia unica do Docker, o que não é o ideal, pois a depender da maquina esses testes podem demorar muito mais, porém para esse momento deixei com esse comportamento.

Alternativas que eu investiria tempo seria:

- Usar o mesmo container e executar as migrations apenas uma vez e para cada teste limpar as tabelas
- Explorar melhor como o sequelize usa o CLS para termos um controle melhor das transações para fazer o rollback automático.

```sh
npm run test:integration



## O que eu mudaria nessa implementação?

1. Para esse projeto deixa todas as pastas dentro da raiz do projeto, se fosse um projeto com um escopo maior avaliaria colocar em pasta de módulos e seguindo a estrutura proposta, com isso chegaríamos em um monólito modular.

2. Separei as buscas em uma pasta de `queries` e dentro dela chamo o repository para trazer os dados do agregados e fazendo o calculo em memoria  do saldo da conta, em cenários onde existem diversas transações isso pode não ser o ideal, com isso iria para uma abordagem mais pragmática de deixar para os casos de apenas busca chamarem diretamente o SQL e deixando todo o calculo "pesado" para o banco de dados.
```
