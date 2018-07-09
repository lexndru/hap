#!/usr/bin/env python
#
# Copyright 2018 Alexandru Catrina
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.

import os
import shutil

from hap.reader import FileReader
from hap.parser import HTMLParser
from hap.cache import Cache


def main():

    # create a temporary cache test directory
    test_cache_dir = ".cache_test"
    if not os.path.isdir(test_cache_dir):
        os.makedirs(test_cache_dir)

    # update Cache to use new cache directory
    Cache.directory = test_cache_dir

    # target output
    output_github = "https://github.com/lexndru/hap"

    # create mockup link
    mockup_link = "http://localhost/mockup"

    # create mockup html
    mockup_html = """
    <html>
    <head><title>Hap Test</title></head>
    <body><a href="%s" title="Hap GitHub">Hap GitHub</a></body>
    </html>
    """ % output_github

    # create mockup input data
    mockup_dataplan = """
    {
        "declare": {
            "github": "string"
        },
        "define": [
            {
                "github": [
                    {
                        "follow_xpath": "//*/a[@title='Hap GitHub']/@href"
                    }
                ]
            }
        ],
        "link": "%s"
    }
    """ % mockup_link

    # write mockup html to cache
    filepath = Cache.file_path(Cache.get_file(mockup_link))
    with open(filepath, "w") as f:
        f.write(mockup_html)

    # parse dataplan
    psr = HTMLParser(FileReader.parse_json(mockup_dataplan))
    psr.run()
    records = psr.get_records()

    # clean temp cache
    shutil.rmtree(test_cache_dir)

    # test records
    assert records.get("github") == output_github, "Unexpected output"
