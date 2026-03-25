import { getCountries } from "./getCountries";
import { pool } from "../pool.js";
import { isSuccessResult } from "generic-result-type";

jest.mock('../pool', () => ({
  pool: { getConnection: jest.fn() }
}));

describe('getCountries', () => {
  it('Looks for all countries when excludeOfac is false', async () => {
    const query = jest.fn().mockResolvedValue([[], undefined]);
    const dispose = jest.fn();
    const connection = { query, [Symbol.asyncDispose]: dispose };
    (pool.getConnection as jest.Mock).mockResolvedValue(connection);

    const result = await getCountries(false);
    expect(isSuccessResult(result)).toBe(true);
    expect(pool.getConnection).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledWith(
      expect.stringMatching(/^(?!.*\bwhere\s+ofac\b).*/ui),
    );
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it('Looks for all countries when excludeOfac is true', async () => {
    const query = jest.fn().mockResolvedValue([[], undefined]);
    const dispose = jest.fn();
    const connection = { query, [Symbol.asyncDispose]: dispose };
    (pool.getConnection as jest.Mock).mockResolvedValue(connection);

    const result = await getCountries(true);
    expect(isSuccessResult(result)).toBe(true);
    expect(pool.getConnection).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledWith(
      expect.stringMatching(/where\s+ofac/ui),
    );
    expect(dispose).toHaveBeenCalledTimes(1);
  });
});
