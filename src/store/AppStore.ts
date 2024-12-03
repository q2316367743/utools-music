import {ref, watch} from "vue";
import {VXETable} from "vxe-table";
import {useColorMode} from "@/hooks/ColorMode";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import {useUtoolsDbAsync} from "@/hooks/UtoolsDbAsync";

export const detach = ref(utools.getWindowType() !== 'main');
export const collapsed =  useUtoolsDbAsync<boolean>(LocalNameEnum.KEY_COLLAPSED, false);

export const colorMode = useColorMode({
  key: LocalNameEnum.KEY_COLOR_MODE,
  attribute: 'theme-mode',
  selector: 'html'
});


watch(colorMode, mode => {
  if (mode === 'auto') {
    VXETable.setTheme(utools.isDarkColors() ? 'dark' : 'light')
    return;
  }
  VXETable.setTheme(mode)
}, {immediate: true})