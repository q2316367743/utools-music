type ColorModeType = 'auto' | 'light' | 'dark';

interface UseColorModeProps {
  // 存储的键
  key?: string;
  // 选择器
  selector: string;
  // 属性
  attribute: string;
}

export const useColorMode = (props: UseColorModeProps): Ref<ColorModeType> => {
  const {key = '/key/color-mode', selector, attribute} = props;
  const colorMode = ref<ColorModeType>(utools.dbStorage.getItem(key) || 'auto');

  function onAutoColor() {
    if (colorMode.value != 'auto') {
      return;
    }
    document.querySelector(selector)?.setAttribute(attribute, utools.isDarkColors() ? 'dark' : 'light');

  }

  window.matchMedia("(prefers-color-scheme:dark)").addEventListener("change", onAutoColor);

  function renderColorMode() {
    if (colorMode.value === 'light') {
      document.querySelector(selector)?.setAttribute(attribute, 'light');
    } else if (colorMode.value === 'dark') {
      document.querySelector(selector)?.setAttribute(attribute, 'dark');
    } else {
      document.querySelector(selector)?.setAttribute(attribute, utools.isDarkColors() ? 'dark' : 'light');
    }
  }

  renderColorMode();

  watch(colorMode, val => {
    utools.dbStorage.setItem('/key/color-mode', val);
    renderColorMode();
  });

  return colorMode

}