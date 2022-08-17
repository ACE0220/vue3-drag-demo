// 列表区可以显示所有物料
// 可以对应的组件映射关系

import { ElButton, ElInput } from "element-plus";

function createEditorConfig() {
    const componentList = [];
    const componentMap = {};

    return {
        componentList,
        componentMap,
        register: (component) => {
            componentList.push(component);
            componentMap[component.key] = component;
        }
    }
}

const createInputProp = (label) => ({ type: 'input', label })
const createColorProp = (label) => ({ type: 'color', label })
const createSelectProp = (label, options) => ({ type: 'select', label, options })

export let registerConfig = createEditorConfig();

registerConfig.register({
    label: '文本',
    preview: () => '预览文本',
    render: () => '渲染文本',
    key: 'text',
    props: {
        text: createInputProp('文本内容'),
        color: createColorProp('字体颜色'),
        size: createSelectProp('字体大小', [
            {
                label: '14px',
                value: '14px'
            },
            {
                label: '20px',
                value: '20px'
            },
            {
                label: '24px',
                value: '24px'
            },
        ])
    }
})

registerConfig.register({
    label: '按钮',
    preview: () => <ElButton>预览按钮</ElButton>,
    render: () => <ElButton>渲染按钮</ElButton>,
    key: 'button',
    props: {
        text: createInputProp('按钮内容'),
        type: createSelectProp('按钮类型', [
            { label: '默认', value: 'default' },
            { label: '成功', value: 'success' },
            { label: '警告', value: 'warning' },
            { label: '危险', value: 'danger' },
            { label: '文本', value: 'text' },
        ]),
        size: createSelectProp('按钮尺寸', [
            { label: '默认', value: '' },
            { label: '极小', value: 'mini' },
            { label: '小', value: 'small' },
            { label: '中', value: 'medium' },
            { label: '大', value: 'large' },
        ])
    }
})

registerConfig.register({
    label: '输入',
    preview: () => <ElInput placeholder="预览输入框"></ElInput>,
    render: () => <ElInput placeholder="渲染输入框"></ElInput>,
    key: 'input',
})