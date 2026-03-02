// server.js — Hostinger Phusion Passenger entry point
//
// Passenger requires the startup file at the project root.
// This delegates to .next/standalone/server.js which Next.js generates
// when output: 'standalone' is set in next.config.mjs.
//
// The standalone server is self-contained: it bundles all required
// node_modules inside .next/standalone so no npm install is needed there.
//
// After every build, static assets must be copied into the standalone folder:
//   cp -r public  .next/standalone/public
//   cp -r .next/static  .next/standalone/.next/static
// (Hostinger's build step handles this if you add it to the build command.)

'use strict'
process.chdir(__dirname)
require('./.next/standalone/server.js')
