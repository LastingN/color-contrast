<script setup>
import Home from './components/Home.vue'
import TheWelcome from './components/TheWelcome.vue'
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <RouterView v-slot="{ route }">
      <div v-if="!route.meta.noLayout">
        <header>
          <img alt="logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />
          <div class="wrapper">
            <Home msg="color contrast" />
            <nav>
              <RouterLink 
                to="/" 
                :class="{ disabled: route.path === '/' }"
                :aria-disabled="route.path === '/'"
              >
                Home
              </RouterLink>
              <RouterLink 
                to="/about" 
                :class="{ disabled: route.path === '/about' }"
                :aria-disabled="route.path === '/about'"
              >
                About
              </RouterLink>
            </nav>
          </div>
        </header>
      </div>
    </RouterView>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav a {
  color: #42b983; /* 恢复为 Vue 风格的绿色 */
  text-decoration: none;
  margin-right: 10px;
  transition: color 0.3s ease; /* 添加过渡效果 */
}

nav a.disabled {
  color: gray;
  pointer-events: none; /* 禁用点击 */
}

nav a:not(.disabled):hover {
  color: #369f75; /* 悬停时的颜色变化 */
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
