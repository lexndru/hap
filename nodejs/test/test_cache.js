//
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

const Cache = require(path.join(__dirname, '..', 'hap', 'cache'))


describe('Cache system', () => {

  describe('Transform URL into friendly file', () => {
    it('should remove unallowed characters in a filename', () => {
      let goodFilename = 'github_com_lexndru_hap'
      let friendlyFilename = Cache.getFile('http://github.com/lexndru/hap')
      assert.equal(goodFilename, friendlyFilename)
    })
  })

  describe('Remove non-friendly characters', () => {
    it('should replace non-friendly characters with an underscore', () => {
      let badFilename = '~!bad@#$%^filename&*()1234567890'
      let goodFilename = '__bad_____filename____1234567890'
      let friendlyFilename = Cache.friendlyFile(badFilename)
      assert.equal(goodFilename, friendlyFilename)
    })
  })

  describe('Write to disk and read content', () => {
    it('should write to disk "hap" and be able to read it', () => {
      let link = 'http://github.com/lexndru/hap'
      assert.doesNotThrow(() => {
        Cache.writeLink(link, 'hap')
      }, Error)
      let content
      assert.doesNotThrow(() => {
        content = Cache.readLink(link)
      }, Error)
      assert.equal(content, 'hap')
    })
  })

  describe('Attempt to read invalid data from disk', () => {
    it('should throw an error if truly there is nothing to read', () => {
      assert.throws(() => {
        Cache.readLink('non existing link')
      }, /^error: no cache to read$/i)
    })
  })

  describe('Attempt to write/read empty file', () => {
    it('should throw an error on both write and read operations', () => {
      assert.throws(() => {
        Cache.writeLink('', '')
      }, /^error: missing cache path$/i)
      assert.throws(() => {
        Cache.writeLink('hap_test.html', '')
      }, /^error: missing cache data$/i)
      let badFile = path.join(Cache.DIRECTORY, 'hap_test_html')
      file.writeFileSync(badFile, '')
      assert.throws(() => {
        Cache.readLink('hap_test_html')
      }, /^error: empty file$/i)
      file.unlinkSync(badFile)
    })
  })

})
