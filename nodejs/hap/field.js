/*
 * Copyright (c) 2018 Alexandru Catrina <alex@codeissues.net>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
const Decimal = require('decimal.js');

module.exports = class Field {

  static get RECORDS() {
    return 'records'
  }

  static get META() {
    return 'meta'
  }

  static get CONFIG() {
    return 'config'
  }

  static get HEADERS() {
    return 'headers'
  }

  static get LINK() {
    return 'link'
  }

  static get DECLARE() {
    return 'declare'
  }

  static get DEFINE() {
    return 'define'
  }

  static get DATA_TYPES() {
    return {
      decimal:    (value) => new Decimal(value),
      string:     (value) => value.toString(),
      text:       (value) => value.toString(),
      integer:    (value) => parseInt(value, 10),
      ascii:      (value) => value.toString(),
      bytes:      (value) => Buffer.from(value, 'utf8'),
      percentage: (value) => parseFloat(value),
      boolean:    (value) => value === 'true'
    }
  }

}
