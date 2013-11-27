#!/usr/bin/env bash
jekyll build

cd ../mysite

git add .
git commit -m 'new post' -a
git push origin master

cd -
