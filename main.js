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
    const textarea = document.getElementById("Chat");
    textarea.addEventListener("keyup", function(e){
        // Enterがクリックされる場合に発話する
        if(e.key === 'Enter'){
            const cursorPos = textarea.selectionStart;
            const textBeforeCursor = textarea.value.substring(0, cursorPos);

            // 最後の改行位置を探す
            const lines = textBeforeCursor.split('\n');
            const lastLine = lines[lines.length - 2] || ''; //1つ前の行

            if(lastLine.trim() !== ''){
                speak(lastLine);
            }
            // テキストを読み上げる
            // speak(textarea.value);
        }
    });
});

// テキストを読み上げる関数
function speak(text){
    // SpeechSynthesisUtterance オブジェクトを作成
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP"; //言語設定を日本語に設定
    utterance.rate = 1.0; // 読み上げの速さを1.0倍に設定

    //テキストを読み上げる
    window.speechSynthesis.speak(utterance);
}

// 呼びかけボタンの動的処理
// DOMが完全にロードされたらイベントリスナーを設定
document.addEventListener('DOMContentLoaded', function(){
    // 発話ボタンにクリックイベントリスナーを設定
    const playButton = document.getElementById("Calling"); //playbuttonに変数名を更新
    // const soundToggle = document.getElementById("SoundToggle");
    const CallingType = document.getElementById("CallingType");

    // ボタンの存在をチェック
    if(playButton){
        playButton.addEventListener("click", function(){
            // ボタンテキストを「呼びかけ中…」にして点滅
            playButton.disabled = true;
            playButton.textContent = "🔴 呼びかけ中...";
            playButton.classList.add("blink");

            if(CallingType.options[1].selected){ //soundToggle.checked
                const utterance = new SpeechSynthesisUtterance("今いいですか？");
                utterance.lang = "ja-JP";
                utterance.rate = 1.0;

                // 再生終了時に元に戻す
                utterance.onend = () => {
                    playButton.textContent = "呼びかけ";
                    playButton.classList.remove("blink");
                    playButton.disabled = false;
                };

                window.speechSynthesis.speak(utterance);
            } else if(CallingType.options[0].selected){
                // Audioインスタンスを作成し、ファイルを指定
                var audio = new Audio('CallingSound2.mp3');
                let playCount = 0;
                
                // 音声を再生
                audio.addEventListener('ended', () => {
                    playCount++;
                    if(playCount < 2){
                        audio.currentTime = 0;
                        audio.play()
                    } else {
                        playButton.disabled = false;
                        playButton.textContent = "呼びかけ";
                        playButton.classList.remove("blink");
                    }
                });

                // 最初の1回目の再生開始
                audio.play().catch(function(e){
                    console.log('音声再生に失敗しました。', e);
                    playButton.disabled = false;
                    playButton.textContent = "呼びかけ";
                    playButton.classList.remove("blink");
                });

                // // 再生終了時に元に戻す
                // audio.onended = () => {
                //     playButton.textContent = "呼びかけ";
                //     playButton.classList.remove("blink");
                //     playButton.disabled = false;
                // };
            } 
        });
    } else {
        // ボタンが見つからない場合のエラーメッセージ
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