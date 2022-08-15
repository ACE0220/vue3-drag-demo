import { computed } from "vue";

export function useFocus(data, callback) {
    const clearBlockFocus = () => {
        data.value.blocks.forEach(block => block.focus = false)
    }
    const onBlockMouseDown = (e, block) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey) {
            block.focus = !block.focus;
        } else {
            // block上规划一个属性focus获取焦点就将focus变为true
            if (!block.focus) {
                clearBlockFocus();
                block.focus = true; // 点击之前先清空其他的focus
            } else {
                block.focus = false;
            }
        }
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
        clearBlockFocus();
    }

    return {
        containerMouseDown,
        onBlockMouseDown,
        focusData
    }
}