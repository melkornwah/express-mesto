const jwt = require('jsonwebtoken');
const Card = require('../models/cards');
const BadRequestError = require('../errors/bad-request-error');
const NotFoundError = require('../errors/not-found-error');
const ServerError = require('../errors/server-error');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => {
      throw new ServerError('Произошла ошибка на сервере.');
    })
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const owner = req.user._id;

  const { name, link } = req.body;

  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные при создании карточки.');
      }
      throw new ServerError('Произошла ошибка на сервере.');
    })
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(new Error('Карточка с указанным _id не найдена.'))
    .then((card) => {
      const ownerId = (card.owner).toString();

      if (ownerId === req.user._id) {
        return Card.findByIdAndRemove(req.params.cardId)
          .then(() => res.send({ message: 'Карточка была удалена.' }));
      }
      throw new Error('Вы не являетесь владельцем карточки.');
    })
    .catch((err) => {
      if (err.message === 'Карточка с указанным _id не найдена.') {
        throw new NotFoundError(err.message);
      }
      if (err.kind === 'ObjectId') {
        throw new BadRequestError('Неверно указан _id карточки.');
      }
      if (err.message === 'Вы не являетесь владельцем карточки.') {
        throw new BadRequestError(400, 'Вы не являетесь владельцем карточки.');
      }
      throw new ServerError('Произошла ошибка на сервере.');
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
        throw new NotFoundError(404, err.message);
      }
      if (err.kind === 'ObjectId') {
        throw new BadRequestError('Переданы некорректные данные для постановки или снятия лайка.');
      }
      throw new ServerError('Произошла ошибка на сервере.');
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
        throw new NotFoundError(err.message);
      }
      if (err.kind === 'ObjectId') {
        throw new BadRequestError('Переданы некорректные данные для постановки или снятия лайка.');
      }
      throw new ServerError('Произошла ошибка на сервере.');
    })
    .catch(next);
};
