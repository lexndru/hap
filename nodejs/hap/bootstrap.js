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

const path = require('path')

const Log = require(path.join(__dirname, 'log'))
const HTMLParser = require(path.join(__dirname, 'parser'))
const { ReaderWriter, Pretty } = require(path.join(__dirname, 'utils'))
const { shell, documentation } = require(path.join(__dirname, 'shell'))

/*
 * Fail fast crash wrapper
 */
let failfast = (...messages) => {
  for (let line of messages) {
    process.stdout.write(`${line}\n`)
  }
  process.exit(1)
}

/*
 * Main Hap! bootstrap launcher
 */
let main = (...args) => {
  // check log verbosity level
  if (!shell.silent && shell.verbose) {
    Log.enableVerbose()
  } else {
    Log.disableVerbose()
  }

  // dump dataplan samples documentation and exit
  if (shell.sample) {
    failfast(documentation)
  }

  // check input
  if (!shell.input) {
    failfast(`Missing input. See --help`)
  }

  // read dataplan from argument input file
  let data
  try {
    data = ReaderWriter.fromFile(shell.input)
    if (data.hasFailed()) {
      failfast('Corrupted input provided. Please fix and try again')
    }
  } catch (e) {
    failfast(e.message)
  }

  // save parsed dataplan
  let dataplan = data.getContent()

  // brief input review
  if (shell.verbose && !shell.silent) {
    Log.info(`Filepath: ${shell.input}`)
    Log.info(`Save to file? ${shell.save}`)
  }

  // update link
  if (shell.link != null) {
    dataplan.link = shell.link
  }

  // crash if no link is provided
  if (!dataplan.hasOwnProperty('link') || !dataplan.link) {
    failfast(`No link provided. See --help`)
  }

  // parse document
  let parser = new HTMLParser(dataplan, shell.noCache, shell.save && shell.refresh)

  // handle async parser
  parser.fetch().then((records, dataplan) => {
    if (shell.save) {
      ReaderWriter.toFile(shell.input, dataplan)
    }

    if (!shell.silent) {
      let output = Pretty(records)
      process.sdtout.write(output)
    }
  }).catch(error => failfast(error))
}

module.exports = main
