require('dotenv').config();
const db = require("../src/config/dbConnect");
const Pair = require('../src/models/Pairs');

const currencyPairs = [
    'USDEUR=X', // US Dollar to Euro
    'USDGBP=X', // US Dollar to British Pound
    'USDJPY=X', // US Dollar to Japanese Yen
    'USDCAD=X', // US Dollar to Canadian Dollar
    'USDCHF=X', // US Dollar to Swiss Franc
    'AUDUSD=X', // Australian Dollar to US Dollar
    'NZDUSD=X', // New Zealand Dollar to US Dollar
    'EURGBP=X', // Euro to British Pound
    'EURJPY=X', // Euro to Japanese Yen
    'GBPJPY=X', // British Pound to Japanese Yen
    'GBPCHF=X', // British Pound to Swiss Franc
    'EURCHF=X', // Euro to Swiss Franc
    'EURCAD=X', // Euro to Canadian Dollar
    'EURAUD=X', // Euro to Australian Dollar
    'AUDJPY=X', // Australian Dollar to Japanese Yen
    'CADJPY=X', // Canadian Dollar to Japanese Yen
    'AUDCAD=X', // Australian Dollar to Canadian Dollar
    'NZDJPY=X', // New Zealand Dollar to Japanese Yen
    'NZDCAD=X', // New Zealand Dollar to Canadian Dollar
    'EURNZD=X', // Euro to New Zealand Dollar
    'EURSEK=X', // Euro to Swedish Krona
    'EURDKK=X', // Euro to Danish Krone
    'EURZAR=X', // Euro to South African Rand
    'USDZAR=X', // US Dollar to South African Rand
    'USDTRY=X', // US Dollar to Turkish Lira
    'USDINR=X', // US Dollar to Indian Rupee
    'USDCNY=X', // US Dollar to Chinese Yuan
    'USDMXN=X'  // US Dollar to Mexican Peso
];

module.exports = currencyPairs;



db.once('open', async () => {
    try {
        console.log("start")
        await Pair.deleteMany();
        await Pair.insertMany(currencyPairs.map(ele => ({
            symbol: ele
        })));
        console.log("finish");
        process.exit(0);
    } catch (err) {
        console.log('err', err);
        process.exit(1)
    }
});

db.on('error', console.error.bind(console, 'MongoDB connection error:'));