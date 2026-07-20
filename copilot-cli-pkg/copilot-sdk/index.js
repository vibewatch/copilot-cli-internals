
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
import __module from "module";
const require = __module.createRequire(import.meta.url);

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/is.js
var require_is = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/is.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.stringArray = exports.array = exports.func = exports.error = exports.number = exports.string = exports.boolean = void 0;
    function boolean(value) {
      return value === true || value === false;
    }
    exports.boolean = boolean;
    function string(value) {
      return typeof value === "string" || value instanceof String;
    }
    exports.string = string;
    function number(value) {
      return typeof value === "number" || value instanceof Number;
    }
    exports.number = number;
    function error(value) {
      return value instanceof Error;
    }
    exports.error = error;
    function func(value) {
      return typeof value === "function";
    }
    exports.func = func;
    function array(value) {
      return Array.isArray(value);
    }
    exports.array = array;
    function stringArray(value) {
      return array(value) && value.every((elem) => string(elem));
    }
    exports.stringArray = stringArray;
  }
});

// node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/messages.js
var require_messages = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/messages.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Message = exports.NotificationType9 = exports.NotificationType8 = exports.NotificationType7 = exports.NotificationType6 = exports.NotificationType5 = exports.NotificationType4 = exports.NotificationType3 = exports.NotificationType2 = exports.NotificationType1 = exports.NotificationType0 = exports.NotificationType = exports.RequestType9 = exports.RequestType8 = exports.RequestType7 = exports.RequestType6 = exports.RequestType5 = exports.RequestType4 = exports.RequestType3 = exports.RequestType2 = exports.RequestType1 = exports.RequestType = exports.RequestType0 = exports.AbstractMessageSignature = exports.ParameterStructures = exports.ResponseError = exports.ErrorCodes = void 0;
    var is = require_is();
    var ErrorCodes3;
    (function(ErrorCodes4) {
      ErrorCodes4.ParseError = -32700;
      ErrorCodes4.InvalidRequest = -32600;
      ErrorCodes4.MethodNotFound = -32601;
      ErrorCodes4.InvalidParams = -32602;
      ErrorCodes4.InternalError = -32603;
      ErrorCodes4.jsonrpcReservedErrorRangeStart = -32099;
      ErrorCodes4.serverErrorStart = -32099;
      ErrorCodes4.MessageWriteError = -32099;
      ErrorCodes4.MessageReadError = -32098;
      ErrorCodes4.PendingResponseRejected = -32097;
      ErrorCodes4.ConnectionInactive = -32096;
      ErrorCodes4.ServerNotInitialized = -32002;
      ErrorCodes4.UnknownErrorCode = -32001;
      ErrorCodes4.jsonrpcReservedErrorRangeEnd = -32e3;
      ErrorCodes4.serverErrorEnd = -32e3;
    })(ErrorCodes3 || (exports.ErrorCodes = ErrorCodes3 = {}));
    var ResponseError3 = class _ResponseError extends Error {
      constructor(code, message, data) {
        super(message);
        this.code = is.number(code) ? code : ErrorCodes3.UnknownErrorCode;
        this.data = data;
        Object.setPrototypeOf(this, _ResponseError.prototype);
      }
      toJson() {
        const result = {
          code: this.code,
          message: this.message
        };
        if (this.data !== void 0) {
          result.data = this.data;
        }
        return result;
      }
    };
    exports.ResponseError = ResponseError3;
    var ParameterStructures = class _ParameterStructures {
      constructor(kind) {
        this.kind = kind;
      }
      static is(value) {
        return value === _ParameterStructures.auto || value === _ParameterStructures.byName || value === _ParameterStructures.byPosition;
      }
      toString() {
        return this.kind;
      }
    };
    exports.ParameterStructures = ParameterStructures;
    ParameterStructures.auto = new ParameterStructures("auto");
    ParameterStructures.byPosition = new ParameterStructures("byPosition");
    ParameterStructures.byName = new ParameterStructures("byName");
    var AbstractMessageSignature = class {
      constructor(method, numberOfParams) {
        this.method = method;
        this.numberOfParams = numberOfParams;
      }
      get parameterStructures() {
        return ParameterStructures.auto;
      }
    };
    exports.AbstractMessageSignature = AbstractMessageSignature;
    var RequestType0 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 0);
      }
    };
    exports.RequestType0 = RequestType0;
    var RequestType = class extends AbstractMessageSignature {
      constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    };
    exports.RequestType = RequestType;
    var RequestType1 = class extends AbstractMessageSignature {
      constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    };
    exports.RequestType1 = RequestType1;
    var RequestType2 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 2);
      }
    };
    exports.RequestType2 = RequestType2;
    var RequestType3 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 3);
      }
    };
    exports.RequestType3 = RequestType3;
    var RequestType4 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 4);
      }
    };
    exports.RequestType4 = RequestType4;
    var RequestType5 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 5);
      }
    };
    exports.RequestType5 = RequestType5;
    var RequestType6 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 6);
      }
    };
    exports.RequestType6 = RequestType6;
    var RequestType7 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 7);
      }
    };
    exports.RequestType7 = RequestType7;
    var RequestType8 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 8);
      }
    };
    exports.RequestType8 = RequestType8;
    var RequestType9 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 9);
      }
    };
    exports.RequestType9 = RequestType9;
    var NotificationType = class extends AbstractMessageSignature {
      constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    };
    exports.NotificationType = NotificationType;
    var NotificationType0 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 0);
      }
    };
    exports.NotificationType0 = NotificationType0;
    var NotificationType1 = class extends AbstractMessageSignature {
      constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    };
    exports.NotificationType1 = NotificationType1;
    var NotificationType2 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 2);
      }
    };
    exports.NotificationType2 = NotificationType2;
    var NotificationType3 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 3);
      }
    };
    exports.NotificationType3 = NotificationType3;
    var NotificationType4 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 4);
      }
    };
    exports.NotificationType4 = NotificationType4;
    var NotificationType5 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 5);
      }
    };
    exports.NotificationType5 = NotificationType5;
    var NotificationType6 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 6);
      }
    };
    exports.NotificationType6 = NotificationType6;
    var NotificationType7 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 7);
      }
    };
    exports.NotificationType7 = NotificationType7;
    var NotificationType8 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 8);
      }
    };
    exports.NotificationType8 = NotificationType8;
    var NotificationType9 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 9);
      }
    };
    exports.NotificationType9 = NotificationType9;
    var Message;
    (function(Message2) {
      function isRequest(message) {
        const candidate = message;
        return candidate && is.string(candidate.method) && (is.string(candidate.id) || is.number(candidate.id));
      }
      Message2.isRequest = isRequest;
      function isNotification(message) {
        const candidate = message;
        return candidate && is.string(candidate.method) && message.id === void 0;
      }
      Message2.isNotification = isNotification;
      function isResponse(message) {
        const candidate = message;
        return candidate && (candidate.result !== void 0 || !!candidate.error) && (is.string(candidate.id) || is.number(candidate.id) || candidate.id === null);
      }
      Message2.isResponse = isResponse;
    })(Message || (exports.Message = Message = {}));
  }
});

// node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/linkedMap.js
var require_linkedMap = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/linkedMap.js"(exports) {
    "use strict";
    var _a;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LRUCache = exports.LinkedMap = exports.Touch = void 0;
    var Touch;
    (function(Touch2) {
      Touch2.None = 0;
      Touch2.First = 1;
      Touch2.AsOld = Touch2.First;
      Touch2.Last = 2;
      Touch2.AsNew = Touch2.Last;
    })(Touch || (exports.Touch = Touch = {}));
    var LinkedMap = class {
      constructor() {
        this[_a] = "LinkedMap";
        this._map = /* @__PURE__ */ new Map();
        this._head = void 0;
        this._tail = void 0;
        this._size = 0;
        this._state = 0;
      }
      clear() {
        this._map.clear();
        this._head = void 0;
        this._tail = void 0;
        this._size = 0;
        this._state++;
      }
      isEmpty() {
        return !this._head && !this._tail;
      }
      get size() {
        return this._size;
      }
      get first() {
        return this._head?.value;
      }
      get last() {
        return this._tail?.value;
      }
      has(key) {
        return this._map.has(key);
      }
      get(key, touch = Touch.None) {
        const item = this._map.get(key);
        if (!item) {
          return void 0;
        }
        if (touch !== Touch.None) {
          this.touch(item, touch);
        }
        return item.value;
      }
      set(key, value, touch = Touch.None) {
        let item = this._map.get(key);
        if (item) {
          item.value = value;
          if (touch !== Touch.None) {
            this.touch(item, touch);
          }
        } else {
          item = { key, value, next: void 0, previous: void 0 };
          switch (touch) {
            case Touch.None:
              this.addItemLast(item);
              break;
            case Touch.First:
              this.addItemFirst(item);
              break;
            case Touch.Last:
              this.addItemLast(item);
              break;
            default:
              this.addItemLast(item);
              break;
          }
          this._map.set(key, item);
          this._size++;
        }
        return this;
      }
      delete(key) {
        return !!this.remove(key);
      }
      remove(key) {
        const item = this._map.get(key);
        if (!item) {
          return void 0;
        }
        this._map.delete(key);
        this.removeItem(item);
        this._size--;
        return item.value;
      }
      shift() {
        if (!this._head && !this._tail) {
          return void 0;
        }
        if (!this._head || !this._tail) {
          throw new Error("Invalid list");
        }
        const item = this._head;
        this._map.delete(item.key);
        this.removeItem(item);
        this._size--;
        return item.value;
      }
      forEach(callbackfn, thisArg) {
        const state = this._state;
        let current = this._head;
        while (current) {
          if (thisArg) {
            callbackfn.bind(thisArg)(current.value, current.key, this);
          } else {
            callbackfn(current.value, current.key, this);
          }
          if (this._state !== state) {
            throw new Error(`LinkedMap got modified during iteration.`);
          }
          current = current.next;
        }
      }
      keys() {
        const state = this._state;
        let current = this._head;
        const iterator = {
          [Symbol.iterator]: () => {
            return iterator;
          },
          next: () => {
            if (this._state !== state) {
              throw new Error(`LinkedMap got modified during iteration.`);
            }
            if (current) {
              const result = { value: current.key, done: false };
              current = current.next;
              return result;
            } else {
              return { value: void 0, done: true };
            }
          }
        };
        return iterator;
      }
      values() {
        const state = this._state;
        let current = this._head;
        const iterator = {
          [Symbol.iterator]: () => {
            return iterator;
          },
          next: () => {
            if (this._state !== state) {
              throw new Error(`LinkedMap got modified during iteration.`);
            }
            if (current) {
              const result = { value: current.value, done: false };
              current = current.next;
              return result;
            } else {
              return { value: void 0, done: true };
            }
          }
        };
        return iterator;
      }
      entries() {
        const state = this._state;
        let current = this._head;
        const iterator = {
          [Symbol.iterator]: () => {
            return iterator;
          },
          next: () => {
            if (this._state !== state) {
              throw new Error(`LinkedMap got modified during iteration.`);
            }
            if (current) {
              const result = { value: [current.key, current.value], done: false };
              current = current.next;
              return result;
            } else {
              return { value: void 0, done: true };
            }
          }
        };
        return iterator;
      }
      [(_a = Symbol.toStringTag, Symbol.iterator)]() {
        return this.entries();
      }
      trimOld(newSize) {
        if (newSize >= this.size) {
          return;
        }
        if (newSize === 0) {
          this.clear();
          return;
        }
        let current = this._head;
        let currentSize = this.size;
        while (current && currentSize > newSize) {
          this._map.delete(current.key);
          current = current.next;
          currentSize--;
        }
        this._head = current;
        this._size = currentSize;
        if (current) {
          current.previous = void 0;
        }
        this._state++;
      }
      addItemFirst(item) {
        if (!this._head && !this._tail) {
          this._tail = item;
        } else if (!this._head) {
          throw new Error("Invalid list");
        } else {
          item.next = this._head;
          this._head.previous = item;
        }
        this._head = item;
        this._state++;
      }
      addItemLast(item) {
        if (!this._head && !this._tail) {
          this._head = item;
        } else if (!this._tail) {
          throw new Error("Invalid list");
        } else {
          item.previous = this._tail;
          this._tail.next = item;
        }
        this._tail = item;
        this._state++;
      }
      removeItem(item) {
        if (item === this._head && item === this._tail) {
          this._head = void 0;
          this._tail = void 0;
        } else if (item === this._head) {
          if (!item.next) {
            throw new Error("Invalid list");
          }
          item.next.previous = void 0;
          this._head = item.next;
        } else if (item === this._tail) {
          if (!item.previous) {
            throw new Error("Invalid list");
          }
          item.previous.next = void 0;
          this._tail = item.previous;
        } else {
          const next = item.next;
          const previous = item.previous;
          if (!next || !previous) {
            throw new Error("Invalid list");
          }
          next.previous = previous;
          previous.next = next;
        }
        item.next = void 0;
        item.previous = void 0;
        this._state++;
      }
      touch(item, touch) {
        if (!this._head || !this._tail) {
          throw new Error("Invalid list");
        }
        if (touch !== Touch.First && touch !== Touch.Last) {
          return;
        }
        if (touch === Touch.First) {
          if (item === this._head) {
            return;
          }
          const next = item.next;
          const previous = item.previous;
          if (item === this._tail) {
            previous.next = void 0;
            this._tail = previous;
          } else {
            next.previous = previous;
            previous.next = next;
          }
          item.previous = void 0;
          item.next = this._head;
          this._head.previous = item;
          this._head = item;
          this._state++;
        } else if (touch === Touch.Last) {
          if (item === this._tail) {
            return;
          }
          const next = item.next;
          const previous = item.previous;
          if (item === this._head) {
            next.previous = void 0;
            this._head = next;
          } else {
            next.previous = previous;
            previous.next = next;
          }
          item.next = void 0;
          item.previous = this._tail;
          this._tail.next = item;
          this._tail = item;
          this._state++;
        }
      }
      toJSON() {
        const data = [];
        this.forEach((value, key) => {
          data.push([key, value]);
        });
        return data;
      }
      fromJSON(data) {
        this.clear();
        for (const [key, value] of data) {
          this.set(key, value);
        }
      }
    };
    exports.LinkedMap = LinkedMap;
    var LRUCache = class extends LinkedMap {
      constructor(limit, ratio = 1) {
        super();
        this._limit = limit;
        this._ratio = Math.min(Math.max(0, ratio), 1);
      }
      get limit() {
        return this._limit;
      }
      set limit(limit) {
        this._limit = limit;
        this.checkTrim();
      }
      get ratio() {
        return this._ratio;
      }
      set ratio(ratio) {
        this._ratio = Math.min(Math.max(0, ratio), 1);
        this.checkTrim();
      }
      get(key, touch = Touch.AsNew) {
        return super.get(key, touch);
      }
      peek(key) {
        return super.get(key, Touch.None);
      }
      set(key, value) {
        super.set(key, value, Touch.Last);
        this.checkTrim();
        return this;
      }
      checkTrim() {
        if (this.size > this._limit) {
          this.trimOld(Math.round(this._limit * this._ratio));
        }
      }
    };
    exports.LRUCache = LRUCache;
  }
});

// node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/disposable.js
var require_disposable = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/disposable.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Disposable = void 0;
    var Disposable;
    (function(Disposable2) {
      function create(func) {
        return {
          dispose: func
        };
      }
      Disposable2.create = create;
    })(Disposable || (exports.Disposable = Disposable = {}));
  }
});

// node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/ral.js
var require_ral = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/ral.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _ral;
    function RAL() {
      if (_ral === void 0) {
        throw new Error(`No runtime abstraction layer installed`);
      }
      return _ral;
    }
    (function(RAL2) {
      function install(ral) {
        if (ral === void 0) {
          throw new Error(`No runtime abstraction layer provided`);
        }
        _ral = ral;
      }
      RAL2.install = install;
    })(RAL || (RAL = {}));
    exports.default = RAL;
  }
});

// node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/events.js
var require_events = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/events.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Emitter = exports.Event = void 0;
    var ral_1 = require_ral();
    var Event;
    (function(Event2) {
      const _disposable = { dispose() {
      } };
      Event2.None = function() {
        return _disposable;
      };
    })(Event || (exports.Event = Event = {}));
    var CallbackList = class {
      add(callback, context = null, bucket) {
        if (!this._callbacks) {
          this._callbacks = [];
          this._contexts = [];
        }
        this._callbacks.push(callback);
        this._contexts.push(context);
        if (Array.isArray(bucket)) {
          bucket.push({ dispose: () => this.remove(callback, context) });
        }
      }
      remove(callback, context = null) {
        if (!this._callbacks) {
          return;
        }
        let foundCallbackWithDifferentContext = false;
        for (let i = 0, len = this._callbacks.length; i < len; i++) {
          if (this._callbacks[i] === callback) {
            if (this._contexts[i] === context) {
              this._callbacks.splice(i, 1);
              this._contexts.splice(i, 1);
              return;
            } else {
              foundCallbackWithDifferentContext = true;
            }
          }
        }
        if (foundCallbackWithDifferentContext) {
          throw new Error("When adding a listener with a context, you should remove it with the same context");
        }
      }
      invoke(...args) {
        if (!this._callbacks) {
          return [];
        }
        const ret = [], callbacks = this._callbacks.slice(0), contexts = this._contexts.slice(0);
        for (let i = 0, len = callbacks.length; i < len; i++) {
          try {
            ret.push(callbacks[i].apply(contexts[i], args));
          } catch (e) {
            (0, ral_1.default)().console.error(e);
          }
        }
        return ret;
      }
      isEmpty() {
        return !this._callbacks || this._callbacks.length === 0;
      }
      dispose() {
        this._callbacks = void 0;
        this._contexts = void 0;
      }
    };
    var Emitter = class _Emitter {
      constructor(_options) {
        this._options = _options;
      }
      /**
       * For the public to allow to subscribe
       * to events from this Emitter
       */
      get event() {
        if (!this._event) {
          this._event = (listener, thisArgs, disposables) => {
            if (!this._callbacks) {
              this._callbacks = new CallbackList();
            }
            if (this._options && this._options.onFirstListenerAdd && this._callbacks.isEmpty()) {
              this._options.onFirstListenerAdd(this);
            }
            this._callbacks.add(listener, thisArgs);
            const result = {
              dispose: () => {
                if (!this._callbacks) {
                  return;
                }
                this._callbacks.remove(listener, thisArgs);
                result.dispose = _Emitter._noop;
                if (this._options && this._options.onLastListenerRemove && this._callbacks.isEmpty()) {
                  this._options.onLastListenerRemove(this);
                }
              }
            };
            if (Array.isArray(disposables)) {
              disposables.push(result);
            }
            return result;
          };
        }
        return this._event;
      }
      /**
       * To be kept private to fire an event to
       * subscribers
       */
      fire(event) {
        if (this._callbacks) {
          this._callbacks.invoke.call(this._callbacks, event);
        }
      }
      dispose() {
        if (this._callbacks) {
          this._callbacks.dispose();
          this._callbacks = void 0;
        }
      }
    };
    exports.Emitter = Emitter;
    Emitter._noop = function() {
    };
  }
});

// node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/cancellation.js
var require_cancellation = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/cancellation.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CancellationTokenSource = exports.CancellationToken = void 0;
    var ral_1 = require_ral();
    var Is = require_is();
    var events_1 = require_events();
    var CancellationToken;
    (function(CancellationToken2) {
      CancellationToken2.None = Object.freeze({
        isCancellationRequested: false,
        onCancellationRequested: events_1.Event.None
      });
      CancellationToken2.Cancelled = Object.freeze({
        isCancellationRequested: true,
        onCancellationRequested: events_1.Event.None
      });
      function is(value) {
        const candidate = value;
        return candidate && (candidate === CancellationToken2.None || candidate === CancellationToken2.Cancelled || Is.boolean(candidate.isCancellationRequested) && !!candidate.onCancellationRequested);
      }
      CancellationToken2.is = is;
    })(CancellationToken || (exports.CancellationToken = CancellationToken = {}));
    var shortcutEvent = Object.freeze(function(callback, context) {
      const handle = (0, ral_1.default)().timer.setTimeout(callback.bind(context), 0);
      return { dispose() {
        handle.dispose();
      } };
    });
    var MutableToken = class {
      constructor() {
        this._isCancelled = false;
      }
      cancel() {
        if (!this._isCancelled) {
          this._isCancelled = true;
          if (this._emitter) {
            this._emitter.fire(void 0);
            this.dispose();
          }
        }
      }
      get isCancellationRequested() {
        return this._isCancelled;
      }
      get onCancellationRequested() {
        if (this._isCancelled) {
          return shortcutEvent;
        }
        if (!this._emitter) {
          this._emitter = new events_1.Emitter();
        }
        return this._emitter.event;
      }
      dispose() {
        if (this._emitter) {
          this._emitter.dispose();
          this._emitter = void 0;
        }
      }
    };
    var CancellationTokenSource = class {
      get token() {
        if (!this._token) {
          this._token = new MutableToken();
        }
        return this._token;
      }
      cancel() {
        if (!this._token) {
          this._token = CancellationToken.Cancelled;
        } else {
          this._token.cancel();
        }
      }
      dispose() {
        if (!this._token) {
          this._token = CancellationToken.None;
        } else if (this._token instanceof MutableToken) {
          this._token.dispose();
        }
      }
    };
    exports.CancellationTokenSource = CancellationTokenSource;
  }
});

// node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/sharedArrayCancellation.js
var require_sharedArrayCancellation = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/sharedArrayCancellation.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SharedArrayReceiverStrategy = exports.SharedArraySenderStrategy = void 0;
    var cancellation_1 = require_cancellation();
    var CancellationState;
    (function(CancellationState2) {
      CancellationState2.Continue = 0;
      CancellationState2.Cancelled = 1;
    })(CancellationState || (CancellationState = {}));
    var SharedArraySenderStrategy = class {
      constructor() {
        this.buffers = /* @__PURE__ */ new Map();
      }
      enableCancellation(request) {
        if (request.id === null) {
          return;
        }
        const buffer = new SharedArrayBuffer(4);
        const data = new Int32Array(buffer, 0, 1);
        data[0] = CancellationState.Continue;
        this.buffers.set(request.id, buffer);
        request.$cancellationData = buffer;
      }
      async sendCancellation(_conn, id) {
        const buffer = this.buffers.get(id);
        if (buffer === void 0) {
          return;
        }
        const data = new Int32Array(buffer, 0, 1);
        Atomics.store(data, 0, CancellationState.Cancelled);
      }
      cleanup(id) {
        this.buffers.delete(id);
      }
      dispose() {
        this.buffers.clear();
      }
    };
    exports.SharedArraySenderStrategy = SharedArraySenderStrategy;
    var SharedArrayBufferCancellationToken = class {
      constructor(buffer) {
        this.data = new Int32Array(buffer, 0, 1);
      }
      get isCancellationRequested() {
        return Atomics.load(this.data, 0) === CancellationState.Cancelled;
      }
      get onCancellationRequested() {
        throw new Error(`Cancellation over SharedArrayBuffer doesn't support cancellation events`);
      }
    };
    var SharedArrayBufferCancellationTokenSource = class {
      constructor(buffer) {
        this.token = new SharedArrayBufferCancellationToken(buffer);
      }
      cancel() {
      }
      dispose() {
      }
    };
    var SharedArrayReceiverStrategy = class {
      constructor() {
        this.kind = "request";
      }
      createCancellationTokenSource(request) {
        const buffer = request.$cancellationData;
        if (buffer === void 0) {
          return new cancellation_1.CancellationTokenSource();
        }
        return new SharedArrayBufferCancellationTokenSource(buffer);
      }
    };
    exports.SharedArrayReceiverStrategy = SharedArrayReceiverStrategy;
  }
});

// node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/semaphore.js
var require_semaphore = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/semaphore.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Semaphore = void 0;
    var ral_1 = require_ral();
    var Semaphore = class {
      constructor(capacity = 1) {
        if (capacity <= 0) {
          throw new Error("Capacity must be greater than 0");
        }
        this._capacity = capacity;
        this._active = 0;
        this._waiting = [];
      }
      lock(thunk) {
        return new Promise((resolve, reject) => {
          this._waiting.push({ thunk, resolve, reject });
          this.runNext();
        });
      }
      get active() {
        return this._active;
      }
      runNext() {
        if (this._waiting.length === 0 || this._active === this._capacity) {
          return;
        }
        (0, ral_1.default)().timer.setImmediate(() => this.doRunNext());
      }
      doRunNext() {
        if (this._waiting.length === 0 || this._active === this._capacity) {
          return;
        }
        const next = this._waiting.shift();
        this._active++;
        if (this._active > this._capacity) {
          throw new Error(`To many thunks active`);
        }
        try {
          const result = next.thunk();
          if (result instanceof Promise) {
            result.then((value) => {
              this._active--;
              next.resolve(value);
              this.runNext();
            }, (err) => {
              this._active--;
              next.reject(err);
              this.runNext();
            });
          } else {
            this._active--;
            next.resolve(result);
            this.runNext();
          }
        } catch (err) {
          this._active--;
          next.reject(err);
          this.runNext();
        }
      }
    };
    exports.Semaphore = Semaphore;
  }
});

// node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/messageReader.js
var require_messageReader = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/messageReader.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReadableStreamMessageReader = exports.AbstractMessageReader = exports.MessageReader = void 0;
    var ral_1 = require_ral();
    var Is = require_is();
    var events_1 = require_events();
    var semaphore_1 = require_semaphore();
    var MessageReader;
    (function(MessageReader2) {
      function is(value) {
        let candidate = value;
        return candidate && Is.func(candidate.listen) && Is.func(candidate.dispose) && Is.func(candidate.onError) && Is.func(candidate.onClose) && Is.func(candidate.onPartialMessage);
      }
      MessageReader2.is = is;
    })(MessageReader || (exports.MessageReader = MessageReader = {}));
    var AbstractMessageReader = class {
      constructor() {
        this.errorEmitter = new events_1.Emitter();
        this.closeEmitter = new events_1.Emitter();
        this.partialMessageEmitter = new events_1.Emitter();
      }
      dispose() {
        this.errorEmitter.dispose();
        this.closeEmitter.dispose();
      }
      get onError() {
        return this.errorEmitter.event;
      }
      fireError(error) {
        this.errorEmitter.fire(this.asError(error));
      }
      get onClose() {
        return this.closeEmitter.event;
      }
      fireClose() {
        this.closeEmitter.fire(void 0);
      }
      get onPartialMessage() {
        return this.partialMessageEmitter.event;
      }
      firePartialMessage(info) {
        this.partialMessageEmitter.fire(info);
      }
      asError(error) {
        if (error instanceof Error) {
          return error;
        } else {
          return new Error(`Reader received error. Reason: ${Is.string(error.message) ? error.message : "unknown"}`);
        }
      }
    };
    exports.AbstractMessageReader = AbstractMessageReader;
    var ResolvedMessageReaderOptions;
    (function(ResolvedMessageReaderOptions2) {
      function fromOptions(options) {
        let charset;
        let result;
        let contentDecoder;
        const contentDecoders = /* @__PURE__ */ new Map();
        let contentTypeDecoder;
        const contentTypeDecoders = /* @__PURE__ */ new Map();
        if (options === void 0 || typeof options === "string") {
          charset = options ?? "utf-8";
        } else {
          charset = options.charset ?? "utf-8";
          if (options.contentDecoder !== void 0) {
            contentDecoder = options.contentDecoder;
            contentDecoders.set(contentDecoder.name, contentDecoder);
          }
          if (options.contentDecoders !== void 0) {
            for (const decoder of options.contentDecoders) {
              contentDecoders.set(decoder.name, decoder);
            }
          }
          if (options.contentTypeDecoder !== void 0) {
            contentTypeDecoder = options.contentTypeDecoder;
            contentTypeDecoders.set(contentTypeDecoder.name, contentTypeDecoder);
          }
          if (options.contentTypeDecoders !== void 0) {
            for (const decoder of options.contentTypeDecoders) {
              contentTypeDecoders.set(decoder.name, decoder);
            }
          }
        }
        if (contentTypeDecoder === void 0) {
          contentTypeDecoder = (0, ral_1.default)().applicationJson.decoder;
          contentTypeDecoders.set(contentTypeDecoder.name, contentTypeDecoder);
        }
        return { charset, contentDecoder, contentDecoders, contentTypeDecoder, contentTypeDecoders };
      }
      ResolvedMessageReaderOptions2.fromOptions = fromOptions;
    })(ResolvedMessageReaderOptions || (ResolvedMessageReaderOptions = {}));
    var ReadableStreamMessageReader = class extends AbstractMessageReader {
      constructor(readable, options) {
        super();
        this.readable = readable;
        this.options = ResolvedMessageReaderOptions.fromOptions(options);
        this.buffer = (0, ral_1.default)().messageBuffer.create(this.options.charset);
        this._partialMessageTimeout = 1e4;
        this.nextMessageLength = -1;
        this.messageToken = 0;
        this.readSemaphore = new semaphore_1.Semaphore(1);
      }
      set partialMessageTimeout(timeout) {
        this._partialMessageTimeout = timeout;
      }
      get partialMessageTimeout() {
        return this._partialMessageTimeout;
      }
      listen(callback) {
        this.nextMessageLength = -1;
        this.messageToken = 0;
        this.partialMessageTimer = void 0;
        this.callback = callback;
        const result = this.readable.onData((data) => {
          this.onData(data);
        });
        this.readable.onError((error) => this.fireError(error));
        this.readable.onClose(() => this.fireClose());
        return result;
      }
      onData(data) {
        try {
          this.buffer.append(data);
          while (true) {
            if (this.nextMessageLength === -1) {
              const headers = this.buffer.tryReadHeaders(true);
              if (!headers) {
                return;
              }
              const contentLength = headers.get("content-length");
              if (!contentLength) {
                this.fireError(new Error(`Header must provide a Content-Length property.
${JSON.stringify(Object.fromEntries(headers))}`));
                return;
              }
              const length = parseInt(contentLength);
              if (isNaN(length)) {
                this.fireError(new Error(`Content-Length value must be a number. Got ${contentLength}`));
                return;
              }
              this.nextMessageLength = length;
            }
            const body = this.buffer.tryReadBody(this.nextMessageLength);
            if (body === void 0) {
              this.setPartialMessageTimer();
              return;
            }
            this.clearPartialMessageTimer();
            this.nextMessageLength = -1;
            this.readSemaphore.lock(async () => {
              const bytes = this.options.contentDecoder !== void 0 ? await this.options.contentDecoder.decode(body) : body;
              const message = await this.options.contentTypeDecoder.decode(bytes, this.options);
              this.callback(message);
            }).catch((error) => {
              this.fireError(error);
            });
          }
        } catch (error) {
          this.fireError(error);
        }
      }
      clearPartialMessageTimer() {
        if (this.partialMessageTimer) {
          this.partialMessageTimer.dispose();
          this.partialMessageTimer = void 0;
        }
      }
      setPartialMessageTimer() {
        this.clearPartialMessageTimer();
        if (this._partialMessageTimeout <= 0) {
          return;
        }
        this.partialMessageTimer = (0, ral_1.default)().timer.setTimeout((token, timeout) => {
          this.partialMessageTimer = void 0;
          if (token === this.messageToken) {
            this.firePartialMessage({ messageToken: token, waitingTime: timeout });
            this.setPartialMessageTimer();
          }
        }, this._partialMessageTimeout, this.messageToken, this._partialMessageTimeout);
      }
    };
    exports.ReadableStreamMessageReader = ReadableStreamMessageReader;
  }
});

// node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/messageWriter.js
var require_messageWriter = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/messageWriter.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WriteableStreamMessageWriter = exports.AbstractMessageWriter = exports.MessageWriter = void 0;
    var ral_1 = require_ral();
    var Is = require_is();
    var semaphore_1 = require_semaphore();
    var events_1 = require_events();
    var ContentLength = "Content-Length: ";
    var CRLF = "\r\n";
    var MessageWriter;
    (function(MessageWriter2) {
      function is(value) {
        let candidate = value;
        return candidate && Is.func(candidate.dispose) && Is.func(candidate.onClose) && Is.func(candidate.onError) && Is.func(candidate.write);
      }
      MessageWriter2.is = is;
    })(MessageWriter || (exports.MessageWriter = MessageWriter = {}));
    var AbstractMessageWriter = class {
      constructor() {
        this.errorEmitter = new events_1.Emitter();
        this.closeEmitter = new events_1.Emitter();
      }
      dispose() {
        this.errorEmitter.dispose();
        this.closeEmitter.dispose();
      }
      get onError() {
        return this.errorEmitter.event;
      }
      fireError(error, message, count) {
        this.errorEmitter.fire([this.asError(error), message, count]);
      }
      get onClose() {
        return this.closeEmitter.event;
      }
      fireClose() {
        this.closeEmitter.fire(void 0);
      }
      asError(error) {
        if (error instanceof Error) {
          return error;
        } else {
          return new Error(`Writer received error. Reason: ${Is.string(error.message) ? error.message : "unknown"}`);
        }
      }
    };
    exports.AbstractMessageWriter = AbstractMessageWriter;
    var ResolvedMessageWriterOptions;
    (function(ResolvedMessageWriterOptions2) {
      function fromOptions(options) {
        if (options === void 0 || typeof options === "string") {
          return { charset: options ?? "utf-8", contentTypeEncoder: (0, ral_1.default)().applicationJson.encoder };
        } else {
          return { charset: options.charset ?? "utf-8", contentEncoder: options.contentEncoder, contentTypeEncoder: options.contentTypeEncoder ?? (0, ral_1.default)().applicationJson.encoder };
        }
      }
      ResolvedMessageWriterOptions2.fromOptions = fromOptions;
    })(ResolvedMessageWriterOptions || (ResolvedMessageWriterOptions = {}));
    var WriteableStreamMessageWriter = class extends AbstractMessageWriter {
      constructor(writable, options) {
        super();
        this.writable = writable;
        this.options = ResolvedMessageWriterOptions.fromOptions(options);
        this.errorCount = 0;
        this.writeSemaphore = new semaphore_1.Semaphore(1);
        this.writable.onError((error) => this.fireError(error));
        this.writable.onClose(() => this.fireClose());
      }
      async write(msg) {
        return this.writeSemaphore.lock(async () => {
          const payload = this.options.contentTypeEncoder.encode(msg, this.options).then((buffer) => {
            if (this.options.contentEncoder !== void 0) {
              return this.options.contentEncoder.encode(buffer);
            } else {
              return buffer;
            }
          });
          return payload.then((buffer) => {
            const headers = [];
            headers.push(ContentLength, buffer.byteLength.toString(), CRLF);
            headers.push(CRLF);
            return this.doWrite(msg, headers, buffer);
          }, (error) => {
            this.fireError(error);
            throw error;
          });
        });
      }
      async doWrite(msg, headers, data) {
        try {
          await this.writable.write(headers.join(""), "ascii");
          return this.writable.write(data);
        } catch (error) {
          this.handleError(error, msg);
          return Promise.reject(error);
        }
      }
      handleError(error, msg) {
        this.errorCount++;
        this.fireError(error, msg, this.errorCount);
      }
      end() {
        this.writable.end();
      }
    };
    exports.WriteableStreamMessageWriter = WriteableStreamMessageWriter;
  }
});

