import {
  VxeTable,
  VxeColumn,
  VxeColgroup,
  VxeGrid,
  VxeToolbar, VxeTableMenuModule
} from 'vxe-table'
import {App} from "vue";

// 导入主题变量，也可以重写主题变量
import 'vxe-table/lib/style.css'

// 导入默认的语言

export function lazyVxeTable (app: App) {
  app.use(VxeTable)
  app.use(VxeColumn)
  app.use(VxeColgroup)
  app.use(VxeGrid)
  app.use(VxeToolbar)
  app.use(VxeTableMenuModule)
}

