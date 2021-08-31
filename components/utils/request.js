const request = require('axios');
const _ = require('lodash');

async function _Send(options) {
  return request(options)
    .then(result => {
      return Promise.resolve(result.data);
    })
    .catch(err => {
      return Promise.reject(err);
    });
};

/**
 * Ensures that the given RetryConfig object is valid.
 *
 * @param retry The configuration to be validated.
 */
function validateRetryConfig(retry) {
  if (!_.isNumber(retry.maxRetries) || retry.maxRetries < 0) {
    throw new Error("maxRetries must be a non-negative integer");
  }

  if (typeof retry.backOffFactor !== "undefined") {
    if (!_.isNumber(retry.backOffFactor) || retry.backOffFactor < 0) {
      throw new Error("backOffFactor must be a non-negative number");
    }
  }

  if (!_.isNumber(retry.maxDelayInMillis) || retry.maxDelayInMillis < 0) {
    throw new Error("maxDelayInMillis must be a non-negative integer");
  }

  if (typeof retry.statusCodes !== "undefined" && !_.isArray(retry.statusCodes)) {
    throw new Error("statusCodes must be an array");
  }

  if (typeof retry.ioErrorCodes !== "undefined" && !_.isArray(retry.ioErrorCodes)) {
    throw new Error("ioErrorCodes must be an array");
  }
}

/**
 * Default retry configuration for HTTP requests. Retries up to 4 times on connection reset and
 * timeout errors as well as HTTP 503 errors. Exposed as a function to ensure that every HttpClient
 * gets its own RetryConfig instance.
 */

const DefaultRetryConfig = module.exports.defaultRetryConfig = function() {
  return {
    /** Maximum number of times to retry a given request. */
    maxRetries: 4,

    /** HTTP status codes that should be retried. */
    statusCodes: [503],

    /** Low-level I/O error codes that should be retried. */
    ioErrorCodes: ["ECONNRESET", "ETIMEDOUT"],

    /**
     * The multiplier for exponential back off. The retry delay is calculated in seconds using
     * the formula `(2^n) * backOffFactor`, where n is the number of retries performed so far.
     * When the backOffFactor is set to 0, retries are not delayed. When the backOffFactor is 1,
     * retry duration is doubled each iteration.
     */
    backOffFactor: 0.5,

    /** Maximum duration to wait before initiating a retry. */
    maxDelayInMillis: 60 * 1000
  }
};

module.exports.HttpClient = class HttpClient {
  constructor(retry = DefaultRetryConfig()) {
    if (this.retry) {
      validateRetryConfig(this.retry);
    }
  }

  /**
   * Sends an HTTP request to a remote server. If the server responds with a successful response
   * (2xx), the returned promise resolves with an HttpResponse. If the server responds with an
   * error (3xx, 4xx, 5xx), the promise rejects with an HttpError. In case of all other errors,
   * the promise rejects with a default Error. If a request fails due to a low-level network error,
   * transparently retries the request once before rejecting the promise.
   *
   * If the request data is specified as an object, it will be serialized into a JSON string.
   * The application/json content-type header will also be automatically set in this case.
   * For all other payload types, the content-type header should be explicitly set by the caller.
   * To send a JSON leaf value (e.g. "foo", 5), parse it into JSON, and pass as a string or a Buffer
   * along with the appropriate content-type header.
   *
   * @param {HttpRequest} config HTTP request to be sent.
   * @return {Promise<HttpResponse>} A promise that resolves with the response details.
   */
  async send(config) {
    return _Send(config)
      .then(resp => {
        return resp;
      })
      .catch(err => {
        if (err.response) {
          throw new Error(JSON.stringify(err.response));
        }
        if (err.error.code === "ETIMEDOUT") {
          throw new Error(`Error while making request: ${err.message}.`);
        }
        throw new Error(`Error while making request: ${err.message}. Error code: ${err.error.code}`);
      });
  }

  async sendWithRetry(config, retryAttempts = 0) {
    return _Send(config)
      .then(resp => {
        return resp;
      })
      .catch(err => {
        const [delayMillis, canRetry] = this.getRetryDelayMillis(retryAttempts, err);
        if (canRetry && delayMillis <= this.retry.maxDelayInMillis) {
          return this.waitForRetry(delayMillis).then(() => {
            return this.sendWithRetry(config, retryAttempts + 1);
          });
        }
        if (err.response) {
          throw new Error(JSON.stringify(err));
        }
        if (err.error && err.error.code === "ETIMEDOUT") {
          throw new Error(`Error while making request: ${err.message}.`);
        }
        throw new Error(`Error while making request: ${err.message}. Error code: ${err.error && err.error.code} - ${err}`);
      });
  }

  async waitForRetry(delayMillis) {
    if (delayMillis > 0) {
      return new Promise(resolve => {
        setTimeout(resolve, delayMillis);
      });
    }
    return Promise.resolve();
  }

  /**
   * Parses the Retry-After HTTP header as a milliseconds value.
   * Return value is negative if the Retry-After header
   * Contains an expired timestamp or otherwise malformed.
   */
  parseRetryAfterIntoMillis(retryAfter) {
    const delaySeconds = parseInt(retryAfter, 10);
    if (!isNaN(delaySeconds)) {
      return delaySeconds * 1000;
    }

    const date = new Date(retryAfter);
    if (!isNaN(date.getTime())) {
      return date.getTime() - Date.now();
    }
    return -1;
  }

  backOffDelayMillis(retryAttempts) {
    if (retryAttempts === 0) {
      return 0;
    }

    const backOffFactor = this.retry.backOffFactor || 0;
    const delayInSeconds = 2 ** retryAttempts * backOffFactor;
    return Math.min(delayInSeconds * 1000, this.retry.maxDelayInMillis);
  }

  /**
   * Checks if a failed request is eligible for a retry, and if so returns the duration to wait
   * before initiating the retry.
   *
   * @param {number} retryAttempts Number of retries completed up to now.
   * @param {LowLevelError} err The last encountered error.
   *
   * @returns {[number, boolean]} A 2-tuple where the
   * 1st element is the duration to wait before another retry, and the
   * 2nd element is a boolean indicating whether the request is eligible for a retry or not.
   */
  getRetryDelayMillis(retryAttempts, err) {
    if (!this.isRetryEligible(retryAttempts, err)) {
      return [0, false];
    }
    let response = err.response;
    let headers = response ? response.headers : undefined;
    if (headers && headers["retry-after"]) {
      const delayMillis = this.parseRetryAfterIntoMillis(headers["retry-after"]);
      if (delayMillis > 0) {
        return [delayMillis, true];
      }
    }

    return [this.backOffDelayMillis(retryAttempts), true];
  }

  isRetryEligible(retryAttempts, err) {
    if (!this.retry) {
      return false;
    }

    if (retryAttempts >= this.retry.maxRetries) {
      return false;
    }
    if (err.response) {
      const statusCodes = this.retry.statusCodes || [];
      return statusCodes.indexOf(err.response.status) !== -1;
    }

    const retryCodes = this.retry.ioErrorCodes || [];
    return retryCodes.indexOf(err.error.code) !== -1;
  }
}