test: install
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--harmony \
		--bail

install:
	npm install

clean:
	@rm -rf node_modules

.PHONY: install test clean
