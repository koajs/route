test: node_modules/
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--harmony \
		--bail

node_modules: package.json
	@npm install

clean:
	@rm -rf node_modules

.PHONY: test clean
