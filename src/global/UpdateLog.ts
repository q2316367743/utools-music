import {versionCompare} from "@/utils/lang/FieldUtil";

interface UpdateLogGroup {
  version: string;
  logs: Array<string>;
}

export const getUpdateLogs = (newVersion: string, oldVersion: string): Array<UpdateLogGroup> => {
  const list = new Array<UpdateLogGroup>();
  UPDATE_LOG.forEach(log => {
    if (versionCompare(newVersion, log.version) >= 0 && versionCompare(oldVersion, log.version) < 0) {
      list.push(log);
    }
  })
  return list;
}

const UPDATE_LOG: Array<UpdateLogGroup> = [{
  version: '1.0.4',
  logs: [
    'feat: 本地音乐播放时，可以在本地音乐列表快速定位正在播放的歌曲',
    'feat: 新增音乐控制器，新增了3中不同的样式，可以在设置中修改',
    'fixed: 歌曲名字中如果带特殊字符会保存失败的问题'
  ]
}, {
  version: '1.0.3',
  logs: [
    'feat: 新增歌词搜索，可以一键替换歌词并直接下载到本地',
    'feat: 主题优化，增加背景图，透明优化',
    'feat: 可以自定义歌词字体',
    'update: 所有的列表，点击任意歌曲都会播放列表，而不是现在只播放一首',
    'update: 首页优化，菜单可以收起'
  ],
}, {
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