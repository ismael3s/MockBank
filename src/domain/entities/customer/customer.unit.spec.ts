import { fakerPT_BR } from '@faker-js/faker';

import { Customer } from './customer';
import { BankAccountStatus } from '../bank-account/bank-account';
import { CustomerTestFixture } from '../bank-account/bank-account.unit.spec';

describe('Customer', () => {
  describe('create', () => {
    test('Deve ser possível criar uma instancia de um cliente quando os dados forem válidos', () => {
      const fullName = fakerPT_BR.person.fullName();
      const document = CustomerTestFixture.generateValidCPF();
      const birthDate = fakerPT_BR.date.past({
        years: 18,
      });

      const customer = Customer.create(fullName, document, birthDate);

      expect(customer.id).toBeTruthy();
      expect(customer.getFullName().value).toBe(fullName);
      expect(customer.getDocument().value).toBe(document);
      expect(customer.getBirthDate()).toBe(birthDate);
      expect(customer.getCreatedAt()).toBeInstanceOf(Date);
      expect(customer.getUpdatedAt()).toBeInstanceOf(Date);
      const bankAccounts = customer.getBankAccounts();
      expect(bankAccounts).toHaveLength(1);
      const bankAccount = bankAccounts[0];
      expect(bankAccount.id).toBeTruthy();
      expect(bankAccount.getBalance()).toBe(0);
      expect(bankAccount.getStatus()).toBe(BankAccountStatus.Active);
    });

    test('Quando algum dado do cliente for inválido, não deve ser possivel criar um cliente', () => {
      const fullName = fakerPT_BR.person.fullName();
      const document = '123.456.789-00';
      const birthDate = fakerPT_BR.date.past({
        years: 18,
      });

      expect(() => Customer.create(fullName, document, birthDate)).toThrow(
        'O CPF deve ser válido',
      );
    });
  });
});
