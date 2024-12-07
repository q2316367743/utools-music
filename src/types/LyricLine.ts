export interface LyricLine {
  start: number;
  end: number;
  text: string;
  time: string;
}

export interface LyricContent {
  id: number;
  lines: Array<LyricLine>
}
