// === JavaScript ここから ===
document.addEventListener('DOMContentLoaded', () => {
    const field = document.getElementById('field');
    const hand = document.getElementById('hand');
    const scoreDisplay = document.getElementById('score-display');
    const removedTriplesDisplay = document.getElementById('removed-triples-display');
    const completedRecipesDisplay = document.getElementById('completed-recipes-display');
    const messageArea = document.getElementById('game-message-area');
    const descriptionArea = document.getElementById('game-description');
    const maxHandSize = 6;
    const gridRows = 7; const gridCols = 7;
    const itemData = [ /* ... アイテムデータ ... */ { type: 'tomato', name: 'トマト', file: 'tomato.png' }, { type: 'carrot', name: 'にんじん', file: 'carrot.png' },{ type: 'cabbage', name: 'キャベツ', file: 'cabbage.png' }, { type: 'eggplant', name: 'ナス', file: 'eggplant.png' },{ type: 'pumpkin', name: 'かぼちゃ', file: 'pumpkin.png' }, { type: 'onion', name: '玉ねぎ', file: 'onion.png' },{ type: 'potato', name: 'じゃがいも', file: 'potato.png' }, { type: 'pepper', name: 'ピーマン', file: 'pepper.png' },{ type: 'cucumber', name: 'きゅうり', file: 'cucumber.png' }, { type: 'tuna', name: 'ツナ缶', file: 'tuna.png' },{ type: 'egg', name: '卵', file: 'egg.png' }, { type: 'milk', name: '牛乳', file: 'milk.png' },{ type: 'curry_roux', name: 'カレー粉', file: 'curry_roux.png' }, { type: 'butter', name: 'バター', file: 'butter.png' },{ type: 'meat', name: '肉', file: 'meat.png' }];
    const itemTypes = itemData.map(v => v.type);
    const gridCells = [];
    let tileIdCounter = 0; let handTilesData = []; let score = 0;
    let removedTripleTypes = []; let completedRecipeNames = [];
    const recipes = [ /* ... レシピ定義 ... */ { name: "カレー", ingredients: ['carrot', 'potato', 'onion', 'meat', 'curry_roux'], resultImage: 'curry.png', resultText: 'カレーの完成！' },{ name: "ピーマンとトマトの卵炒め", ingredients: ['pepper', 'tomato', 'egg'], resultImage: 'stir-fried_vegetables.png', resultText: 'ピーマンとトマトの卵炒めの完成！' },{ name: "かぼちゃスープ", ingredients: ['pumpkin', 'milk', 'butter'], resultImage: 'pumpkin_soup.png', resultText: 'かぼちゃスープの完成！' }];
    let messageTimeoutId = null;

    // --- 説明文を設定 ---
    if (descriptionArea) {
        descriptionArea.innerHTML = `
            畑でとなりが空いている材料（金色枠）をクリックして、下のカゴへ移動！<br>
            カゴに同じ材料が3つ揃うと左の「レシピリスト」に追加、スコアもアップ！<br>
            <b>カゴは${maxHandSize}個まで。</b><br>
            集めた材料で右の「完成品」を目指そう！
        `;
    }
    // --------------------

    function updateScoreDisplay() { if (scoreDisplay) { scoreDisplay.textContent = score; } }
    updateScoreDisplay(); // 初期スコア表示

    // 1. グリッドセル生成
    for (let r = 0; r < gridRows; r++) { gridCells[r] = []; for (let c = 0; c < gridCols; c++) { const cell = document.createElement('div'); cell.classList.add('grid-cell'); cell.dataset.row = r; cell.dataset.col = c; field.appendChild(cell); gridCells[r][c] = cell; } }

    // 2. 指定された初期配置
    const initialPlacements = [ /* ... 配置データ ... */ { row: 0, col: 0, type: 'pumpkin' }, { row: 0, col: 1, type: 'butter' }, { row: 0, col: 3, type: 'egg' }, { row: 0, col: 4, type: 'carrot' }, { row: 0, col: 5, type: 'milk' }, { row: 0, col: 6, type: 'carrot' },{ row: 1, col: 0, type: 'cabbage' }, { row: 1, col: 1, type: 'cucumber' }, { row: 1, col: 2, type: 'curry_roux' }, { row: 1, col: 3, type: 'tuna' }, { row: 1, col: 4, type: 'pepper' }, { row: 1, col: 5, type: 'tomato' },{ row: 2, col: 0, type: 'pepper' }, { row: 2, col: 1, type: 'potato' }, { row: 2, col: 2, type: 'meat' }, { row: 2, col: 3, type: 'potato' }, { row: 2, col: 4, type: 'cucumber' }, { row: 2, col: 5, type: 'pumpkin' },{ row: 3, col: 0, type: 'curry_roux' }, { row: 3, col: 1, type: 'curry_roux' }, { row: 3, col: 2, type: 'onion' }, { row: 3, col: 3, type: 'meat' }, { row: 3, col: 4, type: 'onion' }, { row: 3, col: 5, type: 'egg' }, { row: 3, col: 6, type: 'milk' },{ row: 4, col: 0, type: 'egg' }, { row: 4, col: 1, type: 'pepper' }, { row: 4, col: 2, type: 'tuna' }, { row: 4, col: 3, type: 'cabbage' }, { row: 4, col: 4, type: 'cabbage' }, { row: 4, col: 5, type: 'onion' }, { row: 4, col: 6, type: 'tuna' },{ row: 5, col: 0, type: 'cucumber' }, { row: 5, col: 1, type: 'tomato' }, { row: 5, col: 2, type: 'milk' }, { row: 5, col: 3, type: 'butter' }, { row: 5, col: 4, type: 'butter' }, { row: 5, col: 5, type: 'potato' },{ row: 6, col: 0, type: 'tomato' }, { row: 6, col: 1, type: 'pumpkin' }, { row: 6, col: 5, type: 'meat' },{ row: 6, col: 6, type: 'carrot' }];
    initialPlacements.forEach(placement => { const r = placement.row; const c = placement.col; const tileType = placement.type; if (r >= 0 && r < gridRows && c >= 0 && c < gridCols && itemTypes.includes(tileType)) { const targetCell = gridCells[r][c]; if (targetCell.children.length === 0) { const tileElement = createTileElement(tileType); if (tileElement) { targetCell.appendChild(tileElement); } } else { console.warn(`セル (${r}, ${c}) 占有済み。 ${tileType} スキップ。`); } } else { console.warn(`無効な配置情報: `, placement); } });

    // 3. 選択可能状態更新関数
    function updateSelectableStatus() { for (let r = 0; r < gridRows; r++) { for (let c = 0; c < gridCols; c++) { const cell = gridCells[r][c]; if (cell.children.length > 0) { const tileElement = cell.children[0]; const isTopEmpty = (r === 0) || gridCells[r - 1][c].children.length === 0; const isBottomEmpty = (r === gridRows - 1) || gridCells[r + 1][c].children.length === 0; const isLeftEmpty = (c === 0) || gridCells[r][c - 1].children.length === 0; const isRightEmpty = (c === gridCols - 1) || gridCells[r][c + 1].children.length === 0; if (isTopEmpty || isBottomEmpty || isLeftEmpty || isRightEmpty) { tileElement.classList.add('selectable'); } else { tileElement.classList.remove('selectable'); } } } } }
    updateSelectableStatus(); // 初期状態設定

    // 4. メッセージ表示関数
    function displayMessage(text, type = 'error', duration = 2500) { if (!messageArea) return; if (messageTimeoutId) { clearTimeout(messageTimeoutId); } messageArea.textContent = text; messageArea.className = 'game-message'; messageArea.classList.add(type); messageArea.classList.add('show'); if (duration > 0) { messageTimeoutId = setTimeout(() => { messageArea.classList.remove('show'); }, duration); } }

    // 5. 場のクリックイベント処理
    field.addEventListener('click', handleFieldClick);
    function handleFieldClick(event) { const clickedElement = event.target; if (clickedElement.classList.contains('tile') && clickedElement.classList.contains('selectable')) { const tileType = clickedElement.dataset.tileType; if (handTilesData.length >= maxHandSize) { displayMessage(`手詰まり。下の枠は${maxHandSize}個までです。`, 'error'); return; } addTileToHand(tileType); clickedElement.remove(); updateSelectableStatus(); } }

    // 6. 手牌に追加、3枚チェック、ソート、再描画
    function addTileToHand(tileType) { handTilesData.push(tileType); const count = handTilesData.filter(type => type === tileType).length; let tripleRemoved = false; if (count === 3){ const itemInfo = itemData.find(v => v.type === tileType) || { name: tileType, file: 'unknown.png' }; console.log(`揃った！ ${itemInfo.name} を3個消します。スコア+10`); removedTripleTypes.push(tileType); redrawRemovedTriplesDisplay(); checkRecipes(); let removedCount = 0; handTilesData = handTilesData.filter(type => { if (type === tileType && removedCount < 3) { removedCount++; return false; } return true; }); tripleRemoved = true; score += 10; updateScoreDisplay(); } handTilesData.sort(); redrawHandDOM(); checkHandLimit(); if (tripleRemoved){ hand.style.transition = 'none'; hand.style.backgroundColor = '#ccffcc'; setTimeout(() => { hand.style.transition = 'background-color 0.3s ease'; hand.style.backgroundColor = '#d0e0d0'; }, 100); } }

    // 7. 「消した材料」エリアのDOM再描画関数
    function redrawRemovedTriplesDisplay() { if (!removedTriplesDisplay) return; removedTriplesDisplay.innerHTML = ''; removedTripleTypes.forEach(type => { const itemInfo = itemData.find(v => v.type === type); if (itemInfo) { const img = document.createElement('img'); img.src = itemInfo.file; img.alt = `消去: ${itemInfo.name}`; removedTriplesDisplay.appendChild(img); } }); }

    // 8. 手牌DOM再描画関数
    function redrawHandDOM() { hand.innerHTML = ''; handTilesData.forEach(type => { const itemInfo = itemData.find(v => v.type === type); if (!itemInfo) { console.error(`手牌に不明な種類: ${type}`); return; } const newHandTile = document.createElement('img'); newHandTile.src = itemInfo.file; newHandTile.alt = itemInfo.name; newHandTile.classList.add('tile'); newHandTile.dataset.tileType = type; hand.appendChild(newHandTile); }); }

    // 9. 手牌上限クラス更新関数
    function checkHandLimit() { if (hand.children.length >= maxHandSize) { hand.classList.add('full'); } else { hand.classList.remove('full'); } }

    // 10. アイテム要素を作成
    function createTileElement(tileType) { const itemInfo = itemData.find(v => v.type === tileType); if (!itemInfo) { console.error(`不明な種類で要素生成失敗: ${tileType}`); return null; } const tileImage = document.createElement('img'); tileImage.src = itemInfo.file; tileImage.alt = itemInfo.name; tileImage.classList.add('tile'); tileImage.dataset.tileType = tileType; tileImage.dataset.tileId = `tile-${tileIdCounter++}`; return tileImage; }

    // 11. ランダムな種類取得
    function getRandomItemType() { const randomIndex = Math.floor(Math.random() * itemTypes.length); return itemTypes[randomIndex]; }

    // 12. レシピチェック関数
    function checkRecipes() { recipes.forEach(recipe => { if (!completedRecipeNames.includes(recipe.name)) { const hasAllIngredients = recipe.ingredients.every(ingredient => removedTripleTypes.includes(ingredient)); if (hasAllIngredients) { console.log(`レシピ完成: ${recipe.name}`); completedRecipeNames.push(recipe.name); displayCompletedRecipe(recipe); } } }); }

    // 13. 完成品表示関数
    function displayCompletedRecipe(recipe) {
         if (!completedRecipesDisplay) return;
         const recipeDiv = document.createElement('div'); recipeDiv.classList.add('completed-recipe-item');
         const imageAreaDiv = document.createElement('div'); imageAreaDiv.classList.add('recipe-image-area');
         const resultImg = document.createElement('img'); resultImg.src = recipe.resultImage; resultImg.alt = recipe.name; resultImg.classList.add('result-image');
         imageAreaDiv.appendChild(resultImg);
         const ingredientsDiv = document.createElement('div'); ingredientsDiv.classList.add('ingredient-images');
         recipe.ingredients.forEach(ingredientType => {
             const itemInfo = itemData.find(item => item.type === ingredientType);
             if (itemInfo) { const ingredientImg = document.createElement('img'); ingredientImg.src = itemInfo.file; ingredientImg.alt = itemInfo.name; ingredientImg.title = itemInfo.name; ingredientImg.classList.add('ingredient-icon'); ingredientsDiv.appendChild(ingredientImg); }
         });
         imageAreaDiv.appendChild(ingredientsDiv);
         recipeDiv.appendChild(imageAreaDiv);
         const p = document.createElement('p'); p.textContent = recipe.resultText; recipeDiv.appendChild(p);
         completedRecipesDisplay.appendChild(recipeDiv);
    }

});
// === JavaScript ここまで ===