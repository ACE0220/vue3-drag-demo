import { reactive } from "vue";

export function useBlockDragger(focusData, lastSelectBlock, data) {
    let dragState = {
        startX : 0,
        startY: 0
    }

    let markLine = reactive({
        x: null,
        y: null
    })

    const mousemove = (e) => {
        let {clientX : moveX, clientY: moveY} = e;
        // 计算当前元素最新的left和top，去线里面找，找到显示线
        // 鼠标移动后 - 鼠标移动前 + left就好了
        let left = moveX - dragState.startX + dragState.startLeft;
        let top = moveY - dragState.startY + dragState.startTop;

        // 先计算横线 距离参照物元素还有5像素的时候就显示这根线
        let y = null;
        let x = null;
        for(let i = 0; i < dragState.lines.y.length; i++) {
            const {top: t, showTop: s} = dragState.lines.y[i]; // 获取每一根线
            if(Math.abs(t - top) < 5) { // 如果小于5,说明接近了
                y = s; // 线要显示的位置
                // 还要实现快速贴边
                moveY = dragState.startY - dragState.startTop + t; // 容器距离顶部的距离 + 目标高度 就是最新的moveY
                break; // 找到一根线就跳出循环
            }
        }

        for(let i = 0; i < dragState.lines.x.length; i++) {
            const {left: l, showLeft: s} = dragState.lines.x[i]; // 获取每一根线
            if(Math.abs(l - left) < 5) { // 如果小于5,说明接近了
                x = s; // 线要显示的位置
                // 还要实现快速贴边
                moveX = dragState.startX - dragState.startLeft + l; // 容器距离顶部的距离 + 目标高度 就是最新的moveY
                break; // 找到一根线就跳出循环
            }
        }

        // markLine是一个响应式数据，x，y更新了会导致视图更新
        markLine.x = x;
        markLine.y = y;

        let durX = moveX - dragState.startX; // 拖拽之前和之后的距离
        let durY = moveY - dragState.startY;
        focusData.value.focus.forEach((block, idx) => {
            block.top = dragState.startPos[idx].top + durY;
            block.left = dragState.startPos[idx].left + durX;
        })
    }
    const mouseup = (e) => {
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
        markLine.x = null;
        markLine.y = null;
    }
    const mousedown = (e) => {

        const {width: BWidth, height: BHeight} = lastSelectBlock.value; // 拖拽最后的元素



        dragState = {
            startX: e.clientX,
            startY: e.clientY,
            startLeft: lastSelectBlock.value.left, // b点拖拽前的位置
            startTop: lastSelectBlock.value.top,
            startPos: focusData.value.focus.map(({top, left}) => ({top, left})),
            lines: (() => {
                const {unfocused} = focusData.value; // 获取没选中的，以他们的位置做好辅助线
                let lines = {x: [], y: []}; // 计算横线位置用y存放 x存放的是纵向的线
                [...unfocused, {
                    top: 0,
                    left: 0,
                    width: data.value.container.width,
                    height: data.value.container.height
                }].forEach((block) => {
                    const {top: ATop, left: ALeft, width: AWidth, height: AHeight} = block;
                    // 当次元素拖拽到和A元素top一致的时候，要显示辅助线，辅助线的位置就是ATop
                    lines.y.push({showTop:ATop, top: ATop}); // 顶对顶
                    lines.y.push({showTop:ATop, top: ATop - BHeight}); // 顶对底
                    lines.y.push({showTop:ATop + AHeight / 2, top: ATop + AHeight / 2 - BHeight / 2}); // 中对中
                    lines.y.push({showTop:ATop + AHeight, top: ATop + AHeight}); // 底对顶
                    lines.y.push({showTop:ATop + AHeight, top: ATop + AHeight - BHeight}); // 底对底
                    
                    
                    
                    lines.x.push({showLeft: ALeft, left: ALeft}); // 左对左
                    lines.x.push({showLeft: ALeft + AWidth, left: ALeft + AWidth}); // 右对左
                    lines.x.push({showLeft: ALeft + AWidth / 2, left: ALeft + AWidth / 2 - BWidth / 2}); // 中对中
                    lines.x.push({showLeft: ALeft + AWidth, left: ALeft + AWidth - BWidth}); // 右对右
                    lines.x.push({showLeft: ALeft, left: ALeft - BWidth}); // 左对右
                })
                return lines;
            })()
        }
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
    }

    return {
        mousedown,
        mousemove,
        mouseup,
        markLine
    }
}