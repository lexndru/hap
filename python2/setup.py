#!/usr/bin/env python

import io

from setuptools import setup
from os import path

from hap import __version__


long_description = """
Hap! is an HTML parser and scraping tool build upon its own concept to transform markup-language documents into valuable data. It implements the dataplan application specification for markup-language data-oriented documents.

The complete guide for Hap! can be found on the frontpage of the github repository https://github.com/lexndru/hap
"""


setup(name="hap",
    packages=[
        "hap",
    ],
    entry_points = {
        "console_scripts": [
            "hap = hap.bootstrap:main"
        ]
    },
    test_suite="tests",
    install_requires=[
        "lxml==3.6.4",
        "cssselect==1.0.0",
    ],
    version=__version__,
    description="A simple HTML scraping tool",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="Alexandru Catrina",
    author_email="alex@codeissues.net",
    license="MIT",
    url="https://github.com/lexndru/hap",
    download_url="https://github.com/lexndru/hap",
    keywords=["html", "scraping", "crawler", "tool", "hap"],
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "Intended Audience :: End Users/Desktop",
        "Topic :: Internet :: WWW/HTTP",
        "Topic :: Text Processing :: Markup :: HTML",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 2.7",
    ],
)
