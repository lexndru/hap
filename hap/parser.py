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

from lxml import html
from datetime import datetime
from urllib2 import urlopen, Request
from re import sub, compile, IGNORECASE

from hap.log import Log
from hap.cache import Cache
from hap.field import Field


class HTMLParser(object):
    """Transforms a list of declared ENTITIES into DATA from a source.

    The source is actually the HTML source of a page and the list of entities
    are defined by a JSON-like schema.
    """

    source, source_code, link, headers = None, None, None, dict()
    variable, def_key, last_result = r":", None, None
    data, records = dict(), dict()
    refresh_records, no_cache = False, False

    sections = (
        # field,      required, type
        (Field.META,    False,  dict),
        (Field.CONFIG,  False,  dict),
        (Field.LINK,    True,   unicode),
        (Field.DEFINE,  True,   list),
        (Field.DECLARE, True,   dict),
    )

    def __init__(self, dataplan=None, no_cache=False, refresh=False):
        if not isinstance(dataplan, dict):
            raise Exception("Unexpected dataplan received: required dict")
        self.dataplan = dataplan
        self.no_cache = no_cache
        self.refresh_records = refresh
        Log.debug("HTML Parser initialized")

    def run(self):
        """Run parser across all sections.

        Rises:
            SystemExit: If a fatal log occurs.

        Returns:
            self: Parser instance.
        """

        records = self.dataplan.get(Field.RECORDS)
        if isinstance(records, list) and len(records) > 0:
            Log.debug("Found {} stored record(s) in dataplan".format(len(records)))

        if self.refresh_records and self.dataplan.has_key(Field.RECORDS):
            del self.dataplan[Field.RECORDS]
            Log.debug("Cleaning stored records in dataplan...")

        for section, required, datatype in self.sections:
            data = self.dataplan.get(section)
            key_exists = self.dataplan.has_key(section)
            if not key_exists:
                if required:
                    Log.fatal("Missing required section: '{}'".format(section))
                else:
                    continue
            if key_exists and not isinstance(data, datatype):
                Log.fatal("Wrong type: section '{}' must be {}".format(section, datatype))
            if not hasattr(self, "prepare_{}".format(section)):
                Log.fatal("Unsupported section '{}'".format(section))
            getattr(self, "prepare_{}".format(section))(data)

        Log.debug("Logging records datetime...")
        self.records["_datetime"] = str(datetime.utcnow())
        Log.debug("Done...")
        return self

    def get_dataplan(self):
        """Dataplan getter.

        Returns:
            dict: Updated dataplan with records.
        """

        records = self.dataplan.get(Field.RECORDS)

        if isinstance(records, list):
            records.append(self.records)
        else:
            records = [self.records]

        self.dataplan.update({Field.RECORDS: records})
        return self.dataplan

    def get_records(self):
        """Records getter.

        Returns:
            dict: Processed records.
        """

        return self.records

    def prepare_declare(self, declarations):
        """The "declare" protocol.

        The output of the program uses declared values to create records.

        A declared property must define a convertion supported function which
        will be used to transform collected data into desired data.
        """

        for key, datatype in declarations.iteritems():
            if not self.data.has_key(key):
                Log.warn("No data found for key '{}'".format(key))
            value = self.data.get(key)
            convert_func = Field.DATA_TYPES.get(datatype)
            if value is not None and callable(convert_func):
                try:
                    value = convert_func(value)
                except Exception as e:
                    Log.warn("Cannot convert value because {}".format(e))
            self.records.update({key:value})
            Log.debug("Updating records with '{}' as '{}' ({})".format(key, value, datatype))

    def prepare_define(self, definitions):
        """The "define" protocol.

        The runtime of the program uses defined values to create temporary
        records.

        A defined property must call either a performer or an assignment in
        order to be valid. An assignment is just what it sounds. The defined
        property is being assiged to a given value. A performer is a built-in
        function applied.
        """

        [self.parse_definition(d) for d in definitions if len(d) > 0]

    def parse_definition(self, entry):
        """A "define" protocol helper.

        Parse each defined entry and choose it's correct action to apply.
        """

        try:
            self.def_key, val = entry.items().pop()
            Log.debug("Parsing definition for '{}'".format(self.def_key))
            key_value = self.eval_def_value(val)
            self.keep_first_non_empty(self.def_key, key_value)
        except Exception as e:
            Log.error("Cannot parse definitions: {}".format(e))

    def keep_first_non_empty(self, key, value):
        """A "define" protocol helper.

        Keeps track only of the first non-empty evaluated result.
        """

        if self.data.get(key) is None and value is not None:
            self.data[key] = value

    def eval_def_value(self, value):
        """A "define" protocol helper.

        Evaluate a defined property and returns it's content.

        Args:
            mixt: Defined property value.

        Returns:
            mixt: String if value is found or None.
        """

        self.last_result = None
        if isinstance(value, (str, unicode)):
            self.last_result = value
            Log.debug(u"Performing {}:assignment => {}".format(self.def_key, self.last_result))
        elif isinstance(value, list):
            actions = [self.perform(**i) for i in value if isinstance(i, dict)]
            if len(actions) > 0:
                self.last_result = actions[-1]
        return self.last_result

    def is_variable(self, string):
        """Checks if a string is a placeholed for a variable.

        Args:
            string (str): String to check.

        Returns:
            tuple: Boolean to determine if string is variable and actual value.
        """

        if string.startswith(self.variable):
            var = self.data.get(string[len(self.variable):])
            if var is not None:
                return True, var
        return False, string

    def perform(self, follow=None, follow_xpath=None, pattern=None, remove=None, glue=None, replace=None):
        """Perfomer dispatcher.

        Args:
            follow       (str): CSS selector to follow.
            follow_xpath (str): XPath expression to follow.
            pattern      (str): RegEx pattern to evaluate (extract).
            remove       (str): RegEx pattern to evaluate (removal).
            glue        (list): Concatenate list's values.
            replace     (list): Replace first value with second position.

        Returns:
            mixt: Last evaluated results.
        """

        if follow is not None:
            self.last_result = self.perform_follow(follow)
            Log.debug(u"Performing {}:follow '{}' => {}".format(self.def_key, follow, self.last_result))
        elif follow_xpath is not None:
            self.last_result = self.perform_follow(follow_xpath, xpath=True)
            Log.debug(u"Performing {}:follow:xpath '{}' => {}".format(self.def_key, follow_xpath, self.last_result))
        elif pattern is not None:
            self.last_result = self.perform_pattern(pattern)
            Log.debug(u"Performing {}:pattern '{}' => {}".format(self.def_key, pattern, self.last_result))
        elif remove is not None:
            self.last_result = self.perform_remove(remove)
            Log.debug(u"Performing {}:remove '{}' => {}".format(self.def_key, remove, self.last_result))
        elif glue is not None:
            self.last_result = self.perform_glue(glue)
            Log.debug(u"Performing {}:glue '{}' => {}".format(self.def_key, glue, self.last_result))
        elif replace is not None:
            self.last_result = self.perform_replace(*replace)
            Log.debug(u"Performing {}:replace '{}' => {}".format(self.def_key, replace, self.last_result))
        return self.last_result

    def perform_follow(self, follow, xpath=False):
        """Evaluate a CSS selector or a XPath expression.

        Args:
            follow (str): CSS selector or XPath expression.
            xpath (bool): True if follow is an expression.

        Returns:
            mixt: String if data is found, otherwise None or empty.
        """

        if xpath:
            data = self.source_code.xpath(follow)
            if isinstance(data, list):
                data = [d for d in data if not d.isspace()]
            last_result = lambda data: data.strip()
        else:
            data = self.source_code.cssselect(follow)
            def last_result(data):
                if isinstance(data, html.HtmlElement):
                    return data.text_content().strip()
                return self.last_result
        try:
            if data is None:
                return self.last_result
            if isinstance(data, list) and len(data) > 0:
                data = data[0]
            return last_result(data)
        except:
            return self.last_result

    def perform_pattern(self, pattern):
        """Evaluate a regular expression and returns first group.

        Args:
            pattern (str): Regular expression.

        Returns:
            mixt: String if data is found, otherwise None or empty.
        """

        if not isinstance(self.last_result, (str, unicode)):
            return self.last_result
        truth, var = self.is_variable(pattern)
        if truth and isinstance(var, (str, unicode)):
            pattern = var
        exp = compile(pattern, IGNORECASE)
        data = exp.findall(self.last_result)
        if data is None:
            return self.last_result
        if isinstance(data, list) and len(data) > 0:
            data = data[0]
        elif isinstance(data, list) and len(data) == 0:
            return self.last_result
        return data

    def perform_remove(self, remove):
        """Evaluate a regular expression and removes matching groups.

        Args:
            remove (str): Regular expression.

        Returns:
            mixt: New string, empty or None.
        """

        if not isinstance(self.last_result, (str, unicode)):
            return self.last_result
        truth, var = self.is_variable(remove)
        if truth and isinstance(var, (str, unicode)):
            remove = var
        return sub(remove, "", self.last_result)

    def perform_glue(self, glue):
        """Concatenate all strings from a list.

        Args:
            glue (list): List of strings to concatenate.

        Returns:
            mixt: New string, empty or None.
        """

        if not isinstance(glue, list):
            return self.last_result
        items = []
        for each in glue:
            truth, var = self.is_variable(each)
            items.append(var if truth else each)
        return "".join(items)

    def perform_replace(self, old_replace, new_replace):
        """Replace string-A with string-B.

        Args:
            old_replace (str): Old string to be replaced.
            new_replace (str): New string to replace with.

        Returns:
            mixt: New string, empty or None.
        """

        if not isinstance(self.last_result, (str, unicode)):
            return self.last_result
        def test_var(val):
            truth, var = self.is_variable(val)
            if truth and isinstance(var, (str, unicode)):
                val = var
            return val
        old, new = test_var(old_replace), test_var(new_replace)
        return sub(old, new, self.last_result)

    def prepare_config(self, configuration):
        """The "config" protocol.

        Configure requester with HTTP client-related options such as User-Agent,
        Content-Type, and other HTTP headers.

        Only HTTP headers are supported at the moment.
        """

        for k, v in configuration.iteritems():
            if k == Field.HEADERS and isinstance(v, dict):
                self.headers = v

    def prepare_meta(self, metafields):
        """The "meta" protocol.

        Meta fields are trated AS-IS and the only benefit of these fields is to
        be have them printed when verbose mode is enabled.
        """

        if len(metafields) > 0:
            Log.debug("Listing meta fields")
            for k, v in metafields.iteritems():
                Log.debug(" {} = {}".format(k, v))

    def prepare_link(self, link):
        """The "link" protocol.

        Set or update the link of the dataplan. Can be cached.
        """

        self.link = link
        ok, cache = Cache.read_link(self.link)
        if not self.no_cache and ok:
            Log.debug("Getting content from cache: {}".format(link))
            return self.prepare_source_code_from_cache(cache)
        Log.debug("Getting content from URL: {}".format(link))
        return self.open_url().prepare_source_code()

    def prepare_source_code_from_cache(self, cache_src):
        """Set source to cached source.
        """

        self.source = cache_src
        return self.prepare_source_code()

    def prepare_source_code(self):
        """Transforms plain string to HTML/XML nodes.

        Raises a warning if source is not set. The HTML document has the root
        node set to "html".
        """

        if self.source is None:
            Log.warn("Source code not completed!")
        self.source_code = html.fromstring(self.source)
        return self

    def open_url(self):
        """Simple URL reader.

        Access an URL and read it's content. Can be cached.

        If URL returns a non-OK (200) status code, a warning is printed, but if
        it return a non-HTML content-type, a fatal log is set.
        """

        source = self.read_url(self.link)
        if source.code != 200:
            Log.warn("Broken link? Non-200 status code: {}".format(source.code))
        if hasattr(source.info(), "gettype"):
            mimetype = source.info().gettype()
            if mimetype != "text/html":
                Log.fatal("Unsupported non-HTML content, got {}".format(mimetype))
        self.source = source.read()
        if not self.no_cache:
            ok, status = Cache.write_link(self.link, self.source)
            if not ok:
                Log.warn(status)
        return self

    def read_url(self, url):
        """Retrieve HTTP stream by a request.

        Args:
            url (str): URL to access.

        Returns:
            resource: HTTP stream resource.
        """

        return urlopen(self.decorate_headers(url))

    def decorate_headers(self, link):
        """Add headers to request.

        Args:
            link (str): Link to access

        Returns:
            requester: HTTP stream requester.
        """

        if self.headers:
            Log.debug("Setting outgoing HTTP headers to: {}".format(self.headers))
            return Request(link, headers=self.headers)
        return Request(link)

    @classmethod
    def run_get_records(cls, data, no_cache):
        """Launch parser and return records.

        Args:
            data     (dict): Parsed dataplan from JSON.
            no_cache (bool): True if --no-cache flag is provided.

        Returns:
            dict: Parsed results.
        """

        psr = cls(data, no_cache=no_cache)
        return psr.run().get_records()

    @classmethod
    def run_get_dataplan(cls, data, no_cache, refresh):
        """Launch parser and return dataplan.

        Args:
            data     (dict): Parsed dataplan from JSON.
            no_cache (bool): True if --no-cache is provided; disabled cache.
            refresh  (bool): True if --refresh is provided; resets stored records.

        Returns:
            dict: Updated dataplan with records.
        """

        psr = cls(data, no_cache=no_cache, refresh=refresh)
        return psr.run().get_dataplan()
