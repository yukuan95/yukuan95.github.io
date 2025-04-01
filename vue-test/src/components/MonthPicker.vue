<script setup lang="ts">
// @ts-ignore
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { reactive } from 'vue'
import { ElConfigProvider } from 'element-plus'
import { ElDatePicker } from 'element-plus'
import Caret from './Caret.vue'
import * as Lib from '../Lib.ts'

const props = defineProps(['width', 'paddingLeft', 'paddingRight'])
const emit = defineEmits(['month-change'])

let dateToYearMonth = (date: Date) => {
  let month = date.getMonth() + 1 + ''
  if (month.length === 1) {
    month = '0' + month
  }
  return date.getFullYear() + '-' + month
}
let state = reactive({
  value: Lib.getNowStringTime().slice(0, 7),
})
let methods = {
  changeMonth(e: Date) {
    if (!e) {
      state.value = Lib.getNowStringTime().slice(0, 7)
    } else {
      state.value = dateToYearMonth(e)
    }
    this.emitMonth()
  },
  monthC(c: string) {
    let t = new Date(state.value)
    if (c === 'm') {
      t.setMonth(t.getMonth() - 1)
    }
    if (c === 'p') {
      t.setMonth(t.getMonth() + 1)
    }
    state.value = dateToYearMonth(t)
    this.emitMonth()
  },
  emitMonth() {
    emit('month-change', state.value)
  },
}
</script>

<template>
  <div :style="{
    'user-select': 'none',
    'width': width + 'px',
    'padding-left': paddingLeft + 'px',
    'padding-right': paddingRight + 'px',
  }" class="fr jcsb aic">
    <div>
      <ElConfigProvider :locale="zhCn">
        <ElDatePicker :editable="false" @change="methods.changeMonth($event)" v-model="state.value" type="month"
          placeholder="Pick a month" />
      </ElConfigProvider>
    </div>
    <div class="fr jcc aic">
      <div @click="methods.monthC('m')">
        <Caret lr="l" />
      </div>
      <div style="width: 15px"></div>
      <div @click="methods.monthC('p')">
        <Caret lr="r" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
