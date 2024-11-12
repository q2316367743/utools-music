export interface DownloadItem {
  id: number;
  name: string;
  artist: string;
  music: string;
  // 1下载中,2成功,3失败
  status: 1|2|3;
  msg: string;
}
