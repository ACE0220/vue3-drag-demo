import { defineComponent, computed, inject } from "vue";
import './editor.scss';

import EditorBlock from './editor-block'

export default defineComponent({
    props: {
        modelValue: { type: Object }
    },
    setup(props) {

        const data = computed({
            get() {
                return props.modelValue
            }
        })

        const containerStyles = computed(() => ({
            width: data.value.container.width + 'px',
            height: data.value.container.height + 'px'
        }))

        const config = inject('config')

        return () => <div class="editor">
            <div class="editor-left">
                {/* 根据注册列表渲染对应内容 */}
                {config.componentList.map(component => {
                    return <div class="editor-left-item">
                        <span>{component.label}</span>
                        <div>{component.preview()}</div>
                    </div>
                })}

            </div>
            <div class="editor-top">菜单栏</div>
            <div class="editor-right">属性控制栏</div>
            <div class="editor-container">
                {/* 负责产生滚动条 */}
                <div class="editor-container-canvas">
                    {/* 内容产生区域 */}
                    <div class="editor-container-canvas__content" style={containerStyles.value}>
                        {
                            (data.value.blocks.map(item => (
                                <EditorBlock data={item}></EditorBlock>
                            )))
                        }
                    </div>
                </div>
            </div>
        </div>
    }
})