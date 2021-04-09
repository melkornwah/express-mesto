const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
} = require('../controllers/cards');

router.get('/cards', getCards);

router.post('/cards', celebrate({
  body: Joi.object().keys({
    link: Joi.string()
      .regex(/^(http|https):\/\/[www.]*\d*\D{2,}\.(jpg|png|jpeg|gif)/i),
  }),
}), createCard);

router.delete('/cards/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string()
      .min(24)
      .max(24)
      .hex()
      .required(),
  }),
}), deleteCard);

router.put('/cards/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string()
      .min(24)
      .max(24)
      .hex()
      .required(),
  }),
}), likeCard);

router.delete('/cards/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string()
      .min(24)
      .max(24)
      .hex()
      .required(),
  }),
}), dislikeCard);

module.exports = router;
