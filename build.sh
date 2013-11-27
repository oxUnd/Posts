#!/usr/bin/env bash
jekyll build

cd ../mysite

git commit -m 'new post' -a
git push origin master

cd -
