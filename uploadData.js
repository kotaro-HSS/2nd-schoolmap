// uploadData.js
// このファイルはデータ移行のためだけに使い、終わったら削除してもOKです

// 1. 必要なライブラリを読み込み
// Node.js環境で動かすため、ES modulesではなくCommonJS方式で書くか、
// package.jsonで "type": "module" が設定されている必要があります。
// 今回は一番手軽な「Firebase Admin SDK」を使わず、通常のWeb SDKをNodeで動かす方法をとります。

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, writeBatch, collection } from "firebase/firestore";

// ★あなたのデータ (nodes.js の中身) をここに直接定義します
const nodesData = [
  // 1F
  { id: 101, name: "6-4", category: "教室", floor: "1F", x: 110, y: 1270, tf: "f" },
  { id: 102, name: "6-3", category: "教室", floor: "1F", x: 270, y: 1270, tf: "f" },
  { id: 103, name: "6-2", category: "教室", floor: "1F", x: 430, y: 1270, tf: "f" },
  { id: 104, name: "6-1", category: "教室", floor: "1F", x: 590, y: 1270, tf: "f" },
  { id: 105, name: "選択1D", category: "教室", floor: "1F", x: 710, y: 1270, tf: "f" },
  { id: 106, name: "選択1C", category: "教室", floor: "1F", x: 790, y: 1270, tf: "f" },
  { id: 107, name: "第1自習室", category: "教室", floor: "1F", x: 910, y: 1270, tf: "f" },
  { id: 108, name: "進路室", category: "教室", floor: "1F", x: 1030, y: 1260, tf: "f" },
  { id: 109, name: "進路相談室", category: "教室", floor: "1F", x: 1110, y: 1270, tf: "f" },
  { id: 110, name: "6-3前", category: "中継", floor: "1F", x: 320, y: 1270, tf: "f" },
  { id: 111, name: "6年フロアトイレ", category: "トイレ", floor: "1F", x: 320, y: 1170, tf: "f" },
  { id: 112, name: "階段C", category: "階段", floor: "1F", x: 320, y: 1200, tf: "f" },
  { id: 113, name: "選択1B", category: "部活", floor: "1F", x: 1200, y: 1190, tf: "t" },
  { id: 114, name: "選択1A", category: "委員会", floor: "1F", x: 1275, y: 1190, tf: "t" },
  { id: 115, name: "5-4", category: "中催事", floor: "1F", x: 1410, y: 1190, tf: "t" },
  { id: 116, name: "5-3", category: "中催事", floor: "1F", x: 1570, y: 1190, tf: "t" },
  { id: 117, name: "5-2", category: "中催事", floor: "1F", x: 1730, y: 1190, tf: "t" },
  { id: 118, name: "5-1", category: "中催事", floor: "1F", x: 1890, y: 1190, tf: "t" },
  { id: 119, name: "5-2前", category: "中継", floor: "1F", x: 1700, y: 1190, tf: "t" },
  { id: 120, name: "5年フロアトイレ", category: "トイレ", floor: "1F", x: 1700, y: 1090, tf: "t" },
  { id: 121, name: "階段B", category: "階段", floor: "1F", x: 1270, y: 1150, tf: "t" },
  { id: 122, name: "進路相談室前", category: "中継", floor: "1F", x: 1080, y: 1270, tf: "t" },
  { id: 123, name: "モール・5年フロアの合流", category: "中継", floor: "1F", x: 1080, y: 1190, tf: "t" },
  { id: 124, name: "整理券から文実受付の中継", category: "中継", floor: "1F", x: 1080, y: 870, tf: "t" },
  { id: 125, name: "生徒会室の目の前", category: "中継", floor: "1F", x: 1030, y: 870, tf: "t" },
  { id: 126, name: "階段と文実受付の間", category: "中継", floor: "1F", x: 1030, y: 680, tf: "t" },
  { id: 127, name: "id126の横", category: "中継", floor: "1F", x: 1060, y: 680, tf: "t" },
  { id: 128, name: "昇降口前", category: "中継", floor: "1F", x: 1060, y: 540, tf: "t" },
  { id: 129, name: "ピロティと昇降口の間", category: "中継", floor: "1F", x: 1060, y: 260, tf: "t" },
  { id: 130, name: "road_to_外食販", category: "中継", floor: "1F", x: 130, y: 260, tf: "t" },
  { id: 131, name: "from外食販to中庭ステージ中継", category: "中継", floor: "1F", x: 130, y: 1010, tf: "t" },
  { id: 132, name: "整理券発行所", category: "案内", floor: "1F", x: 1080, y: 1030, tf: "t" },
  { id: 133, name: "文実受付", category: "案内", floor: "1F", x: 1030, y: 760, tf: "t" },
  { id: 134, name: "階段A", category: "階段", floor: "1F", x: 970, y: 680, tf: "t" },
  { id: 135, name: "PTA食事場", category: "食事", floor: "1F", x: 920, y: 680, tf: "t" },
  { id: 136, name: "保健室", category: "保健室", floor: "1F", x: 880, y: 680, tf: "f" },
  { id: 137, name: "昇降口", category: "入口", floor: "1F", x: 1060, y: 410, tf: "t" },
  { id: 138, name: "記念室", category: "中継", floor: "1F", x: 1130, y: 540, tf: "t" },
  { id: 139, name: "工芸室", category: "部活", floor: "1F", x: 1290, y: 540, tf: "t" },
  { id: 140, name: "技術室", category: "中継", floor: "1F", x: 1310, y: 540, tf: "t" },
  { id: 141, name: "第2自習室", category: "中継", floor: "1F", x: 1450, y: 540, tf: "t" },
  { id: 142, name: "図書室", category: "委員会", floor: "1F", x: 1600, y: 540, tf: "t" },
  { id: 143, name: "調理室", category: "教室", floor: "1F", x: 1680, y: 540, tf: "f" },
  { id: 144, name: "作法室", category: "教室", floor: "1F", x: 1755, y: 570, tf: "f" },
  { id: 145, name: "被服室", category: "教室", floor: "1F", x: 1755, y: 600, tf: "f" },
  { id: 146, name: "階段D", category: "階段", floor: "1F", x: 1755, y: 470, tf: "f" },
  { id: 147, name: "正面玄関", category: "階段", floor: "1F", x: 240, y: 770, tf: "f" },
  { id: 148, name: "事務室", category: "階段", floor: "1F", x: 320, y: 770, tf: "f" },
  { id: 149, name: "渡り廊下", category: "中継", floor: "1F", x: 330, y: 1005, tf: "f" },
  { id: 150, name: "階段E前", category: "中継", floor: "1F", x: 320, y: 680, tf: "f" },
  { id: 151, name: "階段E", category: "階段", floor: "1F", x: 240, y: 680, tf: "f" },
  { id: 152, name: "ピロティトイレ（身障者用あり）", category: "トイレ", floor: "1F", x: 1060, y: 150, tf: "t" },
  { id: 153, name: "武道場", category: "イベント", floor: "1F", x: 1060, y: 150, tf: "t" },
  { id: 154, name: "外食販", category: "食事", floor: "1F", x: 130, y: 900, tf: "t" },
  { id: 155, name: "中庭ステージ", category: "イベント", floor: "1F", x: 650, y: 1010, tf: "t" },
  { id: 156, name: "整理券が消えた用のモール中継地点", category: "中継", floor: "1F", x: 1055, y: 1030, tf: "f" },
  { id: 157, name: "調理室と図書館の間", category: "中継", floor: "1F", x: 1755, y: 570, tf: "f" },
  { id: 158, name: "1,2年昇降口", category: "中継", floor: "1F", x: 1755, y: 880, tf: "f" },
  { id: 159, name: "モールから中庭", category: "中継", floor: "1F", x: 1000, y: 1215, tf: "t" },
  // 2F
  { id: 201, name: "4-4", category: "中催事", floor: "2F", x: 110, y: 3270, tf: "t" },
  { id: 202, name: "4-3", category: "中催事", floor: "2F", x: 270, y: 3270, tf: "t" },
  { id: 203, name: "4-2", category: "中催事", floor: "2F", x: 430, y: 3270, tf: "t" },
  { id: 204, name: "4-1", category: "中催事", floor: "2F", x: 590, y: 3270, tf: "t" },
  { id: 205, name: "選択2C", category: "部活", floor: "2F", x: 750, y: 3270, tf: "t" },
  { id: 206, name: "選択2B", category: "委員会", floor: "2F", x: 910, y: 3270, tf: "t" },
  { id: 207, name: "男子更衣室", category: "教室", floor: "2F", x: 1030, y: 3260, tf: "f" },
  { id: 208, name: "女子更衣室", category: "教室", floor: "2F", x: 1110, y: 3270, tf: "f" },
  { id: 209, name: "4-3前", category: "中継", floor: "2F", x: 320, y: 3270, tf: "t" },
  { id: 210, name: "4年フロアトイレ", category: "トイレ", floor: "2F", x: 320, y: 3170, tf: "t" },
  { id: 211, name: "階段C", category: "階段", floor: "2F", x: 320, y: 3200, tf: "t" },
  { id: 212, name: "選択2A", category: "部活", floor: "2F", x: 1250, y: 3190, tf: "t" },
  { id: 213, name: "3-4", category: "教室", floor: "2F", x: 1410, y: 3190, tf: "t" },
  { id: 214, name: "3-3", category: "教室", floor: "2F", x: 1570, y: 3190, tf: "t" },
  { id: 215, name: "3-2", category: "教室", floor: "2F", x: 1730, y: 3190, tf: "t" },
  { id: 216, name: "3-1", category: "教室", floor: "2F", x: 1890, y: 3190, tf: "t" },
  { id: 217, name: "3-2前", category: "中継", floor: "2F", x: 1700, y: 3190, tf: "t" },
  { id: 218, name: "3年フロアトイレ", category: "トイレ", floor: "2F", x: 1700, y: 3090, tf: "t" },
  { id: 219, name: "階段B", category: "階段", floor: "2F", x: 1270, y: 3150, tf: "t" },
  { id: 220, name: "更衣室前", category: "中継", floor: "2F", x: 1040, y: 3270, tf: "t" },
  { id: 221, name: "モール・3年フロアの合流", category: "中継", floor: "2F", x: 1040, y: 3190, tf: "t" },
  { id: 222, name: "階段Aとモールの間", category: "中継", floor: "2F", x: 1040, y: 2680, tf: "t" },
  { id: 223, name: "体育館渡り廊下前", category: "中継", floor: "2F", x: 1040, y: 2540, tf: "t" },
  { id: 224, name: "2F食販南", category: "食事", floor: "2F", x: 1040, y: 3110, tf: "t" },
  { id: 225, name: "2F食販北", category: "食事", floor: "2F", x: 1040, y: 2760, tf: "t" },
  { id: 226, name: "階段A", category: "階段", floor: "2F", x: 970, y: 2680, tf: "t" },
  { id: 227, name: "会議室横", category: "教室", floor: "2F", x: 960, y: 2680, tf: "f" },
  { id: 228, name: "会議室", category: "教室", floor: "2F", x: 780, y: 2680, tf: "f" },
  { id: 229, name: "職員室前東", category: "職員室", floor: "2F", x: 710, y: 2680, tf: "f" },
  { id: 230, name: "放送室", category: "中継", floor: "2F", x: 1040, y: 2590, tf: "t" },
  { id: 231, name: "生徒相談室", category: "中継", floor: "2F", x: 1230, y: 2540, tf: "t" },
  { id: 232, name: "理科教室＝＞理科教室をまとめたいとき用", category: "部活", floor: "2F", x: 1130, y: 2540, tf: "f" },
  { id: 233, name: "化学室西", category: "部活", floor: "2F", x: 1300, y: 2540, tf: "t" },
  { id: 234, name: "生物室", category: "部活", floor: "2F", x: 1460, y: 2540, tf: "t" },
  { id: 235, name: "化学室東", category: "部活", floor: "2F", x: 1520, y: 2540, tf: "t" },
  { id: 236, name: "物理室", category: "中継", floor: "2F", x: 1750, y: 2540, tf: "f" },
  { id: 237, name: "物理室横暗室前", category: "中継", floor: "2F", x: 1750, y: 2920, tf: "f" },
  { id: 238, name: "frome暗室to3年フロア暗室側", category: "中継", floor: "2F", x: 1715, y: 2920, tf: "f" },
  { id: 239, name: "frome暗室to3年フロア3年側", category: "中継", floor: "2F", x: 1715, y: 3000, tf: "f" },
  { id: 240, name: "階段D", category: "階段", floor: "2F", x: 1755, y: 2470, tf: "t" },
  { id: 241, name: "職員室前西", category: "職員室", floor: "2F", x: 320, y: 2680, tf: "f" },
  { id: 242, name: "サンセットモール直下", category: "中継", floor: "2F", x: 330, y: 2960, tf: "f" },
  { id: 243, name: "階段E", category: "階段", floor: "2F", x: 240, y: 2680, tf: "f" },
  { id: 244, name: "体育館", category: "イベント", floor: "2F", x: 1040, y: 2150, tf: "t" },
  { id: 245, name: "2Fモール", category: "中継", floor: "2F", x: 1040, y: 2930, tf: "t" },
  { id: 246, name: "2A前", category: "中継", floor: "2F", x: 1270, y: 3190, tf: "t" },
  // 3F
  { id: 301, name: "2-4", category: "教室", floor: "3F", x: 110, y: 5270, tf: "t" },
  { id: 302, name: "2-3", category: "教室", floor: "3F", x: 270, y: 5270, tf: "t" },
  { id: 303, name: "2-2", category: "教室", floor: "3F", x: 430, y: 5270, tf: "t" },
  { id: 304, name: "2-1", category: "教室", floor: "3F", x: 590, y: 5270, tf: "t" },
  { id: 305, name: "選択3A", category: "教室", floor: "3F", x: 750, y: 5270, tf: "t" },
  { id: 306, name: "英語の部屋", category: "委員会", floor: "3F", x: 910, y: 5270, tf: "t" },
  { id: 307, name: "楽器庫B", category: "教室", floor: "3F", x: 1030, y: 5260, tf: "f" },
  { id: 308, name: "楽器庫A", category: "教室", floor: "3F", x: 1110, y: 5270, tf: "f" },
  { id: 309, name: "2-3前", category: "中継", floor: "3F", x: 320, y: 5270, tf: "t" },
  { id: 310, name: "2年フロアトイレ", category: "トイレ", floor: "3F", x: 320, y: 5170, tf: "t" },
  { id: 311, name: "階段C", category: "階段", floor: "3F", x: 320, y: 5200, tf: "t" },
  { id: 312, name: "1-5", category: "部活", floor: "3F", x: 1250, y: 5190, tf: "t" },
  { id: 313, name: "1-4", category: "教室", floor: "3F", x: 1410, y: 5190, tf: "t" },
  { id: 314, name: "1-3", category: "教室", floor: "3F", x: 1570, y: 5190, tf: "t" },
  { id: 315, name: "1-2", category: "教室", floor: "3F", x: 1730, y: 5190, tf: "t" },
  { id: 316, name: "1-1", category: "教室", floor: "3F", x: 1890, y: 5190, tf: "f" },
  { id: 317, name: "1-2前", category: "中継", floor: "3F", x: 1700, y: 5190, tf: "t" },
  { id: 318, name: "1年フロアトイレ", category: "トイレ", floor: "3F", x: 1700, y: 5090, tf: "t" },
  { id: 319, name: "階段B", category: "階段", floor: "3F", x: 1270, y: 5150, tf: "t" },
  { id: 320, name: "楽器庫前", category: "中継", floor: "3F", x: 1040, y: 5270, tf: "t" },
  { id: 321, name: "モール・1年フロアの合流", category: "中継", floor: "3F", x: 1040, y: 5190, tf: "t" },
  { id: 322, name: "階段Aとモールの間", category: "中継", floor: "3F", x: 1040, y: 4680, tf: "t" },
  { id: 323, name: "視聴覚室前モール", category: "中継", floor: "3F", x: 1040, y: 4630, tf: "t" },
  { id: 324, name: "3F食販南", category: "食事", floor: "3F", x: 1040, y: 5110, tf: "t" },
  { id: 325, name: "3F食販北", category: "食事", floor: "3F", x: 1040, y: 4840, tf: "t" },
  { id: 326, name: "階段A", category: "階段", floor: "3F", x: 970, y: 4680, tf: "t" },
  { id: 327, name: "多目的A", category: "中継", floor: "3F", x: 960, y: 4680, tf: "t" },
  { id: 328, name: "小会議室", category: "中継", floor: "3F", x: 710, y: 4680, tf: "t" },
  { id: 329, name: "PC-A教室", category: "中継", floor: "3F", x: 650, y: 4680, tf: "t" },
  { id: 330, name: "PC-B教室", category: "部活", floor: "3F", x: 640, y: 4680, tf: "t" },
  { id: 331, name: "第2会議室", category: "中継", floor: "3F", x: 320, y: 4680, tf: "t" },
  { id: 332, name: "階段E", category: "階段", floor: "3F", x: 240, y: 4680, tf: "f" },
  { id: 333, name: "視聴覚室", category: "イベント", floor: "3F", x: 1110, y: 4540, tf: "t" },
  { id: 334, name: "視聴覚室前廊下1", category: "中継", floor: "3F", x: 1300, y: 4630, tf: "t" },
  { id: 335, name: "視聴覚室前廊下2", category: "中継", floor: "3F", x: 1300, y: 4540, tf: "t" },
  { id: 336, name: "美術室", category: "部活", floor: "3F", x: 1450, y: 4540, tf: "t" },
  { id: 337, name: "音楽室", category: "部活", floor: "3F", x: 1520, y: 4540, tf: "t" },
  { id: 338, name: "美術室横トイレ", category: "トイレ", floor: "3F", x: 1690, y: 4540, tf: "t" },
  { id: 339, name: "風の通り道出入口", category: "中継", floor: "3F", x: 1755, y: 4540, tf: "f" },
  { id: 340, name: "階段D", category: "階段", floor: "3F", x: 1755, y: 4470, tf: "t" },
  { id: 341, name: "風通1", category: "中継", floor: "3F", x: 1755, y: 4740, tf: "f" },
  { id: 342, name: "風通2", category: "中継", floor: "3F", x: 1700, y: 4920, tf: "f" },
  { id: 343, name: "2Fモール", category: "中継", floor: "3F", x: 1040, y: 4930, tf: "t" },
  { id: 344, name: "1-5前", category: "中継", floor: "3F", x: 1270, y: 5190, tf: "t" },
  { id: 345, name: "サンセットモール", category: "中継", floor: "3F", x: 320, y: 5000, tf: "t" },
  { id: 346, name: "多目的B", category: "中継", floor: "3F", x: 390, y: 4680, tf: "t" }
];

