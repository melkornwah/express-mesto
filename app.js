const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const { celebrate, Joi } = require('celebrate');
const usersRoute = require('./routes/users');
const cardsRoute = require('./routes/cards');
const auth = require('./middlewares/auth');
const { createUser, login } = require('./controllers/users');
const NotFoundError = require('./errors/not-found-error');

const app = express();

app.use(helmet());

app.disable('x-powered-by');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.post('/signup', celebrate({
  body: Joi.object().keys({
    link: Joi.string()
      .regex(/^(http|https):\/\/[www.]*\d*\D{2,}\.(jpg|png|jpeg|gif)/i),
  }),
}), createUser);
app.post('/signin', login);

app.use(auth);

app.use('/', usersRoute, cardsRoute);

app.use('*', () => {
  throw new NotFoundError('Страница не найдена.');
});

app.use((err, req, res, next) => {
  res.status(err.statusCode).send({ message: err.message });

  next();
});

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('App is running...');
});
