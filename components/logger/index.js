const config = require('config');
const winston = require('winston');
const { DateTime } = require("luxon");
const jsonStringify = require('fast-safe-stringify');

var custom = winston.format((info, opts) => {
  function buildMsg(mgslog) {
    return {
      time: DateTime.now().toFormat("MMMM dd, yyyy, HH:mm:ss S"),
      pid: process.pid,
      mgslog
    };
  }

  function replaceErrors(key, value) {
    if (value instanceof Error) {
      var error = {};

      Object.getOwnPropertyNames(value).forEach(function(key) {
        error[key] = value[key];
      });
      if (error.stack) {
        error.stack = error.stack.replace(/\s\s+/g, ' ').replace(/[\\]/g, '/');
      }
      return error;
    }

    return value;
  }

  info.message = jsonStringify(info.message, replaceErrors);
  try {
    let temp = JSON.parse(info.message);
    info.message = buildMsg(temp);
  } catch (_e) {
    info.message = buildMsg(info);
  }
  return info
});

function createLogger(level, folderName, levels) {
  let opts = {
    level: level,
    format: winston.format.combine(
      custom(),
      winston.format.json()
    ),
    transports: [
      // - Write to all logs with level `info` and below to `combined.log`
      new(require('winston-daily-rotate-file'))({
        filename: `${folderName}/mbpns-info`,
        localTime: true,
        timestamp: new Date(),
        zippedArchive: false,
        maxsize: 10000000
      }),

      // - Write all logs error (and below) to `error.log`.
      new(require('winston-daily-rotate-file'))({
        filename: `${folderName}/mbpns-error`,
        level: 'error',
        localTime: true,
        timestamp: new Date(),
        zippedArchive: false,
        maxsize: 10000000
      }),

      // - Write to console
      new winston.transports.Console({
        level: "debug",
        colorize: true
      })
    ]
  };
  if (levels) opts.levels = levels;
  return winston.createLogger(opts);
}

let logPath = config.logsPath;
if (['win32', 'darwin'].indexOf(process.platform) > -1) {
  logPath = 'logs';
} 

const Logger = createLogger('info', `${logPath}/logs`);
module.exports = Logger;