CWD=$(shell pwd)
SRCDIR=hap

.PHONY: all clean build

all: clean build

build:
	cd /tmp && virtualenv $(SRCDIR) && cd $(SRCDIR)
	cp -R $(CWD) /tmp/$(SRCDIR)
	ls -l

clean:
	find . -regextype posix-extended -regex ".*.pyc" -type f -delete
	rm -rf /tmp/$(SRCDIR)

release: build
	cd /tmp/$(SRCDIR)/hap && python setup.py sdist
	ls -l
