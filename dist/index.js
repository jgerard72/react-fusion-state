'use strict';

var React = require('react');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
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
  !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/lodash.isequal/index.js
var require_lodash = __commonJS({
  "node_modules/lodash.isequal/index.js"(exports, module) {
    var LARGE_ARRAY_SIZE = 200;
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    var COMPARE_PARTIAL_FLAG = 1;
    var COMPARE_UNORDERED_FLAG = 2;
    var MAX_SAFE_INTEGER = 9007199254740991;
    var argsTag = "[object Arguments]";
    var arrayTag = "[object Array]";
    var asyncTag = "[object AsyncFunction]";
    var boolTag = "[object Boolean]";
    var dateTag = "[object Date]";
    var errorTag = "[object Error]";
    var funcTag = "[object Function]";
    var genTag = "[object GeneratorFunction]";
    var mapTag = "[object Map]";
    var numberTag = "[object Number]";
    var nullTag = "[object Null]";
    var objectTag = "[object Object]";
    var promiseTag = "[object Promise]";
    var proxyTag = "[object Proxy]";
    var regexpTag = "[object RegExp]";
    var setTag = "[object Set]";
    var stringTag = "[object String]";
    var symbolTag = "[object Symbol]";
    var undefinedTag = "[object Undefined]";
    var weakMapTag = "[object WeakMap]";
    var arrayBufferTag = "[object ArrayBuffer]";
    var dataViewTag = "[object DataView]";
    var float32Tag = "[object Float32Array]";
    var float64Tag = "[object Float64Array]";
    var int8Tag = "[object Int8Array]";
    var int16Tag = "[object Int16Array]";
    var int32Tag = "[object Int32Array]";
    var uint8Tag = "[object Uint8Array]";
    var uint8ClampedTag = "[object Uint8ClampedArray]";
    var uint16Tag = "[object Uint16Array]";
    var uint32Tag = "[object Uint32Array]";
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
    var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
    var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var freeProcess = moduleExports && freeGlobal.process;
    var nodeUtil = (function() {
      try {
        return freeProcess && freeProcess.binding && freeProcess.binding("util");
      } catch (e) {
      }
    })();
    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
    function arrayFilter(array, predicate) {
      var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }
    function arrayPush(array, values) {
      var index = -1, length = values.length, offset = array.length;
      while (++index < length) {
        array[offset + index] = values[index];
      }
      return array;
    }
    function arraySome(array, predicate) {
      var index = -1, length = array == null ? 0 : array.length;
      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true;
        }
      }
      return false;
    }
    function baseTimes(n, iteratee) {
      var index = -1, result = Array(n);
      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }
    function cacheHas(cache, key) {
      return cache.has(key);
    }
    function getValue(object, key) {
      return object == null ? void 0 : object[key];
    }
    function mapToArray(map) {
      var index = -1, result = Array(map.size);
      map.forEach(function(value, key) {
        result[++index] = [key, value];
      });
      return result;
    }
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    function setToArray(set) {
      var index = -1, result = Array(set.size);
      set.forEach(function(value) {
        result[++index] = value;
      });
      return result;
    }
    var arrayProto = Array.prototype;
    var funcProto = Function.prototype;
    var objectProto = Object.prototype;
    var coreJsData = root["__core-js_shared__"];
    var funcToString = funcProto.toString;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
      return uid ? "Symbol(src)_1." + uid : "";
    })();
    var nativeObjectToString = objectProto.toString;
    var reIsNative = RegExp(
      "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    );
    var Buffer2 = moduleExports ? root.Buffer : void 0;
    var Symbol2 = root.Symbol;
    var Uint8Array2 = root.Uint8Array;
    var propertyIsEnumerable = objectProto.propertyIsEnumerable;
    var splice = arrayProto.splice;
    var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
    var nativeGetSymbols = Object.getOwnPropertySymbols;
    var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0;
    var nativeKeys = overArg(Object.keys, Object);
    var DataView = getNative(root, "DataView");
    var Map2 = getNative(root, "Map");
    var Promise2 = getNative(root, "Promise");
    var Set2 = getNative(root, "Set");
    var WeakMap = getNative(root, "WeakMap");
    var nativeCreate = getNative(Object, "create");
    var dataViewCtorString = toSource(DataView);
    var mapCtorString = toSource(Map2);
    var promiseCtorString = toSource(Promise2);
    var setCtorString = toSource(Set2);
    var weakMapCtorString = toSource(WeakMap);
    var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
    var symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
    function Hash(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? void 0 : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : void 0;
    }
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
    }
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
      return this;
    }
    Hash.prototype.clear = hashClear;
    Hash.prototype["delete"] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;
    function ListCache(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }
    function listCacheDelete(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }
    function listCacheGet(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      return index < 0 ? void 0 : data[index][1];
    }
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }
    function listCacheSet(key, value) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype["delete"] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;
    function MapCache(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        "hash": new Hash(),
        "map": new (Map2 || ListCache)(),
        "string": new Hash()
      };
    }
    function mapCacheDelete(key) {
      var result = getMapData(this, key)["delete"](key);
      this.size -= result ? 1 : 0;
      return result;
    }
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }
    function mapCacheSet(key, value) {
      var data = getMapData(this, key), size = data.size;
      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype["delete"] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;
    function SetCache(values) {
      var index = -1, length = values == null ? 0 : values.length;
      this.__data__ = new MapCache();
      while (++index < length) {
        this.add(values[index]);
      }
    }
    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED);
      return this;
    }
    function setCacheHas(value) {
      return this.__data__.has(value);
    }
    SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
    SetCache.prototype.has = setCacheHas;
    function Stack(entries) {
      var data = this.__data__ = new ListCache(entries);
      this.size = data.size;
    }
    function stackClear() {
      this.__data__ = new ListCache();
      this.size = 0;
    }
    function stackDelete(key) {
      var data = this.__data__, result = data["delete"](key);
      this.size = data.size;
      return result;
    }
    function stackGet(key) {
      return this.__data__.get(key);
    }
    function stackHas(key) {
      return this.__data__.has(key);
    }
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map2 || pairs.length < LARGE_ARRAY_SIZE - 1) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }
    Stack.prototype.clear = stackClear;
    Stack.prototype["delete"] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
      for (var key in value) {
        if ((hasOwnProperty.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
        (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
        isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
        isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
        isIndex(key, length)))) {
          result.push(key);
        }
      }
      return result;
    }
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }
    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
    }
    function baseGetTag(value) {
      if (value == null) {
        return value === void 0 ? undefinedTag : nullTag;
      }
      return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
    }
    function baseIsArguments(value) {
      return isObjectLike(value) && baseGetTag(value) == argsTag;
    }
    function baseIsEqual(value, other, bitmask, customizer, stack) {
      if (value === other) {
        return true;
      }
      if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
        return value !== value && other !== other;
      }
      return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
    }
    function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
      var objIsArr = isArray(object), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag(object), othTag = othIsArr ? arrayTag : getTag(other);
      objTag = objTag == argsTag ? objectTag : objTag;
      othTag = othTag == argsTag ? objectTag : othTag;
      var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
      if (isSameTag && isBuffer(object)) {
        if (!isBuffer(other)) {
          return false;
        }
        objIsArr = true;
        objIsObj = false;
      }
      if (isSameTag && !objIsObj) {
        stack || (stack = new Stack());
        return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
      }
      if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
        var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
        if (objIsWrapped || othIsWrapped) {
          var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
          stack || (stack = new Stack());
          return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
        }
      }
      if (!isSameTag) {
        return false;
      }
      stack || (stack = new Stack());
      return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
    }
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }
    function baseIsTypedArray(value) {
      return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
    }
    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty.call(object, key) && key != "constructor") {
          result.push(key);
        }
      }
      return result;
    }
    function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
      if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
        return false;
      }
      var stacked = stack.get(array);
      if (stacked && stack.get(other)) {
        return stacked == other;
      }
      var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : void 0;
      stack.set(array, other);
      stack.set(other, array);
      while (++index < arrLength) {
        var arrValue = array[index], othValue = other[index];
        if (customizer) {
          var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
        }
        if (compared !== void 0) {
          if (compared) {
            continue;
          }
          result = false;
          break;
        }
        if (seen) {
          if (!arraySome(other, function(othValue2, othIndex) {
            if (!cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
            result = false;
            break;
          }
        } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
          result = false;
          break;
        }
      }
      stack["delete"](array);
      stack["delete"](other);
      return result;
    }
    function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
      switch (tag) {
        case dataViewTag:
          if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
            return false;
          }
          object = object.buffer;
          other = other.buffer;
        case arrayBufferTag:
          if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array2(object), new Uint8Array2(other))) {
            return false;
          }
          return true;
        case boolTag:
        case dateTag:
        case numberTag:
          return eq(+object, +other);
        case errorTag:
          return object.name == other.name && object.message == other.message;
        case regexpTag:
        case stringTag:
          return object == other + "";
        case mapTag:
          var convert = mapToArray;
        case setTag:
          var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
          convert || (convert = setToArray);
          if (object.size != other.size && !isPartial) {
            return false;
          }
          var stacked = stack.get(object);
          if (stacked) {
            return stacked == other;
          }
          bitmask |= COMPARE_UNORDERED_FLAG;
          stack.set(object, other);
          var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
          stack["delete"](object);
          return result;
        case symbolTag:
          if (symbolValueOf) {
            return symbolValueOf.call(object) == symbolValueOf.call(other);
          }
      }
      return false;
    }
    function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
      if (objLength != othLength && !isPartial) {
        return false;
      }
      var index = objLength;
      while (index--) {
        var key = objProps[index];
        if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
          return false;
        }
      }
      var stacked = stack.get(object);
      if (stacked && stack.get(other)) {
        return stacked == other;
      }
      var result = true;
      stack.set(object, other);
      stack.set(other, object);
      var skipCtor = isPartial;
      while (++index < objLength) {
        key = objProps[index];
        var objValue = object[key], othValue = other[key];
        if (customizer) {
          var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
        }
        if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
          result = false;
          break;
        }
        skipCtor || (skipCtor = key == "constructor");
      }
      if (result && !skipCtor) {
        var objCtor = object.constructor, othCtor = other.constructor;
        if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
          result = false;
        }
      }
      stack["delete"](object);
      stack["delete"](other);
      return result;
    }
    function getAllKeys(object) {
      return baseGetAllKeys(object, keys, getSymbols);
    }
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
    }
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : void 0;
    }
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
      try {
        value[symToStringTag] = void 0;
        var unmasked = true;
      } catch (e) {
      }
      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }
    var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
      if (object == null) {
        return [];
      }
      object = Object(object);
      return arrayFilter(nativeGetSymbols(object), function(symbol) {
        return propertyIsEnumerable.call(object, symbol);
      });
    };
    var getTag = baseGetTag;
    if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map2 && getTag(new Map2()) != mapTag || Promise2 && getTag(Promise2.resolve()) != promiseTag || Set2 && getTag(new Set2()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
      getTag = function(value) {
        var result = baseGetTag(value), Ctor = result == objectTag ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString:
              return dataViewTag;
            case mapCtorString:
              return mapTag;
            case promiseCtorString:
              return promiseTag;
            case setCtorString:
              return setTag;
            case weakMapCtorString:
              return weakMapTag;
          }
        }
        return result;
      };
    }
    function isIndex(value, length) {
      length = length == null ? MAX_SAFE_INTEGER : length;
      return !!length && (typeof value == "number" || reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
    }
    function isKeyable(value) {
      var type = typeof value;
      return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
    }
    function isMasked(func) {
      return !!maskSrcKey && maskSrcKey in func;
    }
    function isPrototype(value) {
      var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
      return value === proto;
    }
    function objectToString(value) {
      return nativeObjectToString.call(value);
    }
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {
        }
        try {
          return func + "";
        } catch (e) {
        }
      }
      return "";
    }
    function eq(value, other) {
      return value === other || value !== value && other !== other;
    }
    var isArguments = baseIsArguments(/* @__PURE__ */ (function() {
      return arguments;
    })()) ? baseIsArguments : function(value) {
      return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
    };
    var isArray = Array.isArray;
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }
    var isBuffer = nativeIsBuffer || stubFalse;
    function isEqual2(value, other) {
      return baseIsEqual(value, other);
    }
    function isFunction(value) {
      if (!isObject(value)) {
        return false;
      }
      var tag = baseGetTag(value);
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
    }
    function isLength(value) {
      return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    function isObject(value) {
      var type = typeof value;
      return value != null && (type == "object" || type == "function");
    }
    function isObjectLike(value) {
      return value != null && typeof value == "object";
    }
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }
    function stubArray() {
      return [];
    }
    function stubFalse() {
      return false;
    }
    module.exports = isEqual2;
  }
});

