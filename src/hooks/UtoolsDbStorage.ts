import {Ref} from "vue";
import {clone} from "@/utils/lang/ObjUtil";

/**
 * 异步对象存储
 */
export function useUtoolsDbStorage<T>(
  key: string,
  initialValue: T
): Ref<T> {
  return customRef((track, trigger) => ({
    get() {
      track()
      return utools.dbStorage.getItem(key) || initialValue;
    },
    set(value) {
      try {
        utools.dbStorage.setItem(key, toRaw(value));
      }catch (e) {
        utools.dbStorage.setItem(key, clone(value, true));
      }
      trigger()
    }
  }))

}
