<template>
  <div class="list">
    <h1 class="paint-comparison" @click="goToPaintContrast">油漆比较</h1>
    <p>目前仅支持GW、AV、AK的数学 CIELAB 颜色空间计算</p>
  </div>
  
  <div class="list">
    <h1 class="color-palette" @click="goToPalette">取色盘</h1>
    <p>上传图片后，点击取色按钮，将鼠标放置到目标位置，即可获取目标位置的色值</p>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToPaintContrast = () => {
  router.push('/paint-contrast')
}

const goToPalette = () => {
  router.push('/palette')
}
</script>

<style scoped>
h1 {
  color: #42b983;
  transition: transform 0.3s ease, text-shadow 0.3s ease; /* 添加过渡效果 */
  transform-origin: center; /* 设置变换基点为中心 */
}

.list {
  margin-bottom: 40px; /* 统一每个list的底部间隔 */
  padding: 10px; /* 添加一些内边距 */
  border-radius: 5px; /* 圆角边框 */
}

.list:hover h1 {
  transform: scale(1.2); /* 字体放大一倍 */
  text-shadow: 0 0 10px rgba(66, 185, 131, 0.5); /* 字体发光效果 */
}

.paint-comparison {
  cursor: pointer; /* 鼠标悬停时显示手型光标 */
}

.color-palette {
  cursor: pointer; /* 鼠标悬停时显示手型光标 */
}
</style>