// src/types.ts
var FusionStateErrorMessages = /* @__PURE__ */ ((FusionStateErrorMessages2) => {
  FusionStateErrorMessages2["PROVIDER_MISSING"] = "ReactFusionState Error: useFusionState must be used within a FusionStateProvider";
  FusionStateErrorMessages2["KEY_ALREADY_INITIALIZING"] = `ReactFusionState Error: Key "{0}" is already being initialized. Consider checking if the key is being initialized elsewhere or if there's a logic error.`;
  FusionStateErrorMessages2["KEY_MISSING_NO_INITIAL"] = 'ReactFusionState Error: Key "{0}" does not exist and no initial value provided. Ensure the key is initialized with a value before use.';
  FusionStateErrorMessages2["PERSISTENCE_READ_ERROR"] = "ReactFusionState Error: Failed to read state from storage: {0}";
  FusionStateErrorMessages2["PERSISTENCE_WRITE_ERROR"] = "ReactFusionState Error: Failed to write state to storage: {0}";
  FusionStateErrorMessages2["STORAGE_ADAPTER_MISSING"] = "ReactFusionState Error: Storage adapter is required for persistence configuration";
  return FusionStateErrorMessages2;
})(FusionStateErrorMessages || {});

// src/storage/storageAdapters.ts
var createNoopStorageAdapter = () => ({
  async getItem(key) {
    return null;
  },
  async setItem(key, value) {
  },
  async removeItem(key) {
  }
});
var createLocalStorageAdapter = () => ({
  async getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  },
  async setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  },
  async removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  }
});
var NoopStorageAdapter = createNoopStorageAdapter;

