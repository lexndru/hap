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

const file = require('fs')
const path = require('path')

const Log = require(path.join(__dirname, 'log'))
const Cache = require(path.join(__dirname, 'cache'))
const Field = require(path.join(__dirname, 'field'))

const { Type } = require(path.join(__dirname, 'utils'))

const HttpRequest = require('request')

const { JSDOM } = require('jsdom')

/*
 * Transforms a list of declared ENTITIES into DATA from a source.
 *
 * The source is actually the HTML source of a page and the list of
 * entities are defined by a JSON-like schema.
 *
 * This parser implements the dataplan specification defined
 * by Hap! for markup-language documents.
 */
class HTMLParser {
  /*
   * Hap! dataplans can handle inner scoped variables defined
   * during runtime. The specification recommendends the `:`
   * to be used as a prefix.
   *
   * Constant
   *   @string A 1-length string prefix to identify variables
   */
  get VARIABLE_PREFIX () {
    return ':'
  }

  /*
   * Dataplans handle markup-language documents.
   *
   * Constant
   *   @array List of supported document MIME types
   */
  get SUPPORTED_MIME_TYPES () {
    return ['text/html', 'application/xhtml+xml']
  }

  /*
   * Dataplans support local files as input `link`
   *
   * Constant
   *   @string The file schema protocol to pattern match on `link`
   */
  get FILE_PROTOCOL () {
    return 'file://'
  }

  /*
   * Dataplans support HTTP as input `link`
   *
   * Constant
   *   @string The HTTP schema protocol to pattern match on `link`
   */
  get HTTP_PROTOCOL () {
    return 'http://'
  }

  /*
   * Dataplans support secure HTTPS as input `link`
   *
   * Constant
   *   @string The HTTPS schema protocol to pattern match on `link`
   */
  get HTTPS_PROTOCOL () {
    return 'https://'
  }

  /*
   * Object-layout dataplan fields ordonated as the specification indicates.
   *
   * Constant
   *   @array Ordonated list of sections to run
   */
  get SECTIONS () {
    return [
      { section: Field.META, required: false, datatype: Type.isObject },
      { section: Field.CONFIG, required: false, datatype: Type.isObject },
      { section: Field.LINK, required: true, datatype: Type.isString },
      { section: Field.DEFINE, required: true, datatype: Type.isArray },
      { section: Field.DECLARE, required: true, datatype: Type.isObject }
    ]
  }

  /*
   * Parser constructor
   *
   * Arguments
   *   @object  dataplan       The actual dataplan to parse
   *   @boolean dontCache      Either to cache the document or not
   *   @boolean refreshRecords Reset all records stored in dataplan
   */
  constructor (dataplan, dontCache = false, refreshRecords = false) {
    if (!Type.isObject(dataplan)) {
      throw new Error('Unexpected dataplan received: required object')
    }
    this.source = null
    this.sourceCode = null
    this.defKey = null
    this.lastResult = null
    this.link = dataplan.link
    this.data = new Map()
    this.records = new Map()
    this.headers = {}
    this.dataplan = dataplan
    this.dontCache = dontCache
    this.refreshRecords = refreshRecords
    Log.info(`HTML Parser initialized`)
  }

  /*
  * Run parser across all sections, almost.
  *
  * The `link` section is kept only to ensure an uniform implementation
  * across multiple languages. Node.js uses `async this.fetch()` method
  * to resolve `link` instead.
  */
  run () {
    let records = this.dataplan.records
    if (Type.isArray(records) && records.length > 0) {
      Log.info(`Found ${records.length} stored record(s) in dataplan`)
    }
    if (this.refreshRecords && this.dataplan.hasOwnProperty('records')) {
      delete this.dataplan.records
      Log.info(`Cleaning stored records in dataplan...`)
    }
    for (let { section, required, datatype } of this.SECTIONS) {
      if (!this.dataplan.hasOwnProperty(section)) {
        if (!required) {
          continue
        }
        Log.fatal(`Missing required section '${section}'`)
      } else {
        let data = this.dataplan[section]
        if (!datatype(data)) {
          Log.fatal(`Wrong type: section '${section}' must be ${datatype}`)
        }
        if (section === Field.META) {
          this.prepareMeta(data)
        } else if (section === Field.CONFIG) {
          this.prepareConfig(data)
        } else if (section === Field.LINK) {
          this.prepareLink(data)
        } else if (section === Field.DEFINE) {
          this.prepareDefine(data)
        } else if (section === Field.DECLARE) {
          this.prepareDeclare(data)
        } else {
          Log.fatal(`Unsupported section '${section}'`)
        }
      }
    }
    Log.info(`Logging records datatime...`)
    this.records.set('_datetime', +new Date())
    Log.info(`Done`)
    return this
  }

