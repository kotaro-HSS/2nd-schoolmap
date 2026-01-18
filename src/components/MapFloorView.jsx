import React, { useEffect, useRef } from "react";

export default function MapFloorView({ route, places, stepIndex }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!route || !places || places.length === 0) return;
        if (!route || !places) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // キャンバスサイズ
        const canvasWidth = 600;
        const canvasHeight = canvasWidth * 3 / 4;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;


        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        if (!route || route.length === 0) return;

        // 現在ステップ
        const currentStep = route[stepIndex];
        const currentNode = places.find(p => p.id === currentStep.id);
        const displayName =
            currentNode.label && currentNode.label.trim() !== ""
                ? currentNode.label
                : currentNode.name;

        if (!currentNode) return;

        // 階判定
        const floorMap = { "1F": 0, "2F": 2000, "3F": 4000 };
        const floorOffsetY = floorMap[currentNode.floor] ?? 0;
        const floorMapImg = { "1F": 0, "2F": 500, "3F": 1000 };
        const imageCropY = floorMapImg[currentNode.floor] ?? 0;

        const img = new Image();
        img.src = "./map_images/map_image.png";

        img.onload = () => {
            const cropHeight = 500;
            const cropWidth = img.width;

            const aspectRatio = cropWidth / cropHeight;
            const targetWidth = canvasWidth; // ← PNG をキャンバス幅に合わせて描く
            const targetHeight = targetWidth;



            ctx.drawImage(
                img,
                0, imageCropY,
                cropWidth, cropHeight,
                0, 0,
                targetWidth, targetHeight
            );


            const toCanvasX = x => (x / 2000) * canvasWidth;
            const toCanvasY = y => ((y - floorOffsetY) / 1500) * canvasHeight;


            const floorRoute = route.filter(r => {
                const n = places.find(p => p.id === r.id);
                if (!n) return true;
                return n.floor === currentNode.floor && n.category !== "中継";
            });

            ctx.strokeStyle = "#007bff";
            ctx.lineWidth = 3;
            ctx.beginPath();

            let lastDrawn = null;

            for (let i = 0; i < route.length; i++) {
                const node = places.find(p => p.id === route[i].id);
                if (!node) continue;

                const sameFloor =
                    node.floor === currentNode.floor ||
                    (lastDrawn && lastDrawn.floor === currentNode.floor);

                const canDraw =
                    lastDrawn &&
                    !(lastDrawn.category === "階段" && node.category === "階段") &&
                    sameFloor;

                const x = toCanvasX(node.x);
                const y = toCanvasY(node.y);

                if (!lastDrawn || !canDraw) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

                lastDrawn = node;
            }

            ctx.stroke();

            floorRoute.forEach(step => {
                const node = places.find(p => p.id === step.id);
                if (!node) return;
                const x = toCanvasX(node.x);
                const y = toCanvasY(node.y);
                ctx.fillStyle = "#007bff";
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = "#000";
                ctx.font = "12px sans-serif";
                ctx.fillText(name, x + 6, y - 6);
            });

            let toNode = null;
            const currentIndex = route.findIndex(r => r.id === currentStep.id);
            const fromNode = currentNode;
            const prevNode =
                currentIndex > 0 ? places.find(p => p.id === route[currentIndex - 1].id) : null;

            for (let i = currentIndex + 1; i < route.length; i++) {
                const n = places.find(p => p.id === route[i].id);
                if (n) {
                    toNode = n;
                    break;
                }
            }

            let arrowTargetNode = toNode;
            let isLastStep = false;

            if (!arrowTargetNode && prevNode) {
                arrowTargetNode = prevNode;
                isLastStep = true;
            }

            if (arrowTargetNode) {
                const cx = toCanvasX(fromNode.x);
                const cy = toCanvasY(fromNode.y);
                const tx = toCanvasX(arrowTargetNode.x);
                const ty = toCanvasY(arrowTargetNode.y);

                let angle = Math.atan2(ty - cy, tx - cx);

                if (
                    fromNode.category === "階段" &&
                    toNode &&
                    toNode.category === "階段" &&
                    fromNode.name === toNode.name &&
                    fromNode.floor !== toNode.floor
                ) {
                    if (prevNode) {
                        const px = toCanvasX(prevNode.x);
                        const py = toCanvasY(prevNode.y);
                        angle = Math.atan2(py - cy, px - cx) + Math.PI;
                    }
                }

                if (isLastStep) angle += Math.PI;

                const size = 20;
                const baseWidth = 16;

                ctx.fillStyle = "red";
                ctx.beginPath();
                ctx.moveTo(cx + size * Math.cos(angle), cy + size * Math.sin(angle));
                ctx.lineTo(
                    cx + (-size * 0.5) * Math.cos(angle) + (baseWidth * 0.5) * Math.cos(angle + Math.PI / 2),
                    cy + (-size * 0.5) * Math.sin(angle) + (baseWidth * 0.5) * Math.sin(angle + Math.PI / 2)
                );
                ctx.lineTo(
                    cx + (-size * 0.5) * Math.cos(angle) + (baseWidth * 0.5) * Math.cos(angle - Math.PI / 2),
                    cy + (-size * 0.5) * Math.sin(angle) + (baseWidth * 0.5) * Math.sin(angle - Math.PI / 2)
                );
                ctx.closePath();
                ctx.fill();
            }
        };
    }, [route, stepIndex, places]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full aspect-[4/3] rounded-lg border border-gray-300 shadow"
            style={{ maxHeight: "450px" }}
        />
    );
}
