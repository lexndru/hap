// Copyright (c) 2018 Alexandru Catrina <alex@codeissues.net>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

const assert = require('assert')
const path = require('path')

const { Type } = require(path.join(__dirname, '..', 'hap', 'utils'))


describe('Utils', () => {

  describe('Determine field datatype', () => {
    it('should detect one and only one datatype', () => {
      let string = 'a string'
      let number = 2018
      let object = { hap: 'hello world' }
      let array = [1, 2, 3, 'hello, hap']
      assert.equal(Type.isString(string), true) // this is the correct one
      assert.equal(Type.isString(number), false)
      assert.equal(Type.isString(object), false)
      assert.equal(Type.isString(array), false)
      assert.equal(Type.isNumber(string), false)
      assert.equal(Type.isNumber(number), true) // this is the correct one
      assert.equal(Type.isNumber(object), false)
      assert.equal(Type.isNumber(array), false)
      assert.equal(Type.isObject(string), false)
      assert.equal(Type.isObject(number), false)
      assert.equal(Type.isObject(object), true) // this is the correct one
      assert.equal(Type.isObject(array), false)
      assert.equal(Type.isArray(string), false)
      assert.equal(Type.isArray(number), false)
      assert.equal(Type.isArray(object), false)
      assert.equal(Type.isArray(array), true) // this is the correct one
    })
  })

})
