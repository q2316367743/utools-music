export const Constants = {
  // 插件的ID
  uid: 'zy106ads',
  // 项目名称，英文名称
  id: 'utools-music',
  // 项目中文名称
  name: '音乐播放器',
  // 版本
  version: '1.1.0',
  // 作者
  author: '落雨不悔',
  website: 'https://blog.esion.xyz',
  // 仓库
  repo: '',
  umami: {
    id: '888d78b7-155c-44b1-8d4e-62d2fa6de2b6',
    url: 'https://umami.esion.xyz'
  }
}

// ".mp3",
//   ".mp4",
//   ".m4s",
//   ".flac",
//   ".wma",
//   ".wav",
//   ".m4a",
//   ".ogg",
//   ".acc",
//   ".aac",
//   // ".ape",
//   ".opus",
export const MUSIC_REGEX = /.*\.mp3|flac|wav|mp4|m4s|wma|m4a|ogg|acc|aac|opus$/;
export const MUSIC_EXTNAME = ['.mp3', '.flac', '.wav', '.mp4', '.m4s', '.wma', '.m4a', '.ogg',
  '.acc', '.aac', 'opus'];
export const IMAGE_REGEX = /.*\.jpg|jpeg|png|webp$/;
export const IMAGE_EXTNAME = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
export const LYRIC_REGEX = /.*\.lrc$/;
export const LYRIC_EXTNAME = ['.lrc'];
