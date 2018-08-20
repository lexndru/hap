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
from shutil import rmtree
from unittest import TestCase

from hap.cache import Cache


class TestCache(TestCase):

    def test_get_file(self):
        filename = "github_com_lexndru_hap"
        cache_file = Cache.get_file(u"http://github.com/lexndru/hap")
        self.assertEqual(cache_file, filename)

    def test_file_friendly(self):
        bad_filename = "~!bad@#$%^filename&*()1234567890"
        good_filename = "__bad_____filename____1234567890"
        friendly_file = Cache.file_friendly(bad_filename)
        self.assertEqual(friendly_file, good_filename)

    def test_write_read(self):
        Cache.directory = ".cache_test"
        link = "http://github.com/lexndru/hap"
        success, _ = Cache.write_link(link, "hap")
        self.assertTrue(success)
        success, data = Cache.read_link(link)
        self.assertTrue(success)
        self.assertEqual(data, "hap")
        rmtree(Cache.directory)

    def test_bad_read(self):
        success, data = Cache.read_link("not existing link")
        self.assertFalse(success)
        self.assertEqual("no cache to read", data)

    def test_empty_read_write(self):
        Cache.directory = "/tmp"
        ok, data = Cache.write("", "")
        self.assertFalse(ok)
        self.assertEqual("missing cache path", data)
        ok, data = Cache.write("hap_test.html", "")
        self.assertFalse(ok)
        self.assertEqual("missing cache data", data)
        with open("/tmp/.hap.tmp", "wb") as fd:
            fd.write("")
        Cache.directory = "/tmp"
        ok, data = Cache.read(".hap.tmp")
        self.assertFalse(ok)
        self.assertEqual(data, "empty file")
        remove("/tmp/.hap.tmp")
