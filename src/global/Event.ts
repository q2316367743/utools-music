import {MusicInstance} from "@/types/MusicInstance";

export interface MusicPlayEvent {
  views: Array<MusicInstance>;
  index: number;
}

export const useMusicPlay = useEventBus<MusicPlayEvent>('music-play');
export const useMusicAppend = useEventBus<MusicInstance>('music-append');