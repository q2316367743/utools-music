import {MusicListItem} from "@/music/MusicUtil";

export interface MusicPlayEvent {
  views: Array<MusicListItem>;
  index: number;
}

export const useMusicPlay = useEventBus<MusicPlayEvent>('music-play');
export const useMusicAppend = useEventBus<MusicListItem>('music-append');