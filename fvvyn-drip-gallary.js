// fvvyn-drip-gallery.js

// 📌 ここにデプロイしたGAS WebアプリのURLを入力してください
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzikee79HbzBI55ZhhZ90Lb4u_I7INpEbsSq2Y0BXFenkYJy-rYJbDBSOIPukSxPpB3/exec"; // ★URLを貼り付け済み

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
            throw new Error(`GAS APIからのデータ取得に失敗しました: ${response.statusText}`);
        }
        // JSONデータが空の場合、エラーではなく空配列を受け取る
        posts = await response.json(); 
    } catch (error) {
        console.error("投稿データの取得中にエラーが発生しました:", error);
        container.innerHTML = `<p style="text-align:center;">投稿データの読み込みに失敗しました。</p>`;
        return;
    }

    if (!Array.isArray(posts) || posts.length === 0) {
        container.innerHTML = `<p style="text-align:center;">まだ投稿がありません。最初のfvvynfitを投稿しよう！</p>`;
        return;
    }
    
    // 2. HTML構築 (フラグメントを使用してDOM操作を最小化)
    const fragment = document.createDocumentFragment();

    posts.forEach(post => {
        const item = document.createElement('div');
        item.className = 'drip-item'; 
        
        const img = document.createElement('img');
        img.src = post.image_url;
        img.alt = `${post.username} のfvvyn fit`;
        img.loading = 'lazy'; 

        const usernameDiv = document.createElement('div');
        usernameDiv.className = 'drip-username';
        usernameDiv.textContent = `@${post.username}`;

        const shareButton = document.createElement('button');
        shareButton.className = 'drip-share-button';
        shareButton.textContent = 'ストーリーでシェア 📸';
        shareButton.onclick = (e) => {
            e.preventDefault(); // 誤作動防止
            const shareUrl = createInstagramShareUrl(post.image_url, post.username);
            window.open(shareUrl, '_blank'); 
        };

        item.appendChild(img);
        item.appendChild(usernameDiv);
        item.appendChild(shareButton);
        fragment.appendChild(item);
    });

    container.appendChild(fragment);

    // 3. Masonry適用とimagesLoadedでのレイアウト再計算
    // 画像が全て読み込まれた後にレイアウトを適用しないと、レイアウトが崩れます。
    imagesLoaded(container, function() {
        new Masonry(container, {
            itemSelector: '.drip-item',
            percentPosition: true, 
            gutter: 10 
        });
        console.log("Masonryレイアウトが完了しました。");
    });
}

// ページ読み込み完了時に実行
document.addEventListener('DOMContentLoaded', renderDripGallery);
