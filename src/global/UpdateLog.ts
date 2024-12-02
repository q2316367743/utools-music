import {versionCompare} from "@/utils/lang/FieldUtil";

interface UpdateLogGroup {
  version: string;
  logs: Array<string>;
}

export const getUpdateLogs = (newVersion: string, oldVersion: string): Array<UpdateLogGroup> => {
  const list = new Array<UpdateLogGroup>();
  UPDATE_LOG.forEach(log => {
    console.log(newVersion, log.version, oldVersion);
    console.log(versionCompare(newVersion, log.version))
    console.log(versionCompare(oldVersion, log.version));
    if (versionCompare(newVersion, log.version) >= 0 && versionCompare(oldVersion, log.version) < 0) {
      list.push(log);
    }
  })
  return list;
}

const UPDATE_LOG: Array<UpdateLogGroup> = [{
  version: '1.0.2',
  logs: [
    "feat: 开启【允许推送内容到搜索框】后，可以在搜索框直接搜索到歌单，选中后直接播放",
    "feat: 完成插件设置变量功能",
    "feat: 完善导入歌单、导入歌曲功能，在插件管理列表，如果插件支持相关功能，会出现【导】按钮",
    "update: 我的歌单逻辑优化，页面更加美观，操作更加方便",
    "重点更新: 本地歌曲列表、我的歌单列表新增右键菜单"
  ]
}, {
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