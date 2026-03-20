# Taiwan Urban Code Tracker (ncp)

一個基於 Node.js 的命令行工具，用於查詢台灣都市計畫相關法規。

## 安裝

1. 確保已安裝 Node.js。
2. 在專案目錄下執行：
   ```bash
   npm install
   ```
3. (選用) 連結命令：
   ```bash
   npm link
   ```

## 使用方法

### 1. 更新法規資料
第一次使用前，請先執行更新命令以下載最新的法規 JSON 資料：
```bash
node bin/ncp.js update
# 或者如果已經執行過 npm link
ncp update
```

### 2. 查詢法規
使用關鍵字查詢相關條文：
```bash
node bin/ncp.js search "住宅區"
# 或者
ncp search "容積率"
```

可以使用 `--limit` 參數限制顯示結果數量：
```bash
ncp search "都市更新" --limit 10
```

### 3. 列出收錄法規
查看目前工具支援的法規列表：
```bash
ncp list
```

## 收錄法規範圍
- 都市計畫法
- 都市計畫法各直轄市/省施行細則
- 都市更新條例及其施行細則
- 區域計畫法及其施行細則
- 國土計畫法及其施行細則

## 注意事項
- 本工具資料來源為 [g0v/mojLawSplitJSON](https://github.com/kong0107/mojLawSplitJSON)，原始資料來自全國法規資料庫。
- 在 Windows 環境下，若出現亂碼，請在執行前輸入 `chcp 65001` 切換編碼至 UTF-8。