// node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/messageBuffer.js
var require_messageBuffer = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/messageBuffer.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractMessageBuffer = void 0;
    var CR = 13;
    var LF = 10;
    var CRLF = "\r\n";
    var AbstractMessageBuffer = class {
      constructor(encoding = "utf-8") {
        this._encoding = encoding;
        this._chunks = [];
        this._totalLength = 0;
      }
      get encoding() {
        return this._encoding;
      }
      append(chunk) {
        const toAppend = typeof chunk === "string" ? this.fromString(chunk, this._encoding) : chunk;
        this._chunks.push(toAppend);
        this._totalLength += toAppend.byteLength;
      }
      tryReadHeaders(lowerCaseKeys = false) {
        if (this._chunks.length === 0) {
          return void 0;
        }
        let state = 0;
        let chunkIndex = 0;
        let offset = 0;
        let chunkBytesRead = 0;
        row: while (chunkIndex < this._chunks.length) {
          const chunk = this._chunks[chunkIndex];
          offset = 0;
          column: while (offset < chunk.length) {
            const value = chunk[offset];
            switch (value) {
              case CR:
                switch (state) {
                  case 0:
                    state = 1;
                    break;
                  case 2:
                    state = 3;
                    break;
                  default:
                    state = 0;
                }
                break;
              case LF:
                switch (state) {
                  case 1:
                    state = 2;
                    break;
                  case 3:
                    state = 4;
                    offset++;
                    break row;
                  default:
                    state = 0;
                }
                break;
              default:
                state = 0;
            }
            offset++;
          }
          chunkBytesRead += chunk.byteLength;
          chunkIndex++;
        }
        if (state !== 4) {
          return void 0;
        }
        const buffer = this._read(chunkBytesRead + offset);
        const result = /* @__PURE__ */ new Map();
        const headers = this.toString(buffer, "ascii").split(CRLF);
        if (headers.length < 2) {
          return result;
        }
        for (let i = 0; i < headers.length - 2; i++) {
          const header = headers[i];
          const index = header.indexOf(":");
          if (index === -1) {
            throw new Error(`Message header must separate key and value using ':'
${header}`);
          }
          const key = header.substr(0, index);
          const value = header.substr(index + 1).trim();
          result.set(lowerCaseKeys ? key.toLowerCase() : key, value);
        }
        return result;
      }
      tryReadBody(length) {
        if (this._totalLength < length) {
          return void 0;
        }
        return this._read(length);
      }
      get numberOfBytes() {
        return this._totalLength;
      }
      _read(byteCount) {
        if (byteCount === 0) {
          return this.emptyBuffer();
        }
        if (byteCount > this._totalLength) {
          throw new Error(`Cannot read so many bytes!`);
        }
        if (this._chunks[0].byteLength === byteCount) {
          const chunk = this._chunks[0];
          this._chunks.shift();
          this._totalLength -= byteCount;
          return this.asNative(chunk);
        }
        if (this._chunks[0].byteLength > byteCount) {
          const chunk = this._chunks[0];
          const result2 = this.asNative(chunk, byteCount);
          this._chunks[0] = chunk.slice(byteCount);
          this._totalLength -= byteCount;
          return result2;
        }
        const result = this.allocNative(byteCount);
        let resultOffset = 0;
        let chunkIndex = 0;
        while (byteCount > 0) {
          const chunk = this._chunks[chunkIndex];
          if (chunk.byteLength > byteCount) {
            const chunkPart = chunk.slice(0, byteCount);
            result.set(chunkPart, resultOffset);
            resultOffset += byteCount;
            this._chunks[chunkIndex] = chunk.slice(byteCount);
            this._totalLength -= byteCount;
            byteCount -= byteCount;
          } else {
            result.set(chunk, resultOffset);
            resultOffset += chunk.byteLength;
            this._chunks.shift();
            this._totalLength -= chunk.byteLength;
            byteCount -= chunk.byteLength;
          }
        }
        return result;
      }
    };
    exports.AbstractMessageBuffer = AbstractMessageBuffer;
  }
});

