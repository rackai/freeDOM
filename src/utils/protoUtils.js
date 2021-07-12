'use strict'

import { isArray, isObject, isObjectLike, mergeArray } from './object'

export const generateHash = () => Math.random().toString(36).substring(2)

// hashing
export const protoStackRegistry = {}
export const protoCachedRegistry = {}

window.protoStackRegistry = protoStackRegistry
window.protoCachedRegistry = protoCachedRegistry

export const getHashedProto = proto => {
  return protoStackRegistry[proto.__hash]
}

export const setHashedProto = (proto, stack) => {
  const hash = generateHash()
  proto.__hash = hash
  protoStackRegistry[hash] = stack
  return protoStackRegistry[hash]
}

export const getProtoStackRegistry = (proto, stack) => {
  if (proto.__hash) {
    return stack.concat(getHashedProto(proto))
  } else {
    setHashedProto(proto, stack)
  }
  return stack // .concat(hashedProto)
}

// stacking
export const extractArrayProto = (proto, stack) => {
  proto.forEach(each => flattenProto(each, stack))
  return stack
}

export const deepProto = (proto, stack) => {
  const protoOflattenProto = proto.proto
  if (protoOflattenProto) {
    flattenProto(protoOflattenProto, stack)
  }
  return stack
}

export const flattenProto = (proto, stack) => {
  if (!proto) return stack
  if (isArray(proto)) return extractArrayProto(proto, stack)
  stack.push(proto)
  if (proto.proto) deepProto(proto, stack)
  return stack
}

// merging
export const deepCloneProto = obj => {
  const o = {}
  for (const prop in obj) {
    const objProp = obj[prop]
    // if (isObject(objProp)) {
    //   o[prop] = deepCloneProto(objProp)
    if (isObject(objProp)) {
      o[prop] = deepCloneProto(objProp)
    } else if (isArray(objProp)) {
      o[prop] = objProp.map(x => x)
    } else o[prop] = objProp
  }
  return o
}

export const deepMergeProto = (element, proto) => {
  for (const e in proto) {
    const elementProp = element[e]
    const protoProp = proto[e]
    if (elementProp === undefined) {
      element[e] = protoProp
    } else if (isObjectLike(elementProp) && isObject(protoProp)) {
      deepMergeProto(elementProp, protoProp)
    }
  }
  return element
}

export const cloneAndMergeArrayProto = stack => {
  return stack.reduce((a, c) => {
    return deepMergeProto(a, deepCloneProto(c))
  }, {})
}

// joint stacks
export const jointStacks = (protoStack, childProtoStack) => {
  return []
    .concat(protoStack.slice(0, 1))
    .concat(childProtoStack.slice(0, 1))
    .concat(protoStack.slice(1))
    .concat(childProtoStack.slice(1))
}

// init
export const getProtoStack = proto => {
  if (!proto) return []
  if (proto.__hash) return getHashedProto(proto)
  const stack = flattenProto(proto, [])
  // console.log(stack)
  return getProtoStackRegistry(proto, stack)
}

export const getProtoMerged = proto => {
  const stack = getProtoStack(proto)
  return cloneAndMergeArrayProto(stack)
}
