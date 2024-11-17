import {MusicItem} from "@/entity/MusicItem";

export interface MusicPlayEvent {
  views: Array<MusicItem>;
  index: number;
}

export const useMusicPlay = useEventBus<MusicPlayEvent>('music-play');
export const useMusicAppend = useEventBus<MusicItem>('music-append');
export const useAddMusicGroup = useEventBus('add-music-group');