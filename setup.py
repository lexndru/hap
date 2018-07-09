#!/usr/bin/env python

from setuptools import setup


long_description = ""
with open("README.md", "r") as f:
    long_description = f.read()

setup(name="hap",
    packages=[
        "hap",
    ],
    entry_points = {
        "console_scripts": [
            "hap = hap.bootstrap:main"
        ]
    },
    install_requires=[
        "lxml==3.6.4"
    ],
    version="0.1.0",
    description="A simple HTML scraping tool",
    long_description=long_description,
    author="Alexandru Catrina",
    author_email="alex@codeissues.net",
    license="MIT",
    url="https://github.com/lexndru/hap",
    download_url="https://github.com/lexndru/hap/archive/v0.1.2.tar.gz",
    keywords=["html", "scraping", "crawler", "tool", "hap"],
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Intended Audience :: End Users/Desktop",
        "Topic :: Internet :: WWW/HTTP",
        "Topic :: Text Processing :: Markup :: HTML",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 2.7",
    ],
)
