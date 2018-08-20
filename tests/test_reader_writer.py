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

from os import remove
from unittest import TestCase

from hap.reader import FileReader
from hap.writer import FileWriter


class TestReaderWriter(TestCase):

    def test_read_write(self):
        data = {"hap": "lorem ipsum", "test": True}
        with self.assertRaises(Exception) as context:
            FileWriter(None)
            self.assertTrue("Filepath must be string" in context.exception)
        fw = FileWriter("/tmp/.hap.tmp")
        ok, error = fw.write(data)
        self.assertTrue(ok)
        with self.assertRaises(Exception) as context:
            FileReader(None)
            self.assertTrue("Filepath must be string" in context.exception)
        fr = FileReader("/tmp/.hap.tmp")
        ok, content = fr.read()
        self.assertTrue(ok)
        self.assertEqual(content, data)
        remove("/tmp/.hap.tmp")
