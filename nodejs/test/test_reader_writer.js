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
const file = require('fs')

const { ReaderWriter } = require(path.join(__dirname, '..', 'hap', 'utils'))


describe('Disk Reader/Writer', () => {

  describe('Attempt to write to an invalid filename', () => {
    it('should throw an error for any non-string values', () => {
      assert.throws(() => {
        ReaderWriter.toFile(null, 'hap_test')
      }, /^error: filepath must be string$/i)
    })
  })

  describe('Attempt to read from an invalid filename', () => {
    it('should throw an error for any non-string values', () => {
      assert.throws(() => {
        ReaderWriter.fromFile(null)
      }, /^error: filepath must be string$/i)
    })
  })

  describe('Write some data to a file and then read it', () => {
    it('should be able to write/read to disk and keep data integrity', () => {
      let data = { hap: "lorem ipsum", test: true }
      let results = ReaderWriter.toFile('/tmp/.haptest', data)
      assert.equal(results.hasFailed(), false)
      let content = ReaderWriter.fromFile('/tmp/.haptest')
      assert.equal(content.hasFailed(), false)
      assert.deepEqual(content.getContent(), data)
      file.unlinkSync('/tmp/.haptest')
    })
  })

})
