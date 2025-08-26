const calculadora = require("../models/calculadora");

test("Deve somar 2 + 2 e retornar 4", () => {
  const resultado = calculadora.somar(2, 2);
  expect(resultado).toBe(4);
});

test("Deve somar 5 + 100 e retornar 105", () => {
  const resultado = calculadora.somar(5, 100);
  expect(resultado).toBe(105);
});
