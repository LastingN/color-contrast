<template>
    <div class="toning">
        <div class="page-title">
            <h1 style="font-size: 32px;">调色盘</h1>
        </div>
        
        <div class="button-group" style="margin-top: 10px;">
            <button class="vue-button" @click="showModal = true">新增颜色</button>
            <button class="vue-button" @click="clearColors">清空颜色</button>
        </div>
        <div class="color-pool" style="margin-top: 10px; overflow-x: auto;">
            <div v-for="block in colorBlocks" :key="block.name" class="color-block" :style="{ backgroundColor: block.color }">
                <span :style="{ color: getContrastingColor(block.color) }">
                    {{ block.brand }} <br> 
                    {{ block.name }} <br> 
                    {{ block.color }}<br> 
                </span>
            </div>
        </div>
        <div class="opacity-selector" style="margin-top: 20px;">
            <div class="opacity-selector" style="margin-top: 20px;">
            <div class="slider-container">
                <!-- 修改 v-model 绑定的值 -->
                <input type="range" min="0" max="100" v-model="opacity" @input="updateOpacity" class="slider" :style="{backgroundColor: currentColor}" />
                <!-- 修改 left 的计算方式 -->
                <div class="slider-indicator" :style="{ left: `${100 - opacity}%`, backgroundColor: getContrastingColor(currentColor) }">
                    <span class="bubble">{{ 100 - opacity }}%</span>
                </div>
                <span class="opacity-value">{{ 100 - opacity }}%</span>
            </div>
        </div>
        </div>
        <div class="color-display" style="margin-top: 50px;">
            <div class="color-info">
                <p>当前6位 Hex 颜色: <br> {{ current6HexColor }}</p><br> 
                <p>当前8位 Hex 颜色: <br> {{ current8HexColor }}</p><br> 
                <p>当前 RGB 颜色: <br> {{ currentRGBColor }}</p><br> 
                <p>当前 RGBA 颜色:<br> {{ currentRGBAColor }}</p><br> 
            </div>
            <div class="color-sample" :style="{ backgroundColor: currentColor }"></div>
            <div class="near-block-div" style="height: 412px;">
                <div class="calculation-method-container">
                    <p>计算方式: {{ calculationMethod }}</p>
                    <button class="deltaE" v-if="calculationMethod === 'deltaE'" @click="toggleCalculationMethod">
                        数学 CIELAB 颜色空间计算
                    </button>
                    <button class="CIELAB" v-if="calculationMethod === 'CIELAB'" @click="toggleCalculationMethod">
                        chroma-js-deltaE
                    </button>
                </div>
                <div class="near-blocks-scrollable">
                    <div v-for="(color, brand) in nearestColors" :key="brand" class="near-block" :style="{ backgroundColor: color.color }">
                        <span :style="{ color: getContrastingColor(color.color) }">
                            {{ color.name }} <br>
                            {{ brand }} <br>
                            {{ color.color }} <br>
                            ΔE: {{ color.deltaE.toFixed(2) }} <br>
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 模态窗口 -->
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
            <div class="modal">
                <div class="modal-left">
                    <ul>
                        <li v-for="brand in brands" :key="brand" @click="selectBrand(brand)" :class="{ active: selectedBrand === brand }">
                            {{ brand }}
                        </li>
                    </ul>
                </div>
                <div class="modal-content">
                    <ul>
                        <li v-for="color in colors" :key="color.name" @click="selectColor(color)" :class="{ selected: selectedColor === color }">
                            {{ color.name }}
                        </li>
                    </ul>
                </div>
                <div class="modal-actions">
                    <button @click="confirmColor">确认</button>
                    <button @click="showModal = false">取消</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import chroma from 'chroma-js'  
import { calculateDeltaE } from '@/utils/colorUtils'; 

