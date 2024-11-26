import { BankAccountNumber } from './bank-account-number';

describe('BankAccountNumber', () => {
  test('Deve gerar um número de conta bancária válido', () => {
    const bankAccountNumber = BankAccountNumber.create();

    expect(bankAccountNumber.value).toBeTruthy();
  });

  test('Deve ser possivel gerar criar uma instancia de uma conta bancaria a partir de uma string válida', () => {
    const bankAccountNumber = BankAccountNumber.from(
      '01936556-d792-7407-92fc-3921f160a479',
    );
    expect(bankAccountNumber.value).toBe(
      '01936556-d792-7407-92fc-3921f160a479',
    );
  });

  test.each([[''], ['  '], [null], 'pipippopo'])(
    'Ao tentar criar criar uma instancia de conta bancaria com valores fora do padrão, deve ser lançado uma exceção',
    (input) => {
      expect(() => BankAccountNumber.from(input)).toThrow(
        'Número de conta bancária inválido',
      );
    },
  );
});
