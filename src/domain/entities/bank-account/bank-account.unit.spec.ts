import { fakerPT_BR } from '@faker-js/faker/.';
import { Customer } from '../customer/customer';
import { BankAccount } from './bank-account';
import { Transaction } from './transaction';

export class CustomerTestFixture {
  static generateValidCPF(formatted: boolean = false): string {
    const randomDigits = Array.from({ length: 9 }, () =>
      Math.floor(Math.random() * 10),
    );

    const calculateDigit = (
      baseDigits: number[],
      multipliers: number[],
    ): number => {
      const sum = baseDigits.reduce(
        (acc, digit, idx) => acc + digit * multipliers[idx],
        0,
      );
      const remainder = sum % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };

    const firstMultiplier = [10, 9, 8, 7, 6, 5, 4, 3, 2];
    const secondMultiplier = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];

    const firstDigit = calculateDigit(randomDigits, firstMultiplier);
    randomDigits.push(firstDigit);

    const secondDigit = calculateDigit(randomDigits, secondMultiplier);
    randomDigits.push(secondDigit);

    const cpf = randomDigits.join('');
    if (formatted) {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    return cpf;
  }

  static createAValidCustomer(): Customer {
    const fullName = fakerPT_BR.person.fullName();
    const document = CustomerTestFixture.generateValidCPF();
    const birthDate = fakerPT_BR.date.past({
      years: 18,
    });

    return Customer.create(fullName, document, birthDate);
  }

  static createDepositTransaction(bankAccount: BankAccount, amount: number) {
    const transaction = Transaction.deposit(bankAccount.id, amount);
    bankAccount.addTransaction(transaction);
  }

  static createWithdrawnTransaction(bankAccount: BankAccount, amount: number) {
    const transaction = Transaction.withdraw(bankAccount.id, amount);
    bankAccount.addTransaction(transaction);
  }

  static createTransferTransaction(
    from: BankAccount,
    to: BankAccount,
    amount: number,
  ) {
    const transaction = Transaction.transfer(from.id, to.id, amount);
    from.addTransaction(transaction);
    to.addTransaction(transaction);
  }
}

describe('BankAccount - Aggregate Root', () => {
  test('Dado um conta bancária ativa sem movimentações bancaria, deve retornar seu saldo como zero', () => {
    const customer = CustomerTestFixture.createAValidCustomer();
    const bankAccount = BankAccount.create(customer);

    const balance = bankAccount.getBalance();

    expect(balance).toBe(0);
  });

  test('Dado um conta bancária ativa com apenas depósitos, o saldo deve ser calculado normalmente', () => {
    const customer = CustomerTestFixture.createAValidCustomer();
    const bankAccount = BankAccount.create(customer);

    CustomerTestFixture.createDepositTransaction(bankAccount, 100);
    CustomerTestFixture.createDepositTransaction(bankAccount, 100);
    const balance = bankAccount.getBalance();

    expect(balance).toBe(200);
  });

  test('Dado um conta bancária ativa com  depósitos e saques, o saldo deve ser calculado normalmente', () => {
    const customer = CustomerTestFixture.createAValidCustomer();
    const bankAccount = BankAccount.create(customer);

    CustomerTestFixture.createDepositTransaction(bankAccount, 100);
    CustomerTestFixture.createDepositTransaction(bankAccount, 100);
    CustomerTestFixture.createWithdrawnTransaction(bankAccount, 50);
    const balance = bankAccount.getBalance();

    expect(balance).toBe(150);
  });

  test('Dado um conta bancária ativa com  depósitos, saques e transferências(Recebimento e Envios), o saldo deve ser calculado normalmente', () => {
    const customer = CustomerTestFixture.createAValidCustomer();
    const bankAccount = BankAccount.create(customer);
    const customer2 = CustomerTestFixture.createAValidCustomer();
    const bankAccount2 = BankAccount.create(customer2);
    CustomerTestFixture.createDepositTransaction(bankAccount2, 1_000);
    CustomerTestFixture.createDepositTransaction(bankAccount, 100);
    CustomerTestFixture.createDepositTransaction(bankAccount, 100);
    CustomerTestFixture.createWithdrawnTransaction(bankAccount, 50);
    CustomerTestFixture.createTransferTransaction(
      bankAccount2,
      bankAccount,
      100,
    );
    CustomerTestFixture.createTransferTransaction(
      bankAccount,
      bankAccount2,
      100,
    );

    const balance = bankAccount.getBalance();

    expect(balance).toBe(150);
  });
});
