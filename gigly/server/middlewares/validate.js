const { validationResult } = require('express-validator');
const { error } = require('../utils/apiResponse');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return error(res, 'Validation failed', 400, errors.array());
  next();
};
