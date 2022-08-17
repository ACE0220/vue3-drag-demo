import { ElButton, ElColorPicker, ElForm, ElFormItem, ElInput, ElInputNumber, ElOption, ElSelect } from "element-plus";
import { defineComponent, inject } from "vue";

export default defineComponent({
    props: {
        block: {
            type: Object // 用户最后选中的元素
        },
        data: {
            type: Object // 当前所有数据
        }
    },
    setup(props) {

        const config = inject('config'); // 组件配置信息

        return () => {
            let content = [];
            if (!props.block) {
                content.push(<><ElFormItem label='容器宽度'>
                    <ElInputNumber></ElInputNumber>
                </ElFormItem>
                    <ElFormItem label='容器宽度'>
                        <ElInputNumber></ElInputNumber>
                    </ElFormItem></>)
            } else {
                let component = config.componentMap[props.block.key];
                if(component && component.props) {
                    content.push( Object.entries(component.props).map(([propName, propConfig]) => {
                        console.log(propConfig);
                        return <ElFormItem label={propConfig.label}>
                            {{
                                input: () => <ElInput></ElInput>,
                                color: () => <ElColorPicker></ElColorPicker>,
                                select: () => <ElSelect>
                                    {propConfig.options.map(opt => {
                                        return <ElOption label={opt.label} value={opt.value}></ElOption>
                                    })}
                                </ElSelect>
                            }[propConfig.type]()}
                        </ElFormItem>
                    }))
                }
            }
            return <ElForm labelPosition='top' style='padding: 30px'>
                {content}
                <ElFormItem>
                    <ElButton type='primary'>应用</ElButton>
                    <ElButton type=''>重置</ElButton>
                </ElFormItem>
            </ElForm>
        }
    }
})