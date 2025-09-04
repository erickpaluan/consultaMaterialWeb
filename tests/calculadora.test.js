const calculadora = require("../models/calculadora");

//Testes de soma
test("somar 2 + 2 deveria retornar 4", () => {
  const resultado = calculadora.somar(2, 2);
  expect(resultado).toBe(4);
});

test("somar 5 + 100 deveria retornar 105", () => {
  const resultado = calculadora.somar(5, 100);
  expect(resultado).toBe(105);
});

test("somar 'banana' + 100 deveria retornar 'Erro", () => {
  const resultado = calculadora.somar("banana", 100);
  expect(resultado).toBe("Erro");
});

//Testes de subtração
test("subtrair 10 - 5 deveria retornar 5", () => {
  const resultado = calculadora.subtrair(10, 5);
  expect(resultado).toBe(5);
});

test("subtrair 0 - 0 deveria retornar 0", () => {
  const resultado = calculadora.subtrair(0, 0);
  expect(resultado).toBe(0);
});

test("subtrair 'laranja' - 5 deveria retornar 'Erro'", () => {
  const resultado = calculadora.subtrair("laranja", 5);
  expect(resultado).toBe("Erro");
});

//Testes de multiplicação
test("multiplicar 5 * 5 deveria retornar 25", () => {
  const resultado = calculadora.multiplicar(5, 5);
  expect(resultado).toBe(25);
});

test("multiplicar 10 * 0 deveria retornar 0", () => {
  const resultado = calculadora.multiplicar(10, 0);
  expect(resultado).toBe(0);
});

test("multiplicar 'uva' * 5 deveria retornar 'Erro'", () => {
  const resultado = calculadora.multiplicar("uva", 5);
  expect(resultado).toBe("Erro");
});

//Testes de divisão
test("dividir 10 / 2 deveria retornar 5", () => {
  const resultado = calculadora.dividir(10, 2);
  expect(resultado).toBe(5);
});

test("dividir 5 / 0 deveria retornar 'Erro'", () => {
  const resultado = calculadora.dividir(5, 0);
  expect(resultado).toBe("Erro");
});

test("dividir 'pera' / 5 deveria retornar 'Erro'", () => {
  const resultado = calculadora.dividir("pera", 5);
  expect(resultado).toBe("Erro");
});
