const User = require('../models/users');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка на сервере.' }));
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params._id)
    .orFail(new Error('Пользователь по указанному _id не найден.'))
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Неправильно указан _id пользователя.' });
        return;
      }
      if (err.message === 'Пользователь по указанному _id не найден.') {
        res.status(404).send({ message: err.message });
        return;
      }
      res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные при создании пользователя.' });
      } else {
        res.status(500).send({ message: 'Произошла ошибка на сервере.' });
      }
    });
};

module.exports.updateUser = (req, res) => {
  User.findByIdAndUpdate(req.user._id, {
    name: req.body.name,
    about: req.body.about,
  },
  { runValidators: true },
  { new: true })
    .orFail(() => res.status(404).send({ message: 'Пользователь с указанным _id не найден.' }))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.kind === 'string') {
        res.status(400).send({ message: 'Переданы некорректные данные при обновлении профиля.' });
      } else {
        res.status(500).send({ message: 'Произошла ошибка на сервере.' });
      }
    });
};

module.exports.updateAvatar = (req, res) => {
  User.findByIdAndUpdate(req.user._id, {
    avatar: req.body.avatar,
  }, { runValidators: true })
    .orFail(() => res.status(404).send({ message: 'Пользователь с указанным _id не найден.' }))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.kind === 'string') {
        res.status(400).send({ message: 'Переданы некорректные данные при обновлении аватара.' });
      } else {
        res.status(500).send({ message: 'Произошла ошибка' });
      }
    });
};
