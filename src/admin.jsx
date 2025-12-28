// src/Admin.jsx
import React, { useState, useEffect } from "react";


import { db } from "./firebaseConfig";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "firebase/auth";
import Layout from "./components/Layout";


export default function Admin() {


  const FLOOR_Y_OFFSET = {
    "1F": 0,
    "2F": 2000,
    "3F": 4000,
  };


  const MAP_WIDTH = 600;
  const FLOOR_IMAGE_HEIGHT = 500; // png上の1フロア
  const FLOOR_NODE_HEIGHT = 2000; // Firestore上の1フロア

  const MAP_HEIGHT = FLOOR_IMAGE_HEIGHT * (MAP_WIDTH / 500);


  const [currentFloor, setCurrentFloor] = useState("1F");
  const floorIndex = { "1F": 0, "2F": 1, "3F": 2 }[currentFloor];


  // ページタイトルを変更
  useEffect(() => {
    document.title = "管理者ページ";
  }, []);
  const auth = getAuth();
  const [loggedIn, setLoggedIn] = useState(false);
  const [nodes, setNodes] = useState([]);
  // 通行可 / 不可 を切り替える関数
  const toggleTraffic = async (docId, currentTf) => {
    try {
      const ref = doc(db, "nodes", docId);
      await updateDoc(ref, {
        tf: !currentTf,
      });

      setNodes(prev =>
        prev.map(node =>
          node.docId === docId
            ? { ...node, tf: !currentTf }
            : node
        )
      );
    } catch (error) {
      console.error("Firestore更新エラー:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  // データを取得して表示するだけ（App.jsxと同じ仕組み）
  useEffect(() => {
    async function fetchData() {
      const querySnapshot = await getDocs(collection(db, "nodes"));
      const fetchedNodes = querySnapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
      setNodes(fetchedNodes);
    }
    fetchData();
  }, []);

  if (!loggedIn) {
    return (
      <div className="p-8 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">管理者ログイン</h1>

        <input
          type="email"
          placeholder="メールアドレス"
          className="border p-2 w-full mb-2"
          id="email"
        />

        <input
          type="password"
          placeholder="パスワード"
          className="border p-2 w-full mb-4"
          id="password"
        />

        <button
          className="bg-blue-600 text-white px-4 py-2 w-full"
          onClick={() => {
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            signInWithEmailAndPassword(auth, email, password)
              .catch(err => alert("ログイン失敗"));
          }}
        >
          ログイン
        </button>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">管理者用：データ編集画面</h1>
        <p className="mb-4 text-gray-600">ここから通行止め情報などを書き換えます。</p>

        <div className="border rounded p-4 shadow-sm bg-white">
          <h2 className="font-bold mb-2">登録データ一覧 ({nodes.length}件)</h2>
          <ul className="space-y-2 h-96 overflow-y-auto">
            {nodes.map(node => (
              <li
                key={node.docId}
                className="border-b p-2 flex justify-between items-center"
              >
                <span>{node.name} ({node.category})</span>

                <div className="flex items-center gap-4">
                  {/* 状態文字（固定幅） */}
                  <span
                    className={`w-20 text-right ${node.tf ? "text-green-600" : "text-red-600 font-bold"
                      }`}
                  >
                    {node.tf ? "通行可" : "通行止め"}
                  </span>

                  {/* トグルスイッチ（これだけ！） */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!!node.tf}
                      onChange={() => toggleTraffic(node.docId, node.tf)}
                    />
                    <div
                      className="
          w-11 h-6 bg-gray-300
          rounded-full
          peer peer-checked:bg-green-500
          after:content-['']
          after:absolute after:top-[2px] after:left-[2px]
          after:bg-white after:rounded-full
          after:h-5 after:w-5
          after:transition-all
          peer-checked:after:translate-x-5
          "
                    ></div>
                  </label>
                </div>
              </li>

            ))}
          </ul>
        </div>
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-2">管理者用マップ</h2>

          {/* 階切替 */}
          <div className="flex gap-2 mb-3">
            {["1F", "2F", "3F"].map(f => (
              <button
                key={f}
                onClick={() => setCurrentFloor(f)}
                className={`px-3 py-1 rounded ${currentFloor === f ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* マップ表示 */}
          <div
            className="relative border bg-white overflow-hidden"
            style={{
              width: MAP_WIDTH,
              height: MAP_HEIGHT,
            }}
          >
            {/* 背景マップ：1フロア分だけ表示 */}
            <img
              src="./map_images/map_image.png"
              alt="map"
              style={{
                position: "absolute",
                top: -floorIndex * MAP_HEIGHT,
                left: 0,
                width: MAP_WIDTH,
                height: MAP_HEIGHT * 3,
              }}
            />


            {/* ノード表示 */}
            {nodes
              .filter(n => n.floor === currentFloor)
              .map(n => {
                const x = (n.x / FLOOR_NODE_HEIGHT) * MAP_WIDTH;
                const y =
                  ((n.y - FLOOR_Y_OFFSET[currentFloor]) / FLOOR_NODE_HEIGHT) * MAP_HEIGHT;

                return (
                  <div
                    key={n.docId}
                    onClick={() => toggleTraffic(n.docId, n.tf)}
                    title={`${n.name} : ${n.tf ? "通行可" : "通行止め"}`}
                    className="absolute rounded-full cursor-pointer"
                    style={{
                      left: x,
                      top: y,
                      width: 10,
                      height: 10,
                      backgroundColor: n.tf ? "green" : "red",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                );
              })}
          </div>

        </div>
      </div>
    </Layout>
  );
}