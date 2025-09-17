#!/bin/sh
set -x
git config --global --add safe.directory $PWD
emacs --batch --no-init-file --directory $PWD --script publish.el
