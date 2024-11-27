import {useMusicGroupStore} from "@/store";
import Fuse from "fuse.js";
import {isEmptyArray} from "@/utils/lang/FieldUtil";
import {useMusicPlay} from "@/global/Event";
import {MusicInstanceLocal, MusicInstanceWeb} from "@/types/MusicInstance";
import {MusicGroupType} from "@/entity/MusicGroup";

interface MainPushResultItem {
  icon?: string,
  text: string,
  title?: string;
}

interface MainPushResultAction<T> {
  code: string,
  type: string,
  payload: T
}

interface MainPushResultActionSelect<T> extends MainPushResultAction<T> {
  option: MainPushResultItem
}

export interface MainPushResult<T = any> {
  onMainPush: (action: MainPushResultAction<T>) => MainPushResultItem[],
  onSelectCallback: (action: MainPushResultActionSelect<T>) => void
}

export function useMainPush(): MainPushResult<string> {
  return {
    onMainPush: action => {
      const {musicGroupItems} = useMusicGroupStore();
      const {code, payload} = action;
      if (code === 'music-group') {
        const fuse = new Fuse(musicGroupItems, {
          keys: [{
            name: 'name'
          }]
        });
        const results = fuse.search(payload);
        return results.map(e => e.item)
          .map(e => ({
            icon: 'public/logo.png',
            text: e.name,
            title: `播放歌单【${e.name}】`,
            id: e.id,
          }));
      }
      return [];
    },
    onSelectCallback: action => {
      const {loadMusicItems} = useMusicGroupStore();
      const {musicGroupItems} = useMusicGroupStore();
      const {option} = action;
      // @ts-ignore
      let find = musicGroupItems.find(e => e.id === option.id);
      // @ts-ignore
      loadMusicItems(option.id)
        .then(items => {
          if (isEmptyArray(items)) {
            utools.showNotification(`歌单【${option.text}】没有音乐`)
            return
          }
          if (find) {
            if (find.type === MusicGroupType.WEB) {
              useMusicPlay.emit({
                views: items.map(e => new MusicInstanceWeb(e, find.pluginId!)),
                index: 0
              });
            } else {
              useMusicPlay.emit({
                views: items.map(e => new MusicInstanceLocal(e)),
                index: 0
              });
            }
          }
        });
    }
  }
}