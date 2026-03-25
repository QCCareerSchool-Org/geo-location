import { getMockReq, getMockRes } from '@jest-mock/express';
import { failure, success } from 'generic-result-type';

import { countriesHandler } from './countriesHandler.js';
import { getCountries } from '../lib/getCountries.js';

jest.mock('../lib/getCountries');

describe('countriesHandler', () => {
  it('calls getCounties with the excludeOfac = true', async () => {
    const req = getMockReq({ query: { ofac: '0' } });
    const { res, next } = getMockRes();
    (getCountries as jest.Mock).mockResolvedValue(success([]));
    await countriesHandler(req, res, next);
    expect(getCountries).toHaveBeenCalledWith(true);
  });

  it('calls getCounties with the excludeOfac = false', async () => {
    const req = getMockReq();
    const { res, next } = getMockRes();
    (getCountries as jest.Mock).mockResolvedValue(success([]));
    await countriesHandler(req, res, next);
    expect(getCountries).toHaveBeenCalledWith(false);
  });

  it('reports HTTP 500 if getCountries fails', async () => {
    const req = getMockReq();
    const { res, next } = getMockRes();
    (getCountries as jest.Mock).mockResolvedValue(failure(Error('foo')));
    await countriesHandler(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});
