// src/App.jsx
import React, { useState, useEffect } from "react";
// ↓ 作成した設定ファイルを読み込みます
import { db } from "./firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

// ↓ 修正した edges.js から「計算関数」を読み込みます
import { getEdges } from "./data/edges";
import MapFloorView from "./components/MapFloorView";

import Layout from "./components/Layout";


export default function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);

const getDisplayName = (node) => {
  if (!node) return "";
  if (node.label && node.label.trim() !== "") return node.label;
  return node.name;
};



  // ---------------------
  // 1. Firebaseからデータを読み込む
  // ---------------------
  useEffect(() => {
    async function fetchData() {
      try {
        // "nodes" コレクションからデータを全取得
        const querySnapshot = await getDocs(collection(db, "nodes"));
        const fetchedNodes = querySnapshot.docs.map((doc) => doc.data());

        // 取得した nodes をセット
        setNodes(fetchedNodes);

        // nodes を元に edges を計算してセット
        const computedEdges = getEdges(fetchedNodes);
        setEdges(computedEdges);

      } catch (error) {
        console.error("データの取得に失敗しました:", error);
        alert("地図データの読み込みに失敗しました。");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ---------------------
  // State Initialization
  // ---------------------
  // nodes が読み込まれるまでフィルタ等は初期化できないため、useEffect で同期するか、
  // 描画時に計算するように変更します。

  // 修正前
  // const places = nodes.filter(node => node.tf === "t");

  // 修正後（一旦すべてのノードを通す）
  //const places = nodes;

  // 修正(2回目)後
  const places = nodes.filter(node => node.tf === true || node.tf === "t");
  // カテゴリ一覧の作成
  const categoryFiltersObj = {};
  places.forEach((p) => {
    if (p.category && !(p.category in categoryFiltersObj)) {
      categoryFiltersObj[p.category] = false;
    }
  });

  const [categoryFilters, setCategoryFilters] = useState({});
  const [filteredPlaces, setFilteredPlaces] = useState([]);

  // nodesがロードされたらフィルタの初期値を設定
  useEffect(() => {
    if (nodes.length > 0) {
      setCategoryFilters(categoryFiltersObj);
      setFilteredPlaces(places.filter((p) => p.category !== "階段" && p.category !== "中継"));
    }
  }, [nodes]);


  const [start, setStart] = useState("");
  const [goal, setGoal] = useState("");
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [goalSuggestions, setGoalSuggestions] = useState([]);

  const [route, setRoute] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // ---------------------
  // search handlers
  // ---------------------
  const handleStartInput = (e) => {
    const v = e.target.value;
    setStart(v);
    setStartSuggestions(
      v ? places.filter((p) => getDisplayName(p)?.toLowerCase().includes(v.toLowerCase())) : []
    );
  };
  const handleGoalInput = (e) => {
    const v = e.target.value;
    setGoal(v);
    setGoalSuggestions(
      v ? places.filter((p) => getDisplayName(p)?.toLowerCase().includes(v.toLowerCase())) : []
    );
  };
  const selectStart = (name) => {
    setStart(name);
    setStartSuggestions([]);
  };
  const selectGoal = (name) => {
    setGoal(name);
    setGoalSuggestions([]);
  };

  // ---------------------
  // category handling
  // ---------------------
  const handleCategoryChange = (selectedCat) => {
    if (!selectedCat) {
      setFilteredPlaces(places.filter((p) => p.category !== "階段" && p.category !== "中継"));
      setCategoryFilters(Object.fromEntries(Object.keys(categoryFilters).map(cat => [cat, false])));
      return;
    }

    const updated = {};
    Object.keys(categoryFilters).forEach((cat) => {
      updated[cat] = cat === selectedCat;
    });
    setCategoryFilters(updated);

    setFilteredPlaces(
      places.filter((p) => p.category === selectedCat && p.category !== "階段" && p.category !== "中継")
    );
  };

  // ---------------------
  // shortest path calculation
  // ---------------------
  const getShortestPath = (startId, goalId) => {
    const dist = {};
    const prev = {};
    const unvisited = new Set(nodes.map(n => n.id));

    nodes.forEach(n => { dist[n.id] = Infinity; });
    dist[startId] = 0;

    while (unvisited.size > 0) {
      let u = null;
      unvisited.forEach(id => {
        if (u === null || dist[id] < dist[u]) u = id;
      });

      if (u === goalId) break;
      unvisited.delete(u);

      edges.forEach(e => {
        // tf が t のノードのみ通行可能
        const fromNode = nodes.find(n => n.id === e.from);
        const toNode = nodes.find(n => n.id === e.to);
        if (!fromNode || !toNode) return;

        // tf が true (または "t") でない場合、ここは通れないと判断してスキップ
        const isFromValid = fromNode.tf === true || fromNode.tf === "t";
        const isToValid = toNode.tf === true || toNode.tf === "t";

        if (!isFromValid || !isToValid) return;

        if (e.from === u && unvisited.has(e.to)) {
          const alt = dist[u] + (e.cost ?? 1);
          if (alt < dist[e.to]) {
            dist[e.to] = alt;
            prev[e.to] = u;
          }
        }
        if (e.to === u && unvisited.has(e.from)) {
          const alt = dist[u] + (e.cost ?? 1);
          if (alt < dist[e.from]) {
            dist[e.from] = alt;
            prev[e.from] = u;
          }
        }
      });
    }

    const path = [];
    let u = goalId;
    while (u !== undefined) {
      const node = nodes.find(n => n.id === u);
      if (!node) break;
      path.unshift(node);
      u = prev[u];
    }

    return path;
  };

  //階段の上下
  const buildRouteText = (fromNode, toNode) => {
    // floor 文字列 ("1F", "2F"など) を「1階」「2階」に変換
    const toFloor = toNode.floor.replace("F", "階");

    if (
      fromNode.category === "階段" &&
      toNode.category === "階段" &&
      getDisplayName(fromNode) === getDisplayName(toNode)
    ) {
      const fromFloorNum = parseInt(fromNode.floor);
      const toFloorNum = parseInt(toNode.floor);

      if (fromFloorNum < toFloorNum) {
return `${getDisplayName(fromNode)}を${toFloor}まで上がります。`;
      }

      if (fromFloorNum > toFloorNum) {
return `${getDisplayName(fromNode)}を${toFloor}まで上がります。`;
      }

      return `${getDisplayName(fromNode)}を通過します。`;
    }

return `${getDisplayName(toNode)} に進みます。`;
  };


  // ---------------------
  // route control
  // ---------------------
  const handleStartNavigation = () => {
    if (!start || !goal) {
      alert("出発地と目的地を入力してください。");
      return;
    }
    if (start === goal) {
      alert("出発地と目的地が同じです。別の場所を選んでください。");
      return;
    }

 const startNode = nodes.find(n => getDisplayName(n) === start);
 const goalNode = nodes.find(n => getDisplayName(n) === goal);
    if (!startNode || !goalNode) return;

    const shortestPathNodes = getShortestPath(startNode.id, goalNode.id);

    const routeSteps = shortestPathNodes.map((node, i) => {
      if (i === 0)
        return { id: node.id, text: `${startNode.name} から出発します。`, image: node.image };
      const prevNode = shortestPathNodes[i - 1];
      return {
        id: node.id,
        text: buildRouteText(prevNode, node),
        image: node.image
      };
    });

    setRoute(routeSteps);
    setStepIndex(0);
  };

  //フッターボタン
  const handleNextStep = () => {
    let nextIndex = stepIndex + 1;
    while (nextIndex < route.length) {
      const node = places.find(p => p.id === route[nextIndex].id);
      if (!node || node.category !== "中継") break;
      nextIndex++;
    } if (nextIndex >= route.length) {
      // 最後のステップに到達した場合、終了確認モーダルを表示
      setShowEndConfirm(true);
    } else {
      setStepIndex(Math.min(nextIndex, route.length - 1));
    }

  };
  const handlePrevStep = () => {
    let prevIndex = stepIndex - 1;
    while (prevIndex >= 0) {
      const node = places.find(p => p.id === route[prevIndex].id);
      if (!node || node.category !== "中継") break;
      prevIndex--;
    }
    setStepIndex(Math.max(prevIndex, 0));
  };
  const handleResetSteps = () => setStepIndex(0);


  const handleEndNavigation = () => {
    setRoute([]);
    setStepIndex(0);
    setShowEndConfirm(false);
  };
  const jumpToStep = (idx) => {
    if (idx >= 0 && idx < route.length) setStepIndex(idx);
  };

  const onPlaceClickFromLeft = (place) => {
    setSelectedPlace(place);
    setShowChoiceModal(true);
  };
  const applyPlaceAsStart = () => {
    if (selectedPlace) setStart(getDisplayName(selectedPlace));
    setShowChoiceModal(false);
  };
  const applyPlaceAsGoal = () => {
    if (selectedPlace) setGoal(getDisplayName(selectedPlace));
    setShowChoiceModal(false);
  };

  const currentImage = route.length > 0 ? route[stepIndex]?.image : null;

  // --- 表示用に中継除外 ---
  const visibleRoute = route.filter(r => {
    const n = places.find(p => p.id === r.id);
    return !n || n.category !== "中継";
  });

  // ロード中は読み込み画面を表示
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-xl text-sky-700 font-bold animate-pulse">
          地図データを読み込み中...
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen">


        <div className="flex flex-col md:flex-row">
          {/* 左側: カテゴリ絞り込み */}
          <aside className="flex-1 p-4 flex flex-col">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow p-4 flex flex-col h-full">
              <h2 className="text-lg font-semibold text-sky-700 mb-3">📍 カテゴリーで絞り込み</h2>

              {/* プルダウン */}
              <div className="relative w-full mb-4">
                <select
                  value={Object.keys(categoryFilters).find(cat => categoryFilters[cat]) || ""}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="block w-full p-2 pr-8 text-sm rounded-lg border border-gray-300 bg-white/80 backdrop-blur-sm shadow-sm focus:outline-none focus:ring-0 focus:ring-sky-400 appearance-none"
                >
                  <option value="">すべてのカテゴリ</option>
                  {Object.keys(categoryFilters).filter(cat => cat !== "階段" && cat !== "中継").map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  ▼
                </div>
              </div>

              {/* 候補リスト */}
              <div className="flex-1 overflow-y-auto max-h-64">
                {filteredPlaces.length === 0 ? (
                  <p className="text-xs text-gray-400">カテゴリを選択すると場所がここに表示されます。</p>
                ) : (
                  <ul className="space-y-2">
                    {filteredPlaces.map((p) => (
                      <li
                        key={p.id}
                        onClick={() => onPlaceClickFromLeft(p)}
                        className="p-3 border rounded-md hover:bg-sky-50 cursor-pointer"
                      >
<div className="font-medium text-sky-700">{getDisplayName(p)}</div>
                        <div className="text-xs text-gray-500">{p.category} ・ {p.floor || "-"}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-500">※タップで出発地・目的地を選択できます</p>
              </div>
            </div>
          </aside>

          {/* 右側: ルート検索と経路一覧 */}
          <aside className="md:flex-1 p-4 flex flex-col">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow p-4 flex flex-col h-full">
              {/* 出発地・目的地入力 */}
              <div className="mb-3">
                <label className="text-xs text-gray-500">出発地</label>
                <div className="relative">
                  <input
                    value={start}
                    onChange={handleStartInput}
                    placeholder="例：文実受付"
                    className="w-full p-2 rounded-md border"
                  />
                  {startSuggestions.length > 0 && (
                    <ul className="absolute z-20 left-0 right-0 bg-white border rounded shadow max-h-40 overflow-y-auto mt-1">
                      {startSuggestions
                        .filter(p => p.category !== "中継") // 中継ノードは表示しない
                        .map((p) => (
                          <li
                            key={p.id}
                            onClick={() => selectStart(getDisplayName(p))}
                            className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                          >
                            {getDisplayName(p)}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label className="text-xs text-gray-500">目的地</label>
                <div className="relative">
                  <input
                    value={goal}
                    onChange={handleGoalInput}
                    placeholder="例：中庭ステージ"
                    className="w-full p-2 rounded-md border"
                  />
                  {goalSuggestions.length > 0 && (
                    <ul className="absolute z-20 left-0 right-0 bg-white border rounded shadow max-h-40 overflow-y-auto mt-1">
                      {goalSuggestions
                        .filter(p => p.category !== "中継") // 中継ノードは表示しない
                        .map((p) => (
                          <li
                            key={p.id}
                            onClick={() => selectGoal(getDisplayName(p))}
                            className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                          >
                            {getDisplayName(p)}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>


              <div className="mt-1">
                <button
                  onClick={handleStartNavigation}
                  className="w-full py-2 bg-sky-600 text-white rounded-xl shadow"
                >
                  🚶 ナビ開始
                </button>
              </div>

              <hr className="my-4" />

              {/* 経路一覧 */}
              <div className="flex-1 overflow-y-auto max-h-40">
                <h3 className="text-sm font-medium text-gray-600 mb-2">経路一覧</h3>
                {visibleRoute.length === 0 ? (
                  <p className="text-xs text-gray-400">経路を開始すると、ここにステップが表示されます。</p>
                ) : (
                  <ul className="space-y-2">
                    {visibleRoute.map((s, i) => (
                      <li
                        key={s.id || i}
                        onClick={() => {
                          const originalIndex = route.findIndex(r => r.id === s.id);
                          jumpToStep(originalIndex);
                        }}
                        className={`p-3 rounded-lg cursor-pointer transition ${route[stepIndex].id === s.id ? "bg-sky-100 border-l-4 border-sky-500" : "bg-white"}`}
                      >
                        <div className="text-sm font-semibold text-gray-800">
                          {route[stepIndex].id === s.id ? "→ " : ""}{s.text}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">ステップ {i + 1}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* 下段：マップ表示 */}
        <main className="flex-1 relative pt-4 px-6 pb-28">
          <div className="absolute inset-0 z-0">
            {currentImage ? (
              <img
                src={currentImage}
                alt="現在の案内写真"
                className="w-full h-full object-cover filter brightness-75"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : (
              <div className="w-full h-full bg-[url('/map-placeholder.png')] bg-cover bg-center opacity-40" />
            )}
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-5 mb-4">
              {route.length === 0 ? (
                <p className="text-gray-700 text-center">出発地と目的地を設定して「ナビ開始」を押してください。</p>
              ) : (() => {
                let displayStep = route[stepIndex];
                let node = places.find(p => p.id === displayStep.id);

                let displayIndex = stepIndex;
                while (node && node.category === "中継" && displayIndex < route.length - 1) {
                  displayIndex += 1;
                  displayStep = route[displayIndex];
                  node = places.find(p => p.id === displayStep.id);
                }

                const visibleIndex = visibleRoute.findIndex(r => r.id === displayStep.id);

                return (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">現在の案内</p>
                        <h3 className="text-xl font-semibold text-sky-800">{displayStep.text}</h3>
                      </div>
                      <div className="text-sm text-gray-600">
                        {visibleIndex + 1} / {visibleRoute.length}
                      </div>
                    </div>
                    {displayStep.image && (
                      <div className="mt-3 rounded-lg overflow-hidden">
                        <img src={displayStep.image} alt="step" className="w-full h-52 object-cover" />
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow p-4">
              <MapFloorView
                route={route}
                places={places}
                stepIndex={stepIndex}
              />
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="fixed bottom-0 left-0 w-full z-40 bg-white/90 backdrop-blur-md border-t border-gray-300 shadow-lg">
          <div className="max-w-5xl mx-auto flex justify-around items-center py-3 px-4 gap-3">
            <button
              onClick={handleResetSteps}
              className="flex-1 py-2 bg-gray-100 text-gray-800 rounded-xl shadow-sm hover:bg-gray-200 transition text-center"
            >
              最初に戻る
            </button>

            <button
              onClick={handlePrevStep}
              className="flex-1 py-2 bg-gray-100 text-gray-800 rounded-xl shadow-sm hover:bg-gray-200 transition text-center"
            >
              戻る
            </button>

            <button
              onClick={handleNextStep}
              disabled={route.length === 0}
              className={`flex-1 py-2 rounded-xl shadow-sm transition text-center
               ${route.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-sky-500 text-white hover:bg-sky-600"}
              `}
            >
              次へ
            </button>


            <div className="flex-1">
              <button
                onClick={() => setShowEndConfirm(true)}
                disabled={route.length === 0}
                className={`w-full py-2 rounded-xl shadow-sm transition text-center
                  ${route.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-red-500 text-white hover:bg-red-600"}
                `}
              >
                ナビを終了する
              </button>

            </div>
          </div>
        </footer>

        {/* 終了確認モーダル（画面中央の確実に表示されるモーダル） */}
        {showEndConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl p-6 w-[92%] max-w-md">
              <p className="text-center text-gray-800 mb-4">ナビを終了しますか？</p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // 終了処理（既存の handleEndNavigation を呼ぶ）
                    handleEndNavigation();
                  }}
                  className="flex-1 py-2 bg-red-500 text-white rounded-lg"
                >
                  終了する
                </button>

                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
        {/* モーダル */}
        {showChoiceModal && selectedPlace && (<div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-sky-700 mb-3">{getDisplayName(selectedPlace)}</h3>
            <p className="text-xs text-gray-500 mb-3">{selectedPlace.category}</p>
            <div className="flex gap-3">
              <button onClick={applyPlaceAsStart} className="flex-1 py-2 bg-sky-500 text-white rounded-xl">出発地に設定</button>
              <button onClick={applyPlaceAsGoal} className="flex-1 py-2 bg-green-500 text-white rounded-xl">目的地に設定</button>
            </div>
            <button onClick={() => setShowChoiceModal(false)} className="mt-3 w-full py-1 text-sm text-gray-500 hover:underline">キャンセル</button>
          </div>
        </div>
        )}

      </div>
    </Layout>
  );
}