const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    symbol: String,
    open: Number,
    close: Number,
    high: Number,
    low: Number,
    volume: Number,
    retest: { type: String, default: null },
    timeFrame: String
})

const FilteredPair = mongoose.model('FilteredPair', schema);

module.exports = FilteredPair;