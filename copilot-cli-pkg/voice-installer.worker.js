(()=>{const stack=new Error().stack;stack&&(globalThis._sentryDebugIds=globalThis._sentryDebugIds||{},globalThis._sentryDebugIds[stack]="42ad8989-18c5-53f6-9498-d6d78a37ceab",globalThis._sentryDebugIdIdentifier="sentry-dbid-42ad8989-18c5-53f6-9498-d6d78a37ceab");})();

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
import __module from "module";
import __path from "path";
import __fs from "fs";
const __rootRequire = __module.createRequire(import.meta.url);
const __appPath = __fs.realpathSync(import.meta.dirname);
const __clipboardEntrypoint = __path.join(__appPath, "clipboard", "index.js");
const __foundryEntrypoint = __path.join(__appPath, "foundry-local-sdk", "index.js");
const __pvRecorderEntrypoint = __path.join(__appPath, "pvrecorder", "index.js");
const __napiOopEntrypoint = __path.join(__appPath, "napi-oop-runtime", "index.js");
const __clipboardRequire = __fs.existsSync(__clipboardEntrypoint)
    ? __module.createRequire(__clipboardEntrypoint)
    : __rootRequire;
const __foundryRequire = __fs.existsSync(__foundryEntrypoint)
    ? __module.createRequire(__foundryEntrypoint)
    : __rootRequire;
const __pvRecorderRequire = __fs.existsSync(__pvRecorderEntrypoint)
    ? __module.createRequire(__pvRecorderEntrypoint)
    : __rootRequire;
const __napiOopRequire = __fs.existsSync(__napiOopEntrypoint)
    ? __module.createRequire(__napiOopEntrypoint)
    : __rootRequire;
const __isVendoredNativeModule = (module) =>
    typeof module === "string" &&
    (module.startsWith("@teddyzhu/") || module === "foundry-local-sdk" || module === "@picovoice/pvrecorder-node" || module === "napi-oop-runtime");
