import type { PhotoImage } from "@/lib/photos";

export type WallLayout = "bleed" | "pair" | "triple" | "inset";
export type WallSize = "large";

export type WallGroupConfig = {
  layout: WallLayout;
  files: string[];
  size?: WallSize;
};

export type WallPlatePhoto = PhotoImage & {
  n: number;
  url: string;
};

export type WallPlate = {
  layout: WallLayout;
  size?: WallSize;
  photos: WallPlatePhoto[];
};
