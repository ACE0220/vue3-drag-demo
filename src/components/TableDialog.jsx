import deepcopy from "deepcopy";
import { ElButton, ElDialog, ElInput, ElTable, ElTableColumn } from "element-plus";
import { createVNode, defineComponent, reactive, render } from "vue";

const TableComponnet = defineComponent({
    props: {
        options: { type: Object }
    },
    setup(props, ctx) {
        const state = reactive({
            options: props.options,
            isShow: false,
            editData: []
        })
        let methods = {
            show(options) {
                state.options = options; // 缓存用户配置
                state.isShow = true; // 更改显示设置
                state.editData = deepcopy(options.data) // 通过渲染的数据，默认展现
            }
        }
        ctx.expose(methods);

        const add = () => {
            state.editData.push({})
        }

        const onCancel = () => {
            state.isShow = false;
        }

        const onConfirm = () => {
            state.options.onConfirm && state.options.onConfirm(state.editData);
            onCancel();
        }

        return () => {
            return <ElDialog title={state.options.config.label} v-model={state.isShow}>
                {{
                    default: () => (
                        <div>
                            <div>
                                <ElButton onClick={add}>添加</ElButton>
                                <ElButton>重置</ElButton>
                            </div>
                            <ElTable data={state.editData}>
                                <ElTableColumn type='index'></ElTableColumn>
                                {
                                    state.options.config.table.options.map((item, index) => {
                                        return <ElTableColumn label={item.label}>
                                            {{
                                                default: ({row}) => <ElInput v-model={row[item.field]}></ElInput>
                                            }}
                                        </ElTableColumn>
                                    })
                                }
                                <ElTableColumn label="操作">
                                    <ElButton type='danger'>删除</ElButton>
                                </ElTableColumn>
                            </ElTable>

                        </div>
                    ),
                    footer: () => <>
                        <ElButton onClick={onCancel}>取消</ElButton>
                        <ElButton type='primary' onClick={onConfirm}>确定</ElButton>
                    </>
                }}
            </ElDialog>
        }
    }
})

let vm;
export function $tableDialog(options) {
    if (!vm) {
        const el = document.createElement('div');
        vm = createVNode(TableComponnet, { options });
        let r = render(vm, el);
        document.body.appendChild(el);
    }
    let { show } = vm.component.exposed;
    show(options);
}