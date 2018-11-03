// Copyright (c) 2018 Alexandru Catrina <alex@codeissues.net>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

const { createLogger, format, transports } = require('winston')

/*
 * Log wrapper. That's it...
 */
class Log {
  static get VERBOSE_LEVEL () {
    return 'debug'
  }

  static get NOTICE_LEVEL () {
    return 'warn'
  }

  static initialize (logLevel) {
    return createLogger({
      level: logLevel,
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss,SSS'
        }),
        format.printf(info => `${info.timestamp} ${info.message}`)
      ),
      transports: [new transports.Console()]
    })
  }

  static enableVerbose () {
    Log.logger = Log.initialize(Log.VERBOSE_LEVEL)
  }

  static disableVerbose () {
    Log.logger = Log.initialize(Log.NOTICE_LEVEL)
  }

  static info (message) {
    Log.logger.info(message)
  }

  static debug (message) {
    Log.logger.debug(message)
  }

  static warn (message) {
    Log.logger.warn(message)
  }

  static error (message) {
    Log.logger.error(message)
  }

  static fatal (message) {
    Log.logger.error(message)
    process.exit(1)
  }
}

Log.logger = Log.initialize(Log.NOTICE_LEVEL)

module.exports = Log
