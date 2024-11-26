import { Document } from './document';
describe('Document', () => {
  describe('CPFs válidos', () => {
    test.each([
      ['529.982.247-25', '52998224725'],
      ['123.456.789-09', '12345678909'],
      ['52998224725', '52998224725'],
      ['529-982.247_25', '52998224725'],
      ['529-982.247_25', '52998224725'],
      [' 52998224725 ', '52998224725'],
    ])(
      'Deve ser possivel criar uma instancia de um CPF quando o valor for "%s"',
      (input, expected) => {
        const document = Document.from(input);
        expect(document.getValue()).toBe(expected);
      },
    );
  });

  describe('CPFs inválidos', () => {
    test.each([
      [null],
      [''],
      ['123'],
      ['123456789012345'],
      ['111.111.111-11'],
      ['529.982.247-26'],
    ])('should throw an error for invalid CPF "%s"', (input) => {
      expect(() => Document.from(input)).toThrow('O CPF deve ser válido');
    });
  });
});
