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

CWD=$(shell pwd)
APP_DIR=hap
PY2_SRC=python2
PY3_SRC=python3
NODE_SRC=nodejs
JAVA_SRC=java
GO_SRC=go

.PHONY: all clean-py2 build-py2 lint-py2 test-py2 install-py2 release-py2

all: clean-py2 lint-py2 test-py2

build-py2: lint-py2 test-py2
	@echo "Creating temporary build directory for Python2.x ..."
	@cd /tmp && virtualenv $(APP_DIR) && cd $(APP_DIR)
	@cp -R $(CWD)/$(PY2_SRC) /tmp/$(APP_DIR)
	@echo "Done"

clean-py2:
	@echo "Cleaning Python2.x temporary files ..."
	@cd $(PY2_SRC) && find . -regextype posix-extended -regex ".*.pyc" -type f -delete
	@echo "Done"

release-py2: build
	@echo "Creating Python2.x release distribution ..."
	@cd /tmp/$(APP_DIR)/$(APP_DIR) && python setup.py sdist
	@echo "Done"

lint-py2:
	@echo "Checking Python2.x sources ..."
	@cd $(PY2_SRC) && flake8 $(APP_DIR)
	@echo "Done"

test-py2:
	@echo "Checking Python2.x tests ..."
	@cd $(PY2_SRC) && python -m unittest discover -v tests
	@echo "Done"

install-py2:
	@echo "Installing Python2.x from current sources ..."
	@cd $(PY2_SRC) && python setup.py install
	@echo "Done"
