<script setup lang="ts">
import { computed } from 'vue'
import { Color, UpOrDown } from '../Lib.ts'
import Arrow from './Arrow.vue';
import * as Lib from '../Lib.ts'

const props = defineProps([
  'width',
  'paddingLeft',
  'paddingRight',
  'time',
  'timeColor',
  'price',
  'priceColor',
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
    <div v-show="props.time" class="fr jcc aic">
      <div :style="{ color: props.timeColor }">{{ props.time }}</div>
    </div>
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
  </div>
</template>
<style scoped></style>
