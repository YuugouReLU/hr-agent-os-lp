/**
 * HR-Agent-OS LP トラッキング用 Google Apps Script
 *
 * === セットアップ手順 ===
 *
 * 1. Google Sheets で新しいスプレッドシートを作成
 *
 * 2. シートを2つ用意:
 *    - シート名「アクセスログ」: ヘッダー行に以下を入力
 *      A1: tid | B1: 会社名 | C1: バリアント | D1: アクセス日時 | E1: URL | F1: リファラー | G1: UA
 *
 *    - シート名「会社マスター」: ヘッダー行に以下を入力
 *      A1: tid | B1: 会社名 | C1: メモ
 *      （例: A2: acme_001 | B2: 株式会社ACME | C2: 2月送付分）
 *
 * 3. 拡張機能 > Apps Script を開く
 *
 * 4. 以下のコードを貼り付けて保存
 *
 * 5. デプロイ > 新しいデプロイ > ウェブアプリ
 *    - 次のユーザーとして実行: 自分
 *    - アクセスできるユーザー: 全員
 *    → デプロイURLをコピー
 *
 * 6. main.html の GAS_ENDPOINT にデプロイURLを貼り付け
 *
 * === ここからGASコード（Apps Scriptに貼り付け） ===
 */

// --- ここから下をApps Scriptにコピー ---

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 会社マスターからtidに対応する会社名を取得
    var masterSheet = ss.getSheetByName('会社マスター');
    var companyName = '';
    if (masterSheet) {
      var masterData = masterSheet.getDataRange().getValues();
      for (var i = 1; i < masterData.length; i++) {
        if (masterData[i][0] === data.tid) {
          companyName = masterData[i][1];
          break;
        }
      }
    }

    // アクセスログに記録
    var logSheet = ss.getSheetByName('アクセスログ');
    logSheet.appendRow([
      data.tid,
      companyName,
      data.variant || '',
      data.timestamp,
      data.url || '',
      data.referrer || '',
      data.ua || ''
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'ok' })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// テスト用: GETでもアクセス確認できるようにする
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: 'ok', message: 'Tracking endpoint is active' })
  ).setMimeType(ContentService.MimeType.JSON);
}
