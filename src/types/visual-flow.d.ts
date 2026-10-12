/**
 * visual-flow 私有库类型声明
 * lib/visual-flow/visual-flow.js 无内置类型，此处补齐组件与命名导出类型。
 */

declare module '#lib/visual-flow/visual-flow.js' {
  import type { DefineComponent } from 'vue';

  /** 流程设计器组件（FlowDesigner，注册名为 VisualFlow） */
  const VisualFlowComponent: DefineComponent<Record<string, any>> & {
    install(app: any, options?: any): void;
  };

  /** @logicflow/core 默认导出 */
  const LogicFlow: any;
  /** @logicflow/core 命名空间 */
  const LogicFlowCore: any;
  /** @logicflow/extension */
  const LogicFlowExtension: any;

  export { LogicFlow, LogicFlowCore, LogicFlowExtension };
  export default VisualFlowComponent;
}
