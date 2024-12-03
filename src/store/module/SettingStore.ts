import {buildGlobalSetting} from "@/entity/GlobalSetting";
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

export const downloadFolder = useStorage(
  `${LocalNameEnum.KEY_DOWNLOAD_FOLDER}/${utools.getNativeId()}`,
  utools.getPath("music"),
  utools.dbStorage,
  {
    deep: true,
    flush: "sync"
  }
)

export const pluginFontFamily = useStorage(
  `${LocalNameEnum.KEY_FONT_FAMILY}/${utools.getNativeId()}`,
  '',
  utools.dbStorage,
  {
    deep: true,
    flush: "sync"
  }
)

export const fontFamily = computed(() => {
  if (!pluginFontFamily.value) {
    return 'PingFang SC, Microsoft YaHei, Arial Regular, serif';
  }
  return `${pluginFontFamily.value}, PingFang SC, Microsoft YaHei, Arial Regular, serif`;
});
