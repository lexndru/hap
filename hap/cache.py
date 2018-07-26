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

from os import path, makedirs
from urlparse import urlparse
from re import sub


class Cache(object):
    """HTML cache wrapper.

    Adds support to cache an URL's content and store it as much as the user
    wants. Cache files are named after the URI.
    """

    directory = ".cache"

    @classmethod
    def get_file(cls, link):
        """Make link ASCII friendly.

        Args:
            link (unicode): URI to access.

        Returns:
            unicode: Filename for URI.
        """

        url = urlparse(link)
        cache_file = ""
        if url.netloc:
            cache_file += cls.file_friendly(url.netloc)
        if url.path:
            cache_file += cls.file_friendly(url.path)
        return cache_file.strip("_")

    @classmethod
    def read(cls, cache):
        """Read content from cache if exists.

        Args:
            cache (unicode): Filename of cache.

        Returns:
            tuple: Boolean for success read and string for content or error.
        """

        if cache and path.exists(cls.file_path(cache)):
            try:
                with open(cls.file_path(cache), "rb") as f:
                    data = f.read()
                    if len(data) == 0:
                        return False, "empty file"
                    return True, data
            except Exception as e:
                return False, str(e)
        return False, "no cache to read"

    @classmethod
    def write(cls, cache_path, cache):
        """Write content to cache file.

        Args:
            cache_path (unicode): Filename to save at.
            cache      (unicode): Content to be cached.

        Returns:
            tuple: Boolean for success read and string for size or error.
        """

        if len(cache_path) == 0:
            return False, "missing cache path"
        if len(cache) == 0:
            return False, "missing cache data"
        try:
            if not path.isdir(cls.directory):
                makedirs(cls.directory)
            with open(cls.file_path(cache_path), "wb") as f:
                size = f.write(cache)
                return True, size
        except Exception as e:
            return False, str(e)
        return False, "no cache to write"

    @classmethod
    def read_link(cls, link):
        """Read cache by link if exists.

        Args:
            link (unicode): Link to lookup for cache.

        Returns:
            tuple: Boolean for success read and string for content or error.
        """

        cache_file = cls.get_file(link)
        return cls.read(cache_file)

    @classmethod
    def write_link(cls, link, data):
        """Write cache by link.

        Args:
            link (unicode): Link to create filename of cache.
            data (unicode): Content to be cached.

        Returns:
            tuple: Boolean for success read and string for size or error.
        """

        cache_filename = cls.get_file(link)
        return cls.write(cache_filename, data)

    @classmethod
    def file_friendly(cls, string):
        """Replace non-alphanumeric characters with an underscore.

        Args:
            string (unicode): String to be friendlyfy.

        Returns:
            unicode: Friendly string.
        """

        return sub(r"[\W]", "_", string)

    @classmethod
    def file_path(cls, filename):
        """Joins cache filename with cache directory.

        Args:
            filename (unicode): Cache filename to join.

        Returns:
            unicode: Full path of cache file including cache directory.
        """

        return path.join(cls.directory, filename)
