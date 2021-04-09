const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUsers, getUserById, getCurrentUser, updateUser, updateAvatar,
} = require('../controllers/users');

router.get('/users', getUsers);

router.get('/users/me', getCurrentUser);

router.get('/users/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string()
      .min(24)
      .max(24)
      .hex()
      .required(),
  }),
}), getUserById);

router.patch('/users/me', updateUser);

router.patch('/users/me/avatar', celebrate({
  body: Joi.object().keys({
    link: Joi.string()
      .regex(/^(http|https):\/\/[www.]*\d*\D{2,}\.(jpg|png|jpeg|gif)/i),
  }),
}), updateAvatar);

module.exports = router;
