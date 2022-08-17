import { defineComponent, computed, inject, ref } from "vue";
import deepcopy from 'deepcopy';
import classnames from 'classnames';
import './editor.scss';

import EditorBlock from './editor-block'
import { useMenuDragger } from "./useMenuDragger";
import { useFocus } from "./useFocus";
import { useBlockDragger } from "./useBlockDragger";
import { useCommand } from "./useCommand";
import { $dialog } from "@/components/Dialog";
import { $dropdown } from "@/components/Dropdown";
import { DropdownItem } from "@/components/DropdownItem";
import EditorOperator from "@/components/editor-operator";

export default defineComponent({
    props: {
        modelValue: { type: Object }
    },
    emits: ['update:modelValue'], // 要触发的时间
    setup(props, ctx) {

        // 预览的时候内容不能再操作，可以点击、输入内容方便查看效果
        const previewRef = ref(false);
        // 当前是否编辑状态
        const edittorRef = ref(true);

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

        const { onBlockMouseDown, containerMouseDown, focusData, lastSelectBlock, clearBlockFocus } = useFocus(data, previewRef, (e) => {
            // 获取焦点马上拖拽
            mousedown(e);
        });
        // 3.拖拽多个元素的功能
        const { mousedown, markLine } = useBlockDragger(focusData, lastSelectBlock, data);


        const { commands } = useCommand(data, focusData); // []
        // 菜单栏
        const buttons = [
            { label: '撤销', icon: 'icon-back', handler: () => commands.undo() },
            { label: '重做', icon: 'icon-back', handler: () => commands.redo() },
            {
                label: '导出', icon: 'icon-back', handler: () => {
                    $dialog({
                        title: '导出JSON使用',
                        content: JSON.stringify(data.value)
                    })
                }
            },
            {
                label: '导入', icon: 'icon-back', handler: () => {
                    $dialog({
                        title: '导入JSON使用',
                        content: '',
                        footer: true,
                        onConfirm(text) {
                            // data.value = JSON.parse(text); // 这样更改无法保留历史记录
                            commands.updateContainer(JSON.parse(text));
                        }
                    })
                }
            },
            { label: '置顶', icon: 'icon-back', handler: () => commands.placeTop() },
            { label: '置底', icon: 'icon-back', handler: () => commands.placeBottom() },
            { label: '删除', icon: 'icon-back', handler: () => commands.delete() },
            {
                label: () => previewRef.value ? '编辑' : '预览', icon: 'icon-back', handler: () => {
                    previewRef.value = !previewRef.value;
                    clearBlockFocus();
                }
            },
            {
                label: '关闭', icon: 'icon-back', handler: () => {
                    edittorRef.value = false;
                    clearBlockFocus();
                }
            },
        ]

        const onContextMenuBlock = (e, block) => {
            e.preventDefault();
            $dropdown({
                el: e.target, // 以哪个元素为准产生一个dropdown
                content: () => { return<>
                    <DropdownItem label="删除" onClick={() => commands.delete()}></DropdownItem>
                    <DropdownItem label="置顶" onClick={() => commands.placeTop()}></DropdownItem>
                    <DropdownItem label="置底" onClick={() => commands.placeBottom()}></DropdownItem>
                    <DropdownItem label="查看" onClick={() => {
                        $dialog({
                            title: '查看节点数据',
                            content: JSON.stringify(block)
                        })
                    }}></DropdownItem>
                    <DropdownItem label="导入" onClick={() => {
                        $dialog({
                            title: '导入节点数据',
                            content: '',
                            footer: true,
                            onConfirm(text) {
                                text = JSON.parse(text);
                                commands.updateBlock(text, block);
                            }
                        })
                    }}></DropdownItem>
                </>}
            })
        }

        return () => !edittorRef.value ? <div>
            <div class="editor-container-canvas__content"
                style={containerStyles.value}
            >
                {
                    (data.value.blocks.map((item, index) => (
                        <EditorBlock
                            class="editor-block-preview"
                            data={item}
                        ></EditorBlock>
                    )))
                }
            </div>
            <div onClick={() => edittorRef.value = true}>继续编辑</div>
        </div> : <div class="editor">
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
            <div class="editor-top">
                {
                    buttons.map((btn, index) => {
                        return <div class='editor-top-button' onClick={btn.handler}>
                            <span>{typeof btn.label === 'function' ? btn.label() : btn.label}</span>
                        </div>
                    })
                }
            </div>
            <div class="editor-right">
                <EditorOperator block={lastSelectBlock.value} data={data.value}></EditorOperator>
            </div>
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
                            (data.value.blocks.map((item, index) => (
                                <EditorBlock
                                    class={classnames(item.focus ? 'editor-block-focus' : '', previewRef.value ? 'editor-block-preview' : '')}
                                    data={item}
                                    onMousedown={(e) => onBlockMouseDown(e, item, index)}
                                    onContextmenu = {(e) => onContextMenuBlock(e, item)}
                                ></EditorBlock>
                            )))
                        }
                        {markLine.x !== null && <div class="line-x" style={{ left: markLine.x + 'px' }}></div>}
                        {markLine.y !== null && <div class="line-y" style={{ top: markLine.y + 'px' }}></div>}
                    </div>

                </div>
            </div>
        </div>
    }
})