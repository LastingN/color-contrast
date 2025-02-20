<template>
  <div class="palette-container">
    <div class="page-title">
      <h1>取色盘</h1>
    </div>
    
    <div class="controls">
      <input type="file" id="file-input" @change="onFileChange" accept="image/*" hidden />
      <button @click="triggerFileInput">选择文件</button>
      <button @click="pickColor">取色</button>
      <div class="color-display">
        <div class="rgb-display">{{ currentColor }}</div>
        <div class="color-sample" :style="{ backgroundColor: currentColor }"></div>
        <div class="hex-display">{{ rgbToHex(currentColor) }}</div>
      </div>
    </div>
    <div class="image-preview" @mousedown="startDrag" @wheel="handleWheel" @mousemove="updateColor" @mouseup="lockColor">
      <img v-if="imageUrl" :src="imageUrl" :style="{ transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)` }" ref="image" />
    </div>
    <div class="image-controls">
      <button @click="zoomIn" title="放大">
        <img src="@/components/icons/zoomIn.png" alt="放大" />
      </button>
      <button @click="zoomOut" title="缩小">
        <img src="@/components/icons/zoomOut.png" alt="缩小" />
      </button>
      <button @click="resetZoom" title="恢复原始大小">
        <img src="@/components/icons/resetZoom.png" alt="恢复原始大小" />
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      imageUrl: null,
      currentColor: 'rgb(255, 255, 255)',
      isPicking: false,
      scale: 1, // 初始缩放比例
      isDragging: false,
      startX: 0,
      startY: 0,
      translateX: 0,
      translateY: 0,
    }
  },
  methods: {
    triggerFileInput() {
      document.getElementById('file-input').click()
    },
    onFileChange(event) {
      const file = event.target.files[0]
      if (file) {
        this.imageUrl = URL.createObjectURL(file)
        // 重置缩放比例和位移
        this.scale = 1
        this.translateX = 0
        this.translateY = 0
      }
    },
    pickColor() {
      this.isPicking = true
      document.body.style.cursor = `url(${require('@/components/icons/colorStraw.png')}), auto` // 使用自定义取色器图标
    },
    updateColor(event) {
      if (this.isPicking) {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        const img = this.$refs.image
        canvas.width = img.width
        canvas.height = img.height
        context.drawImage(img, 0, 0, img.width, img.height)
        const x = event.offsetX
        const y = event.offsetY
        const pixel = context.getImageData(x, y, 1, 1).data
        this.currentColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`
      }
    },
    lockColor() {
      if (this.isPicking) {
        this.isPicking = false
        document.body.style.cursor = 'default' // 恢复鼠标为默认样式
      }
    },
    rgbToHex(rgb) {
      const result = rgb.match(/\d+/g)
      return result
        ? `#${((1 << 24) + (parseInt(result[0]) << 16) + (parseInt(result[1]) << 8) + parseInt(result[2]))
            .toString(16)
            .slice(1)
            .toUpperCase()}`
        : '#FFFFFF'
    },
    zoomIn() {
      this.scale += 3 // 按钮点击放大3倍
    },
    zoomOut() {
      this.scale = Math.max(0.1, this.scale - 3) // 按钮点击缩小3倍，最小为0.1倍
    },
    resetZoom() {
      this.scale = 1
      this.translateX = 0
      this.translateY = 0
    },
    startDrag(event) {
      event.preventDefault()
      this.isDragging = true
      this.startX = event.clientX
      this.startY = event.clientY
      window.addEventListener('mousemove', this.dragImage)
      window.addEventListener('mouseup', this.stopDrag)
    },
    stopDrag() {
      this.isDragging = false
      window.removeEventListener('mousemove', this.dragImage)
      window.removeEventListener('mouseup', this.stopDrag)
    },
    dragImage(event) {
      if (this.isDragging) {
        const deltaX = (event.clientX - this.startX) / this.scale
        const deltaY = (event.clientY - this.startY) / this.scale
        this.translateX += deltaX
        this.translateY += deltaY
        this.startX = event.clientX
        this.startY = event.clientY
      }
    },
    handleWheel(event) {
      event.preventDefault()

      // 仅保留缩放倍数为0.5倍
      const scaleChange = event.deltaY < 0 ? 0.5 : -0.5
      this.scale = Math.max(0.1, this.scale + scaleChange)
    },
  },
}
</script>

<style scoped>
.palette-container {
  position: relative; /* 确保子元素的绝对定位是相对于这个容器 */
  top: 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -150px; /* 向上移动容器 */
}

.page-title {
  position: absolute; /* 使用绝对定位 */
  top: -55px; /* 设置在容器顶部 */
  left: -65px; /* 设置在容器左侧 */
  margin: 0; /* 移除外边距 */
  padding: 10px; /* 添加内边距以确保文本不紧贴边缘 */
  font-size: 16px;
  color: #42b983;
  z-index: 10; /* 确保在其他元素之上 */
}

.controls {
  position: absolute;
  left: 43.5%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

button {
  background-color: #42b983; /* Vue风格的绿色 */
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  width: 100px;
  height: 40px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-right: 10px; /* 添加按钮间距 */
}

button:hover {
  background-color: #369f75; /* 悬停时的颜色变化 */
}

button img {
  width: 24px; /* 图标大小 */
  height: 24px;
}

.color-display {
  width: 420px; /* 更新宽度 */
  height: 50px;
  display: flex;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: hidden;
}

.rgb-display, .hex-display, .color-sample {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #333;
}

.rgb-display {
  background-color: #f0f0f0; /* 默认背景色 */
}

.color-sample {
  background-color: #fff; /* 默认背景色 */
}

.hex-display {
  background-color: #f0f0f0;
}

.image-preview {
  position: absolute;
  top: calc(-70% + 60px); /* 在controls下方5px */
  left: 59%;
  transform: translateX(-50%);
  width: 830px; /* 包括边框的宽度 */
  height: 520px; /* 包括边框的高度 */
  border: 1px solid #ccc; /* 添加边框 */
  padding: 5px; /* 添加内边距以确保边框不紧贴图片 */
  border-radius: 5px; /* 添加圆角 */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9; /* 背景颜色 */
  overflow: hidden; /* 隐藏超出部分 */
}

.image-preview img {
  max-width: 820px; /* 限制最大宽度 */
  max-height: 510px; /* 限制最大高度 */
  width: auto;
  height: auto;
  cursor: grab; /* 鼠标悬停时显示抓手 */
}

.image-controls {
  position: absolute;
  top: calc(-70% + 540px); /* 在image-preview下方60px */
  left: 59%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  margin-top: 60px;
}

.image-controls button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: transform 0.3s ease;
  margin: 0 5px;
}

.image-controls button:hover {
  transform: scale(1.1);
}

.image-controls button img {
  width: 24px;
  height: 24px;
}
</style> 