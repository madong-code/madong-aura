import type { DrawerApiOptions, DrawerState } from './drawer'

import { Store } from '#/core/shared/store'
import { bindMethods, isFunction } from '#/core/shared/utils'

export class DrawerApi {
  // 共享数据
  public sharedData: Record<'payload', any> = {
    payload: {}
  }
  public store: Store<DrawerState>

  private api: Pick<
    DrawerApiOptions,
    'onBeforeClose' | 'onCancel' | 'onClosed' | 'onConfirm' | 'onOpenChange' | 'onOpened'
  >

  private state!: DrawerState

  constructor(options: DrawerApiOptions = {}) {
    const {
      connectedComponent: _,
      onBeforeClose,
      onCancel,
      onClosed,
      onConfirm,
      onOpenChange,
      onOpened,
      ...storeState
    } = options

    const defaultState: DrawerState = {
      class: '',
      closable: true,
      closeIconPlacement: 'right',
      closeOnClickModal: true,
      closeOnPressEscape: true,
      confirmLoading: false,
      contentClass: '',
      footer: true,
      header: true,
      isOpen: false,
      loading: false,
      modal: true,
      openAutoFocus: false,
      placement: 'right',
      showCancelButton: true,
      showConfirmButton: true,
      submitting: false,
      title: ''
    }

    this.store = new Store<DrawerState>({
      ...defaultState,
      ...storeState
    })

    this.store.subscribe((state, previousState) => {
      // 注意：Store 为就地变异（Object.assign）后通知，监听器内 this.state 与 state
      // 是同一 reactive 对象、已是新值；上一次快照必须取 Store 传入的 previousState，
      // 否则新旧值恒等，onOpenChange 永远不会触发（编辑抽屉详情加载/表单回填全部失效）。
      this.state = state
      if (state?.isOpen !== previousState?.isOpen) {
        this.api.onOpenChange?.(!!state?.isOpen)
      }
    })
    this.state = this.store.state
    this.api = {
      onBeforeClose,
      onCancel,
      onClosed,
      onConfirm,
      onOpenChange,
      onOpened
    }
    bindMethods(this)
  }

  /**
   * 关闭抽屉
   * @description 关闭抽屉时会调用 onBeforeClose 钩子函数，如果 onBeforeClose 返回 false，则不关闭弹窗
   */
  async close() {
    const allowClose = (await this.api.onBeforeClose?.()) ?? true
    if (allowClose) {
      this.store.setState((prev) => ({
        ...prev,
        isOpen: false,
        submitting: false
      }))
    }
  }

  getData<T extends object = Record<string, any>>() {
    return (this.sharedData?.payload ?? {}) as T
  }

  /**
   * 锁定抽屉状态（用于提交过程中的等待状态）
   */
  lock(isLocked: boolean = true) {
    return this.setState({ submitting: isLocked })
  }

  /**
   * 取消操作
   */
  onCancel() {
    if (this.api.onCancel) {
      this.api.onCancel?.()
    } else {
      this.close()
    }
  }

  /**
   * 弹窗关闭动画播放完毕后的回调
   */
  onClosed() {
    if (!this.state.isOpen) {
      this.api.onClosed?.()
    }
  }

  /**
   * 确认操作
   */
  onConfirm() {
    this.api.onConfirm?.()
  }

  /**
   * 弹窗打开动画播放完毕后的回调
   */
  onOpened() {
    if (this.state.isOpen) {
      this.api.onOpened?.()
    }
  }

  open() {
    this.store.setState((prev) => ({ ...prev, isOpen: true }))
  }

  setData<T>(payload: T) {
    this.sharedData.payload = payload
    return this
  }

  setState(stateOrFn: ((prev: DrawerState) => Partial<DrawerState>) | Partial<DrawerState>) {
    if (isFunction(stateOrFn)) {
      this.store.setState(stateOrFn)
    } else {
      this.store.setState((prev) => ({ ...prev, ...stateOrFn }))
    }
    return this
  }

  /**
   * 解除抽屉的锁定状态
   */
  unlock() {
    return this.lock(false)
  }
}
