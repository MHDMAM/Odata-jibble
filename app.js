process.env.port = process.env.port || '9999';
process.env.NODE_ENV = process.env.NODE_ENV || 'sit';

const config = require("config");
const logger = require("./components/logger/index");
const PORT = process.env.port || config.get('port');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const https = require('https');
const http = require('http');
const fs = require('fs');
const routes = require('./routes.js');

app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

app.use('/v1/trippin', routes);

let server;
if (process.env.SSL === true) {
  const credentials = {
    key: fs.readFileSync(__dirname + config.certs.key),
    cert: fs.readFileSync(__dirname + config.certs.cert),
    // minVersion: 'TLSv1' // if working with legacy system doesn't support upper version.
  };

  server = https.createServer(credentials, app).listen(PORT, function() {
    logger.info(`Server started at port SSL: [${PORT}] NODE_ENV: [${config.util.getEnv('NODE_ENV')}]`);
  })
} else {
  server = http.createServer(app).listen(PORT, function() {
    logger.info(`Server started at port: [${PORT}] NODE_ENV: [${config.util.getEnv('NODE_ENV')}]`);
  })
}
app.use(function(err, req, res, next) {
  logger.error({
    route: 'Error-handling middleware',
    error_message: err && err.message,
    error_stack: err && err.stack,
    body: req.body
  })
  return res.sendStatus(500);
});

process.on('unhandledRejection', function(reason, p) {
  /* I just caught an unhandled promise rejection, 
     since we already have fallback handler for unhandled errors (see below),
     let throw and let him handle that
  */

  logger.error({
    path: 'unhandledRejection',
    error: reason,
    message: reason && reason.message,
    p: p
  })
  throw reason;
});

process.on('deprecation', (dep) => {
  logger.info({
    route: 'Deprecation',
    stack: dep && dep.stack,
    message: dep && dep.message
  })
});

process.on('warning', (warning) => {
  logger.debug({
    route: 'warning',
    stack: warning && warning.stack,
    message: warning && warning.message
  })
});

function crashPeacefullyPlease() {
  logger.info({
    msg: 'Closing server...'
  });
  server.close(() => {
    logger.info({
      msg: 'Server closed !!! '
    });
    process.exit();
  })
  // Force close server after 5secs
  setTimeout((e) => {
    logger.info({
      msg: 'Forcing server close !!!',
      error_message: e
    });
    process.exit();
  }, 5000);
};

process.on('uncaughtException', (err) => {
  logger.error({
    msg: 'Uncaught Exception in app.',
    route: 'uncaughtException',
    error_message: err && err.message,
    error_stack: err && err.stack
  });

  crashPeacefullyPlease();
});

process.on('deprecation', (dep) => {
  logger.info({
    msg: 'Warning in app.',
    route: 'warning',
    stack: dep && dep.stack,
    dep
  });
});

/**
 * Event listener for HTTP server "error" event.
 * Not sure: **testing**
 */
server.on('error', onError);

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof PORT === 'string' ?
    'Pipe ' + PORT :
    'Port ' + PORT;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error({
        msg: 'Error - requires elevated privileges.',
        route: 'onError',
        error_message: bind + ' requires elevated privileges',
      });
      crashPeacefullyPlease();

      break;
    case 'EADDRINUSE':
      logger.error({
        msg: 'Error - already in use.',
        route: 'onError',
        error_message: bind + ' is already in use',
      });
      crashPeacefullyPlease();

      break;
    default:
      throw error;
  }
};

// politely ask a program to terminate.
process.on('SIGINT', () => {
  crashPeacefullyPlease();
});

// cause program termination.
process.on('SIGTERM', () => {
  crashPeacefullyPlease();
});