// node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/connection.js
var require_connection = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/connection.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createMessageConnection = exports.ConnectionOptions = exports.MessageStrategy = exports.CancellationStrategy = exports.CancellationSenderStrategy = exports.CancellationReceiverStrategy = exports.RequestCancellationReceiverStrategy = exports.IdCancellationReceiverStrategy = exports.ConnectionStrategy = exports.ConnectionError = exports.ConnectionErrors = exports.LogTraceNotification = exports.SetTraceNotification = exports.TraceFormat = exports.TraceValues = exports.Trace = exports.NullLogger = exports.ProgressType = exports.ProgressToken = void 0;
    var ral_1 = require_ral();
    var Is = require_is();
    var messages_1 = require_messages();
    var linkedMap_1 = require_linkedMap();
    var events_1 = require_events();
    var cancellation_1 = require_cancellation();
    var CancelNotification;
    (function(CancelNotification2) {
      CancelNotification2.type = new messages_1.NotificationType("$/cancelRequest");
    })(CancelNotification || (CancelNotification = {}));
    var ProgressToken;
    (function(ProgressToken2) {
      function is(value) {
        return typeof value === "string" || typeof value === "number";
      }
      ProgressToken2.is = is;
    })(ProgressToken || (exports.ProgressToken = ProgressToken = {}));
    var ProgressNotification;
    (function(ProgressNotification2) {
      ProgressNotification2.type = new messages_1.NotificationType("$/progress");
    })(ProgressNotification || (ProgressNotification = {}));
    var ProgressType = class {
      constructor() {
      }
    };
    exports.ProgressType = ProgressType;
    var StarRequestHandler;
    (function(StarRequestHandler2) {
      function is(value) {
        return Is.func(value);
      }
      StarRequestHandler2.is = is;
    })(StarRequestHandler || (StarRequestHandler = {}));
    exports.NullLogger = Object.freeze({
      error: () => {
      },
      warn: () => {
      },
      info: () => {
      },
      log: () => {
      }
    });
    var Trace;
    (function(Trace2) {
      Trace2[Trace2["Off"] = 0] = "Off";
      Trace2[Trace2["Messages"] = 1] = "Messages";
      Trace2[Trace2["Compact"] = 2] = "Compact";
      Trace2[Trace2["Verbose"] = 3] = "Verbose";
    })(Trace || (exports.Trace = Trace = {}));
    var TraceValues;
    (function(TraceValues2) {
      TraceValues2.Off = "off";
      TraceValues2.Messages = "messages";
      TraceValues2.Compact = "compact";
      TraceValues2.Verbose = "verbose";
    })(TraceValues || (exports.TraceValues = TraceValues = {}));
    (function(Trace2) {
      function fromString(value) {
        if (!Is.string(value)) {
          return Trace2.Off;
        }
        value = value.toLowerCase();
        switch (value) {
          case "off":
            return Trace2.Off;
          case "messages":
            return Trace2.Messages;
          case "compact":
            return Trace2.Compact;
          case "verbose":
            return Trace2.Verbose;
          default:
            return Trace2.Off;
        }
      }
      Trace2.fromString = fromString;
      function toString(value) {
        switch (value) {
          case Trace2.Off:
            return "off";
          case Trace2.Messages:
            return "messages";
          case Trace2.Compact:
            return "compact";
          case Trace2.Verbose:
            return "verbose";
          default:
            return "off";
        }
      }
      Trace2.toString = toString;
    })(Trace || (exports.Trace = Trace = {}));
    var TraceFormat;
    (function(TraceFormat2) {
      TraceFormat2["Text"] = "text";
      TraceFormat2["JSON"] = "json";
    })(TraceFormat || (exports.TraceFormat = TraceFormat = {}));
    (function(TraceFormat2) {
      function fromString(value) {
        if (!Is.string(value)) {
          return TraceFormat2.Text;
        }
        value = value.toLowerCase();
        if (value === "json") {
          return TraceFormat2.JSON;
        } else {
          return TraceFormat2.Text;
        }
      }
      TraceFormat2.fromString = fromString;
    })(TraceFormat || (exports.TraceFormat = TraceFormat = {}));
    var SetTraceNotification;
    (function(SetTraceNotification2) {
      SetTraceNotification2.type = new messages_1.NotificationType("$/setTrace");
    })(SetTraceNotification || (exports.SetTraceNotification = SetTraceNotification = {}));
    var LogTraceNotification;
    (function(LogTraceNotification2) {
      LogTraceNotification2.type = new messages_1.NotificationType("$/logTrace");
    })(LogTraceNotification || (exports.LogTraceNotification = LogTraceNotification = {}));
    var ConnectionErrors;
    (function(ConnectionErrors2) {
      ConnectionErrors2[ConnectionErrors2["Closed"] = 1] = "Closed";
      ConnectionErrors2[ConnectionErrors2["Disposed"] = 2] = "Disposed";
      ConnectionErrors2[ConnectionErrors2["AlreadyListening"] = 3] = "AlreadyListening";
    })(ConnectionErrors || (exports.ConnectionErrors = ConnectionErrors = {}));
    var ConnectionError2 = class _ConnectionError extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
        Object.setPrototypeOf(this, _ConnectionError.prototype);
      }
    };
    exports.ConnectionError = ConnectionError2;
    var ConnectionStrategy;
    (function(ConnectionStrategy2) {
      function is(value) {
        const candidate = value;
        return candidate && Is.func(candidate.cancelUndispatched);
      }
      ConnectionStrategy2.is = is;
    })(ConnectionStrategy || (exports.ConnectionStrategy = ConnectionStrategy = {}));
    var IdCancellationReceiverStrategy;
    (function(IdCancellationReceiverStrategy2) {
      function is(value) {
        const candidate = value;
        return candidate && (candidate.kind === void 0 || candidate.kind === "id") && Is.func(candidate.createCancellationTokenSource) && (candidate.dispose === void 0 || Is.func(candidate.dispose));
      }
      IdCancellationReceiverStrategy2.is = is;
    })(IdCancellationReceiverStrategy || (exports.IdCancellationReceiverStrategy = IdCancellationReceiverStrategy = {}));
    var RequestCancellationReceiverStrategy;
    (function(RequestCancellationReceiverStrategy2) {
      function is(value) {
        const candidate = value;
        return candidate && candidate.kind === "request" && Is.func(candidate.createCancellationTokenSource) && (candidate.dispose === void 0 || Is.func(candidate.dispose));
      }
      RequestCancellationReceiverStrategy2.is = is;
    })(RequestCancellationReceiverStrategy || (exports.RequestCancellationReceiverStrategy = RequestCancellationReceiverStrategy = {}));
    var CancellationReceiverStrategy;
    (function(CancellationReceiverStrategy2) {
      CancellationReceiverStrategy2.Message = Object.freeze({
        createCancellationTokenSource(_) {
          return new cancellation_1.CancellationTokenSource();
        }
      });
      function is(value) {
        return IdCancellationReceiverStrategy.is(value) || RequestCancellationReceiverStrategy.is(value);
      }
      CancellationReceiverStrategy2.is = is;
    })(CancellationReceiverStrategy || (exports.CancellationReceiverStrategy = CancellationReceiverStrategy = {}));
    var CancellationSenderStrategy;
    (function(CancellationSenderStrategy2) {
      CancellationSenderStrategy2.Message = Object.freeze({
        sendCancellation(conn, id) {
          return conn.sendNotification(CancelNotification.type, { id });
        },
        cleanup(_) {
        }
      });
      function is(value) {
        const candidate = value;
        return candidate && Is.func(candidate.sendCancellation) && Is.func(candidate.cleanup);
      }
      CancellationSenderStrategy2.is = is;
    })(CancellationSenderStrategy || (exports.CancellationSenderStrategy = CancellationSenderStrategy = {}));
    var CancellationStrategy;
    (function(CancellationStrategy2) {
      CancellationStrategy2.Message = Object.freeze({
        receiver: CancellationReceiverStrategy.Message,
        sender: CancellationSenderStrategy.Message
      });
      function is(value) {
        const candidate = value;
        return candidate && CancellationReceiverStrategy.is(candidate.receiver) && CancellationSenderStrategy.is(candidate.sender);
      }
      CancellationStrategy2.is = is;
    })(CancellationStrategy || (exports.CancellationStrategy = CancellationStrategy = {}));
    var MessageStrategy;
    (function(MessageStrategy2) {
      function is(value) {
        const candidate = value;
        return candidate && Is.func(candidate.handleMessage);
      }
      MessageStrategy2.is = is;
    })(MessageStrategy || (exports.MessageStrategy = MessageStrategy = {}));
    var ConnectionOptions;
    (function(ConnectionOptions2) {
      function is(value) {
        const candidate = value;
        return candidate && (CancellationStrategy.is(candidate.cancellationStrategy) || ConnectionStrategy.is(candidate.connectionStrategy) || MessageStrategy.is(candidate.messageStrategy));
      }
      ConnectionOptions2.is = is;
    })(ConnectionOptions || (exports.ConnectionOptions = ConnectionOptions = {}));
    var ConnectionState;
    (function(ConnectionState2) {
      ConnectionState2[ConnectionState2["New"] = 1] = "New";
      ConnectionState2[ConnectionState2["Listening"] = 2] = "Listening";
      ConnectionState2[ConnectionState2["Closed"] = 3] = "Closed";
      ConnectionState2[ConnectionState2["Disposed"] = 4] = "Disposed";
    })(ConnectionState || (ConnectionState = {}));
    function createMessageConnection2(messageReader, messageWriter, _logger, options) {
      const logger = _logger !== void 0 ? _logger : exports.NullLogger;
      let sequenceNumber = 0;
      let notificationSequenceNumber = 0;
      let unknownResponseSequenceNumber = 0;
      const version = "2.0";
      let starRequestHandler = void 0;
      const requestHandlers = /* @__PURE__ */ new Map();
      let starNotificationHandler = void 0;
      const notificationHandlers = /* @__PURE__ */ new Map();
      const progressHandlers = /* @__PURE__ */ new Map();
      let timer;
      let messageQueue = new linkedMap_1.LinkedMap();
      let responsePromises = /* @__PURE__ */ new Map();
      let knownCanceledRequests = /* @__PURE__ */ new Set();
      let requestTokens = /* @__PURE__ */ new Map();
      let trace = Trace.Off;
      let traceFormat = TraceFormat.Text;
      let tracer;
      let state = ConnectionState.New;
      const errorEmitter = new events_1.Emitter();
      const closeEmitter = new events_1.Emitter();
      const unhandledNotificationEmitter = new events_1.Emitter();
      const unhandledProgressEmitter = new events_1.Emitter();
      const disposeEmitter = new events_1.Emitter();
      const cancellationStrategy = options && options.cancellationStrategy ? options.cancellationStrategy : CancellationStrategy.Message;
      function createRequestQueueKey(id) {
        if (id === null) {
          throw new Error(`Can't send requests with id null since the response can't be correlated.`);
        }
        return "req-" + id.toString();
      }
      function createResponseQueueKey(id) {
        if (id === null) {
          return "res-unknown-" + (++unknownResponseSequenceNumber).toString();
        } else {
          return "res-" + id.toString();
        }
      }
      function createNotificationQueueKey() {
        return "not-" + (++notificationSequenceNumber).toString();
      }
      function addMessageToQueue(queue, message) {
        if (messages_1.Message.isRequest(message)) {
          queue.set(createRequestQueueKey(message.id), message);
        } else if (messages_1.Message.isResponse(message)) {
          queue.set(createResponseQueueKey(message.id), message);
        } else {
          queue.set(createNotificationQueueKey(), message);
        }
      }
      function cancelUndispatched(_message) {
        return void 0;
      }
      function isListening() {
        return state === ConnectionState.Listening;
      }
      function isClosed() {
        return state === ConnectionState.Closed;
      }
      function isDisposed() {
        return state === ConnectionState.Disposed;
      }
      function closeHandler() {
        if (state === ConnectionState.New || state === ConnectionState.Listening) {
          state = ConnectionState.Closed;
          closeEmitter.fire(void 0);
        }
      }
      function readErrorHandler(error) {
        errorEmitter.fire([error, void 0, void 0]);
      }
      function writeErrorHandler(data) {
        errorEmitter.fire(data);
      }
      messageReader.onClose(closeHandler);
      messageReader.onError(readErrorHandler);
      messageWriter.onClose(closeHandler);
      messageWriter.onError(writeErrorHandler);
      function triggerMessageQueue() {
        if (timer || messageQueue.size === 0) {
          return;
        }
        timer = (0, ral_1.default)().timer.setImmediate(() => {
          timer = void 0;
          processMessageQueue();
        });
      }
      function handleMessage(message) {
        if (messages_1.Message.isRequest(message)) {
          handleRequest(message);
        } else if (messages_1.Message.isNotification(message)) {
          handleNotification(message);
        } else if (messages_1.Message.isResponse(message)) {
          handleResponse(message);
        } else {
          handleInvalidMessage(message);
        }
      }
      function processMessageQueue() {
        if (messageQueue.size === 0) {
          return;
        }
        const message = messageQueue.shift();
        try {
          const messageStrategy = options?.messageStrategy;
          if (MessageStrategy.is(messageStrategy)) {
            messageStrategy.handleMessage(message, handleMessage);
          } else {
            handleMessage(message);
          }
        } finally {
          triggerMessageQueue();
        }
      }
      const callback = (message) => {
        try {
          if (messages_1.Message.isNotification(message) && message.method === CancelNotification.type.method) {
            const cancelId = message.params.id;
            const key = createRequestQueueKey(cancelId);
            const toCancel = messageQueue.get(key);
            if (messages_1.Message.isRequest(toCancel)) {
              const strategy = options?.connectionStrategy;
              const response = strategy && strategy.cancelUndispatched ? strategy.cancelUndispatched(toCancel, cancelUndispatched) : cancelUndispatched(toCancel);
              if (response && (response.error !== void 0 || response.result !== void 0)) {
                messageQueue.delete(key);
                requestTokens.delete(cancelId);
                response.id = toCancel.id;
                traceSendingResponse(response, message.method, Date.now());
                messageWriter.write(response).catch(() => logger.error(`Sending response for canceled message failed.`));
                return;
              }
            }
            const cancellationToken = requestTokens.get(cancelId);
            if (cancellationToken !== void 0) {
              cancellationToken.cancel();
              traceReceivedNotification(message);
              return;
            } else {
              knownCanceledRequests.add(cancelId);
            }
          }
          addMessageToQueue(messageQueue, message);
        } finally {
          triggerMessageQueue();
        }
      };
      function handleRequest(requestMessage) {
        if (isDisposed()) {
          return;
        }
        function reply(resultOrError, method, startTime2) {
          const message = {
            jsonrpc: version,
            id: requestMessage.id
          };
          if (resultOrError instanceof messages_1.ResponseError) {
            message.error = resultOrError.toJson();
          } else {
            message.result = resultOrError === void 0 ? null : resultOrError;
          }
          traceSendingResponse(message, method, startTime2);
          messageWriter.write(message).catch(() => logger.error(`Sending response failed.`));
        }
        function replyError(error, method, startTime2) {
          const message = {
            jsonrpc: version,
            id: requestMessage.id,
            error: error.toJson()
          };
          traceSendingResponse(message, method, startTime2);
          messageWriter.write(message).catch(() => logger.error(`Sending response failed.`));
        }
        function replySuccess(result, method, startTime2) {
          if (result === void 0) {
            result = null;
          }
          const message = {
            jsonrpc: version,
            id: requestMessage.id,
            result
          };
          traceSendingResponse(message, method, startTime2);
          messageWriter.write(message).catch(() => logger.error(`Sending response failed.`));
        }
        traceReceivedRequest(requestMessage);
        const element = requestHandlers.get(requestMessage.method);
        let type;
        let requestHandler;
        if (element) {
          type = element.type;
          requestHandler = element.handler;
        }
        const startTime = Date.now();
        if (requestHandler || starRequestHandler) {
          const tokenKey = requestMessage.id ?? String(Date.now());
          const cancellationSource = IdCancellationReceiverStrategy.is(cancellationStrategy.receiver) ? cancellationStrategy.receiver.createCancellationTokenSource(tokenKey) : cancellationStrategy.receiver.createCancellationTokenSource(requestMessage);
          if (requestMessage.id !== null && knownCanceledRequests.has(requestMessage.id)) {
            cancellationSource.cancel();
          }
          if (requestMessage.id !== null) {
            requestTokens.set(tokenKey, cancellationSource);
          }
          try {
            let handlerResult;
            if (requestHandler) {
              if (requestMessage.params === void 0) {
                if (type !== void 0 && type.numberOfParams !== 0) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines ${type.numberOfParams} params but received none.`), requestMessage.method, startTime);
                  return;
                }
                handlerResult = requestHandler(cancellationSource.token);
              } else if (Array.isArray(requestMessage.params)) {
                if (type !== void 0 && type.parameterStructures === messages_1.ParameterStructures.byName) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines parameters by name but received parameters by position`), requestMessage.method, startTime);
                  return;
                }
                handlerResult = requestHandler(...requestMessage.params, cancellationSource.token);
              } else {
                if (type !== void 0 && type.parameterStructures === messages_1.ParameterStructures.byPosition) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines parameters by position but received parameters by name`), requestMessage.method, startTime);
                  return;
                }
                handlerResult = requestHandler(requestMessage.params, cancellationSource.token);
              }
            } else if (starRequestHandler) {
              handlerResult = starRequestHandler(requestMessage.method, requestMessage.params, cancellationSource.token);
            }
            const promise = handlerResult;
            if (!handlerResult) {
              requestTokens.delete(tokenKey);
              replySuccess(handlerResult, requestMessage.method, startTime);
            } else if (promise.then) {
              promise.then((resultOrError) => {
                requestTokens.delete(tokenKey);
                reply(resultOrError, requestMessage.method, startTime);
              }, (error) => {
                requestTokens.delete(tokenKey);
                if (error instanceof messages_1.ResponseError) {
                  replyError(error, requestMessage.method, startTime);
                } else if (error && Is.string(error.message)) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed with message: ${error.message}`), requestMessage.method, startTime);
                } else {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed unexpectedly without providing any details.`), requestMessage.method, startTime);
                }
              });
            } else {
              requestTokens.delete(tokenKey);
              reply(handlerResult, requestMessage.method, startTime);
            }
          } catch (error) {
            requestTokens.delete(tokenKey);
            if (error instanceof messages_1.ResponseError) {
              reply(error, requestMessage.method, startTime);
            } else if (error && Is.string(error.message)) {
              replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed with message: ${error.message}`), requestMessage.method, startTime);
            } else {
              replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed unexpectedly without providing any details.`), requestMessage.method, startTime);
            }
          }
        } else {
          replyError(new messages_1.ResponseError(messages_1.ErrorCodes.MethodNotFound, `Unhandled method ${requestMessage.method}`), requestMessage.method, startTime);
        }
      }
      function handleResponse(responseMessage) {
        if (isDisposed()) {
          return;
        }
        if (responseMessage.id === null) {
          if (responseMessage.error) {
            logger.error(`Received response message without id: Error is: 
${JSON.stringify(responseMessage.error, void 0, 4)}`);
          } else {
            logger.error(`Received response message without id. No further error information provided.`);
          }
        } else {
          const key = responseMessage.id;
          const responsePromise = responsePromises.get(key);
          traceReceivedResponse(responseMessage, responsePromise);
          if (responsePromise !== void 0) {
            responsePromises.delete(key);
            try {
              if (responseMessage.error) {
                const error = responseMessage.error;
                responsePromise.reject(new messages_1.ResponseError(error.code, error.message, error.data));
              } else if (responseMessage.result !== void 0) {
                responsePromise.resolve(responseMessage.result);
              } else {
                throw new Error("Should never happen.");
              }
            } catch (error) {
              if (error.message) {
                logger.error(`Response handler '${responsePromise.method}' failed with message: ${error.message}`);
              } else {
                logger.error(`Response handler '${responsePromise.method}' failed unexpectedly.`);
              }
            }
          }
        }
      }
      function handleNotification(message) {
        if (isDisposed()) {
          return;
        }
        let type = void 0;
        let notificationHandler;
        if (message.method === CancelNotification.type.method) {
          const cancelId = message.params.id;
          knownCanceledRequests.delete(cancelId);
          traceReceivedNotification(message);
          return;
        } else {
          const element = notificationHandlers.get(message.method);
          if (element) {
            notificationHandler = element.handler;
            type = element.type;
          }
        }
        if (notificationHandler || starNotificationHandler) {
          try {
            traceReceivedNotification(message);
            if (notificationHandler) {
              if (message.params === void 0) {
                if (type !== void 0) {
                  if (type.numberOfParams !== 0 && type.parameterStructures !== messages_1.ParameterStructures.byName) {
                    logger.error(`Notification ${message.method} defines ${type.numberOfParams} params but received none.`);
                  }
                }
                notificationHandler();
              } else if (Array.isArray(message.params)) {
                const params = message.params;
                if (message.method === ProgressNotification.type.method && params.length === 2 && ProgressToken.is(params[0])) {
                  notificationHandler({ token: params[0], value: params[1] });
                } else {
                  if (type !== void 0) {
                    if (type.parameterStructures === messages_1.ParameterStructures.byName) {
                      logger.error(`Notification ${message.method} defines parameters by name but received parameters by position`);
                    }
                    if (type.numberOfParams !== message.params.length) {
                      logger.error(`Notification ${message.method} defines ${type.numberOfParams} params but received ${params.length} arguments`);
                    }
                  }
                  notificationHandler(...params);
                }
              } else {
                if (type !== void 0 && type.parameterStructures === messages_1.ParameterStructures.byPosition) {
                  logger.error(`Notification ${message.method} defines parameters by position but received parameters by name`);
                }
                notificationHandler(message.params);
              }
            } else if (starNotificationHandler) {
              starNotificationHandler(message.method, message.params);
            }
          } catch (error) {
            if (error.message) {
              logger.error(`Notification handler '${message.method}' failed with message: ${error.message}`);
            } else {
              logger.error(`Notification handler '${message.method}' failed unexpectedly.`);
            }
          }
        } else {
          unhandledNotificationEmitter.fire(message);
        }
      }
      function handleInvalidMessage(message) {
        if (!message) {
          logger.error("Received empty message.");
          return;
        }
        logger.error(`Received message which is neither a response nor a notification message:
${JSON.stringify(message, null, 4)}`);
        const responseMessage = message;
        if (Is.string(responseMessage.id) || Is.number(responseMessage.id)) {
          const key = responseMessage.id;
          const responseHandler = responsePromises.get(key);
          if (responseHandler) {
            responseHandler.reject(new Error("The received response has neither a result nor an error property."));
          }
        }
      }
      function stringifyTrace(params) {
        if (params === void 0 || params === null) {
          return void 0;
        }
        switch (trace) {
          case Trace.Verbose:
            return JSON.stringify(params, null, 4);
          case Trace.Compact:
            return JSON.stringify(params);
          default:
            return void 0;
        }
      }
      function traceSendingRequest(message) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if ((trace === Trace.Verbose || trace === Trace.Compact) && message.params) {
            data = `Params: ${stringifyTrace(message.params)}

`;
          }
          tracer.log(`Sending request '${message.method} - (${message.id})'.`, data);
        } else {
          logLSPMessage("send-request", message);
        }
      }
      function traceSendingNotification(message) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.params) {
              data = `Params: ${stringifyTrace(message.params)}

`;
            } else {
              data = "No parameters provided.\n\n";
            }
          }
          tracer.log(`Sending notification '${message.method}'.`, data);
        } else {
          logLSPMessage("send-notification", message);
        }
      }
      function traceSendingResponse(message, method, startTime) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.error && message.error.data) {
              data = `Error data: ${stringifyTrace(message.error.data)}

`;
            } else {
              if (message.result) {
                data = `Result: ${stringifyTrace(message.result)}

`;
              } else if (message.error === void 0) {
                data = "No result returned.\n\n";
              }
            }
          }
          tracer.log(`Sending response '${method} - (${message.id})'. Processing request took ${Date.now() - startTime}ms`, data);
        } else {
          logLSPMessage("send-response", message);
        }
      }
      function traceReceivedRequest(message) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if ((trace === Trace.Verbose || trace === Trace.Compact) && message.params) {
            data = `Params: ${stringifyTrace(message.params)}

`;
          }
          tracer.log(`Received request '${message.method} - (${message.id})'.`, data);
        } else {
          logLSPMessage("receive-request", message);
        }
      }
      function traceReceivedNotification(message) {
        if (trace === Trace.Off || !tracer || message.method === LogTraceNotification.type.method) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.params) {
              data = `Params: ${stringifyTrace(message.params)}

`;
            } else {
              data = "No parameters provided.\n\n";
            }
          }
          tracer.log(`Received notification '${message.method}'.`, data);
        } else {
          logLSPMessage("receive-notification", message);
        }
      }
      function traceReceivedResponse(message, responsePromise) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.error && message.error.data) {
              data = `Error data: ${stringifyTrace(message.error.data)}

`;
            } else {
              if (message.result) {
                data = `Result: ${stringifyTrace(message.result)}

`;
              } else if (message.error === void 0) {
                data = "No result returned.\n\n";
              }
            }
          }
          if (responsePromise) {
            const error = message.error ? ` Request failed: ${message.error.message} (${message.error.code}).` : "";
            tracer.log(`Received response '${responsePromise.method} - (${message.id})' in ${Date.now() - responsePromise.timerStart}ms.${error}`, data);
          } else {
            tracer.log(`Received response ${message.id} without active response promise.`, data);
          }
        } else {
          logLSPMessage("receive-response", message);
        }
      }
      function logLSPMessage(type, message) {
        if (!tracer || trace === Trace.Off) {
          return;
        }
        const lspMessage = {
          isLSPMessage: true,
          type,
          message,
          timestamp: Date.now()
        };
        tracer.log(lspMessage);
      }
      function throwIfClosedOrDisposed() {
        if (isClosed()) {
          throw new ConnectionError2(ConnectionErrors.Closed, "Connection is closed.");
        }
        if (isDisposed()) {
          throw new ConnectionError2(ConnectionErrors.Disposed, "Connection is disposed.");
        }
      }
      function throwIfListening() {
        if (isListening()) {
          throw new ConnectionError2(ConnectionErrors.AlreadyListening, "Connection is already listening");
        }
      }
      function throwIfNotListening() {
        if (!isListening()) {
          throw new Error("Call listen() first.");
        }
      }
      function undefinedToNull(param) {
        if (param === void 0) {
          return null;
        } else {
          return param;
        }
      }
      function nullToUndefined(param) {
        if (param === null) {
          return void 0;
        } else {
          return param;
        }
      }
      function isNamedParam(param) {
        return param !== void 0 && param !== null && !Array.isArray(param) && typeof param === "object";
      }
      function computeSingleParam(parameterStructures, param) {
        switch (parameterStructures) {
          case messages_1.ParameterStructures.auto:
            if (isNamedParam(param)) {
              return nullToUndefined(param);
            } else {
              return [undefinedToNull(param)];
            }
          case messages_1.ParameterStructures.byName:
            if (!isNamedParam(param)) {
              throw new Error(`Received parameters by name but param is not an object literal.`);
            }
            return nullToUndefined(param);
          case messages_1.ParameterStructures.byPosition:
            return [undefinedToNull(param)];
          default:
            throw new Error(`Unknown parameter structure ${parameterStructures.toString()}`);
        }
      }
      function computeMessageParams(type, params) {
        let result;
        const numberOfParams = type.numberOfParams;
        switch (numberOfParams) {
          case 0:
            result = void 0;
            break;
          case 1:
            result = computeSingleParam(type.parameterStructures, params[0]);
            break;
          default:
            result = [];
            for (let i = 0; i < params.length && i < numberOfParams; i++) {
              result.push(undefinedToNull(params[i]));
            }
            if (params.length < numberOfParams) {
              for (let i = params.length; i < numberOfParams; i++) {
                result.push(null);
              }
            }
            break;
        }
        return result;
      }
      const connection = {
        sendNotification: (type, ...args) => {
          throwIfClosedOrDisposed();
          let method;
          let messageParams;
          if (Is.string(type)) {
            method = type;
            const first = args[0];
            let paramStart = 0;
            let parameterStructures = messages_1.ParameterStructures.auto;
            if (messages_1.ParameterStructures.is(first)) {
              paramStart = 1;
              parameterStructures = first;
            }
            let paramEnd = args.length;
            const numberOfParams = paramEnd - paramStart;
            switch (numberOfParams) {
              case 0:
                messageParams = void 0;
                break;
              case 1:
                messageParams = computeSingleParam(parameterStructures, args[paramStart]);
                break;
              default:
                if (parameterStructures === messages_1.ParameterStructures.byName) {
                  throw new Error(`Received ${numberOfParams} parameters for 'by Name' notification parameter structure.`);
                }
                messageParams = args.slice(paramStart, paramEnd).map((value) => undefinedToNull(value));
                break;
            }
          } else {
            const params = args;
            method = type.method;
            messageParams = computeMessageParams(type, params);
          }
          const notificationMessage = {
            jsonrpc: version,
            method,
            params: messageParams
          };
          traceSendingNotification(notificationMessage);
          return messageWriter.write(notificationMessage).catch((error) => {
            logger.error(`Sending notification failed.`);
            throw error;
          });
        },
        onNotification: (type, handler) => {
          throwIfClosedOrDisposed();
          let method;
          if (Is.func(type)) {
            starNotificationHandler = type;
          } else if (handler) {
            if (Is.string(type)) {
              method = type;
              notificationHandlers.set(type, { type: void 0, handler });
            } else {
              method = type.method;
              notificationHandlers.set(type.method, { type, handler });
            }
          }
          return {
            dispose: () => {
              if (method !== void 0) {
                notificationHandlers.delete(method);
              } else {
                starNotificationHandler = void 0;
              }
            }
          };
        },
        onProgress: (_type, token, handler) => {
          if (progressHandlers.has(token)) {
            throw new Error(`Progress handler for token ${token} already registered`);
          }
          progressHandlers.set(token, handler);
          return {
            dispose: () => {
              progressHandlers.delete(token);
            }
          };
        },
        sendProgress: (_type, token, value) => {
          return connection.sendNotification(ProgressNotification.type, { token, value });
        },
        onUnhandledProgress: unhandledProgressEmitter.event,
        sendRequest: (type, ...args) => {
          throwIfClosedOrDisposed();
          throwIfNotListening();
          let method;
          let messageParams;
          let token = void 0;
          if (Is.string(type)) {
            method = type;
            const first = args[0];
            const last = args[args.length - 1];
            let paramStart = 0;
            let parameterStructures = messages_1.ParameterStructures.auto;
            if (messages_1.ParameterStructures.is(first)) {
              paramStart = 1;
              parameterStructures = first;
            }
            let paramEnd = args.length;
            if (cancellation_1.CancellationToken.is(last)) {
              paramEnd = paramEnd - 1;
              token = last;
            }
            const numberOfParams = paramEnd - paramStart;
            switch (numberOfParams) {
              case 0:
                messageParams = void 0;
                break;
              case 1:
                messageParams = computeSingleParam(parameterStructures, args[paramStart]);
                break;
              default:
                if (parameterStructures === messages_1.ParameterStructures.byName) {
                  throw new Error(`Received ${numberOfParams} parameters for 'by Name' request parameter structure.`);
                }
                messageParams = args.slice(paramStart, paramEnd).map((value) => undefinedToNull(value));
                break;
            }
          } else {
            const params = args;
            method = type.method;
            messageParams = computeMessageParams(type, params);
            const numberOfParams = type.numberOfParams;
            token = cancellation_1.CancellationToken.is(params[numberOfParams]) ? params[numberOfParams] : void 0;
          }
          const id = sequenceNumber++;
          let disposable;
          if (token) {
            disposable = token.onCancellationRequested(() => {
              const p = cancellationStrategy.sender.sendCancellation(connection, id);
              if (p === void 0) {
                logger.log(`Received no promise from cancellation strategy when cancelling id ${id}`);
                return Promise.resolve();
              } else {
                return p.catch(() => {
                  logger.log(`Sending cancellation messages for id ${id} failed`);
                });
              }
            });
          }
          const requestMessage = {
            jsonrpc: version,
            id,
            method,
            params: messageParams
          };
          traceSendingRequest(requestMessage);
          if (typeof cancellationStrategy.sender.enableCancellation === "function") {
            cancellationStrategy.sender.enableCancellation(requestMessage);
          }
          return new Promise(async (resolve, reject) => {
            const resolveWithCleanup = (r) => {
              resolve(r);
              cancellationStrategy.sender.cleanup(id);
              disposable?.dispose();
            };
            const rejectWithCleanup = (r) => {
              reject(r);
              cancellationStrategy.sender.cleanup(id);
              disposable?.dispose();
            };
            const responsePromise = { method, timerStart: Date.now(), resolve: resolveWithCleanup, reject: rejectWithCleanup };
            try {
              responsePromises.set(id, responsePromise);
              await messageWriter.write(requestMessage);
            } catch (error) {
              responsePromises.delete(id);
              responsePromise.reject(new messages_1.ResponseError(messages_1.ErrorCodes.MessageWriteError, error.message ? error.message : "Unknown reason"));
              logger.error(`Sending request failed.`);
              throw error;
            }
          });
        },
        onRequest: (type, handler) => {
          throwIfClosedOrDisposed();
          let method = null;
          if (StarRequestHandler.is(type)) {
            method = void 0;
            starRequestHandler = type;
          } else if (Is.string(type)) {
            method = null;
            if (handler !== void 0) {
              method = type;
              requestHandlers.set(type, { handler, type: void 0 });
            }
          } else {
            if (handler !== void 0) {
              method = type.method;
              requestHandlers.set(type.method, { type, handler });
            }
          }
          return {
            dispose: () => {
              if (method === null) {
                return;
              }
              if (method !== void 0) {
                requestHandlers.delete(method);
              } else {
                starRequestHandler = void 0;
              }
            }
          };
        },
        hasPendingResponse: () => {
          return responsePromises.size > 0;
        },
        trace: async (_value, _tracer, sendNotificationOrTraceOptions) => {
          let _sendNotification = false;
          let _traceFormat = TraceFormat.Text;
          if (sendNotificationOrTraceOptions !== void 0) {
            if (Is.boolean(sendNotificationOrTraceOptions)) {
              _sendNotification = sendNotificationOrTraceOptions;
            } else {
              _sendNotification = sendNotificationOrTraceOptions.sendNotification || false;
              _traceFormat = sendNotificationOrTraceOptions.traceFormat || TraceFormat.Text;
            }
          }
          trace = _value;
          traceFormat = _traceFormat;
          if (trace === Trace.Off) {
            tracer = void 0;
          } else {
            tracer = _tracer;
          }
          if (_sendNotification && !isClosed() && !isDisposed()) {
            await connection.sendNotification(SetTraceNotification.type, { value: Trace.toString(_value) });
          }
        },
        onError: errorEmitter.event,
        onClose: closeEmitter.event,
        onUnhandledNotification: unhandledNotificationEmitter.event,
        onDispose: disposeEmitter.event,
        end: () => {
          messageWriter.end();
        },
        dispose: () => {
          if (isDisposed()) {
            return;
          }
          state = ConnectionState.Disposed;
          disposeEmitter.fire(void 0);
          const error = new messages_1.ResponseError(messages_1.ErrorCodes.PendingResponseRejected, "Pending response rejected since connection got disposed");
          for (const promise of responsePromises.values()) {
            promise.reject(error);
          }
          responsePromises = /* @__PURE__ */ new Map();
          requestTokens = /* @__PURE__ */ new Map();
          knownCanceledRequests = /* @__PURE__ */ new Set();
          messageQueue = new linkedMap_1.LinkedMap();
          if (Is.func(messageWriter.dispose)) {
            messageWriter.dispose();
          }
          if (Is.func(messageReader.dispose)) {
            messageReader.dispose();
          }
        },
        listen: () => {
          throwIfClosedOrDisposed();
          throwIfListening();
          state = ConnectionState.Listening;
          messageReader.listen(callback);
        },
        inspect: () => {
          (0, ral_1.default)().console.log("inspect");
        }
      };
      connection.onNotification(LogTraceNotification.type, (params) => {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        const verbose = trace === Trace.Verbose || trace === Trace.Compact;
        tracer.log(params.message, verbose ? params.verbose : void 0);
      });
      connection.onNotification(ProgressNotification.type, (params) => {
        const handler = progressHandlers.get(params.token);
        if (handler) {
          handler(params.value);
        } else {
          unhandledProgressEmitter.fire(params);
        }
      });
      return connection;
    }
    exports.createMessageConnection = createMessageConnection2;
  }
});

// node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/api.js
var require_api = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/common/api.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProgressType = exports.ProgressToken = exports.createMessageConnection = exports.NullLogger = exports.ConnectionOptions = exports.ConnectionStrategy = exports.AbstractMessageBuffer = exports.WriteableStreamMessageWriter = exports.AbstractMessageWriter = exports.MessageWriter = exports.ReadableStreamMessageReader = exports.AbstractMessageReader = exports.MessageReader = exports.SharedArrayReceiverStrategy = exports.SharedArraySenderStrategy = exports.CancellationToken = exports.CancellationTokenSource = exports.Emitter = exports.Event = exports.Disposable = exports.LRUCache = exports.Touch = exports.LinkedMap = exports.ParameterStructures = exports.NotificationType9 = exports.NotificationType8 = exports.NotificationType7 = exports.NotificationType6 = exports.NotificationType5 = exports.NotificationType4 = exports.NotificationType3 = exports.NotificationType2 = exports.NotificationType1 = exports.NotificationType0 = exports.NotificationType = exports.ErrorCodes = exports.ResponseError = exports.RequestType9 = exports.RequestType8 = exports.RequestType7 = exports.RequestType6 = exports.RequestType5 = exports.RequestType4 = exports.RequestType3 = exports.RequestType2 = exports.RequestType1 = exports.RequestType0 = exports.RequestType = exports.Message = exports.RAL = void 0;
    exports.MessageStrategy = exports.CancellationStrategy = exports.CancellationSenderStrategy = exports.CancellationReceiverStrategy = exports.ConnectionError = exports.ConnectionErrors = exports.LogTraceNotification = exports.SetTraceNotification = exports.TraceFormat = exports.TraceValues = exports.Trace = void 0;
    var messages_1 = require_messages();
    Object.defineProperty(exports, "Message", { enumerable: true, get: function() {
      return messages_1.Message;
    } });
    Object.defineProperty(exports, "RequestType", { enumerable: true, get: function() {
      return messages_1.RequestType;
    } });
    Object.defineProperty(exports, "RequestType0", { enumerable: true, get: function() {
      return messages_1.RequestType0;
    } });
    Object.defineProperty(exports, "RequestType1", { enumerable: true, get: function() {
      return messages_1.RequestType1;
    } });
    Object.defineProperty(exports, "RequestType2", { enumerable: true, get: function() {
      return messages_1.RequestType2;
    } });
    Object.defineProperty(exports, "RequestType3", { enumerable: true, get: function() {
      return messages_1.RequestType3;
    } });
    Object.defineProperty(exports, "RequestType4", { enumerable: true, get: function() {
      return messages_1.RequestType4;
    } });
    Object.defineProperty(exports, "RequestType5", { enumerable: true, get: function() {
      return messages_1.RequestType5;
    } });
    Object.defineProperty(exports, "RequestType6", { enumerable: true, get: function() {
      return messages_1.RequestType6;
    } });
    Object.defineProperty(exports, "RequestType7", { enumerable: true, get: function() {
      return messages_1.RequestType7;
    } });
    Object.defineProperty(exports, "RequestType8", { enumerable: true, get: function() {
      return messages_1.RequestType8;
    } });
    Object.defineProperty(exports, "RequestType9", { enumerable: true, get: function() {
      return messages_1.RequestType9;
    } });
    Object.defineProperty(exports, "ResponseError", { enumerable: true, get: function() {
      return messages_1.ResponseError;
    } });
    Object.defineProperty(exports, "ErrorCodes", { enumerable: true, get: function() {
      return messages_1.ErrorCodes;
    } });
    Object.defineProperty(exports, "NotificationType", { enumerable: true, get: function() {
      return messages_1.NotificationType;
    } });
    Object.defineProperty(exports, "NotificationType0", { enumerable: true, get: function() {
      return messages_1.NotificationType0;
    } });
    Object.defineProperty(exports, "NotificationType1", { enumerable: true, get: function() {
      return messages_1.NotificationType1;
    } });
    Object.defineProperty(exports, "NotificationType2", { enumerable: true, get: function() {
      return messages_1.NotificationType2;
    } });
    Object.defineProperty(exports, "NotificationType3", { enumerable: true, get: function() {
      return messages_1.NotificationType3;
    } });
    Object.defineProperty(exports, "NotificationType4", { enumerable: true, get: function() {
      return messages_1.NotificationType4;
    } });
    Object.defineProperty(exports, "NotificationType5", { enumerable: true, get: function() {
      return messages_1.NotificationType5;
    } });
    Object.defineProperty(exports, "NotificationType6", { enumerable: true, get: function() {
      return messages_1.NotificationType6;
    } });
    Object.defineProperty(exports, "NotificationType7", { enumerable: true, get: function() {
      return messages_1.NotificationType7;
    } });
    Object.defineProperty(exports, "NotificationType8", { enumerable: true, get: function() {
      return messages_1.NotificationType8;
    } });
    Object.defineProperty(exports, "NotificationType9", { enumerable: true, get: function() {
      return messages_1.NotificationType9;
    } });
    Object.defineProperty(exports, "ParameterStructures", { enumerable: true, get: function() {
      return messages_1.ParameterStructures;
    } });
    var linkedMap_1 = require_linkedMap();
    Object.defineProperty(exports, "LinkedMap", { enumerable: true, get: function() {
      return linkedMap_1.LinkedMap;
    } });
    Object.defineProperty(exports, "LRUCache", { enumerable: true, get: function() {
      return linkedMap_1.LRUCache;
    } });
    Object.defineProperty(exports, "Touch", { enumerable: true, get: function() {
      return linkedMap_1.Touch;
    } });
    var disposable_1 = require_disposable();
    Object.defineProperty(exports, "Disposable", { enumerable: true, get: function() {
      return disposable_1.Disposable;
    } });
    var events_1 = require_events();
    Object.defineProperty(exports, "Event", { enumerable: true, get: function() {
      return events_1.Event;
    } });
    Object.defineProperty(exports, "Emitter", { enumerable: true, get: function() {
      return events_1.Emitter;
    } });
    var cancellation_1 = require_cancellation();
    Object.defineProperty(exports, "CancellationTokenSource", { enumerable: true, get: function() {
      return cancellation_1.CancellationTokenSource;
    } });
    Object.defineProperty(exports, "CancellationToken", { enumerable: true, get: function() {
      return cancellation_1.CancellationToken;
    } });
    var sharedArrayCancellation_1 = require_sharedArrayCancellation();
    Object.defineProperty(exports, "SharedArraySenderStrategy", { enumerable: true, get: function() {
      return sharedArrayCancellation_1.SharedArraySenderStrategy;
    } });
    Object.defineProperty(exports, "SharedArrayReceiverStrategy", { enumerable: true, get: function() {
      return sharedArrayCancellation_1.SharedArrayReceiverStrategy;
    } });
    var messageReader_1 = require_messageReader();
    Object.defineProperty(exports, "MessageReader", { enumerable: true, get: function() {
      return messageReader_1.MessageReader;
    } });
    Object.defineProperty(exports, "AbstractMessageReader", { enumerable: true, get: function() {
      return messageReader_1.AbstractMessageReader;
    } });
    Object.defineProperty(exports, "ReadableStreamMessageReader", { enumerable: true, get: function() {
      return messageReader_1.ReadableStreamMessageReader;
    } });
    var messageWriter_1 = require_messageWriter();
    Object.defineProperty(exports, "MessageWriter", { enumerable: true, get: function() {
      return messageWriter_1.MessageWriter;
    } });
    Object.defineProperty(exports, "AbstractMessageWriter", { enumerable: true, get: function() {
      return messageWriter_1.AbstractMessageWriter;
    } });
    Object.defineProperty(exports, "WriteableStreamMessageWriter", { enumerable: true, get: function() {
      return messageWriter_1.WriteableStreamMessageWriter;
    } });
    var messageBuffer_1 = require_messageBuffer();
    Object.defineProperty(exports, "AbstractMessageBuffer", { enumerable: true, get: function() {
      return messageBuffer_1.AbstractMessageBuffer;
    } });
    var connection_1 = require_connection();
    Object.defineProperty(exports, "ConnectionStrategy", { enumerable: true, get: function() {
      return connection_1.ConnectionStrategy;
    } });
    Object.defineProperty(exports, "ConnectionOptions", { enumerable: true, get: function() {
      return connection_1.ConnectionOptions;
    } });
    Object.defineProperty(exports, "NullLogger", { enumerable: true, get: function() {
      return connection_1.NullLogger;
    } });
    Object.defineProperty(exports, "createMessageConnection", { enumerable: true, get: function() {
      return connection_1.createMessageConnection;
    } });
    Object.defineProperty(exports, "ProgressToken", { enumerable: true, get: function() {
      return connection_1.ProgressToken;
    } });
    Object.defineProperty(exports, "ProgressType", { enumerable: true, get: function() {
      return connection_1.ProgressType;
    } });
    Object.defineProperty(exports, "Trace", { enumerable: true, get: function() {
      return connection_1.Trace;
    } });
    Object.defineProperty(exports, "TraceValues", { enumerable: true, get: function() {
      return connection_1.TraceValues;
    } });
    Object.defineProperty(exports, "TraceFormat", { enumerable: true, get: function() {
      return connection_1.TraceFormat;
    } });
    Object.defineProperty(exports, "SetTraceNotification", { enumerable: true, get: function() {
      return connection_1.SetTraceNotification;
    } });
    Object.defineProperty(exports, "LogTraceNotification", { enumerable: true, get: function() {
      return connection_1.LogTraceNotification;
    } });
    Object.defineProperty(exports, "ConnectionErrors", { enumerable: true, get: function() {
      return connection_1.ConnectionErrors;
    } });
    Object.defineProperty(exports, "ConnectionError", { enumerable: true, get: function() {
      return connection_1.ConnectionError;
    } });
    Object.defineProperty(exports, "CancellationReceiverStrategy", { enumerable: true, get: function() {
      return connection_1.CancellationReceiverStrategy;
    } });
    Object.defineProperty(exports, "CancellationSenderStrategy", { enumerable: true, get: function() {
      return connection_1.CancellationSenderStrategy;
    } });
    Object.defineProperty(exports, "CancellationStrategy", { enumerable: true, get: function() {
      return connection_1.CancellationStrategy;
    } });
    Object.defineProperty(exports, "MessageStrategy", { enumerable: true, get: function() {
      return connection_1.MessageStrategy;
    } });
    var ral_1 = require_ral();
    exports.RAL = ral_1.default;
  }
});

// node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/node/ril.js
var require_ril = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/node/ril.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = __require("util");
    var api_1 = require_api();
    var MessageBuffer = class _MessageBuffer extends api_1.AbstractMessageBuffer {
      constructor(encoding = "utf-8") {
        super(encoding);
      }
      emptyBuffer() {
        return _MessageBuffer.emptyBuffer;
      }
      fromString(value, encoding) {
        return Buffer.from(value, encoding);
      }
      toString(value, encoding) {
        if (value instanceof Buffer) {
          return value.toString(encoding);
        } else {
          return new util_1.TextDecoder(encoding).decode(value);
        }
      }
      asNative(buffer, length) {
        if (length === void 0) {
          return buffer instanceof Buffer ? buffer : Buffer.from(buffer);
        } else {
          return buffer instanceof Buffer ? buffer.slice(0, length) : Buffer.from(buffer, 0, length);
        }
      }
      allocNative(length) {
        return Buffer.allocUnsafe(length);
      }
    };
    MessageBuffer.emptyBuffer = Buffer.allocUnsafe(0);
    var ReadableStreamWrapper = class {
      constructor(stream) {
        this.stream = stream;
      }
      onClose(listener) {
        this.stream.on("close", listener);
        return api_1.Disposable.create(() => this.stream.off("close", listener));
      }
      onError(listener) {
        this.stream.on("error", listener);
        return api_1.Disposable.create(() => this.stream.off("error", listener));
      }
      onEnd(listener) {
        this.stream.on("end", listener);
        return api_1.Disposable.create(() => this.stream.off("end", listener));
      }
      onData(listener) {
        this.stream.on("data", listener);
        return api_1.Disposable.create(() => this.stream.off("data", listener));
      }
    };
    var WritableStreamWrapper = class {
      constructor(stream) {
        this.stream = stream;
      }
      onClose(listener) {
        this.stream.on("close", listener);
        return api_1.Disposable.create(() => this.stream.off("close", listener));
      }
      onError(listener) {
        this.stream.on("error", listener);
        return api_1.Disposable.create(() => this.stream.off("error", listener));
      }
      onEnd(listener) {
        this.stream.on("end", listener);
        return api_1.Disposable.create(() => this.stream.off("end", listener));
      }
      write(data, encoding) {
        return new Promise((resolve, reject) => {
          const callback = (error) => {
            if (error === void 0 || error === null) {
              resolve();
            } else {
              reject(error);
            }
          };
          if (typeof data === "string") {
            this.stream.write(data, encoding, callback);
          } else {
            this.stream.write(data, callback);
          }
        });
      }
      end() {
        this.stream.end();
      }
    };
    var _ril = Object.freeze({
      messageBuffer: Object.freeze({
        create: (encoding) => new MessageBuffer(encoding)
      }),
      applicationJson: Object.freeze({
        encoder: Object.freeze({
          name: "application/json",
          encode: (msg, options) => {
            try {
              return Promise.resolve(Buffer.from(JSON.stringify(msg, void 0, 0), options.charset));
            } catch (err) {
              return Promise.reject(err);
            }
          }
        }),
        decoder: Object.freeze({
          name: "application/json",
          decode: (buffer, options) => {
            try {
              if (buffer instanceof Buffer) {
                return Promise.resolve(JSON.parse(buffer.toString(options.charset)));
              } else {
                return Promise.resolve(JSON.parse(new util_1.TextDecoder(options.charset).decode(buffer)));
              }
            } catch (err) {
              return Promise.reject(err);
            }
          }
        })
      }),
      stream: Object.freeze({
        asReadableStream: (stream) => new ReadableStreamWrapper(stream),
        asWritableStream: (stream) => new WritableStreamWrapper(stream)
      }),
      console,
      timer: Object.freeze({
        setTimeout(callback, ms, ...args) {
          const handle = setTimeout(callback, ms, ...args);
          return { dispose: () => clearTimeout(handle) };
        },
        setImmediate(callback, ...args) {
          const handle = setImmediate(callback, ...args);
          return { dispose: () => clearImmediate(handle) };
        },
        setInterval(callback, ms, ...args) {
          const handle = setInterval(callback, ms, ...args);
          return { dispose: () => clearInterval(handle) };
        }
      })
    });
    function RIL() {
      return _ril;
    }
    (function(RIL2) {
      function install() {
        api_1.RAL.install(_ril);
      }
      RIL2.install = install;
    })(RIL || (RIL = {}));
    exports.default = RIL;
  }
});

// node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/node/main.js
var require_main = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/lib/node/main.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createMessageConnection = exports.createServerSocketTransport = exports.createClientSocketTransport = exports.createServerPipeTransport = exports.createClientPipeTransport = exports.generateRandomPipeName = exports.StreamMessageWriter = exports.StreamMessageReader = exports.SocketMessageWriter = exports.SocketMessageReader = exports.PortMessageWriter = exports.PortMessageReader = exports.IPCMessageWriter = exports.IPCMessageReader = void 0;
    var ril_1 = require_ril();
    ril_1.default.install();
    var path = __require("path");
    var os = __require("os");
    var crypto_1 = __require("crypto");
    var net_1 = __require("net");
    var api_1 = require_api();
    __exportStar(require_api(), exports);
    var IPCMessageReader = class extends api_1.AbstractMessageReader {
      constructor(process2) {
        super();
        this.process = process2;
        let eventEmitter = this.process;
        eventEmitter.on("error", (error) => this.fireError(error));
        eventEmitter.on("close", () => this.fireClose());
      }
      listen(callback) {
        this.process.on("message", callback);
        return api_1.Disposable.create(() => this.process.off("message", callback));
      }
    };
    exports.IPCMessageReader = IPCMessageReader;
    var IPCMessageWriter = class extends api_1.AbstractMessageWriter {
      constructor(process2) {
        super();
        this.process = process2;
        this.errorCount = 0;
        const eventEmitter = this.process;
        eventEmitter.on("error", (error) => this.fireError(error));
        eventEmitter.on("close", () => this.fireClose);
      }
      write(msg) {
        try {
          if (typeof this.process.send === "function") {
            this.process.send(msg, void 0, void 0, (error) => {
              if (error) {
                this.errorCount++;
                this.handleError(error, msg);
              } else {
                this.errorCount = 0;
              }
            });
          }
          return Promise.resolve();
        } catch (error) {
          this.handleError(error, msg);
          return Promise.reject(error);
        }
      }
      handleError(error, msg) {
        this.errorCount++;
        this.fireError(error, msg, this.errorCount);
      }
      end() {
      }
    };
    exports.IPCMessageWriter = IPCMessageWriter;
    var PortMessageReader = class extends api_1.AbstractMessageReader {
      constructor(port) {
        super();
        this.onData = new api_1.Emitter();
        port.on("close", () => this.fireClose);
        port.on("error", (error) => this.fireError(error));
        port.on("message", (message) => {
          this.onData.fire(message);
        });
      }
      listen(callback) {
        return this.onData.event(callback);
      }
    };
    exports.PortMessageReader = PortMessageReader;
    var PortMessageWriter = class extends api_1.AbstractMessageWriter {
      constructor(port) {
        super();
        this.port = port;
        this.errorCount = 0;
        port.on("close", () => this.fireClose());
        port.on("error", (error) => this.fireError(error));
      }
      write(msg) {
        try {
          this.port.postMessage(msg);
          return Promise.resolve();
        } catch (error) {
          this.handleError(error, msg);
          return Promise.reject(error);
        }
      }
      handleError(error, msg) {
        this.errorCount++;
        this.fireError(error, msg, this.errorCount);
      }
      end() {
      }
    };
    exports.PortMessageWriter = PortMessageWriter;
    var SocketMessageReader = class extends api_1.ReadableStreamMessageReader {
      constructor(socket, encoding = "utf-8") {
        super((0, ril_1.default)().stream.asReadableStream(socket), encoding);
      }
    };
    exports.SocketMessageReader = SocketMessageReader;
    var SocketMessageWriter = class extends api_1.WriteableStreamMessageWriter {
      constructor(socket, options) {
        super((0, ril_1.default)().stream.asWritableStream(socket), options);
        this.socket = socket;
      }
      dispose() {
        super.dispose();
        this.socket.destroy();
      }
    };
    exports.SocketMessageWriter = SocketMessageWriter;
    var StreamMessageReader2 = class extends api_1.ReadableStreamMessageReader {
      constructor(readable, encoding) {
        super((0, ril_1.default)().stream.asReadableStream(readable), encoding);
      }
    };
    exports.StreamMessageReader = StreamMessageReader2;
    var StreamMessageWriter2 = class extends api_1.WriteableStreamMessageWriter {
      constructor(writable, options) {
        super((0, ril_1.default)().stream.asWritableStream(writable), options);
      }
    };
    exports.StreamMessageWriter = StreamMessageWriter2;
    var XDG_RUNTIME_DIR = process.env["XDG_RUNTIME_DIR"];
    var safeIpcPathLengths = /* @__PURE__ */ new Map([
      ["linux", 107],
      ["darwin", 103]
    ]);
    function generateRandomPipeName() {
      const randomSuffix = (0, crypto_1.randomBytes)(21).toString("hex");
      if (process.platform === "win32") {
        return `\\\\.\\pipe\\vscode-jsonrpc-${randomSuffix}-sock`;
      }
      let result;
      if (XDG_RUNTIME_DIR) {
        result = path.join(XDG_RUNTIME_DIR, `vscode-ipc-${randomSuffix}.sock`);
      } else {
        result = path.join(os.tmpdir(), `vscode-${randomSuffix}.sock`);
      }
      const limit = safeIpcPathLengths.get(process.platform);
      if (limit !== void 0 && result.length > limit) {
        (0, ril_1.default)().console.warn(`WARNING: IPC handle "${result}" is longer than ${limit} characters.`);
      }
      return result;
    }
    exports.generateRandomPipeName = generateRandomPipeName;
    function createClientPipeTransport(pipeName, encoding = "utf-8") {
      let connectResolve;
      const connected = new Promise((resolve, _reject) => {
        connectResolve = resolve;
      });
      return new Promise((resolve, reject) => {
        let server = (0, net_1.createServer)((socket) => {
          server.close();
          connectResolve([
            new SocketMessageReader(socket, encoding),
            new SocketMessageWriter(socket, encoding)
          ]);
        });
        server.on("error", reject);
        server.listen(pipeName, () => {
          server.removeListener("error", reject);
          resolve({
            onConnected: () => {
              return connected;
            }
          });
        });
      });
    }
    exports.createClientPipeTransport = createClientPipeTransport;
    function createServerPipeTransport(pipeName, encoding = "utf-8") {
      const socket = (0, net_1.createConnection)(pipeName);
      return [
        new SocketMessageReader(socket, encoding),
        new SocketMessageWriter(socket, encoding)
      ];
    }
    exports.createServerPipeTransport = createServerPipeTransport;
    function createClientSocketTransport(port, encoding = "utf-8") {
      let connectResolve;
      const connected = new Promise((resolve, _reject) => {
        connectResolve = resolve;
      });
      return new Promise((resolve, reject) => {
        const server = (0, net_1.createServer)((socket) => {
          server.close();
          connectResolve([
            new SocketMessageReader(socket, encoding),
            new SocketMessageWriter(socket, encoding)
          ]);
        });
        server.on("error", reject);
        server.listen(port, "127.0.0.1", () => {
          server.removeListener("error", reject);
          resolve({
            onConnected: () => {
              return connected;
            }
          });
        });
      });
    }
    exports.createClientSocketTransport = createClientSocketTransport;
    function createServerSocketTransport(port, encoding = "utf-8") {
      const socket = (0, net_1.createConnection)(port, "127.0.0.1");
      return [
        new SocketMessageReader(socket, encoding),
        new SocketMessageWriter(socket, encoding)
      ];
    }
    exports.createServerSocketTransport = createServerSocketTransport;
    function isReadableStream(value) {
      const candidate = value;
      return candidate.read !== void 0 && candidate.addListener !== void 0;
    }
    function isWritableStream(value) {
      const candidate = value;
      return candidate.write !== void 0 && candidate.addListener !== void 0;
    }
    function createMessageConnection2(input, output, logger, options) {
      if (!logger) {
        logger = api_1.NullLogger;
      }
      const reader = isReadableStream(input) ? new StreamMessageReader2(input) : input;
      const writer = isWritableStream(output) ? new StreamMessageWriter2(output) : output;
      if (api_1.ConnectionStrategy.is(options)) {
        options = { connectionStrategy: options };
      }
      return (0, api_1.createMessageConnection)(reader, writer, logger, options);
    }
    exports.createMessageConnection = createMessageConnection2;
  }
});

// node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/node.js
var require_node = __commonJS({
  "node_modules/.pnpm/vscode-jsonrpc@8.2.1/node_modules/vscode-jsonrpc/node.js"(exports, module) {
    "use strict";
    module.exports = require_main();
  }
});

// node_modules/.pnpm/@github+copilot-sdk@1.0.3/node_modules/@github/copilot-sdk/dist/client.js
var import_node2 = __toESM(require_node(), 1);
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { Socket } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// node_modules/.pnpm/@github+copilot-sdk@1.0.3/node_modules/@github/copilot-sdk/dist/generated/rpc.js
function createServerRpc(connection) {
  return {
    /**
     * Checks server responsiveness and returns protocol information.
     *
     * @param params Optional message to echo back to the caller.
     *
     * @returns Server liveness response, including the echoed message, current server timestamp, and protocol version.
     */
    ping: async (params) => connection.sendRequest("ping", params),
    models: {
      /**
       * Lists Copilot models available to the authenticated user.
       *
       * @param params Optional GitHub token used to list models for a specific user instead of the global auth context.
       *
       * @returns List of Copilot models available to the resolved user, including capabilities and billing metadata.
       */
      list: async (params) => connection.sendRequest("models.list", params)
    },
    tools: {
      /**
       * Lists built-in tools available for a model.
       *
       * @param params Optional model identifier whose tool overrides should be applied to the listing.
       *
       * @returns Built-in tools available for the requested model, with their parameters and instructions.
       */
      list: async (params) => connection.sendRequest("tools.list", params)
    },
    account: {
      /**
       * Gets Copilot quota usage for the authenticated user or supplied GitHub token.
       *
       * @param params Optional GitHub token used to look up quota for a specific user instead of the global auth context.
       *
       * @returns Quota usage snapshots for the resolved user, keyed by quota type.
       */
      getQuota: async (params) => connection.sendRequest("account.getQuota", params)
    },
    secrets: {
      /**
       * Registers secret values for redaction in session logs and exports. The SDK calls this to inject dynamically generated secret values (e.g., OIDC tokens).
       *
       * @param params Secret values to add to the redaction filter.
       *
       * @returns Confirmation that the secret values were registered.
       */
      addFilterValues: async (params) => connection.sendRequest("secrets.addFilterValues", params)
    },
    mcp: {
      config: {
        /**
         * Lists MCP servers from user configuration.
         *
         * @returns User-configured MCP servers, keyed by server name.
         */
        list: async () => connection.sendRequest("mcp.config.list", {}),
        /**
         * Adds an MCP server to user configuration.
         *
         * @param params MCP server name and configuration to add to user configuration.
         */
        add: async (params) => connection.sendRequest("mcp.config.add", params),
        /**
         * Updates an MCP server in user configuration.
         *
         * @param params MCP server name and replacement configuration to write to user configuration.
         */
        update: async (params) => connection.sendRequest("mcp.config.update", params),
        /**
         * Removes an MCP server from user configuration.
         *
         * @param params MCP server name to remove from user configuration.
         */
        remove: async (params) => connection.sendRequest("mcp.config.remove", params),
        /**
         * Enables MCP servers in user configuration for new sessions.
         *
         * @param params MCP server names to enable for new sessions.
         */
        enable: async (params) => connection.sendRequest("mcp.config.enable", params),
        /**
         * Disables MCP servers in user configuration for new sessions.
         *
         * @param params MCP server names to disable for new sessions.
         */
        disable: async (params) => connection.sendRequest("mcp.config.disable", params),
        /**
         * Drops this runtime process's in-memory MCP server-definition cache so the next MCP config read observes disk.
         */
        reload: async () => connection.sendRequest("mcp.config.reload", {})
      },
      /**
       * Discovers MCP servers from user, workspace, plugin, and builtin sources.
       *
       * @param params Optional working directory used as context for MCP server discovery.
       *
       * @returns MCP servers discovered from user, workspace, plugin, and built-in sources.
       */
      discover: async (params) => connection.sendRequest("mcp.discover", params)
    },
    /** @experimental */
    plugins: {
      /**
       * Lists plugins installed in user/global state.
       *
       * @returns Plugins installed in user/global state.
       */
      list: async () => connection.sendRequest("plugins.list", {}),
      /**
       * Installs a plugin from a marketplace, GitHub repo, URL, or local path.
       *
       * @param params Plugin source and optional working directory for relative-path resolution.
       *
       * @returns Result of installing a plugin.
       */
      install: async (params) => connection.sendRequest("plugins.install", params),
      /**
       * Uninstalls an installed plugin.
       *
       * @param params Name (or spec) of the plugin to uninstall.
       */
      uninstall: async (params) => connection.sendRequest("plugins.uninstall", params),
      /**
       * Updates an installed plugin to its latest published version.
       *
       * @param params Name (or spec) of the plugin to update.
       *
       * @returns Result of updating a single plugin.
       */
      update: async (params) => connection.sendRequest("plugins.update", params),
      /**
       * Updates every installed plugin to its latest published version.
       *
       * @returns Result of updating all installed plugins.
       */
      updateAll: async () => connection.sendRequest("plugins.updateAll", {}),
      /**
       * Enables installed plugins for new sessions.
       *
       * @param params Plugin names (or specs) to enable.
       */
      enable: async (params) => connection.sendRequest("plugins.enable", params),
      /**
       * Disables installed plugins for new sessions.
       *
       * @param params Plugin names (or specs) to disable.
       */
      disable: async (params) => connection.sendRequest("plugins.disable", params),
      /** @experimental */
      marketplaces: {
        /**
         * Lists all registered marketplaces (defaults + user-added).
         *
         * @returns All registered marketplaces, including built-in defaults.
         */
        list: async () => connection.sendRequest("plugins.marketplaces.list", {}),
        /**
         * Registers a new marketplace from a source (owner/repo, URL, or local path).
         *
         * @param params Marketplace source to register.
         *
         * @returns Result of registering a new marketplace.
         */
        add: async (params) => connection.sendRequest("plugins.marketplaces.add", params),
        /**
         * Removes a previously-registered marketplace. When the marketplace has dependent plugins and `force` is not set, the marketplace is left intact and the result lists the dependents so the caller can decide whether to retry with `force=true`.
         *
         * @param params Name of the marketplace to remove and an optional force flag.
         *
         * @returns Outcome of the remove attempt, including dependent-plugin info when applicable.
         */
        remove: async (params) => connection.sendRequest("plugins.marketplaces.remove", params),
        /**
         * Lists plugins advertised by a registered marketplace.
         *
         * @param params Name of the marketplace whose plugin catalog to fetch.
         *
         * @returns Plugins advertised by the marketplace.
         */
        browse: async (params) => connection.sendRequest("plugins.marketplaces.browse", params),
        /**
         * Re-fetches one or all registered marketplace catalogs.
         *
         * @param params Optional marketplace name; omit to refresh all.
         *
         * @returns Result of refreshing one or more marketplace catalogs.
         */
        refresh: async (params) => connection.sendRequest("plugins.marketplaces.refresh", params)
      }
    },
    skills: {
      config: {
        /**
         * Replaces the global list of disabled skills.
         *
         * @param params Skill names to mark as disabled in global configuration, replacing any previous list.
         */
        setDisabledSkills: async (params) => connection.sendRequest("skills.config.setDisabledSkills", params)
      },
      /**
       * Discovers skills across global and project sources.
       *
       * @param params Optional project paths and additional skill directories to include in discovery.
       *
       * @returns Skills discovered across global and project sources.
       */
      discover: async (params) => connection.sendRequest("skills.discover", params),
      /**
       * Returns the canonical directories where a client may create skills that the runtime will recognize, including ones that do not exist yet. Project directories become active once created.
       *
       * @param params Optional project paths to enumerate.
       *
       * @returns Canonical locations where skills can be created so the runtime will recognize them.
       *
       * @experimental
       */
      getDiscoveryPaths: async (params) => connection.sendRequest("skills.getDiscoveryPaths", params)
    },
    /** @experimental */
    agents: {
      /**
       * Discovers custom agents across user, project, plugin, and remote sources.
       *
       * @param params Optional project paths to include in agent discovery.
       *
       * @returns Agents discovered across user, project, plugin, and remote sources.
       */
      discover: async (params) => connection.sendRequest("agents.discover", params),
      /**
       * Returns the canonical directories where a client may create custom agents that the runtime will recognize, including ones that do not exist yet. Project directories become active once created.
       *
       * @param params Optional project paths to include when enumerating agent discovery directories.
       *
       * @returns Canonical locations where custom agents can be created so the runtime will recognize them.
       */
      getDiscoveryPaths: async (params) => connection.sendRequest("agents.getDiscoveryPaths", params)
    },
    /** @experimental */
    instructions: {
      /**
       * Discovers instruction sources across user, repository, and plugin sources.
       *
       * @param params Optional project paths to include in instruction discovery.
       *
       * @returns Instruction sources discovered across user, repository, and plugin sources.
       */
      discover: async (params) => connection.sendRequest("instructions.discover", params),
      /**
       * Returns the canonical files and directories where a client may create custom instructions that the runtime will recognize, including ones that do not exist yet. Repository targets become active once created.
       *
       * @param params Optional project paths to include when enumerating instruction discovery targets.
       *
       * @returns Canonical files and directories where custom instructions can be created so the runtime will recognize them.
       */
      getDiscoveryPaths: async (params) => connection.sendRequest("instructions.getDiscoveryPaths", params)
    },
    user: {
      settings: {
        /**
         * Drops this runtime process's in-memory user settings cache so the next settings read observes disk.
         */
        reload: async () => connection.sendRequest("user.settings.reload", {})
      }
    },
    runtime: {
      /**
       * Gracefully shuts down an SDK-owned runtime. The response is sent only after cleanup completes; callers may then terminate the owned runtime process.
       */
      shutdown: async () => connection.sendRequest("runtime.shutdown", {})
    },
    sessionFs: {
      /**
       * Registers an SDK client as the session filesystem provider.
       *
       * @param params Initial working directory, session-state path layout, and path conventions used to register the calling SDK client as the session filesystem provider.
       *
       * @returns Indicates whether the calling client was registered as the session filesystem provider.
       */
      setProvider: async (params) => connection.sendRequest("sessionFs.setProvider", params)
    },
    /** @experimental */
    llmInference: {
      /**
       * Registers an SDK client as the LLM inference callback provider.
       *
       * @returns Indicates whether the calling client was registered as the LLM inference provider.
       */
      setProvider: async () => connection.sendRequest("llmInference.setProvider", {}),
      /**
       * Delivers the response head (status + headers) for an in-flight request, correlated by the requestId the runtime supplied in httpRequestStart. Must be called exactly once per request before any httpResponseChunk frames.
       *
       * @param params Response head.
       *
       * @returns Whether the start frame was accepted.
       */
      httpResponseStart: async (params) => connection.sendRequest("llmInference.httpResponseStart", params),
      /**
       * Delivers a body byte range (or a terminal transport error) for an in-flight response, correlated by requestId. Set `end` true on the last chunk. When `error` is set the response terminates with a transport-level failure and the runtime raises an APIConnectionError.
       *
       * @param params A response body chunk or terminal error.
       *
       * @returns Whether the chunk was accepted.
       */
      httpResponseChunk: async (params) => connection.sendRequest("llmInference.httpResponseChunk", params)
    },
    /** @experimental */
    sessions: {
      /**
       * Creates or resumes a local session and returns the opened session ID.
       *
       * @param params Open a session by creating, resuming, attaching, connecting to a remote, or handing off.
       *
       * @returns Result of opening a session.
       */
      open: async (params) => connection.sendRequest("sessions.open", params),
      /**
       * Creates a new session by forking persisted history from an existing session.
       *
       * @param params Source session identifier to fork from, optional event-ID boundary, and optional friendly name for the new session.
       *
       * @returns Identifier and optional friendly name assigned to the newly forked session.
       */
      fork: async (params) => connection.sendRequest("sessions.fork", params),
      /**
       * Connects to an existing remote session and exposes it as an SDK session.
       *
       * @param params Remote session connection parameters.
       *
       * @returns Remote session connection result.
       */
      connect: async (params) => connection.sendRequest("sessions.connect", params),
      /**
       * Lists sessions, optionally filtered by source and working-directory context. Returned entries are discriminated by `isRemote`: local entries carry only the lightweight `LocalSessionMetadataValue` shape; remote entries carry the full `RemoteSessionMetadataValue` shape (repository, PR number, taskType, etc.).
       *
       * @param params Optional source filter, metadata-load limit, and context filter applied to the returned sessions.
       *
       * @returns Sessions matching the filter, ordered most-recently-modified first.
       */
      list: async (params) => connection.sendRequest("sessions.list", params),
      /**
       * Finds the local session bound to a GitHub task ID, if any.
       *
       * @param params GitHub task ID to look up.
       *
       * @returns ID of the local session bound to the given GitHub task, or omitted when none.
       */
      findByTaskId: async (params) => connection.sendRequest("sessions.findByTaskId", params),
      /**
       * Resolves a UUID prefix to a unique session ID, if exactly one session matches.
       *
       * @param params UUID prefix to resolve to a unique session ID.
       *
       * @returns Session ID matching the prefix, omitted when no unique match exists.
       */
      findByPrefix: async (params) => connection.sendRequest("sessions.findByPrefix", params),
      /**
       * Returns the most-relevant prior session for a given working-directory context.
       *
       * @param params Optional working-directory context used to score session relevance.
       *
       * @returns Most-relevant session ID for the supplied context, or omitted when no sessions exist.
       */
      getLastForContext: async (params) => connection.sendRequest("sessions.getLastForContext", params),
      /**
       * Returns the on-disk byte size of each session's workspace directory.
       *
       * @returns Map of sessionId -> on-disk size in bytes for each session's workspace directory.
       */
      getSizes: async () => connection.sendRequest("sessions.getSizes", {}),
      /**
       * Returns the subset of the supplied session IDs that are currently held by another running process.
       *
       * @param params Session IDs to test for live in-use locks.
       *
       * @returns Session IDs from the input set that are currently in use by another process.
       */
      checkInUse: async (params) => connection.sendRequest("sessions.checkInUse", params),
      /**
       * Closes a session: emits shutdown, flushes pending events, releases the in-use lock, and disposes the active session.
       *
       * @param params Session ID to close.
       *
       * @returns Closes a session: emits shutdown, flushes pending events to disk, releases the in-use lock, disposes the active session. Idempotent: succeeds even if the session is not currently active.
       */
      close: async (params) => connection.sendRequest("sessions.close", params),
      /**
       * Closes, deactivates, and deletes a set of sessions, returning the bytes freed per session.
       *
       * @param params Session IDs to close, deactivate, and delete from disk.
       *
       * @returns Map of sessionId -> bytes freed by removing the session's workspace directory.
       */
      bulkDelete: async (params) => connection.sendRequest("sessions.bulkDelete", params),
      /**
       * Deletes sessions older than the given threshold, with optional dry-run and exclusion list.
       *
       * @param params Age threshold and optional flags controlling which old sessions are pruned (or simulated when dryRun is true).
       *
       * @returns Outcome of the prune operation: deleted IDs, dry-run candidates, skipped IDs, total bytes freed, and the dry-run flag.
       */
      pruneOld: async (params) => connection.sendRequest("sessions.pruneOld", params),
      /**
       * Flushes a session's pending events to disk.
       *
       * @param params Session ID whose pending events should be flushed to disk.
       *
       * @returns Flush a session's pending events to disk. No-op when no writer exists for the session (e.g., already closed).
       */
      save: async (params) => connection.sendRequest("sessions.save", params),
      /**
       * Releases the in-use lock held by this process for a session.
       *
       * @param params Session ID whose in-use lock should be released.
       *
       * @returns Release the in-use lock held by this process for the given session. No-op when this process does not currently hold a lock for the session.
       */
      releaseLock: async (params) => connection.sendRequest("sessions.releaseLock", params),
      /**
       * Backfills missing summary and context fields on the supplied session metadata records.
       *
       * @param params Session metadata records to enrich with summary and context information.
       *
       * @returns The enriched metadata records, with summary and context fields backfilled where available. Sessions confirmed empty and unnamed are omitted.
       */
      enrichMetadata: async (params) => connection.sendRequest("sessions.enrichMetadata", params),
      /**
       * Reloads user, plugin, and (optionally) repo hooks on the active session.
       *
       * @param params Active session ID and an optional flag for deferring repo-level hooks until folder trust.
       *
       * @returns Reload all hooks (user, plugin, optionally repo) and apply them to the active session. Call after installing or removing plugins so their hooks take effect immediately. No-op when no active session matches the given sessionId.
       */
      reloadPluginHooks: async (params) => connection.sendRequest("sessions.reloadPluginHooks", params),
      /**
       * Loads previously-deferred repo-level hooks on the active session, returning queued startup prompts.
       *
       * @param params Active session ID whose deferred repo-level hooks should be loaded.
       *
       * @returns Queued repo-level startup prompts and the total hook command count after loading.
       */
      loadDeferredRepoHooks: async (params) => connection.sendRequest("sessions.loadDeferredRepoHooks", params),
      /**
       * Replaces the manager-wide additional plugins registered with the session manager.
       *
       * @param params Manager-wide additional plugins to register; replaces any previously-configured set.
       *
       * @returns Replace the manager-wide additional plugins. New session creations and subsequent hook reloads see the new set; already-running sessions keep their existing hook installation until the next reload.
       */
      setAdditionalPlugins: async (params) => connection.sendRequest("sessions.setAdditionalPlugins", params),
      /**
       * Attaches the runtime-managed remote-control singleton to a session, awaiting initial setup. If remote control is already attached to a different session, the singleton is transferred (preserving the underlying Mission Control connection). Returns the final status.
       *
       * @param params Parameters for attaching the remote-control singleton to a session.
       *
       * @returns Wrapper for the singleton's current status.
       */
      startRemoteControl: async (params) => connection.sendRequest("sessions.startRemoteControl", params),
      /**
       * Atomically rebinds the remote-control singleton to a different session, preserving the underlying Mission Control connection. When `expectedFromSessionId` is provided and does not match the singleton's current `attachedSessionId`, the transfer is rejected with `transferred: false` and the current status is returned unchanged.
       *
       * @param params Parameters for atomically rebinding the remote-control singleton.
       *
       * @returns Outcome of a transferRemoteControl call.
       */
      transferRemoteControl: async (params) => connection.sendRequest("sessions.transferRemoteControl", params),
      /**
       * Patches the steering state of the active remote-control singleton. When remote control is off, this is a no-op and the off status is returned. Today only `enabled: true` is actionable on the underlying exporter; passing `false` is reserved for future use.
       *
       * @param params Patch for the singleton's steering state.
       *
       * @returns Wrapper for the singleton's current status.
       */
      setRemoteControlSteering: async (params) => connection.sendRequest("sessions.setRemoteControlSteering", params),
      /**
       * Stops the remote-control singleton. When `expectedSessionId` is provided and does not match the singleton's current `attachedSessionId`, the stop is rejected with `stopped: false` and the current status is returned unchanged (unless `force` is set, in which case the singleton is unconditionally torn down).
       *
       * @param params Parameters for stopping the remote-control singleton.
       *
       * @returns Outcome of a stopRemoteControl call.
       */
      stopRemoteControl: async (params) => connection.sendRequest("sessions.stopRemoteControl", params),
      /**
       * Returns the current state of the remote-control singleton, including the attached session id and frontend URL when active.
       *
       * @returns Wrapper for the singleton's current status.
       */
      getRemoteControlStatus: async () => connection.sendRequest("sessions.getRemoteControlStatus", {})
    },
    /** @experimental */
    agentRegistry: {
      /**
       * Spawns a managed-server child with the supplied configuration and returns a discriminated-union result. The caller (typically the CLI controller) is responsible for attaching to the spawned child and sending any follow-up prompt. When the controller-local spawn gate is closed the server returns JSON-RPC MethodNotFound.
       *
       * @param params Inputs to spawn a managed-server child via the controller's spawn delegate.
       *
       * @returns Outcome of an agentRegistry.spawn call.
       */
      spawn: async (params) => connection.sendRequest("agentRegistry.spawn", params)
    }
  };
}
function createInternalServerRpc(connection) {
  return {
    /**
     * Performs the SDK server connection handshake and validates the optional connection token. Marked internal because this is JSON-RPC transport plumbing invoked automatically by an SDK client's own `connect()` wrapper, not a user-facing method. Stays internal as long as the SDK client owns the handshake; would only become public if the SDK ever exposed the raw schema surface to consumers without a connection wrapper.
     *
     * @param params Optional connection token presented by the SDK client during the handshake.
     *
     * @returns Handshake result reporting the server's protocol version and package version on success.
     */
    connect: async (params) => connection.sendRequest("connect", params),
    /** @experimental */
    sessions: {
      /**
       * Computes the absolute path to a session's persisted events.jsonl file. Internal: filesystem paths are only meaningful in-process (CLI and runtime share a filesystem). Currently used by the CLI's contribution-graph feature to read historical events directly. Remote SDK consumers must not depend on this; a proper event-query API would replace it if the contribution graph ever needed to work over the wire.
       *
       * @param params Session ID whose event-log file path to compute.
       *
       * @returns Absolute path to the session's events.jsonl file on disk.
       */
      getEventFilePath: async (params) => connection.sendRequest("sessions.getEventFilePath", params),
      /**
       * Returns a session's persisted remote-steerable flag, if any has been recorded. Internal: this is CLI-specific book-keeping used by `--continue` / `--resume` to inherit the prior session's remote-steerable preference. SDK consumers that want similar behavior should manage their own persistence around start/stop calls rather than relying on this runtime-side flag.
       *
       * @param params Session ID to look up the persisted remote-steerable flag for.
       *
       * @returns The session's persisted remote-steerable flag, or omitted when no value has been persisted.
       */
      getPersistedRemoteSteerable: async (params) => connection.sendRequest("sessions.getPersistedRemoteSteerable", params),
      /**
       * Gets the dynamic-context board entry count associated with a session, when available. Internal: this exists solely so CLI telemetry events (`rem_spawn_gate`, `rem_consolidation_complete`) can pair START / END board counts around the detached rem-agent spawn. "Dynamic context board" is a runtime-internal concept that is not part of the public SDK contract; the long-term plan is to relocate the telemetry emission into the runtime so this method can be deleted entirely.
       *
       * @param params Session ID whose board entry count should be returned.
       *
       * @returns Dynamic-context board entry count, when available.
       */
      getBoardEntryCount: async (params) => connection.sendRequest("sessions.getBoardEntryCount", params),
      /**
       * Cursor-based long-poll for sessions spawned by the runtime (e.g. in response to a Mission Control `start_session` command). The cursor is an opaque token; pass it back to receive only spawn events that occurred AFTER the cursor was issued. Omit the cursor on the first call to receive any events buffered since the runtime started. Internal: this is a CLI background-daemon plumbing primitive. SDK consumers that need to react to runtime-spawned sessions should subscribe to a higher-level event stream rather than driving a long-poll loop.
       *
       * @param params Cursor and optional long-poll wait for polling runtime-spawned sessions.
       *
       * @returns Batch of spawn events plus a cursor for follow-up polls.
       */
      pollSpawnedSessions: async (params) => connection.sendRequest("sessions.pollSpawnedSessions", params),
      /**
       * Registers extension-provided tools on the given session, gated by an optional `enabled` callback. Returns an opaque unsubscribe function the caller must invoke to deregister the tools when the extension is torn down. Marked internal because `loader`, `enabled`, and the returned `unsubscribe` are in-process handles that cannot cross the JSON-RPC boundary. Disappears once extension discovery / launch / tool registration are owned by the runtime: SDK consumers will pass pure config (search paths, disabled ids) via `SessionOptions` and the runtime will resolve, launch, register, and tear down extensions itself.
       *
       * @param params Params to attach an extension loader's tools to a session.
       *
       * @returns Handle for releasing the extension tool registration.
       */
      registerExtensionToolsOnSession: async (params) => connection.sendRequest("sessions.registerExtensionToolsOnSession", params),
      /**
       * Attaches (or detaches) an in-process ExtensionController delegate for the given session, used by shared-API surfaces that need to query or modify the session's extension state. Pass `controller: undefined` to detach. Marked internal because the controller is an in-process object that cannot cross the JSON-RPC boundary. Disappears alongside `registerExtensionToolsOnSession`: once the runtime owns extension management, the public surface exposes list/enable/disable/reload as dedicated RPCs served by the runtime.
       *
       * @param params Params to attach or detach an in-process ExtensionController delegate.
       */
      configureSessionExtensions: async (params) => connection.sendRequest("sessions.configureSessionExtensions", params)
    }
  };
}
function createSessionRpc(connection, sessionId) {
  return {
    /**
     * Suspends the session while preserving persisted state for later resume.
     *
     * @experimental
     */
    suspend: async () => connection.sendRequest("session.suspend", { sessionId }),
    /**
     * Sends a user message to the session and returns its message ID.
     *
     * @param params Parameters for sending a user message to the session
     *
     * @returns Result of sending a user message
     *
     * @experimental
     */
    send: async (params) => connection.sendRequest("session.send", { sessionId, ...params }),
    /**
     * Aborts the current agent turn.
     *
     * @param params Parameters for aborting the current turn
     *
     * @returns Result of aborting the current turn
     *
     * @experimental
     */
    abort: async (params) => connection.sendRequest("session.abort", { sessionId, ...params }),
    /**
     * Shuts down the session and persists its final state. Awaits any deferred sessionEnd hooks before resolving so user-supplied hook scripts complete before the runtime tears down.
     *
     * @param params Parameters for shutting down the session
     *
     * @experimental
     */
    shutdown: async (params) => connection.sendRequest("session.shutdown", { sessionId, ...params }),
    /** @experimental */
    auth: {
      /**
       * Gets authentication status and account metadata for the session.
       *
       * @returns Authentication status and account metadata for the session.
       */
      getStatus: async () => connection.sendRequest("session.auth.getStatus", { sessionId }),
      /**
       * Updates the session's auth credentials used for outbound model and API requests.
       *
       * @param params New auth credentials to install on the session. Omit to leave credentials unchanged.
       *
       * @returns Indicates whether the credential update succeeded.
       */
      setCredentials: async (params) => connection.sendRequest("session.auth.setCredentials", { sessionId, ...params })
    },
    /** @experimental */
    canvas: {
      /**
       * Lists canvases declared for the session.
       *
       * @returns Declared canvases available in this session.
       */
      list: async () => connection.sendRequest("session.canvas.list", { sessionId }),
      /**
       * Lists currently open canvas instances for the live session.
       *
       * @returns Live open-canvas snapshot.
       */
      listOpen: async () => connection.sendRequest("session.canvas.listOpen", { sessionId }),
      /**
       * Opens or focuses a canvas instance.
       *
       * @param params Canvas open parameters.
       *
       * @returns Open canvas instance snapshot.
       */
      open: async (params) => connection.sendRequest("session.canvas.open", { sessionId, ...params }),
      /**
       * Closes an open canvas instance.
       *
       * @param params Canvas close parameters.
       */
      close: async (params) => connection.sendRequest("session.canvas.close", { sessionId, ...params }),
      /** @experimental */
      action: {
        /**
         * Invokes an action on an open canvas instance.
         *
         * @param params Canvas action invocation parameters.
         *
         * @returns Canvas action invocation result.
         */
        invoke: async (params) => connection.sendRequest("session.canvas.action.invoke", { sessionId, ...params })
      }
    },
    /** @experimental */
    model: {
      /**
       * Gets the currently selected model for the session.
       *
       * @returns The currently selected model, reasoning effort, and context tier for the session. The context tier reflects `Session.getContextTier()`, restored from the session journal on resume.
       */
      getCurrent: async () => connection.sendRequest("session.model.getCurrent", { sessionId }),
      /**
       * Switches the session to a model and optional reasoning configuration.
       *
       * @param params Target model identifier and optional reasoning effort, summary, capability overrides, and context tier.
       *
       * @returns The model identifier active on the session after the switch.
       */
      switchTo: async (params) => connection.sendRequest("session.model.switchTo", { sessionId, ...params }),
      /**
       * Updates the session's reasoning effort without changing the selected model.
       *
       * @param params Reasoning effort level to apply to the currently selected model.
       *
       * @returns Update the session's reasoning effort without changing the selected model. Use `switchTo` instead when you also need to change the model. The runtime stores the effort on the session and applies it to subsequent turns.
       */
      setReasoningEffort: async (params) => connection.sendRequest("session.model.setReasoningEffort", { sessionId, ...params }),
      /**
       * Lists models available to this session using its own auth and integration context. Connected hosts (CLI TUI, GitHub App) should call this through the session client so remote sessions return the remote CLI's available models rather than the caller's.
       *
       * @param params Optional listing options.
       *
       * @returns The list of models available to this session.
       */
      list: async (params) => connection.sendRequest("session.model.list", { sessionId, ...params })
    },
    /** @experimental */
    mode: {
      /**
       * Gets the current agent interaction mode.
       *
       * @returns The session mode the agent is operating in
       */
      get: async () => connection.sendRequest("session.mode.get", { sessionId }),
      /**
       * Sets the current agent interaction mode.
       *
       * @param params Agent interaction mode to apply to the session.
       */
      set: async (params) => connection.sendRequest("session.mode.set", { sessionId, ...params })
    },
    /** @experimental */
    name: {
      /**
       * Gets the session's friendly name.
       *
       * @returns The session's friendly name, or null when not yet set.
       */
      get: async () => connection.sendRequest("session.name.get", { sessionId }),
      /**
       * Sets the session's friendly name.
       *
       * @param params New friendly name to apply to the session.
       */
      set: async (params) => connection.sendRequest("session.name.set", { sessionId, ...params }),
      /**
       * Persists an auto-generated session summary as the session's name when no user-set name exists.
       *
       * @param params Auto-generated session summary to apply as the session's name when no user-set name exists.
       *
       * @returns Indicates whether the auto-generated summary was applied as the session's name.
       */
      setAuto: async (params) => connection.sendRequest("session.name.setAuto", { sessionId, ...params })
    },
    /** @experimental */
    plan: {
      /**
       * Reads the session plan file from the workspace.
       *
       * @returns Existence, contents, and resolved path of the session plan file.
       */
      read: async () => connection.sendRequest("session.plan.read", { sessionId }),
      /**
       * Writes new content to the session plan file.
       *
       * @param params Replacement contents to write to the session plan file.
       */
      update: async (params) => connection.sendRequest("session.plan.update", { sessionId, ...params }),
      /**
       * Deletes the session plan file from the workspace.
       */
      delete: async () => connection.sendRequest("session.plan.delete", { sessionId }),
      /**
       * Reads todo rows from the session SQL database for plan rendering.
       *
       * @returns Todo rows read from the session SQL database. Empty when no session database is available.
       */
      readSqlTodos: async () => connection.sendRequest("session.plan.readSqlTodos", { sessionId }),
      /**
       * Reads todo rows AND dependency edges from the session SQL database for structured progress UI. Same defensive behavior as readSqlTodos — returns empty arrays when the database, tables, or columns aren't available. Clients should call this on session start and after every `session.todos_changed` event to refresh structured-UI rendering.
       *
       * @returns Todo rows + dependency edges read from the session SQL database.
       */
      readSqlTodosWithDependencies: async () => connection.sendRequest("session.plan.readSqlTodosWithDependencies", { sessionId })
    },
    /** @experimental */
    workspaces: {
      /**
       * Gets current workspace metadata for the session.
       *
       * @returns Current workspace metadata for the session, including its absolute filesystem path when available.
       */
      getWorkspace: async () => connection.sendRequest("session.workspaces.getWorkspace", { sessionId }),
      /**
       * Lists files stored in the session workspace files directory.
       *
       * @returns Relative paths of files stored in the session workspace files directory.
       */
      listFiles: async () => connection.sendRequest("session.workspaces.listFiles", { sessionId }),
      /**
       * Reads a file from the session workspace files directory.
       *
       * @param params Relative path of the workspace file to read.
       *
       * @returns Contents of the requested workspace file as a UTF-8 string.
       */
      readFile: async (params) => connection.sendRequest("session.workspaces.readFile", { sessionId, ...params }),
      /**
       * Creates or overwrites a file in the session workspace files directory.
       *
       * @param params Relative path and UTF-8 content for the workspace file to create or overwrite.
       */
      createFile: async (params) => connection.sendRequest("session.workspaces.createFile", { sessionId, ...params }),
      /**
       * Lists workspace checkpoints in chronological order.
       *
       * @returns Workspace checkpoints in chronological order; empty when the workspace is not enabled.
       */
      listCheckpoints: async () => connection.sendRequest("session.workspaces.listCheckpoints", { sessionId }),
      /**
       * Reads the content of a workspace checkpoint by number.
       *
       * @param params Checkpoint number to read.
       *
       * @returns Checkpoint content as a UTF-8 string, or null when the checkpoint or workspace is missing.
       */
      readCheckpoint: async (params) => connection.sendRequest("session.workspaces.readCheckpoint", { sessionId, ...params }),
      /**
       * Saves pasted content as a UTF-8 file in the session workspace.
       *
       * @param params Pasted content to save as a UTF-8 file in the session workspace.
       *
       * @returns Descriptor for the saved paste file, or null when the workspace is unavailable.
       */
      saveLargePaste: async (params) => connection.sendRequest("session.workspaces.saveLargePaste", { sessionId, ...params }),
      /**
       * Computes a diff for the session workspace.
       *
       * @param params Parameters for computing a workspace diff.
       *
       * @returns Workspace diff result for the requested mode.
       */
      diff: async (params) => connection.sendRequest("session.workspaces.diff", { sessionId, ...params })
    },
    /** @experimental */
    instructions: {
      /**
       * Gets instruction sources loaded for the session.
       *
       * @returns Instruction sources loaded for the session, in merge order.
       */
      getSources: async () => connection.sendRequest("session.instructions.getSources", { sessionId })
    },
    /** @experimental */
    fleet: {
      /**
       * Starts fleet mode by submitting the fleet orchestration prompt to the session.
       *
       * @param params Optional user prompt to combine with the fleet orchestration instructions.
       *
       * @returns Indicates whether fleet mode was successfully activated.
       */
      start: async (params) => connection.sendRequest("session.fleet.start", { sessionId, ...params })
    },
    /** @experimental */
    agent: {
      /**
       * Lists custom agents available to the session.
       *
       * @returns Custom agents available to the session.
       */
      list: async () => connection.sendRequest("session.agent.list", { sessionId }),
      /**
       * Gets the currently selected custom agent for the session.
       *
       * @returns The currently selected custom agent, or null when using the default agent.
       */
      getCurrent: async () => connection.sendRequest("session.agent.getCurrent", { sessionId }),
      /**
       * Selects a custom agent for subsequent turns in the session.
       *
       * @param params Name of the custom agent to select for subsequent turns.
       *
       * @returns The newly selected custom agent.
       */
      select: async (params) => connection.sendRequest("session.agent.select", { sessionId, ...params }),
      /**
       * Clears the selected custom agent and returns the session to the default agent.
       */
      deselect: async () => connection.sendRequest("session.agent.deselect", { sessionId }),
      /**
       * Reloads custom agent definitions and returns the refreshed list.
       *
       * @returns Custom agents available to the session after reloading definitions from disk.
       */
      reload: async () => connection.sendRequest("session.agent.reload", { sessionId })
    },
    /** @experimental */
    tasks: {
      /**
       * Starts a background agent task in the session.
       *
       * @param params Agent type, prompt, name, and optional description and model override for the new task.
       *
       * @returns Identifier assigned to the newly started background agent task.
       */
      startAgent: async (params) => connection.sendRequest("session.tasks.startAgent", { sessionId, ...params }),
      /**
       * Lists background tasks tracked by the session.
       *
       * @returns Background tasks currently tracked by the session.
       */
      list: async () => connection.sendRequest("session.tasks.list", { sessionId }),
      /**
       * Refreshes metadata for any detached background shells the runtime knows about.
       *
       * @returns Refresh metadata for any detached background shells the runtime knows about. Use after a long pause to pick up exit/output state for shells running outside the agent loop.
       */
      refresh: async () => connection.sendRequest("session.tasks.refresh", { sessionId }),
      /**
       * Waits for all in-flight background tasks and any follow-up turns to settle.
       *
       * @returns Wait until all in-flight background tasks (agents + shells) and any follow-up turns scheduled by their completions have settled. Returns when the runtime is fully drained or after an internal timeout (default 10 minutes; configurable via COPILOT_TASK_WAIT_TIMEOUT_SECONDS).
       */
      waitForPending: async () => connection.sendRequest("session.tasks.waitForPending", { sessionId }),
      /**
       * Returns progress information for a background task by ID.
       *
       * @param params Identifier of the background task to fetch progress for.
       *
       * @returns Progress information for the task, or null when no task with that ID is tracked.
       */
      getProgress: async (params) => connection.sendRequest("session.tasks.getProgress", { sessionId, ...params }),
      /**
       * Returns the first sync-waiting task that can currently be promoted to background mode.
       *
       * @returns The first sync-waiting task that can currently be promoted to background mode.
       */
      getCurrentPromotable: async () => connection.sendRequest("session.tasks.getCurrentPromotable", { sessionId }),
      /**
       * Promotes an eligible synchronously-waited task so it continues running in the background.
       *
       * @param params Identifier of the task to promote to background mode.
       *
       * @returns Indicates whether the task was successfully promoted to background mode.
       */
      promoteToBackground: async (params) => connection.sendRequest("session.tasks.promoteToBackground", { sessionId, ...params }),
      /**
       * Atomically promotes the first promotable sync-waiting task to background mode and returns it.
       *
       * @returns The promoted task as it now exists in background mode, omitted if no promotable task was waiting.
       */
      promoteCurrentToBackground: async () => connection.sendRequest("session.tasks.promoteCurrentToBackground", { sessionId }),
      /**
       * Cancels a background task.
       *
       * @param params Identifier of the background task to cancel.
       *
       * @returns Indicates whether the background task was successfully cancelled.
       */
      cancel: async (params) => connection.sendRequest("session.tasks.cancel", { sessionId, ...params }),
      /**
       * Removes a completed or cancelled background task from tracking.
       *
       * @param params Identifier of the completed or cancelled task to remove from tracking.
       *
       * @returns Indicates whether the task was removed. False when the task does not exist or is still running/idle.
       */
      remove: async (params) => connection.sendRequest("session.tasks.remove", { sessionId, ...params }),
      /**
       * Sends a message to a background agent task.
       *
       * @param params Identifier of the target agent task, message content, and optional sender agent ID.
       *
       * @returns Indicates whether the message was delivered, with an error message when delivery failed.
       */
      sendMessage: async (params) => connection.sendRequest("session.tasks.sendMessage", { sessionId, ...params })
    },
    /** @experimental */
    skills: {
      /**
       * Lists skills available to the session.
       *
       * @returns Skills available to the session, with their enabled state.
       */
      list: async () => connection.sendRequest("session.skills.list", { sessionId }),
      /**
       * Returns the skills that have been invoked during this session.
       *
       * @returns Skills invoked during this session, ordered by invocation time (most recent last).
       */
      getInvoked: async () => connection.sendRequest("session.skills.getInvoked", { sessionId }),
      /**
       * Enables a skill for the session.
       *
       * @param params Name of the skill to enable for the session.
       */
      enable: async (params) => connection.sendRequest("session.skills.enable", { sessionId, ...params }),
      /**
       * Disables a skill for the session.
       *
       * @param params Name of the skill to disable for the session.
       */
      disable: async (params) => connection.sendRequest("session.skills.disable", { sessionId, ...params }),
      /**
       * Reloads skill definitions for the session.
       *
       * @returns Diagnostics from reloading skill definitions, with warnings and errors as separate lists.
       */
      reload: async () => connection.sendRequest("session.skills.reload", { sessionId }),
      /**
       * Ensures the session's skill definitions have been loaded from disk.
       */
      ensureLoaded: async () => connection.sendRequest("session.skills.ensureLoaded", { sessionId })
    },
    /** @experimental */
    mcp: {
      /**
       * Lists MCP servers configured for the session, their connection status, and host-level state. The host-level state (disabled/filtered servers, failed/needs-auth/pending connections, mcp3p policy, full config) is empty/zero when no MCP host has been initialized for the session.
       *
       * @returns MCP servers configured for the session, with their connection status and host-level state.
       */
      list: async () => connection.sendRequest("session.mcp.list", { sessionId }),
      /**
       * Lists the tools exposed by a connected MCP server on this session's host.
       *
       * @param params Server name whose tool list should be returned.
       *
       * @returns Tools exposed by the connected MCP server. Throws when the server is not connected.
       */
      listTools: async (params) => connection.sendRequest("session.mcp.listTools", { sessionId, ...params }),
      /**
       * Enables an MCP server for the session.
       *
       * @param params Name of the MCP server to enable for the session.
       */
      enable: async (params) => connection.sendRequest("session.mcp.enable", { sessionId, ...params }),
      /**
       * Disables an MCP server for the session.
       *
       * @param params Name of the MCP server to disable for the session.
       */
      disable: async (params) => connection.sendRequest("session.mcp.disable", { sessionId, ...params }),
      /**
       * Reloads MCP server connections for the session.
       */
      reload: async () => connection.sendRequest("session.mcp.reload", { sessionId }),
      /**
       * Runs an MCP sampling inference on behalf of an MCP server.
       *
       * @param params Identifiers and raw MCP CreateMessageRequest params used to run a sampling inference.
       *
       * @returns Outcome of an MCP sampling execution: success result, failure error, or cancellation.
       */
      executeSampling: async (params) => connection.sendRequest("session.mcp.executeSampling", { sessionId, ...params }),
      /**
       * Cancels an in-flight MCP sampling execution by request ID.
       *
       * @param params The requestId previously passed to executeSampling that should be cancelled.
       *
       * @returns Indicates whether an in-flight sampling execution with the given requestId was found and cancelled.
       */
      cancelSamplingExecution: async (params) => connection.sendRequest("session.mcp.cancelSamplingExecution", { sessionId, ...params }),
      /**
       * Sets how environment-variable values supplied to MCP servers are resolved (direct or indirect).
       *
       * @param params Mode controlling how MCP server env values are resolved (`direct` or `indirect`).
       *
       * @returns Env-value mode recorded on the session after the update.
       */
      setEnvValueMode: async (params) => connection.sendRequest("session.mcp.setEnvValueMode", { sessionId, ...params }),
      /**
       * Removes the auto-managed `github` MCP server when present.
       *
       * @returns Indicates whether the auto-managed `github` MCP server was removed (false when nothing to remove).
       */
      removeGitHub: async () => connection.sendRequest("session.mcp.removeGitHub", { sessionId }),
      /**
       * Stops an individual MCP server on the session's host.
       *
       * @param params Server name for an individual MCP server stop.
       */
      stopServer: async (params) => connection.sendRequest("session.mcp.stopServer", { sessionId, ...params }),
      /**
       * Checks whether a named MCP server is currently running on the session's host.
       *
       * @param params Server name to check running status for.
       *
       * @returns Whether the named MCP server is running.
       */
      isServerRunning: async (params) => connection.sendRequest("session.mcp.isServerRunning", { sessionId, ...params }),
      /** @experimental */
      oauth: {
        /**
         * Resolves a pending MCP OAuth request with a host-provided token or cancellation. The pending request is emitted as mcp.oauth_required with the data necessary to authorize the request.
         *
         * @param params Pending MCP OAuth request ID and host-provided token or cancellation response.
         *
         * @returns Indicates whether the pending MCP OAuth response was accepted.
         */
        handlePendingRequest: async (params) => connection.sendRequest("session.mcp.oauth.handlePendingRequest", { sessionId, ...params }),
        /**
         * Starts OAuth authentication for a remote MCP server.
         *
         * @param params Remote MCP server name and optional overrides controlling reauthentication, OAuth client display name, and the callback success-page copy.
         *
         * @returns OAuth authorization URL the caller should open, or empty when cached tokens already authenticated the server.
         */
        login: async (params) => connection.sendRequest("session.mcp.oauth.login", { sessionId, ...params })
      },
      /** @experimental */
      apps: {
        /**
         * Fetch an MCP resource (typically a `ui://` MCP App bundle, per SEP-1865) from a connected server. Requires the `mcp-apps` session capability.
         *
         * @param params MCP server and resource URI to fetch.
         *
         * @returns Resource contents returned by the MCP server.
         */
        readResource: async (params) => connection.sendRequest("session.mcp.apps.readResource", { sessionId, ...params }),
        /**
         * List tools that an MCP App view is allowed to call (SEP-1865 visibility filter). Returns tools whose `_meta.ui.visibility` is unset (default `["model","app"]`) or includes `"app"`.
         *
         * @param params MCP server to list app-callable tools for.
         *
         * @returns App-callable tools from the named MCP server.
         */
        listTools: async (params) => connection.sendRequest("session.mcp.apps.listTools", { sessionId, ...params }),
        /**
         * Call an MCP tool from an MCP App view (SEP-1865). Enforces the visibility check that prevents an app iframe from invoking model-only tools. Returns the standard MCP `CallToolResult`.
         *
         * @param params MCP server, tool name, and arguments to invoke from an MCP App view.
         *
         * @returns Standard MCP CallToolResult
         */
        callTool: async (params) => connection.sendRequest("session.mcp.apps.callTool", { sessionId, ...params }),
        /**
         * Replace the host context returned to MCP App guests on `ui/initialize`. Hosts use this to advertise theme, locale, or other metadata to the guest UI.
         *
         * @param params Host context to advertise to MCP App guests.
         */
        setHostContext: async (params) => connection.sendRequest("session.mcp.apps.setHostContext", { sessionId, ...params }),
        /**
         * Read the current host context advertised to MCP App guests.
         *
         * @returns Current host context advertised to MCP App guests.
         */
        getHostContext: async () => connection.sendRequest("session.mcp.apps.getHostContext", { sessionId }),
        /**
         * Diagnose MCP Apps wiring for a specific MCP server. Reports the session capability, feature-flag state, advertised extension, and how many tools have `_meta.ui` populated.
         *
         * @param params MCP server to diagnose MCP Apps wiring for.
         *
         * @returns Diagnostic snapshot of MCP Apps wiring for the named server.
         */
        diagnose: async (params) => connection.sendRequest("session.mcp.apps.diagnose", { sessionId, ...params })
      }
    },
    /** @experimental */
    plugins: {
      /**
       * Lists plugins installed for the session.
       *
       * @returns Plugins installed for the session, with their enabled state and version metadata.
       */
      list: async () => connection.sendRequest("session.plugins.list", { sessionId }),
      /**
       * Reloads the session's plugin set, refreshing MCP servers, custom agents, hooks, and skills cache so SDK-driven changes via `server.plugins.*` take effect immediately.
       *
       * @param params Optional flags controlling which side effects the reload performs.
       */
      reload: async (params) => connection.sendRequest("session.plugins.reload", { sessionId, ...params })
    },
    /** @experimental */
    provider: {
      /**
       * Returns the provider endpoint and credentials the session is currently configured to talk to, so the caller can make inference calls directly against the same backend the session uses.
       *
       * @param params Optional model identifier to scope the endpoint snapshot to.
       *
       * @returns A snapshot of the provider endpoint the session is currently configured to talk to.
       */
      getEndpoint: async (params) => connection.sendRequest("session.provider.getEndpoint", { sessionId, ...params })
    },
    /** @experimental */
    options: {
      /**
       * Patches the genuinely-mutable subset of session options.
       *
       * @param params Patch of mutable session options to apply to the running session.
       *
       * @returns Indicates whether the session options patch was applied successfully.
       */
      update: async (params) => connection.sendRequest("session.options.update", { sessionId, ...params })
    },
    /** @experimental */
    lsp: {
      /**
       * Loads the merged LSP configuration set for the session's working directory.
       *
       * @param params Parameters for (re)loading the merged LSP configuration set.
       */
      initialize: async (params) => connection.sendRequest("session.lsp.initialize", { sessionId, ...params })
    },
    /** @experimental */
    extensions: {
      /**
       * Lists extensions discovered for the session and their current status.
       *
       * @returns Extensions discovered for the session, with their current status.
       */
      list: async () => connection.sendRequest("session.extensions.list", { sessionId }),
      /**
       * Enables an extension for the session.
       *
       * @param params Source-qualified extension identifier to enable for the session.
       */
      enable: async (params) => connection.sendRequest("session.extensions.enable", { sessionId, ...params }),
      /**
       * Disables an extension for the session.
       *
       * @param params Source-qualified extension identifier to disable for the session.
       */
      disable: async (params) => connection.sendRequest("session.extensions.disable", { sessionId, ...params }),
      /**
       * Reloads extension definitions and processes for the session.
       */
      reload: async () => connection.sendRequest("session.extensions.reload", { sessionId }),
      /**
       * Push attachments into the next user-message turn from an extension. The host should surface them as composer pills and forward them via the next session.send call. Callable only by extension-owned connections.
       *
       * @param params Parameters for session.extensions.sendAttachmentsToMessage.
       */
      sendAttachmentsToMessage: async (params) => connection.sendRequest("session.extensions.sendAttachmentsToMessage", { sessionId, ...params })
    },
    /** @experimental */
    tools: {
      /**
       * Provides the result for a pending external tool call.
       *
       * @param params Pending external tool call request ID, with the tool result or an error describing why it failed.
       *
       * @returns Indicates whether the external tool call result was handled successfully.
       */
      handlePendingToolCall: async (params) => connection.sendRequest("session.tools.handlePendingToolCall", { sessionId, ...params }),
      /**
       * Resolves, builds, and validates the runtime tool list for the session.
       *
       * @returns Resolve, build, and validate the runtime tool list for this session. Subagent sessions and consumer flows that need an initialized tool set before `send` invoke this. Default base-class implementation is a no-op for sessions that don't support tool validation.
       */
      initializeAndValidate: async () => connection.sendRequest("session.tools.initializeAndValidate", { sessionId }),
      /**
       * Returns lightweight metadata for the session's currently initialized tools.
       *
       * @returns Current lightweight tool metadata snapshot for the session.
       */
      getCurrentMetadata: async () => connection.sendRequest("session.tools.getCurrentMetadata", { sessionId }),
      /**
       * Updates the current session's live subagent settings after user settings change. The persisted user settings remain the source of truth for future sessions.
       *
       * @param params Subagent settings to apply to the current session
       *
       * @returns Empty result after applying subagent settings
       */
      updateSubagentSettings: async (params) => connection.sendRequest("session.tools.updateSubagentSettings", { sessionId, ...params })
    },
    /** @experimental */
    commands: {
      /**
       * Lists slash commands available in the session.
       *
       * @param params Optional filters controlling which command sources to include in the listing.
       *
       * @returns Slash commands available in the session, after applying any include/exclude filters.
       */
      list: async (params) => connection.sendRequest("session.commands.list", { sessionId, ...params }),
      /**
       * Invokes a slash command in the session.
       *
       * @param params Slash command name and optional raw input string to invoke.
       *
       * @returns Result of invoking the slash command (text output, prompt to send to the agent, or completion).
       */
      invoke: async (params) => connection.sendRequest("session.commands.invoke", { sessionId, ...params }),
      /**
       * Reports completion of a pending client-handled slash command.
       *
       * @param params Pending command request ID and an optional error if the client handler failed.
       *
       * @returns Indicates whether the pending client-handled command was completed successfully.
       */
      handlePendingCommand: async (params) => connection.sendRequest("session.commands.handlePendingCommand", { sessionId, ...params }),
      /**
       * Executes a slash command synchronously and returns any error.
       *
       * @param params Slash command name and argument string to execute synchronously.
       *
       * @returns Error message produced while executing the command, if any.
       */
      execute: async (params) => connection.sendRequest("session.commands.execute", { sessionId, ...params }),
      /**
       * Enqueues a slash command for FIFO processing on the local session.
       *
       * @param params Slash-prefixed command string to enqueue for FIFO processing.
       *
       * @returns Indicates whether the command was accepted into the local execution queue.
       */
      enqueue: async (params) => connection.sendRequest("session.commands.enqueue", { sessionId, ...params }),
      /**
       * Reports whether the host actually executed a queued command and whether to continue processing.
       *
       * @param params Queued-command request ID and the result indicating whether the host executed it (and whether to stop processing further queued commands).
       *
       * @returns Indicates whether the queued-command response was matched to a pending request.
       */
      respondToQueuedCommand: async (params) => connection.sendRequest("session.commands.respondToQueuedCommand", { sessionId, ...params })
    },
    /** @experimental */
    telemetry: {
      /**
       * Gets the telemetry engagement ID currently associated with the session, when available.
       *
       * @returns Telemetry engagement ID for the session, when available.
       */
      getEngagementId: async () => connection.sendRequest("session.telemetry.getEngagementId", { sessionId }),
      /**
       * Sets feature override key/value pairs to attach to subsequent telemetry events for the session.
       *
       * @param params Feature override key/value pairs to attach to subsequent telemetry events from this session.
       */
      setFeatureOverrides: async (params) => connection.sendRequest("session.telemetry.setFeatureOverrides", { sessionId, ...params })
    },
    /** @experimental */
    ui: {
      /**
       * Runs a transient no-tools model query against the current conversation context.
       *
       * @param params Transient question to answer without adding it to conversation history.
       *
       * @returns Transient answer generated from current conversation context.
       */
      ephemeralQuery: async (params) => connection.sendRequest("session.ui.ephemeralQuery", { sessionId, ...params }),
      /**
       * Requests structured input from a UI-capable client.
       *
       * @param params Prompt message and JSON schema describing the form fields to elicit from the user.
       *
       * @returns The elicitation response (accept with form values, decline, or cancel)
       */
      elicitation: async (params) => connection.sendRequest("session.ui.elicitation", { sessionId, ...params }),
      /**
       * Provides the user response for a pending elicitation request.
       *
       * @param params Pending elicitation request ID and the user's response (accept/decline/cancel + form values).
       *
       * @returns Indicates whether the elicitation response was accepted; false if it was already resolved by another client.
       */
      handlePendingElicitation: async (params) => connection.sendRequest("session.ui.handlePendingElicitation", { sessionId, ...params }),
      /**
       * Resolves a pending `user_input.requested` event with the user's response.
       *
       * @param params Request ID of a pending `user_input.requested` event and the user's response.
       *
       * @returns Indicates whether the pending UI request was resolved by this call.
       */
      handlePendingUserInput: async (params) => connection.sendRequest("session.ui.handlePendingUserInput", { sessionId, ...params }),
      /**
       * Resolves a pending `sampling.requested` event with a sampling result, or rejects it.
       *
       * @param params Request ID of a pending `sampling.requested` event and an optional sampling result payload (omit to reject).
       *
       * @returns Indicates whether the pending UI request was resolved by this call.
       */
      handlePendingSampling: async (params) => connection.sendRequest("session.ui.handlePendingSampling", { sessionId, ...params }),
      /**
       * Resolves a pending `auto_mode_switch.requested` event with the user's accept/decline decision.
       *
       * @param params Request ID of a pending `auto_mode_switch.requested` event and the user's response.
       *
       * @returns Indicates whether the pending UI request was resolved by this call.
       */
      handlePendingAutoModeSwitch: async (params) => connection.sendRequest("session.ui.handlePendingAutoModeSwitch", { sessionId, ...params }),
      /**
       * Resolves a pending `exit_plan_mode.requested` event with the user's response.
       *
       * @param params Request ID of a pending `exit_plan_mode.requested` event and the user's response.
       *
       * @returns Indicates whether the pending UI request was resolved by this call.
       */
      handlePendingExitPlanMode: async (params) => connection.sendRequest("session.ui.handlePendingExitPlanMode", { sessionId, ...params }),
      /**
       * Registers an in-process handler for auto-mode-switch requests so the server bridge skips dispatch.
       *
       * @returns Register an in-process handler for `auto_mode_switch.requested` events. The caller still attaches the actual listener via the standard event-subscription mechanism; this registration solely tells the server bridge to skip its own dispatch (so a remote client doesn't race the in-process handler for the same requestId).
       */
      registerDirectAutoModeSwitchHandler: async () => connection.sendRequest("session.ui.registerDirectAutoModeSwitchHandler", { sessionId }),
      /**
       * Unregisters a previously-registered in-process auto-mode-switch handler by its opaque handle.
       *
       * @param params Opaque handle previously returned by `registerDirectAutoModeSwitchHandler` to release.
       *
       * @returns Indicates whether the handle was active and the registration count was decremented.
       */
      unregisterDirectAutoModeSwitchHandler: async (params) => connection.sendRequest("session.ui.unregisterDirectAutoModeSwitchHandler", { sessionId, ...params })
    },
    /** @experimental */
    permissions: {
      /**
       * Replaces selected permission policy fields (rules, paths, URLs, exclusions, allow-all flags) on the session.
       *
       * @param params Patch of permission policy fields to apply (omit a field to leave it unchanged).
       *
       * @returns Indicates whether the operation succeeded.
       */
      configure: async (params) => connection.sendRequest("session.permissions.configure", { sessionId, ...params }),
      /**
       * Provides a decision for a pending tool permission request.
       *
       * @param params Pending permission request ID and the decision to apply (approve/reject and scope).
       *
       * @returns Indicates whether the permission decision was applied; false when the request was already resolved.
       */
      handlePendingPermissionRequest: async (params) => connection.sendRequest("session.permissions.handlePendingPermissionRequest", { sessionId, ...params }),
      /**
       * Reconstructs the set of pending tool permission requests from the session's event history.
       *
       * @returns List of pending permission requests reconstructed from event history.
       */
      pendingRequests: async () => connection.sendRequest("session.permissions.pendingRequests", { sessionId }),
      /**
       * Enables or disables automatic approval of tool permission requests for the session.
       *
       * @param params Allow-all toggle for tool permission requests, with an optional telemetry source.
       *
       * @returns Indicates whether the operation succeeded.
       */
      setApproveAll: async (params) => connection.sendRequest("session.permissions.setApproveAll", { sessionId, ...params }),
      /**
       * Enables or disables full allow-all permissions (tools, paths, and URLs) for the session. Used by attach-mode clients (e.g. LocalRpcSession's `/allow-all` forwarder) to flip the target session's permission state. Unlike `setApproveAll`, this swaps in the unrestricted path and URL managers and emits `session.permissions_changed` on transition. The result returns the authoritative post-mutation state so callers can update their local mirrors without racing the `session.permissions_changed` notification on the same wire.
       *
       * @param params Whether to enable full allow-all permissions for the session.
       *
       * @returns Indicates whether the operation succeeded and reports the post-mutation state.
       */
      setAllowAll: async (params) => connection.sendRequest("session.permissions.setAllowAll", { sessionId, ...params }),
      /**
       * Returns whether full allow-all permissions are currently active for the session.
       *
       * @returns Current full allow-all permission state.
       */
      getAllowAll: async () => connection.sendRequest("session.permissions.getAllowAll", { sessionId }),
      /**
       * Adds or removes session-scoped or location-scoped permission rules.
       *
       * @param params Scope and add/remove instructions for modifying session- or location-scoped permission rules.
       *
       * @returns Indicates whether the operation succeeded.
       */
      modifyRules: async (params) => connection.sendRequest("session.permissions.modifyRules", { sessionId, ...params }),
      /**
       * Sets whether the client wants permission prompts bridged into session events.
       *
       * @param params Toggles whether permission prompts should be bridged into session events for this client.
       *
       * @returns Indicates whether the operation succeeded.
       */
      setRequired: async (params) => connection.sendRequest("session.permissions.setRequired", { sessionId, ...params }),
      /**
       * Clears session-scoped tool permission approvals.
       *
       * @returns Indicates whether the operation succeeded.
       */
      resetSessionApprovals: async () => connection.sendRequest("session.permissions.resetSessionApprovals", { sessionId }),
      /**
       * Notifies the runtime that a permission prompt UI has been shown to the user.
       *
       * @param params Notification payload describing the permission prompt that the client just rendered.
       *
       * @returns Indicates whether the operation succeeded.
       */
      notifyPromptShown: async (params) => connection.sendRequest("session.permissions.notifyPromptShown", { sessionId, ...params }),
      /** @experimental */
      paths: {
        /**
         * Returns the session's allowed directories and primary working directory.
         *
         * @returns Snapshot of the session's allow-listed directories and primary working directory.
         */
        list: async () => connection.sendRequest("session.permissions.paths.list", { sessionId }),
        /**
         * Adds a directory to the session's allow-list.
         *
         * @param params Directory path to add to the session's allowed directories.
         *
         * @returns Indicates whether the operation succeeded.
         */
        add: async (params) => connection.sendRequest("session.permissions.paths.add", { sessionId, ...params }),
        /**
         * Updates the session's primary working directory used by the permission policy.
         *
         * @param params Directory path to set as the session's new primary working directory.
         *
         * @returns Indicates whether the operation succeeded.
         */
        updatePrimary: async (params) => connection.sendRequest("session.permissions.paths.updatePrimary", { sessionId, ...params }),
        /**
         * Reports whether a path falls within any of the session's allowed directories.
         *
         * @param params Path to evaluate against the session's allowed directories.
         *
         * @returns Indicates whether the supplied path is within the session's allowed directories.
         */
        isPathWithinAllowedDirectories: async (params) => connection.sendRequest("session.permissions.paths.isPathWithinAllowedDirectories", { sessionId, ...params }),
        /**
         * Reports whether a path falls within the session's workspace (primary) directory.
         *
         * @param params Path to evaluate against the session's workspace (primary) directory.
         *
         * @returns Indicates whether the supplied path is within the session's workspace directory.
         */
        isPathWithinWorkspace: async (params) => connection.sendRequest("session.permissions.paths.isPathWithinWorkspace", { sessionId, ...params })
      },
      /** @experimental */
      locations: {
        /**
         * Resolves the permission location key and type for a working directory.
         *
         * @param params Working directory to resolve into a location-permissions key.
         *
         * @returns Resolved location-permissions key and type.
         */
        resolve: async (params) => connection.sendRequest("session.permissions.locations.resolve", { sessionId, ...params }),
        /**
         * Applies persisted location-scoped tool approvals and allowed directories for a working directory to this session's permission service.
         *
         * @param params Working directory to load persisted location permissions for.
         *
         * @returns Summary of persisted location permissions applied to the session.
         */
        apply: async (params) => connection.sendRequest("session.permissions.locations.apply", { sessionId, ...params }),
        /**
         * Persists a tool approval for a permission location and applies its rules to this session's live permission service.
         *
         * @param params Location-scoped tool approval to persist.
         *
         * @returns Indicates whether the operation succeeded.
         */
        addToolApproval: async (params) => connection.sendRequest("session.permissions.locations.addToolApproval", { sessionId, ...params })
      },
      /** @experimental */
      folderTrust: {
        /**
         * Reports whether a folder is trusted according to the user's folder trust state.
         *
         * @param params Folder path to check for trust.
         *
         * @returns Folder trust check result.
         */
        isTrusted: async (params) => connection.sendRequest("session.permissions.folderTrust.isTrusted", { sessionId, ...params }),
        /**
         * Adds a folder to the user's trusted folders list.
         *
         * @param params Folder path to add to trusted folders.
         *
         * @returns Indicates whether the operation succeeded.
         */
        addTrusted: async (params) => connection.sendRequest("session.permissions.folderTrust.addTrusted", { sessionId, ...params })
      },
      /** @experimental */
      urls: {
        /**
         * Toggles the runtime's URL-permission policy between unrestricted and restricted modes.
         *
         * @param params Whether the URL-permission policy should run in unrestricted mode.
         *
         * @returns Indicates whether the operation succeeded.
         */
        setUnrestrictedMode: async (params) => connection.sendRequest("session.permissions.urls.setUnrestrictedMode", { sessionId, ...params })
      }
    },
    /**
     * Emits a user-visible session log event.
     *
     * @param params Message text, optional severity level, persistence flag, optional follow-up URL, and optional tip.
     *
     * @returns Identifier of the session event that was emitted for the log message.
     *
     * @experimental
     */
    log: async (params) => connection.sendRequest("session.log", { sessionId, ...params }),
    /** @experimental */
    metadata: {
      /**
       * Returns a snapshot of the session's identifying metadata, mode, agent, and remote info.
       *
       * @returns Point-in-time snapshot of slow-changing session identifier and state fields
       */
      snapshot: async () => connection.sendRequest("session.metadata.snapshot", { sessionId }),
      /**
       * Reports whether the local session is currently processing user/agent messages.
       *
       * @returns Indicates whether the local session is currently processing a turn or background continuation.
       */
      isProcessing: async () => connection.sendRequest("session.metadata.isProcessing", { sessionId }),
      /**
       * Returns a snapshot of activity flags for the session.
       *
       * @returns Current activity flags for the session.
       */
      activity: async () => connection.sendRequest("session.metadata.activity", { sessionId }),
      /**
       * Returns the token breakdown for the session's current context window for a given model.
       *
       * @param params Model identifier and token limits used to compute the context-info breakdown.
       *
       * @returns Token breakdown for the session's current context window, or null if uninitialized.
       */
      contextInfo: async (params) => connection.sendRequest("session.metadata.contextInfo", { sessionId, ...params }),
      /**
       * Records a working-directory/git context change and emits a `session.context_changed` event.
       *
       * @param params Updated working-directory/git context to record on the session.
       *
       * @returns Notify the session that its working directory context has changed. Emits a `session.context_changed` event so consumers (telemetry, OTel tracker, ACP, the timeline UI) can react. Use this when the host has detected a cwd/branch/repo change outside the session's normal lifecycle (e.g., after a shell command in interactive mode).
       */
      recordContextChange: async (params) => connection.sendRequest("session.metadata.recordContextChange", { sessionId, ...params }),
      /**
       * Updates the session's recorded working directory.
       *
       * @param params Absolute path to set as the session's new working directory.
       *
       * @returns Update the session's working directory. Used by the host when the user explicitly changes cwd (e.g., the `/cd` slash command). The host is responsible for `process.chdir` and any related side-effects (file index, etc.); this method only updates the session's own recorded path.
       */
      setWorkingDirectory: async (params) => connection.sendRequest("session.metadata.setWorkingDirectory", { sessionId, ...params }),
      /**
       * Re-tokenizes the session's existing messages against a model and returns aggregate token totals.
       *
       * @param params Model identifier to use when re-tokenizing the session's existing messages.
       *
       * @returns Re-tokenize the session's existing messages against `modelId` and return the token totals. Useful for hosts that want an initial estimate of context usage on session resume, before the next agent turn fires `session.context_info_changed` events. Returns zeros for an empty session.
       */
      recomputeContextTokens: async (params) => connection.sendRequest("session.metadata.recomputeContextTokens", { sessionId, ...params })
    },
    /** @experimental */
    shell: {
      /**
       * Starts a shell command and streams output through session notifications.
       *
       * @param params Shell command to run, with optional working directory and timeout in milliseconds.
       *
       * @returns Identifier of the spawned process, used to correlate streamed output and exit notifications.
       */
      exec: async (params) => connection.sendRequest("session.shell.exec", { sessionId, ...params }),
      /**
       * Sends a signal to a shell process previously started via "shell.exec".
       *
       * @param params Identifier of a process previously returned by "shell.exec" and the signal to send.
       *
       * @returns Indicates whether the signal was delivered; false if the process was unknown or already exited.
       */
      kill: async (params) => connection.sendRequest("session.shell.kill", { sessionId, ...params }),
      /**
       * Executes a user-requested shell command through the session runtime.
       *
       * @param params User-requested shell command and cancellation handle.
       *
       * @returns Result of a user-requested shell command.
       */
      executeUserRequested: async (params) => connection.sendRequest("session.shell.executeUserRequested", { sessionId, ...params }),
      /**
       * Cancels a user-requested shell command by request ID.
       *
       * @param params User-requested shell execution cancellation handle.
       *
       * @returns Cancellation result for a user-requested shell command.
       */
      cancelUserRequested: async (params) => connection.sendRequest("session.shell.cancelUserRequested", { sessionId, ...params })
    },
    /** @experimental */
    history: {
      /**
       * Compacts the session history to reduce context usage.
       *
       * @param params Optional compaction parameters.
       *
       * @returns Compaction outcome with the number of tokens and messages removed, summary text, and the resulting context window breakdown.
       */
      compact: async (params) => connection.sendRequest("session.history.compact", { sessionId, ...params }),
      /**
       * Truncates persisted session history to a specific event.
       *
       * @param params Identifier of the event to truncate to; this event and all later events are removed.
       *
       * @returns Number of events that were removed by the truncation.
       */
      truncate: async (params) => connection.sendRequest("session.history.truncate", { sessionId, ...params }),
      /**
       * Cancels any in-progress background compaction on a local session.
       *
       * @returns Indicates whether an in-progress background compaction was cancelled.
       */
      cancelBackgroundCompaction: async () => connection.sendRequest("session.history.cancelBackgroundCompaction", { sessionId }),
      /**
       * Aborts any in-progress manual compaction on a local session.
       *
       * @returns Indicates whether an in-progress manual compaction was aborted.
       */
      abortManualCompaction: async () => connection.sendRequest("session.history.abortManualCompaction", { sessionId }),
      /**
       * Produces a markdown summary of the session's conversation context for hand-off scenarios.
       *
       * @returns Markdown summary of the conversation context (empty when not available).
       */
      summarizeForHandoff: async () => connection.sendRequest("session.history.summarizeForHandoff", { sessionId })
    },
    /** @experimental */
    queue: {
      /**
       * Returns the local session's pending user-facing queued items and steering messages.
       *
       * @returns Snapshot of the session's pending queued items and immediate-steering messages.
       */
      pendingItems: async () => connection.sendRequest("session.queue.pendingItems", { sessionId }),
      /**
       * Removes the most recently queued user-facing item (LIFO).
       *
       * @returns Indicates whether a user-facing pending item was removed.
       */
      removeMostRecent: async () => connection.sendRequest("session.queue.removeMostRecent", { sessionId }),
      /**
       * Clears all pending queued items on the local session.
       */
      clear: async () => connection.sendRequest("session.queue.clear", { sessionId })
    },
    /** @experimental */
    eventLog: {
      /**
       * Reads a batch of session events from a cursor, optionally waiting for new events.
       *
       * @param params Cursor, batch size, and optional long-poll/filter parameters for reading session events.
       *
       * @returns Batch of session events returned by a read, with cursor and continuation metadata.
       */
      read: async (params) => connection.sendRequest("session.eventLog.read", { sessionId, ...params }),
      /**
       * Returns a snapshot of the current tail cursor without consuming events.
       *
       * @returns Snapshot of the current tail cursor without returning any events. Use this when a consumer wants to subscribe to live events going forward without first paginating through the entire persisted history (which would happen if `read` were called without a cursor on a long-lived session).
       */
      tail: async () => connection.sendRequest("session.eventLog.tail", { sessionId }),
      /**
       * Registers consumer interest in an event type for runtime gating purposes.
       *
       * @param params Event type to register consumer interest for, used by runtime gating logic.
       *
       * @returns Opaque handle representing an event-type interest registration.
       */
      registerInterest: async (params) => connection.sendRequest("session.eventLog.registerInterest", { sessionId, ...params }),
      /**
       * Releases a consumer's previously-registered interest in an event type.
       *
       * @param params Opaque handle previously returned by `registerInterest` to release.
       *
       * @returns Indicates whether the operation succeeded.
       */
      releaseInterest: async (params) => connection.sendRequest("session.eventLog.releaseInterest", { sessionId, ...params })
    },
    /** @experimental */
    usage: {
      /**
       * Gets accumulated usage metrics for the session.
       *
       * @returns Accumulated session usage metrics, including premium request cost, token counts, model breakdown, and code-change totals.
       */
      getMetrics: async () => connection.sendRequest("session.usage.getMetrics", { sessionId })
    },
    /** @experimental */
    remote: {
      /**
       * Enables remote session export or steering.
       *
       * @param params Optional remote session mode ("off", "export", or "on"); defaults to enabling both export and remote steering.
       *
       * @returns GitHub URL for the session and a flag indicating whether remote steering is enabled.
       */
      enable: async (params) => connection.sendRequest("session.remote.enable", { sessionId, ...params }),
      /**
       * Disables remote session export and steering.
       */
      disable: async () => connection.sendRequest("session.remote.disable", { sessionId }),
      /**
       * Persists a remote-steerability change emitted by the host as a session event.
       *
       * @param params New remote-steerability state to persist as a `session.remote_steerable_changed` event.
       *
       * @returns Persist a steerability change as a `session.remote_steerable_changed` event. Used by the host (CLI / SDK consumer) when it has just finished enabling or disabling steering on a remote exporter that the runtime does not directly own.
       */
      notifySteerableChanged: async (params) => connection.sendRequest("session.remote.notifySteerableChanged", { sessionId, ...params })
    },
    /** @experimental */
    schedule: {
      /**
       * Lists the session's currently active scheduled prompts.
       *
       * @returns Snapshot of the currently active recurring prompts for this session.
       */
      list: async () => connection.sendRequest("session.schedule.list", { sessionId }),
      /**
       * Removes a scheduled prompt by id.
       *
       * @param params Identifier of the scheduled prompt to remove.
       *
       * @returns Remove a scheduled prompt by id. The result entry is omitted if the id was unknown.
       */
      stop: async (params) => connection.sendRequest("session.schedule.stop", { sessionId, ...params })
    }
  };
}
function registerClientSessionApiHandlers(connection, getHandlers) {
  connection.onRequest("sessionFs.readFile", async (params) => {
    const handler = getHandlers(params.sessionId).sessionFs;
    if (!handler) throw new Error(`No sessionFs handler registered for session: ${params.sessionId}`);
    return handler.readFile(params);
  });
  connection.onRequest("sessionFs.writeFile", async (params) => {
    const handler = getHandlers(params.sessionId).sessionFs;
    if (!handler) throw new Error(`No sessionFs handler registered for session: ${params.sessionId}`);
    return handler.writeFile(params);
  });
  connection.onRequest("sessionFs.appendFile", async (params) => {
    const handler = getHandlers(params.sessionId).sessionFs;
    if (!handler) throw new Error(`No sessionFs handler registered for session: ${params.sessionId}`);
    return handler.appendFile(params);
  });
  connection.onRequest("sessionFs.exists", async (params) => {
    const handler = getHandlers(params.sessionId).sessionFs;
    if (!handler) throw new Error(`No sessionFs handler registered for session: ${params.sessionId}`);
    return handler.exists(params);
  });
  connection.onRequest("sessionFs.stat", async (params) => {
    const handler = getHandlers(params.sessionId).sessionFs;
    if (!handler) throw new Error(`No sessionFs handler registered for session: ${params.sessionId}`);
    return handler.stat(params);
  });
  connection.onRequest("sessionFs.mkdir", async (params) => {
    const handler = getHandlers(params.sessionId).sessionFs;
    if (!handler) throw new Error(`No sessionFs handler registered for session: ${params.sessionId}`);
    return handler.mkdir(params);
  });
  connection.onRequest("sessionFs.readdir", async (params) => {
    const handler = getHandlers(params.sessionId).sessionFs;
    if (!handler) throw new Error(`No sessionFs handler registered for session: ${params.sessionId}`);
    return handler.readdir(params);
  });
  connection.onRequest("sessionFs.readdirWithTypes", async (params) => {
    const handler = getHandlers(params.sessionId).sessionFs;
    if (!handler) throw new Error(`No sessionFs handler registered for session: ${params.sessionId}`);
    return handler.readdirWithTypes(params);
  });
  connection.onRequest("sessionFs.rm", async (params) => {
    const handler = getHandlers(params.sessionId).sessionFs;
    if (!handler) throw new Error(`No sessionFs handler registered for session: ${params.sessionId}`);
    return handler.rm(params);
  });
  connection.onRequest("sessionFs.rename", async (params) => {
    const handler = getHandlers(params.sessionId).sessionFs;
    if (!handler) throw new Error(`No sessionFs handler registered for session: ${params.sessionId}`);
    return handler.rename(params);
  });
  connection.onRequest("sessionFs.sqliteQuery", async (params) => {
    const handler = getHandlers(params.sessionId).sessionFs;
    if (!handler) throw new Error(`No sessionFs handler registered for session: ${params.sessionId}`);
    return handler.sqliteQuery(params);
  });
  connection.onRequest("sessionFs.sqliteExists", async (params) => {
    const handler = getHandlers(params.sessionId).sessionFs;
    if (!handler) throw new Error(`No sessionFs handler registered for session: ${params.sessionId}`);
    return handler.sqliteExists(params);
  });
  connection.onRequest("canvas.open", async (params) => {
    const handler = getHandlers(params.sessionId).canvas;
    if (!handler) throw new Error(`No canvas handler registered for session: ${params.sessionId}`);
    return handler.open(params);
  });
  connection.onRequest("canvas.close", async (params) => {
    const handler = getHandlers(params.sessionId).canvas;
    if (!handler) throw new Error(`No canvas handler registered for session: ${params.sessionId}`);
    return handler.close(params);
  });
  connection.onRequest("canvas.action.invoke", async (params) => {
    const handler = getHandlers(params.sessionId).canvas;
    if (!handler) throw new Error(`No canvas handler registered for session: ${params.sessionId}`);
    return handler.invoke(params);
  });
}

