const errorHandler = require('../../middlewares/errorHandler');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockReq = () => ({ method: 'GET', originalUrl: '/api/test' });

describe('errorHandler middleware', () => {
  it('uses statusCode from error if present', () => {
    const err = { statusCode: 422, message: 'Unprocessable' };
    const res = mockRes();
    errorHandler(err, mockReq(), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Unprocessable' });
  });

  it('defaults to 500 when no statusCode on error', () => {
    const err = new Error('Something broke');
    const res = mockRes();
    errorHandler(err, mockReq(), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('handles CastError with 400', () => {
    const err = { name: 'CastError', path: 'id', value: 'bad_id', message: 'Cast error' };
    const res = mockRes();
    errorHandler(err, mockReq(), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].message).toMatch(/Invalid id/);
  });

  it('handles duplicate key error (code 11000) with 400', () => {
    const err = { code: 11000, keyValue: { email: 'dup@test.com' }, message: 'dup key' };
    const res = mockRes();
    errorHandler(err, mockReq(), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].message).toMatch(/email already exists/);
  });

  it('handles ValidationError with 400 and joins messages', () => {
    const err = {
      name: 'ValidationError',
      errors: {
        name: { message: 'name is required' },
        email: { message: 'email is required' },
      },
    };
    const res = mockRes();
    errorHandler(err, mockReq(), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].message).toContain('name is required');
  });

  it('handles JsonWebTokenError with 401', () => {
    const err = { name: 'JsonWebTokenError', message: 'invalid signature' };
    const res = mockRes();
    errorHandler(err, mockReq(), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json.mock.calls[0][0].message).toBe('Invalid token');
  });

  it('handles TokenExpiredError with 401', () => {
    const err = { name: 'TokenExpiredError', message: 'jwt expired' };
    const res = mockRes();
    errorHandler(err, mockReq(), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json.mock.calls[0][0].message).toBe('Token expired');
  });

  it('always returns success: false', () => {
    const err = new Error('any error');
    const res = mockRes();
    errorHandler(err, mockReq(), res, jest.fn());
    expect(res.json.mock.calls[0][0].success).toBe(false);
  });
});
