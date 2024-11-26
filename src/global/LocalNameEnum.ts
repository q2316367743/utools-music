export enum LocalNameEnum {
  /**
   * 下载项
   * @see DownloadItem
   */
  LIST_DOWNLOAD = '/list/download',
  /**
   * 仓库列表
   * @see Repository
   */
  LIST_REPOSITORY = '/list/repository',

  /**
   * 音乐列表，后面跟着仓库ID，但是由于LIST_MUSIC_GROUP的存在，所以在批量查询是，建议后面加个/
   * @see MusicItem
   */
  LIST_MUSIC = '/list/music',

  /**
   * 音歌单列表
   * @see MusicGroupIndex
   */
  LIST_MUSIC_GROUP = '/list/music-group',

  /**
   * 歌单内容
   * @see MusicGroupContent
   */
  ITEM_MUSIC_GROUP = '/item/music-group',

  /**
   * 插件订阅
   * @see PluginSubscribe
   */
  LIST_PLUGIN_SUBSCRIBE = '/list/plugin-subscribe',

  /**
   * 插件项
   * @see PluginEntity
   */
  ITEM_PLUGIN = '/item/plugin',

  KEY_GLOBAL_SETTING = '/key/global-setting',

  KEY_DOWNLOAD_FOLDER = '/key/download-folder',

  KEY_VERSION = '/key/version',

}
