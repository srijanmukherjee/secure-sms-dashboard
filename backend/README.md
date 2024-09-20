# Backend

This module contains the backend code for secure sms dashboard. The core logic for each endpoint is separated in `internal/service/*`. This allows us to build both lamnda handlers and a http server for local testing quite easily.

NOTE FOR ARM USERS: The lambda executables are built for x86 architecture.

## Instructions

- To build lambda zip files run `make` or `make bundle`
- To test the server locally run `make server` and `./build/server`
