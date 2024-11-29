export enum GlobalSettingPlayErrorType {
  NEXT = 1,
  PAUSE = 2
}

export interface GlobalSetting {

  // 播放异常
  playError: GlobalSettingPlayErrorType;
  // 边听边存
  playDownload: boolean;
  // 默认播放质量
  playQuality: "low" | "standard" | "high" | "super";
  // 播放本地音乐，自动匹配词图
  playAttachment: boolean;

  // 歌词字体大小
  lyricFontSize: number;
  // 歌词颜色
  lyricColor: string;
  // 歌词边框颜色
  lyricBorderColor: string;

  // 插件启动时自动更新
  pluginAutoUpdate: boolean;
  // 插件忽略版本
  pluginIgnoreVersion: boolean;

  // 启用代理
  proxyEnabled: boolean;
  // 代理主机
  proxyHost: string;
  // 代理端口
  proxyPort: number;
  // 代理用户名
  proxyUser: string;
  // 代理密码
  proxyPassword: string;

}

export function buildGlobalSetting(): GlobalSetting {
  return {
    playError: GlobalSettingPlayErrorType.NEXT,
    playDownload: false,
    playQuality: "super",
    playAttachment: false,
    lyricFontSize: 36,
    lyricColor: '#0052D9',
    lyricBorderColor: 'rgba(110, 110, 110, 0.8)',
    pluginAutoUpdate: false,
    pluginIgnoreVersion: false,
    proxyEnabled: false,
    proxyHost: '',
    proxyPort: 7890,
    proxyUser: '',
    proxyPassword: ''
  }
}