export class Utils {

  public static setDifference(a, b) {
    return new Set(Utils.toConsumableArray(a).filter(function (x) {
      return !b.has(x);
    }));
  }

  public static setIntersection(a, b) {
    return new Set(Utils.toConsumableArray(a).filter(function (x) {
      return b.has(x);
    }));
  }

  public static setUnion(a, b) {
    return new Set([].concat(Utils.toConsumableArray(a), Utils.toConsumableArray(b)));
  }

  private static toConsumableArray(arr): any {
    return Utils.arrayWithoutHoles(arr) || Utils.iterableToArray(arr) || Utils.nonIterableSpread();
  }

  private static nonIterableSpread(): void {
    throw new TypeError('Invalid attempt to spread non-iterable instance');
  }

  private static iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === '[object Arguments]') {
      return Array.from(iter);
    }
  }

  private static arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      let arr2 = new Array(arr.length);
      for (let i = 0; i < arr.length; i++) {
        arr2[i] = arr[i];
      }
      return arr2;
    }
  }
}
