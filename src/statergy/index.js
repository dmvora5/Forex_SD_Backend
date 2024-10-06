const { StructuralSdIndicator: { StructuralSD } } = require("technical-strategies");

const Pair = require("../models/Pairs");
const { fetchStockData } = require("../services/stockDataFetcher");
const { getTimeFramsBackDays, TIMEFRAME } = require("../utils");
const { logger } = require("../utils/logger");
const FilteredPair = require("../models/FiltredPair");
const { getSelectedPairs } = require("../config/socket");



const filterpairs = async ({
    pageSize = 50,
    timeFrame = TIMEFRAME.FIFTEENM
}) => {
    const filter = [];

    const count = await Pair.countDocuments();
    console.log('count', count);

    const totalPages = Math.ceil(count / pageSize);

    for (let i = 1; i <= totalPages; i++) {
        console.log(i);

        const pairs = await Pair.find({}).skip((i - 1) * pageSize).limit(pageSize).lean();
        const pairPromisis = pairs.map(pair => {
            return async () => {
                try {
                    const data = await fetchStockData({ days: getTimeFramsBackDays(timeFrame), interval: timeFrame, symbol: pair.symbol });

                    const sd = new StructuralSD({
                        data: data,
                        indicatorConfig: {
                            lookBackCandlesForSignal: 2
                        }
                    });

                    const result = sd.apply({ leval: false });
                    if (result) {
                        return {
                            symbol: pair.symbol,
                            timeFrame,
                            ...result
                        };
                    } else {
                        return null;
                    }
                } catch (err) {
                    logger.error(`Error processing pair ${pair.symbol}: ${err.message}`);
                    return null;

                }
            }
        });

        const results = await Promise.all(pairPromisis.map(p => p()));
        filter.push(...results.filter(pair => pair !== null));
        filter.map(pair => ({
            ...pair,
            timeFrame: timeFrame
        }))

        await FilteredPair.deleteMany({
            timeFrame: timeFrame
        })
        await FilteredPair.insertMany(filter);
    }

}



const getAllFilteredRecords = async () => {
    const recordsByTimeFrame = await FilteredPair.aggregate([
        {
          $group: {
            _id: "$timeFrame", // Group by timeFrame
            records: { $push: "$$ROOT" } // Collect all records for each timeFrame
          }
        },
        {
          $project: {
            _id: 0, // Remove the _id field from the final output
            timeFrame: "$_id", // Move _id to timeFrame key
            records: 1 // Include the records field
          }
        }
      ]);

      
      // Convert array to an object with timeFrame as keys
      const groupedByTimeFrame = recordsByTimeFrame.reduce((acc, item) => {
        acc[item.timeFrame] = item.records;
        return acc;
      }, {});


      return groupedByTimeFrame;
}

const getCommonRecords = async () => {
    const commonRecords = await FilteredPair.aggregate([
        {
          $group: {
            _id: "$symbol", // Group by symbol
            timeFramesPresent: { $addToSet: "$timeFrame" }, // Collect unique time frames for each symbol
            records: { $push: "$$ROOT" }, // Keep the full records
            retestValues: { 
              $addToSet: { 
                $cond: [{ $ne: ["$retest", null] }, "$retest", null] // Only add non-null retest values
              }
            } // Collect unique non-null retest values
          }
        },
        {
          $addFields: {
            timeFrameCount: { $size: "$timeFramesPresent" }, // Count unique time frames per symbol
            retestCount: { $size: "$retestValues" } // Count unique non-null retest values
          }
        },
        {
          $match: {
            timeFrameCount: { $gte: 3 }, // Ensure the symbol has at least 3 different time frames
            retestCount: 1, // Ensure there's only one unique non-null retest value across time frames
            "retestValues.0": { $ne: null } // Ensure that the unique retest value is not null
          }
        }      
      ]);
            
      console.log(commonRecords);  
  
      return commonRecords;
}


const sdStatergy = async ({
    pageSize = 50
}) => {
    try {
        await Promise.all([
            filterpairs({ timeFrame: TIMEFRAME.ONEDAY, pageSize }),
            filterpairs({ timeFrame: TIMEFRAME.ONEHOUR, pageSize }),
            filterpairs({ timeFrame: TIMEFRAME.FIFTEENM, pageSize }),
        ])

        const [allTimeFrameRecords, commonRecords] = await Promise.all([
            getAllFilteredRecords(),
            getCommonRecords()
        ]);

        getSelectedPairs({
            eventName: "FILTER",
            data: {
                allTimeFrameRecords,
                commonRecords 
            }
        })

    } catch (err) {
        console.log('err', err)
        logger.error("[SDERROR]", err.message)
    }

};


module.exports = { sdStatergy }