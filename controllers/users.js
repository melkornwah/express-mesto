const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const User = require('../models/users');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => {
      throw createError(500, 'Произошла ошибка на сервере.');
    })
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(createError(400, 'Пользователь по указанному _id не найден.'))
    .then((user) => {
      res.send({ data: user });
    })
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findOne(jwt._id)
    .orFail(createError(400, 'Пользователь по указанному _id не найден.'))
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
      },
      { runValidators: true })
        .then((user) => {
          res.send({ data: user });
        })
        .catch((err) => {
          if (err.name === 'MongoError' && err.code === 11000) {
            throw createError(409, 'Пользователь по данному email уже зарегистрирован.');
          }
          if (err.name === 'ValidationError') {
            throw createError(400, 'Переданы некорректные данные при создании пользователя.');
          }
          throw createError(500, 'Произошла ошибка на сервере.');
        })
        .catch(next);
    });
};

module.exports.updateUser = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, {
    name: req.body.name,
    about: req.body.about,
  },
  { runValidators: true, new: true })
    .orFail(new Error('Пользователь по указанному _id не найден.'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw createError(400, 'Переданы некорректные данные при обновлении профиля.');
      }
      if (err.message === 'Пользователь по указанному _id не найден.') {
        throw createError(404, err.message);
      }
      throw createError(500, 'Произошла ошибка на сервере.');
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
        throw createError(400, 'Переданы некорректные данные при обновлении профиля.');
      }
      if (err.message === 'Пользователь по указанному _id не найден.') {
        throw createError(404, err.message);
      }
      throw createError(500, 'Произошла ошибка на сервере.');
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw createError(401, 'Неправильные почта или пароль');
      }

      return ({ matched: bcrypt.compare(password, user.password), user });
    })
    .then((obj) => {
      if (!obj.matched) {
        throw createError(401, 'Неправильные почта или пароль');
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
