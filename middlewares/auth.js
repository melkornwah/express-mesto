const jwt = require('jsonwebtoken');
const NotAuthorizedError = require('../errors/not-authorized-error');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new NotAuthorizedError('Необходима авторизация');
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (e) {
    throw new NotAuthorizedError('Необходима авторизация');
  }

  req.user = payload;

  return next();
};
