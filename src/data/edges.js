// src/data/edges.js

// 距離計算（座標から cost を自動生成）
function calcDistance(n1, n2) {
  const dx = n1.x - n2.x;
  const dy = n1.y - n2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// エッジの定義（接続情報）は固定なのでそのまま置いておきます
const rawEdges = [
  //1F
  //西側一帯
  { from: 101, to: 102 },
  { from: 102, to: 110 },
  { from: 110, to: 112 },
  { from: 112, to: 111 },
  { from: 111, to: 149 },
  { from: 149, to: 148 },
  { from: 148, to: 147 },
  { from: 148, to: 146 },
  //南側一帯
  { from: 110, to: 103 },
  { from: 103, to: 104 },
  { from: 104, to: 105 },
  { from: 105, to: 106 },
  { from: 106, to: 107 },
  { from: 107, to: 108 },
  { from: 107, to: 122 },
  { from: 108, to: 122 },
  { from: 122, to: 109 },
  { from: 122, to: 123 },
  { from: 123, to: 113 },
  { from: 113, to: 114 },
  { from: 114, to: 121 },
  { from: 114, to: 115 },
  { from: 115, to: 116 },
  { from: 116, to: 119 },
  { from: 119, to: 117 },
  { from: 117, to: 118 },
  { from: 119, to: 120 },
  //モール周り
  { from: 156, to: 123 },
  { from: 156, to: 125 },
  { from: 123, to: 132 },
  { from: 132, to: 124 },
  { from: 124, to: 125 },
  { from: 125, to: 133 },
  { from: 133, to: 126 },
  { from: 126, to: 134 },
  { from: 134, to: 135 },
  { from: 135, to: 136 },
  { from: 126, to: 127 },
  { from: 127, to: 128 },
  { from: 159, to: 123 },
  { from: 159, to: 155 },

  //北側一帯
  { from: 128, to: 138 },
  { from: 138, to: 139 },
  { from: 139, to: 140 },
  { from: 140, to: 141 },
  { from: 141, to: 142 },
  { from: 142, to: 143 },
  { from: 143, to: 144 },
  { from: 144, to: 145 },
  { from: 144, to: 146 },
  { from: 157, to: 143 },
  { from: 157, to: 144 },
  { from: 157, to: 158 },
  { from: 120, to: 158 },
  //外ほか
  { from: 128, to: 137 },
  { from: 137, to: 129 },
  { from: 129, to: 152 },
  { from: 129, to: 153 },
  { from: 129, to: 130 },
  { from: 130, to: 154 },
  { from: 154, to: 131 },
  { from: 131, to: 155 },
  { from: 131, to: 149 },

  //2F
  //西側一帯
  { from: 201, to: 202 },
  { from: 202, to: 209 },
  { from: 209, to: 211 },
  { from: 211, to: 210 },
  { from: 210, to: 242 },
  { from: 242, to: 241 },
  { from: 241, to: 243 },
  //南側一帯
  { from: 209, to: 203 },
  { from: 203, to: 204 },
  { from: 204, to: 205 },
  { from: 205, to: 206 },
  { from: 206, to: 220 },
  { from: 220, to: 207 },
  { from: 220, to: 208 },
  { from: 220, to: 221 },
  { from: 221, to: 212 },
  { from: 212, to: 246 },
  { from: 246, to: 219 },
  { from: 246, to: 213 },
  { from: 213, to: 214 },
  { from: 214, to: 217 },
  { from: 217, to: 218 },
  { from: 217, to: 215 },
  { from: 215, to: 216 },
  //モール周り
  { from: 221, to: 224 },
  { from: 224, to: 245 },
  { from: 225, to: 245 },
  { from: 225, to: 222 },
  { from: 222, to: 226 },
  { from: 226, to: 227 },
  { from: 227, to: 228 },
  { from: 228, to: 229 },
  { from: 222, to: 230 },
  { from: 230, to: 223 },
  { from: 223, to: 244 },
  //北側一帯
  { from: 223, to: 231 },
  { from: 231, to: 232 },
  { from: 232, to: 236 },
  { from: 231, to: 233 },
  { from: 233, to: 234 },
  { from: 234, to: 235 },
  { from: 235, to: 236 },
  { from: 236, to: 240 },
  { from: 236, to: 237 },
  { from: 237, to: 238 },
  { from: 238, to: 239 },
  { from: 218, to: 239 },

  //3F
  //北西一帯
  { from: 301, to: 302 },
  { from: 302, to: 309 },
  { from: 309, to: 311 },
  { from: 311, to: 310 },
  { from: 310, to: 345 },
  { from: 345, to: 331 },
  { from: 331, to: 332 },
  { from: 331, to: 346 },
  { from: 346, to: 330 },
  { from: 330, to: 329 },
  { from: 329, to: 328 },
  { from: 328, to: 327 },
  { from: 327, to: 326 },

  //南側一帯
  { from: 309, to: 303 },
  { from: 303, to: 304 },
  { from: 304, to: 305 },
  { from: 305, to: 306 },
  { from: 306, to: 320 },
  { from: 320, to: 307 },
  { from: 320, to: 308 },
  { from: 320, to: 321 },
  { from: 321, to: 312 },
  { from: 312, to: 344 },
  { from: 344, to: 313 },
  { from: 344, to: 319 },
  { from: 313, to: 314 },
  { from: 314, to: 317 },
  { from: 318, to: 317 },
  { from: 317, to: 315 },
  { from: 315, to: 316 },

  //モール回り,北東一帯
  { from: 321, to: 324 },
  { from: 324, to: 343 },
  { from: 343, to: 325 },
  { from: 325, to: 322 },
  { from: 322, to: 326 },
  { from: 322, to: 323 },
  { from: 323, to: 333 },
  { from: 323, to: 334 },
  { from: 334, to: 335 },
  { from: 335, to: 336 },
  { from: 336, to: 337 },
  { from: 337, to: 338 },
  { from: 338, to: 339 },
  { from: 339, to: 340 },
  { from: 339, to: 341 },
  { from: 341, to: 342 },
  { from: 342, to: 318 },

  //階段
  //A
  { from: 134, to: 226 },
  { from: 326, to: 226 },
  //B
  { from: 121, to: 219 },
  { from: 319, to: 219 },
  //C
  { from: 112, to: 211 }, 
  { from: 311, to: 211 },   
  //D
  { from: 146, to: 240 },
  { from: 340, to: 240 },
  //E
  { from: 151, to: 243 },
  { from: 332, to: 243 },
];

// ★ここが変わりました★
// 外部から「nodes」を受け取って、計算済みの edges を返す関数にします
export function getEdges(nodes) {
  // id → node の辞書
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  const computedEdges = rawEdges.map(e => ({
    ...e,
    cost: calcDistance(nodeMap[e.from], nodeMap[e.to]),
  }));
  
  return computedEdges;
}