export default {
    data() {
        return {
            opacity: 0,
            current6HexColor: '#FFFFFF',
            current8HexColor: '#FFFFFFFF',
            currentRGBColor: 'rgb(255,255,255)',
            currentRGBAColor: 'rgba(255,255,255/1)', 
            currentColor: 'rgba(255,255,255,1)',
            showModal: false,
            selectedBrand: 'GW',
            brands: ['GW', 'AvGame', 'AvModel', 'Ak3GN'],
            colors: [],
            selectedColor: null,
            colorBlocks: [],
            nearestColors: {},
            calculationMethod: 'CIELAB', // 默认使用 CIELAB 计算方法
        };
    },
    methods: {
        addColor() {
            // 新增颜色逻辑
        },
        clearColors() {
            this.opacity = 0;
            this.colorBlocks = [];
            this.current6HexColor = '#FFFFFF';
            this.current8HexColor = '#FFFFFFFF';
            this.currentRGBColor = 'rgb(255,255,255)';
            this.currentRGBAColor = 'rgba(255,255,255/1)';
            this.currentColor = 'rgba(255,255,255,1)';
            this.selectedColor = null;
            this.nearestColors = {};
            
            // 重置滑块背景色
            this.updateSliderBackground();
        },
        updateOpacity() {
            try {
                const color = chroma(this.currentColor);
                const alpha = (100 - this.opacity) / 100; // 透明度计算
                const rgbaColor = color.alpha(alpha);
                this.updateColorValues(rgbaColor);
                this.findNearestColors();
            } catch (error) {
                console.error('Invalid color format:', error.message);
            }
        },
        updateColorValues(color) {
            const parsedColor = chroma(color);

            const alpha = parseFloat(parsedColor.alpha().toFixed(2));
            {
                const backgroundColor = chroma('#FFFFFF');
                // 获取前景色的透明度
                // 对每个颜色通道进行混合计算
                const r = Math.round(alpha * parsedColor.get('rgb.r') + (1 - alpha) * backgroundColor.get('rgb.r'));
                const g = Math.round(alpha * parsedColor.get('rgb.g') + (1 - alpha) * backgroundColor.get('rgb.g'));
                const b = Math.round(alpha * parsedColor.get('rgb.b') + (1 - alpha) * backgroundColor.get('rgb.b'));
                this.current6HexColor = chroma.rgb(r,g,b).hex().toUpperCase();
                // 输出混合后的十六进制颜色
                console.log('混合后的十六进制颜色:', this.current6HexColor);
            }
            // this.current6HexColor =parsedColor.hex().toUpperCase();
            // 8 位十六进制颜色码，包含透明度
            this.current8HexColor = parsedColor.hex('rgba').toUpperCase();
            // RGB 颜色格式
            const [r, g, b] = parsedColor.rgb();
            this.currentRGBColor = `rgb(${r}, ${g}, ${b})`;
            // RGBA 颜色格式，包含透明度
            this.currentRGBAColor = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            this.currentColor = this.currentRGBAColor;
            console.log('Updated currentColor:', this.currentColor);
            console.log('Updated 8 Hex Color:', this.current8HexColor);
            console.log('Updated RGB Color:', this.currentRGBColor);
            console.log('Updated RGBA Color:', this.currentRGBAColor);
        },
        selectBrand(brand) {
            this.selectedBrand = brand;
            this.loadColors();
        },
        loadColors() {
            const urls = {
                GW: 'https://raw.githubusercontent.com/LastingN/color-contrast/refs/heads/main/src/json/GW.json',
                AvGame: 'https://raw.githubusercontent.com/LastingN/color-contrast/refs/heads/main/src/json/avGame.json',
                AvModel: 'https://raw.githubusercontent.com/LastingN/color-contrast/refs/heads/main/src/json/avModel.json',
                Ak3GN: 'https://raw.githubusercontent.com/LastingN/color-contrast/refs/heads/main/src/json/ak3.json',
            };
            fetch(urls[this.selectedBrand])
                .then(response => response.json())
                .then(data => {
                    this.colors = data;
                });
        },
        selectColor(color) {
            this.selectedColor = color;
        },
        confirmColor() {
            if (this.selectedColor) {
                const newColor = this.selectedColor.color;

                if (this.colorBlocks.length === 0) {
                    // 首次添加颜色块
                    this.updateColorValues(newColor);
                    this.opacity = 0;  // 重置滑块位置
                } else {
                    // 多次添加颜色块
                    const currentChromaColor = chroma(this.currentColor);
                    const newChromaColor = chroma(newColor);
                    const mixedColor = chroma.mix(currentChromaColor, newChromaColor, 0.5); // 混合比例为 0.5

                    this.updateColorValues(mixedColor);
                    // 根据新颜色的透明度设置卡钳位置
                    const alpha = parseFloat(mixedColor.alpha().toFixed(2));
                    // 修改为透明度值
                    this.opacity = (1 - alpha) * 100; 
                }

                this.colorBlocks.unshift({
                    brand: this.selectedBrand,
                    name: this.selectedColor.name,
                    color: newColor,
                });

                // 更新滑块背景色
                this.updateSliderBackground();

                // 找到最接近的颜色
                this.findNearestColors();
            }
            this.showModal = false;
        },
        findNearestColors() {
            const brandUrls = {
                GW: 'https://raw.githubusercontent.com/LastingN/color-contrast/refs/heads/main/src/json/GW.json',
                AvGame: 'https://raw.githubusercontent.com/LastingN/color-contrast/refs/heads/main/src/json/avGame.json',
                AvModel: 'https://raw.githubusercontent.com/LastingN/color-contrast/refs/heads/main/src/json/avModel.json',
                Ak3GN: 'https://raw.githubusercontent.com/LastingN/color-contrast/refs/heads/main/src/json/ak3.json'
            };

            const promises = this.brands.map(brand => {
                const url = brandUrls[brand];
                return fetch(url)
                    .then(response => response.json())
                    .then(colors => {
                        let minDeltaE = Infinity;
                        let nearestColor = null;

                        colors.forEach(color => {
                            let deltaE;
                            if (this.calculationMethod === 'deltaE') {
                                deltaE = chroma.deltaE(this.current6HexColor, color.color);
                                console.info("color", color.color);
                            } else {
                                deltaE = calculateDeltaE(this.current6HexColor, color.color);
                                console.info("color", color.color);
                            }
                            if (deltaE < minDeltaE) {
                                minDeltaE = deltaE;
                                nearestColor = color;
                            }
                        });

                        if (nearestColor) {
                            return {
                                [brand]: {
                                    ...nearestColor,
                                    deltaE: minDeltaE
                                }
                            };
                        }
                        return null;
                    });
            });

            Promise.all(promises)
                .then(results => {
                    const nearestColors = {};
                    results.forEach(result => {
                        if (result) {
                            Object.assign(nearestColors, result);
                        }
                    });
                    this.nearestColors = nearestColors;
                })
                .catch(error => {
                    console.error('Error fetching color data:', error);
                });
        },
        getContrastingColor(color) {
            try {
                const parsedColor = chroma(color);
                const [r, g, b, a] = parsedColor.rgba();
                const invertedR = 255 - r;
                const invertedG = 255 - g;
                const invertedB = 255 - b;
                if (a < 1) {
                    return chroma(invertedR, invertedG, invertedB, a).css();
                } else {
                    return chroma(invertedR, invertedG, invertedB).css();
                }
            } catch (error) {
                console.error('Error processing color:', error);
                return '#000';
            }
        },
        updateSliderBackground() {
            const sliderContainer = this.$el.querySelector('.slider-container');
            if (sliderContainer) {
                sliderContainer.style.background = this.currentColor;
            }
        },
        getContrastingColor(color) {
            try {
                // 使用 chroma-js 解析传入的颜色
                const parsedColor = chroma(color);

                // 获取颜色的 RGB 值
                const [r, g, b, a] = parsedColor.rgba();

                // 计算相反颜色的 RGB 值
                const invertedR = 255 - r;
                const invertedG = 255 - g;
                const invertedB = 255 - b;

                // 如果有透明度信息，返回 rgba 格式，否则返回 rgb 格式
                if (a < 1) {
                    return chroma(invertedR, invertedG, invertedB, a).css();
                } else {
                    return chroma(invertedR, invertedG, invertedB).css();
                }
            } catch (error) {
                // 如果解析颜色时出错，抛出错误提示
                throw new Error('Invalid color format. Supported formats are recognized by chroma-js.');
            }
        },
        toggleCalculationMethod() {
            if (this.calculationMethod === 'deltaE') {
                this.calculationMethod = 'CIELAB';
            } else {
                this.calculationMethod = 'deltaE';
            }
            // 重新计算最近颜色
            this.findNearestColors();
        }
    },
    mounted() {
        this.loadColors();
        this.confirmColor();
        this.updateSliderBackground(); // 初始化时更新滑块背景色
    },
};
</script>

