const { catchAsyncError } = require("../utils");
const ErrorHandler = require("../Error/ErrorHandler");

const schedulerManager = require("../SchedulerManager/schedulerManager");
const { sdStatergy } = require("../statergy");



exports.runStatergyAction = catchAsyncError(async (req, res, next) => {

    const statergyName = "Filter";

    if (schedulerManager.listJobs().includes(statergyName)) {
        return next(new ErrorHandler("Statergy already running", 400))
    }

    schedulerManager.addJob(statergyName, {
        initialHour: 4,
        initialMinute: 30,
        intervalMinutes: 5,
        jobFunction: sdStatergy.bind(null, {})
    });

    return res.status(200).json({
        success: true,
        message: "Statergy run successfully"
    });

})