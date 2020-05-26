
export type OrPromise<T> = T | Promise<T>;

export interface RecordMap<Props extends Record<string, any>> extends Map<keyof Props, Props[keyof Props]> {
  delete<K extends keyof Props>(key: K): boolean;
  forEach<K extends keyof Props, V extends Props[K]>(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void;
  get<K extends keyof Props>(key : K) : Props[K];
  has<K extends keyof Props>(key: K): boolean;
  set<K extends keyof Props, V extends Props[K]>(key: K, value: V): this;
}
