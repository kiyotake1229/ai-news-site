#!/bin/bash
# auto-push.sh — src/ の変更を監視して自動的に git commit & push する

cd "$(dirname "$0")/.." || exit 1  # プロジェクトルートに移動

WATCH_DIR="src"
POLL_INTERVAL=3      # 監視間隔（秒）
DEBOUNCE_SECS=10     # 最後の変更からコミットまでの待ち時間（秒）
BRANCH="main"

LAST_CHECK_FILE="/tmp/auto-push-last-check-$$"
touch "$LAST_CHECK_FILE"

cleanup() {
  rm -f "$LAST_CHECK_FILE"
  echo ""
  echo "👋 監視を停止しました"
}
trap cleanup EXIT INT TERM

echo "👀 監視開始: $WATCH_DIR/"
echo "   変更検出から ${DEBOUNCE_SECS}秒後に自動push (${POLL_INTERVAL}秒ごとにポーリング)"
echo "   停止: Ctrl+C"
echo ""

last_change=0
committed_at=0

while true; do
  # src/ 内で last_check より新しいファイルを探す
  changed=$(find "$WATCH_DIR" -newer "$LAST_CHECK_FILE" -type f 2>/dev/null)
  touch "$LAST_CHECK_FILE"

  if [ -n "$changed" ]; then
    last_change=$(date +%s)
    printf "."
  fi

  # デバウンス: 最後の変更から DEBOUNCE_SECS 秒経過していたらコミット
  if [ "$last_change" -gt 0 ] && [ "$last_change" -gt "$committed_at" ]; then
    now=$(date +%s)
    elapsed=$((now - last_change))

    if [ "$elapsed" -ge "$DEBOUNCE_SECS" ]; then
      if [ -n "$(git status --porcelain)" ]; then
        echo ""
        echo "📝 $(date '+%H:%M:%S') 変更を検出 → commit & push..."
        git add -A
        git commit -m "auto: $(date '+%Y-%m-%d %H:%M:%S')"
        if git push origin "$BRANCH"; then
          echo "✅ push完了"
        else
          echo "❌ push失敗（次の変更時に再試行します）"
        fi
        committed_at=$(date +%s)
      else
        # git status に差分なし（すでにコミット済み等）
        last_change=0
      fi
    fi
  fi

  sleep "$POLL_INTERVAL"
done