// node_modules/.pnpm/@github+copilot-sdk@1.0.3/node_modules/@github/copilot-sdk/dist/sdkProtocolVersion.js
var SDK_PROTOCOL_VERSION = 3;
function getSdkProtocolVersion() {
  return SDK_PROTOCOL_VERSION;
}

// node_modules/.pnpm/@github+copilot-sdk@1.0.3/node_modules/@github/copilot-sdk/dist/session.js
var import_node = __toESM(require_node(), 1);

// node_modules/.pnpm/@github+copilot-sdk@1.0.3/node_modules/@github/copilot-sdk/dist/canvas.js
var CanvasError = class _CanvasError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "CanvasError";
  }
  code;
  /** Default error when an action is declared but no `handler` is wired. */
  static noHandler() {
    return new _CanvasError(
      "canvas_action_no_handler",
      "No handler implemented for this canvas action"
    );
  }
};
var Canvas = class {
  declaration;
  open;
  onClose;
  /** @internal */
  actionHandlers;
  /** @internal */
  constructor(options) {
    const actionHandlers = /* @__PURE__ */ new Map();
    const wireActions = options.actions?.map(
      ({ handler, ...wire }) => {
        actionHandlers.set(wire.name, handler);
        return wire;
      }
    );
    this.declaration = {
      id: options.id,
      displayName: options.displayName,
      description: options.description,
      inputSchema: options.inputSchema,
      actions: wireActions
    };
    this.open = options.open;
    this.onClose = options.onClose;
    this.actionHandlers = actionHandlers;
  }
};
function createCanvas(options) {
  return new Canvas(options);
}

