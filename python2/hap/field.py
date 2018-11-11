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

from decimal import Decimal
from base64 import b64encode


def boolean(value):
    """Helper function to cast to boolean
    """

    if isinstance(value, bool):
        return value

    if isinstance(value, (str, unicode)):
        if value.lower() == "true" or value.lower() == "1":
            return True
        elif value.lower() == "false" or value.lower() == "0":
            return False

    value_type = type(value)
    raise TypeError("Non-boolean value: '{}' ({})".format(value, value_type))


def base64s(value):
    """Helper function to cast to base64
    """

    if not isinstance(value, str):
        if isinstance(value, unicode):
            value = value.encode("utf8")
        else:
            value = str(value)

    return b64encode(value)


class Field(object):
    """Supported fields instances for dataplans.
    """

    RECORDS, META, CONFIG, HEADERS = r"records", r"meta", r"config", r"headers"
    PAYLOAD, PROXIES = r"payload", r"proxies"

    LINK, DECLARE, DEFINE = r"link", r"declare", r"define"

    DATA_TYPES = {
        # placeholder   convertion
        r"decimal":     Decimal,
        r"string":      unicode,
        r"text":        unicode,
        r"integer":     int,
        r"number":      int,
        r"percentage":  float,
        r"float":       float,
        r"double":      float,
        r"boolean":     boolean,
        r"base64":      base64s,
        r"bytes":       bytes,
    }
