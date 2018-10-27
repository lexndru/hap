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

from typing import Tuple, Union

from json import loads


class FileReader(object):
    """Input file reader wrapper.
    """

    def __init__(self, filepath: str):
        if not isinstance(filepath, str):
            raise Exception("Filepath must be string")
        self.filepath = filepath

    def read(self) -> Tuple[bool, str]:
        """Returns content of filepath.
        """

        try:
            with open(self.filepath, "r") as f:
                return True, FileReader.parse_json(f.read())
        except Exception as e:
            return False, str(e)

    @staticmethod
    def parse_json(data: str) -> Union[dict, None]:
        """Returns parsed JSON content.
        """

        try:
            return loads(data)
        except Exception:
            return None
