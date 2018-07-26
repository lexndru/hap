# Hap!
[![Build Status](https://travis-ci.org/lexndru/hap.svg?branch=master)](https://travis-ci.org/lexndru/hap)

Hap! is an HTML parser and scraping tool written in Python.

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

#### Running dataplan
Hap! can work with JSON formatted input either pipe'd to stdin from another process or by providing first command line argument to a file. Let's pretend we have a fancy process that outputs the dataplan above. This could look like this:
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
The `--verbose` flag is the reason the detailed output above exists. If the flag would have been omitted, only the JSON at the bottom would have been printed.

Note: scripts can capture verbose output and errors from stderr; and output results from stdout or by saving to file.

## How to install
- Install python package `hap`.
- Run `hap --help`.


## How to build from sources
- Install python dependencies from `requirements.txt`.
- Run `python setup.py install`.
- Run `hap --help`.


## How to test a sample
- Add the following content to file `test.json`:
```
{
    "config": {
        "headers": {
            "User-Agent": "Hap/1.0.5 (Linux x86_64)"
        }
    },
    "link": "http://skyle.codeissues.net/",
    "declare": {
        "github": "string"
    },
    "define": [
        {
            "github": [
                {
                    "query_xpath": "//*/a[@title='Skyle GitHub']/@href"
                }
            ]
        }
    ]
}
```
- Run `hap test.json --verbose --no-cache`.


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