<style scoped>
.toning {
    top: 0px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-left: 20px;
}
.page-title {
    display: flex;
    margin: 0;
    padding: 10px;
    font-size: 18px;
    color: #42b983;
    top: 20%;
    left: 20px;
}

.button-group {
    display: flex;
    justify-content: flex-start;
    gap: 10px;
}

.vue-button {
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.vue-button:hover {
    background-color: #369f75;
}

.color-pool {
    height: 150px;
    width: 850px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-left: 10px;
    overflow-x: auto;
    white-space: nowrap;
}

.color-block {
    width: 220px;
    height: 100px;
    margin-right: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    text-align: center;
    padding: 5px;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 0;
}

.opacity-selector {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    padding-left: 10px;
}

.slider-container {
    position: relative;
    width: 500px;
    height: 20px;
    background: linear-gradient(to left, white, white);
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    align-items: center;
    border: 1px solid #ccc;
}

.slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 100%;
    background: transparent;
    outline: none;
    cursor: pointer;
}

.slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: black;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    z-index: 2;
}

.slider-indicator {
    position: absolute;
    top: -30px;
    transform: translateX(-50%);
    z-index: 1;
}

.bubble {
    background-color: black;
    color: white;
    padding: 5px;
    border-radius: 5px;
    font-size: 12px;
}

