import {MusicItemView} from "@/entity/MusicItem";

export interface MusicPlayEvent {
  views: Array<MusicItemView>;
  index: number;
}

export const useMusicPlay = useEventBus<MusicPlayEvent>('music-play');
export const useMusicAppend = useEventBus<MusicItemView>('music-append');
export const useAddMusicGroup = useEventBus('add-music-group');