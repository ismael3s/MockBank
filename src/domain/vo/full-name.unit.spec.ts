import { FullName } from './full-name';

describe('FullName', () => {
  test.each([[''], [' '], ['  '], [null]])(
    'Não deve ser possivel criar uma instancia de nome completo com valor %p',
    (value) => {
      expect(() => FullName.from(value)).toThrow(
        'O nome completo é obrigatório',
      );
    },
  );

  test.each([
    ['Jhon ', 'Jhon'],
    ['  Jhon Doe ', 'Jhon Doe'],
  ])(
    'Deve ser possivel criar uma instancia de um nome completo %s',
    (input, expectedOutput) => {
      const fullName = FullName.from(input);

      expect(fullName.value).toBe(expectedOutput);
    },
  );
});
