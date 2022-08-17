import { createVNode, defineComponent, inject, render } from "vue";

export const DropdownItem = defineComponent({
    props: {
        label: String
    },
    setup(props, ctx) {
        let hide = inject('hide')
        return () => <div class="dropdown-item" onClick={hide}>
            <span>{props.label}</span>
        </div>
    }
})

// let vnode;
// export function DropdownItem(options) {
//     if(!vnode) {
//         // 手动挂载组件
//         let el = document.createElement('div');

//         // 将组件渲染成虚拟节点
//         vnode = createVNode(DropdownItemComponent, { options });
//         // 渲染成真实节点并挂载到页面
//         document.body.appendChild((render(vnode, el), el));
//     }
// } 