  /*
   * Update the dataplan with the records and return it.
   *
   * Returns
   *   @object The updated dataplan
   */
  getDataplan () {
    let records = this.dataplan.records || []

    records.push(this.getRecords())
    this.dataplan.records = records

    return this.dataplan
  }

  /*
   * Return the gathered records as an object.
   *
   * Returns
   *   @object An object with the declared fields
   */
  getRecords () {
    let records = {}
    for (let [k, v] of this.records) {
      records[k] = v
    }
    return records
  }

  /*
   * Declare protocol handler to convert all declared fields to
   * their respective datatype.
   *
   * Arguments
   *   @object declarations An object with the declared fields
   */
  prepareDeclare (declarations) {
    for (let key of Object.keys(declarations)) {
      if (this.data.has(key)) {
        let datatype = declarations[key]
        let value = this.data.get(key)
        let convert = Field.DATA_TYPES[datatype]
        if (value != null && typeof convert === 'function') {
          try {
            value = convert(value)
          } catch (e) {
            value = null
            Log.warn(`Cannot convert value because ${e.message}`)
          }
        }
        this.records.set(key, value)
        Log.debug(`Updating records with '${key}' as '${value}' (${datatype})`)
      } else {
        Log.warn(`No data found for key '${key}'`)
      }
    }
  }

  /*
   * Loop through all defined entities and evaluate definition steps.
   *
   * Arguments
   *   @array definitions An array of all defined steps to gather data
   */
  prepareDefine (definitions) {
    for (let definition of definitions) {
      if (Type.isObject(definition) && Object.keys(definition).length > 0) {
        this.parseDefinition(definition)
      }
    }
  }

  /*
   * Definition parser to resolve the `define` protocol.
   *
   * Arguments
   *   @object definition A definition entity
   */
  parseDefinition (definition) {
    let keys = Object.keys(definition)
    if (keys.length !== 1) {
      Log.warn(`Incorrect definition entry: expected one key, got ${keys.length} ...`)
    }
    try {
      this.defKey = keys.pop()
      Log.debug(`Parsing definition for '${this.defKey}'`)
      let value = this.evaluateDefinitionValue(definition[this.defKey])
      this.keepFirstNonEmpty(this.defKey, value)
    } catch (e) {
      Log.error(`Cannot parse definition: ${e.message}`)
    }
  }

  /*
   * Definition parser helper.
   *
   * Used to update a declared field ONLY if the previous evaluated
   * definition returned an empty string or NULL.
   *
   * Arguments
   *   @string key   The variable declared by the `declare` protocol
   *   @string value The value returned by the current evaluation process
   */
  keepFirstNonEmpty (key, value) {
    if (value && value.toString().length > 0) {
      if (!this.data.hasOwnProperty(key) || !this.data[key]) {
        this.data.set(key, value)
      }
    }
  }

  /*
   * Definition evaluator helper.
   *
   * Used to evaluate a defined property and returns its content.
   *
   * Arguments
   *   @string|object|array value The definition element to be evaluated
   *
   * Returns
   *   @string|null The results of the evaluation process
   */
  evaluateDefinitionValue (value) {
    this.lastResult = null
    if (Type.isString(value)) {
      this.lastResult = value
      Log.debug(`Performing ${this.defKey}:assignment => ${this.lastResult}`)
    } else if (Type.isObject(value)) {
      this.lastResult = this.perform(value)
    } else if (Type.isArray(value)) {
      let actions = []
      for (let step of value) {
        if (Type.isObject(step)) {
          actions.push(this.perform(step))
        }
      }
      if (actions.length > 0) {
        this.lastResult = actions.pop()
      }
    }
    return this.lastResult
  }

