/**
 * ECharts 插件配置
 *
 * 按需导入 ECharts 图表和组件，减小打包体积。
 * 只注册项目中实际使用的图表类型和组件。
 *
 * @module plugins/echarts
 * @author Art Design Pro Team + admin(vben) EchartsUI
 */

// ECharts 按需导入配置
import * as echarts from 'echarts/core'

// 导入图表类型
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  RadarChart,
  MapChart,
  CandlestickChart
} from 'echarts/charts'

// 导入组件
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  MarkPointComponent,
  MarkLineComponent,
  ToolboxComponent,
  BrushComponent,
  GeoComponent,
  VisualMapComponent,
  DatasetComponent,
  TransformComponent
} from 'echarts/components'

// 导入渲染器
import { CanvasRenderer } from 'echarts/renderers'

// 导入特性
import { LabelLayout, UniversalTransition } from 'echarts/features'

// 注册必要的组件
echarts.use([
  // 图表类型
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  RadarChart,
  MapChart,
  CandlestickChart,

  // 组件
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  MarkPointComponent,
  MarkLineComponent,
  ToolboxComponent,
  BrushComponent,
  GeoComponent,
  VisualMapComponent,
  DatasetComponent,
  TransformComponent,

  // 特性
  LabelLayout,
  UniversalTransition,

  // 渲染器
  CanvasRenderer
])

// 导出 echarts 实例和类型
export { echarts }
export type { EChartsOption, BarSeriesOption } from 'echarts'

// 导出常用的图形工具
export const graphic = echarts.graphic

export default echarts
