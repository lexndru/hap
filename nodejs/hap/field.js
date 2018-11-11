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

const Decimal = require('decimal.js')

const path = require('path')

const { Type } = require(path.join(__dirname, 'utils'))

/*
 * Helper function to cast to boolean
 */
let parseBoolean = (value) => {
  if (value === true) {
    return true
  } else if (value === false) {
    return false
  } else if (Type.isString(value)) {
    let boolString = value.toString().toLowerCase()
    if (boolString === 'true' || boolString === '1') {
      return true
    } else if (boolString === 'false' || boolString === '0') {
      return false
    }
  }
  throw new Error(`Non-boolean value: "${value}" (${typeof value})`)
}

/*
 * Supported fields instances for dataplans.
 */
class Field {
  static get RECORDS () {
    return 'records'
  }

  static get META () {
    return 'meta'
  }

  static get CONFIG () {
    return 'config'
  }

  static get HEADERS () {
    return 'headers'
  }

  static get LINK () {
    return 'link'
  }

  static get DECLARE () {
    return 'declare'
  }

  static get DEFINE () {
    return 'define'
  }

  static get DATA_TYPES () {
    return {
      decimal: decimal => parseFloat(new Decimal(decimal.toString().trim())),
      string: string => string.toString(),
      text: text => text.toString(),
      integer: integer => parseInt(integer, 10),
      ascii: ascii => ascii.toString(),
      bytes: bytes => Buffer.from(bytes, 'utf8'),
      percentage: percentage => parseFloat(percentage),
      boolean: boolean => parseBoolean(boolean)
    }
  }
}

module.exports = Field
