export function memoize() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    if (!descriptor.get) {
      throw new Error(`@memoize can only be used for property accessors`);
    }
    let originalGet = descriptor.get;
    descriptor.get = memoizedAccessor(originalGet, propertyKey);
  };
}

function memoizedAccessor(
  originalGet: Function,
  propertyKey: string
): () => void {
  return function (this: any) {
    if (!this._memoizeCache) {
      this._memoizeCache = new Map();
    }
    if (!this._memoizeCache.has(propertyKey)) {
      let value = originalGet.call(this);
      this._memoizeCache.set(propertyKey, value);
    }
    return this._memoizeCache.get(propertyKey);
  };
}