  /*
   * Definition variable parser-helper.
   *
   * Used to determine if a string is a reference to a variable.
   *
   * Arguments
   *   @string string The string to be verified
   *
   * Returns
   *   @string The variable's value or the unchanged string
   */
  getVariableOrValue (string) {
    if (string.startsWith(this.VARIABLE_PREFIX)) {
      let holder = string.substring(this.VARIABLE_PREFIX.length)
      if (this.data.has(holder) && this.data.get(holder) != null) {
        return this.data.get(holder)
      }
    }
    return string
  }

  /*
   * Dataplan definition performer.
   *
   * Used as a dispatcher for a definition block.
   *
   * Arguments
   *   @string query       Alias of query_css
   *   @string query_css   CSS selector to query.
   *   @string query_xpath XPath expression to query.
   *   @string pattern     RegEx pattern to evaluate (extract).
   *   @string remove      RegEx pattern to evaluate (removal).
   *   @string replace     Replace first value with second position.
   *   @array  glue        Concatenate list's values.
   *
   * Returns
   *   @string|null The last evaluated result
   */
  perform ({
    query: query = null,
    query_css: queryCSS = null,
    query_xpath: queryXPath = null,
    pattern: pattern = null,
    replace: replace = null,
    remove: remove = null,
    glue: glue = null
  }) {
    if (query != null) {
      queryCSS = query
    }
    if (queryCSS != null) {
      this.lastResult = this.performQuery(queryCSS)
      Log.debug(`Performing ${this.defKey}:query:css '${queryCSS}' => ${this.lastResult}`)
    } else if (queryXPath != null) {
      this.lastResult = this.performQuery(queryXPath, true)
      Log.debug(`Performing ${this.defKey}:query:xpath '${queryXPath}' => ${this.lastResult}`)
    } else if (pattern != null) {
      this.lastResult = this.performPattern(pattern)
      Log.debug(`Performing ${this.defKey}:pattern '${pattern}' => ${this.lastResult}`)
    } else if (replace != null) {
      this.lastResult = this.performReplace(replace)
      Log.debug(`Performing ${this.defKey}:replace '${replace}' => ${this.lastResult}`)
    } else if (remove != null) {
      this.lastResult = this.performRemove(remove)
      Log.debug(`Performing ${this.defKey}:remove '${remove}' => ${this.lastResult}`)
    } else if (glue != null) {
      this.lastResult = this.performGlue(glue)
      Log.debug(`Performing ${this.defKey}:glue '${glue}' => ${this.lastResult}`)
    }
    return this.lastResult
  }

  /*
   * Evaluate a CSS selector or an XPath expression
   *
   * Arguments
   *   @string  query CSS selector or XPath expression.
   *   @boolean xpath True if query is an XPATH expression.
   *
   * Returns
   *   @string|null Returns string if data is found, otherwise null or empty.
   */
  performQuery (query, xpath = false) {
    let data
    if (xpath) {
      let nodeType = this.sourceCode.window.XPathResult.FIRST_ORDERED_NODE_TYPE
      let doc = this.sourceCode.window.document
      let xml = doc.evaluate(query, doc.body, null, nodeType, null)
      data = xml.singleNodeValue
    } else {
      data = this.sourceCode.window.document.querySelector(query)
    }
    let lastResult = (data) => {
      try {
        data = data.textContent
      } catch (e) {
        data = data.toString()
      }
      return data.trim()
    }
    if (data == null) {
      return this.lastResult
    }
    if (Type.isArray(data)) {
      if (data.length == 0) {
        return this.lastResult
      }
      data = data.shift()
    }
    try {
      return lastResult(data)
    } catch (e) {
      return this.lastResult
    }
  }

