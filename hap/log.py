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

import logging


class Log(object):
    """Log wrapper. That's it...
    """

    config = {
        r"format": r"%(asctime)-15s %(message)s"
    }

    @classmethod
    def configure(cls, verbose=False):
        cls.config["level"] = logging.DEBUG if verbose else logging.INFO
        logging.basicConfig(**cls.config)

    @classmethod
    def info(cls, message):
        logging.info(message)

    @classmethod
    def debug(cls, message):
        logging.debug(message)

    @classmethod
    def warn(cls, message):
        logging.warning(message)

    @classmethod
    def error(cls, message):
        logging.error(message)

    @classmethod
    def fatal(cls, message):
        cls.error(message)
        raise SystemExit(message)
