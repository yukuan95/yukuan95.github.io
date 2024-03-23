<script setup lang="ts">
// @ts-ignore
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { ElPopover } from 'element-plus'
import { ElTable } from 'element-plus'
import { ElTableColumn } from 'element-plus'
import { ElConfigProvider } from 'element-plus'

const props = defineProps(['width', 'height', 'border', 'fields', 'items'])
let state = {
  border: '' + props.border === 'true',
  width: !isNaN(Number.parseFloat(props.width))
    ? Number.parseFloat(props.width) + 'px'
    : 'auto',
  height: !isNaN(Number.parseFloat(props.height))
    ? Number.parseFloat(props.height) + 'px'
    : 'auto',
}
</script>

<template>
  <div :style="{ width: state.width, height: state.height }">
    <ElConfigProvider :locale="zhCn">
      <ElTable :data="props.items" :border="state.border" :row-style="{ height: '30px' }"
        :header-row-style="{ height: '30px' }" :cell-style="{ padding: '0px' }" :header-cell-style="{ padding: '0px' }">
        <template v-for="field in fields">
          <ElTableColumn :prop="field.key" :label="field.label" :width="field.width ? field.width : ''"
            :align="field.align ? field.align : ''">
            <template #header>
              <div @dblclick.stop="field.dblclick ? field.dblclick() : ''">
                {{ field.label }}
              </div>
            </template>

            <template #default="scope">
              <template v-if="scope.row[field.key].popover">
                <ElPopover effect="light" trigger="hover" :placement="scope.row[field.key].placement" width="auto">
                  <template #default>
                    <div :class="[Object.keys(scope.row[field.key].popover).length === 1 ? 'fr jcc' : 'fr',]"
                      v-for="(popoverValue, popoverKey) in scope.row[field.key].popover">
                      <span v-if="popoverKey + '' === 'value'">{{ popoverValue }}</span>
                      <span v-else>{{ popoverKey }} : {{ popoverValue }}</span>
                    </div>
                  </template>
                  <template #reference>
                    <div>{{ scope.row[field.key].value }}</div>
                  </template>
                </ElPopover>
              </template>
              <template v-else>
                <div>{{ scope.row[field.key].value }}</div>
              </template>
            </template>
          </ElTableColumn>
        </template>
      </ElTable>
    </ElConfigProvider>
  </div>
</template>

<style scoped></style>
