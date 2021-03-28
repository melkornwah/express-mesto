const Card = require("../models/cards");

module.exports.getCards = (req, res) => {
  Card.find({})
    .then(cards => res.send({ data: cards }))
    .catch(err => res.status(500).send({ message: "Произошла ошибка на сервере." }));
};

module.exports.createCard = (req, res) => {
  const owner = req.user._id;

  const { name, link } = req.body;

  Card.create({ name, link, owner })
    .then(card => res.send({ data: card }))
    .catch(err => {
      if(err.name === "ValidationError") {
        res.status(400).send({ message: "Переданы некорректные данные при создании карточки." });
      } else {
        res.status(500).send({ message: "Произошла ошибка на сервере." });
      }
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(err => res.send({ message: "Карточка с указанным _id не найдена." }))
    .then(card => res.send({ data: card }))
    .catch(err => res.status(500).send({ message: "Произошла ошибка на сервере." }));
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail(err => res.send({ message: "Карточка с указанным _id не найдена." }))
    .then(card => {
      res.send({ data: card });
    })
    .catch(err => {
      if(err.name === "CastError") {
        res.status(400).send({ message: "Переданы некорректные данные для постановки/снятии лайка." });
      } else {
        res.status(500).send({ message: "Произошла ошибка на сервере." });
      }
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
  .orFail(err => res.send({ message: "Карточка с указанным _id не найдена." }))
  .then(card => {
    res.send({ data: card });
  })
  .catch(err => {
    if(err.name === "CastError") {
      res.status(400).send({ message: "Переданы некорректные данные для постановки/снятии лайка." });
    } else {
      res.status(500).send({ message: "Произошла ошибка на сервере." });
    }
  });
};
