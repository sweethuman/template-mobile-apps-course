export interface ItemProperties {
  id: string;
  number: string;
  status: "taken" | "free";
  takenBy: string;
}
