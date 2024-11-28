import {MusicGroupType} from "@/entity/MusicGroup";
import {DialogPlugin} from "tdesign-vue-next";
import {useMusicGroupStore} from "@/store";
import {MusicIcon, PlusIcon} from "tdesign-icons-vue-next";
import './MusicGroupChoose.less';
import {addMusicGroup} from "@/pages/music-group/list/components/MusicGroupFunc";

/**
 * 歌单选择器
 * @param types 什么类型的歌单
 * @param header 标题
 * @return 歌单ID
 */
export function musicGroupChoose(
  types: Array<MusicGroupType>,
  header = "选择歌单"
): Promise<number> {

  const groups = computed(() => useMusicGroupStore().musicGroupItems.filter(e =>
    types.includes(e.type || MusicGroupType.LOCAL)));

  return new Promise<number>(resolve => {
    const onConfirm = (id: number) => {
      resolve(id);
      dialogInstance.destroy();
    }

    const dialogInstance = DialogPlugin({
      header,
      top: '10vh',
      footer: false,
      default: () => <div class={'music-group-choose'}>
        <div class={'music-group-choose__item'} onClick={addMusicGroup}>
          <div class={'cover'}>
            {h(PlusIcon, {size: '45px'})}
          </div>
          <div class={'title'}>新增</div>
        </div>
        {groups.value.map(group =>
          <div class={'music-group-choose__item'} key={group.id} onClick={() => onConfirm(group.id)}>
            <div class={'cover'}>
              {group.cover ? <img src={group.cover} alt={group.name}/> : <MusicIcon size={'45px'}/>}
            </div>
            <div class={'title'}>{group.name}</div>
          </div>)}
      </div>
    });
  })

}