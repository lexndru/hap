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

const url = require('url')
const file = require('fs')
const path = require('path')

/*
 * HTML cache wrapper.
 *
 * Adds support to cache an URL's content and store it as much as the user
 * wants. Cache files are named after the URI.
 */
class Cache {
  static get DIRECTORY () {
    return '.cache'
  }

  static get CACHE_TTL () {
    return 60 * 60 * 1000 // 1 hour in milliseconds
  }

  static getFile (link) {
    let cacheFile = ''
    let parsedURL = url.parse(link)
    if (parsedURL.hostname) {
      cacheFile += Cache.friendlyFile(parsedURL.hostname)
    }
    if (parsedURL.pathname) {
      cacheFile += Cache.friendlyFile(parsedURL.pathname)
    }
    return cacheFile.trim('_')
  }

  static read (cacheFilepath) {
    let abspath = path.join(Cache.DIRECTORY, cacheFilepath)
    if (!file.existsSync(abspath)) {
      throw new Error(`No cache to read`)
    }
    let currentTime = new Date().getTime()
    if (currentTime - file.statSync(abspath).mtime.getTime() > this.CACHE_TTL) {
      throw new Error(`Cache has expired`)
    }
    let content = file.readFileSync(abspath)
    if (content.length === 0) {
      throw new Error(`Empty file`)
    }
    return content
  }

  static write (cacheFilepath, content) {
    if (cacheFilepath.length === 0) {
      throw new Error(`Missing cache path`)
    }
    if (content.length === 0) {
      throw new Error(`Missing cache data`)
    }
    if (!file.existsSync(Cache.DIRECTORY)) {
      file.mkdirSync(Cache.DIRECTORY)
    } else if (!file.lstatSync(Cache.DIRECTORY).isDirectory()) {
      throw new Error(`Cannot create cache directory because a file with the same name already exists`)
    }
    let abspath = path.join(Cache.DIRECTORY, cacheFilepath)
    file.writeFileSync(abspath, content)
  }

  static readLink (link) {
    return Cache.read(Cache.getFile(link))
  }

  static writeLink (link, data) {
    Cache.write(Cache.getFile(link), data)
  }

  static friendlyFile (filepath) {
    return filepath.replace(/[\W]/g, '_')
  }
}

module.exports = Cache
