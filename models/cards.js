const { ObjectId } = require('bson');
const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  link: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        return /^(http|https):\/\/[www.]*\d*\D{2,}/ig.test(v);
      },
    },
  },
  owner: {
    type: ObjectId,
    required: true,
  },
  likes: {
    type: [ObjectId],
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  __v: {
    type: Number, select: false,
  },
});

module.exports = mongoose.model('card', cardSchema);
