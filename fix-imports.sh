#!/bin/bash

echo "Fixing TypeScript import statements..."

# Find all TypeScript files and add .js extensions to relative imports
find . -name "*.ts" -not -name "*.d.ts" -not -path "./node_modules/*" | while read -r file; do
  # Use sed to add .js extensions to relative imports that don't already have them
  sed -i 's/from '\''\.\/\([^'\'']*\)'\''/from '\''.\/\1.js'\''/g' "$file"
  sed -i 's/from '\''\.\.\/\([^'\'']*\)'\''/from '\''..\/\1.js'\''/g' "$file"
  sed -i 's/from "\.\/\([^"]*\)"/from ".\/\1.js"/g' "$file"
  sed -i 's/from "\.\.\/\([^"]*\)"/from "..\/\1.js"/g' "$file"
  
  # Remove double .js.js extensions that might have been created
  sed -i 's/\.js\.js/.js/g' "$file"
done

echo "Import fixes completed."
