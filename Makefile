.PHONY: all site preview release test clean

PORT ?= 8000

all: site

site:
	./build.sh

preview: site
	@echo "Preview: http://127.0.0.1:$(PORT)"
	python3 -m http.server $(PORT) --bind 127.0.0.1 --directory public

release:
	SITE_FEATURE_SEED=random ./build.sh
	./release.sh

test:
	python3 -m unittest discover -s tests -v

clean:
	rm -rf public
