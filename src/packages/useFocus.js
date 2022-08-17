import { computed, ref } from "vue";

export function useFocus(data, previewRef, callback) {

    const selectIndex = ref(-1); // 表示没有任何一个被选中
    const lastSelectBlock = computed(() => data.value.blocks[selectIndex.value]) // 最后选择的那一个

    const clearBlockFocus = () => {
        data.value.blocks.forEach(block => block.focus = false)
    }
    const onBlockMouseDown = (e, block, index) => {
        if(previewRef.value) return;
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey) {
            if(focusData.value.focus.length <= 1) {
                block.focus = true; // 当前只有一个节点被选中，按住shift也不会切换focus状态
            } else {
                block.focus = !block.focus;
            }
            
        } else {
            // block上规划一个属性focus获取焦点就将focus变为true
            if (!block.focus) {
                clearBlockFocus();
                block.focus = true; // 点击之前先清空其他的focus
            } // 当自己已经被选中，再次点击应该还是选中状态
        }
        selectIndex.value = index;
        callback(e);
    }

    const focusData = computed(() => {
        let focus = [];
        let unfocused = [];
        data.value.blocks.forEach(block => (block.focus ? focus : unfocused).push(block));
        return {
            focus,
            unfocused
        }
    })


    const containerMouseDown = (e) => {
        if(previewRef.value) return;
        clearBlockFocus();
        selectIndex.value = -1;
    }

    return {
        containerMouseDown,
        onBlockMouseDown,
        focusData,
        lastSelectBlock,
        clearBlockFocus,
    }
}