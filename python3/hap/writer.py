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

from typing import Tuple

from hap.util import print_json


class FileWriter(object):
    """Output file writer wrapper.
    """

    def __init__(self, filepath: str):
        if not isinstance(filepath, str):
            raise Exception("Filepath must be string")
        self.filepath = filepath

    def write(self, data: dict) -> Tuple[bool, str]:
        """Write provided content data to filepath.
        """

        try:
            with open(self.filepath, "w") as f:
                content = print_json(data, True)
                f.write(content)
                return True, "ok"
        except Exception as e:
            return False, str(e)
