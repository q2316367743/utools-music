import {buildGlobalSetting} from "@/entity/GlobalSetting";

export  const globalSetting = useStorage(
  "setting-store",
  buildGlobalSetting(),
  utools.dbStorage,
  {
    deep: true,
    flush: "sync"
  }
);