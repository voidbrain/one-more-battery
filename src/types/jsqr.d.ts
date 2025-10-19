// src/types/jsqr.d.ts
declare module 'jsqr' {
  interface Point { x: number; y: number; }
  interface QRCodeLocation { topLeftCorner: Point; topRightCorner: Point; bottomLeftCorner: Point; bottomRightCorner: Point; }
  interface QRCode { data: string; location: QRCodeLocation; }

  const jsQR: (data: Uint8ClampedArray, width: number, height: number) => QRCode | null;
  export default jsQR;
}
