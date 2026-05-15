
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
import __module from "module";
import __path from "path";
import __fs from "fs";
const __rootRequire = __module.createRequire(import.meta.url);
const __appPath = __fs.realpathSync(import.meta.dirname);
const __sharpEntrypoint = __path.join(__appPath, "sharp", "index.js");
const __clipboardEntrypoint = __path.join(__appPath, "clipboard", "index.js");
const __foundryEntrypoint = __path.join(__appPath, "foundry-local-sdk", "index.js");
const __pvRecorderEntrypoint = __path.join(__appPath, "pvrecorder", "index.js");
const __sharpRequire = __fs.existsSync(__sharpEntrypoint)
    ? __module.createRequire(__sharpEntrypoint)
    : __rootRequire;
const __clipboardRequire = __fs.existsSync(__clipboardEntrypoint)
    ? __module.createRequire(__clipboardEntrypoint)
    : __rootRequire;
const __foundryRequire = __fs.existsSync(__foundryEntrypoint)
    ? __module.createRequire(__foundryEntrypoint)
    : __rootRequire;
const __pvRecorderRequire = __fs.existsSync(__pvRecorderEntrypoint)
    ? __module.createRequire(__pvRecorderEntrypoint)
    : __rootRequire;
const __isVendoredNativeModule = (module) =>
    typeof module === "string" &&
    (module.startsWith("@img/") || module.startsWith("@teddyzhu/") || module === "foundry-local-sdk" || module === "@picovoice/pvrecorder-node");
