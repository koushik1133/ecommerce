export type StudioBackground = {
  id: string;
  label: string;
  value: string;
  kind: "solid" | "gradient" | "image";
};

export const STUDIO_BACKGROUNDS: StudioBackground[] = [
  {
    id: "studio",
    label: "Studio",
    kind: "gradient",
    value:
      "radial-gradient(ellipse at 50% 30%, #ffffff 0%, #ececea 55%, #e2e2df 100%)",
  },
  {
    id: "chalk",
    label: "Chalk",
    kind: "solid",
    value: "#fafaf9",
  },
  {
    id: "slate",
    label: "Slate",
    kind: "gradient",
    value:
      "radial-gradient(ellipse at 50% 40%, #3a3a3a 0%, #1a1a1a 70%, #0f0f0f 100%)",
  },
  {
    id: "mint",
    label: "Mint",
    kind: "gradient",
    value:
      "radial-gradient(ellipse at 50% 35%, #e8f5f1 0%, #d5ebe4 50%, #c5ddd4 100%)",
  },
];
