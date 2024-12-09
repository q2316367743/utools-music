export interface DownloadIngItem {
  id: number;
  name: string;
  artist: string;
  music: string;
  // 1下载中,2成功,3失败
  msg: string;
  url: string;
  cover?: string;
  lyric?: string;
  progress: number;
  total: number;
}


export interface DownloadItem extends DownloadIngItem {
  // 1下载中,2成功,3失败
  status: 1 | 2 | 3;
}
