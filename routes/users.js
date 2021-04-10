const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUsers, getUserById, getCurrentUser, updateUser, updateAvatar,
} = require('../controllers/users');

router.get('/users', getUsers);

router.get('/users/me', celebrate({
  params: Joi.object().keys({
    _id: Joi.string()
      .required()
      .hex()
      .length(24),
  }),
}), getCurrentUser);

router.get('/users/:userId', celebrate({
  params: Joi.object().keys({
    _id: Joi.string()
      .required()
      .hex()
      .length(24),
  }),
}), getUserById);

router.patch('/users/me', celebrate({
  params: Joi.object().keys({
    _id: Joi.string()
      .required()
      .hex()
      .length(24),
  }),
  body: Joi.object().keys({
    name: Joi.string()
      .required()
      .min(1),
    about: Joi.string()
      .required()
      .min(1),
  }),
}), updateUser);

router.patch('/users/me/avatar', celebrate({
  params: Joi.object().keys({
    _id: Joi.string()
      .required()
      .hex()
      .length(24),
  }),
  body: Joi.object().keys({
    avatar: Joi.string()
      .required()
      .pattern(new RegExp(/(https|http)?:\/\/.*/i)),
  }),
}), updateAvatar);

module.exports = router;
