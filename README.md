# Hap!
[![Build Status](https://travis-ci.org/lexndru/hap.svg?branch=master)](https://travis-ci.org/lexndru/hap)

Hap! is an HTML parser and scraping tool build upon its own concept to transform markup-language documents into valuable data. It implements the dataplan application specification for markup-language data-oriented documents. This repository contains both the dataplan specification described in this README file and the reference implementation of the HTML parser originally written in Python2/3.


## Install
Hap! has been implemented in two languages: Python and JavaScript. Both implementations respect the dataplan specification and support all features described in this document. The most recent release is `v1.3.0`

#### Get Hap! for Python (2/3)
```
$ pip install hap
$ hap -h
usage: hap [-h] [--sample] [--link LINK] [--save] [--verbose] [--no-cache]
           [--refresh] [--silent] [--version]
           [input]

Hap! Simple HTML scraping tool

positional arguments:
  input        your JSON formated dataplan input

optional arguments:
  -h, --help   show this help message and exit
  --sample     generate a sample dataplan
  --link LINK  overwrite link in dataplan
  --save       save collected data to dataplan
  --verbose    enable verbose mode
  --no-cache   disable cache link
  --refresh    reset stored records before save
  --silent     suppress any output
  --version    print version number
```

#### Get Hap! for Node.js
```
$ npm install hap
$ hap -h
usage: hap [-h] [-v] [--sample] [--link LINK] [--save] [--verbose]
           [--no-cache] [--refresh] [--silent]
           [input]

Hap! Simple HTML scraping tool

Positional arguments:
  input          Your JSON formated dataplan input.

Optional arguments:
  -h, --help     Show this help message and exit.
  -v, --version  Show program's version number and exit.
  --sample       Generate a sample dataplan.
  --link LINK    Overwrite link in dataplan.
  --save         Save collected data to dataplan.
  --verbose      Enable verbose mode.
  --no-cache     Disable cache link.
  --refresh      Reset stored records before save.
  --silent       Suppress any output.
```
**Note:** Hap! has been ported to Node.js >= 6.x, older versions might not work.


## Features
- [x] Scrape HTML pages from the web or locally
- [x] Quick parse and extract data from HTML documents
- [x] Convert desired output data ("declared data") to `string`, `integer`, `floats`, `decimals` or `boolean` values
- [x] Run step-by-step instructions ("defined steps") with performers to obtain the desired output
- [x] Create variables and directly or indirectly assign string values
- [x] Query CSS selectors and XPath expressions
- [x] Evaluate patterns with regular expressions
- [x] Capture and create variables from named groups (Python2/3 only)
- [x] Remove unwanted characters or patterns from an intermediate result
- [x] Replace characters or patterns with static content or dynamic content with variables
- [x] Concatenate list of strings with support for variable interpolation
- [x] Self-stored history records with `datetime` support
- [x] Configurable outgoing requests
- [x] Supports metafields


## Getting started with Hap!
*Notice: The following guide is using the Python implementation of Hap!*

The purpose of Hap! is to have a simple and fast way to retrieve certain data from the internet. It uses JSON formatted data as input and output. Input can be either from a local file or from stdin from another process. Output is either printed to stdout or saved to file. If input is provided by file, Hap! names it dataplan ("data planning") and the same file is used when the output is saved.

## Usage
```
usage: hap [-h] [--sample] [--link LINK] [--save] [--verbose] [--no-cache]
           [--refresh] [--silent] [--version]
           [input]

Hap! Simple HTML scraping tool

positional arguments:
  input        your JSON formated dataplan input

optional arguments:
  -h, --help   show this help message and exit
  --sample     generate a sample dataplan
  --link LINK  overwrite link in dataplan
  --save       save collected data to dataplan
  --verbose    enable verbose mode
  --no-cache   disable cache link
  --refresh    reset stored records
  --silent     suppress any output
  --version    print version number
```


## An educational example
If we were to have an online store with a list of products, we could create a dataplan that describes the process of extracting some important aspects of a product such as product name, product price or product currency.

#### The HTML
Imagine the HTML of a product would look like this:
```
<html>
    ...
    <div class="products">
        ...
        <div id="product9" data-product-id="900">
            <h1>Cool product</h1>
            <img src="cool-product-image.svg">
            <span class="price">10.99 <em>Eur</em></span>
        </div>
        ...
    </div>
    ...
</html>
```

#### The dataplan
A dataplan has at least two properties: a declaration and a definition. The first one, the declaration is a JSON key-value object with keys being the desired (targeted) attributes of a dataplan (e.g. product name, product price). The second one, the definition is a JSON list of objects with every object describing the process of obtaining something. That something can be the targeted data or an unprocessed raw or auxiliary part of the targeted data.

Taken the example above, the declaration would look like this:
```
    ...
    "declare": {
        "product_name": "string",
        "product_price": "decimal",
        "product_currency": "string"
    }
    ...
```

Defined entries must be found in the declaration object above otherwise it will not be exported. Following the example above, the definition could look like this:
```
    ...
    "define": [
        {
            "product_name": {
                "query": ".products > [data-product-id] > h1"
            }
        },
        {
            "product_price": {
                "query_xpath": "//*/div[@class='products']/div/span[@class='price']/text()"
            }
        },
        {
            "product_currency": {
                "query": ".products > [data-product-id] > span > em"
            }
        }
    ]
    ...
```

The final touch is to add a link of the internet page of the product. Let's pretend the link is http://localhost/cool-store/product/900. The updated dataplan with both definitions and declarations would look like this:
```
{
    "link": "http://localhost/cool-store/product/900",
    "declare": {
        "product_name": "string",
        "product_price": "decimal",
        "product_currency": "string"
    },
    "define": [
        {
            "product_name": {
                "query": ".products > [data-product-id] > h1"
            }
        },
        {
            "product_price": {
                "query_xpath": "//*/div[@class='products']/div/span[@class='price']/text()"
            }
        },
        {
            "product_currency": {
                "query": ".products > [data-product-id] > span > em"
            }
        }
    ]
}

```

#### Running a dataplan
Hap! can work with JSON formatted input either pipe'd to stdin (*Python only*) from another process or by providing first command line argument to a file. Let's pretend we have a fancy process that outputs the dataplan above. This could look like this:
```
$ fancy_process | hap --verbose
2018-07-09 01:21:28,436 Filepath: None
2018-07-09 01:21:28,436 Save to file? False
2018-07-09 01:21:28,436 HTML Parser initialized
2018-07-09 01:21:28,447 Getting content from cache: http://localhost/cool-store/product/900
2018-07-09 01:21:28,473 Parsing definition for 'product_name'
2018-07-09 01:21:28,486 Performing product_name:query '.products > [data-product-id] > h1' => Cool product
2018-07-09 01:21:28,486 Parsing definition for 'product_price'
2018-07-09 01:21:28,489 Performing product_price:query '//*/div[@class='products']/div/span[@class='price']/text()' => 10.99
2018-07-09 01:21:28,522 Parsing definition for 'product_currency'
2018-07-09 01:21:28,523 Performing product_currency:query '.products > [data-product-id] > span > em' => Eur
2018-07-09 01:21:28,523 Updating records with 'product_name' as 'Cool product' (string)
2018-07-09 01:21:28,523 Updating records with 'product_price' as '10.99' (decimal)
2018-07-09 01:21:28,523 Updating records with 'product_currency' as 'Eur' (string)
2018-07-09 01:21:28,523 Logging records datetime...
2018-07-09 01:21:28,523 Done...
{
    "_datetime": "2018-07-08 22:21:28.523606",
    "product_currency": "Eur",
    "product_name": "Cool product",
    "product_price": 10.99
}
```
The `--verbose` flag is the reason the detailed output above exists. If the flag would have been omitted, only the JSON at the bottom would have been printed. **Note:** scripts can capture verbose output and errors from stderr; and output results from stdout or by saving to file.

#### A test sample
Add the following content to a file named `test.json` and then `hap test.json --verbose` to run it:
```
{
    "link": "http://skyle.codeissues.net/",
    "declare": {
        "github": "string"
    },
    "define": [
        {
            "github": {
                "query_xpath": "//*/a[@title='Skyle GitHub']/@href"
            }
        }
    ]
}
```


# Data Planning Specification

### Abstract
The notion of "data planning" is used to describe the complete cycle of working with data, starting with the activity of gathering valuable information from certain documents and arrange the data into structured sets, and concluding with the presentation and long-term storage of the respective data. The process of gathering can be defined step-by-step with simple instructions and the final output can be converted into a more appropriate format for what it represents.

The notion of "dataplan" is used to describe a proposal specification to achieve this previous statement. In a dataplan context, there are two modules to work with: declarations and definitions. Both modules are required by a dataplan and each module has its own protocol.

The `declare` protocol is applied by the *declaration* module. A dataplan must have only one `declare` instance of the declaration module. Once set, it cannot be changed. The protocol requires a dictionary-like map of all exportable fields. Each field is defined as a key-value pair where the *key* is an unique name of the exported field and the *value* is the corresponding data type of the field. E.g. an "age" field could have the key "age" and the value "integer" or an "email" field could have the value "string".

The table below describes all supported data types by the declaration module.

Alias | Description
----- | -----------
`decimal` | Precision correctly-rounded floating point
`string`, `text` | Any sequence of characters including empty spaces
`integer` | Numeric values up to 2^63 - 1
`ascii` | ASCII only strings (only if you know what you're doing)
`bytes` | Raw sequence of bytes (only if you know what you're doing)
`percentage` | Floating point number with up to 53 bits of precision
`boolean` | Represent truth value of an expression

The `define` protocol is applied by the *definition* module and a dataplan must have only one `define` instance of the definition module. Analogue, once the definition module is set, it cannot be changed. The protocol requires an ordered list of dictionary-like maps as definitions. Each definition is represented as a key-value pair where the *key* must be string representing a variable and the *value* is a set of instructions.

Variables can be exported if they are "declared" by the `declare` protocol. A variable either is directly assigned to a value or evaluates an ordered list of instructions. A direct assignment takes a string and allocates it to the respective variable. An evaluation runs through all instructions step-by-step. The evaluation must have at least one instruction.

An instruction is a dictionary-like map represented by a key-value pair where the *key* is a directive and the *value* is the input parameters. The result of the evaluated directive steps ahead to the next instruction until it reaches the end, concluding with an indirect assignment to the variable owning this set of instructions.

The table below describes all supported directives by the definitions module.

Directive | Arguments | Description | Sample
--------- | --------- | ----------- | ------
`query_css` | (string) CSS selector | Return result of evaluated CSS selector | `{"query_css": "h1.title"}`
`query_xpath` | (string) XPath expression | Return result of evaluated XPath expression | `{"query_xpath": "//h1[@class='title']"}`
`query` | (string) CSS selector | Alias of `query_css` | `{"query_css": "body > div > a.active"}`
`pattern` | (string) RegEx | Extract first unnamed group or save all named groups as variables | `{"pattern": "Hello, (?P<subject>\w+)!"}`
`remove` | (string) RegEx | Remove matching regex from the previous stored value | `{"remove": "\D+"}`
`replace` | (list:2) RegEx, String | Replace a regex or a string with another string | `{"replace": ["\D+", "-"]}}`
`glue` | (list:n) String, String ... | Concatenate strings with variable interpolation support | `{"glue": ["My name is", ":me"]}`

The declaration module and the definition module are two major components of the dataplan. Without these two modules, there is no data planning ahead. Usage of variables can be found across multiple definitions, but a variable keep the first non-empty string found.

### Extended
The `link` protocol is applied by the *resource* module. The resource module must be able to resolve the path to a resource. A dataplan must have only one `link` instance of the resource module, but the `link` can be changed at any point in time with another one that respects the data planning.

The `records` protocol is applied by the *storage* module. The storage module is responsible of keeping all runtime results within the dataplan. The protocol requires an ordered list of dictionary-like maps implementing the fields from the `declare` protocol with their respective data type and a timestamp of the evaluation.

### Optional
The `config` protocol is applied by the *configurable* module. This module can be used to configure access to a resource. The protocol requires a dictionary-like map of key-value pair where *key* is the property to configure and *value* is its appropriate value to be set. A dataplan can have only one `config` protocol.

The `meta` protocol is applied by the *metadata* module. This module can be used to set meta information about data planning. The protocol requires a dictionary-like map of key-value pair where *key* is the meta field to define and *value* is its appropriate value to be set. A dataplan can have only one `meta` protocol.


# Hap! dataplan implementation table
Current implementations of Hap! are using JSON formatted files to store and implement dataplans. The table below describes each dataplan module as an appropriate property of a JSON object. Please consider this table and other examples from this repository as references to implement dataplans.

Property | Type | Description | Sample
-------- | ---- | ----------- | ------
`declare` | map | Collectable fields with conversion | `{"name": "text"}`
`define`  | list of maps | Instructions to collect declared fields | `[{"name": {"query_xpath": "//*[@id='name']"}, "item": "AS IS" }]`
`link`    | string | Source of HTML document to parse | `http://localhost` or `file:///tmp/document.html`
`config`  | map | Outgoing configurable parameters | `{"headers": {"User-Agent": "Hap! for Linux"}}`
`meta`    | map | Metadata about dataplan | `{"name": "general purpose dataplan", "tags": "anything"}`
`records`* | list of maps | Collected results for declared fields | `[{"name": "some text after parsing"}]`

Notes:
 - The `records` property is read-only; Hap! automatically updates (or creates) this property and appends records with every run.
 - The `meta` property does not impact the functionality of Hap!, but instead is used to organize and identify dataplans.
 - The current implementation allows only the `headers` as a configurable parameter for the `config` property (headers can be anything).


## License
Copyright 2018 Alexandru Catrina

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
