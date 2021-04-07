const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const Card = require('../models/cards');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => {
      throw createError(500, 'Произошла ошибка на сервере.');
    })
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const owner = jwt._id;

  const { name, link } = req.body;

  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw createError(400, 'Переданы некорректные данные при создании карточки.');
      }
      throw createError(500, 'Произошла ошибка на сервере.');
    })
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(new Error('Карточка с указанным _id не найдена.'))
    .then((card) => {
      if (!(card.owner._id === jwt._id)) {
        return new Error(401, 'Вы не являетесь владельцем карточки.');
      }

      return res.send({ data: card });
    })
    .catch((err) => {
      if (err.message === 'Карточка с указанным _id не найдена.') {
        throw createError(404, err.message);
      }
      if (err.kind === 'ObjectId') {
        throw createError(400, 'Неверно указан _id карточки.');
      }
      throw createError(500, 'Произошла ошибка на сервере.');
    })
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId,
    { $addToSet: { likes: jwt._id } },
    { new: true })
    .orFail(new Error('Карточка с указанным _id не найдена.'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.message === 'Карточка с указанным _id не найдена.') {
        throw createError(404, err.message);
      }
      if (err.kind === 'ObjectId') {
        throw createError(400, 'Переданы некорректные данные для постановки или снятия лайка.');
      }
      throw createError(500, 'Произошла ошибка на сервере.');
    })
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: jwt._id } },
    { new: true },
  )
    .orFail(new Error('Карточка с указанным _id не найдена.'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.message === 'Карточка с указанным _id не найдена.') {
        throw createError(404, err.message);
      }
      if (err.kind === 'ObjectId') {
        throw createError(400, 'Переданы некорректные данные для постановки или снятия лайка.');
      }
      throw createError(500, 'Произошла ошибка на сервере.');
    })
    .catch(next);
};
