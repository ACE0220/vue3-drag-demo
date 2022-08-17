import { provide, inject, computed, createVNode, defineComponent, onMounted, reactive, render, ref, onBeforeUnmount } from "vue";

const DropdownComponent = defineComponent({
    props: {
        options: {
            type: Object
        }
    },
    
    setup(props, ctx) {
        const state = reactive({
            options: props.options,
            isShow: false,
            top: 0,
            left: 0
        })
        ctx.expose({
            showDropdown(options) {
                state.options = options;
                state.isShow = true;
                let {left, top, height} = options.el.getBoundingClientRect();
                state.top = top + height;
                state.left = left;
            }
        })
        provide('hide', () => {
            state.isShow = false;
        })
        const classes = computed(() => [
            'dropdown',
            {
                'dropdown-isShow': state.isShow
            }
        ])

        const styles = computed(() => ({
            top: state.top + 'px',
            left: state.left + 'px',
        }))

        const el = ref(null);
        const onMouseDownDocument = (e) => {
            if(!el.value.contains(e.target)) {
                state.isShow = false;
            }
        }

        onMounted(() => {
            // 事件的传递行为是先捕获再冒泡
            // 之前为了组织事件传播，给每个block都增加了stopPropagation
            document.addEventListener('mousedown',onMouseDownDocument,true);
        })

        onBeforeUnmount(() => {
            document.removeEventListener('mousedown',onMouseDownDocument);
        })
        return () => {
            return <div class={classes.value} style={styles.value} ref={el}>{
                state.options.content()
            }</div>
        }
    }
})

let vnode;
export function $dropdown(options) {
    if (!vnode) {
        // 手动挂载组件
        let el = document.createElement('div');

        // 将组件渲染成虚拟节点
        vnode = createVNode(DropdownComponent, { options });
        // 渲染成真实节点并挂载到页面
        document.body.appendChild((render(vnode, el), el));
    }
    // 将组件渲染到这个el元素
    let { showDropdown } = vnode.component.exposed;
    showDropdown(options); // !vnode说明第一次调用，vnode已存在说明组件已经有了，只需要显示出来即可
}