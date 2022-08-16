import { ElButton, ElDialog, ElInput } from "element-plus";
import { createVNode, defineComponent, reactive, render } from "vue";

const DialogComponent = defineComponent({
    props: {
        options: {
            type: Object
        }
    },
    setup(props, ctx) {
        const state = reactive({
            options: props.options,
            isShow: false
        })
        ctx.expose({ // 让外界可以调用组件的方法
            showDialog(options) {
                state.options = options;
                state.isShow = true;
            }
        })

        const onCancel = () => {
            state.isShow = false;
        }
        const onComfirm = () => {
            state.options.onConfirm && state.options.onConfirm(state.options.content);
            onCancel();
        }
        return () => {
            return <ElDialog v-model={state.isShow} title={state.options.title}>
                {{
                    default: () => 
                    <ElInput 
                        type="textarea" 
                        v-model={state.options.content}
                        rows={10}
                    >
                    </ElInput>,
                    footer: () => state.options.footer && <div>
                        <ElButton onClick={onCancel}>取消</ElButton>
                        <ElButton onClick={onComfirm} type="primary">确认</ElButton>
                    </div>,
                }}
            </ElDialog>
        }
    }
})

let vnode;
export function $dialog(options) {
    if (!vnode) {
        // 手动挂载组件
        let el = document.createElement('div');

        // 将组件渲染成虚拟节点
        vnode = createVNode(DialogComponent, { options });
        // 渲染成真实节点并挂载到页面
        document.body.appendChild((render(vnode, el), el));
    }
    // 将组件渲染到这个el元素
    let { showDialog } = vnode.component.exposed;
    showDialog(options); // !vnode说明第一次调用，vnode已存在说明组件已经有了，只需要显示出来即可
}