const require = (module) => {
    let req = __rootRequire;
    if (typeof module === "string" && module.startsWith("@img/")) {
        req = __sharpRequire;
    }
    if (typeof module === "string" && module.startsWith("@teddyzhu/")) {
        req = __clipboardRequire;
    }
    if (module === "foundry-local-sdk") {
        req = __foundryRequire;
    }
    if (module === "@picovoice/pvrecorder-node") {
        req = __pvRecorderRequire;
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
const __filename = __url.fileURLToPath(import.meta.url);
const __dirname = __path.dirname(__filename);
import{parentPort as T,workerData as ee}from"node:worker_threads";import{createRequire as D}from"node:module";import{existsSync as W}from"node:fs";import*as o from"node:fs/promises";import*as a from"node:path";import{createHash as H}from"node:crypto";import{join as u,basename as oe}from"node:path";import{homedir as g}from"node:os";function j(){return process.env.XDG_CACHE_HOME||u(g(),".cache")}function L(){if(process.platform==="darwin")return u(g(),"Library","Caches","copilot");if(process.platform==="win32"){let e=process.env.LOCALAPPDATA||u(g(),".cache");return u(e,"copilot")}return u(j(),"copilot")}function A(e){if(e.includes("<!DOCTYPE")||e.includes("<html")){let r=Math.min(e.indexOf("<!DOCTYPE")!==-1?e.indexOf("<!DOCTYPE"):1/0,e.indexOf("<html")!==-1?e.indexOf("<html"):1/0),t=e.substring(0,r).trim();return t?`${t} [HTML error page omitted]`:"[HTML error page omitted]"}return e}function m(e){let r;if(e instanceof Error)r=String(e);else if(typeof e=="object"&&e!==null)try{r=JSON.stringify(e)??"[object]"}catch{return"[object with circular reference]"}else r=String(e);return A(r)}var J=1,b=".complete";var h={"win32-x64":"win-x64","win32-arm64":"win-arm64","linux-x64":"linux-x64","darwin-arm64":"osx-arm64"};function S(){return typeof __foundryRequire<"u"&&__foundryRequire||D(import.meta.url)}var d;function U(){if(d)return d;try{let e=S()("foundry-local-sdk/script/install-utils.cjs");if(typeof e.runInstall!="function")throw new Error(`Expected exports {runInstall: function}, got: ${JSON.stringify(Object.fromEntries(Object.entries(e).map(([r,t])=>[r,typeof t])))}`);return d=e,d}catch(e){throw new Error(`Failed to load foundry-local-sdk/script/install-utils.cjs: ${m(e)}. The upstream foundry-local-sdk installer may have changed shape \u2014 re-run the audit checklist in src/cli/voice/foundry/installer/nativeLoader.ts and update accordingly.`)}}var f;function V(){if(f)return f;try{let e=S()("foundry-local-sdk/deps_versions.json");if(typeof e["foundry-local-core"]?.nuget!="string"||typeof e.onnxruntime?.version!="string"||typeof e["onnxruntime-genai"]?.version!="string")throw new Error('deps_versions.json is missing one of the expected version keys: ["foundry-local-core"].nuget, .onnxruntime.version, ["onnxruntime-genai"].version');return f=e,f}catch(e){throw new Error(`Failed to load foundry-local-sdk/deps_versions.json: ${m(e)}. The upstream foundry-local-sdk installer may have changed shape \u2014 re-run the audit checklist in src/cli/voice/foundry/installer/nativeLoader.ts and update accordingly.`)}}function I(e=process.platform){let r=V();return[{name:"Microsoft.AI.Foundry.Local.Core",version:r["foundry-local-core"].nuget},{name:e==="linux"?"Microsoft.ML.OnnxRuntime.Gpu.Linux":"Microsoft.ML.OnnxRuntime.Foundry",version:r.onnxruntime.version},{name:"Microsoft.ML.OnnxRuntimeGenAI.Foundry",version:r["onnxruntime-genai"].version}]}function O(e){return e==="win32"?".dll":e==="darwin"?".dylib":".so"}function q(e,r){return a.join(e,`Microsoft.AI.Foundry.Local.Core${O(r)}`)}function K(e){let r=O(e),t=e==="win32"?"":"lib";return[`Microsoft.AI.Foundry.Local.Core${r}`,`${t}onnxruntime${r}`,`${t}onnxruntime-genai${r}`]}function G(e,r=process.platform,t=process.arch){let n=h[`${r}-${t}`];if(!n)throw new Error(`Voice mode not supported on ${r}-${t}`);let i=e??process.env.COPILOT_CACHE_HOME??L(),s=I(r),c=H("sha256").update(JSON.stringify({schema:J,artifacts:s})).digest("hex").slice(0,12);return a.join(i,"foundry",c,n)}async function C(e={}){let r=e.platform??process.platform,t=e.arch??process.arch,n=`${r}-${t}`;if(!h[n])throw new Error(`Voice mode is not supported on ${n}. Supported platforms: ${Object.keys(h).join(", ")}.`);let s=G(e.cacheRoot,r,t),c=q(s,r),l=K(r);return await M(s,l)||(e.onDownloadStart?.(),await z(s,r,l,e.runInstall)),P(c,s,r,e.existsSyncImpl)}async function M(e,r){return await y(a.join(e,b))?(await Promise.all(r.map(n=>y(a.join(e,n))))).every(Boolean):!1}function P(e,r,t,n=Y){if(t!=="win32")return{corePath:e,needsBootstrap:!1};let i=a.join(r,"Microsoft.WindowsAppRuntime.Bootstrap.dll");return{corePath:e,needsBootstrap:n(i)}}function Y(e){try{return W(e)}catch{return!1}}async function y(e){try{return await o.access(e),!0}catch{return!1}}async function z(e,r,t,n){let i=a.dirname(e);await o.mkdir(i,{recursive:!0});let s=a.join(i,`.tmp-${a.basename(e)}-${process.pid}-${Date.now()}`);await o.mkdir(s,{recursive:!0});try{let c=n??U().runInstall,l=I(r);await B(()=>c(l,{binDir:s}));for(let k of t)if(!await y(a.join(s,k)))throw new Error(`Foundry runtime download finished but required file is missing: ${k}. RID for ${r} may not be supported by the published packages.`);await o.writeFile(a.join(s,b),""),await Q(s,e,t)}catch(c){throw await o.rm(s,{recursive:!0,force:!0}).catch(()=>{}),c}}async function Q(e,r,t){try{await o.rename(e,r)}catch(n){let i=n.code;if(i==="ENOTEMPTY"||i==="EEXIST"||i==="EPERM"){if(await M(r,t)){await o.rm(e,{recursive:!0,force:!0}).catch(()=>{});return}await o.rm(r,{recursive:!0,force:!0}),await o.rename(e,r);return}throw n}}async function B(e){let r=process.stdout.write.bind(process.stdout),t=process.stderr.write.bind(process.stderr);process.stdout.write=(()=>!0),process.stderr.write=(()=>!0);try{return await e()}finally{process.stdout.write=r,process.stderr.write=t}}var w=class extends Error{constructor(t,n,i){super(t,i);this.code=n;this.name="VoiceBackendError"}},X=16;function _(e){return N(e,new WeakSet,0)}function N(e,r,t){if(t>=X)return{name:"Error",message:"<cause chain truncated>"};if(typeof e=="object"&&e!==null){if(r.has(e))return{name:"Error",message:"<cyclic cause>"};r.add(e)}let n;if(e instanceof w)n={name:e.name,message:e.message,stack:e.stack,code:e.code};else if(e instanceof Error)n={name:e.name,message:e.message,stack:e.stack};else return{name:"Error",message:String(e)};return e instanceof Error&&e.cause!==void 0&&(n.cause=N(e.cause,r,t+1)),n}function R(e){return e instanceof Error?e:new Error(String(e))}var v=class{initialQueue=[];initialQueueResolvers=Promise.withResolvers();logWriter=null;writePromise=this.initialQueueResolvers.promise;setLogWriter(r){this.logWriter=r;for(let t of this.initialQueue)this.writePromise=this.logWriter.writeLog(t.method,t.message);this.initialQueue=[],this.initialQueueResolvers.resolve()}async flush(){await this.writePromise}async dispose(){await this.flush()}outputPath(){return this.logWriter?.outputPath()}logToLevel(r,t){this.logWriter?this.writePromise=this.logWriter.writeLog(r,t):this.initialQueue.push({method:r,message:t})}info(r){this.logToLevel("info",r)}debug(r){this.logToLevel("debug",r)}warning(r){this.logToLevel("warning",r)}error(r){this.logToLevel("error",r instanceof Error?r.message:r)}log(r){this.error(r)}isDebug(){return!1}shouldLog(r){return!0}notice(r){this.info(r instanceof Error?r.message:r)}startGroup(r,t){this.info(`--- Start of group: ${r} ---`)}endGroup(r){this.info("--- End of group ---")}},F=new v;var E=16*1024,x=class{constructor(r){this.port=r}writeLog(r,t){let n={kind:"log",level:r,message:Z(t)};try{this.port.postMessage(n)}catch{}return Promise.resolve()}outputPath(){return"<voice-worker>"}};function $(e,r=F){r.setLogWriter(new x(e))}function Z(e){return e.length<=E?e:`${e.slice(0,E)}\u2026 [truncated, ${e.length-E} more chars]`}if(!T)throw new Error("voice-installer.worker.js must be loaded as a worker thread.");var p=T;$(p);var re=ee??{};async function te(){try{let r={kind:"ok",location:await C({cacheRoot:re.cacheRoot,onDownloadStart:()=>{let t={kind:"download-started"};p.postMessage(t)}})};p.postMessage(r)}catch(e){let r={kind:"error",error:_(R(e))};p.postMessage(r)}finally{setImmediate(()=>process.exit(0))}}te().catch(()=>{process.exit(1)});
