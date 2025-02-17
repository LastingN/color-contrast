<template>
  <div class="about-container">
    <div class="about">
      <p class="inspiration">灵感来源：<a href="https://redgrimm.github.io/paint-conversion/index.html">https://redgrimm.github.io/paint-conversion/index.html</a></p>
      <p>
        <span>上次更新已经是多年前，这边重新检查了gw的色号，并添加了av和ak的色号对比，如果发现有误，请及时联系我。</span><br>
        <span>颜色有误或如果希望添加新品牌对比，请发送品牌，色号，中文名，品牌官网至邮箱 colorcontrastcheck@163.com。</span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  // existing script code
}
</script>

<style>
.about-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.about {
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.about p {
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  margin-bottom: 10px;
  text-align: left;
}

.inspiration {
  text-align: left; /* 确保灵感来源段落左对齐 */
}

.about a {
  text-decoration: none;
  transition: color 0.3s;
}

@media (min-width: 1024px) {
  .about {
    /* 在大屏幕上保持居中 */
  }
}

/* 这里没有定义 .page-container 类 */
</style>