// node_modules/.pnpm/@github+copilot-sdk@1.0.3/node_modules/@github/copilot-sdk/dist/telemetry.js
async function getTraceContext(provider) {
  if (!provider) return {};
  try {
    return await provider() ?? {};
  } catch {
    return {};
  }
}

// node_modules/.pnpm/@github+copilot-sdk@1.0.3/node_modules/@github/copilot-sdk/dist/session.js
function deserializeHookInput(raw) {
  if (!raw || typeof raw !== "object" || typeof raw.timestamp !== "number") {
    return raw;
  }
  const obj = raw;
  const { cwd, ...rest } = obj;
  return { ...rest, timestamp: new Date(obj.timestamp), workingDirectory: cwd };
}
function isOpenCanvasInstance(value) {
  if (!value || typeof value !== "object") {
    return false;
  }
  const instance = value;
  return typeof instance.instanceId === "string" && instance.instanceId.length > 0 && typeof instance.extensionId === "string" && instance.extensionId.length > 0 && typeof instance.canvasId === "string" && instance.canvasId.length > 0 && typeof instance.reopen === "boolean" && (instance.availability === "ready" || instance.availability === "stale");
}
var CopilotSession = class {
  /**
   * Creates a new CopilotSession instance.
   *
   * @param sessionId - The unique identifier for this session
   * @param connection - The JSON-RPC message connection to the Copilot CLI
   * @param workspacePath - Path to the session workspace directory (when infinite sessions enabled)
   * @param traceContextProvider - Optional callback to get W3C Trace Context for outbound RPCs
   * @internal This constructor is internal. Use {@link CopilotClient.createSession} to create sessions.
   */
  constructor(sessionId, connection, _workspacePath, traceContextProvider) {
    this.sessionId = sessionId;
    this.connection = connection;
    this._workspacePath = _workspacePath;
    this.traceContextProvider = traceContextProvider;
  }
  sessionId;
  connection;
  _workspacePath;
  eventHandlers = /* @__PURE__ */ new Set();
  typedEventHandlers = /* @__PURE__ */ new Map();
  toolHandlers = /* @__PURE__ */ new Map();
  canvases = /* @__PURE__ */ new Map();
  commandHandlers = /* @__PURE__ */ new Map();
  permissionHandler;
  userInputHandler;
  elicitationHandler;
  exitPlanModeHandler;
  autoModeSwitchHandler;
  hooks;
  transformCallbacks;
  _rpc = null;
  traceContextProvider;
  _capabilities = {};
  openCanvasInstances = [];
  /** @internal Client session API handlers, populated by CopilotClient during create/resume. */
  clientSessionApis = {};
  /**
   * Typed session-scoped RPC methods.
   */
  get rpc() {
    if (!this._rpc) {
      this._rpc = createSessionRpc(this.connection, this.sessionId);
    }
    return this._rpc;
  }
  /**
   * Path to the session workspace directory when infinite sessions are enabled.
   * Contains checkpoints/, plan.md, and files/ subdirectories.
   * Undefined if infinite sessions are disabled.
   */
  get workspacePath() {
    return this._workspacePath;
  }
  /**
   * Host capabilities reported when the session was created or resumed.
   * Use this to check feature support before calling capability-gated APIs.
   */
  get capabilities() {
    return this._capabilities;
  }
  /**
   * Interactive UI methods for showing dialogs to the user.
   * Only available when the CLI host supports elicitation
   * (`session.capabilities.ui?.elicitation === true`).
   *
   * @example
   * ```typescript
   * if (session.capabilities.ui?.elicitation) {
   *   const ok = await session.ui.confirm("Deploy to production?");
   * }
   * ```
   */
  get ui() {
    return {
      elicitation: (params) => this._elicitation(params),
      confirm: (message) => this._confirm(message),
      select: (message, options) => this._select(message, options),
      input: (message, options) => this._input(message, options)
    };
  }
  async send(optionsOrPrompt) {
    const options = typeof optionsOrPrompt === "string" ? { prompt: optionsOrPrompt } : optionsOrPrompt;
    const response = await this.connection.sendRequest("session.send", {
      ...await getTraceContext(this.traceContextProvider),
      sessionId: this.sessionId,
      prompt: options.prompt,
      displayPrompt: options.displayPrompt,
      attachments: options.attachments,
      mode: options.mode,
      agentMode: options.agentMode,
      requestHeaders: options.requestHeaders
    });
    return response.messageId;
  }
  async sendAndWait(optionsOrPrompt, timeout) {
    const options = typeof optionsOrPrompt === "string" ? { prompt: optionsOrPrompt } : optionsOrPrompt;
    const effectiveTimeout = timeout ?? 6e4;
    let resolveIdle;
    let rejectWithError;
    const idlePromise = new Promise((resolve, reject) => {
      resolveIdle = resolve;
      rejectWithError = reject;
    });
    let lastAssistantMessage;
    const unsubscribe = this.on((event) => {
      if (event.type === "assistant.message") {
        lastAssistantMessage = event;
      } else if (event.type === "session.idle") {
        resolveIdle();
      } else if (event.type === "session.error") {
        const error = new Error(event.data.message);
        error.stack = event.data.stack;
        rejectWithError(error);
      }
    });
    let timeoutId;
    try {
      await this.send(options);
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(
          () => reject(
            new Error(
              `Timeout after ${effectiveTimeout}ms waiting for session.idle`
            )
          ),
          effectiveTimeout
        );
      });
      await Promise.race([idlePromise, timeoutPromise]);
      return lastAssistantMessage;
    } finally {
      if (timeoutId !== void 0) {
        clearTimeout(timeoutId);
      }
      unsubscribe();
    }
  }
  on(eventTypeOrHandler, handler) {
    if (typeof eventTypeOrHandler === "string" && handler) {
      const eventType = eventTypeOrHandler;
      if (!this.typedEventHandlers.has(eventType)) {
        this.typedEventHandlers.set(eventType, /* @__PURE__ */ new Set());
      }
      const storedHandler = handler;
      this.typedEventHandlers.get(eventType).add(storedHandler);
      return () => {
        const handlers = this.typedEventHandlers.get(eventType);
        if (handlers) {
          handlers.delete(storedHandler);
        }
      };
    }
    const wildcardHandler = eventTypeOrHandler;
    this.eventHandlers.add(wildcardHandler);
    return () => {
      this.eventHandlers.delete(wildcardHandler);
    };
  }
  /**
   * Dispatches an event to all registered handlers.
   * Also handles broadcast request events internally (external tool calls, permissions).
   *
   * @param event - The session event to dispatch
   * @internal This method is for internal use by the SDK.
   */
  _dispatchEvent(event) {
    this._handleBroadcastEvent(event);
    const typedHandlers = this.typedEventHandlers.get(event.type);
    if (typedHandlers) {
      for (const handler of typedHandlers) {
        try {
          handler(event);
        } catch (_error) {
        }
      }
    }
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (_error) {
      }
    }
  }
  /**
   * Handles broadcast request events by executing local handlers and responding via RPC.
   * Handlers are dispatched as fire-and-forget — rejections propagate as unhandled promise
   * rejections, consistent with standard EventEmitter / event handler semantics.
   * @internal
   */
  _handleBroadcastEvent(event) {
    if (event.type === "external_tool.requested") {
      const { requestId, toolName } = event.data;
      const args = event.data.arguments;
      const toolCallId = event.data.toolCallId;
      const traceparent = event.data.traceparent;
      const tracestate = event.data.tracestate;
      const handler = this.toolHandlers.get(toolName);
      if (handler) {
        void this._executeToolAndRespond(
          requestId,
          toolName,
          toolCallId,
          args,
          handler,
          traceparent,
          tracestate
        );
      }
    } else if (event.type === "permission.requested") {
      const { requestId, permissionRequest, resolvedByHook } = event.data;
      if (resolvedByHook) {
        return;
      }
      if (this.permissionHandler) {
        void this._executePermissionAndRespond(requestId, permissionRequest);
      }
    } else if (event.type === "command.execute") {
      const { requestId, commandName, command, args } = event.data;
      void this._executeCommandAndRespond(requestId, commandName, command, args);
    } else if (event.type === "elicitation.requested") {
      if (this.elicitationHandler) {
        const { message, requestedSchema, mode, elicitationSource, url, requestId } = event.data;
        void this._handleElicitationRequest(
          {
            sessionId: this.sessionId,
            message,
            requestedSchema,
            mode,
            elicitationSource,
            url
          },
          requestId
        );
      }
    } else if (event.type === "capabilities.changed") {
      this._capabilities = { ...this._capabilities, ...event.data };
    } else if (event.type === "session.canvas.opened") {
      this.upsertOpenCanvasFromEvent(event.data);
    } else if (event.type === "session.canvas.closed") {
      this.removeOpenCanvasFromEvent(event.data);
    }
  }
  upsertOpenCanvasFromEvent(data) {
    if (!isOpenCanvasInstance(data)) {
      console.warn("failed to deserialize session.canvas.opened payload");
      return;
    }
    this.upsertOpenCanvas(data);
  }
  removeOpenCanvasFromEvent(data) {
    if (!data || typeof data !== "object" || typeof data.instanceId !== "string" || data.instanceId.length === 0) {
      console.warn("failed to deserialize session.canvas.closed payload");
      return;
    }
    this.removeOpenCanvas(data.instanceId);
  }
  removeOpenCanvas(instanceId) {
    this.openCanvasInstances = this.openCanvasInstances.filter(
      (open) => open.instanceId !== instanceId
    );
  }
  upsertOpenCanvas(instance) {
    const index = this.openCanvasInstances.findIndex(
      (open) => open.instanceId === instance.instanceId
    );
    if (index >= 0) {
      this.openCanvasInstances[index] = instance;
    } else {
      this.openCanvasInstances.push(instance);
    }
  }
  /**
   * Executes a tool handler and sends the result back via RPC.
   * @internal
   */
  async _executeToolAndRespond(requestId, toolName, toolCallId, args, handler, traceparent, tracestate) {
    try {
      const rawResult = await handler(args, {
        sessionId: this.sessionId,
        toolCallId,
        toolName,
        arguments: args,
        traceparent,
        tracestate
      });
      let result;
      if (rawResult == null) {
        result = "";
      } else if (typeof rawResult === "string") {
        result = rawResult;
      } else if (isToolResultObject(rawResult)) {
        result = rawResult;
      } else {
        result = JSON.stringify(rawResult);
      }
      await this.rpc.tools.handlePendingToolCall({ requestId, result });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      try {
        await this.rpc.tools.handlePendingToolCall({ requestId, error: message });
      } catch (rpcError) {
        if (!(rpcError instanceof import_node.ConnectionError || rpcError instanceof import_node.ResponseError)) {
          throw rpcError;
        }
      }
    }
  }
  /**
   * Executes a permission handler and sends the result back via RPC.
   * @internal
   */
  async _executePermissionAndRespond(requestId, permissionRequest) {
    try {
      const result = await this.permissionHandler(permissionRequest, {
        sessionId: this.sessionId
      });
      if (result.kind === "no-result") {
        return;
      }
      await this.rpc.permissions.handlePendingPermissionRequest({ requestId, result });
    } catch (_error) {
      try {
        await this.rpc.permissions.handlePendingPermissionRequest({
          requestId,
          result: {
            kind: "user-not-available"
          }
        });
      } catch (rpcError) {
        if (!(rpcError instanceof import_node.ConnectionError || rpcError instanceof import_node.ResponseError)) {
          throw rpcError;
        }
      }
    }
  }
  /**
   * Executes a command handler and sends the result back via RPC.
   * @internal
   */
  async _executeCommandAndRespond(requestId, commandName, command, args) {
    const handler = this.commandHandlers.get(commandName);
    if (!handler) {
      try {
        await this.rpc.commands.handlePendingCommand({
          requestId,
          error: `Unknown command: ${commandName}`
        });
      } catch (rpcError) {
        if (!(rpcError instanceof import_node.ConnectionError || rpcError instanceof import_node.ResponseError)) {
          throw rpcError;
        }
      }
      return;
    }
    try {
      await handler({ sessionId: this.sessionId, command, commandName, args });
      await this.rpc.commands.handlePendingCommand({ requestId });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      try {
        await this.rpc.commands.handlePendingCommand({ requestId, error: message });
      } catch (rpcError) {
        if (!(rpcError instanceof import_node.ConnectionError || rpcError instanceof import_node.ResponseError)) {
          throw rpcError;
        }
      }
    }
  }
  /**
   * Registers custom tool handlers for this session.
   *
   * Tools with handlers allow the assistant to execute custom functions automatically.
   * Declaration-only tools are surfaced as events and left pending for the consumer.
   *
   * @param tools - An array of tool definitions with their handlers, or undefined to clear all tools
   * @internal This method is typically called internally when creating a session with tools.
   */
  registerTools(tools) {
    this.toolHandlers.clear();
    if (!tools) {
      return;
    }
    for (const tool of tools) {
      if (tool.handler) {
        this.toolHandlers.set(tool.name, tool.handler);
      }
    }
  }
  /**
   * Retrieves a registered tool handler by name.
   *
   * @param name - The name of the tool to retrieve
   * @returns The tool handler if found, or undefined
   * @internal This method is for internal use by the SDK.
   */
  getToolHandler(name) {
    return this.toolHandlers.get(name);
  }
  /**
   * Registers canvas declarations and handlers for this session.
   *
   * @param canvases - Canvases created via `createCanvas`, or undefined to clear all canvases
   * @internal Called by the SDK when creating/resuming a session with `canvases`.
   */
  registerCanvases(canvases) {
    this.canvases.clear();
    if (!canvases || canvases.length === 0) {
      delete this.clientSessionApis.canvas;
      return;
    }
    for (const canvas of canvases) {
      this.canvases.set(canvas.declaration.id, canvas);
    }
    const self = this;
    this.clientSessionApis.canvas = {
      async open(params) {
        const canvas = self.canvases.get(params.canvasId);
        if (!canvas) throw new Error(`No canvas registered with id "${params.canvasId}"`);
        try {
          return await canvas.open(params) ?? {};
        } catch (error) {
          throw toCanvasRpcError(error);
        }
      },
      async close(params) {
        const canvas = self.canvases.get(params.canvasId);
        if (!canvas) throw new Error(`No canvas registered with id "${params.canvasId}"`);
        try {
          if (canvas.onClose) {
            await canvas.onClose(params);
          }
        } catch (error) {
          throw toCanvasRpcError(error);
        }
      },
      async invoke(params) {
        const canvas = self.canvases.get(params.canvasId);
        if (!canvas) throw new Error(`No canvas registered with id "${params.canvasId}"`);
        const handler = canvas.actionHandlers.get(params.actionName);
        if (!handler) {
          throw new CanvasError(
            "canvas_action_no_handler",
            "No handler implemented for this canvas action"
          );
        }
        try {
          return await handler(params);
        } catch (error) {
          throw toCanvasRpcError(error);
        }
      }
    };
  }
  /**
   * Registers command handlers for this session.
   *
   * @param commands - An array of command definitions with handlers, or undefined to clear
   * @internal This method is typically called internally when creating/resuming a session.
   */
  registerCommands(commands) {
    this.commandHandlers.clear();
    if (!commands) {
      return;
    }
    for (const cmd of commands) {
      this.commandHandlers.set(cmd.name, cmd.handler);
    }
  }
  /**
   * Registers the elicitation handler for this session.
   *
   * @param handler - The handler to invoke when the server dispatches an elicitation request
   * @internal This method is typically called internally when creating/resuming a session.
   */
  registerElicitationHandler(handler) {
    this.elicitationHandler = handler;
  }
  /**
   * Registers the exit-plan-mode handler for this session.
   *
   * @param handler - The handler to invoke when the server dispatches an exit-plan-mode request
   * @internal This method is typically called internally when creating/resuming a session.
   */
  registerExitPlanModeHandler(handler) {
    this.exitPlanModeHandler = handler;
  }
  /**
   * Registers the auto-mode-switch handler for this session.
   *
   * @param handler - The handler to invoke when the server dispatches an auto-mode-switch request
   * @internal This method is typically called internally when creating/resuming a session.
   */
  registerAutoModeSwitchHandler(handler) {
    this.autoModeSwitchHandler = handler;
  }
  /**
   * Handles an elicitation.requested broadcast event.
   * Invokes the registered handler and responds via handlePendingElicitation RPC.
   * @internal
   */
  async _handleElicitationRequest(context, requestId) {
    if (!this.elicitationHandler) {
      return;
    }
    try {
      const result = await this.elicitationHandler(context);
      await this.rpc.ui.handlePendingElicitation({ requestId, result });
    } catch {
      try {
        await this.rpc.ui.handlePendingElicitation({
          requestId,
          result: { action: "cancel" }
        });
      } catch (rpcError) {
        if (!(rpcError instanceof import_node.ConnectionError || rpcError instanceof import_node.ResponseError)) {
          throw rpcError;
        }
      }
    }
  }
  /**
   * Handles an exitPlanMode.request callback from the runtime.
   * @internal
   */
  async _handleExitPlanModeRequest(request) {
    if (!this.exitPlanModeHandler) {
      return { approved: true };
    }
    return await this.exitPlanModeHandler(request, { sessionId: this.sessionId });
  }
  /**
   * Handles an autoModeSwitch.request callback from the runtime.
   * @internal
   */
  async _handleAutoModeSwitchRequest(request) {
    if (!this.autoModeSwitchHandler) {
      return "no";
    }
    return await this.autoModeSwitchHandler(request, { sessionId: this.sessionId });
  }
  /**
   * Sets the host capabilities for this session.
   *
   * @param capabilities - The capabilities object from the create/resume response
   * @internal This method is typically called internally when creating/resuming a session.
   */
  setCapabilities(capabilities) {
    this._capabilities = capabilities ?? {};
  }
  /**
   * Snapshot of canvas instances currently known to be open for this session.
   * Populated from the `session.resume` response and live `session.canvas.opened`
   * and `session.canvas.closed` events. Returns a defensive copy — mutating the
   * returned array has no effect on the session.
   */
  get openCanvases() {
    return [...this.openCanvasInstances];
  }
  /**
   * Sets the open-canvas snapshot for this session.
   *
   * @param instances - The `openCanvases` array from the `session.resume` response.
   * @internal This method is typically called internally when resuming a session.
   */
  setOpenCanvases(instances) {
    this.openCanvasInstances = [...instances];
  }
  assertElicitation() {
    if (!this._capabilities.ui?.elicitation) {
      throw new Error(
        "Elicitation is not supported by the host. Check session.capabilities.ui?.elicitation before calling UI methods."
      );
    }
  }
  async _elicitation(params) {
    this.assertElicitation();
    return this.rpc.ui.elicitation({
      message: params.message,
      requestedSchema: params.requestedSchema
    });
  }
  async _confirm(message) {
    this.assertElicitation();
    const result = await this.rpc.ui.elicitation({
      message,
      requestedSchema: {
        type: "object",
        properties: {
          confirmed: { type: "boolean", default: true }
        },
        required: ["confirmed"]
      }
    });
    return result.action === "accept" && result.content?.confirmed === true;
  }
  async _select(message, options) {
    this.assertElicitation();
    const result = await this.rpc.ui.elicitation({
      message,
      requestedSchema: {
        type: "object",
        properties: {
          selection: { type: "string", enum: options }
        },
        required: ["selection"]
      }
    });
    if (result.action === "accept" && result.content?.selection != null) {
      return result.content.selection;
    }
    return null;
  }
  async _input(message, options) {
    this.assertElicitation();
    const field = { type: "string" };
    if (options?.title) field.title = options.title;
    if (options?.description) field.description = options.description;
    if (options?.minLength != null) field.minLength = options.minLength;
    if (options?.maxLength != null) field.maxLength = options.maxLength;
    if (options?.format) field.format = options.format;
    if (options?.default != null) field.default = options.default;
    const result = await this.rpc.ui.elicitation({
      message,
      requestedSchema: {
        type: "object",
        properties: {
          value: field
        },
        required: ["value"]
      }
    });
    if (result.action === "accept" && result.content?.value != null) {
      return result.content.value;
    }
    return null;
  }
  /**
   * Registers a handler for permission requests.
   *
   * When the assistant needs permission to perform certain actions (e.g., file operations),
   * this handler is called to approve or deny the request.
   *
   * @param handler - The permission handler function, or undefined to remove the handler
   * @internal This method is typically called internally when creating a session.
   */
  registerPermissionHandler(handler) {
    this.permissionHandler = handler;
  }
  /**
   * Registers a user input handler for ask_user requests.
   *
   * When the agent needs input from the user (via ask_user tool),
   * this handler is called to provide the response.
   *
   * @param handler - The user input handler function, or undefined to remove the handler
   * @internal This method is typically called internally when creating a session.
   */
  registerUserInputHandler(handler) {
    this.userInputHandler = handler;
  }
  /**
   * Registers hook handlers for session lifecycle events.
   *
   * Hooks allow custom logic to be executed at various points during
   * the session lifecycle (before/after tool use, session start/end, etc.).
   *
   * @param hooks - The hook handlers object, or undefined to remove all hooks
   * @internal This method is typically called internally when creating a session.
   */
  registerHooks(hooks) {
    this.hooks = hooks;
  }
  /**
   * Registers transform callbacks for system message sections.
   *
   * @param callbacks - Map of section ID to transform callback, or undefined to clear
   * @internal This method is typically called internally when creating a session.
   */
  registerTransformCallbacks(callbacks) {
    this.transformCallbacks = callbacks;
  }
  /**
   * Handles a systemMessage.transform request from the runtime.
   * Dispatches each section to its registered transform callback.
   *
   * @param sections - Map of section IDs to their current rendered content
   * @returns A promise that resolves with the transformed sections
   * @internal This method is for internal use by the SDK.
   */
  async _handleSystemMessageTransform(sections) {
    const result = {};
    for (const [sectionId, { content }] of Object.entries(sections)) {
      const callback = this.transformCallbacks?.get(sectionId);
      if (callback) {
        try {
          const transformed = await callback(content);
          result[sectionId] = { content: transformed };
        } catch (_error) {
          result[sectionId] = { content };
        }
      } else {
        result[sectionId] = { content };
      }
    }
    return { sections: result };
  }
  /**
   * Handles a user input request from the Copilot CLI.
   *
   * @param request - The user input request data from the CLI
   * @returns A promise that resolves with the user's response
   * @internal This method is for internal use by the SDK.
   */
  async _handleUserInputRequest(request) {
    if (!this.userInputHandler) {
      throw new Error("User input requested but no handler registered");
    }
    try {
      const result = await this.userInputHandler(request, {
        sessionId: this.sessionId
      });
      return result;
    } catch (error) {
      throw error;
    }
  }
  /**
   * Handles a hooks invocation from the Copilot CLI.
   *
   * @param hookType - The type of hook being invoked
   * @param input - The input data for the hook
   * @returns A promise that resolves with the hook output, or undefined
   * @internal This method is for internal use by the SDK.
   */
  async _handleHooksInvoke(hookType, input) {
    if (!this.hooks) {
      return void 0;
    }
    const normalized = deserializeHookInput(input);
    const handlerMap = {
      preToolUse: this.hooks.onPreToolUse,
      preMcpToolCall: this.hooks.onPreMcpToolCall,
      postToolUse: this.hooks.onPostToolUse,
      postToolUseFailure: this.hooks.onPostToolUseFailure,
      userPromptSubmitted: this.hooks.onUserPromptSubmitted,
      sessionStart: this.hooks.onSessionStart,
      sessionEnd: this.hooks.onSessionEnd,
      errorOccurred: this.hooks.onErrorOccurred
    };
    const handler = handlerMap[hookType];
    if (!handler) {
      return void 0;
    }
    try {
      const result = await handler(normalized, { sessionId: this.sessionId });
      return result;
    } catch (_error) {
      return void 0;
    }
  }
  /**
   * Retrieves all events and messages from this session's history.
   *
   * This returns the complete conversation history including user messages,
   * assistant responses, tool executions, and other session events.
   *
   * @returns A promise that resolves with an array of all session events
   * @throws Error if the session has been disconnected or the connection fails
   *
   * @example
   * ```typescript
   * const events = await session.getEvents();
   * for (const event of events) {
   *   if (event.type === "assistant.message") {
   *     console.log("Assistant:", event.data.content);
   *   }
   * }
   * ```
   */
  async getEvents() {
    const response = await this.connection.sendRequest("session.getMessages", {
      sessionId: this.sessionId
    });
    return response.events;
  }
  /**
   * Disconnects this session and releases all in-memory resources (event handlers,
   * tool handlers, permission handlers).
   *
   * Session state on disk (conversation history, planning state, artifacts) is
   * preserved, so the conversation can be resumed later by calling
   * {@link CopilotClient.resumeSession} with the session ID. To permanently
   * remove all session data including files on disk, use
   * {@link CopilotClient.deleteSession} instead.
   *
   * After calling this method, the session object can no longer be used.
   *
   * @returns A promise that resolves when the session is disconnected
   * @throws Error if the connection fails
   *
   * @example
   * ```typescript
   * // Clean up when done — session can still be resumed later
   * await session.disconnect();
   * ```
   */
  async disconnect() {
    await this.connection.sendRequest("session.destroy", {
      sessionId: this.sessionId
    });
    this.eventHandlers.clear();
    this.typedEventHandlers.clear();
    this.toolHandlers.clear();
    this.permissionHandler = void 0;
    this.userInputHandler = void 0;
    this.elicitationHandler = void 0;
    this.exitPlanModeHandler = void 0;
    this.autoModeSwitchHandler = void 0;
  }
  /** Enables `await using session = ...` syntax for automatic cleanup. */
  async [Symbol.asyncDispose]() {
    return this.disconnect();
  }
  /**
   * Aborts the currently processing message in this session.
   *
   * Use this to cancel a long-running request. The session remains valid
   * and can continue to be used for new messages.
   *
   * @returns A promise that resolves when the abort request is acknowledged
   * @throws Error if the session has been disconnected or the connection fails
   *
   * @example
   * ```typescript
   * // Start a long-running request
   * const messagePromise = session.send({ prompt: "Write a very long story..." });
   *
   * // Abort after 5 seconds
   * setTimeout(async () => {
   *   await session.abort();
   * }, 5000);
   * ```
   */
  async abort() {
    await this.connection.sendRequest("session.abort", {
      sessionId: this.sessionId
    });
  }
  /**
   * Change the model for this session.
   * The new model takes effect for the next message. Conversation history is preserved.
   *
   * @param model - Model ID to switch to
   * @param options - Optional settings for the new model
   *
   * @example
   * ```typescript
   * await session.setModel("gpt-4.1");
   * await session.setModel("claude-sonnet-4.6", { reasoningEffort: "high" });
   * ```
   */
  async setModel(model, options) {
    await this.rpc.model.switchTo({ modelId: model, ...options });
  }
  /**
   * Log a message to the session timeline.
   * The message appears in the session event stream and is visible to SDK consumers
   * and (for non-ephemeral messages) persisted to the session event log on disk.
   *
   * @param message - Human-readable message text
   * @param options - Optional log level and ephemeral flag
   *
   * @example
   * ```typescript
   * await session.log("Processing started");
   * await session.log("Disk usage high", { level: "warning" });
   * await session.log("Connection failed", { level: "error" });
   * await session.log("Debug info", { ephemeral: true });
   * ```
   */
  async log(message, options) {
    await this.rpc.log({ message, ...options });
  }
};
function isToolResultObject(value) {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if (!("textResultForLlm" in value) || typeof value.textResultForLlm !== "string") {
    return false;
  }
  if (!("resultType" in value) || typeof value.resultType !== "string") {
    return false;
  }
  const allowedResultTypes = [
    "success",
    "failure",
    "rejected",
    "denied",
    "timeout"
  ];
  return allowedResultTypes.includes(value.resultType);
}
function toCanvasRpcError(error) {
  if (error instanceof import_node.ResponseError) return error;
  const code = error instanceof CanvasError ? error.code : "canvas_handler_error";
  const message = error instanceof Error ? error.message : String(error);
  return new import_node.ResponseError(import_node.ErrorCodes.InternalError, message, { code, message });
}

