export interface CameraOverlayConfig {
  isCameraEnabled: boolean;
  cameraPos: { x: number; y: number };
  cameraSize: number;
  windowWidth: number;
  windowHeight: number;
}

export class CanvasMixer {
  /**
   * Draws the screen sharing frames and composites the webcam feeds onto the target canvas ctx.
   */
  static drawFrame(
    canvasCtx: CanvasRenderingContext2D,
    canvasEle: HTMLCanvasElement,
    displayVideo: HTMLVideoElement,
    camVideoEl: HTMLVideoElement | null,
    config: CameraOverlayConfig
  ) {
    try {
      // 1. Render the main display background
      canvasCtx.drawImage(displayVideo, 0, 0, canvasEle.width, canvasEle.height);

      // 2. Overlay camera circle if enabled and ready
      if (config.isCameraEnabled && camVideoEl && camVideoEl.readyState >= 2) {
        const windowW = config.windowWidth || 1920;
        const windowH = config.windowHeight || 1080;

        const scaleX = canvasEle.width / windowW;
        const scaleY = canvasEle.height / windowH;
        
        // Để camera tỉ lệ thuận với màn hình mà không bị méo hoặc quá to
        const scale = Math.min(scaleX, scaleY);
        const targetSize = config.cameraSize * scale;
        const camRadius = targetSize / 2;

        const leftPadding = config.cameraPos.x;
        const rightPadding = windowW - (config.cameraPos.x + config.cameraSize);
        const topPadding = config.cameraPos.y;
        const bottomPadding = windowH - (config.cameraPos.y + config.cameraSize);

        let x = 0;
        let y = 0;

        // Bám theo lề gần nhất để đảm bảo lề hiển thị trên canvas giống hệt trên trình duyệt
        if (leftPadding < rightPadding) {
            x = leftPadding * scale;
        } else {
            x = canvasEle.width - (rightPadding * scale) - targetSize;
        }

        if (topPadding < bottomPadding) {
            y = topPadding * scale;
        } else {
            y = canvasEle.height - (bottomPadding * scale) - targetSize;
        }

        // Clamp một lần nữa để chắc chắn camera không bị văng ra khỏi map khi scale có sai số
        x = Math.max(0, Math.min(x, canvasEle.width - targetSize));
        y = Math.max(0, Math.min(y, canvasEle.height - targetSize));

        canvasCtx.save();
        canvasCtx.beginPath();
        canvasCtx.arc(x + camRadius, y + camRadius, camRadius, 0, Math.PI * 2);
        canvasCtx.closePath();
        canvasCtx.clip();

        const vW = camVideoEl.videoWidth;
        const vH = camVideoEl.videoHeight;
        const aspect = vW / vH;
        let sW = vW;
        let sH = vH;

        if (aspect > 1) {
          sW = vH; // crop horizontal sides
        } else {
          sH = vW; // crop vertical sides
        }

        // Mirror camera preview
        canvasCtx.translate(x + targetSize / 2, y + targetSize / 2);
        canvasCtx.scale(-1, 1);
        canvasCtx.translate(-(x + targetSize / 2), -(y + targetSize / 2));

        canvasCtx.drawImage(
          camVideoEl,
          (vW - sW) / 2,
          (vH - sH) / 2,
          sW,
          sH,
          x,
          y,
          targetSize,
          targetSize
        );

        canvasCtx.restore();

        // Stroke rounded circle boundary
        canvasCtx.save();
        canvasCtx.beginPath();
        canvasCtx.arc(x + camRadius, y + camRadius, camRadius, 0, Math.PI * 2);
        canvasCtx.lineWidth = 2 * scale;
        canvasCtx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
        canvasCtx.stroke();
        canvasCtx.restore();
      }
    } catch {
      // Guard silently during stream transitions
    }
  }
}
