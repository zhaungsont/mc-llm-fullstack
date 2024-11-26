#!/bin/bash

# Step 1: Use NVM
nvm use

# Step 2: Run build command
npm run build

# Step 3: Wait for build to finish (npm run build is synchronous)

# Step 4: Navigate to 'dist' directory
cd dist || { echo "dist directory not found"; exit 1; }

# Step 5: Zip everything inside 'dist' to 'dist.zip'
zip -r ../dist.zip ./*

# Done
echo "Build and zip process completed successfully!"
