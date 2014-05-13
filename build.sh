#!/usr/bin/env bash

# delete local site
rm -rf _site

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
