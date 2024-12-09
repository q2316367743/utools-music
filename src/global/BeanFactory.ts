import {MusicLyric} from "@/components/MusicWindow/MusicLyric";
import {MusicControls} from "@/components/MusicWindow/MusicControls";
import {useUtoolsDbStorage} from "@/hooks/UtoolsDbStorage";
import {LocalNameEnum} from "@/global/LocalNameEnum";

export const musicLyric = new MusicLyric();
export const musicControls = new MusicControls();

export const musicControlsDataX = useUtoolsDbStorage<number | undefined>(
  LocalNameEnum.DATA_WINDOW_CONTROL_POS_X, undefined);
export const musicControlsDataY = useUtoolsDbStorage<number | undefined>(
  LocalNameEnum.DATA_WINDOW_CONTROL_POS_Y, undefined);