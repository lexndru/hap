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

const { ArgumentParser } = require('argparse')

let parser = new ArgumentParser({
  version: '1.3.2',
  addHelp: true,
  description: 'Hap! Simple HTML scraping tool'
})

parser.addArgument('--sample', {
  help: 'Generate a sample dataplan.',
  action: 'storeTrue'
})

parser.addArgument('--link', {
  help: 'Overwrite link in dataplan.',
  action: 'store'
})

parser.addArgument('--save', {
  help: 'Save collected data to dataplan.',
  action: 'storeTrue'
})

parser.addArgument('--verbose', {
  help: 'Enable verbose mode.',
  action: 'storeTrue'
})

parser.addArgument('--no-cache', {
  help: 'Disable cache link.',
  action: 'storeTrue',
  dest: 'noCache'
})

parser.addArgument('--refresh', {
  help: 'Reset stored records before save.',
  action: 'storeTrue'
})

parser.addArgument('--silent', {
  help: 'Suppress any output.',
  action: 'storeTrue'
})

parser.addArgument('input', {
  help: 'Your JSON formated dataplan input.',
  nargs: '?'
})

const sampleMessage = `
  Hap! A simple HTML parser and scraping tool
  Visit https://github.com/lexndru/hap for documentation and samples
`

module.exports = {
  shell: parser.parseArgs(),
  documentation: sampleMessage
}
