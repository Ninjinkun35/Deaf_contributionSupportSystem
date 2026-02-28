// モックとしてwindow環境を用意　
// 用意しないと、window.speechSynthesisがundefinedでテストできない
const mockCancel = jest.fn();
const mockSpeak = jest.fn();
const mockGetVoices = jest.fn();

window.speechSynthesis = {
  getVoices: mockGetVoices,
  speak: mockSpeak,
  cancel: mockCancel,
  addEventListener: jest.fn(),
};

// DOM （main.js が参照する id を用意）
document.body.innerHTML = `
  <textarea id="Chat"></textarea>
  <input type="checkbox" id="readToggle" />
  <div id="toggleLabel"></div>
  <div id="logArea"></div>
`;

// Node にない SpeechSynthesisUtterance をモック（speak() 内で new される）
window.SpeechSynthesisUtterance = jest.fn().mockImplementation(function (text) {
    this.text = text;
    this.lang = '';
    this.rate = 1;
    this.voice = null;
    this.onend = null;
});
  
// main.js を eval で読み込み、speak をテストスコープに露出
const fs = require('fs');
const path = require('path');
const mainCode = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf8');
Element.prototype.scrollIntoView = jest.fn();
eval(mainCode);

// DOMContentLoaded を発火（require の時点ではまだ発火していない場合があるため）
document.dispatchEvent(new Event('DOMContentLoaded'));

// テストケース： 日本語 voice を選ぶ・使う
describe('1. 日本語 voice を選ぶ・使う', () => {
    beforeEach(() => {
      mockGetVoices.mockClear();
      mockSpeak.mockClear();
      mockCancel.mockClear();
    });
    it('getVoices に日本語があるとき jaVoice が日本語になる', () => {
      const jaJPVoice = { lang: 'ja-JP', name: 'Japanese' };
      mockGetVoices.mockReturnValue([
        { lang: 'en-US', name: 'English' },
        jaJPVoice,
      ]);
      global.updateJaVoice();
      expect(global.jaVoice).not.toBeNull();
      expect(global.jaVoice.lang).toBe('ja-JP');
    });
    it('speak を呼ぶと utterance.voice に jaVoice がセットされる', () => {
      const jaJPVoice = { lang: 'ja-JP', name: 'Japanese' };
      mockGetVoices.mockReturnValue([jaJPVoice]);
      global.updateJaVoice();
      speak('テスト');
      expect(mockSpeak).toHaveBeenCalled();
      const utterance = mockSpeak.mock.calls[0][0];
      expect(utterance.voice).toBe(jaJPVoice);
    });
  });

//テストケース: speak 前に cancel
describe('2. speak 前に cancel', () => {
    beforeEach(() => {
        mockCancel.mockClear();
        mockSpeak.mockClear();
    });

    it('speak() を呼ぶと cancel() が speak() より先に呼ばれる', () => {
        const callOrder = [];
        mockCancel.mockImplementation(() => callOrder.push('cancel'));
        mockSpeak.mockImplementation(() => callOrder.push('speak'));
        speak('テスト');
        expect(callOrder).toEqual(['cancel', 'speak']);
    });
});

//テストケース: Enter の 1回/2回と空行
describe('3. Enter の 1回/2回と空行', () => {
    let textarea;
    let readToggle;
    let logArea;

    beforeEach(() => {
      textarea = document.getElementById('Chat');
      readToggle = document.getElementById('readToggle');
      logArea = document.getElementById('logArea');
      textarea.value = '';
      logArea.innerHTML = '';
      readToggle.checked = true;
      mockSpeak.mockClear();
    });

    // 改行がすでに value に入っている場合（lines.length >= 2）。多くの環境で Enter の keyup 時には改行が挿入済み。
    it('Enter 1回で読み上げられ、2回でテキストがクリアされる（改行済みのとき）', () => {
      textarea.value = 'あいう\n';
      textarea.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
      expect(mockSpeak).toHaveBeenCalledTimes(1);
      mockSpeak.mockClear();
      textarea.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
      expect(textarea.value).toBe('');
      expect(mockSpeak).not.toHaveBeenCalled();
    });

    // 実機で起きうる「Enter の keyup 時点ではまだ改行が入っていない」場合。
    // ブラウザや IME の差で、keyup 発火時に value がまだ "あいう" のままのときがある。
    // このとき lines = ["あいう"] なので lines[lines.length - 2] は undefined になり、
    // 現状の実装では lastLine が空になって読み上げられない。
    // 修正後は「1行だけのときは lines[0] を使う」ことで読み上げられることを確認する。
    it('1行だけの状態で Enter を押したときも読み上げられる（改行がまだ入っていないとき）', () => {
      textarea.value = 'あいう';
      textarea.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
      expect(mockSpeak).toHaveBeenCalledTimes(1);
      const utterance = mockSpeak.mock.calls[0][0];
      expect(utterance.text).toBe('あいう');
    });

    // IME の変換確定で押した Enter は「発言確定」ではないため、読み上げもクリアも行わない。
    // keyup で isComposing: true のときは早期 return する実装の検証用。
    // Red 理由: 実装が e.isComposing を見ていないため、isComposing: true の Enter でも speak() が呼ばれてしまう。
    // 直前のテストで lastKeyWasEnter が true のまま残るため、Enter 以外の keyup でリセットしてから発火する。
    it('isComposing が true の Enter では読み上げ・クリアしない（IME 変換確定の Enter を無視）', () => {
      textarea.value = 'あいう';
      textarea.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
      textarea.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', isComposing: true }));
      expect(mockSpeak).not.toHaveBeenCalled();
      expect(textarea.value).toBe('あいう');
    });

    it('空行や空白のみの行は読み上げられない', () => {
      textarea.value = '   \n';
      textarea.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
      textarea.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
      expect(mockSpeak).not.toHaveBeenCalled();
    });
});
