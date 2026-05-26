#!/usr/bin/env node

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------------------------------------------*/

import{spawnSync as e}from"node:child_process";import{fileURLToPath as s}from"node:url";import{isNonGlibcLinuxSync as i}from"detect-libc";async function n(){for(const r of c())try{const t=s(import.meta.resolve(`@github/copilot-${r}-${process.arch}`)),o=e(t,process.argv.slice(2),{stdio:"inherit"});if(o.error)throw o.error;process.exit(o.status??1)}catch{}parseInt(process.versions.node.split(".")[0],10)<24&&(console.error(`GitHub Copilot CLI requires Node.js v24 or higher. Currently using v${process.versions.node}.`),process.exit(1));try{await import("./index.js")}catch(r){console.error("Failed to load GitHub Copilot CLI:",r),process.exit(1)}}n().catch(()=>{});function c(){return process.platform==="linux"?a()?["linuxmusl","linux"]:["linux"]:[process.platform]}function a(){return i()}
