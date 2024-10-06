const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    symbol: String,
})

const Pair = mongoose.model('Pair', schema);

module.exports = Pair;