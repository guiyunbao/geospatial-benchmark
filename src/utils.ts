export const delay = (seconds: number) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

export function randomLng() {
  return Math.random() * 360 - 180;
}

export function randomLat() {
  return Math.random() * 180 - 90;
}

export type Longitude = number;
export type Latitude = number;
