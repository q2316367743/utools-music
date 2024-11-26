import {versionCompare} from "@/utils/lang/FieldUtil";

interface UpdateLogGroup {
  version: string;
  logs: Array<string>;
}

export const getUpdateLogs = (newVersion: string, oldVersion: string): Array<UpdateLogGroup> => {
  const list = new Array<UpdateLogGroup>();
  UPDATE_LOG.forEach(log => {
    if (versionCompare(newVersion, log.version) >= 0) {
      list.push(log);
    }else if (versionCompare(oldVersion, log.version) <= 0) {
      list.push(log);
    }
  })
  return list;
}

const UPDATE_LOG: Array<UpdateLogGroup> = [{
  version: '1.0.1',
  logs: [
    "feat: 新增热门歌单",
    "feat: 新增排行榜",
    "feat: 现在网络歌单可以收藏了",
    "feat: 新增插件订阅",
    "feat: 音乐搜索新增分页功能",
    "fix: 搜索音乐界面，如果插件过多，会导致插件隐藏",
    "update: 菜单栏优化，增加图标，更加美观"
  ]
}]