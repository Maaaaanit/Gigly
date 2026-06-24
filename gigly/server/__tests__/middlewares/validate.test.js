const { validationResult } = require('express-validator');
const validate = require('../../middlewares/validate');

jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('validate middleware', () => {
  it('calls next() when there are no validation errors', () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    validate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 400 with errors when validation fails', () => {
    const fakeErrors = [{ msg: 'Email is invalid', param: 'email' }];
    validationResult.mockReturnValue({ isEmpty: () => false, array: () => fakeErrors });
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    validate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].message).toBe('Validation failed');
    expect(res.json.mock.calls[0][0].errors).toEqual(fakeErrors);
  });

  it('returns success false on validation failure', () => {
    validationResult.mockReturnValue({ isEmpty: () => false, array: () => [] });
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    validate(req, res, next);

    expect(res.json.mock.calls[0][0].success).toBe(false);
  });
});