// 2. Firebaseの設定 (あなたが教えてくれた内容)
const firebaseConfig = {
  apiKey: "AIzaSyB_zgiD6dH-cS738z-TdwsxwfALMHWIgWs",
  authDomain: "schoolmap-hss.firebaseapp.com",
  projectId: "schoolmap-hss",
  storageBucket: "schoolmap-hss.firebasestorage.app",
  messagingSenderId: "801585784522",
  appId: "1:801585784522:web:5cb8d4f3ebc67405a7f633",
  measurementId: "G-JPDZ3QQE1N"
};

// 3. アプリの初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 4. データアップロード関数
async function uploadAll() {
  console.log("🚀 アップロードを開始します...");
  const batch = writeBatch(db);
  const collectionRef = collection(db, "nodes");

  let count = 0;
  for (const node of nodesData) {
    const docRef = doc(collectionRef, String(node.id)); // IDを文字列化してドキュメントIDに使用
    
    // tfの値を Boolean (true/false) に変換して保存
    // "t" -> true, "f" -> false
    const isPassable = (node.tf === "t" || node.tf === true);
    
    // 保存するデータ
    batch.set(docRef, {
      ...node,
      tf: isPassable // ここで変換した値を入れる
    });
    
    count++;
    // FirestoreのBatch書き込み制限(500件)を回避するため、適宜コミットしても良いが、今回は件数が少ないので一括でOK
  }

  try {
    await batch.commit();
    console.log(`✅ 成功！ ${count} 件のデータをFirestoreに保存しました。`);
  } catch (e) {
    console.error("❌ エラーが発生しました:", e);
  }
}

// 実行！
uploadAll();