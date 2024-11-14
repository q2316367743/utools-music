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