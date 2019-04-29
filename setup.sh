#!/bin/bash

if [ -d "v2" ]; then
    echo Version 2.0 repository already installed in /v2/. You might want to add this in your git-client-ui.
else
    git clone "https://github.com/helsingborg-stad/styleguide.git" "v2"
fi