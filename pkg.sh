#!/usr/bin/env bash

# css
css_pkg='assets/all.css'
rm -f $css_pkg
cat assets/resources/bootstrap/css/bootstrap.min.css >> $css_pkg
sed 's/\.\.\/fonts/\/assets\/resources\/font-awesome\/fonts/g' assets/resources/font-awesome/css/font-awesome.min.css >> $css_pkg
cat assets/resources/syntax/syntax.css >> css_pkg
cat assets/css/style.css >> css_pkg

# js
js_pkg='assets/all.js'
rm -f $js_pkg
cat assets/resources/jquery/jquery.min.js >> $js_pkg
cat assets/resources/bootstrap/js/bootstrap.min.js >> $js_pkg
cat assets/js/app.js >> $js_pkg