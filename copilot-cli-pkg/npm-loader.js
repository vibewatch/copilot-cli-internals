#!/usr/bin/env node

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------------------------------------------*/

import{spawnSync as o}from"node:child_process";import{fileURLToPath as i}from"node:url";import{isNonGlibcLinuxSync as e}from"detect-libc";async function a(){for(const t of c())try{const r=i(import.meta.resolve(`@github/copilot-${t}-${process.arch}`)),n=o(r,process.argv.slice(2),{stdio:"inherit"});process.exit(s(n,r))}catch{}console.error("GitHub Copilot CLI: no platform package found. Reinstall with `npm install -g @github/copilot` to fetch the package for your platform."),process.exit(1)}a().catch(()=>{});function s(t,r){if(t.error)throw t.error;if(t.signal)throw process.stderr.write(`GitHub Copilot native binary at ${r} was terminated by signal ${t.signal}.
`),new Error(`Native binary terminated by signal ${t.signal}`);return t.status??1}function c(){return process.platform==="linux"?l()?["linuxmusl","linux"]:["linux"]:[process.platform]}function l(){return e()}export{s as handleSpawnResult};
