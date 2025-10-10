<template>
  <svg
    :class="['icon', `icon--${name}`, className]"
    :style="iconStyle"
  >
    <use :href="`#icon-${name}`" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  name: string
  size?: number | string
  color?: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 16,
  color: 'currentColor',
  className: ''
})

const iconStyle = computed(() => ({
  width: typeof props.size === 'number' ? `${props.size}px` : props.size,
  height: typeof props.size === 'number' ? `${props.size}px` : props.size,
  fill: props.color
}))
</script>

<style scoped>
.icon
{
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>

