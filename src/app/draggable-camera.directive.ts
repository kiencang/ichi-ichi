import { Directive, HostListener, input, output } from '@angular/core';
import { APP_CONFIG } from './constants';

@Directive({
  selector: '[appDraggableCamera]',
  standalone: true
})
export class DraggableCameraDirective {
  cameraSize = input.required<number>();
  cameraPos = input.required<{ x: number; y: number }>();
  isRecording = input.required<boolean>();
  isCountingDown = input.required<boolean>();
  
  cachedWindowWidth = input.required<number>();
  cachedWindowHeight = input.required<number>();
  
  positionChange = output<{ x: number; y: number }>();
  draggingStateChange = output<boolean>();

  private isDragging = false;
  private dragStart = { x: 0, y: 0 };
  private dragInitialPos = { x: 0, y: 0 };

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (this.isRecording() || this.isCountingDown()) return;
    this.isDragging = true;
    this.draggingStateChange.emit(true);
    this.dragStart = { x: event.clientX, y: event.clientY };
    this.dragInitialPos = { ...this.cameraPos() };
    event.preventDefault();
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    const dx = event.clientX - this.dragStart.x;
    const dy = event.clientY - this.dragStart.y;
    this.positionChange.emit({ 
      x: this.dragInitialPos.x + dx, 
      y: this.dragInitialPos.y + dy 
    });
  }

  @HostListener('window:mouseup')
  onMouseUp() {
    if (this.isDragging) {
      this.isDragging = false;
      this.draggingStateChange.emit(false);
      this.snapCameraToCorner();
    }
  }

  private snapCameraToCorner() {
    const snapThreshold = APP_CONFIG.CONSTRAINTS.CAMERA_SNAP_THRESHOLD;
    const padding = APP_CONFIG.CONSTRAINTS.CAMERA_EDGE_PADDING;
    const camSize = this.cameraSize();
    const currentX = this.cameraPos().x;
    const currentY = this.cameraPos().y;

    const minX = padding;
    const maxX = this.cachedWindowWidth() - camSize - padding;
    const minY = padding;
    const maxY = this.cachedWindowHeight() - camSize - padding;

    let targetX = currentX;
    let targetY = currentY;

    // Ensure camera is within bounds first
    if (targetX < minX) targetX = minX;
    if (targetX > maxX) targetX = maxX;
    if (targetY < minY) targetY = minY;
    if (targetY > maxY) targetY = maxY;

    const corners = [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: minX, y: maxY },
      { x: maxX, y: maxY }
    ];

    let closestCorner = null;
    let minDistance = Infinity;

    for (const corner of corners) {
      const dx = targetX - corner.x;
      const dy = targetY - corner.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestCorner = corner;
      }
    }

    if (closestCorner && minDistance <= snapThreshold) {
      targetX = closestCorner.x;
      targetY = closestCorner.y;
    }

    this.positionChange.emit({ x: targetX, y: targetY });
  }
}
