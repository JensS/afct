import { gsap } from 'gsap';

export default function initSectionHeadlines() {
    const headlines = gsap.utils.toArray('.section-headline');
    if (!headlines.length) {
        return;
    }

    const revealedHeadlines = new WeakSet();
    const motion = gsap.matchMedia();

    // GSAP restores the original styles if the visitor enables reduced motion.
    // The text stays visible when JavaScript or motion effects are unavailable.
    motion.add('(prefers-reduced-motion: no-preference)', () => {
        headlines.forEach(headline => {
            if (revealedHeadlines.has(headline) || headline.getBoundingClientRect().bottom <= 0) {
                return;
            }

            const lines = headline.querySelectorAll('.hl-a, .hl-b');
            if (!lines.length) {
                return;
            }

            gsap.from(lines, {
                yPercent: index => index === 0 ? 45 : 70,
                opacity: 0,
                duration: 1.1,
                stagger: 0.12,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: headline,
                    start: 'top 88%',
                    once: true,
                },
                onComplete() {
                    revealedHeadlines.add(headline);
                    gsap.set(lines, { clearProps: 'transform,opacity' });
                },
            });
        });
    });
}
