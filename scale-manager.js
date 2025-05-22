// ウィンドウサイズに合わせて、各機能が自動的に拡大・縮小する動的処理
function adjustScale() {
    const baseWidth = 1064; // 想定するデザイン基準幅（例）
    const scale = window.innerWidth / baseWidth;
    
    // scale が大きすぎないよう制限（拡大しすぎ防止）
    const adjustedScale = Math.min(scale, 1);

    document.body.style.transform = `scale(${adjustedScale})`;
    document.body.style.transformOrigin = "top left";

    // 余白防止のため、スケーリング後の高さを調整
    document.body.style.height = `${window.innerHeight / adjustedScale}px`;
}
window.addEventListener("resize", adjustScale);
window.addEventListener("DOMContentLoaded", adjustScale);

// const scaleManager = {
//     baseWidth: 1064, // デザインの基準幅
//     applyZoom: function () {
//         const currentWidth = window.innerWidth;
//         const currentHeight = window.innerHeight;

//         let zoom = currentWidth / this.baseWidth;
//         if (zoom > 1) zoom = 1;

//         // ズーム適用
//         document.body.style.zoom = zoom;

//         // 余白ができないように高さを逆算して設定
//         const adjustedHeight = currentHeight / zoom;
//         document.documentElement.style.height = adjustedHeight + "px";
//         document.body.style.height = adjustedHeight + "px";

//         // スクロール可能に（念のため）
//         document.documentElement.style.overflow = "auto";
//         document.body.style.overflow = "auto";
//     }
// };

// window.addEventListener("load", () => {
//     scaleManager.applyZoom();
// });
// window.addEventListener("resize", () => {
//     scaleManager.applyZoom();
// });
