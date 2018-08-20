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

from argparse import ArgumentParser


class Shell(object):
    """Command line arguments wrapper.
    """

    props = []
    parsed = False

    @classmethod
    def parse(cls):
        """Shell parser.
        """

        if cls.parsed:
            raise Exception("Shell already parsed")

        cls.psr = ArgumentParser(description="Hap! Simple HTML scraping tool")
        cls.psr.add_argument("--sample",
                             help="generate a sample dataplan",
                             action="store_true")
        cls.psr.add_argument("--link",
                             help="overwrite link in dataplan",
                             action="store")
        cls.psr.add_argument("--save",
                             help="save collected data to dataplan",
                             action="store_true")
        cls.psr.add_argument("--verbose",
                             help="enable verbose mode",
                             action="store_true")
        cls.psr.add_argument("--no-cache",
                             help="disable cache link",
                             action="store_true")
        cls.psr.add_argument("--refresh",
                             help="reset stored records before save",
                             action="store_true")
        cls.psr.add_argument("--silent",
                             help="suppress any output",
                             action="store_true")
        cls.psr.add_argument("--version",
                             help="print version number",
                             action="store_true")
        cls.psr.add_argument("input",
                             help="your JSON formated dataplan input",
                             nargs="?")
        args = cls.psr.parse_args()

        for prop in dir(args):
            if prop.startswith("_") or not hasattr(args, prop):
                continue
            setattr(cls, prop, getattr(args, prop))
            cls.props.append(prop)
