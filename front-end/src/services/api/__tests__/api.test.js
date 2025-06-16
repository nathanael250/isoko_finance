import { authAPI, loanAPI, cashierAPI, supervisorAPI } from '../index';

describe('API Services', () => {
  test('authAPI is exported', () => {
    expect(authAPI).toBeDefined();
  });

  test('loanAPI is exported', () => {
    expect(loanAPI).toBeDefined();
  });

  test('cashierAPI is exported', () => {
    expect(cashierAPI).toBeDefined();
  });

  test('supervisorAPI is exported', () => {
    expect(supervisorAPI).toBeDefined();
  });
}); 