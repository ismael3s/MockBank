import { BankAccount } from '../entities/bank-account/bank-account';
import { CustomerTestFixture } from '../entities/bank-account/bank-account.unit.spec';
import { TransactionDomainService } from './transaction.domain-service';

export class BankAccountTestFixture {
  static createInactiveBankAccount() {
    const customer = CustomerTestFixture.createAValidCustomer();
    const bankAccount = BankAccount.create(customer);
    bankAccount.inactivate();
    return bankAccount;
  }

  static createActiveBankAccount(): BankAccount {
    const customer = CustomerTestFixture.createAValidCustomer();
    const bankAccount = BankAccount.create(customer);
    return bankAccount;
  }
}

describe('TransactionDomainService', () => {
  describe('Deposito', () => {
    test('Deve ser possível realizar um depósito em uma conta bancária ativa', () => {
      const bankAccount = BankAccountTestFixture.createActiveBankAccount();
      const amount = 100;

      TransactionDomainService.deposit(bankAccount, amount);

      const balance = bankAccount.getBalance();
      expect(balance).toBe(amount);
    });

    test('Não deve ser possível realizar um depósito em uma conta bancária inativa', () => {
      const bankAccount = BankAccountTestFixture.createInactiveBankAccount();
      const amount = 100;

      expect(() =>
        TransactionDomainService.deposit(bankAccount, amount),
      ).toThrow('Não é possível realizar transações em uma conta inativa');
    });

    test('Não deve ser possível realizar um depósito com valor menor ou igual a zero', () => {
      const bankAccount = BankAccountTestFixture.createActiveBankAccount();
      const amount = 0;

      expect(() =>
        TransactionDomainService.deposit(bankAccount, amount),
      ).toThrow('O valor do depósito deve ser maior que zero');
    });
  });

  describe('Saque', () => {
    test('Deve ser possível realizar um saque em uma conta bancária ativa', () => {
      const bankAccount = BankAccountTestFixture.createActiveBankAccount();
      const amount = 100;

      TransactionDomainService.deposit(bankAccount, 200);
      TransactionDomainService.withdraw(bankAccount, amount);

      const balance = bankAccount.getBalance();
      expect(balance).toBe(100);
    });

    test('Não deve ser possível realizar um saque em uma conta bancária inativa', () => {
      const bankAccount = BankAccountTestFixture.createInactiveBankAccount();
      const amount = 100;

      expect(() =>
        TransactionDomainService.withdraw(bankAccount, amount),
      ).toThrow('Não é possível realizar transações em uma conta inativa');
    });

    test('Não deve ser possível realizar um saque com valor menor ou igual a zero', () => {
      const bankAccount = BankAccountTestFixture.createActiveBankAccount();
      const amount = 0;

      expect(() =>
        TransactionDomainService.withdraw(bankAccount, amount),
      ).toThrow('O valor do saque deve ser maior que zero');
    });

    test('Não deve ser possível realizar um saque com saldo insuficiente', () => {
      const bankAccount = BankAccountTestFixture.createActiveBankAccount();
      const amount = 100;

      expect(() =>
        TransactionDomainService.withdraw(bankAccount, amount),
      ).toThrow('Saldo insuficiente');
    });
  });

  describe('Transferência', () => {
    test('Deve ser possível realizar uma transferência entre contas bancárias ativas', () => {
      const bankAccount = BankAccountTestFixture.createActiveBankAccount();
      const bankAccount2 = BankAccountTestFixture.createActiveBankAccount();
      const amount = 100;

      TransactionDomainService.deposit(bankAccount, 200);
      TransactionDomainService.transfer(bankAccount, bankAccount2, amount);

      const balance = bankAccount.getBalance();
      const balance2 = bankAccount2.getBalance();
      expect(balance).toBe(100);
      expect(balance2).toBe(100);
    });

    test('Não deve ser possível realizar uma transferência em uma conta bancária inativa', () => {
      const bankAccount = BankAccountTestFixture.createInactiveBankAccount();
      const bankAccount2 = BankAccountTestFixture.createActiveBankAccount();
      const amount = 100;

      expect(() =>
        TransactionDomainService.transfer(bankAccount, bankAccount2, amount),
      ).toThrow('Não é possível realizar transações em uma conta inativa');
    });

    test('Não deve ser possível realizar uma transferência em uma conta bancária inativa', () => {
      const bankAccount = BankAccountTestFixture.createInactiveBankAccount();
      const bankAccount2 = BankAccountTestFixture.createInactiveBankAccount();
      const amount = 100;

      expect(() =>
        TransactionDomainService.transfer(bankAccount, bankAccount2, amount),
      ).toThrow('Não é possível realizar transações em uma conta inativa');
    });

    test('Não deve ser possível realizar uma transferência com valor menor ou igual a zero', () => {
      const bankAccount = BankAccountTestFixture.createActiveBankAccount();
      const bankAccount2 = BankAccountTestFixture.createActiveBankAccount();
      const amount = 0;

      expect(() =>
        TransactionDomainService.transfer(bankAccount, bankAccount2, amount),
      ).toThrow('O valor da transferência deve ser maior que zero');
    });

    test('Não deve ser possível realizar uma transferência onde o valor removido da conta bancaria de origem fique com o saldo negativo', () => {
      const bankAccount = BankAccountTestFixture.createActiveBankAccount();
      const bankAccount2 = BankAccountTestFixture.createActiveBankAccount();
      const amount = 200;
      TransactionDomainService.deposit(bankAccount, amount);

      expect(() =>
        TransactionDomainService.transfer(
          bankAccount,
          bankAccount2,
          amount * 2,
        ),
      ).toThrow('Saldo insuficiente');
    });
  });
});
