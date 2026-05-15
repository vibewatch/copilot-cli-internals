
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
var L=(t=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(t,{get:(e,r)=>(typeof require<"u"?require:e)[r]}):t)(function(t){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+t+'" is not supported')});import{parentPort as m}from"node:worker_threads";var a=class extends Error{constructor(r,o,n){super(r,n);this.code=o;this.name="VoiceBackendError"}},x=16;function d(t){return E(t,new WeakSet,0)}function E(t,e,r){if(r>=x)return{name:"Error",message:"<cause chain truncated>"};if(typeof t=="object"&&t!==null){if(e.has(t))return{name:"Error",message:"<cyclic cause>"};e.add(t)}let o;if(t instanceof a)o={name:t.name,message:t.message,stack:t.stack,code:t.code};else if(t instanceof Error)o={name:t.name,message:t.message,stack:t.stack};else return{name:"Error",message:String(t)};return t instanceof Error&&t.cause!==void 0&&(o.cause=E(t.cause,e,r+1)),o}function w(t){return t instanceof Error?t:new Error(String(t))}var p=class{initialQueue=[];initialQueueResolvers=Promise.withResolvers();logWriter=null;writePromise=this.initialQueueResolvers.promise;setLogWriter(e){this.logWriter=e;for(let r of this.initialQueue)this.writePromise=this.logWriter.writeLog(r.method,r.message);this.initialQueue=[],this.initialQueueResolvers.resolve()}async flush(){await this.writePromise}async dispose(){await this.flush()}outputPath(){return this.logWriter?.outputPath()}logToLevel(e,r){this.logWriter?this.writePromise=this.logWriter.writeLog(e,r):this.initialQueue.push({method:e,message:r})}info(e){this.logToLevel("info",e)}debug(e){this.logToLevel("debug",e)}warning(e){this.logToLevel("warning",e)}error(e){this.logToLevel("error",e instanceof Error?e.message:e)}log(e){this.error(e)}isDebug(){return!1}shouldLog(e){return!0}notice(e){this.info(e instanceof Error?e.message:e)}startGroup(e,r){this.info(`--- Start of group: ${e} ---`)}endGroup(e){this.info("--- End of group ---")}},k=new p;var g=16*1024,f=class{constructor(e){this.port=e}writeLog(e,r){let o={kind:"log",level:e,message:T(r)};try{this.port.postMessage(o)}catch{}return Promise.resolve()}outputPath(){return"<voice-worker>"}};function b(t,e=k){e.setLogWriter(new f(t))}function T(t){return t.length<=g?t:`${t.slice(0,g)}\u2026 [truncated, ${t.length-g} more chars]`}function P(t,e){t.on("message",r=>{if(r==null||typeof r!="object")return;let o=r;o.kind==="request"&&R(t,e,o).catch(()=>{})})}async function R(t,e,r){try{let o=r.method,n=r.params,s=await e.call(o,n),i={kind:"response",id:r.id,ok:!0,result:s};t.postMessage(i)}catch(o){let n={kind:"response",id:r.id,ok:!1,error:d(o)};t.postMessage(n)}}function S(t){if(t.includes("<!DOCTYPE")||t.includes("<html")){let e=Math.min(t.indexOf("<!DOCTYPE")!==-1?t.indexOf("<!DOCTYPE"):1/0,t.indexOf("<html")!==-1?t.indexOf("<html"):1/0),r=t.substring(0,e).trim();return r?`${r} [HTML error page omitted]`:"[HTML error page omitted]"}return t}function h(t){let e;if(t instanceof Error)e=String(t);else if(typeof t=="object"&&t!==null)try{e=JSON.stringify(t)??"[object]"}catch{return"[object with circular reference]"}else e=String(t);return S(e)}var u=class{listeners=new Map;on(e,r){let o=this.listeners.get(e);o||(o=new Set,this.listeners.set(e,o));let n=r,s=o;return s.add(n),()=>{s.delete(n)}}emit(e,r){let o=this.listeners.get(e);if(!o)return;let n=[...o];for(let s of n)try{s(r)}catch{}}clear(){this.listeners.clear()}};var O=1600,C=15,l=class{pvRecorderLoader;state={tag:"idle"};shutdownPromise;events=new u;handlers={start:e=>this.handleStart(e),stop:()=>this.handleStop(),getState:()=>this.handleGetState(),shutdown:e=>this.handleShutdown(e)};constructor(e={}){this.pvRecorderLoader=e.pvRecorderLoader??(async()=>L("@picovoice/pvrecorder-node"))}call(e,r,o){if(this.shutdownPromise&&e!=="shutdown")return Promise.reject(this.disposedError());let n=this.handlers[e];return n(r)}on(e,r){return this.events.on(e,r)}onFatalError(e){return()=>{}}shutdown(e){return this.call("shutdown",e)}get inputDeviceId(){let e=this.state;switch(e.tag){case"idle":case"stopping":return;case"starting":case"active":return e.deviceId;default:return e}}handleStart(e={}){let r=e.inputDeviceId??-1,o=this.state;switch(o.tag){case"idle":return this.beginStart(r);case"starting":return o.deviceId!==r?Promise.reject(new a(`Microphone is starting on device ${o.deviceId}; cannot start device ${r}.`,"device-busy")):o.startTask;case"active":return o.deviceId!==r?Promise.reject(new a(`Microphone is already open on device ${o.deviceId}; cannot start device ${r}.`,"device-busy")):Promise.resolve();case"stopping":{let n=o.teardown,s={stopped:!1},i=(async()=>{await n.catch(()=>{}),await this.runStart(r,s)})();return this.state={tag:"starting",deviceId:r,cancel:s,startTask:i},i}default:return o}}beginStart(e){let r={stopped:!1},o=this.runStart(e,r);return this.state={tag:"starting",deviceId:e,cancel:r,startTask:o},o}async runStart(e,r){try{let o;try{o=await this.pvRecorderLoader()}catch(i){throw new a(`Voice mode microphone backend (@picovoice/pvrecorder-node) is not available: ${h(i)}. Voice mode may not be supported on this platform, or the install is incomplete \u2014 try reinstalling the CLI.`,"mic-unavailable",{cause:i})}let n;try{n=new o.PvRecorder(O,e,C),n.start()}catch(i){if(n!==void 0){let y=n;c(()=>y.stop()),c(()=>y.release())}throw new a(`Failed to open microphone: ${h(i)}.`,"mic-unavailable",{cause:i})}if(this.shutdownPromise||r.stopped)throw c(()=>n.stop()),c(()=>n.release()),this.shutdownPromise?this.disposedError():new a("Microphone start was cancelled.","cancelled");let s=this.runReadLoop(n,r);this.state={tag:"active",deviceId:e,recorder:n,cancel:r,loop:s}}catch(o){throw this.state.tag==="starting"&&this.state.cancel===r&&(this.state={tag:"idle"}),o}}handleStop(){let e=this.state;switch(e.tag){case"idle":return Promise.resolve();case"starting":{e.cancel.stopped=!0;let r=e.startTask.then(()=>{},()=>{});return this.state={tag:"stopping",teardown:r},r.then(()=>{this.state.tag==="stopping"&&this.state.teardown===r&&(this.state={tag:"idle"})})}case"active":{e.cancel.stopped=!0,c(()=>e.recorder.stop());let r=e.recorder,o=e.loop,n=(async()=>{await o.catch(()=>{}),c(()=>r.release())})();return this.state={tag:"stopping",teardown:n},n.then(()=>{this.state.tag==="stopping"&&this.state.teardown===n&&(this.state={tag:"idle"})})}case"stopping":return e.teardown;default:return e}}handleGetState(){let e=this.state;switch(e.tag){case"idle":case"starting":case"stopping":return Promise.resolve({open:!1});case"active":return Promise.resolve({open:!0});default:return e}}handleShutdown(e){return this.shutdownPromise?this.shutdownPromise:(this.shutdownPromise=(async()=>{await this.handleStop(),this.events.clear()})(),this.shutdownPromise)}disposedError(){return new a("Mic backend has been shut down.","disposed")}async runReadLoop(e,r){for(;!r.stopped;){let o;try{o=await e.read()}catch(s){if(r.stopped)return;r.stopped=!0,this.state.tag==="active"&&this.state.cancel===r&&(this.state={tag:"idle"}),c(()=>e.stop()),c(()=>e.release());let i=w(s);this.events.emit("error",{error:i});return}if(r.stopped)return;let n=Buffer.from(o.buffer.slice(o.byteOffset,o.byteOffset+o.byteLength));this.events.emit("pcm",n)}}};function c(t){try{t()}catch{}}if(!m)throw new Error("voice-mic.worker.js must be loaded as a worker thread.");b(m);var v=m,M=new l;M.on("pcm",t=>{let e={buffer:t.buffer,byteOffset:t.byteOffset,byteLength:t.byteLength},r={kind:"event",event:"pcm",payload:e};v.postMessage(r,[e.buffer])});M.on("error",t=>{let r={kind:"event",event:"error",payload:{error:d(t.error)}};v.postMessage(r)});P(v,M);
