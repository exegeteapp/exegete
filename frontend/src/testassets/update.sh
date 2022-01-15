#!/bin/bash

o="TestCatalog.ts";
t="$o.new";
echo -n > "$t"

echo "import { ScriptureCatalog } from '../scripture/Scripture';" >> "$t"
echo '' >> "$t"
echo 'const TestCatalog: ScriptureCatalog = ' >> "$t"
curl https://exegete.app/api/v1/scripture/catalog >> "$t"
echo '' >> "$t"
echo 'export default TestCatalog;' >> "$t"
mv "$t" "$o"

