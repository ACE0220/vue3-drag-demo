import { computed, defineComponent, render } from "vue";

export default defineComponent({
    props: {
        start: {type: Number},
        end: {type: Number},
    },
    emits: ['udpate:start', 'update:end'],
    setup(props, ctx){
        
        const start = computed({
            get() {
                return props.start
            },
            set(newVal) {
                ctx.emit("udpate:start", newVal)
            }
        })

        const end = computed({
            get() {
                return props.end
            },
            set(newVal) {
                ctx.emit("udpate:end", newVal)
            }
        })

        return () => {
            return <div class='range'>
                <input type="text" v-model={start.value} />
                <span>~</span>
                <input type="text" v-model={end.value} />
            </div>
        }
    }
})