// node_modules/.pnpm/@github+copilot-sdk@1.0.3/node_modules/@github/copilot-sdk/dist/sessionFsProvider.js
function normalizeSqliteParams(params) {
  if (!params) {
    return void 0;
  }
  const normalized = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== void 0) {
      normalized[key] = value;
    }
  }
  return normalized;
}
function createSessionFsAdapter(provider) {
  return {
    readFile: async ({ path }) => {
      try {
        const content = await provider.readFile(path);
        return { content };
      } catch (err) {
        return { content: "", error: toSessionFsError(err) };
      }
    },
    writeFile: async ({ path, content, mode }) => {
      try {
        await provider.writeFile(path, content, mode);
        return void 0;
      } catch (err) {
        return toSessionFsError(err);
      }
    },
    appendFile: async ({ path, content, mode }) => {
      try {
        await provider.appendFile(path, content, mode);
        return void 0;
      } catch (err) {
        return toSessionFsError(err);
      }
    },
    exists: async ({ path }) => {
      try {
        return { exists: await provider.exists(path) };
      } catch {
        return { exists: false };
      }
    },
    stat: async ({ path }) => {
      try {
        return await provider.stat(path);
      } catch (err) {
        return {
          isFile: false,
          isDirectory: false,
          size: 0,
          mtime: (/* @__PURE__ */ new Date()).toISOString(),
          birthtime: (/* @__PURE__ */ new Date()).toISOString(),
          error: toSessionFsError(err)
        };
      }
    },
    mkdir: async ({ path, recursive, mode }) => {
      try {
        await provider.mkdir(path, recursive ?? false, mode);
        return void 0;
      } catch (err) {
        return toSessionFsError(err);
      }
    },
    readdir: async ({ path }) => {
      try {
        const entries = await provider.readdir(path);
        return { entries };
      } catch (err) {
        return { entries: [], error: toSessionFsError(err) };
      }
    },
    readdirWithTypes: async ({ path }) => {
      try {
        const entries = await provider.readdirWithTypes(path);
        return { entries };
      } catch (err) {
        return { entries: [], error: toSessionFsError(err) };
      }
    },
    rm: async ({ path, recursive, force }) => {
      try {
        await provider.rm(path, recursive ?? false, force ?? false);
        return void 0;
      } catch (err) {
        return toSessionFsError(err);
      }
    },
    rename: async ({ src, dest }) => {
      try {
        await provider.rename(src, dest);
        return void 0;
      } catch (err) {
        return toSessionFsError(err);
      }
    },
    // Unlike the FS methods above, SQLite methods let errors propagate to the JSON-RPC layer
    // rather than catching and mapping via toSessionFsError. The FS error mapping is specifically
    // for translating Node.js errno codes (e.g., ENOENT) into SessionFsError, which isn't
    // meaningful for SQL errors. Letting exceptions propagate preserves the original error
    // message in the JSON-RPC error response.
    sqliteQuery: async ({ queryType, query, params: bindParams }) => {
      if (!provider.sqlite) {
        throw new Error("SQLite is not supported by this provider");
      }
      const result = await provider.sqlite.query(
        queryType,
        query,
        normalizeSqliteParams(bindParams)
      );
      return result ?? { rows: [], columns: [], rowsAffected: 0 };
    },
    sqliteExists: async () => {
      if (!provider.sqlite) {
        throw new Error("SQLite is not supported by this provider");
      }
      return { exists: await provider.sqlite.exists() };
    }
  };
}
function toSessionFsError(err) {
  const e = err;
  const code = e.code === "ENOENT" ? "ENOENT" : "UNKNOWN";
  return { code, message: e.message ?? String(err) };
}

