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

const fs = require('fs')

/*
 * Define dataplan encoding as UTF-8 charset
 */
const UTF8 = 'utf8'

/*
 * Define JSON indentation on dataplan update
 */
const JSON_INDENT = 4

/*
 * Line formatted JSON with indentation
 */
const prettyJSON = json => JSON.stringify(json, null, JSON_INDENT)

/*
 * JavaScript datatype detector
 */
class Type {
  constructor (object) {
    this.object = object
  }

  getSignature () {
    return Object.prototype.toString.call(this.object)
  }

  static get OBJECT () {
    return '[object Object]'
  }

  static isObject (x) {
    return new Type(x).getSignature() === Type.OBJECT
  }

  static get ARRAY () {
    return '[object Array]'
  }

  static isArray (x) {
    return new Type(x).getSignature() === Type.ARRAY
  }

  static get STRING () {
    return '[object String]'
  }

  static isString (x) {
    return new Type(x).getSignature() === Type.STRING
  }

  static get NUMBER () {
    return '[object Number]'
  }

  static isNumber (x) {
    return new Type(x).getSignature() === Type.NUMBER
  }
}

class JSONDataContent {
  constructor (hasFailed, rawContent, jsonData) {
    this._hasFailed = hasFailed
    this._rawContent = rawContent
    this._jsonData = jsonData
  }

  getRawContent () {
    return this._rawContent
  }

  getContent () {
    return this._jsonData
  }

  getErorr () {
    return this._hasFailed ? this._rawContent : ''
  }

  hasFailed () {
    return this._hasFailed
  }
}

/*
 * Input file I/O wrapper
 */
class JSONDataReaderWriter {
  constructor (filepath) {
    if (!Type.isString(filepath)) {
      throw new Error(`Filepath must be string`)
    }
    this.filepath = filepath
  }

  read () {
    let content, data, success

    try {
      content = fs.readFileSync(this.filepath, UTF8)
      data = JSON.parse(content)
      success = true
    } catch (e) {
      content = e.toString()
      data = null
      success = false
    }

    return new JSONDataContent(!success, content, data)
  }

  write (data) {
    let content, success

    try {
      content = prettyJSON(data)
      fs.writeFileSync(this.filepath, content, {
        encoding: UTF8
      })
      success = true
    } catch (e) {
      content = e.toString()
      success = false
    }

    return new JSONDataContent(!success, content, data)
  }

  static fromFile (filepath) {
    return new JSONDataReaderWriter(filepath).read()
  }

  static toFile (filepath, dataplan) {
    return new JSONDataReaderWriter(filepath).write(dataplan)
  }
}

module.exports = {
  Type: Type,
  ReaderWriter: JSONDataReaderWriter,
  pretty: prettyJSON
}
