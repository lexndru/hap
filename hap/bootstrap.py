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

import sys
import uuid

from hap import __version__

from hap.log import Log
from hap.shell import Shell
from hap.reader import FileReader
from hap.writer import FileWriter
from hap.parser import HTMLParser
from hap.util import print_json, SAMPLES_MESSAGE


def main():
    """Hap! bootstrap.
    """

    # Parse shell arguments
    Shell.parse()

    # Print version
    if Shell.version:
        return print("Hap! v{}".format(__version__))

    # Log config
    Log.configure(not Shell.silent and Shell.verbose)

    # Dump info and exit
    if Shell.sample:
        return print(SAMPLES_MESSAGE)

    # Input reader
    def read_json():
        if not sys.stdin.isatty():
            data = sys.stdin.read()
            if len(data) == 0 or not data:
                return False, "Invalid input stream"
            retval = FileReader.parse_json(data)
            if retval is not None:
                return True, retval
        elif sys.stdin.isatty() and Shell.input is None:
            Shell.psr.print_help()
            return False, None
        elif Shell.input is not None:
            fr = FileReader(Shell.input)
            ok, data = fr.read()
            if not ok:
                return False, data
            return True, data
        return False, "Input stream is not a valid JSON"

    # Read data
    status, data_in = read_json()
    if not status:
        raise SystemExit(data_in)

    # A dataplan is always an object
    if not isinstance(data_in, dict):
        raise SystemExit("Corrupted input provided. Please fix and try again")

    # Log shell params
    if Shell.verbose and not Shell.silent:
        Log.info(u"Filepath: {}".format(Shell.input))
        Log.info(u"Save to file? {}".format(Shell.save))

    # Update link?
    if Shell.link is not None:
        data_in.update({"link": unicode(Shell.link)})

    # Crash if no link is provided
    if data_in.get("link", "") == "":
        raise SystemExit("No link provided. See --help")

    # Parse document
    psr = HTMLParser(data_in, no_cache=Shell.no_cache,
                     refresh=(Shell.save and Shell.refresh))
    psr.run()
    records = psr.get_records()
    dataplan = psr.get_dataplan()

    # Update dataplan
    if Shell.save:
        filename = Shell.input
        if filename is None:
            filename = "{}.json".format(uuid.uuid4().hex)
        fw = FileWriter(filename)
        fw.write(dataplan)

    # Print output
    if not Shell.silent:
        print_json(records)
