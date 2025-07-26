<script setup lang="ts">
import { ElPopover } from 'element-plus'
import { computed } from 'vue'
import { Color, UpOrDown } from '../Lib.ts'
import Arrow from './Arrow.vue';
import * as Lib from '../Lib.ts'

const props = defineProps([
  'width',
  'paddingLeft',
  'paddingRight',
  'time',
  'startTime',
  'nowTime',
  'timeColor',
  'price',
  'priceColor',
  'shortPrice',
  'longPrice',
])

let comput = {
  upOrDown: computed(() => {
    if (props.priceColor === Color.red) {
      return UpOrDown.down
    }
    if (props.priceColor === Color.green) {
      return UpOrDown.up
    }
    return UpOrDown.none
  })
}

</script>
<template>
  <div class="fr jcsb aic" :style="{
    width: props.width + 'px',
    'user-select': 'none',
    'padding-left': props.paddingLeft + 'px',
    'padding-right': props.paddingRight + 'px',
  }">
    <ElPopover effect="light" trigger="hover" width="auto">
      <template #default>
        {{ props.startTime }}
      </template>
      <template #reference>
        <div v-show="props.time" class="fr jcc aic">
          <div :style="{ color: props.timeColor }">{{ props.time }}</div>
        </div>
      </template>
    </ElPopover>
    <ElPopover effect="light" trigger="hover" width="auto">
      <template #default>
        <div class="fr jcsb font" style="column-gap: 2px;">
          <div>{{ 'shortPrice: ' }}</div>
          <div>{{ Lib.toFixedString(props.shortPrice, 2) }}</div>
        </div>
        <div class="fr jcsb font" style="column-gap: 2px;">
          <div>{{ 'longPrice: ' }}</div>
          <div>{{ Lib.toFixedString(props.longPrice, 2) }}</div>
        </div>
      </template>
      <template #reference>
        <div class="fr jcc aic">
          <div v-show="props.price">
            <span :style="{ color: Color.black }">BTC : </span>
            <span :style="{ color: props.priceColor }">{{ props.price ? Lib.toFixedString(props.price, 1) : '' }}</span>
          </div>
          <div v-if="comput.upOrDown.value !== UpOrDown.none" style="height: 16px; width: 16px;"
            :style="{ color: props.priceColor }">
            <Arrow :upOrDown="comput.upOrDown.value" />
          </div>
        </div>
      </template>
    </ElPopover>
  </div>
</template>
<style scoped></style>
