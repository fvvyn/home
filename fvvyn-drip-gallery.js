// fvvyn-drip-gallery.js (最終版 - GAS URL埋め込み済み)

// 📌 あなたの新しいGASのJSON API URL
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzdLbdQ_lmmi8wIAvK8rAMPQe0qK-Im6-cBCzPHK2b4yBAhxeRoj2wc4e4yWgOEYQOv5Q/exec"; 

// ギャラリーを表示するコンテナのID
const CONTAINER_ID = "user-drip-container";

/**
 * Instagramストーリーシェア用のWeb Intent URLを生成する関数。
 * @param {string} imageUrl シェアしたい画像の公開URL
 * @param {string} username 投稿者のInstagramユーザー名
 * @returns {string} Instagram Web Intent URL
 */
function createInstagramShareUrl(imageUrl, username) {
    // ⚠️ この方法はInstagramの公式なWeb Intentではなく、動作保証がありません。
    // アプリの起動と画像URLの引き渡しを試みるスキームを使用します。
    // 必要であれば、より詳細なパラメーターを追加することも可能です。
    // 例: return `instagram://story/share?link_url=${encodeURIComponent(imageUrl)}&text=${encodeURIComponent(`@${username}さんのFVVYN Dripコーデ！ #FVVYN_Drip`)}&attribution_id=fvvyn`;
    // ただし、Instagramのアプリ側がどこまでWeb Intentに対応しているかはバージョンに依存します。
    return `instagram://story/share?link_url=${encodeURIComponent(imageUrl)}&attribution_id=fvvyn`;
}

/**
 * GAS APIからデータを取得し、ギャラリーをレンダリングするメイン関数。
 */
async function renderDripGallery() {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) {
        console.error(`MasonryコンテナID "${CONTAINER_ID}" が見つかりません。`);
        return;
    }

    // 1. データ取得
    let posts = [];
    try {
        const response = await fetch(GAS_API_URL);
        if (!response.ok) {
            throw new Error(`GAS APIからのデータ取得に失敗しました: ${response.statusText} (${response.status})`);
        }
        posts = await response.json(); 
    } catch (error) {
        console.error("投稿データの取得中にエラーが発生しました:", error);
        container.innerHTML = `<p style="text-align:center;">投稿データの読み込みに失敗しました。</p>`;
        return;
    }

    if (!Array.isArray(posts) || posts.length === 0) {
        container.innerHTML = `<p style="text-align:center;">まだ投稿がありません。最初のDripコーデを投稿しよう！</p>`;
        return;
    }
    
    // 2. HTML要素の構築 (DOM操作を効率化するためにDocumentFragmentを使用)
    const fragment = document.createDocumentFragment();

    posts.forEach(post => {
        const item = document.createElement('div');
        item.className = 'drip-item'; // Masonryが識別するクラス

        // 画像要素
        const img = document.createElement('img');
        img.src = post.image_url;
        img.alt = `${post.username} のFVVYN Dripコーディネート`;
        img.loading = 'lazy'; // 遅延読み込み
        img.onerror = () => { // 画像読み込み失敗時のハンドリング
            img.src = 'https://via.placeholder.com/300x400?text=Image+Load+Error'; // 代替画像
            console.error(`画像の読み込みに失敗しました: ${post.image_url}`);
        };

        // ユーザー名表示
        const usernameDiv = document.createElement('div');
        usernameDiv.className = 'drip-username';
        usernameDiv.textContent = `@${post.username}`;

        // ストーリーシェアボタン
        const shareButton = document.createElement('button');
        shareButton.className = 'drip-share-button';
        shareButton.textContent = 'ストーリーでシェア 📸';
        shareButton.onclick = (e) => {
            e.preventDefault(); // デフォルトのイベントを防ぐ
            const shareUrl = createInstagramShareUrl(post.image_url, post.username);
            window.open(shareUrl, '_blank'); // 新しいタブで開く
        };

        // 各要素をアイテムに追加
        item.appendChild(img);
        item.appendChild(usernameDiv);
        item.appendChild(shareButton);
        
        // アイテムをフラグメントに追加
        fragment.appendChild(item);
    });

    // 構築したフラグメントをDOMに追加
    container.appendChild(fragment);

    // 3. Masonryレイアウトの適用と画像の読み込み完了待機
    // imagesLoadedは、Masonryを適用する前に全ての画像が読み込まれるのを待つために使用します。
    imagesLoaded(container, function() {
        new Masonry(container, {
            itemSelector: '.drip-item', // Masonryアイテムのセレクタ
            percentPosition: true,      // アイテムサイズをパーセンテージで指定
            gutter: 10                  // アイテム間の隙間 (ピクセル)
        });
        console.log("Masonryレイアウトが完了しました。");
    });
}

// ページ読み込み完了時にrenderDripGallery関数を実行
document.addEventListener('DOMContentLoaded', renderDripGallery);