// src/storage/autoDetect.ts
function detectBestStorageAdapter() {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem("fusion_test", "test");
      window.localStorage.removeItem("fusion_test");
      return createLocalStorageAdapter();
    } catch (e) {
      console.warn("localStorage d\xE9tect\xE9 mais non disponible:", e);
    }
  }
  if (typeof global !== "undefined" && typeof navigator !== "undefined" && navigator.product === "ReactNative") {
    try {
      console.warn(
        "Environnement React Native d\xE9tect\xE9. Veuillez fournir explicitement un adaptateur pour AsyncStorage."
      );
    } catch (e) {
    }
  }
  return createNoopStorageAdapter();
}
function createMemoryStorageAdapter() {
  const storage = /* @__PURE__ */ new Map();
  return {
    async getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    async setItem(key, value) {
      storage.set(key, value);
    },
    async removeItem(key) {
      storage.delete(key);
    }
  };
}

// src/utils.ts
var formatErrorMessage = (message, ...values) => {
  return values.reduce((msg, value, index) => {
    return msg.replace(`{${index}}`, value);
  }, message);
};
function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
function simpleDeepEqual(a, b) {
  if (a === b) return true;
  return JSON.stringify(a) === JSON.stringify(b);
}

// src/FusionStateProvider.tsx
var GlobalStateContext = React.createContext(void 0);
var useGlobalState = () => {
  const context = React.useContext(GlobalStateContext);
  if (!context) {
    throw new Error("ReactFusionState Error: useFusionState must be used within a FusionStateProvider" /* PROVIDER_MISSING */);
  }
  return context;
};
function normalizePersistenceConfig(config) {
  if (!config) return void 0;
  const defaultAdapter = detectBestStorageAdapter();
  if (typeof config === "boolean") {
    return {
      adapter: defaultAdapter,
      // L'interface PersistenceConfig accepte soit un tableau de clés, soit une fonction de filtre
      persistKeys: (key) => key.startsWith("persist."),
      loadOnInit: true,
      saveOnChange: true
    };
  }
  if (Array.isArray(config)) {
    return {
      adapter: defaultAdapter,
      persistKeys: config,
      loadOnInit: true,
      saveOnChange: true
    };
  }
  if ("adapter" in config && !("keyPrefix" in config)) {
    return config;
  }
  const simpleConfig = config;
  let keyFilter;
  if (simpleConfig.persistKeys) {
    if (Array.isArray(simpleConfig.persistKeys)) {
      keyFilter = simpleConfig.persistKeys;
    } else if (typeof simpleConfig.persistKeys === "function") {
      keyFilter = (key) => {
        const filterFn = simpleConfig.persistKeys;
        return filterFn(key, null);
      };
    }
  } else {
    keyFilter = (key) => key.startsWith("persist.");
  }
  return {
    adapter: simpleConfig.adapter || defaultAdapter,
    persistKeys: keyFilter,
    keyPrefix: simpleConfig.keyPrefix,
    debounceTime: simpleConfig.debounce,
    loadOnInit: true,
    saveOnChange: true
  };
}
var FusionStateProvider = React.memo(
  ({ children, initialState = {}, debug = false, persistence }) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const normalizedPersistence = React.useMemo(
      () => normalizePersistenceConfig(persistence),
      [persistence]
    );
    const persistenceRef = React.useRef(normalizedPersistence);
    const storageAdapter = React.useMemo(
      () => {
        var _a2;
        return ((_a2 = persistenceRef.current) == null ? void 0 : _a2.adapter) || createNoopStorageAdapter();
      },
      []
    );
    const keyPrefix = ((_a = persistenceRef.current) == null ? void 0 : _a.keyPrefix) || "fusion_state";
    const shouldLoadOnInit = (_c = (_b = persistenceRef.current) == null ? void 0 : _b.loadOnInit) != null ? _c : true;
    const shouldSaveOnChange = (_e = (_d = persistenceRef.current) == null ? void 0 : _d.saveOnChange) != null ? _e : true;
    const debounceTime = (_g = (_f = persistenceRef.current) == null ? void 0 : _f.debounceTime) != null ? _g : 0;
    const [state, setStateRaw] = React.useState(initialState);
    const initializingKeys = React.useRef(/* @__PURE__ */ new Set());
    const isInitialLoadDone = React.useRef(false);
    const prevPersistedState = React.useRef({});
    React.useEffect(() => {
      if (shouldLoadOnInit && !isInitialLoadDone.current && storageAdapter) {
        const loadStateFromStorage = async () => {
          try {
            const storedDataRaw = await storageAdapter.getItem(
              `${keyPrefix}_all`
            );
            if (storedDataRaw) {
              const storedData = JSON.parse(storedDataRaw);
              setStateRaw((prevState) => ({
                ...prevState,
                ...storedData
              }));
              prevPersistedState.current = { ...storedData };
            }
            isInitialLoadDone.current = true;
            if (debug) {
              console.log(
                "[FusionState] Loaded state from storage:",
                storedDataRaw ? JSON.parse(storedDataRaw) : null
              );
            }
          } catch (error) {
            console.error(
              formatErrorMessage(
                "ReactFusionState Error: Failed to read state from storage: {0}" /* PERSISTENCE_READ_ERROR */,
                String(error)
              )
            );
          }
        };
        loadStateFromStorage();
      }
    }, [storageAdapter, keyPrefix, shouldLoadOnInit, debug]);
    const filterPersistKeys = React.useMemo(() => {
      return (newState) => {
        var _a2;
        const persistKeys = (_a2 = persistenceRef.current) == null ? void 0 : _a2.persistKeys;
        if (!persistKeys) return { ...newState };
        const filteredState = {};
        if (Array.isArray(persistKeys)) {
          persistKeys.forEach((key) => {
            if (key in newState) {
              filteredState[key] = newState[key];
            }
          });
        } else if (typeof persistKeys === "function") {
          Object.keys(newState).forEach((key) => {
            const filterFn = persistKeys;
            if (filterFn(key, newState[key])) {
              filteredState[key] = newState[key];
            }
          });
        }
        return filteredState;
      };
    }, []);
    const saveStateToStorage = React.useMemo(() => {
      const save = async (newState) => {
        if (!storageAdapter || !shouldSaveOnChange) return;
        try {
          const stateToSave = filterPersistKeys(newState);
          const hasChanged = !simpleDeepEqual(
            stateToSave,
            prevPersistedState.current
          );
          if (!hasChanged) return;
          const persistenceConfig = persistenceRef.current;
          if (persistenceConfig) {
            const customSaveCallback = "customSaveCallback" in persistenceConfig ? persistenceConfig.customSaveCallback : void 0;
            if (customSaveCallback && typeof customSaveCallback === "function") {
              await customSaveCallback(stateToSave, storageAdapter, keyPrefix);
            } else {
              await storageAdapter.setItem(
                `${keyPrefix}_all`,
                JSON.stringify(stateToSave)
              );
            }
          } else {
            await storageAdapter.setItem(
              `${keyPrefix}_all`,
              JSON.stringify(stateToSave)
            );
          }
          prevPersistedState.current = { ...stateToSave };
          if (debug) {
            console.log("[FusionState] Saved state to storage:", stateToSave);
          }
        } catch (error) {
          console.error(
            formatErrorMessage(
              "ReactFusionState Error: Failed to write state to storage: {0}" /* PERSISTENCE_WRITE_ERROR */,
              String(error)
            )
          );
        }
      };
      return debounceTime > 0 ? debounce(save, debounceTime) : save;
    }, [
      storageAdapter,
      keyPrefix,
      shouldSaveOnChange,
      debug,
      debounceTime,
      filterPersistKeys
    ]);
    const setState = React.useMemo(() => {
      const setStateWithPersistence = (updater) => {
        setStateRaw((prevState) => {
          const nextState = typeof updater === "function" ? updater(prevState) : updater;
          if (shouldSaveOnChange) {
            saveStateToStorage(nextState);
          }
          if (debug) {
            console.log("[FusionState] State updated:", {
              previous: prevState,
              next: nextState,
              diff: Object.fromEntries(
                Object.entries(nextState).filter(
                  ([key, value2]) => prevState[key] !== value2
                )
              )
            });
          }
          return nextState;
        });
      };
      return setStateWithPersistence;
    }, [debug, setStateRaw, shouldSaveOnChange, saveStateToStorage]);
    const value = React.useMemo(
      () => ({
        state,
        setState,
        initializingKeys: initializingKeys.current
      }),
      [state, setState]
    );
    return /* @__PURE__ */ React__default.default.createElement(GlobalStateContext.Provider, { value }, children);
  }
);

