// src/data/categories.ts

export type ItemCategory = {
  id: string;
  label: string;
  emoji: string;
  desc: string;
};

export type RoomCategory = {
  id: string;
  label: string;
  emoji: string;
};

export const itemCategories: ItemCategory[] = [
  { id: "all",    label: "すべて",           emoji: "✨", desc: "" },
  { id: "caster", label: "キャスター",       emoji: "🛞", desc: "移動式台・ワゴン・スキマ収納" },
  { id: "magnet", label: "マグネット",       emoji: "🧲", desc: "壁面収納・冷蔵庫活用・フック" },
  { id: "hook",   label: "フック・突っ張り棒", emoji: "🪝", desc: "賃貸OKな壁収納・S字フック活用" },
  { id: "wire",   label: "ワイヤーネット",   emoji: "🔩", desc: "吊り下げ・ラック・デスク整理" },
  { id: "iron",   label: "アイアンバー",     emoji: "🔧", desc: "棚受け・ヴィンテージ風DIY" },
  { id: "wood",   label: "板材・すのこ",     emoji: "🪵", desc: "棚・テーブル・ベッドサイド" },
  { id: "paint",  label: "塗料・ニス",       emoji: "🎨", desc: "高見え仕上げ・リメイク" },
];

export const roomCategories: RoomCategory[] = [
  { id: "all",      label: "すべて",     emoji: "🏠" },
  { id: "kitchen",  label: "キッチン",   emoji: "🍳" },
  { id: "storage",  label: "収納",       emoji: "📦" },
  { id: "living",   label: "リビング",   emoji: "🛋️" },
  { id: "bedroom",  label: "寝室",       emoji: "🛏️" },
  { id: "washroom", label: "洗面所",     emoji: "🚿" },
  { id: "entrance", label: "玄関",       emoji: "👟" },
  { id: "desk",     label: "デスク周り", emoji: "💻" },
];
