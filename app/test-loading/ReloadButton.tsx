"use client";

import { Button } from "@mantine/core";

export function ReloadButton() {
  return (
    <Button 
      onClick={() => window.location.reload()} 
      variant="filled"
    >
      ローディングテスト開始（ページリロード）
    </Button>
  );
}