// node_modules/.pnpm/@github+copilot-sdk@1.0.3/node_modules/@github/copilot-sdk/dist/toolSet.js
var VALID_TOOL_NAME = /^[a-zA-Z0-9_-]+$/;
function validateName(kind, name) {
  if (name === "*") {
    return;
  }
  if (!VALID_TOOL_NAME.test(name)) {
    throw new Error(
      `Invalid ${kind} tool name '${name}': tool names must match /^[a-zA-Z0-9_-]+$/ or be the wildcard '*'.`
    );
  }
}
var ToolSet = class {
  items = [];
  addBuiltIn(nameOrNames) {
    const names = typeof nameOrNames === "string" ? [nameOrNames] : nameOrNames;
    for (const name of names) {
      validateName("builtin", name);
      this.items.push(`builtin:${name}`);
    }
    return this;
  }
  /**
   * Adds a custom tool pattern. Matches tools registered via the SDK's
   * `tools` option or via custom agents.
   *
   * @param name A specific custom tool name or `"*"` to match all custom tools.
   */
  addCustom(name) {
    validateName("custom", name);
    this.items.push(`custom:${name}`);
    return this;
  }
  /**
   * Adds an MCP tool pattern. Matches tools advertised by any configured
   * MCP server.
   *
   * @param toolName The runtime's canonical wire name for the MCP tool
   *   (e.g. `"github-list_issues"`), or `"*"` to match all MCP tools from
   *   any server.
   */
  addMcp(toolName) {
    validateName("mcp", toolName);
    this.items.push(`mcp:${toolName}`);
    return this;
  }
  /**
   * Returns a defensive copy of the accumulated filter strings, suitable for
   * passing as {@link SessionConfigBase.availableTools}.
   */
  toArray() {
    return [...this.items];
  }
};
var BuiltInTools = {
  /**
   * Built-in tools that operate only within the bounds of a single session —
   * no host filesystem access outside the session, no cross-session state,
   * no host environment access, no network. Safe to enable in `Mode = "empty"`
   * scenarios (e.g. multi-tenant servers) without leaking host capabilities.
   *
   * **Contract:** tools in this set MUST NOT be extended (even behind options
   * or args) to read or write state outside the session boundary. Adding
   * cross-session or host-state behavior to one of these tools is a
   * breaking change that requires removing it from this set.
   */
  Isolated: [
    "ask_user",
    "task_complete",
    "exit_plan_mode",
    "task",
    "read_agent",
    "write_agent",
    "list_agents",
    "send_inbox",
    "context_board",
    "skill"
  ]
};

// node_modules/.pnpm/@github+copilot-sdk@1.0.3/node_modules/@github/copilot-sdk/dist/types.js
var RuntimeConnection = {
  /**
   * Spawn a runtime child process and communicate over its stdin/stdout.
   * This is the default if no {@link CopilotClientOptions.connection} is set.
   */
  forStdio(opts = {}) {
    return { kind: "stdio", path: opts.path, args: opts.args };
  },
  /**
   * Spawn a runtime child process that listens on a TCP socket and connect to it.
   */
  forTcp(opts = {}) {
    return {
      kind: "tcp",
      port: opts.port,
      connectionToken: opts.connectionToken,
      path: opts.path,
      args: opts.args
    };
  },
  /**
   * Connect to an already-running runtime at the given URL. The SDK does not
   * spawn a process in this mode.
   */
  forUri(url, opts = {}) {
    return { kind: "uri", url, connectionToken: opts.connectionToken };
  }
};
function convertMcpCallToolResult(callResult) {
  const textParts = [];
  const binaryResults = [];
  for (const block of callResult.content) {
    switch (block.type) {
      case "text":
        if (typeof block.text === "string") {
          textParts.push(block.text);
        }
        break;
      case "image":
        if (typeof block.data === "string" && block.data && typeof block.mimeType === "string") {
          binaryResults.push({
            data: block.data,
            mimeType: block.mimeType,
            type: "image"
          });
        }
        break;
      case "resource": {
        if (block.resource?.text) {
          textParts.push(block.resource.text);
        }
        if (block.resource?.blob) {
          const mimeType = block.resource.mimeType;
          binaryResults.push({
            data: block.resource.blob,
            mimeType: typeof mimeType === "string" && mimeType ? mimeType : "application/octet-stream",
            type: "resource",
            description: block.resource.uri
          });
        }
        break;
      }
    }
  }
  return {
    textResultForLlm: textParts.join("\n"),
    resultType: callResult.isError ? "failure" : "success",
    ...binaryResults.length > 0 ? { binaryResultsForLlm: binaryResults } : {}
  };
}
function defineTool(name, config) {
  return { name, ...config };
}
var SYSTEM_MESSAGE_SECTIONS = {
  identity: { description: "Agent identity preamble and mode statement" },
  tone: { description: "Response style, conciseness rules, output formatting preferences" },
  tool_efficiency: { description: "Tool usage patterns, parallel calling, batching guidelines" },
  environment_context: { description: "CWD, OS, git root, directory listing, available tools" },
  code_change_rules: { description: "Coding rules, linting/testing, ecosystem tools, style" },
  guidelines: { description: "Tips, behavioral best practices, behavioral guidelines" },
  safety: { description: "Environment limitations, prohibited actions, security policies" },
  tool_instructions: { description: "Per-tool usage instructions" },
  custom_instructions: { description: "Repository and organization custom instructions" },
  runtime_instructions: {
    description: "Runtime-provided context and instructions (e.g. system notifications, memories, workspace context, mode-specific instructions, content-exclusion policy)"
  },
  last_instructions: {
    description: "End-of-prompt instructions: parallel tool calling, persistence, task completion"
  }
};
var approveAll = () => ({ kind: "approve-once" });
var defaultJoinSessionPermissionHandler = () => ({
  kind: "no-result"
});

