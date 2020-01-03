#!/bin/sh
exec docker run --rm -it -p4000:4000 -v "$PWD:/srv/jekyll" jekyll/jekyll jekyll serve --watch