const require = (module) => {
    let req = __rootRequire;
    if (typeof module === "string" && module.startsWith("@teddyzhu/")) {
        req = __clipboardRequire;
    }
    if (module === "foundry-local-sdk") {
        req = __foundryRequire;
    }
    if (module === "@picovoice/pvrecorder-node") {
        req = __pvRecorderRequire;
    }
    if (module === "napi-oop-runtime") {
        req = __napiOopRequire;
    }

    if (typeof module === "string" && (__module.isBuiltin(module) || __isVendoredNativeModule(module))) {
        return req(module);
    }

    const modulePath = __fs.realpathSync(req.resolve(module));
    const relativePath = __path.relative(__appPath, modulePath);

    if (relativePath.startsWith("..")) {
        throw new Error("Requiring module outside of application is a security concern; module: " + modulePath + ", app: " + __appPath);
    }

    return req(module);
};import __url from "url";
const __esmShimFilename = __url.fileURLToPath(import.meta.url);
const __esmShimDirname = __path.dirname(__esmShimFilename);
import{parentPort as W,workerData as B}from"node:worker_threads";var d=class{initialQueue=[];initialQueueResolvers=Promise.withResolvers();logWriter=null;writePromise=this.initialQueueResolvers.promise;setLogWriter(e){this.logWriter=e;for(let t of this.initialQueue)this.writePromise=this.logWriter.writeLog(t.method,t.message);this.initialQueue=[],this.initialQueueResolvers.resolve()}async flush(){this.logWriter&&await this.writePromise}async dispose(){await this.flush()}outputPath(){return this.logWriter?.outputPath()}logToLevel(e,t){this.logWriter?this.writePromise=this.logWriter.writeLog(e,t):this.initialQueue.push({method:e,message:t})}info(e){this.logToLevel("info",e)}debug(e){this.logToLevel("debug",e)}warning(e){this.logToLevel("warning",e)}error(e){this.logToLevel("error",e instanceof Error?e.message:e)}log(e){this.error(e)}isDebug(){return!1}shouldLog(e){return!0}notice(e){this.info(e instanceof Error?e.message:e)}startGroup(e,t){this.info(`--- Start of group: ${e} ---`)}endGroup(e){this.info("--- End of group ---")}},u=new d;import{createRequire as A}from"node:module";import*as n from"node:fs/promises";import*as a from"node:path";import{createHash as j}from"node:crypto";import{join as l,basename as ir}from"node:path";import{homedir as h}from"node:os";function F(){return process.env.XDG_CACHE_HOME||l(h(),".cache")}function O(){if(process.platform==="darwin")return l(h(),"Library","Caches","copilot");if(process.platform==="win32"){let r=process.env.LOCALAPPDATA||l(h(),".cache");return l(r,"copilot")}return l(F(),"copilot")}function D(r){if(r.includes("<!DOCTYPE")||r.includes("<html")){let e=Math.min(r.indexOf("<!DOCTYPE")!==-1?r.indexOf("<!DOCTYPE"):1/0,r.indexOf("<html")!==-1?r.indexOf("<html"):1/0),t=r.substring(0,e).trim();return t?`${t} [HTML error page omitted]`:"[HTML error page omitted]"}return r}function y(r){let e;if(r instanceof Error)e=String(r);else if(typeof r=="object"&&r!==null)try{e=JSON.stringify(r)??"[object]"}catch{return"[object with circular reference]"}else e=String(r);return D(e)}var H=1,I=".complete";var w={"win32-x64":"win-x64","win32-arm64":"win-arm64","linux-x64":"linux-x64","darwin-arm64":"osx-arm64"};function b(){return typeof __foundryRequire<"u"&&__foundryRequire||A(import.meta.url)}var p;function U(){if(p)return p;try{let r=b()("foundry-local-sdk/script/install-utils.cjs");if(typeof r.runInstall!="function")throw new Error(`Expected exports {runInstall: function}, got: ${JSON.stringify(Object.fromEntries(Object.entries(r).map(([e,t])=>[e,typeof t])))}`);return p=r,p}catch(r){throw new Error(`Failed to load foundry-local-sdk/script/install-utils.cjs: ${y(r)}. The upstream foundry-local-sdk installer may have changed shape \u2014 re-run the audit checklist in src/cli/voice/foundry/installer/nativeLoader.ts and update accordingly.`)}}var g;function J(){if(g)return g;try{let r=b()("foundry-local-sdk/deps_versions.json");if(typeof r["foundry-local-core"]?.nuget!="string"||typeof r.onnxruntime?.version!="string"||typeof r["onnxruntime-genai"]?.version!="string")throw new Error('deps_versions.json is missing one of the expected version keys: ["foundry-local-core"].nuget, .onnxruntime.version, ["onnxruntime-genai"].version');return g=r,g}catch(r){throw new Error(`Failed to load foundry-local-sdk/deps_versions.json: ${y(r)}. The upstream foundry-local-sdk installer may have changed shape \u2014 re-run the audit checklist in src/cli/voice/foundry/installer/nativeLoader.ts and update accordingly.`)}}function S(r=process.platform){let e=J();return[{name:"Microsoft.AI.Foundry.Local.Core",version:e["foundry-local-core"].nuget},{name:r==="linux"?"Microsoft.ML.OnnxRuntime.Gpu.Linux":"Microsoft.ML.OnnxRuntime.Foundry",version:e.onnxruntime.version},{name:"Microsoft.ML.OnnxRuntimeGenAI.Foundry",version:e["onnxruntime-genai"].version}]}function C(r){return r==="win32"?".dll":r==="darwin"?".dylib":".so"}function V(r,e){return a.join(r,`Microsoft.AI.Foundry.Local.Core${C(e)}`)}function q(r){let e=C(r),t=r==="win32"?"":"lib";return[`Microsoft.AI.Foundry.Local.Core${e}`,`${t}onnxruntime${e}`,`${t}onnxruntime-genai${e}`]}function K(r,e=process.platform,t=process.arch){let o=w[`${e}-${t}`];if(!o)throw new Error(`Voice mode not supported on ${e}-${t}`);let i=r??process.env.COPILOT_CACHE_HOME??O(),s=S(e),c=j("sha256").update(JSON.stringify({schema:H,artifacts:s})).digest("hex").slice(0,12);return a.join(i,"foundry",c,o)}async function $(r={}){let e=r.platform??process.platform,t=r.arch??process.arch,o=`${e}-${t}`;if(!w[o])throw new Error(`Voice mode is not supported on ${o}. Supported platforms: ${Object.keys(w).join(", ")}.`);let s=K(r.cacheRoot,e,t),c=V(s,e),f=q(e);return await N(s,f)?{corePath:c}:(r.onDownloadStart?.(),await G(s,e,f,r.runInstall),{corePath:c})}async function N(r,e){return await v(a.join(r,I))?(await Promise.all(e.map(o=>v(a.join(r,o))))).every(Boolean):!1}async function v(r){try{return await n.access(r),!0}catch{return!1}}async function G(r,e,t,o){let i=a.dirname(r);await n.mkdir(i,{recursive:!0});let s=a.join(i,`.tmp-${a.basename(r)}-${process.pid}-${Date.now()}`);await n.mkdir(s,{recursive:!0});try{let c=o??U().runInstall,f=S(e);await z(()=>c(f,{binDir:s}));for(let P of t)if(!await v(a.join(s,P)))throw new Error(`Foundry runtime download finished but required file is missing: ${P}. RID for ${e} may not be supported by the published packages.`);await n.writeFile(a.join(s,I),""),await Q(s,r,t)}catch(c){throw await n.rm(s,{recursive:!0,force:!0}).catch(()=>{}),c}}async function Q(r,e,t){try{await n.rename(r,e)}catch(o){let i=o.code;if(i==="ENOTEMPTY"||i==="EEXIST"||i==="EPERM"){if(await N(e,t)){await n.rm(r,{recursive:!0,force:!0}).catch(()=>{});return}await n.rm(e,{recursive:!0,force:!0}),await n.rename(r,e);return}throw o}}async function z(r){let e=process.stdout.write.bind(process.stdout),t=process.stderr.write.bind(process.stderr);process.stdout.write=(()=>!0),process.stderr.write=(()=>!0);try{return await r()}finally{process.stdout.write=e,process.stderr.write=t}}var E=class extends Error{constructor(t,o,i){super(t,i);this.code=o;this.name="VoiceBackendError"}code};function _(r){return r instanceof E?{message:r.message,code:r.code}:r instanceof Error?{message:r.message}:{message:String(r)}}function M(r){return r instanceof Error?r:new Error(String(r))}var X=16;function L(r){return R(r,new WeakSet,0)}function R(r,e,t){if(t>=X)return"<cause chain truncated>";if(typeof r=="object"&&r!==null){if(e.has(r))return"<cyclic cause>";e.add(r)}if(!(r instanceof Error))return String(r);let o=r.stack??`${r.name}: ${r.message}`;if(r.cause===void 0)return o;let i=R(r.cause,e,t+1);return`${o}
Caused by: ${i}`}var x=16*1024,k=class{constructor(e){this.port=e}port;writeLog(e,t){let o={kind:"log",level:e,message:Y(t)};try{this.port.postMessage(o)}catch{}return Promise.resolve()}outputPath(){return"<voice-worker>"}};function T(r,e=u){e.setLogWriter(new k(r))}function Y(r){return r.length<=x?r:`${r.slice(0,x)}\u2026 [truncated, ${r.length-x} more chars]`}if(!W)throw new Error("voice-installer.worker.js must be loaded as a worker thread.");var m=W;T(m);var Z=B??{};async function rr(){try{let e={kind:"ok",location:await $({cacheRoot:Z.cacheRoot,onDownloadStart:()=>{let t={kind:"download-started"};m.postMessage(t)}})};m.postMessage(e)}catch(r){let e=M(r);u.error(`[voice-installer worker] install failed: ${L(e)}`);let t={kind:"error",error:_(e)};m.postMessage(t)}finally{setImmediate(()=>process.exit(0))}}rr().catch(r=>{u.error(`[voice-installer worker] fatal: ${L(r)}`),process.exit(1)});
//# sourceMappingURL=voice-installer.worker.js.map
