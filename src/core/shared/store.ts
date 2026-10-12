import { computed, reactive, shallowReactive, type Ref } from 'vue';

type Listener<TState> = (
  state: TState,
  previousState: TState,
) => void;
type Updater<TState> = (state: TState) => Partial<TState> | TState | void;

/**
 * 极简 Store —— 对齐业务代码实际使用到的 @tanstack/vue-store 子集
 *
 * 支持：new Store(initialState)、store.state（Vue 深响应式）、
 * store.subscribe(listener)、store.setState(partial | updater)
 */
class Store<TState extends object> {
  #initialState: TState;
  #listeners = new Set<Listener<TState>>();

  /** 响应式状态，模板中直接消费 */
  public state: TState;

  constructor(initialState: TState) {
    this.#initialState = initialState;
    this.state = reactive(initialState) as TState;
  }

  /**
   * 更新状态：传入对象则浅合并，传入函数则取其返回值浅合并
   */
  setState(
    stateOrFn: Partial<TState> | TState | Updater<TState>,
  ): TState {
    const previousState = { ...this.state };
    const partial =
      typeof stateOrFn === 'function'
        ? (stateOrFn as Updater<TState>)(this.state)
        : stateOrFn;

    if (partial && typeof partial === 'object') {
      Object.assign(this.state, partial);
    }

    for (const listener of this.#listeners) {
      listener(this.state, previousState as TState);
    }
    return this.state;
  }

  subscribe(listener: Listener<TState>): () => void {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  }

  /** 重置为初始状态引用 */
  resetState() {
    this.setState({ ...this.#initialState });
  }
}

/**
 * 浅层非响应式容器（部分 API 类持有 options 时使用）
 */
class SimpleStore<TState extends object> {
  state: TState;

  constructor(initialState: TState) {
    this.state = shallowReactive(initialState) as TState;
  }

  setState(stateOrFn: Partial<TState> | Updater<TState>): TState {
    const partial =
      typeof stateOrFn === 'function'
        ? (stateOrFn as Updater<TState>)(this.state)
        : stateOrFn;
    if (partial && typeof partial === 'object') {
      Object.assign(this.state, partial);
    }
    return this.state;
  }
}

/**
 * 以只读 Ref 形式订阅 Store 状态（对齐 @tanstack/vue-store 的 useStore 子集）
 */
function useStore<TState extends object, TSelected = TState>(
  store: Store<TState>,
  selector: (state: TState) => TSelected = (s) => s as unknown as TSelected,
): Readonly<Ref<TSelected>> {
  return computed(() => selector(store.state));
}

export { SimpleStore, Store, useStore };
export type { Listener, Updater };
