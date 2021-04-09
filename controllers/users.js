const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const BadRequestError = require('../errors/bad-request-error');
const NotAuthorizedError = require('../errors/not-authorized-error');
const NotFoundError = require('../errors/not-found-error');
const ConflictError = require('../errors/conflict-error');
const ServerError = require('../errors/server-error');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => {
      throw new ServerError('Произошла ошибка на сервере.');
    })
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(new NotFoundError('Пользователь по указанному _id не найден.'))
    .then((user) => {
      res.send({ data: user });
    })
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findOne(req.user._id)
    .orFail(new NotFoundError('Пользователь по указанному _id не найден.'))
    .then((user) => {
      res.send({ data: user });
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      })
        .then((user) => {
          res.send({
            data: {
              name: user.name,
              about: user.about,
              avatar: user.avatar,
              email: user.email,
            },
          });
        })
        .catch((err) => {
          if (err.name === 'MongoError' && err.code === 11000) {
            throw new ConflictError('Пользователь по данному email уже зарегистрирован.');
          }
          if (err.name === 'ValidationError') {
            throw new BadRequestError('Переданы некорректные данные при создании пользователя.');
          }
          throw new ServerError('Произошла ошибка на сервере.');
        })
        .catch(next);
    });
};

module.exports.updateUser = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, {
    $set: {
      name: req.body.name,
      about: req.body.about,
    },
  },
  { runValidators: true, new: true })
    .orFail(new Error('Пользователь по указанному _id не найден.'))
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.message === 'Переданы некорректные данные при обновлении профиля.') {
        throw new BadRequestError('Переданы некорректные данные при обновлении профиля.');
      }
      if (err.message === 'Пользователь по указанному _id не найден.') {
        throw new NotFoundError(err.message);
      }
      throw new ServerError('Произошла ошибка на сервере.');
    })
    .catch(next);
};

module.exports.updateAvatar = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, {
    avatar: req.body.avatar,
  }, { runValidators: true, new: true })
    .orFail(new Error('Пользователь по указанному _id не найден.'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные при обновлении профиля.');
      }
      if (err.message === 'Пользователь по указанному _id не найден.') {
        throw new NotFoundError(err.message);
      }
      throw new ServerError('Произошла ошибка на сервере.');
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new NotAuthorizedError('Неправильные почта или пароль');
      }

      return ({ matched: bcrypt.compare(password, user.password), user });
    })
    .then((obj) => {
      if (!obj.matched) {
        throw new NotAuthorizedError('Неправильные почта или пароль');
      }

      const token = jwt.sign(
        { _id: obj.user._id },
        'some-secret-key',
        { expiresIn: '7d' },
      );

      return res.send({ token });
    })
    .catch(next);
};
