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