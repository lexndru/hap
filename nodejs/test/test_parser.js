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
const HTMLParser = require(path.join(__dirname, '..', 'hap', 'parser'))

const DATAPLAN_XPATH = {
    "declare": {
        "url": "string"
    },
    "define": [
        {
            "url": {
                "query_xpath": "//*/a[@title='Hap GitHub']/@href"
            }
        }
    ]
}

const DATAPLAN_CSS = {
    "declare": {
        "github": "string"
    },
    "define": [
        {
            "github": {
                "query_css": "#github"
            }
        }
    ]
}

const DATAPLAN_PATTERN = {
    "declare": {
        "topic": "string"
    },
    "define": [
        {
            "topic": [
                {
                    "query": "p"
                },
                {
                    "pattern": "This is .* about (.+)\\."
                }
            ]
        }
    ]
}

const DATAPLAN_REMOVE = {
    "declare": {
        "time": "string",
        "alert": "string"
    },
    "define": [
        {
            "time": [
                {
                    "query": "body > div"
                },
                {
                    "remove": "[^1234567890:]"
                }
            ]
        },
        {
            "alert": {
                "glue": "The time is :time"
            }
        }
    ]
}

const DATAPLAN_REPLACE = {
    "declare": {
        "username": "string",
        "sentence": "string"
    },
    "define": [
        {
            "username": [
                {
                    "query_xpath": "//*/a[@id='github']/@href"
                },
                {
                    "pattern": "https?://.+/(.+)/.*"
                }
            ]
        },
        {
            "sentence": [
                {
                    "query": "p"
                },
                {
                    "replace": ["cats", ":username"]
                }
            ]
        }
    ]
}

const HTMLDATA = `
<html>
<head><title>Hap Test</title></head>
<body>
<a href="https://github.com/lexndru/hap" title="Hap GitHub" id="github">Hap GitHub</a>
<p>This is a sentence about cats.</p>
<p>This is a sentence about dogs.</p>
<p>This is a sentence about cars.</p>
<div>12:00 AM</div>
</body>
</html>
`

describe('HTML Parser', () => {

  const mockupURL = 'http://localhost/mockup'
  Cache.writeLink(mockupURL, HTMLDATA) // make hap believe it has it cached

  describe('Evaluate XPath expression', () => {
    it('should return the value of the href attribute', () => {
      DATAPLAN_XPATH['link'] = mockupURL
      let expectedURL = 'https://github.com/lexndru/hap'
      let psr = new HTMLParser(DATAPLAN_XPATH)
      psr.fetch().then(results => {
        let { records, dataplan } = results
        assert.equal(records.url, expectedURL)
      }).catch(e => {
        assert.fail(e.message)
      })
    })
  })

  describe('Evaluate CSS selector', () => {
    it('should return the text value of the node', () => {
      DATAPLAN_CSS['link'] = mockupURL
      let expectedText = 'Hap GitHub'
      let psr = new HTMLParser(DATAPLAN_CSS)
      psr.fetch().then(results => {
        let { records, dataplan } = results
        assert.equal(records.github, expectedText)
      }).catch(e => {
        assert.fail(e.message)
      })
    })
  })

  describe('Evaluate RegEx expression', () => {
    it('should return the matching value from the pattern', () => {
      DATAPLAN_PATTERN['link'] = mockupURL
      let expectedText = 'cats'
      let psr = new HTMLParser(DATAPLAN_PATTERN)
      psr.fetch().then(results => {
        let { records, dataplan } = results
        assert.equal(records.topic, expectedText)
      }).catch(e => {
        assert.fail(e.message)
      })
    })
  })

  describe('Evaluate string manipulation (concatenate)', () => {
    it('should extract the time and generate a new sentence', () => {
      DATAPLAN_REMOVE['link'] = mockupURL
      let psr = new HTMLParser(DATAPLAN_REMOVE)
      psr.fetch().then(results => {
        let { records, dataplan } = results
        assert.equal(records.time, '12:00')
        assert.equal(records.alert, 'The time is 12:00')
      }).catch(e => {
        assert.fail(e.message)
      })
    })
  })

  describe('Evaluate string manipulation (find and replace)', () => {
    it('should extract the time and generate a new sentence', () => {
      DATAPLAN_REPLACE['link'] = mockupURL
      let psr = new HTMLParser(DATAPLAN_REPLACE)
      psr.fetch().then(results => {
        let { records, dataplan } = results
        assert.equal(records.username, 'lexndru')
        assert.equal(records.sentence, 'This is a sentence about lexndru.')
      }).catch(e => {
        assert.fail(e.message)
      })
    })
  })

})
