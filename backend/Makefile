ENV=GOOS=linux GOARCH=amd64
FLAGS=-ldflags="-s -w"
GO_BUILD=$(ENV) go build $(FLAGS) -tags lambda.norpc -o

EXECUTABLE=bootstrap
BUILD_DIR=build
LAMBDA_DIR=lambda
BUNDLE_DIR=dist
HANDLER_FILENAME=handler.go

HANDLERS := $(wildcard $(LAMBDA_DIR)/*/$(HANDLER_FILENAME))
BUILDS := $(patsubst $(LAMBDA_DIR)/%/$(HANDLER_FILENAME), $(BUILD_DIR)/%/bootstrap, $(HANDLERS))
ZIPS := $(patsubst $(BUILD_DIR)/%/bootstrap, $(BUNDLE_DIR)/%.zip, $(BUILDS))

bundle: $(ZIPS)
build: $(BUILDS)

$(BUILD_DIR)/%/bootstrap: lambda/%/$(HANDLER_FILENAME)
	$(GO_BUILD) $@ $<

$(BUNDLE_DIR)/%.zip: $(BUILD_DIR)/%/bootstrap
	@mkdir -p $(dir $@)
	zip -j $@ $<

server: cmd/server.go
	go build -o build/server cmd/server.go

clean:
	rm -rf $(BUILD_DIR) $(BUNDLE_DIR)

.PHONY: bundle clean