// src/useFusionState.ts
function useFusionState(key, initialValue, options) {
  var _a;
  const { state, setState, initializingKeys } = useGlobalState();
  const isInitialized = React.useRef(false);
  const skipLocalState = (_a = options == null ? void 0 : options.skipLocalState) != null ? _a : false;
  const initializing = React.useRef(/* @__PURE__ */ new Set());
  const initializeState = React.useCallback(() => {
    if (!isInitialized.current) {
      if (initialValue !== void 0 && !(key in state)) {
        if (initializingKeys.has(key)) {
          throw new Error(
            formatErrorMessage(
              `ReactFusionState Error: Key "{0}" is already being initialized. Consider checking if the key is being initialized elsewhere or if there's a logic error.` /* KEY_ALREADY_INITIALIZING */,
              key
            )
          );
        }
        initializing.current.add(key);
        setState((prev) => ({ ...prev, [key]: initialValue }));
        initializing.current.delete(key);
        isInitialized.current = true;
      } else if (!(key in state)) {
        throw new Error(
          formatErrorMessage(
            'ReactFusionState Error: Key "{0}" does not exist and no initial value provided. Ensure the key is initialized with a value before use.' /* KEY_MISSING_NO_INITIAL */,
            key
          )
        );
      } else {
        isInitialized.current = true;
      }
    }
  }, [initialValue, key, state, setState, initializingKeys]);
  React.useEffect(() => {
    initializeState();
  }, [initializeState]);
  const [localValue, setLocalValue] = React.useState(
    () => key in state ? state[key] : initialValue
  );
  React.useEffect(() => {
    if (!skipLocalState && key in state) {
      const newValue = state[key];
      if (newValue !== localValue) {
        setLocalValue(newValue);
      }
    }
  }, [state, key, localValue, skipLocalState]);
  const setValue = React.useCallback(
    (newValue) => {
      setState((prevState) => {
        const currentValue = prevState[key];
        const nextValue = typeof newValue === "function" ? newValue(currentValue) : newValue;
        if (nextValue === currentValue) {
          return prevState;
        }
        return { ...prevState, [key]: nextValue };
      });
    },
    [key, setState]
  );
  return [skipLocalState ? state[key] : localValue, setValue];
}