  /*
   * Evaluate a regular expression and returns first group.
   * Does not have support for named groups.
   *
   * Arguments
   *   @string pattern Regular expression
   *
   * Returns
   *   @string|null Returns string if data is found, otherwise null or empty.
   */
  performPattern (pattern) {
    if (!Type.isString(pattern)) {
      return this.lastResult
    }
    if (this.lastResult != null) {
      let newPattern = []
      for (let word of pattern.split(' ')) {
        newPattern.push(this.getVariableOrValue(word))
      }
      pattern = newPattern.join(' ')
      let regex = new RegExp(pattern, 'g')
      let results = regex.exec(this.lastResult)
      if (results.length > 1) {
        return results[1]
      }
    }
    return this.lastResult
  }

  /*
   * Replace string-A with string-B.
   *
   * Arguments
   *   @array replace Two-length array with old string to be replaced
   *
   * Returns
   *   @string|null New string, empty or null.
   */
  performReplace (replace) {
    let [oldString, newString] = replace
    if (!Type.isString(this.lastResult)) {
      return this.lastResult
    }
    let getValue = (value) => {
      let variable = this.getVariableOrValue(value)
      if (Type.isString(variable) && variable !== value) {
        return variable
      }
      return value
    }
    return this.lastResult.replace(getValue(oldString), getValue(newString))
  }

  /*
   * Evaluate a regular expression and removes matching groups.
   *
   * Arguments
   *   @string remove Regular expression
   *
   * Returns
   *   @string|null New string, empty or null.
   */
  performRemove (remove) {
    if (!Type.isString(this.lastResult)) {
      return this.lastResult
    }
    let removeVar = this.getVariableOrValue(remove)
    if (Type.isString(removeVar) && removeVar !== remove) {
      remove = removeVar
    }
    return this.lastResult.replace(new RegExp(remove, 'g'), '')
  }

  /*
   * Concatenate all strings from a list.
   *
   * Arguments
   *   @string|array  glue      List of strings to concatenate.
   *   @string        separator Separator used as "glue" between strings.
   *
   * Returns
   *   @string|null New string, empty or null.
   */
  performGlue (glue, separator = '') {
    if (Type.isString(glue)) {
      separator = ' '
      glue = glue.split(separator)
    }
    if (!Type.isArray(glue)) {
      return this.lastResult
    }
    let items = []
    for (let each of glue) {
      items.push(this.getVariableOrValue(each))
    }
    return items.join(separator)
  }

  /*
   * The optional `config` protocol.
   *
   * Used to configure requester with HTTP client-related options such as
   * User-Agent, Content-Type, and other HTTP headers.
   *
   * Only HTTP headers are supported at the moment.
   *
   * Arguments
   *   @object configuration The configuration object
   */
  prepareConfig (configuration) {
    for (let key in configuration) {
      if (key === Field.HEADERS && Type.isObject(configuration[key])) {
        this.headers = configuration[key]
      }
    }
  }

  /*
   * The optional `meta` protocol.
   *
   * Meta fields are trated AS-IS and the only benefit of these fields is
   * to be have them printed when verbose mode is enabled.
   *
   * Arguments
   *   @object metafields The meta fields object
   */
  prepareMeta (metafields) {
    if (Type.isObject(metafields) && Object.keys(metafields).length > 0) {
      Log.debug(`Listing meta fields`)
      for (let key in metafields) {
        Log.debug(` ${key} = ${metafields[key]}`)
      }
    }
  }

  /*
   * Dataplan input type `link` protocol.
   *
   * Set or update the link of the dataplan. Can be cached.
   *
   * Arguments
   *   @string link The link to the HTML document to parse
   */
  prepareLink (link) {
    if (link.toString().length === 0) {
      Log.fatal(`Unexpected empty link`)
    }
    if (!link.startsWith(this.FILE_PROTOCOL) &&
        !link.startsWith(this.HTTP_PROTOCOL) &&
        !link.startsWith(this.HTTPS_PROTOCOL)) {
      Log.fatal(`Unsupported link protocol`)
    }
  }

  /*
   * Set source to cached source.
   *
   * Arguments
   *   @string content The raw content of the document
   *
   * Returns
   *   @HTMLParser
   */
  prepareSourceCodeFromCache (content) {
    this.source = content
    return this.prepareSourceCode()
  }