.opacity-value {
    margin-left: auto;
    font-size: 14px;
    color: black;
    padding: 5px;
    border-radius: 5px;
    background-color: white;
}

/* 整体颜色展示区域样式 */
.color-display {
    width: 90%;
    max-width: 900px;
    min-height: 300px;
    margin: 50px auto 0;
    display: flex;
    border: 1px solid #e0e0e0;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    background-color: #f9f9f9;
}

.color-display:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
    transform: translateY(-3px);
}

/* 颜色信息区域样式 */
.color-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    border-right: 1px solid #e0e0e0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 16px;
    color: #555;
    padding: 20px;
    background-color: #ffffff;
}

.color-info p {
    margin: 8px 0;
}

/* 颜色示例区域样式 */
.color-sample {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid #e0e0e0;
    transition: background-color 0.3s ease;
    background-color: #ffffff;
}

/* 最接近品牌信息区域样式 */
.near-block-div {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 16px;
    color: #555;
    padding: 20px;
    background-color: #ffffff;
}

.near-block-div p {
    margin: 8px 0;
}

.near-block {
    width: 220px;
    height: 100px;
    margin-right: 10px;
    margin-bottom: 10px; /* 增加底部外边距，使块之间有垂直间距 */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px; /* 增大圆角半径，使外观更柔和 */
    text-align: center;
    padding: 10px; /* 增加内边距，使内容更宽松 */
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 0;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 添加阴影效果，增强立体感 */
    transition: all 0.3s ease; /* 添加过渡效果，使交互更平滑 */
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* 设置更美观的字体 */
    font-size: 14px; /* 调整字体大小 */
}

.near-block:hover {
    transform: translateY(-5px); /* 鼠标悬停时向上移动 */
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* 鼠标悬停时加深阴影 */
}

.near-block span {
    word-break: break-all; /* 允许单词换行，避免溢出 */
}
.calculation-method-container {
    height: 20%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
}

.deltaE,
.CIELAB {
    font-weight: bold;
    color: white;
    padding: 5px 16px;
    border-radius: 4px;
    flex: 1;
    display: flex;
    border: none;
    cursor: pointer;
    justify-content: center;
    align-items: center;
    width: 200px; /* 固定宽度 */
    height: 30px; /* 固定高度 */
}

.deltaE {
    font-size: 12px;
    background-color: #3498db;
}

.CIELAB {
    font-size: 16px;
    background-color: #e74c3c;
}

.near-blocks-scrollable {
    padding: 5px 5px;
    height: 80%;
    overflow-y: auto;
    flex: 1;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    width: 830px;
    height: 530px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-radius: 10px;
    display: flex;
    overflow: hidden;
    z-index: 1001;
}

.modal-left {
    width: 33%;
    background: rgba(255, 255, 255, 0.6);
    border-right: 1px solid #ccc;
    overflow-y: auto;
}

.modal-left ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.modal-left li {
    padding: 10px;
    cursor: pointer;
    text-align: right;
}

.modal-left li.active {
    background-color: #42b983;
    color: white;
}

.modal-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}

.modal-content ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.modal-content li {
    padding: 10px;
    cursor: pointer;
}

.modal-content li.selected {
    background-color: #42b983;
    color: white;
}

.modal-actions {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px;
}

.modal-actions button {
    margin-bottom: 10px;
    padding: 10px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.modal-actions button:hover {
    background-color: #369f75;
}
</style>
