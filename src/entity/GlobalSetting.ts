export enum GlobalSettingPlayErrorType {
  NEXT = 1,
  PAUSE = 2
}

// 全局设置
export interface GlobalSetting {

  // 控制器样式
  globalControl: '0' | '1' | '2',

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
    globalControl: '1',
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

/**
 * 本地设置
 */
export interface NativeSetting {

  // 插件背景
  bgType: 'none' | 'color' | 'linearGradient' | 'image';
  // 背景颜色
  bgColor: string;
  // 背景渐变
  bgGradient: string;
  // 背景图片
  bgImage: string;
  // 背景模糊像素
  bgBlur: number;

  // 歌词字体
  lyricFontFamily: string;

}

export function buildNativeSetting(): NativeSetting {
  return {
    bgType: 'none',
    bgColor: '',
    bgGradient: '',
    bgImage: '',
    bgBlur: 5,
    lyricFontFamily: ''
  }
}