// node_modules/.pnpm/@github+copilot-sdk@1.0.3/node_modules/@github/copilot-sdk/dist/client.js
var MIN_PROTOCOL_VERSION = 3;
var RUNTIME_SHUTDOWN_TIMEOUT_MS = 1e4;
function isZodSchema(value) {
  return value != null && typeof value === "object" && "toJSONSchema" in value && typeof value.toJSONSchema === "function";
}
async function withTimeout(promise, timeoutMs, message) {
  let timeout;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error(message)), timeoutMs);
      })
    ]);
  } finally {
    if (timeout !== void 0) {
      clearTimeout(timeout);
    }
  }
}
async function waitForChildExit(child, timeoutMs) {
  if (child.exitCode != null || child.signalCode != null) {
    return true;
  }
  return new Promise((resolve) => {
    let timeout;
    let settled = false;
    const onExit = () => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      resolve(true);
    };
    timeout = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      child.off("exit", onExit);
      resolve(false);
    }, timeoutMs);
    child.once("exit", onExit);
    if (child.exitCode != null || child.signalCode != null) {
      onExit();
    }
  });
}
function toJsonSchema(parameters) {
  if (!parameters) return void 0;
  if (isZodSchema(parameters)) {
    return parameters.toJSONSchema();
  }
  return parameters;
}
function toWireMcpServers(mcpServers) {
  if (!mcpServers) return void 0;
  return Object.fromEntries(
    Object.entries(mcpServers).map(([name, server]) => {
      if ("workingDirectory" in server) {
        const { workingDirectory, ...rest } = server;
        return [name, { ...rest, cwd: workingDirectory }];
      }
      return [name, server];
    })
  );
}
function toWireCustomAgents(agents) {
  if (!agents) return void 0;
  return agents.map((agent) => {
    if (!agent.mcpServers) return agent;
    const { mcpServers, ...rest } = agent;
    return { ...rest, mcpServers: toWireMcpServers(mcpServers) };
  });
}
function toWireLargeOutput(config) {
  if (!config) return void 0;
  const { outputDirectory, ...rest } = config;
  const wire = { ...rest };
  if (outputDirectory !== void 0) {
    wire.outputDir = outputDirectory;
  }
  return wire;
}
function toolFilterListToArray(value) {
  if (value === void 0) {
    return void 0;
  }
  return value instanceof ToolSet ? value.toArray() : value;
}
function validateToolFilterList(field, list) {
  if (!list) {
    return;
  }
  for (const entry of list) {
    if (entry === "*") {
      throw new Error(
        `Invalid ${field} entry '*': there is no bare wildcard. Use one or more of \`new ToolSet().addBuiltIn('*')\`, \`.addMcp('*')\`, or \`.addCustom('*')\` to target a specific source.`
      );
    }
  }
}
function extractTransformCallbacks(systemMessage) {
  if (!systemMessage || systemMessage.mode !== "customize" || !systemMessage.sections) {
    return { wirePayload: systemMessage, transformCallbacks: void 0 };
  }
  const transformCallbacks = /* @__PURE__ */ new Map();
  const wireSections = {};
  for (const [sectionId, override] of Object.entries(systemMessage.sections)) {
    if (!override) continue;
    if (typeof override.action === "function") {
      transformCallbacks.set(sectionId, override.action);
      wireSections[sectionId] = { action: "transform" };
    } else {
      wireSections[sectionId] = { action: override.action, content: override.content };
    }
  }
  if (transformCallbacks.size === 0) {
    return { wirePayload: systemMessage, transformCallbacks: void 0 };
  }
  const wirePayload = {
    ...systemMessage,
    sections: wireSections
  };
  return { wirePayload, transformCallbacks };
}
function getNodeExecPath() {
  if (process.versions.bun) {
    return "node";
  }
  return process.execPath;
}
function getCliPlatformPackageNames() {
  const arch = process.arch;
  const variants = process.platform === "linux" ? ["linux", "linuxmusl"] : [process.platform];
  return variants.map((variant) => `@github/copilot-${variant}-${arch}`);
}
function getBundledCliPath() {
  const packageNames = getCliPlatformPackageNames();
  if (typeof import.meta.resolve === "function") {
    for (const packageName of packageNames) {
      try {
        const sdkUrl = import.meta.resolve(`${packageName}/sdk`);
        const sdkPath = fileURLToPath(sdkUrl);
        return join(dirname(dirname(sdkPath)), "index.js");
      } catch {
      }
    }
    throw new Error(
      `Could not resolve a @github/copilot platform package (tried ${packageNames.join(", ")}). Ensure @github/copilot is installed, or pass cliPath/cliUrl to CopilotClient.`
    );
  }
  const req = createRequire(__filename);
  const searchPaths = req.resolve.paths("@github/copilot") ?? [];
  for (const base of searchPaths) {
    for (const packageName of packageNames) {
      const candidate = join(base, ...packageName.split("/"), "index.js");
      if (existsSync(candidate)) {
        return candidate;
      }
    }
  }
  throw new Error(
    `Could not find a @github/copilot platform package (tried ${packageNames.join(", ")}). Searched ${searchPaths.length} paths. Ensure @github/copilot is installed, or pass cliPath/cliUrl to CopilotClient.`
  );
}
var CopilotClient = class _CopilotClient {
  cliStartTimeout = null;
  cliProcess = null;
  connection = null;
  socket = null;
  runtimePort = null;
  actualHost = "localhost";
  state = "disconnected";
  sessions = /* @__PURE__ */ new Map();
  stderrBuffer = "";
  // Captures CLI stderr for error messages
  /** Resolved connection mode chosen in the constructor. */
  connectionConfig;
  /** Resolved path to the runtime executable (only used for child-process kinds). */
  resolvedCliPath;
  /** Resolved environment passed to the spawned runtime. */
  resolvedEnv;
  options;
  isExternalServer = false;
  forceStopping = false;
  /** Token sent in `connect`; auto-generated when the SDK spawns its own CLI in TCP mode. */
  effectiveConnectionToken;
  onListModels;
  onGetTraceContext;
  modelsCache = null;
  modelsCacheLock = Promise.resolve();
  sessionLifecycleHandlers = /* @__PURE__ */ new Set();
  typedLifecycleHandlers = /* @__PURE__ */ new Map();
  _rpc = null;
  _internalRpc = null;
  processExitPromise = null;
  // Rejects when CLI process exits
  negotiatedProtocolVersion = null;
  /** Connection-level session filesystem config, set via constructor option. */
  sessionFsConfig = null;
  /**
   * Typed server-scoped RPC methods.
   * @throws Error if the client is not connected
   */
  get rpc() {
    if (!this.connection) {
      throw new Error("Client is not connected. Call start() first.");
    }
    if (!this._rpc) {
      this._rpc = createServerRpc(this.connection);
    }
    return this._rpc;
  }
  /**
   * Internal RPC surface (e.g. handshake helpers). Not part of the public API.
   * @internal
   */
  get internalRpc() {
    if (!this.connection) {
      throw new Error("Client is not connected. Call start() first.");
    }
    if (!this._internalRpc) {
      this._internalRpc = createInternalServerRpc(this.connection);
    }
    return this._internalRpc;
  }
  logDebugTiming(message, startMs) {
    const level = this.options.logLevel?.toLowerCase();
    if (level === "debug" || level === "all") {
      process.stderr.write(`[copilot-sdk] ${message}. Elapsed=${Date.now() - startMs}ms
`);
    }
  }
  /**
   * Creates a new CopilotClient instance.
   *
   * @param options - Configuration options for the client
   *
   * @example
   * ```typescript
   * // Default: spawns the bundled runtime over stdio
   * const client = new CopilotClient();
   *
   * // Connect to an existing runtime
   * const client = new CopilotClient({
   *   connection: RuntimeConnection.forUri("localhost:3000"),
   * });
   *
   * // Spawn the runtime over TCP on a chosen port
   * const client = new CopilotClient({
   *   connection: RuntimeConnection.forTcp({ port: 9001 }),
   * });
   *
   * // Use a custom runtime binary
   * const client = new CopilotClient({
   *   connection: RuntimeConnection.forStdio({ path: "/usr/local/bin/copilot" }),
   *   logLevel: "debug",
   * });
   * ```
   */
  constructor(options = {}) {
    const conn = options._internalConnection ?? options.connection ?? { kind: "stdio" };
    if (conn.kind === "uri" && (options.gitHubToken !== void 0 || options.useLoggedInUser !== void 0)) {
      throw new Error(
        "gitHubToken and useLoggedInUser cannot be used with RuntimeConnection.forUri (external server manages its own auth)"
      );
    }
    if (conn.kind === "tcp" && conn.connectionToken !== void 0) {
      if (typeof conn.connectionToken !== "string" || conn.connectionToken.length === 0) {
        throw new Error("connectionToken must be a non-empty string");
      }
    }
    this.connectionConfig = conn;
    if (options.sessionFs) {
      this.validateSessionFsConfig(options.sessionFs);
    }
    if (conn.kind === "uri") {
      const { host, port } = this.parseCliUrl(conn.url);
      this.actualHost = host;
      this.runtimePort = port;
      this.isExternalServer = true;
    } else if (conn.kind === "parent-process") {
      this.isExternalServer = true;
    }
    if (conn.kind === "tcp") {
      this.effectiveConnectionToken = conn.connectionToken ?? randomUUID();
    } else if (conn.kind === "uri") {
      this.effectiveConnectionToken = conn.connectionToken;
    }
    this.onListModels = options.onListModels;
    this.onGetTraceContext = options.onGetTraceContext;
    this.sessionFsConfig = options.sessionFs ?? null;
    const effectiveEnv = options.env ?? process.env;
    this.resolvedEnv = effectiveEnv;
    this.resolvedCliPath = conn.kind === "stdio" || conn.kind === "tcp" ? conn.path ?? effectiveEnv.COPILOT_CLI_PATH ?? getBundledCliPath() : void 0;
    const connArgs = conn.kind === "stdio" || conn.kind === "tcp" ? conn.args ?? [] : [];
    this.connectionExtraArgs = [...connArgs];
    this.options = {
      workingDirectory: options.workingDirectory ?? process.cwd(),
      logLevel: options.logLevel,
      gitHubToken: options.gitHubToken,
      // Default useLoggedInUser to false when gitHubToken is provided, otherwise true.
      useLoggedInUser: options.useLoggedInUser ?? (options.gitHubToken ? false : true),
      telemetry: options.telemetry,
      baseDirectory: options.baseDirectory,
      sessionIdleTimeoutSeconds: options.sessionIdleTimeoutSeconds ?? 0,
      enableRemoteSessions: options.enableRemoteSessions ?? false,
      mode: options.mode ?? "copilot-cli"
    };
    if (this.options.mode === "empty") {
      const hasPersistence = this.options.baseDirectory !== void 0 || this.sessionFsConfig !== null || // External runtimes manage their own persistence layer; the SDK
      // can't enforce it from here.
      conn.kind === "uri" || conn.kind === "parent-process";
      if (!hasPersistence) {
        throw new Error(
          "CopilotClient was created with mode: 'empty' but neither 'baseDirectory' nor 'sessionFs' was set. Empty mode requires an explicit per-session persistence location; pick one."
        );
      }
    }
  }
  connectionExtraArgs = [];
  /**
   * Parse CLI URL into host and port
   * Supports formats: "host:port", "http://host:port", "https://host:port", or just "port"
   */
  parseCliUrl(url) {
    let cleanUrl = url.replace(/^https?:\/\//, "");
    if (/^\d+$/.test(cleanUrl)) {
      return { host: "localhost", port: parseInt(cleanUrl, 10) };
    }
    const parts = cleanUrl.split(":");
    if (parts.length !== 2) {
      throw new Error(
        `Invalid cliUrl format: ${url}. Expected "host:port", "http://host:port", or "port"`
      );
    }
    const host = parts[0] || "localhost";
    const port = parseInt(parts[1], 10);
    if (isNaN(port) || port <= 0 || port > 65535) {
      throw new Error(`Invalid port in cliUrl: ${url}`);
    }
    return { host, port };
  }
  validateSessionFsConfig(config) {
    if (!config.initialCwd) {
      throw new Error("sessionFs.initialCwd is required");
    }
    if (!config.sessionStatePath) {
      throw new Error("sessionFs.sessionStatePath is required");
    }
    if (config.conventions !== "windows" && config.conventions !== "posix") {
      throw new Error("sessionFs.conventions must be either 'windows' or 'posix'");
    }
  }
  setupSessionFs(session, config) {
    if (!this.sessionFsConfig) {
      return;
    }
    if (!config.createSessionFsProvider) {
      throw new Error(
        "createSessionFsProvider is required in session config when sessionFs is enabled in client options."
      );
    }
    const provider = config.createSessionFsProvider(session);
    if (this.sessionFsConfig.capabilities?.sqlite && !provider.sqlite) {
      throw new Error(
        "SessionFsConfig declares capabilities.sqlite but the provider does not implement sqlite."
      );
    }
    session.clientSessionApis.sessionFs = createSessionFsAdapter(provider);
  }
  /**
   * Starts the CLI server and establishes a connection.
   *
   * If connecting to an external server (via cliUrl), only establishes the connection.
   * Otherwise, spawns the CLI server process and then connects.
   *
   * This method is called automatically the first time you create or resume a session.
   *
   * @returns A promise that resolves when the connection is established
   * @throws Error if the server fails to start or the connection fails
   *
   * @example
   * ```typescript
   * const client = new CopilotClient();
   * await client.start();
   * // Now ready to create sessions
   * ```
   */
  async start() {
    if (this.state === "connected") {
      return;
    }
    this.state = "connecting";
    try {
      if (!this.isExternalServer) {
        await this.startCLIServer();
      }
      await this.connectToServer();
      await this.verifyProtocolVersion();
      if (this.sessionFsConfig) {
        await this.connection.sendRequest("sessionFs.setProvider", {
          initialCwd: this.sessionFsConfig.initialCwd,
          sessionStatePath: this.sessionFsConfig.sessionStatePath,
          conventions: this.sessionFsConfig.conventions,
          capabilities: this.sessionFsConfig.capabilities
        });
      }
      this.state = "connected";
    } catch (error) {
      this.state = "error";
      throw error;
    }
  }
  /**
   * Stops the CLI server and closes all active sessions.
   *
   * This method performs graceful cleanup:
   * 1. Closes all active sessions (releases in-memory resources)
   * 2. Requests runtime shutdown for SDK-owned CLI processes
   * 3. Closes the JSON-RPC connection
   * 4. Terminates the CLI server process (if spawned by this client)
   *
   * Note: session data on disk is preserved, so sessions can be resumed later.
   * To permanently remove session data before stopping, call
   * {@link deleteSession} for each session first.
   *
   * @returns A promise that resolves with an array of errors encountered during cleanup.
   *          An empty array indicates all cleanup succeeded.
   *
   * @example
   * ```typescript
   * const errors = await client.stop();
   * if (errors.length > 0) {
   *   console.error("Cleanup errors:", errors);
   * }
   * ```
   */
  async stop() {
    const errors = [];
    for (const session of this.sessions.values()) {
      const sessionId = session.sessionId;
      let lastError = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await session.disconnect();
          lastError = null;
          break;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          if (attempt < 3) {
            const delay = 100 * Math.pow(2, attempt - 1);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }
      if (lastError) {
        errors.push(
          new Error(
            `Failed to disconnect session ${sessionId} after 3 attempts: ${lastError.message}`
          )
        );
      }
    }
    this.sessions.clear();
    let runtimeShutdownCompleted = false;
    if (this.connection && this.cliProcess && !this.isExternalServer) {
      const runtimeShutdownStart = Date.now();
      const shutdownPromise = this.rpc.runtime.shutdown();
      void shutdownPromise.catch(() => void 0);
      try {
        await withTimeout(
          shutdownPromise,
          RUNTIME_SHUTDOWN_TIMEOUT_MS,
          `runtime.shutdown timed out after ${RUNTIME_SHUTDOWN_TIMEOUT_MS}ms`
        );
        runtimeShutdownCompleted = true;
        this.logDebugTiming(
          "CopilotClient.stop runtime shutdown complete",
          runtimeShutdownStart
        );
      } catch (error) {
        this.logDebugTiming(
          "CopilotClient.stop runtime shutdown failed",
          runtimeShutdownStart
        );
        errors.push(
          new Error(
            `Failed to gracefully shut down runtime: ${error instanceof Error ? error.message : String(error)}`
          )
        );
      }
    }
    if (this.connection) {
      try {
        this.connection.dispose();
      } catch (error) {
        errors.push(
          new Error(
            `Failed to dispose connection: ${error instanceof Error ? error.message : String(error)}`
          )
        );
      }
      this.connection = null;
      this._rpc = null;
      this._internalRpc = null;
    }
    this.modelsCache = null;
    if (this.socket) {
      const socket = this.socket;
      this.socket = null;
      try {
        if (!socket.destroyed) {
          await new Promise((resolve) => {
            socket.once("close", () => resolve());
            socket.end();
          });
        }
      } catch (error) {
        errors.push(
          new Error(
            `Failed to close socket: ${error instanceof Error ? error.message : String(error)}`
          )
        );
      }
    }
    if (this.cliProcess && !this.isExternalServer) {
      const child = this.cliProcess;
      this.cliProcess = null;
      try {
        if (child.exitCode == null && child.signalCode == null) {
          const exitedGracefully = runtimeShutdownCompleted ? await waitForChildExit(child, RUNTIME_SHUTDOWN_TIMEOUT_MS) : false;
          if (!exitedGracefully) {
            child.kill();
            if (!await waitForChildExit(child, RUNTIME_SHUTDOWN_TIMEOUT_MS)) {
              errors.push(
                new Error(
                  `Timed out waiting for CLI process to exit after kill: ${RUNTIME_SHUTDOWN_TIMEOUT_MS}ms`
                )
              );
            }
          }
        }
      } catch (error) {
        errors.push(
          new Error(
            `Failed to kill CLI process: ${error instanceof Error ? error.message : String(error)}`
          )
        );
      }
    }
    if (this.cliStartTimeout) {
      clearTimeout(this.cliStartTimeout);
      this.cliStartTimeout = null;
    }
    this.state = "disconnected";
    this.runtimePort = null;
    this.stderrBuffer = "";
    this.processExitPromise = null;
    return errors;
  }
  /**
   * Alias for {@link stop} that lets `CopilotClient` participate in `await using`
   * blocks for automatic cleanup.
   *
   * @example
   * ```typescript
   * await using client = new CopilotClient();
   * const session = await client.createSession({ onPermissionRequest: approveAll });
   * await session.sendAndWait("Hello");
   * // client.stop() is called automatically when the block exits.
   * ```
   */
  async [Symbol.asyncDispose]() {
    await this.stop();
  }
  /**
   * Forcefully stops the CLI server without graceful cleanup.
   *
   * Use this when {@link stop} fails or takes too long. This method:
   * - Clears all sessions immediately without destroying them
   * - Force closes the connection
   * - Sends SIGKILL to the CLI process (if spawned by this client)
   *
   * @returns A promise that resolves when the force stop is complete
   *
   * @example
   * ```typescript
   * // If normal stop hangs, force stop
   * const stopPromise = client.stop();
   * const timeout = new Promise((_, reject) =>
   *   setTimeout(() => reject(new Error("Timeout")), 5000)
   * );
   *
   * try {
   *   await Promise.race([stopPromise, timeout]);
   * } catch {
   *   await client.forceStop();
   * }
   * ```
   */
  async forceStop() {
    this.forceStopping = true;
    this.sessions.clear();
    if (this.connection) {
      try {
        this.connection.dispose();
      } catch {
      }
      this.connection = null;
      this._rpc = null;
      this._internalRpc = null;
    }
    this.modelsCache = null;
    if (this.socket) {
      try {
        this.socket.destroy();
      } catch {
      }
      this.socket = null;
    }
    if (this.cliProcess && !this.isExternalServer) {
      try {
        this.cliProcess.kill("SIGKILL");
      } catch {
      }
      this.cliProcess = null;
    }
    if (this.cliStartTimeout) {
      clearTimeout(this.cliStartTimeout);
      this.cliStartTimeout = null;
    }
    this.state = "disconnected";
    this.runtimePort = null;
    this.stderrBuffer = "";
    this.processExitPromise = null;
  }
  /**
   * Creates a new conversation session with the Copilot CLI.
   *
   * Sessions maintain conversation state, handle events, and manage tool execution.
   * If the client is not connected, this method automatically starts the connection.
   *
   * @param config - Optional configuration for the session
   * @returns A promise that resolves with the created session
   * @throws Error if the client fails to start
   *
   * @example
   * ```typescript
   * // Basic session
   * const session = await client.createSession({ onPermissionRequest: approveAll });
   *
   * // Session with model and tools
   * const session = await client.createSession({
   *   onPermissionRequest: approveAll,
   *   model: "gpt-4",
   *   tools: [{
   *     name: "get_weather",
   *     description: "Get weather for a location",
   *     parameters: { type: "object", properties: { location: { type: "string" } } },
   *     handler: async (args) => ({ temperature: 72 })
   *   }]
   * });
   * ```
   */
  /**
   * Normalizes session-level tool filter options. Converts {@link ToolSet}
   * instances to plain string arrays, rejects misuse (bare `"*"`) and the
   * missing-availableTools case in `mode = "empty"`.
   *
   * The SDK always sends `toolFilterPrecedence: "excluded"` so callers can
   * compose include + exclude lists naturally (e.g. "everything matching X
   * except Y") regardless of mode. Allowlist-precedence is intentionally not
   * exposed — it's available on the runtime side as a CLI-only concession to
   * legacy behavior, but SDK consumers always get the composable semantics.
   *
   * @internal
   */
  resolveToolFilterOptions(config) {
    const availableTools = toolFilterListToArray(config.availableTools);
    const excludedTools = toolFilterListToArray(config.excludedTools);
    validateToolFilterList("availableTools", availableTools);
    validateToolFilterList("excludedTools", excludedTools);
    if (this.options.mode === "empty") {
      if (availableTools === void 0) {
        throw new Error(
          "CopilotClient is in mode: 'empty' but the session config did not specify 'availableTools'. Empty mode requires every session to explicitly opt into the tools it wants \u2014 e.g. `new ToolSet().addBuiltIn(BuiltInTools.Isolated)`."
        );
      }
    }
    return { availableTools, excludedTools, toolFilterPrecedence: "excluded" };
  }
  /** Mode-specific defaults spread under the caller's config (app values win). */
  configDefaultsForMode() {
    if (this.options.mode === "empty") {
      return {
        enableSessionTelemetry: false,
        mcpOAuthTokenStorage: "in-memory",
        skipEmbeddingRetrieval: true,
        embeddingCacheStorage: "in-memory",
        enableOnDemandInstructionDiscovery: false,
        enableFileHooks: false,
        enableHostGitOperations: false,
        enableSessionStore: false,
        enableSkills: false,
        memory: { enabled: false }
      };
    }
    return {};
  }
  /**
   * Returns the systemMessage config to use, adjusted for the current mode.
   * In empty mode we ensure the environment_context section is removed
   * unless the app has already taken control of it. `append` (and
   * unspecified) mode is promoted to `customize` so we can also strip
   * environment_context; the caller's `content` is preserved verbatim
   * because the runtime appends it as additional instructions in both
   * customize and append modes.
   */
  getSystemMessageConfigForMode(supplied) {
    if (this.options.mode !== "empty") return supplied;
    if (!supplied) {
      return {
        mode: "customize",
        sections: { environment_context: { action: "remove" } }
      };
    }
    switch (supplied.mode) {
      case "replace":
        return supplied;
      case "customize":
        if (supplied.sections?.environment_context) return supplied;
        return {
          ...supplied,
          sections: {
            ...supplied.sections,
            environment_context: { action: "remove" }
          }
        };
      case "append":
      case void 0:
        return {
          mode: "customize",
          content: supplied.content,
          sections: { environment_context: { action: "remove" } }
        };
    }
  }
  /**
   * Mode-specific options applied via session.options.update after create/resume.
   *
   * In empty mode, defaults the four overridable feature flags to safe values
   * (caller values from `config` win). `installedPlugins=[]` is unconditional
   * in empty mode — apps that need custom plugins should switch modes.
   */
  async updateSessionOptionsForMode(session, config) {
    const patch = {};
    if (this.options.mode === "empty") {
      patch.skipCustomInstructions = config.skipCustomInstructions ?? true;
      patch.customAgentsLocalOnly = config.customAgentsLocalOnly ?? true;
      patch.coauthorEnabled = config.coauthorEnabled ?? false;
      patch.manageScheduleEnabled = config.manageScheduleEnabled ?? false;
      patch.installedPlugins = [];
    } else {
      if (config.skipCustomInstructions !== void 0)
        patch.skipCustomInstructions = config.skipCustomInstructions;
      if (config.customAgentsLocalOnly !== void 0)
        patch.customAgentsLocalOnly = config.customAgentsLocalOnly;
      if (config.coauthorEnabled !== void 0)
        patch.coauthorEnabled = config.coauthorEnabled;
      if (config.manageScheduleEnabled !== void 0)
        patch.manageScheduleEnabled = config.manageScheduleEnabled;
    }
    if (Object.keys(patch).length === 0) {
      return;
    }
    try {
      await session.rpc.options.update(patch);
    } catch (e) {
      try {
        await session.disconnect();
      } catch {
      }
      throw e;
    }
  }
  async createSession(config) {
    if (!this.connection) {
      await this.start();
    }
    config = { ...this.configDefaultsForMode(), ...config };
    config.systemMessage = this.getSystemMessageConfigForMode(config.systemMessage);
    const callerSessionId = config.sessionId;
    const useServerGeneratedId = config.cloud != null && callerSessionId == null;
    const localSessionId = useServerGeneratedId ? void 0 : callerSessionId ?? randomUUID();
    const { wirePayload: wireSystemMessage, transformCallbacks } = extractTransformCallbacks(
      config.systemMessage
    );
    const initializeSession = (sessionId) => {
      const s = new CopilotSession(
        sessionId,
        this.connection,
        void 0,
        this.onGetTraceContext
      );
      s.registerTools(config.tools);
      s.registerCanvases(config.canvases);
      s.registerCommands(config.commands);
      s.registerPermissionHandler(config.onPermissionRequest);
      if (config.onUserInputRequest) {
        s.registerUserInputHandler(config.onUserInputRequest);
      }
      if (config.onElicitationRequest) {
        s.registerElicitationHandler(config.onElicitationRequest);
      }
      if (config.onExitPlanModeRequest) {
        s.registerExitPlanModeHandler(config.onExitPlanModeRequest);
      }
      if (config.onAutoModeSwitchRequest) {
        s.registerAutoModeSwitchHandler(config.onAutoModeSwitchRequest);
      }
      if (config.hooks) {
        s.registerHooks(config.hooks);
      }
      if (transformCallbacks) {
        s.registerTransformCallbacks(transformCallbacks);
      }
      if (config.onEvent) {
        s.on(config.onEvent);
      }
      this.sessions.set(sessionId, s);
      this.setupSessionFs(s, config);
      return s;
    };
    let session;
    let registeredId;
    if (localSessionId !== void 0) {
      session = initializeSession(localSessionId);
      registeredId = localSessionId;
    }
    const toolFilterOptions = this.resolveToolFilterOptions(config);
    try {
      const response = await this.connection.sendRequest("session.create", {
        ...await getTraceContext(this.onGetTraceContext),
        model: config.model,
        sessionId: localSessionId,
        clientName: config.clientName,
        reasoningEffort: config.reasoningEffort,
        reasoningSummary: config.reasoningSummary,
        contextTier: config.contextTier,
        tools: config.tools?.map((tool) => ({
          name: tool.name,
          description: tool.description,
          parameters: toJsonSchema(tool.parameters),
          overridesBuiltInTool: tool.overridesBuiltInTool,
          skipPermission: tool.skipPermission,
          defer: tool.defer
        })),
        canvases: config.canvases?.map((canvas) => canvas.declaration),
        requestCanvasRenderer: config.requestCanvasRenderer,
        requestExtensions: config.requestExtensions,
        extensionSdkPath: config.extensionSdkPath,
        extensionInfo: config.extensionInfo,
        commands: config.commands?.map((cmd) => ({
          name: cmd.name,
          description: cmd.description
        })),
        systemMessage: wireSystemMessage,
        availableTools: toolFilterOptions.availableTools,
        excludedTools: toolFilterOptions.excludedTools,
        toolFilterPrecedence: toolFilterOptions.toolFilterPrecedence,
        provider: config.provider,
        providers: config.providers,
        models: config.models,
        enableSessionTelemetry: config.enableSessionTelemetry,
        modelCapabilities: config.modelCapabilities,
        largeOutput: toWireLargeOutput(config.largeOutput),
        requestPermission: !!config.onPermissionRequest,
        requestUserInput: !!config.onUserInputRequest,
        requestElicitation: !!config.onElicitationRequest,
        ...config.enableMcpApps ? { requestMcpApps: true } : {},
        requestExitPlanMode: !!config.onExitPlanModeRequest,
        requestAutoModeSwitch: !!config.onAutoModeSwitchRequest,
        hooks: !!(config.hooks && Object.values(config.hooks).some(Boolean)),
        workingDirectory: config.workingDirectory,
        streaming: config.streaming,
        includeSubAgentStreamingEvents: config.includeSubAgentStreamingEvents ?? true,
        mcpServers: toWireMcpServers(config.mcpServers),
        mcpOAuthTokenStorage: config.mcpOAuthTokenStorage,
        envValueMode: "direct",
        customAgents: toWireCustomAgents(config.customAgents),
        defaultAgent: config.defaultAgent,
        agent: config.agent,
        configDir: config.configDirectory,
        enableConfigDiscovery: config.enableConfigDiscovery,
        skipEmbeddingRetrieval: config.skipEmbeddingRetrieval,
        embeddingCacheStorage: config.embeddingCacheStorage,
        organizationCustomInstructions: config.organizationCustomInstructions,
        enableOnDemandInstructionDiscovery: config.enableOnDemandInstructionDiscovery,
        enableFileHooks: config.enableFileHooks,
        enableHostGitOperations: config.enableHostGitOperations,
        enableSessionStore: config.enableSessionStore,
        enableSkills: config.enableSkills,
        skillDirectories: config.skillDirectories,
        pluginDirectories: config.pluginDirectories,
        instructionDirectories: config.instructionDirectories,
        disabledSkills: config.disabledSkills,
        infiniteSessions: config.infiniteSessions,
        memory: config.memory,
        gitHubToken: config.gitHubToken,
        remoteSession: config.remoteSession,
        cloud: config.cloud
      });
      const {
        sessionId: returnedSessionId,
        workspacePath,
        capabilities
      } = response;
      if (!returnedSessionId) {
        throw new Error("session.create response did not include a sessionId");
      }
      if (localSessionId !== void 0 && localSessionId !== returnedSessionId) {
        throw new Error(
          `session.create returned sessionId ${returnedSessionId} but the caller requested ${localSessionId}`
        );
      }
      if (session === void 0) {
        session = initializeSession(returnedSessionId);
        registeredId = returnedSessionId;
      }
      session["_workspacePath"] = workspacePath;
      session.setCapabilities(capabilities);
      await this.updateSessionOptionsForMode(session, config);
    } catch (e) {
      if (registeredId !== void 0) {
        this.sessions.delete(registeredId);
      }
      throw e;
    }
    return session;
  }
  /**
   * Resumes an existing conversation session by its ID.
   *
   * This allows you to continue a previous conversation, maintaining all
   * conversation history. The session must have been previously created
   * and not deleted.
   *
   * @param sessionId - The ID of the session to resume
   * @param config - Optional configuration for the resumed session
   * @returns A promise that resolves with the resumed session
   * @throws Error if the session does not exist or the client is not connected
   *
   * @example
   * ```typescript
   * // Resume a previous session
   * const session = await client.resumeSession("session-123", { onPermissionRequest: approveAll });
   *
   * // Resume with new tools
   * const session = await client.resumeSession("session-123", {
   *   onPermissionRequest: approveAll,
   *   tools: [myNewTool]
   * });
   * ```
   */
  async resumeSession(sessionId, config) {
    if (!this.connection) {
      await this.start();
    }
    const session = new CopilotSession(
      sessionId,
      this.connection,
      void 0,
      this.onGetTraceContext
    );
    session.registerTools(config.tools);
    session.registerCanvases(config.canvases);
    session.registerCommands(config.commands);
    session.registerPermissionHandler(config.onPermissionRequest);
    if (config.onUserInputRequest) {
      session.registerUserInputHandler(config.onUserInputRequest);
    }
    if (config.onElicitationRequest) {
      session.registerElicitationHandler(config.onElicitationRequest);
    }
    if (config.onExitPlanModeRequest) {
      session.registerExitPlanModeHandler(config.onExitPlanModeRequest);
    }
    if (config.onAutoModeSwitchRequest) {
      session.registerAutoModeSwitchHandler(config.onAutoModeSwitchRequest);
    }
    if (config.hooks) {
      session.registerHooks(config.hooks);
    }
    config = { ...this.configDefaultsForMode(), ...config };
    config.systemMessage = this.getSystemMessageConfigForMode(config.systemMessage);
    const { wirePayload: wireSystemMessage, transformCallbacks } = extractTransformCallbacks(
      config.systemMessage
    );
    if (transformCallbacks) {
      session.registerTransformCallbacks(transformCallbacks);
    }
    if (config.onEvent) {
      session.on(config.onEvent);
    }
    this.sessions.set(sessionId, session);
    this.setupSessionFs(session, config);
    const toolFilterOptions = this.resolveToolFilterOptions(config);
    try {
      const response = await this.connection.sendRequest("session.resume", {
        ...await getTraceContext(this.onGetTraceContext),
        sessionId,
        clientName: config.clientName,
        model: config.model,
        reasoningEffort: config.reasoningEffort,
        reasoningSummary: config.reasoningSummary,
        contextTier: config.contextTier,
        systemMessage: wireSystemMessage,
        availableTools: toolFilterOptions.availableTools,
        excludedTools: toolFilterOptions.excludedTools,
        toolFilterPrecedence: toolFilterOptions.toolFilterPrecedence,
        enableSessionTelemetry: config.enableSessionTelemetry,
        tools: config.tools?.map((tool) => ({
          name: tool.name,
          description: tool.description,
          parameters: toJsonSchema(tool.parameters),
          overridesBuiltInTool: tool.overridesBuiltInTool,
          skipPermission: tool.skipPermission,
          defer: tool.defer
        })),
        canvases: config.canvases?.map((canvas) => canvas.declaration),
        requestCanvasRenderer: config.requestCanvasRenderer,
        requestExtensions: config.requestExtensions,
        extensionSdkPath: config.extensionSdkPath,
        extensionInfo: config.extensionInfo,
        commands: config.commands?.map((cmd) => ({
          name: cmd.name,
          description: cmd.description
        })),
        provider: config.provider,
        providers: config.providers,
        models: config.models,
        modelCapabilities: config.modelCapabilities,
        largeOutput: toWireLargeOutput(config.largeOutput),
        requestPermission: config.onPermissionRequest !== defaultJoinSessionPermissionHandler,
        requestUserInput: !!config.onUserInputRequest,
        requestElicitation: !!config.onElicitationRequest,
        ...config.enableMcpApps ? { requestMcpApps: true } : {},
        requestExitPlanMode: !!config.onExitPlanModeRequest,
        requestAutoModeSwitch: !!config.onAutoModeSwitchRequest,
        hooks: !!(config.hooks && Object.values(config.hooks).some(Boolean)),
        workingDirectory: config.workingDirectory,
        configDir: config.configDirectory,
        enableConfigDiscovery: config.enableConfigDiscovery,
        skipEmbeddingRetrieval: config.skipEmbeddingRetrieval,
        embeddingCacheStorage: config.embeddingCacheStorage,
        organizationCustomInstructions: config.organizationCustomInstructions,
        enableOnDemandInstructionDiscovery: config.enableOnDemandInstructionDiscovery,
        enableFileHooks: config.enableFileHooks,
        enableHostGitOperations: config.enableHostGitOperations,
        enableSessionStore: config.enableSessionStore,
        enableSkills: config.enableSkills,
        streaming: config.streaming,
        includeSubAgentStreamingEvents: config.includeSubAgentStreamingEvents ?? true,
        mcpServers: toWireMcpServers(config.mcpServers),
        mcpOAuthTokenStorage: config.mcpOAuthTokenStorage,
        envValueMode: "direct",
        customAgents: toWireCustomAgents(config.customAgents),
        defaultAgent: config.defaultAgent,
        agent: config.agent,
        skillDirectories: config.skillDirectories,
        pluginDirectories: config.pluginDirectories,
        instructionDirectories: config.instructionDirectories,
        disabledSkills: config.disabledSkills,
        infiniteSessions: config.infiniteSessions,
        memory: config.memory,
        disableResume: config.suppressResumeEvent,
        continuePendingWork: config.continuePendingWork,
        gitHubToken: config.gitHubToken,
        remoteSession: config.remoteSession,
        openCanvases: config.openCanvases
      });
      const { workspacePath, capabilities, openCanvases } = response;
      session["_workspacePath"] = workspacePath;
      session.setCapabilities(capabilities);
      session.setOpenCanvases(openCanvases ?? []);
      await this.updateSessionOptionsForMode(session, config);
    } catch (e) {
      this.sessions.delete(sessionId);
      throw e;
    }
    return session;
  }
  /**
   * Sends a ping request to the server to verify connectivity.
   *
   * @param message - Optional message to include in the ping
   * @returns A promise that resolves with the ping response containing the message and timestamp
   * @throws Error if the client is not connected
   *
   * @example
   * ```typescript
   * const response = await client.ping("health check");
   * console.log(`Server responded at ${new Date(response.timestamp)}`);
   * ```
   */
  async ping(message) {
    if (!this.connection) {
      throw new Error("Client not connected");
    }
    const result = await this.connection.sendRequest("ping", { message });
    return result;
  }
  /**
   * Get CLI status including version and protocol information
   */
  async getStatus() {
    if (!this.connection) {
      throw new Error("Client not connected");
    }
    const result = await this.connection.sendRequest("status.get", {});
    return result;
  }
  /**
   * Get current authentication status
   */
  async getAuthStatus() {
    if (!this.connection) {
      throw new Error("Client not connected");
    }
    const result = await this.connection.sendRequest("auth.getStatus", {});
    return result;
  }
  /**
   * List available models with their metadata.
   *
   * If an `onListModels` handler was provided in the client options,
   * it is called instead of querying the CLI server.
   *
   * Results are cached after the first successful call to avoid rate limiting.
   * The cache is cleared when the client disconnects.
   *
   * @throws Error if not connected (when no custom handler is set)
   */
  async listModels() {
    await this.modelsCacheLock;
    let resolveLock;
    this.modelsCacheLock = new Promise((resolve) => {
      resolveLock = resolve;
    });
    try {
      if (this.modelsCache !== null) {
        return [...this.modelsCache];
      }
      let models;
      if (this.onListModels) {
        models = await this.onListModels();
      } else {
        if (!this.connection) {
          throw new Error("Client not connected");
        }
        const result = await this.connection.sendRequest("models.list", {});
        const response = result;
        models = response.models;
        for (const model of models) {
          const m = model;
          if (!m.capabilities) {
            m.capabilities = {
              supports: {},
              limits: { max_context_window_tokens: 0 }
            };
          } else {
            if (!m.capabilities.supports) m.capabilities.supports = {};
            if (!m.capabilities.limits) {
              m.capabilities.limits = { max_context_window_tokens: 0 };
            } else if (m.capabilities.limits.max_context_window_tokens === void 0) {
              m.capabilities.limits.max_context_window_tokens = 0;
            }
          }
        }
      }
      this.modelsCache = [...models];
      return [...models];
    } finally {
      resolveLock();
    }
  }
  /**
   * Send the `connect` handshake (carrying the optional token) and verify the
   * server's protocol version. Falls back to `ping` against legacy servers
   * that don't implement `connect`.
   */
  async verifyProtocolVersion() {
    if (!this.connection) {
      throw new Error("Client not connected");
    }
    const maxVersion = getSdkProtocolVersion();
    const raceAgainstExit = (p) => this.processExitPromise ? Promise.race([p, this.processExitPromise]) : p;
    let serverVersion;
    try {
      const result = await raceAgainstExit(
        this.internalRpc.connect({ token: this.effectiveConnectionToken })
      );
      serverVersion = result.protocolVersion;
    } catch (err) {
      if (err instanceof import_node2.ResponseError && (err.code === import_node2.ErrorCodes.MethodNotFound || err.message === "Unhandled method connect")) {
        serverVersion = (await raceAgainstExit(this.ping())).protocolVersion;
      } else {
        throw err;
      }
    }
    if (serverVersion === void 0) {
      throw new Error(
        `SDK protocol version mismatch: SDK supports versions ${MIN_PROTOCOL_VERSION}-${maxVersion}, but server does not report a protocol version. Please update your server to ensure compatibility.`
      );
    }
    if (serverVersion < MIN_PROTOCOL_VERSION || serverVersion > maxVersion) {
      throw new Error(
        `SDK protocol version mismatch: SDK supports versions ${MIN_PROTOCOL_VERSION}-${maxVersion}, but server reports version ${serverVersion}. Please update your SDK or server to ensure compatibility.`
      );
    }
    this.negotiatedProtocolVersion = serverVersion;
  }
  /**
   * Gets the ID of the most recently updated session.
   *
   * This is useful for resuming the last conversation when the session ID
   * was not stored.
   *
   * @returns A promise that resolves with the session ID, or undefined if no sessions exist
   * @throws Error if the client is not connected
   *
   * @example
   * ```typescript
   * const lastId = await client.getLastSessionId();
   * if (lastId) {
   *   const session = await client.resumeSession(lastId, { onPermissionRequest: approveAll });
   * }
   * ```
   */
  async getLastSessionId() {
    if (!this.connection) {
      throw new Error("Client not connected");
    }
    const response = await this.connection.sendRequest("session.getLastId", {});
    return response.sessionId;
  }
  /**
   * Permanently deletes a session and all its data from disk, including
   * conversation history, planning state, and artifacts.
   *
   * Unlike {@link CopilotSession.disconnect}, which only releases in-memory
   * resources and preserves session data for later resumption, this method
   * is irreversible. The session cannot be resumed after deletion.
   *
   * @param sessionId - The ID of the session to delete
   * @returns A promise that resolves when the session is deleted
   * @throws Error if the session does not exist or deletion fails
   *
   * @example
   * ```typescript
   * await client.deleteSession("session-123");
   * ```
   */
  async deleteSession(sessionId) {
    if (!this.connection) {
      throw new Error("Client not connected");
    }
    const response = await this.connection.sendRequest("session.delete", {
      sessionId
    });
    const { success, error } = response;
    if (!success) {
      throw new Error(`Failed to delete session ${sessionId}: ${error || "Unknown error"}`);
    }
    this.sessions.delete(sessionId);
  }
  /**
   * List all available sessions.
   *
   * @param filter - Optional filter to limit returned sessions by context fields
   *
   * @example
   * // List all sessions
   * const sessions = await client.listSessions();
   *
   * @example
   * // List sessions for a specific repository
   * const sessions = await client.listSessions({ repository: "owner/repo" });
   */
  async listSessions(filter) {
    if (!this.connection) {
      throw new Error("Client not connected");
    }
    let wireFilter;
    if (filter) {
      const { workingDirectory, ...rest } = filter;
      wireFilter = { ...rest, cwd: workingDirectory };
    }
    const response = await this.connection.sendRequest("session.list", {
      filter: wireFilter
    });
    const { sessions } = response;
    return sessions.map(_CopilotClient.toSessionMetadata);
  }
  /**
   * Gets metadata for a specific session by ID.
   *
   * This provides an efficient O(1) lookup of a single session's metadata
   * instead of listing all sessions. Returns undefined if the session is not found.
   *
   * @param sessionId - The ID of the session to look up
   * @returns A promise that resolves with the session metadata, or undefined if not found
   * @throws Error if the client is not connected
   *
   * @example
   * ```typescript
   * const metadata = await client.getSessionMetadata("session-123");
   * if (metadata) {
   *   console.log(`Session started at: ${metadata.startTime}`);
   * }
   * ```
   */
  async getSessionMetadata(sessionId) {
    if (!this.connection) {
      throw new Error("Client not connected");
    }
    const response = await this.connection.sendRequest("session.getMetadata", { sessionId });
    const { session } = response;
    if (!session) {
      return void 0;
    }
    return _CopilotClient.toSessionMetadata(session);
  }
  static toSessionMetadata(raw) {
    const { context } = raw;
    return {
      sessionId: raw.sessionId,
      startTime: new Date(raw.startTime),
      modifiedTime: new Date(raw.modifiedTime),
      summary: raw.summary,
      isRemote: raw.isRemote,
      context: context ? {
        workingDirectory: context.cwd,
        gitRoot: context.gitRoot,
        repository: context.repository,
        branch: context.branch
      } : void 0
    };
  }
  /**
   * Gets the foreground session ID in TUI+server mode.
   *
   * This returns the ID of the session currently displayed in the TUI.
   * Only available when connecting to a server running in TUI+server mode (--ui-server).
   *
   * @returns A promise that resolves with the foreground session ID, or undefined if none
   * @throws Error if the client is not connected
   *
   * @example
   * ```typescript
   * const sessionId = await client.getForegroundSessionId();
   * if (sessionId) {
   *   console.log(`TUI is displaying session: ${sessionId}`);
   * }
   * ```
   */
  async getForegroundSessionId() {
    if (!this.connection) {
      throw new Error("Client not connected");
    }
    const response = await this.connection.sendRequest("session.getForeground", {});
    return response.sessionId;
  }
  /**
   * Sets the foreground session in TUI+server mode.
   *
   * This requests the TUI to switch to displaying the specified session.
   * Only available when connecting to a server running in TUI+server mode (--ui-server).
   *
   * @param sessionId - The ID of the session to display in the TUI
   * @returns A promise that resolves when the session is switched
   * @throws Error if the client is not connected or if the operation fails
   *
   * @example
   * ```typescript
   * // Switch the TUI to display a specific session
   * await client.setForegroundSessionId("session-123");
   * ```
   */
  async setForegroundSessionId(sessionId) {
    if (!this.connection) {
      throw new Error("Client not connected");
    }
    const response = await this.connection.sendRequest("session.setForeground", { sessionId });
    const result = response;
    if (!result.success) {
      throw new Error(result.error || "Failed to set foreground session");
    }
  }
  onLifecycle(eventTypeOrHandler, handler) {
    if (typeof eventTypeOrHandler === "string" && handler) {
      const eventType = eventTypeOrHandler;
      if (!this.typedLifecycleHandlers.has(eventType)) {
        this.typedLifecycleHandlers.set(eventType, /* @__PURE__ */ new Set());
      }
      const storedHandler = handler;
      this.typedLifecycleHandlers.get(eventType).add(storedHandler);
      return () => {
        const handlers = this.typedLifecycleHandlers.get(eventType);
        if (handlers) {
          handlers.delete(storedHandler);
        }
      };
    }
    const wildcardHandler = eventTypeOrHandler;
    this.sessionLifecycleHandlers.add(wildcardHandler);
    return () => {
      this.sessionLifecycleHandlers.delete(wildcardHandler);
    };
  }
  /**
   * Start the CLI server process
   */
  async startCLIServer() {
    return new Promise((resolve, reject) => {
      this.stderrBuffer = "";
      const args = [...this.connectionExtraArgs, "--headless", "--no-auto-update"];
      if (this.options.logLevel) {
        args.push("--log-level", this.options.logLevel);
      }
      if (this.connectionConfig.kind === "stdio") {
        args.push("--stdio");
      } else if (this.connectionConfig.kind === "tcp") {
        const requestedPort = this.connectionConfig.port ?? 0;
        if (requestedPort > 0) {
          args.push("--port", requestedPort.toString());
        }
      }
      if (this.options.gitHubToken) {
        args.push("--auth-token-env", "COPILOT_SDK_AUTH_TOKEN");
      }
      if (!this.options.useLoggedInUser) {
        args.push("--no-auto-login");
      }
      if (this.options.sessionIdleTimeoutSeconds !== void 0 && this.options.sessionIdleTimeoutSeconds > 0) {
        args.push(
          "--session-idle-timeout",
          this.options.sessionIdleTimeoutSeconds.toString()
        );
      }
      if (this.options.enableRemoteSessions) {
        args.push("--remote");
      }
      const envWithoutNodeDebug = { ...this.resolvedEnv };
      delete envWithoutNodeDebug.NODE_DEBUG;
      if (this.options.gitHubToken) {
        envWithoutNodeDebug.COPILOT_SDK_AUTH_TOKEN = this.options.gitHubToken;
      }
      if (this.effectiveConnectionToken) {
        envWithoutNodeDebug.COPILOT_CONNECTION_TOKEN = this.effectiveConnectionToken;
      }
      if (this.options.baseDirectory) {
        envWithoutNodeDebug.COPILOT_HOME = this.options.baseDirectory;
      }
      if (this.options.mode === "empty") {
        envWithoutNodeDebug.COPILOT_DISABLE_KEYTAR = "1";
      }
      if (!this.resolvedCliPath) {
        throw new Error(
          "Path to Copilot CLI is required. Please supply it via `RuntimeConnection.forStdio({ path })` or `RuntimeConnection.forTcp({ path })`, set the COPILOT_CLI_PATH environment variable, or use `RuntimeConnection.forUri(...)` to connect to an already-running runtime."
        );
      }
      if (this.options.telemetry) {
        const t = this.options.telemetry;
        envWithoutNodeDebug.COPILOT_OTEL_ENABLED = "true";
        if (t.otlpEndpoint !== void 0)
          envWithoutNodeDebug.OTEL_EXPORTER_OTLP_ENDPOINT = t.otlpEndpoint;
        if (t.otlpProtocol !== void 0)
          envWithoutNodeDebug.OTEL_EXPORTER_OTLP_PROTOCOL = t.otlpProtocol;
        if (t.filePath !== void 0)
          envWithoutNodeDebug.COPILOT_OTEL_FILE_EXPORTER_PATH = t.filePath;
        if (t.exporterType !== void 0)
          envWithoutNodeDebug.COPILOT_OTEL_EXPORTER_TYPE = t.exporterType;
        if (t.sourceName !== void 0)
          envWithoutNodeDebug.COPILOT_OTEL_SOURCE_NAME = t.sourceName;
        if (t.captureContent !== void 0)
          envWithoutNodeDebug.OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT = String(
            t.captureContent
          );
      }
      if (!existsSync(this.resolvedCliPath)) {
        throw new Error(
          `Copilot CLI not found at ${this.resolvedCliPath}. Ensure @github/copilot is installed.`
        );
      }
      const stdioConfig = this.connectionConfig.kind === "stdio" ? ["pipe", "pipe", "pipe"] : ["ignore", "pipe", "pipe"];
      const isJsFile = this.resolvedCliPath.endsWith(".js");
      if (isJsFile) {
        this.cliProcess = spawn(getNodeExecPath(), [this.resolvedCliPath, ...args], {
          stdio: stdioConfig,
          cwd: this.options.workingDirectory,
          env: envWithoutNodeDebug,
          windowsHide: true
        });
      } else {
        this.cliProcess = spawn(this.resolvedCliPath, args, {
          stdio: stdioConfig,
          cwd: this.options.workingDirectory,
          env: envWithoutNodeDebug,
          windowsHide: true
        });
      }
      let stdout = "";
      let resolved = false;
      if (this.connectionConfig.kind === "stdio") {
        resolved = true;
        resolve();
      } else {
        this.cliProcess.stdout?.on("data", (data) => {
          stdout += data.toString();
          const match = stdout.match(/listening on port (\d+)/i);
          if (match && !resolved) {
            this.runtimePort = parseInt(match[1], 10);
            resolved = true;
            resolve();
          }
        });
      }
      this.cliProcess.stderr?.on("data", (data) => {
        this.stderrBuffer += data.toString();
        const lines = data.toString().split("\n");
        for (const line of lines) {
          if (line.trim()) {
            process.stderr.write(`[CLI subprocess] ${line}
`);
          }
        }
      });
      this.cliProcess.on("error", (error) => {
        if (!resolved) {
          resolved = true;
          const stderrOutput = this.stderrBuffer.trim();
          if (stderrOutput) {
            reject(
              new Error(
                `Failed to start CLI server: ${error.message}
stderr: ${stderrOutput}`
              )
            );
          } else {
            reject(new Error(`Failed to start CLI server: ${error.message}`));
          }
        }
      });
      this.processExitPromise = new Promise((_, rejectProcessExit) => {
        this.cliProcess.on("exit", (code) => {
          setTimeout(() => {
            const stderrOutput = this.stderrBuffer.trim();
            if (stderrOutput) {
              rejectProcessExit(
                new Error(
                  `CLI server exited with code ${code}
stderr: ${stderrOutput}`
                )
              );
            } else {
              rejectProcessExit(
                new Error(`CLI server exited unexpectedly with code ${code}`)
              );
            }
          }, 50);
        });
      });
      this.processExitPromise.catch(() => {
      });
      this.cliProcess.on("exit", (code) => {
        if (!resolved) {
          resolved = true;
          const stderrOutput = this.stderrBuffer.trim();
          if (stderrOutput) {
            reject(
              new Error(
                `CLI server exited with code ${code}
stderr: ${stderrOutput}`
              )
            );
          } else {
            reject(new Error(`CLI server exited with code ${code}`));
          }
        }
      });
      this.cliStartTimeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          reject(new Error("Timeout waiting for CLI server to start"));
        }
      }, 3e4);
    });
  }
  /**
   * Connect to the CLI server (via socket or stdio)
   */
  async connectToServer() {
    switch (this.connectionConfig.kind) {
      case "parent-process":
        return this.connectToParentProcessViaStdio();
      case "stdio":
        return this.connectToChildProcessViaStdio();
      case "tcp":
      case "uri":
        return this.connectViaTcp();
    }
  }
  /**
   * Connect to child via stdio pipes
   */
  async connectToChildProcessViaStdio() {
    if (!this.cliProcess) {
      throw new Error("CLI process not started");
    }
    this.cliProcess.stdin?.on("error", (err) => {
      if (!this.forceStopping) {
        throw err;
      }
    });
    this.connection = (0, import_node2.createMessageConnection)(
      new import_node2.StreamMessageReader(this.cliProcess.stdout),
      new import_node2.StreamMessageWriter(this.cliProcess.stdin)
    );
    this.attachConnectionHandlers();
    this.connection.listen();
  }
  /**
   * Connect to parent via stdio pipes
   */
  async connectToParentProcessViaStdio() {
    if (this.cliProcess) {
      throw new Error("CLI child process was unexpectedly started in parent process mode");
    }
    this.connection = (0, import_node2.createMessageConnection)(
      new import_node2.StreamMessageReader(process.stdin),
      new import_node2.StreamMessageWriter(process.stdout)
    );
    this.attachConnectionHandlers();
    this.connection.listen();
  }
  /**
   * Connect to the CLI server via TCP socket
   */
  async connectViaTcp() {
    if (!this.runtimePort) {
      throw new Error("Server port not available");
    }
    return new Promise((resolve, reject) => {
      this.socket = new Socket();
      const connectionTimeout = setTimeout(() => {
        this.socket?.destroy();
        reject(new Error("Timeout connecting to CLI server"));
      }, 1e4);
      this.socket.connect(this.runtimePort, this.actualHost, () => {
        clearTimeout(connectionTimeout);
        this.connection = (0, import_node2.createMessageConnection)(
          new import_node2.StreamMessageReader(this.socket),
          new import_node2.StreamMessageWriter(this.socket)
        );
        this.attachConnectionHandlers();
        this.connection.listen();
        resolve();
      });
      this.socket.on("error", (error) => {
        clearTimeout(connectionTimeout);
        reject(new Error(`Failed to connect to CLI server: ${error.message}`));
      });
    });
  }
  attachConnectionHandlers() {
    if (!this.connection) {
      return;
    }
    this.connection.onNotification("session.event", (notification) => {
      this.handleSessionEventNotification(notification);
    });
    this.connection.onNotification("session.lifecycle", (notification) => {
      this.handleSessionLifecycleNotification(notification);
    });
    this.connection.onRequest(
      "userInput.request",
      async (params) => await this.handleUserInputRequest(params)
    );
    this.connection.onRequest(
      "exitPlanMode.request",
      async (params) => await this.handleExitPlanModeRequest(params)
    );
    this.connection.onRequest(
      "autoModeSwitch.request",
      async (params) => await this.handleAutoModeSwitchRequest(params)
    );
    this.connection.onRequest(
      "hooks.invoke",
      async (params) => await this.handleHooksInvoke(params)
    );
    this.connection.onRequest(
      "systemMessage.transform",
      async (params) => await this.handleSystemMessageTransform(params)
    );
    const sessions = this.sessions;
    registerClientSessionApiHandlers(this.connection, (sessionId) => {
      const session = sessions.get(sessionId);
      if (!session) throw new Error(`No session found for sessionId: ${sessionId}`);
      return session.clientSessionApis;
    });
    this.connection.onClose(() => {
      this.state = "disconnected";
    });
    this.connection.onError((_error) => {
      this.state = "disconnected";
    });
  }
  handleSessionEventNotification(notification) {
    if (typeof notification !== "object" || !notification || !("sessionId" in notification) || typeof notification.sessionId !== "string" || !("event" in notification)) {
      return;
    }
    const session = this.sessions.get(notification.sessionId);
    if (session) {
      session._dispatchEvent(notification.event);
    }
  }
  handleSessionLifecycleNotification(notification) {
    if (typeof notification !== "object" || !notification || !("type" in notification) || typeof notification.type !== "string" || !("sessionId" in notification) || typeof notification.sessionId !== "string") {
      return;
    }
    const raw = notification;
    let metadata;
    if (raw.metadata && raw.metadata.startTime && raw.metadata.modifiedTime) {
      metadata = {
        startTime: new Date(raw.metadata.startTime),
        modifiedTime: new Date(raw.metadata.modifiedTime),
        summary: raw.metadata.summary
      };
    }
    const event = {
      type: raw.type,
      sessionId: raw.sessionId,
      metadata
    };
    const typedHandlers = this.typedLifecycleHandlers.get(event.type);
    if (typedHandlers) {
      for (const handler of typedHandlers) {
        try {
          handler(event);
        } catch {
        }
      }
    }
    for (const handler of this.sessionLifecycleHandlers) {
      try {
        handler(event);
      } catch {
      }
    }
  }
  async handleUserInputRequest(params) {
    if (!params || typeof params.sessionId !== "string" || typeof params.question !== "string") {
      throw new Error("Invalid user input request payload");
    }
    const session = this.sessions.get(params.sessionId);
    if (!session) {
      throw new Error(`Session not found: ${params.sessionId}`);
    }
    const result = await session._handleUserInputRequest({
      question: params.question,
      choices: params.choices,
      allowFreeform: params.allowFreeform
    });
    return result;
  }
  async handleExitPlanModeRequest(params) {
    if (!params || typeof params.sessionId !== "string" || typeof params.summary !== "string" || !Array.isArray(params.actions) || typeof params.recommendedAction !== "string") {
      throw new Error("Invalid exit plan mode request payload");
    }
    const session = this.sessions.get(params.sessionId);
    if (!session) {
      throw new Error(`Session not found: ${params.sessionId}`);
    }
    return await session._handleExitPlanModeRequest({
      summary: params.summary,
      planContent: params.planContent,
      actions: params.actions,
      recommendedAction: params.recommendedAction
    });
  }
  async handleAutoModeSwitchRequest(params) {
    if (!params || typeof params.sessionId !== "string") {
      throw new Error("Invalid auto mode switch request payload");
    }
    const session = this.sessions.get(params.sessionId);
    if (!session) {
      throw new Error(`Session not found: ${params.sessionId}`);
    }
    const response = await session._handleAutoModeSwitchRequest({
      errorCode: params.errorCode,
      retryAfterSeconds: params.retryAfterSeconds
    });
    return { response };
  }
  async handleHooksInvoke(params) {
    if (!params || typeof params.sessionId !== "string" || typeof params.hookType !== "string") {
      throw new Error("Invalid hooks invoke payload");
    }
    const session = this.sessions.get(params.sessionId);
    if (!session) {
      throw new Error(`Session not found: ${params.sessionId}`);
    }
    const output = await session._handleHooksInvoke(params.hookType, params.input);
    return { output };
  }
  async handleSystemMessageTransform(params) {
    if (!params || typeof params.sessionId !== "string" || !params.sections || typeof params.sections !== "object") {
      throw new Error("Invalid systemMessage.transform payload");
    }
    const session = this.sessions.get(params.sessionId);
    if (!session) {
      throw new Error(`Session not found: ${params.sessionId}`);
    }
    return await session._handleSystemMessageTransform(params.sections);
  }
};
export {
  BuiltInTools,
  Canvas,
  CanvasError,
  CopilotClient,
  CopilotSession,
  RuntimeConnection,
  SYSTEM_MESSAGE_SECTIONS,
  ToolSet,
  approveAll,
  convertMcpCallToolResult,
  createCanvas,
  createSessionFsAdapter,
  defineTool
};
