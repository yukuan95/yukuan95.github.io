<template>
  <div class="wh">
    <div class="wh loader"></div>
  </div>
</template>
<style scoped>
.wh {
  width: 60px;
  height: 60px;
}

.loader {
  border-radius: 50%;
  border-top: 4px solid #e2e2e2;
  border-right: 4px solid #e2e2e2;
  border-bottom: 4px solid #e2e2e2;
  border-left: 4px solid #409eff;
  animation: load8 1.1s infinite linear;
}

@keyframes load8 {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
