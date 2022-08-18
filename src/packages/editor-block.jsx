import { computed, defineComponent, inject, onMounted, ref } from "vue";
import BlockResize from "./block-resize";

export default defineComponent({
    props: {
        data: {
            type: Object
        },
        formData: {
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

        const blockRef = ref(null);
        onMounted(() => {
            let { offsetWidth, offsetHeight } = blockRef.value;
            if (props.data.alignCenter) { // 拖拽松手的时候才渲染，其他的默认渲染不需要居中
                props.data.left = props.data.left - offsetWidth / 2;
                props.data.top = props.data.top - offsetHeight / 2;
                props.data.alignCenter = false; // 让渲染后的结果才能去居中
            }
            props.data.width = offsetWidth;
            props.data.height = offsetHeight;
        })

        return () => {
            // 通过block的key属性直接获取对应的组件
            const component = config.componentMap[props.data.key];
            const RenderComponent = component.render({
                size: props.data.hasResize ? {width: props.data.width, height: props.data.height} : {},
                props: props.data.props,
                model: Object.keys(component.model || {}).reduce((prev, modelName) => {
                    let propName = props.data.model[modelName];
                    prev[modelName] = {
                        modelValue: props.formData[propName],
                        'onUpdate:modelValue': v => props.formData[propName] = v
                    }
                    return prev;
                }, {})
            });
            const {width, height} = component.resize || {};
            return <div class="editor-block" style={blockStyles.value} ref={blockRef}>
                {RenderComponent}
                {/* 传递block的目的是为了修改当前block的宽高，component存放的是修改高度或宽度，或两者 */}
                {props.data.focus && (width || height) && <BlockResize
                    block={props.data}
                    component={component}
                ></BlockResize>}
            </div>
        }
    }
})