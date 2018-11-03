#!/usr/bin/env python

from setuptools import setup
from os import path

from hap import __version__


long_description = "Hap! description"

directory = path.abspath(path.dirname(__file__))
with open(path.join(directory, "README.md"), encoding="utf-8") as fd:
    long_description = fd.read()


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
        "Programming Language :: Python :: 3.5",
    ],
)
