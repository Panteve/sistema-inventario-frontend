import { Injectable, Inject, PLATFORM_ID, DestroyRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ScrollRevealService {
  #io: IntersectionObserver | null = null;
  #staggerIo: IntersectionObserver | null = null;
  #cio: IntersectionObserver | null = null;
  #mo: MutationObserver | null = null;
  #moRaf: number | null = null;
  #rm = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    destroyRef: DestroyRef,
  ) {
    destroyRef.onDestroy(() => this.#cleanup());
  }

  init(root: HTMLElement = document.body) {
    if (!isPlatformBrowser(this.platformId)) return;

    this.#rm = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

    if (!('IntersectionObserver' in window)) {
      root.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
      root.querySelectorAll('.reveal-stagger').forEach((el) => el.classList.add('is-visible'));
      return;
    }

    this.#io = this.#createRevealObserver();
    this.#observeAll(root, '[data-reveal]', this.#io);

    this.#staggerIo = this.#createRevealObserver();
    this.#observeAll(root, '.reveal-stagger', this.#staggerIo);

    if (!this.#rm) {
      this.#initCounters(root);
    } else {
      root.querySelectorAll('[data-count]').forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.textContent =
          (htmlEl.dataset['countPrefix'] || '') +
          htmlEl.dataset['count'] +
          (htmlEl.dataset['countSuffix'] || '');
      });
    }

    this.#mo = new MutationObserver(() => this.#scheduleMutationHandler());
    this.#mo.observe(root, { childList: true, subtree: true });
  }

  #createRevealObserver(): IntersectionObserver {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('is-visible');
          obs.unobserve(e.target);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    );
    return obs;
  }

  #observeAll(root: HTMLElement, selector: string, observer: IntersectionObserver) {
    root.querySelectorAll(selector).forEach((el) => {
      if (this.#rm) { el.classList.add('is-visible'); return; }
      observer.observe(el);
    });
  }

  #initCounters(root: HTMLElement) {
    this.#cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          const to = parseInt(el.dataset['count']!, 10);
          const pre = el.dataset['countPrefix'] || '';
          const suf = el.dataset['countSuffix'] || '';
          const dur = parseInt(el.dataset['countDur']!, 10) || 1400;
          this.#cio!.unobserve(el);
          let start = 0;
          const step = 16;
          const steps = dur / step;
          const increment = Math.max(1, Math.ceil(to / steps));
          const t = setInterval(() => {
            start += increment;
            if (start >= to) {
              el.textContent = pre + to + suf;
              clearInterval(t);
              return;
            }
            el.textContent = pre + start + suf;
          }, step);
        });
      },
      { threshold: 0.3 },
    );

    root.querySelectorAll('[data-count]').forEach((el) => this.#cio!.observe(el));
  }

  #scheduleMutationHandler() {
    if (this.#moRaf !== null) return;
    this.#moRaf = requestAnimationFrame(() => {
      this.#moRaf = null;
      this.#onMutation();
    });
  }

  #onMutation() {
    if (!this.#io || !this.#staggerIo) return;

    document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((el) => {
      if (this.#rm) { el.classList.add('is-visible'); return; }
      this.#io!.observe(el);
    });
    document.querySelectorAll('.reveal-stagger:not(.is-visible)').forEach((el) => {
      if (this.#rm) { el.classList.add('is-visible'); return; }
      this.#staggerIo!.observe(el);
    });
  }

  #cleanup() {
    if (this.#moRaf !== null) cancelAnimationFrame(this.#moRaf);
    this.#io?.disconnect();
    this.#staggerIo?.disconnect();
    this.#cio?.disconnect();
    this.#mo?.disconnect();
  }
}
