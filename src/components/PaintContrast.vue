<template>
  <div class="paint-contrast">
    <nav class="breadcrumb">
      <router-link to="/">Home</router-link> / <span>油漆对比</span>
    </nav>
    <div class="title">
      <h1>油漆对比</h1>
      <p>目前仅支持GW、AV、AK的数学 CIELAB 颜色空间计算</p>
      <p style="font-size: 14px;">
        <span>The number at the end of the description of every matched color is the delta (the mathematical distance between the colors).</span> <br>
        <span>A delta of less than 3 (green blocks) represent a very close match, nearly visually indistinguishable.</span> <br>
        <span>A delta of less than 7 (yellow blocks) is usually pretty close and can safely be used as a substitute.</span><br><br>
        <span>The middle square is the color of the control paint(first column), and the surrounding border is the color of the matching paint.</span><br>
      </p>
    </div>
    <div class="paintFrom">
      <div class="button-group">
        <button 
          @click="handleGWClick" 
          :class="{ selected: selectedButton === 'GW' }"
        >GW</button>
        <button 
          @click="handleAVGameClick" 
          :class="{ selected: selectedButton === 'AVGame' }"
        >AV Game</button>
        <button 
          @click="handleAVModelClick" 
          :class="{ selected: selectedButton === 'AVModel' }"
        >AV Model</button>
        <button 
          @click="handleAK3Click" 
          :class="{ selected: selectedButton === 'AK3' }"
        >AK3GEN</button>
      </div>
      <div class="paintFromItem">
        <table class="list-color">
          <thead>
            <tr>
              <th>{{ selectedButton }} Name</th>
              <th>{{ otherButtons[0] }}</th>
              <th>Match Name</th>
              <th>{{ otherButtons[1] }}</th>
              <th>Match Name</th>
              <th>{{ otherButtons[2] }}</th>
              <th>Match Name</th>
            </tr>
          </thead>
          <tbody class="row">
            <tr v-for="(item, index) in currentData" :key="index">
              <td><strong>{{ item.name }}</strong><br>{{ item.series }} - <span>{{ item.color }}</span></td>
              <td class="color-col" :style="{ backgroundColor: minMatches[index][0].color || '#FFFFFF' }">
                <div class="color-box" :style="{ backgroundColor: item.color || '#FFFFFF' }"></div>
              </td>
              <td :style="{ backgroundColor: getBackgroundColor(minMatches[index][0].delta) }">
                <strong class="name">{{ minMatches[index][0].name || 'N/A' }}</strong><br>
                <span class="brand">{{ minMatches[index][0].series || 'N/A' }}</span> - <span class="colour-number">{{ minMatches[index][0].color || 'N/A' }}</span><br>
                <span class="delta">{{ minMatches[index][0].delta }}</span>
              </td>
              <td class="color-col" :style="{ backgroundColor: minMatches[index][1].color || '#FFFFFF' }">
                <div class="color-box" :style="{ backgroundColor: item.color || '#FFFFFF' }"></div>
              </td>
              <td :style="{ backgroundColor: getBackgroundColor(minMatches[index][1].delta) }">
                <strong class="name">{{ minMatches[index][1].name || 'N/A' }}</strong><br>
                <span class="brand">{{ minMatches[index][1].series || 'N/A' }}</span> - <span class="colour-number">{{ minMatches[index][1].color || 'N/A' }}</span><br>
                <span class="delta">{{ minMatches[index][1].delta }}</span>
              </td>
              <td class="color-col" :style="{ backgroundColor: minMatches[index][2].color || '#FFFFFF' }">
                <div class="color-box" :style="{ backgroundColor: item.color || '#FFFFFF' }"></div>
              </td>
              <td :style="{ backgroundColor: getBackgroundColor(minMatches[index][2].delta) }">
                <strong class="name">{{ minMatches[index][2].name || 'N/A' }}</strong><br>
                <span class="brand">{{ minMatches[index][2].series || 'N/A' }}</span> - <span class="colour-number">{{ minMatches[index][2].color || 'N/A' }}</span><br>
                <span class="delta">{{ minMatches[index][2].delta }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { calculateDeltaE } from '@/utils/colorUtils'; // 假设有一个工具函数来计算 CIELAB 差距

export default {
  name: 'PaintContrast',
  data() {
    return {
      selectedButton: 'GW', // 初次进入页面时默认选中 GW
      buttonNames: ['GW', 'AV Game', 'AV Model', 'AK3代'],
      gwData: [],
      ak3Data: [],
      avModelData: [],
      avGameData: [],
      minMatches: [] // 存储每行的最小匹配结果
    };
  },
  computed: {
    currentData() {
      switch (this.selectedButton) {
        case 'GW':
          return this.gwData;
        case 'AK3':
          return this.ak3Data;
        case 'AVModel':
          return this.avModelData;
        case 'AVGame':
          return this.avGameData;
        default:
          return [];
      }
    },
    otherButtons() {
      return this.buttonNames.filter(name => name !== this.selectedButton);
    }
  },
  methods: {
    handleGWClick() {
      this.selectedButton = 'GW';
      this.calculateClosestMatches();
    },
    handleAK3Click() {
      this.selectedButton = 'AK3';
      this.calculateClosestMatches();
    },
    handleAVModelClick() {
      this.selectedButton = 'AVModel';
      this.calculateClosestMatches();
    },
    handleAVGameClick() {
      this.selectedButton = 'AVGame';
      this.calculateClosestMatches();
    },
    calculateClosestMatches() {
      let dataSources;
      switch (this.selectedButton) {
        case 'GW':
          dataSources = [this.avGameData, this.avModelData, this.ak3Data];
          break;
        case 'AVGame':
          dataSources = [this.gwData, this.avModelData, this.ak3Data];
          break;
        case 'AVModel':
          dataSources = [this.gwData, this.avGameData, this.ak3Data];
          break;
        case 'AK3':
          dataSources = [this.gwData, this.avGameData, this.avModelData];
          break;
        default:
          dataSources = [];
      }

      this.minMatches = this.currentData.map(item => {
        return dataSources.map(dataSource => this.findClosestMatch(item, dataSource));
      });
    },
    findClosestMatch(item, dataSource) {
      let minDelta = Infinity;
      let closestMatch = {};
      dataSource.forEach(dataItem => {
        const delta = calculateDeltaE(item.color, dataItem.color);
        if (delta < minDelta) {
          minDelta = delta;
          closestMatch = { ...dataItem, delta: delta.toFixed(2) };
        }
      });
      return closestMatch;
    },
    getBackgroundColor(delta) {
      if (delta <= 3) {
        return 'rgba(144, 238, 144, 0.5)'; // 绿色
      } else if (delta <= 7) {
        return 'rgba(255, 255, 0, 0.3)'; // 黄色
      } else {
        return 'rgba(211, 211, 211, 1)'; // 灰色
      }
    }
  },
  mounted() {
    Promise.all([
      fetch('https://raw.githubusercontent.com/LastingN/color-contrast/refs/heads/main/src/json/GW.json').then(response => response.json()),
      fetch('https://raw.githubusercontent.com/LastingN/color-contrast/refs/heads/main/src/json/avModel.json').then(response => response.json()),
      fetch('https://raw.githubusercontent.com/LastingN/color-contrast/refs/heads/main/src/json/avGame.json').then(response => response.json()),
      fetch('https://raw.githubusercontent.com/LastingN/color-contrast/refs/heads/main/src/json/ak3.json').then(response => response.json())
    ]).then(([gwData, avModelData, avGameData, ak3Data]) => {
      this.gwData = gwData.map(item => ({
        name: item.name,
        color: item.color,
        series: item.series
      }));
      this.avModelData = avModelData.map(item => ({
        name: item.name,
        color: item.color,
        series: item.series
      }));
      this.avGameData = avGameData.map(item => ({
        name: item.name,
        color: item.color,
        series: item.series
      }));
      this.ak3Data = ak3Data.map(item => ({
        name: item.name,
        color: item.color,
        series: item.series
      }));
      this.calculateClosestMatches(); // 初次加载时计算 GW 数据的最小颜色差距
    }).catch(error => console.error('Error loading JSON:', error));
  }
}
</script>

<style scoped>
.paint-contrast {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 20px;
}

.breadcrumb {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 14px;
}

.title {
  position: relative;
  text-align: left;
  margin-left: 0px;
  margin-top: 20px;
  font-size: 22px;
}

.paintFrom {
  position: relative;
  margin-left: 0px;
  margin-top: 30px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 0px;
  justify-content: flex-start;
  align-items: flex-start;
  position: relative;
}

.paintFromItem {
  margin-top: 30px;
}

button {
  padding: 10px 20px;
  background-color: #42b983;
  width: 100px;
  height: 40px;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button.selected {
  background-color: #2e7d32; /* 深绿色，表示选中状态 */
}

button:hover {
  background-color: #369f75;
}

.list-color th,
.list-color td {
  padding: 10px;
  border-bottom: 2px solid black;
}

.list-color td:nth-child(1),
.list-color td:nth-child(3),
.list-color td:nth-child(5),
.list-color td:nth-child(7) {
  min-width: 270px; /* 设置特定列的最小宽度 */
}

.list-color .color-col {
  padding: 0;
  width: 86px;
}

.color-box {
  width: 50px;
  height: 50px;
  margin: 18px;
}
</style> 
