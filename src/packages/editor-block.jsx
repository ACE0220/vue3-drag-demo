import { computed, defineComponent, inject } from "vue";

export default defineComponent({
    props: {
        data: {
            type: Object
        }
    },
    setup(props) {
        const blockStyles = computed(() => ({
            top: `${props.data.top}px`,
            left: `${props.data.left}px`,
            zIndex: `${props.data.zIndex}`
        }))
        const config = inject('config');
        return () => {
            // 通过block的key属性直接获取对应的组件
            const component = config.componentMap[props.data.key];
            const RenderComponent = component.render();
            return <div class="editor-block" style={blockStyles.value}>
                {RenderComponent}
            </div>
        }
    }
})