// src/useFusionStateLog.tsx
var import_lodash = __toESM(require_lodash());
var useFusionStateLog = (keys, options = {}) => {
  const { state } = useGlobalState();
  const previousState = React.useRef({});
  const {
    trackChanges = false,
    changeDetection = "reference",
    formatter = void 0,
    consoleLog = false
  } = options;
  const compareValues = React.useCallback(
    (a, b) => {
      if (changeDetection === "reference") {
        return a === b;
      } else if (changeDetection === "deep") {
        return (0, import_lodash.default)(a, b);
      } else {
        return simpleDeepEqual(a, b);
      }
    },
    [changeDetection]
  );
  const filteredState = React.useMemo(() => {
    if (!keys || keys.length === 0) {
      return state;
    }
    const result = {};
    keys.forEach((key) => {
      if (key in state) {
        result[key] = state[key];
      }
    });
    return result;
  }, [state, keys]);
  React.useEffect(() => {
    let changes;
    if (trackChanges) {
      changes = {};
      Object.entries(filteredState).forEach(([key, value]) => {
        const prevValue = previousState.current[key];
        const hasChanged = !compareValues(value, prevValue);
        if (hasChanged) {
          changes[key] = {
            previous: prevValue,
            current: value
          };
        }
      });
      if (Object.keys(changes).length === 0) {
        changes = void 0;
      }
    }
    previousState.current = { ...filteredState };
    if (consoleLog && (changes || !trackChanges)) {
      const logData = formatter ? formatter(filteredState, changes) : { state: filteredState, ...changes && { changes } };
      console.log("[FusionState Log]", logData);
    }
  }, [filteredState, trackChanges, consoleLog, formatter, compareValues]);
  return filteredState;
};
function usePersistentState(key, initialValue) {
  const persistKey = key.startsWith("persist.") ? key : `persist.${key}`;
  return useFusionState(persistKey, initialValue);
}
function useFrequentState(key, initialValue) {
  return useFusionState(key, initialValue, { skipLocalState: true });
}
function useFormState(formKey, initialValues) {
  const [formData, setFormData] = useFusionState(formKey, initialValues);
  const updateField = React.useCallback(
    (field, value) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value
      }));
    },
    [setFormData]
  );
  const resetForm = React.useCallback(() => {
    setFormData(initialValues);
  }, [setFormData, initialValues]);
  return [formData, updateField, resetForm];
}
function useCounter(key, initialValue = 0) {
  const [count, setCount] = useFusionState(key, initialValue);
  const increment = React.useCallback(() => {
    setCount((prev) => prev + 1);
  }, [setCount]);
  const decrement = React.useCallback(() => {
    setCount((prev) => prev - 1);
  }, [setCount]);
  const setValue = React.useCallback(
    (value) => {
      setCount(value);
    },
    [setCount]
  );
  return [count, increment, decrement, setValue];
}
function useToggle(key, initialValue = false) {
  const [value, setValue] = useFusionState(key, initialValue);
  const toggle = React.useCallback(() => {
    setValue((prev) => !prev);
  }, [setValue]);
  return [value, toggle, setValue];
}

exports.FusionStateErrorMessages = FusionStateErrorMessages;
exports.FusionStateProvider = FusionStateProvider;
exports.NoopStorageAdapter = NoopStorageAdapter;
exports.createLocalStorageAdapter = createLocalStorageAdapter;
exports.createMemoryStorageAdapter = createMemoryStorageAdapter;
exports.createNoopStorageAdapter = createNoopStorageAdapter;
exports.debounce = debounce;
exports.detectBestStorageAdapter = detectBestStorageAdapter;
exports.formatErrorMessage = formatErrorMessage;
exports.simpleDeepEqual = simpleDeepEqual;
exports.useCounter = useCounter;
exports.useFormState = useFormState;
exports.useFrequentState = useFrequentState;
exports.useFusionState = useFusionState;
exports.useFusionStateLog = useFusionStateLog;
exports.useGlobalState = useGlobalState;
exports.usePersistentState = usePersistentState;
exports.useToggle = useToggle;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map