import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // ← ルーティング機能を追加

// ↓ ファイル名を小文字にしたので、import元も小文字に合わせます
import App from "./app";
import Admin from "./admin"; // ← 管理者画面を読み込み

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename="/2nd-schoolmap"> {/* ← base pathを指定 */}
      <Routes>
        {/* URLが "/" のときは地図アプリを表示 */}
        <Route path="/" element={<App />} />
        
        {/* URLが "/admin" のときは管理者画面を表示 */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);