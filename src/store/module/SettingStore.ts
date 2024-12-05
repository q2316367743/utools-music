import {buildGlobalSetting, buildNativeSetting} from "@/entity/GlobalSetting";
import {LocalNameEnum} from "@/global/LocalNameEnum";

export const globalSetting = useStorage(
  LocalNameEnum.KEY_GLOBAL_SETTING,
  buildGlobalSetting(),
  utools.dbStorage,
  {
    deep: true,
    flush: "sync"
  }
);
export const nativeSetting = useStorage(
  `${LocalNameEnum.KEY_NATIVE_SETTING}/${utools.getNativeId()}`,
  buildNativeSetting(),
  utools.dbStorage,
  {
    deep: true,
    flush: "sync"
  }
);

export const downloadFolder = useStorage(
  `${LocalNameEnum.KEY_DOWNLOAD_FOLDER}/${utools.getNativeId()}`,
  utools.getPath("music"),
  utools.dbStorage,
  {
    deep: true,
    flush: "sync"
  }
)


export const fontFamily = computed(() => {
  if (!nativeSetting.value.lyricFontFamily) {
    return 'PingFang SC, Microsoft YaHei, Arial Regular, serif';
  }
  return `${nativeSetting.value.lyricFontFamily}, PingFang SC, Microsoft YaHei, Arial Regular, serif`;
});
