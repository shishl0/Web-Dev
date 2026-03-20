import { Directive, ElementRef, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appMotionHover]',
  standalone: true,
})
export class MotionHoverDirective {
  private readonly isBrowser: boolean;
  private currentAnimation: Animation | null = null;

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (!this.isBrowser) {
      return;
    }

    this.playAnimation([
      {
        transform: 'translateY(0px) scale(1)',
        boxShadow: '0 0 0 rgba(0,0,0,0)',
      },
      {
        transform: 'translateY(-5px) scale(1.01)',
        boxShadow: '0 22px 50px rgba(35, 10, 10, 0.45), 0 0 35px rgba(248, 113, 113, 0.2)',
      },
    ]);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (!this.isBrowser) {
      return;
    }

    this.playAnimation([
      {
        transform: 'translateY(-5px) scale(1.01)',
        boxShadow: '0 22px 50px rgba(35, 10, 10, 0.45), 0 0 35px rgba(248, 113, 113, 0.2)',
      },
      {
        transform: 'translateY(0px) scale(1)',
        boxShadow: '0 0 0 rgba(0,0,0,0)',
      },
    ]);
  }

  private playAnimation(keyframes: Keyframe[]): void {
    this.currentAnimation?.cancel();
    this.currentAnimation = this.elementRef.nativeElement.animate(keyframes, {
      duration: 250,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards',
    });
  }
}
