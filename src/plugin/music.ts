import {LyricLine} from "@/types/LyricLine";

export function transferTextToLyric(text: string): Array<LyricLine> {
  const lyricLines = new Array<LyricLine>();
  const lines = text.split("\n");
  for (let line of lines) {
    const time = line.match(/\[\d{2}:\d{2}\.\d{2}]/g);
    const text = line.replace(/\[\d{2}:\d{2}\.\d{2}]/g, '');
    if (time) {
      time.forEach(t => {
        const minutes = parseInt(t.slice(1, 3));
        const seconds = parseFloat(t.slice(4, 9));
        const timeInSeconds = minutes * 60 + seconds;
        lyricLines.push({
          text: text.trim(),
          start: timeInSeconds,
          end: 0
        })
      });
    }
  }
  return lyricLines;
}