const { createString, hasExpiredAfter } = require('../utils');

describe("createString() should", () => {
  test("have some chars", () => {
    expect(createString().length).toBeGreaterThan(0);
  });

  test("have some randomness", () => {
    const strings = [createString(), createString(), createString(), createString(), createString()];
    const theyAreDifferent = strings.reduce(
      (prev, curr, _, arr) => prev && arr.filter(i => i === curr).length === 1, 
      true);
    expect(theyAreDifferent).toBe(true);
  });
});

describe("hasExpired test", () => {
  const aMinit = 60 * 1000;

  test("it is expired", () => {
    const from = new Date(1999, 1, 1, 12, 0, 0, 0);
    const nowFn = () => new Date(1999, 1, 1, 12, 1, 0, 100);
    
    expect(hasExpiredAfter(aMinit)(nowFn)(from)).toBe(true);
  });

  test("it is not expired when time span is equel to the limit", () => {
    const from = new Date(1999, 1, 1, 12, 0, 0, 0);
    const nowFn = () => new Date(1999, 1, 1, 12, 1, 0, 0);

    expect(hasExpiredAfter(aMinit)(nowFn)(from)).toBe(false);
  });

  test("it is not expired when time span is less than the limit", () => {
    const from = new Date(1999, 1, 1, 12, 0, 0, 0);
    const nowFn = () => new Date(1999, 1, 1, 12, 0, 58, 0);
    
    expect(hasExpiredAfter(aMinit)(nowFn)(from)).toBe(false);
  });
});