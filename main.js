// ハンバーガーボタンの動的処理
// {
//     const hamburger = document.querySelector('.hamburger');
//     const nav = document.querySelector('.nav'); //navクラスの要素を取得

//     hamburger.addEventListener('click', function(){
//         hamburger.classList.toggle('open'); //hamburgerにopenクラスを付け外しする
//         nav.classList.toggle('open'); //openクラスを付け外しする
//     });
// }

// 発言入力の動的処理
document.addEventListener('DOMContentLoaded', () => {
    // テキストエリアにイベントリスナーを設定
    const toggle = document.getElementById("readToggle");
    const label = document.getElementById("toggleLabel");
    const textarea = document.getElementById("Chat");
    const readToggle = document.getElementById("readToggle");
    // const displayArea = document.getElementById("displayArea");
    const logArea = document.getElementById("logArea");
    let lastKeyWasEnter;

    let lastEnterTime = 0;

    toggle.addEventListener("change", () => {
        label.textContent = toggle.checked ? "発言内容の音声読み上げ ON" : "発言内容の音声読み上げ OFF";
    });

    textarea.addEventListener("keyup", function(e){
        // Enterがクリックされる場合に発話する
        if(e.key === 'Enter'){
            if(e.key === 'Enter' && e.shiftKey){
                e.preventDefault(); // Shift + Enterのデフォルト動作を防止
                textarea.value = '';
                // lastKeyWasEnter = false;
                // return;
            }

            // const now = Date.now();
            // const timeSinceLastEnter = now - lastEnterTime;
            // lastEnterTime = now;

            const cursorPos = textarea.selectionStart;
            const textBeforeCursor = textarea.value.substring(0, cursorPos);

            // if(timeSinceLastEnter < 500){
            //     textarea.value = ''
            //     return;
            // }

            // 最後の改行位置を探す
            const lines = textBeforeCursor.split('\n');
            const lastLine = lines[lines.length - 2] || ''; //1つ前の行

            if(readToggle.checked && lastLine.trim() !== ''){
                speak(lastLine);
            }
            else if(!readToggle.checked && lastLine.trim() !== ''){
                // ログに追加
                const logEntry = document.createElement("div");
                logEntry.textContent = lastLine;
                logArea.appendChild(logEntry);
                // 自動スクロール
                logEntry.scrollIntoView({ behavior: "smooth" });
            }
            // テキストを読み上げる
            // speak(textarea.value);
            lastKeyWasEnter = true;
        }else{
            lastKeyWasEnter = false;
        }
    });
});

// テキストを読み上げる関数
function speak(text){
    // const displayArea = document.getElementById("displayArea");
    const logArea = document.getElementById("logArea");
    // displayArea.innerHTML = ""; //表示領域をクリア

    const logEnrty = document.createElement("br");

    // spanで文字を分割表示
    const spans = [...text].map(char => {
        const span = document.createElement("span");
        span.textContent = char;
        logArea.appendChild(span);
        logArea.appendChild(logEnrty);
        logEnrty.scrollIntoView({ behavior: "smooth" });
        return span;
    });

    // SpeechSynthesisUtterance オブジェクトを作成
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP"; //言語設定を日本語に設定
    utterance.rate = 1.0; // 読み上げの速さを1.0倍に設定

    // 1文字あたりの時間(ms)
    const charTime = 170;

    // アニメーション処理
    spans.forEach((span, i) => {
        setTimeout(() => {
            span.classList.add("red");
        }, i * charTime)
    });

    utterance.onend = () => {
        spans.forEach((span, i) => {
            span.classList.add("black");
        });
    };

    //テキストを読み上げる
    window.speechSynthesis.speak(utterance);

    // ログに追加
    // const logEntry = document.createElement("div");
    // logEntry.textContent = text;
    // logArea.appendChild(logEntry);
}

// 呼びかけボタンの動的処理
// DOMが完全にロードされたらイベントリスナーを設定
document.addEventListener('DOMContentLoaded', function(){
    const playButton = document.getElementById("Calling");
    const callingType = document.getElementById("CallingType");

    if(playButton){
        playButton.addEventListener("click", function(){
            const mode = callingType.value;

            playButton.disabled = true;
            playButton.textContent = "🔴 呼びかけ中...";
            playButton.classList.add("blink");

            if(mode === 'TextDisplay'){ // 今いいですか？モード
                const utterance = new SpeechSynthesisUtterance("今いいですか？");
                utterance.lang = "ja-JP";
                utterance.rate = 1.0;

                utterance.onend = () => {
                    resetCallButton();
                };

                window.speechSynthesis.speak(utterance);
            } else if(mode === 'ModeDisplay'){ // 通知音モード
                const audio = new Audio('CallingSound2.mp3');
                let playCount = 0;

                audio.addEventListener('ended', () => {
                    playCount++;
                    if(playCount < 2){
                        audio.currentTime = 0;
                        audio.play();
                    } else {
                        resetCallButton();
                    }
                });

                audio.play().catch(function(e){
                    console.log('音声再生に失敗しました。', e);
                    resetCallButton();
                });
            } else if(mode === 'BlinkMode'){ // 点滅モード
                document.body.classList.add('blink-background');

                setTimeout(() => {
                    document.body.classList.remove('blink-background');
                    resetCallButton();
                }, 3000);
            }
        });

        function resetCallButton(){
            playButton.textContent = "呼びかけ";
            playButton.classList.remove("blink");
            playButton.disabled = false;
        }
    } else {
        console.error("ボタンがDOMに存在しません。");
    }
});

// 通知音⇔今いいですか？モードの切り替わり
// document.addEventListener('DOMContentLoaded', function(){
//     const toggle = document.getElementById("SoundToggle");
//     const display = document.getElementById("ModeDisplay");

//     // 初期表示を設定
//     display.textContent = toggle.checked ? "「今いいですか？」モード" : "通知音モード";

//     // トグルボタンの状態が変わったら表示を更新
//     toggle.addEventListener('change', function(){
//         if(toggle.checked){
//             display.textContent = "「今いいですか？」モード";
//         } else{
//             display.textContent = "通知音モード";
//         }
//     });
// });

// カメラの動的処理
window.addEventListener('load', function(){
    // Videoのstream
    let stream = null;
    // Videoの設定値
    const constraints = {
        audio: false,
        video: {
            width: 300,
            height: 300,
            // フロントカメラの場合
            facingMode: 'user',
        },
    }
    // カメラ起動
    async function startCamera(constraints) {
        try{
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            const video = document.getElementById('video');
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.play();
            };
        } catch(err){
            //エラーハンドリング
            console.error(err);
        }
    }
    // カメラ停止
    function stopCamera(){
        const video = document.getElementById('video');
        const tracks = video.srcObject.getTracks();
        tracks.forEach((track) => {
            track.stop();
        });
        video.srcObject = null;
    }

    // 初期処理
    startCamera(constraints);
});