/**
 * 计算两个颜色在 CIELAB 颜色空间中的差距
 * @param {string} color1 - 第一个颜色的十六进制表示
 * @param {string} color2 - 第二个颜色的十六进制表示
 * @returns {number} - 颜色差距值
 */
export function calculateDeltaE(color1, color2) {
  // 将十六进制颜色转换为 RGB
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  // 将 RGB 转换为 CIELAB
  const lab1 = rgbToLab(rgb1);
  const lab2 = rgbToLab(rgb2);

  // 计算 CIELAB 差距
  return deltaE(lab1, lab2);
}

function hexToRgb(hex) {
  // 移除 '#' 符号
  hex = hex.replace(/^#/, '');

  // 解析 RGB 值
  let bigint = parseInt(hex, 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;

  return [r, g, b];
}

function rgbToLab([r, g, b]) {
  // 将 RGB 转换为 XYZ
  let [x, y, z] = rgbToXyz(r, g, b);

  // 将 XYZ 转换为 LAB
  return xyzToLab(x, y, z);
}

function rgbToXyz(r, g, b) {
  // 归一化 RGB 值
  r = r / 255;
  g = g / 255;
  b = b / 255;

  // 转换为线性 RGB
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  // 转换为 XYZ
  let x = r * 0.4124 + g * 0.3576 + b * 0.1805;
  let y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  let z = r * 0.0193 + g * 0.1192 + b * 0.9505;

  return [x * 100, y * 100, z * 100];
}

function xyzToLab(x, y, z) {
  // 参考白点
  const refX = 95.047;
  const refY = 100.000;
  const refZ = 108.883;

  x = x / refX;
  y = y / refY;
  z = z / refZ;

  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116);

  let l = (116 * y) - 16;
  let a = 500 * (x - y);
  let b = 200 * (y - z);

  return [l, a, b];
}

function deltaE(lab1, lab2) {
  const [l1, a1, b1] = lab1;
  const [l2, a2, b2] = lab2;

  const deltaL = l1 - l2;
  const deltaA = a1 - a2;
  const deltaB = b1 - b2;

  return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
} 