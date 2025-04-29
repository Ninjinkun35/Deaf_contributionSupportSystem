// ハンバーガーボタンの動的処理
{
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav'); //navクラスの要素を取得

    hamburger.addEventListener('click', function(){
        hamburger.classList.toggle('open'); //hamburgerにopenクラスを付け外しする
        nav.classList.toggle('open'); //openクラスを付け外しする
    });
}

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
    var playButton = document.getElementById("Calling"); //playbuttonに変数名を更新
    // ボタンの存在をチェック
    if(playButton){
        playButton.addEventListener("click", function(){
            // Audioインスタンスを作成し、ファイルを指定
            var audio = new Audio('CallingSound.mp3');
        
            // 音声を再生
            audio.play().catch(function(e){
                console.log('音声再生に失敗しました。', e);
            });
        });
    } else {
        // ボタンが見つからない場合のエラーメッセージ
        console.error("ボタンがDOMに存在しません。");
    }
});

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