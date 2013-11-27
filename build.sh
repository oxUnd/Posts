#!/usr/bin/env bash
jekyll build

cd ../mysite

# push output
git add .
git commit -m 'new post' -a
git push origin master

cd -

# push source
git add .
git commit -m 'new post' -a
git push origin master