  /*
   * Transforms plain string to HTML/XML nodes.
   *
   * Raises a warning if source is not set. The HTML document has the root
   * node set to "html".
   *
   * Returns
   *   @HTMLParser
   */
  prepareSourceCode () {
    if (this.source == null) {
      Log.fatal(`Source code not completed!`)
    }
    this.sourceCode = new JSDOM(this.source)
    return this
  }

  /*
   * Source code resolver for file protocol.
   */
  readFile () {
    let filepath = this.link.substring(this.FILE_PROTOCOL.length)
    if (!file.existsSync(filepath)) {
      Log.fatal(`Cannot get content from file: file does not exist`)
    }
    Log.debug(`Getting content from local file: ${this.link}`)
    this.prepareSourceCodeFromCache(file.readFileSync(filepath))
  }

  /*
   * Source code resolver for HTTP/HTTPS protocol.
   */
  readLink () {
    return new Promise((resolve, reject) => {
      HttpRequest({
        url: this.link,
        headers: this.headers
      }, (error, resp, source) => {
        Log.debug(`Getting content from URL: ${this.link}`)
        if (error != null) {
          return reject(error)
        }
        if (!resp.statusCode.toString().startsWith('2')) {
          Log.fatal(`Non-2xx status code: ${resp.statusCode}`)
        }
        let contentType = resp.headers['content-type']
        if (!contentType || contentType == null) {
          Log.fatal(`Cannot find content type for document`)
        }
        let validMIME = false
        for (let each of this.SUPPORTED_MIME_TYPES) {
          if (contentType.indexOf(each) > -1) {
            validMIME = true
            break
          }
        }
        if (!validMIME) {
          Log.fatal(`Unsupported content, got ${contentType}`)
        }
        this.source = source
        this.prepareSourceCode()
        if (!this.dontCache) {
          try {
            Cache.writeLink(this.link, this.source)
          } catch (e) {
            Log.warn(`Failed to cache source: ${e.message}`)
          }
        }
        return resolve(source)
      })
    })
  }

  /*
   * Source code resolver for cached HTTP/HTTPS protocol.
   */
  readCachedLink () {
    return new Promise((resolve, reject) => {
      try {
        let cachedContent = Cache.readLink(this.link)
        Log.debug(`Getting content from cache: ${this.link}`)
        this.prepareSourceCodeFromCache(cachedContent)
        resolve()
      } catch (e) {
        Log.debug(`Cannot get content from cache: ${e.message}`)
        this.readLink().then(() => resolve()).catch(e => reject(e))
      }
    })
  }

  /*
   * Simple URL dispatcher.
   *
   * Access an URL and read it's content. Can be cached.
   *
   * If URL returns a non-OK (200) status code, a warning is printed, but if
   * it return a non-HTML content-type, a fatal log is set.  `
   *
   * Returns
   *   @promise Asynchronous resolver
   */
  openURL () {
    return new Promise((resolve, reject) => {
      if (this.link.startsWith(this.FILE_PROTOCOL)) {
        this.readFile()
        resolve()
      } else if (this.link.startsWith(this.HTTP_PROTOCOL) || this.link.startsWith(this.HTTPS_PROTOCOL)) {
        if (this.dontCache) {
          this.readLink().then(() => resolve()).catch(e => reject(e.message))
        } else {
          this.readCachedLink().then(() => resolve()).catch(e => reject(e.message))
        }
      } else {
        reject(new Error(`Unsupported link protocol: must be file or http(s)`))
      }
    })
  }

  /*
   * Asynchronous helper for Hap! runtime
   *
   * Returns
   *   @promise Asynchronous resolver with records and updated dataplan
   */
  fetch () {
    return new Promise((resolve, reject) => {
      this.openURL()
        .then(() => {
          this.run()
          resolve({
            records: this.getRecords(),
            dataplan: this.getDataplan()
          })
        })
        .catch(e => {
          reject(e.message)
        })
    })
  }
}

module.exports = HTMLParser
