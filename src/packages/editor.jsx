import { defineComponent, computed, inject, ref } from "vue";
import deepcopy from 'deepcopy';
import './editor.scss';

import EditorBlock from './editor-block'
import { useMenuDragger } from "./useMenuDragger";
import { useFocus } from "./useFocus";
import { useBlockDragger } from "./useBlockDragger";

export default defineComponent({
    props: {
        modelValue: { type: Object }
    },
    emits: ['update:modelValue'], // 要触发的时间
    setup(props, ctx) {

        const data = computed({
            get() {
                return props.modelValue
            },
            set(newVal) {
                ctx.emit('update:modelValue', deepcopy(newVal))
            }
        })

        const containerStyles = computed(() => ({
            width: data.value.container.width + 'px',
            height: data.value.container.height + 'px'
        }))

        const config = inject('config')

        const containerRef = ref(null); 
        // 1. 实现菜单拖拽
        const { dragStart, dragEnd } = useMenuDragger(containerRef, data);

        // 2.实现获取焦点, 选中后可能直接拖拽
        
        const {onBlockMouseDown, containerMouseDown, focusData} = useFocus(data, (e) => {
            // 获取焦点马上拖拽
            mousedown(e);
        });
        const { mousedown } = useBlockDragger(focusData);

       
        
        

        // 3.实现拖拽多个元素的功能
        

        return () => <div class="editor">
            <div class="editor-left">
                {/* 根据注册列表渲染对应内容 可以实现h5的拖拽*/}
                {config.componentList.map(component => (
                    <div class="editor-left-item"
                        draggable={true}
                        onDragstart={e => dragStart(e, component)}
                        onDragend={dragEnd}
                    >
                        <span>{component.label}</span>
                        <div>{component.preview()}</div>
                    </div>
                ))}
            </div>
            <div class="editor-top">菜单栏</div>
            <div class="editor-right">属性控制栏</div>
            <div class="editor-container">
                {/* 负责产生滚动条 */}
                <div class="editor-container-canvas">
                    {/* 内容产生区域 */}
                    <div class="editor-container-canvas__content"
                        style={containerStyles.value}
                        ref={containerRef}
                        onMousedown={containerMouseDown}
                    >
                        {
                            (data.value.blocks.map(item => (
                                <EditorBlock
                                    class={item.focus ? 'editor-block-focus' : ''}
                                    data={item}
                                    onMousedown={(e) => onBlockMouseDown(e, item)}
                                ></EditorBlock>
                            )))
                        }
                    </div>
                </div>
            </div>
        </div>
    }
})