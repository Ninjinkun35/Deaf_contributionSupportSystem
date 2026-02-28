// =============================================================================
// 機能1: 音声リスト（getVoices）の準備
// テスト: 「1. 日本語 voice を選ぶ・使う」→ getVoices に日本語があるとき jaVoice が日本語になる
// Chrome では getVoices() が非同期で返るため、voiceschanged で更新する（Mac/Windows 両対応）
// =============================================================================
let jaVoice = null;

function updateJaVoice() {
  const voices = window.speechSynthesis.getVoices();
  jaVoice = voices.find(v => v.lang === 'ja-JP' || v.lang.startsWith('ja')) || voices[0] || null;
  // テストから参照できるよう global/window に同期（eval は strict で別スコープになるため）
  if (typeof global !== 'undefined') global.jaVoice = jaVoice;
  if (typeof window !== 'undefined') window.jaVoice = jaVoice;
}
if (typeof global !== 'undefined') global.updateJaVoice = updateJaVoice;
if (typeof window !== 'undefined') window.updateJaVoice = updateJaVoice;

const voices = window.speechSynthesis.getVoices();
if (Array.isArray(voices) && voices.length > 0) {
  updateJaVoice();
}
if (typeof global !== 'undefined') global.jaVoice = jaVoice;
if (typeof window !== 'undefined') window.jaVoice = jaVoice;
window.speechSynthesis.addEventListener('voiceschanged', updateJaVoice);

// =============================================================================
// 機能2: 発言入力の動的処理（Enter 1回で読み上げ・2回でテキストクリア）
// テスト: 「3. Enter の 1回/2回と空行」→ Enter 1回で読み上げられ、2回でテキストがクリアされる / 空行は読み上げられない
// =============================================================================
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
        if (e.key !== 'Enter') {
            lastKeyWasEnter = false;
            return;
        }

        // IME の変換確定で押した Enter は無視（テスト: isComposing が true の Enter では読み上げ・クリアしない）
        if (e.isComposing) return;

        // --- 2回目の Enter: テキストエリアをクリアして終了 ---
        if (lastKeyWasEnter) {
            textarea.value = '';
            lastKeyWasEnter = false;
            return;
        }

        // --- 1回目の Enter: 直前の行を取得し、読み上げ or ログ ---
        const cursorPos = textarea.selectionStart;
        const textBeforeCursor = textarea.value.substring(0, cursorPos);
        const lines = textBeforeCursor.split('\n');
        // 2行以上なら1つ前の行、1行だけならその行（keyup 時に改行がまだ入っていない実機ケース対応）
        const lastLine = lines.length >= 2 ? (lines[lines.length - 2] || '') : (lines[0] || '');

        if (lastLine.trim() === '') {
            // 空行・空白のみ → 読み上げ／ログしない（テスト: 空行や空白のみの行は読み上げられない）
            lastKeyWasEnter = true;
            return;
        }

        if (readToggle.checked) {
            speak(lastLine);
        } else {
            const logEntry = document.createElement("div");
            logEntry.textContent = lastLine;
            logArea.appendChild(logEntry);
            logEntry.scrollIntoView({ behavior: "smooth" });
        }
        lastKeyWasEnter = true;
    });
});

// =============================================================================
// 機能3: テキストを読み上げる関数 speak
// テスト: 「1. 日本語 voice を選ぶ・使う」→ speak を呼ぶと utterance.voice に jaVoice がセットされる
// テスト: 「2. speak 前に cancel」→ speak() を呼ぶと cancel() が speak() より先に呼ばれる
// =============================================================================
function speak(text) {
    const logArea = document.getElementById("logArea");
    const logEnrty = document.createElement("br");

    // ログエリアへ 1 文字ずつ span 表示（ハイライト用）
    const spans = [...text].map(char => {
        const span = document.createElement("span");
        span.textContent = char;
        logArea.appendChild(span);
        logArea.appendChild(logEnrty);
        logEnrty.scrollIntoView({ behavior: "smooth" });
        return span;
    });

    // 発話オブジェクト作成・言語・速度・voice 設定（テスト: utterance.voice = jaVoice）
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP"; //言語設定を日本語に設定
    utterance.rate = 1.0; //速度設定を1.0に設定
    if (jaVoice) utterance.voice = jaVoice; //jaVoiceがあればjaVoiceに設定

    const charTime = 170;
    spans.forEach((span, i) => {
        setTimeout(() => span.classList.add("red"), i * charTime);
    });
    utterance.onend = () => {
        spans.forEach((span) => span.classList.add("black"));
    };

    // 前回の再生が残っていると無音になるため cancel してから発話（テスト: cancel が speak より先）
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
}

// =============================================================================
// 機能4: 呼びかけボタンの動的処理（今いいですか？ / 通知音 / 点滅）
// =============================================================================
document.addEventListener('DOMContentLoaded', function(){
    const playButton = document.getElementById("Calling");
    const callingType = document.getElementById("CallingType");

    if (playButton) {
        playButton.addEventListener("click", function(){
            const mode = callingType.value;

            playButton.disabled = true;
            playButton.textContent = "🔴 呼びかけ中...";
            playButton.classList.add("blink");

            if (mode === 'TextDisplay') {
                // 今いいですか？モード（発話前に cancel・jaVoice で Mac/Windows 両対応）
                const utterance = new SpeechSynthesisUtterance("今いいですか？");
                utterance.lang = "ja-JP";
                utterance.rate = 1.0;
                if (jaVoice) utterance.voice = jaVoice;
                utterance.onend = () => resetCallButton();

                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utterance);
            } else if (mode === 'ModeDisplay') {
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

// =============================================================================
// 機能5: カメラの動的処理
// =============================================================================
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
