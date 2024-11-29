# MockBank

Projeto para simular o funcionamento básico de um banco.

## Ponto importante

1. Para esse projeto na camada de application estamos referenciando pacotes do nestjs/cqrs e nestjs/common, decidi seguir dessa forma por considerar ser o mais pragmático, seguindo o Clean Arch by the book, o ideal seria isolar também a camada de application de dependências externas, porém com isso iriamos ter um esforço a mais para realizar a injeção de dependência

2. Deixei configurado as migrations serem executadas junto com a API para deixar mais pratico na hora de executar localmente.

## Estrutura explicada

### Domain

Dentro dessa pasta centralizei os Aggregate Root, Entities, Value Objects, Domain Service e definições dos Repositories.

#### Quais foram as entidades?

1. Customer
2. BankAccount
3. Transaction

### Quais Foram os agregados?

Identifiquei 2

1. Customer
2. BankAccount

### Quais Foram os DomainService?

Identifiquei apenas umas e o coloquei como `TransactionDomainService`, nele centralizei todas as regras necessárias para fazer transferências, sendo elas:

1. Transações so podem ser feitas em contas bancarias ativas
2. O valor do deposito deve ser maior do que zero
3. O valor do saque deve ser maior do que zero e não pode deixar uma conta bancaria com saldo negativo
4. Não pode realizar transferência para a mesma conta bancaria
5. Não pode realizar transferências para outras contas onde o saldo da conta bancaria de origem fosse ficar negativado

### Quais foram os repositórios?

1. `ICustomerRepository`
2. `IBankAccountRepository`

Para as transações não foi necessário implementar um repository, pois esse padrão é utilizado para a persistência de agregados, ou seja, o repositorio do aggregate root deve lidar com demais inserções e atualizações de suas entidades relacionadas

## Application

Para essa camada segue levemente a ideia de 'use cases', porém utilizando o pacote `nestjs/cqrs`, gosto dessa abordagem pois ela isola cada ação que pode ocorrer no sistema e a deixa isolada.

### Commands

Para essa pasta ficaram todas ações que mutam dados

### Queries

Para essa pasta ficaram todas as açÕes que apenas buscam dados sem realizar nenhuma mutação

## Infra

Nessa pasta deixei centralizando as implementações das interfaces definidas nas camadas de application, e domain

## Executando o projeto - Docker

Para executar o projeto deixei criado um `docker-compose` com isso basta executar:

```sh
docker-compose up -d
```

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

Alternativas que eu investiria tempo para otimizar isso seria:

- Usar o mesmo container e executar as migrations apenas uma vez e para cada teste limpar as tabelas
- Explorar melhor como o sequelize usa o CLS para termos um controle melhor das transações para fazer o rollback automático.

```sh
npm run test:integration
```

## O que eu mudaria nessa implementação?

1. Para esse projeto deixei todas as pastas dentro da raiz, se fosse um projeto com um escopo maior avaliaria colocar em pasta de módulos e seguindo a estrutura proposta.

2. Separei as buscas em uma pasta de `queries` e dentro dela chamo o repository para trazer os dados do agregado, em cenários onde existem diversos recursos isso pode não ser o ideal, com isso iria para uma abordagem mais pragmática de deixar para os casos de apenas busca chamarem diretamente o banco, trazendo apenas os dados necessários e fazendo os cálculos necessários no lado do banco de dados.
