#!/usr/bin/env python
#
# Copyright (c) 2018 Alexandru Catrina <alex@codeissues.net>
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

from shutil import rmtree
from unittest import TestCase

from hap.parser import HTMLParser
from hap.cache import Cache


DATAPLAN_XPATH = {
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

DATAPLAN_CSS = {
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

DATAPLAN_PATTERN = {
    "declare": {
        "topic": "string"
    },
    "define": [
        {
            "paragraph": [
                {
                    "query": "p"
                },
                {
                    "pattern": "This is .* about (?P<topic>.+)\\."
                }
            ]
        }
    ]
}

DATAPLAN_REMOVE = {
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

DATAPLAN_REPLACE = {
    "declare": {
        "username": "string",
        "sentence": "string"
    },
    "define": [
        {
            "user": [
                {
                    "query_xpath": "//*/a[@id='github']/@href"
                },
                {
                    "pattern": "https?://.+/(?P<username>.+)/.*"
                }
            ]
        },
        {
            "sentence": [
                {
                    "query": "p"
                },
                {
                    "pattern": "(This is .* about (?P<placeholder>.+?))"
                },
                {
                    "replace": [":placeholder", ":username"]
                }
            ]
        }
    ]
}

HTMLDATA = r"""
<html>
<head><title>Hap Test</title></head>
<body>
<a href="https://github.com/lexndru/hap" title="Hap GitHub" id="github">Hap GitHub</a>
<p>This is a sentence about dogs.</p>
<p>This is a sentence about cats.</p>
<p>This is a sentence about cars.</p>
<div>12:00 AM</div>
</body>
</html>
"""


class TestParser(TestCase):

    def setUp(self):
        Cache.directory = ".cache_test"
        success, _ = Cache.write_link("http://localhost/mockup", HTMLDATA)
        self.assertTrue(success)

    def tearDown(self):
        rmtree(".cache_test")

    def test_query_xpath(self):
        DATAPLAN_XPATH.update({"link": u"http://localhost/mockup"})
        psr = HTMLParser(DATAPLAN_XPATH)
        psr.run()
        records = psr.get_records()
        self.assertEqual("https://github.com/lexndru/hap", records.get("url"))

    def test_query_css(self):
        DATAPLAN_CSS.update({"link": u"http://localhost/mockup"})
        psr = HTMLParser(DATAPLAN_CSS)
        psr.run()
        records = psr.get_records()
        self.assertEqual("Hap GitHub", records.get("github"))

    def test_query_pattern(self):
        DATAPLAN_PATTERN.update({"link": u"http://localhost/mockup"})
        psr = HTMLParser(DATAPLAN_PATTERN)
        psr.run()
        records = psr.get_records()
        self.assertEqual("dogs", records.get("topic"))

    def test_query_remove_glue(self):
        DATAPLAN_REMOVE.update({"link": u"http://localhost/mockup"})
        psr = HTMLParser(DATAPLAN_REMOVE)
        psr.run()
        records = psr.get_records()
        self.assertEqual("12:00", records.get("time"))
        self.assertEqual("The time is 12:00", records.get("alert"))

    def test_query_replace(self):
        DATAPLAN_REPLACE.update({"link": u"http://localhost/mockup"})
        psr = HTMLParser(DATAPLAN_REPLACE)
        psr.run()
        records = psr.get_records()
        self.assertEqual("lexndru", records.get("username"))
        self.assertEqual("This is a sentence about lexndru", records.get("sentence"))
