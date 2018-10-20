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

from __future__ import print_function

from json import dumps, JSONEncoder
from decimal import Decimal


SAMPLES_MESSAGE = """
  Hap! A simple HTML parser and scraping tool
  Visit https://github.com/lexndru/hap for documentation and samples
"""


class DecimalEncoder(JSONEncoder):
    """Helper class used for JSON dumps.

    Convert Python decimals to JSON-like appropriate datatype.
    """

    def default(self, o):
        if isinstance(o, Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)


def print_json(data, retval=False):
    """Outputs pretty formatted JSON.

    If retval is set to True, it returns output instead of printing.
    """

    json_data = dumps(data, cls=DecimalEncoder, indent=4, sort_keys=True,
                      ensure_ascii=False, encoding="utf-8")
    if retval:
        return json_data
    print(json_data.encode("utf-8"))
