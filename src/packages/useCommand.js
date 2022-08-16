import deepcopy from "deepcopy";
import { onUnmounted } from "vue";
import { events } from "./event";

export function useCommand(data) {
    // 前进后退需要指针
    const state = {
        current: -1, // 前进后退的索引值
        queue: [], // 存放所有的操作命令
        commands: {}, // 制作命令和命令执行功能的一个映射表
        commandArray: [], // 存放所有命令
        destroyArray: [] // 销毁列表
    }

    const registry = (command) => {
        state.commandArray.push(command);
        state.commands[command.name] = (...args) => { // 命令名称对应执行函数
            const { redo, undo } = command.execute(...args);
            redo();
            if (!command.pushQueue) { // 不需要放到队列直接跳过
                return;
            }

            let { queue, current } = state;
            // 如果先放了组件1 -> 组件2 -> 撤回 -> 组件3
            // 最后 组件1 -> 组件3
            if (queue.length > 0) {
                queue = queue.slice(0, current + 1); // 可能在放置的过程中有撤销操作，根据当前最新的current值计算新的队列
                state.queue = queue;
            }

            queue.push({ redo, undo }); // 保存指令的前进后退
            state.current = current + 1;
        }
    }

    registry({
        name: 'redo',
        keyboard: 'ctrl+y',
        execute() {
            return {
                redo() {
                    let item = state.queue[state.current + 1];
                    if (item) {
                        item.redo && item.redo();
                        state.current++;
                    }
                }
            }
        }
    });

    registry({
        name: 'undo',
        keyboard: 'ctrl+z',
        execute() {
            return {
                redo() {
                    if (state.current === -1) return; // 没有可以撤销的了
                    let item = state.queue[state.current]; // 找到上一步还原
                    if (item) {
                        item.undo && item.undo();
                        state.current--;
                    }
                }
            }
        }
    });

    registry({ // 如果希望将操作放到队列可以增加一个属性标识等会操作要放到队列
        name: 'drag',
        pushQueue: true,
        init() { // 初始化操作默认会执行
            this.before = null;
            // 监控拖拽开始时间，保存状态
            const start = () => {
                this.before = deepcopy(data.value.blocks);
            }
            // 拖拽之后需要触发对应指令
            const end = () => {
                state.commands.drag();
            }
            events.on('start', start);
            events.on('end', end);
            return () => {
                events.off('start', start);
                events.off('end', end);
            }
        },
        execute() {
            let before = this.before;
            let after = data.value.blocks; // 之后的状态
            return {
                redo() {
                    // 默认松手就直接把当前事情做了
                    data.value = { ...data.value, blocks: after };
                },
                undo() {
                    // 前一步的
                    data.value = { ...data.value, blocks: before };
                }
            }
        }
    });

    // 带有历史记录常用的模式
    registry({
        name: 'updateContainer', // 更新整个容器
        pushQueue: true,
        execute(newVal) {
            let state = {
                before: data.value, // 当前的值
                after: newVal // 新值
            }
            return {
                redo: () => {
                    data.value = state.after;
                },
                undo: () => {
                    data.value = state.before;
                }
            }
            
        }
    })


    const keyboardEvent = (() => {
        const keyCodes = {
            90: 'z',
            80: 'y'
        }
        const onKeyDown = (e) => {
            const { ctrlKey, keyCode } = e;
            let keyString = [];
            if (ctrlKey) keyString.push('ctrl');
            keyString.push(keyCodes[keyCode]);
            keyString = keyString.join('+');
        
            state.commandArray.forEach(({ keyboard, name }) => {
                if (!keyboard) return; // 没有键盘事件
                if (keyboard === keyString) {
                    state.commands[name]();
                    e.preventDefault();
                }
            })
        }
        const init = () => { // 初始化
            window.addEventListener('keydown', onKeyDown)
            return () => { // 销毁

            }
        }
        return init;
    })()

        ; (() => {
            // 监听键盘
            state.destroyArray.push(keyboardEvent())
            state.commandArray.forEach(command => command.init && state.destroyArray.push(command.init()));
        })();

    onUnmounted(() => { // 清理绑定的时间
        state.destroyArray.forEach(fn => fn && fn());
    })
    return state;
}