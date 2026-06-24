const { success, error } = require('../../utils/apiResponse');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('apiResponse utils', () => {
  describe('success()', () => {
    it('sends 200 status by default', () => {
      const res = mockRes();
      success(res, { id: 1 }, 'Done');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('sends custom status code', () => {
      const res = mockRes();
      success(res, {}, 'Created', 201);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('includes success: true in body', () => {
      const res = mockRes();
      success(res, { user: 'a' }, 'OK');
      expect(res.json.mock.calls[0][0].success).toBe(true);
    });

    it('includes data and message in body', () => {
      const res = mockRes();
      success(res, { foo: 'bar' }, 'Test message');
      const body = res.json.mock.calls[0][0];
      expect(body.data).toEqual({ foo: 'bar' });
      expect(body.message).toBe('Test message');
    });

    it('defaults to empty data object and Success message', () => {
      const res = mockRes();
      success(res);
      const body = res.json.mock.calls[0][0];
      expect(body.data).toEqual({});
      expect(body.message).toBe('Success');
    });
  });

  describe('error()', () => {
    it('sends 500 status by default', () => {
      const res = mockRes();
      error(res);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('sends custom status code', () => {
      const res = mockRes();
      error(res, 'Not found', 404);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('includes success: false in body', () => {
      const res = mockRes();
      error(res, 'Bad request', 400);
      expect(res.json.mock.calls[0][0].success).toBe(false);
    });

    it('includes message in body', () => {
      const res = mockRes();
      error(res, 'Something failed', 400);
      expect(res.json.mock.calls[0][0].message).toBe('Something failed');
    });

    it('includes errors array when provided', () => {
      const res = mockRes();
      const errs = [{ msg: 'required', param: 'name' }];
      error(res, 'Validation failed', 400, errs);
      expect(res.json.mock.calls[0][0].errors).toEqual(errs);
    });

    it('omits errors key when not provided', () => {
      const res = mockRes();
      error(res, 'Error', 500);
      expect(res.json.mock.calls[0][0].errors).toBeUndefined();
    });
  });
});
