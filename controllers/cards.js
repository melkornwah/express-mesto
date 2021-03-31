const Card = require('../models/cards');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка на сервере.' }));
};

module.exports.createCard = (req, res) => {
  const owner = req.user._id;

  const { name, link } = req.body;

  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные при создании карточки.' });
      } else {
        res.status(500).send({ message: 'Произошла ошибка на сервере.' });
      }
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(new Error('Карточка с указанным _id не найдена.'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.message === 'Карточка с указанным _id не найдена.') {
        res.status(404).send({ message: err.message });
        return;
      }
      res.status(500).send({ message: 'Произошла ошибка на сервере.' });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId,
    { $addToSet: { likes: req.params.userId } },
    { new: true })
    .orFail(new Error('Карточка с указанным _id не найдена.'))
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Переданы некорректные данные для постановки/снятии лайка.' });
        return;
      }
      if (err.message === 'Карточка с указанным _id не найдена.') {
        res.status(404).send({ message: err.message });
        return;
      }
      res.status(500).send({ message: 'Произошла ошибка на сервере.' });
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.params.userId } },
    { new: true },
  )
    .orFail(new Error('Карточка с указанным _id не найдена.'))
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Переданы некорректные данные для постановки/снятии лайка.' });
        return;
      }
      if (err.message === 'Карточка с указанным _id не найдена.') {
        res.status(404).send({ message: err.message });
        return;
      }
      res.status(500).send({ message: 'Произошла ошибка на сервере.' });
    });
};
