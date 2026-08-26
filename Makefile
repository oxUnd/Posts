.PHONY: all site preview release clean

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

clean:
	rm -rf public
