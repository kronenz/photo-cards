<script lang="ts">
  export let image: string = "https://picsum.photos/400/560?random=1";
  export let title: string = "손흥민";
  export let subtitle: string = "외야수";
  export let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'legendary';
  export let team: string = "lg";
  export let number: string = "7";
  export let effectType: string = ''; // 빈 문자열이면 rarity 기반, 있으면 effectType 우선
</script>

<div class="card__front" data-rarity={rarity} data-effect={effectType || rarity}>
  <!-- Base Image -->
  <div class="card__image" style="background-image: url({image})"></div>

  <!-- Holographic Shine Layer (from how2code_v2.md) -->
  <div class="card__shine"></div>

  <!-- Sparkle/Glitter Layer -->
  <div class="card__glare"></div>

  <!-- Content Overlay -->
  <div class="card__content">
    <div class="card__header">
      <span class="card__team">{team.toUpperCase()}</span>
      <span class="card__number">#{number}</span>
    </div>

    <div class="card__footer">
      <h3 class="card__title">{title}</h3>
      <p class="card__subtitle">{subtitle}</p>
      <div class="card__rarity" data-rarity={rarity}>
        {#if rarity === 'legendary'}★★★★★{/if}
        {#if rarity === 'epic'}★★★★{/if}
        {#if rarity === 'rare'}★★★{/if}
        {#if rarity === 'common'}★★{/if}
      </div>
    </div>
  </div>
</div>

<style>
  .card__front {
    position: relative;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    transform-style: preserve-3d;
  }

  /* Base Image Layer */
  .card__image {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    z-index: 1;
  }

  /*
    Holographic Shine Layer
    Based on how2code_v2.md Pokemon card effects
  */
  .card__shine {
    position: absolute;
    inset: 0;
    z-index: 2;
    opacity: 0;
    mix-blend-mode: color-dodge;
    background-size: 200% 200%;
    background-position: var(--posx, 50%) var(--posy, 50%);
    transition: opacity 0.3s ease;
    pointer-events: none;
    filter: brightness(1.1) contrast(1.05);
  }

  /* ============================================
     HOLOGRAPHIC EFFECTS (20+ types from how2code_v2.md)
     ============================================ */

  /* 1. BASIC - 기본 */
  .card__front[data-effect="basic"] .card__shine {
    background-image:
      radial-gradient(
        farthest-corner circle at var(--posx, 50%) var(--posy, 50%),
        rgba(255, 255, 255, 0.3) 0%,
        rgba(255, 255, 255, 0.1) 30%,
        transparent 60%
      );
    filter: brightness(1.1) contrast(1.1) saturate(1.0);
    mix-blend-mode: overlay;
  }

  /* 2. HOLO - 홀로그래픽 (Rare Holo) */
  .card__front[data-effect="holo"] .card__shine {
    --space: 2px;
    --h: 21;
    --s: 70%;
    --l: 50%;
    --bars: 24px;

    background-image:
      repeating-linear-gradient(
        90deg,
        hsl(calc(var(--h) * 0), var(--s), var(--l)) calc(var(--space) * 0),
        hsl(calc(var(--h) * 0), var(--s), var(--l)) calc(var(--space) * 1),
        black calc(var(--space) * 1.001),
        black calc(var(--space) * 1.999),
        hsl(calc(var(--h) * 1), var(--s), var(--l)) calc(var(--space) * 2),
        hsl(calc(var(--h) * 1), var(--s), var(--l)) calc(var(--space) * 3)
      ),
      repeating-linear-gradient(90deg, #c929f1, #0dbde9, #21e985, #eedf10, #f80e7b, #c929f1),
      radial-gradient(
        farthest-corner circle at var(--posx, 50%) var(--posy, 50%),
        rgba(230, 230, 230, 0.85) 0%,
        rgba(200, 200, 200, 0.1) 25%,
        rgb(0, 0, 0) 90%
      );
    background-blend-mode: soft-light, soft-light, overlay;
    background-size: 100% 100%, 200% 200%, 120% 120%;
    filter: brightness(0.7) contrast(3.2) saturate(0.66);
  }

  /* 3. REVERSE-HOLO - 리버스 홀로 */
  .card__front[data-effect="reverse-holo"] .card__shine {
    background-image:
      repeating-linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.1) 0%,
        rgba(0, 240, 255, 0.3) 10%,
        rgba(168, 85, 247, 0.3) 20%,
        rgba(255, 255, 255, 0.1) 30%
      );
    background-size: 200% 200%;
    filter: brightness(0.8) contrast(1.5) saturate(1.0);
    mix-blend-mode: screen;
  }

  /* 4. GALAXY-HOLO - 갤럭시 홀로 */
  .card__front[data-effect="galaxy-holo"] .card__shine,
  .card__front[data-effect="galaxy"] .card__shine {
    --space: 80px;
    --galaxy: url("https://res.cloudinary.com/simey/image/upload/v1617298399/galaxy_holojz.png");

    background-image:
      var(--galaxy),
      repeating-linear-gradient(
        82deg,
        rgb(218, 56, 50) calc(var(--space) * 1),
        rgb(219, 204, 86) calc(var(--space) * 2),
        rgb(121, 199, 58) calc(var(--space) * 3),
        rgb(58, 192, 183) calc(var(--space) * 4),
        rgb(71, 98, 207) calc(var(--space) * 5),
        rgb(170, 69, 209) calc(var(--space) * 6),
        rgb(218, 56, 50) calc(var(--space) * 10)
      ),
      radial-gradient(
        farthest-corner circle at var(--posx, 50%) var(--posy, 50%),
        rgba(255, 255, 255, 0.6) 5%,
        rgba(150, 150, 150, 0.3) 40%,
        rgb(0, 0, 0) 100%
      );
    background-blend-mode: color-dodge, screen;
    background-size: cover, 600% 1200%, cover;
    background-position: center, 0% var(--posy, 50%), var(--posx, 50%) var(--posy, 50%);
    filter: brightness(0.75) contrast(1.2) saturate(1.5);
    mix-blend-mode: color-dodge;
  }

  /* 5. COSMOS-HOLO - 코스믹 */
  .card__front[data-effect="cosmos-holo"] .card__shine,
  .card__front[data-effect="cosmic"] .card__shine {
    background-image:
      repeating-linear-gradient(
        120deg,
        rgba(138, 43, 226, 0.5) 0%,
        rgba(0, 191, 255, 0.5) 20%,
        rgba(255, 20, 147, 0.5) 40%,
        rgba(138, 43, 226, 0.5) 60%
      ),
      radial-gradient(
        circle at var(--posx, 50%) var(--posy, 50%),
        rgba(255, 255, 255, 0.4) 0%,
        transparent 50%
      );
    background-size: 300% 300%, 100% 100%;
    filter: brightness(1.1) contrast(1.4) saturate(1.2);
    mix-blend-mode: screen;
  }

  /* 6. AURORA - 오로라 */
  .card__front[data-effect="aurora"] .card__shine {
    background-image:
      repeating-linear-gradient(
        180deg,
        rgba(0, 255, 127, 0.4) 0%,
        rgba(0, 191, 255, 0.4) 25%,
        rgba(138, 43, 226, 0.4) 50%,
        rgba(255, 20, 147, 0.4) 75%,
        rgba(0, 255, 127, 0.4) 100%
      );
    background-size: 100% 400%;
    background-position: 0% var(--posy, 50%);
    filter: brightness(1.0) contrast(1.1) saturate(1.1);
    mix-blend-mode: screen;
  }

  /* 7. NEON - 네온 */
  .card__front[data-effect="neon"] .card__shine {
    background-image:
      repeating-linear-gradient(
        280deg,
        rgba(255, 0, 255, 0.6) 0%,
        rgba(0, 255, 255, 0.6) 50%,
        rgba(255, 255, 0, 0.6) 100%
      ),
      radial-gradient(
        circle at var(--posx, 50%) var(--posy, 50%),
        rgba(255, 255, 255, 0.5) 0%,
        transparent 60%
      );
    background-size: 200% 200%, 100% 100%;
    filter: brightness(1.3) contrast(1.5) saturate(1.6);
    mix-blend-mode: screen;
  }

  /* 8. V-REGULAR - V 카드 (원본 코드 적용) */
  .card__front[data-effect="v-regular"] .card__shine {
    --space: 5%;
    --angle: 133deg;
    --imgsize: cover;

    background-image:
      repeating-linear-gradient(
        0deg,
        rgb(255, 119, 115) calc(var(--space) * 1),
        rgba(255, 237, 95, 1) calc(var(--space) * 2),
        rgba(168, 255, 95, 1) calc(var(--space) * 3),
        rgba(131, 255, 247, 1) calc(var(--space) * 4),
        rgba(120, 148, 255, 1) calc(var(--space) * 5),
        rgb(216, 117, 255) calc(var(--space) * 6),
        rgb(255, 119, 115) calc(var(--space) * 7)
      ),
      repeating-linear-gradient(
        var(--angle),
        #0e152e 0%,
        hsl(180, 10%, 60%) 3.8%,
        hsl(180, 29%, 66%) 4.5%,
        hsl(180, 10%, 60%) 5.2%,
        #0e152e 10%,
        #0e152e 12%
      ),
      radial-gradient(
        farthest-corner circle at var(--posx, 50%) var(--posy, 50%),
        rgba(0, 0, 0, 0.1) 12%,
        rgba(0, 0, 0, 0.15) 20%,
        rgba(0, 0, 0, 0.25) 120%
      );
    background-blend-mode: hue, hue, hue;
    background-size: 200% 700%, 300%, 200%;
    background-position: center, 0% var(--posy, 50%), var(--posx, 50%) var(--posy, 50%);
    filter: brightness(calc((var(--posy, 75) * 0.3) + 50%)) contrast(2.5) saturate(0.5);
  }

  /* 9. V-FULL-ART - V 풀아트 (원본 illusion2.webp 사용) */
  .card__front[data-effect="v-full-art"] .card__shine {
    --space: 5%;
    --angle: 133deg;
    --imgsize: cover;

    background-image:
      repeating-linear-gradient(
        0deg,
        rgb(255, 119, 115) calc(var(--space) * 1),
        rgba(255, 237, 95, 1) calc(var(--space) * 2),
        rgba(168, 255, 95, 1) calc(var(--space) * 3),
        rgba(131, 255, 247, 1) calc(var(--space) * 4),
        rgba(120, 148, 255, 1) calc(var(--space) * 5),
        rgb(216, 117, 255) calc(var(--space) * 6),
        rgb(255, 119, 115) calc(var(--space) * 7)
      ),
      repeating-linear-gradient(
        var(--angle),
        #0e152e 0%,
        hsl(180, 10%, 60%) 3.8%,
        hsl(180, 29%, 66%) 4.5%,
        hsl(180, 10%, 60%) 5.2%,
        #0e152e 10%,
        #0e152e 12%
      ),
      radial-gradient(
        farthest-corner circle at var(--posx, 50%) var(--posy, 50%),
        rgba(0, 0, 0, 0.1) 12%,
        rgba(0, 0, 0, 0.15) 20%,
        rgba(0, 0, 0, 0.25) 120%
      );
    background-blend-mode: hue, hue, hue;
    background-size: 200% 700%, 300%, 200%;
    background-position: center, 0% var(--posy, 50%), var(--posx, 50%) var(--posy, 50%);
    filter: brightness(calc((var(--posy, 75) * 0.3) + 50%)) contrast(2.5) saturate(0.5);
  }

  .card__front[data-effect="v-full-art"] .card__shine:after {
    content: "";
    position: absolute;
    inset: 0;
    background-image: url("https://res.cloudinary.com/simey/image/upload/v1617298623/illusion2.webp");
    background-size: cover;
    background-position: center;
    background-blend-mode: color-dodge;
    filter: brightness(0.5) contrast(1.15) saturate(1.1);
    mix-blend-mode: color-dodge;
    z-index: 1;
  }

  /* 10. VMAX (원본 코드 적용 + :after) */
  .card__front[data-effect="vmax"] .card__shine {
    --space: 6%;
    --angle: 133deg;
    --imgsize: cover;

    background-image:
      repeating-linear-gradient(
        -33deg,
        rgb(206, 42, 36) calc(var(--space) * 1),
        rgb(157, 170, 223) calc(var(--space) * 2),
        rgb(45, 153, 146) calc(var(--space) * 3),
        rgb(29, 151, 36) calc(var(--space) * 4),
        rgb(181, 64, 228) calc(var(--space) * 5),
        rgb(206, 42, 36) calc(var(--space) * 6)
      ),
      repeating-linear-gradient(
        var(--angle),
        rgba(14, 21, 46, 0.5) 0%,
        hsl(180, 10%, 50%) 2.5%,
        hsl(83, 50%, 35%) 5%,
        hsl(180, 10%, 50%) 7.5%,
        rgba(14, 21, 46, 0.5) 10%,
        rgba(14, 21, 46, 0.5) 15%
      );
    background-blend-mode: multiply, color-dodge;
    background-size: 1100% 1100%, 600% 600%;
    background-position: center, 0% var(--posy, 50%);
    filter: brightness(calc((var(--posy, 75) * 0.3) + 50%)) contrast(2.5) saturate(0.6);
  }

  .card__front[data-effect="vmax"] .card__shine:after {
    content: "";
    position: absolute;
    inset: 0;
    background-image: url("https://res.cloudinary.com/simey/image/upload/v1617298620/vmaxbg.webp");
    background-size: cover;
    background-position: center;
    background-blend-mode: color-dodge;
    filter: brightness(0.5) contrast(2.5) saturate(1.2);
    mix-blend-mode: color-dodge;
    z-index: 1;
  }

  /* 11. VSTAR (원본 ancient.webp 사용) */
  .card__front[data-effect="vstar"] .card__shine {
    --space: 5%;
    --angle: 133deg;
    --imgsize: cover;

    background-image:
      repeating-linear-gradient(
        0deg,
        rgb(255, 119, 115) calc(var(--space) * 1),
        rgba(255, 237, 95, 1) calc(var(--space) * 2),
        rgba(168, 255, 95, 1) calc(var(--space) * 3),
        rgba(131, 255, 247, 1) calc(var(--space) * 4),
        rgba(120, 148, 255, 1) calc(var(--space) * 5),
        rgb(216, 117, 255) calc(var(--space) * 6),
        rgb(255, 119, 115) calc(var(--space) * 7)
      ),
      repeating-linear-gradient(
        var(--angle),
        #0e152e 0%,
        hsl(180, 10%, 60%) 3.8%,
        hsl(180, 29%, 66%) 4.5%,
        hsl(180, 10%, 60%) 5.2%,
        #0e152e 10%,
        #0e152e 12%
      ),
      radial-gradient(
        farthest-corner circle at var(--posx, 50%) var(--posy, 50%),
        rgba(0, 0, 0, 0.1) 12%,
        rgba(0, 0, 0, 0.15) 20%,
        rgba(0, 0, 0, 0.25) 120%
      );
    background-blend-mode: hue, hue, hue;
    background-size: 200% 700%, 300%, 200%;
    background-position: center, 0% var(--posy, 50%), var(--posx, 50%) var(--posy, 50%);
    filter: brightness(calc((var(--posy, 75) * 0.3) + 50%)) contrast(2.5) saturate(0.5);
  }

  .card__front[data-effect="vstar"] .card__shine:after {
    content: "";
    position: absolute;
    inset: 0;
    background-image: url("https://res.cloudinary.com/simey/image/upload/v1671043689/ancient.webp");
    background-size: cover;
    background-position: center;
    background-blend-mode: color-dodge;
    filter: brightness(1) contrast(1) saturate(1.2);
    mix-blend-mode: color-dodge;
    z-index: 1;
  }

  /* 12. RAINBOW - 레인보우 (원본 rainbow2.jpg 사용) */
  .card__front[data-effect="rainbow"] .card__shine {
    --space: 5%;
    --angle: 133deg;
    --imgsize: cover;

    background-image:
      url("https://res.cloudinary.com/simey/image/upload/v1671043433/rainbow2.jpg"),
      repeating-linear-gradient(
        var(--angle),
        #0e152e 0%,
        hsl(180, 10%, 60%) 3.8%,
        hsl(180, 29%, 66%) 4.5%,
        hsl(180, 10%, 60%) 5.2%,
        #0e152e 10%,
        #0e152e 12%
      ),
      radial-gradient(
        farthest-corner circle at var(--posx, 50%) var(--posy, 50%),
        rgba(0, 0, 0, 0.1) 12%,
        rgba(0, 0, 0, 0.15) 20%,
        rgba(0, 0, 0, 0.25) 120%
      );
    background-blend-mode: hue, hue, hue;
    background-size: var(--imgsize), 300%, 200%;
    background-position: center, 0% var(--posy, 50%), var(--posx, 50%) var(--posy, 50%);
    filter: brightness(calc((var(--posy, 75) * 0.3) + 50%)) contrast(2.5) saturate(0.5);
    mix-blend-mode: color-dodge;
  }

  /* 13. RAINBOW-ALT - 레인보우 얼터네이트 */
  .card__front[data-effect="rainbow-alt"] .card__shine {
    --space: 7%;
    --angle: -20deg;

    background-image:
      repeating-linear-gradient(
        var(--angle),
        rgb(253, 71, 65) calc(var(--space) * 1),
        rgb(255, 243, 151) calc(var(--space) * 2),
        rgba(168, 255, 95, 1) calc(var(--space) * 3),
        rgba(131, 255, 247, 1) calc(var(--space) * 4),
        rgb(75, 198, 255) calc(var(--space) * 5),
        rgb(255, 73, 246) calc(var(--space) * 6),
        rgb(255, 56, 49) calc(var(--space) * 7)
      );
    background-size: 500% 500%;
    background-position: calc(var(--posx, 50%) * 1.5) calc(var(--posy, 50%) * 1.5);
    filter: brightness(0.66) contrast(3.0) saturate(0.7);
    mix-blend-mode: exclusion;
  }

  /* 14. SECRET / GOLD-SECRET - 골드 시크릿 (원본 rainbow2.jpg + metal.webp 사용) */
  .card__front[data-effect="secret"] .card__shine,
  .card__front[data-effect="gold-secret"] .card__shine {
    --space: 5%;
    --angle: 133deg;
    --imgsize: cover;

    background-image:
      url("https://res.cloudinary.com/simey/image/upload/v1671043433/rainbow2.jpg"),
      repeating-linear-gradient(
        var(--angle),
        #0e152e 0%,
        hsl(180, 10%, 60%) 3.8%,
        hsl(180, 29%, 66%) 4.5%,
        hsl(180, 10%, 60%) 5.2%,
        #0e152e 10%,
        #0e152e 12%
      ),
      radial-gradient(
        farthest-corner circle at var(--posx, 50%) var(--posy, 50%),
        rgba(0, 0, 0, 0.1) 12%,
        rgba(0, 0, 0, 0.15) 20%,
        rgba(0, 0, 0, 0.25) 120%
      );
    background-blend-mode: hue, hue, hue;
    background-size: var(--imgsize), 300%, 200%;
    background-position: center, 0% var(--posy, 50%), var(--posx, 50%) var(--posy, 50%);
    filter: brightness(calc((var(--posy, 75) * 0.3) + 50%)) contrast(2.5) saturate(0.5);
  }

  .card__front[data-effect="secret"] .card__shine:after,
  .card__front[data-effect="gold-secret"] .card__shine:after {
    content: "";
    position: absolute;
    inset: 0;
    background-image: url("https://res.cloudinary.com/simey/image/upload/v1671044316/metal.webp");
    background-size: cover;
    background-position: center;
    background-blend-mode: color-dodge;
    filter: brightness(2) contrast(1) saturate(1.5);
    mix-blend-mode: color-dodge;
    z-index: 1;
  }

  /* 15. RADIANT - 래디언트 */
  .card__front[data-effect="radiant"] .card__shine {
    --barwidth: 1.2%;
    --space: 200px;

    background-image:
      repeating-linear-gradient(
        55deg,
        rgb(255, 161, 158) calc(var(--space) * 1),
        rgb(85, 178, 255) calc(var(--space) * 2),
        rgb(255, 199, 146) calc(var(--space) * 3),
        rgb(130, 255, 213) calc(var(--space) * 4),
        rgb(253, 170, 240) calc(var(--space) * 5),
        rgb(148, 241, 255) calc(var(--space) * 6),
        rgb(255, 161, 158) calc(var(--space) * 7)
      ),
      repeating-linear-gradient(
        45deg,
        hsl(0, 0%, 10%) 0%,
        hsl(0, 0%, 50%) calc(var(--barwidth) * 5),
        hsl(0, 0%, 10%) calc(var(--barwidth) * 10)
      );
    background-size: 400% 400%, 210% 210%;
    background-position:
      calc(((var(--posx, 50%) - 50%) * -2.5) + 50%) calc(((var(--posy, 50%) - 50%) * -2.5) + 50%),
      calc(((var(--posx, 50%) - 50%) * 1.5) + 50%) calc(((var(--posy, 50%) - 50%) * 1.5) + 50%);
    background-blend-mode: exclusion, darken;
    filter: brightness(0.95) contrast(4.0) saturate(0.75);
    mix-blend-mode: color-dodge;
  }

  /* 16. AMAZING-RARE - 어메이징 레어 */
  .card__front[data-effect="amazing-rare"] .card__shine {
    background-image:
      repeating-linear-gradient(
        60deg,
        rgba(255, 0, 0, 0.5) 0%,
        rgba(255, 165, 0, 0.5) 16.666%,
        rgba(255, 255, 0, 0.5) 33.333%,
        rgba(0, 255, 0, 0.5) 50%,
        rgba(0, 0, 255, 0.5) 66.666%,
        rgba(75, 0, 130, 0.5) 83.333%,
        rgba(238, 130, 238, 0.5) 100%
      ),
      radial-gradient(
        circle at var(--posx, 50%) var(--posy, 50%),
        rgba(255, 255, 255, 0.5) 0%,
        transparent 70%
      );
    background-size: 300% 300%, 100% 100%;
    filter: brightness(0.9) contrast(2.5) saturate(1.2);
    mix-blend-mode: screen;
  }

  /* 17. TRAINER-GALLERY-HOLO */
  .card__front[data-effect="trainer-gallery-holo"] .card__shine {
    --space: 5%;
    --angle: -22deg;

    background-image:
      repeating-linear-gradient(
        var(--angle),
        rgba(174, 102, 202, 0.75) calc(var(--space) * 1),
        rgba(228, 77, 72, 0.75) calc(var(--space) * 2),
        rgba(216, 197, 55, 0.75) calc(var(--space) * 3),
        rgba(124, 201, 62, 0.75) calc(var(--space) * 4),
        rgba(80, 177, 170, 0.75) calc(var(--space) * 5),
        rgba(136, 160, 255, 0.75) calc(var(--space) * 6),
        rgba(176, 105, 204, 0.75) calc(var(--space) * 7)
      );
    background-size: 300% 200%;
    background-position: 0% calc(var(--posy, 50%) * 1);
    filter: brightness(0.6) contrast(2.3) saturate(1.1);
    mix-blend-mode: color-dodge;
  }

  /* 18. TRAINER-GALLERY-V (크로스 패턴) */
  .card__front[data-effect="trainer-gallery-v"] .card__shine {
    --space: 3%;

    background-image:
      repeating-linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 100, 200, 0.3) calc(var(--space) * 1),
        transparent calc(var(--space) * 2)
      ),
      repeating-linear-gradient(
        0deg,
        transparent 0%,
        rgba(100, 200, 255, 0.3) calc(var(--space) * 1),
        transparent calc(var(--space) * 2)
      ),
      linear-gradient(
        135deg,
        rgb(255, 100, 200) 0%,
        rgba(255, 200, 100, 1) 25%,
        rgba(100, 255, 200, 1) 50%,
        rgba(100, 200, 255, 1) 75%,
        rgb(200, 100, 255) 100%
      );
    background-blend-mode: screen, screen, normal;
    background-size: 100% 100%, 100% 100%, 200% 200%;
    background-position: 0% 0%, 0% 0%, var(--posx, 50%) var(--posy, 50%);
    filter: brightness(0.9) contrast(1.5) saturate(1.3);
    mix-blend-mode: color-dodge;
  }

  /* 19. TRAINER-FULL-ART (원본 trainerbg.jpg 사용) */
  .card__front[data-effect="trainer-full-art"] .card__shine {
    --space: 5%;
    --angle: 133deg;
    --imgsize: cover;

    background-image:
      url("https://res.cloudinary.com/simey/image/upload/v1671044511/trainerbg.jpg"),
      repeating-linear-gradient(
        var(--angle),
        #0e152e 0%,
        hsl(180, 10%, 60%) 3.8%,
        hsl(180, 29%, 66%) 4.5%,
        hsl(180, 10%, 60%) 5.2%,
        #0e152e 10%,
        #0e152e 12%
      ),
      radial-gradient(
        farthest-corner circle at var(--posx, 50%) var(--posy, 50%),
        rgba(0, 0, 0, 0.1) 12%,
        rgba(0, 0, 0, 0.15) 20%,
        rgba(0, 0, 0, 0.25) 120%
      );
    background-blend-mode: hue, hue, hue;
    background-size: var(--imgsize), 300%, 200%;
    background-position: center, 0% var(--posy, 50%), var(--posx, 50%) var(--posy, 50%);
    filter: brightness(calc((var(--posy, 75) * 0.3) + 50%)) contrast(2.5) saturate(0.5);
  }

  /* Epic Holo Effect (VMAX style from how2code_v2.md) - rarity만 있고 effectType 없을 때 */
  .card__front[data-rarity="epic"][data-effect="epic"] .card__shine,
  .card__front[data-rarity="epic"][data-effect=""] .card__shine {
    --space: 6%;
    --angle: 133deg;

    /* Pattern texture (inline SVG) */
    --pattern: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cpattern id='p' x='0' y='0' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='10' cy='10' r='1' fill='%23fff' opacity='0.1'/%3E%3C/pattern%3E%3Crect width='100' height='100' fill='url(%23p)'/%3E%3C/svg%3E");

    background-image:
      var(--pattern),
      repeating-linear-gradient(
        -33deg,
        rgb(206, 42, 36) calc(var(--space) * 1),
        rgb(157, 170, 223) calc(var(--space) * 2),
        rgb(45, 153, 146) calc(var(--space) * 3),
        rgb(29, 151, 36) calc(var(--space) * 4),
        rgb(181, 64, 228) calc(var(--space) * 5),
        rgb(206, 42, 36) calc(var(--space) * 6)
      ),
      repeating-linear-gradient(
        var(--angle),
        rgba(14, 21, 46, 0.5) 0%,
        hsl(180, 10%, 50%) 2.5%,
        hsl(83, 50%, 35%) 5%,
        hsl(180, 10%, 50%) 7.5%,
        rgba(14, 21, 46, 0.5) 10%,
        rgba(14, 21, 46, 0.5) 15%
      ),
      radial-gradient(
        farthest-corner circle at var(--posx, 50%) var(--posy, 50%),
        rgba(6, 218, 255, 0.6) 0%,
        rgba(38, 235, 127, 0.6) 25%,
        rgba(155, 78, 228, 0.6) 50%,
        rgba(228, 78, 90, 0.6) 75%
      );

    background-blend-mode: color-burn, screen, soft-light;
    background-size: 60% 70%, 1100% 1100%, 600% 600%, 200% 200%;
    background-position: center, 0% var(--posy, 50%), var(--posx, 50%) var(--posy, 50%), var(--posx, 50%) var(--posy, 50%);
    filter: brightness(0.5) contrast(2.5) saturate(0.6);
  }

  /* Rare Holo Effect (Galaxy Holo from how2code_v2.md) - rarity만 있고 effectType 없을 때 */
  .card__front[data-rarity="rare"][data-effect="rare"] .card__shine,
  .card__front[data-rarity="rare"][data-effect=""] .card__shine {
    --space: 80px;
    --h: 21;
    --s: 70%;
    --l: 50%;

    /* Galaxy pattern (inline SVG with stars) */
    --galaxy: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cdefs%3E%3CradialGradient id='g1'%3E%3Cstop offset='0%25' stop-color='%23fff' stop-opacity='0.8'/%3E%3Cstop offset='100%25' stop-color='%23fff' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='400' height='400' fill='%23000'/%3E%3Ccircle cx='50' cy='50' r='1' fill='url(%23g1)'/%3E%3Ccircle cx='150' cy='80' r='0.5' fill='%23fff' opacity='0.6'/%3E%3Ccircle cx='250' cy='120' r='1.5' fill='url(%23g1)'/%3E%3Ccircle cx='350' cy='90' r='0.8' fill='%23fff' opacity='0.7'/%3E%3Ccircle cx='100' cy='200' r='1' fill='url(%23g1)'/%3E%3Ccircle cx='300' cy='250' r='1.2' fill='%23fff' opacity='0.8'/%3E%3Ccircle cx='180' cy='320' r='0.6' fill='%23fff' opacity='0.5'/%3E%3Ccircle cx='320' cy='350' r='1' fill='url(%23g1)'/%3E%3C/svg%3E");

    background-image:
      var(--galaxy),
      var(--galaxy),
      var(--galaxy),
      repeating-linear-gradient(
        82deg,
        rgb(218, 56, 50) calc(var(--space) * 1),
        rgb(219, 204, 86) calc(var(--space) * 2),
        rgb(121, 199, 58) calc(var(--space) * 3),
        rgb(58, 192, 183) calc(var(--space) * 4),
        rgb(71, 98, 207) calc(var(--space) * 5),
        rgb(170, 69, 209) calc(var(--space) * 6),
        rgb(218, 56, 50) calc(var(--space) * 10)
      ),
      radial-gradient(
        farthest-corner circle at var(--posx, 50%) var(--posy, 50%),
        rgba(255, 255, 255, 0.6) 5%,
        rgba(150, 150, 150, 0.3) 40%,
        rgb(0, 0, 0) 100%
      );

    background-blend-mode: color-dodge, color-burn, saturation, screen;
    background-position: center, center, center,
      calc(((50% - var(--posx, 50%)) * 2.5) + 50%)
      calc(((50% - var(--posy, 50%)) * 2.5) + 50%),
      center;
    background-size: cover, cover, cover, 600% 1200%, cover;
    filter: brightness(0.75) contrast(1.2) saturate(1.5);
    mix-blend-mode: color-dodge;
  }

  /* Legendary Holo Effect (원본 rainbow2.jpg 사용) - rarity만 있고 effectType 없을 때 */
  .card__front[data-rarity="legendary"][data-effect="legendary"] .card__shine,
  .card__front[data-rarity="legendary"][data-effect=""] .card__shine {
    --space: 5%;
    --angle: 133deg;
    --imgsize: cover;

    background-image:
      url("https://res.cloudinary.com/simey/image/upload/v1671043433/rainbow2.jpg"),
      repeating-linear-gradient(
        var(--angle),
        #0e152e 0%,
        hsl(180, 10%, 60%) 3.8%,
        hsl(180, 29%, 66%) 4.5%,
        hsl(180, 10%, 60%) 5.2%,
        #0e152e 10%,
        #0e152e 12%
      ),
      radial-gradient(
        farthest-corner circle at var(--posx, 50%) var(--posy, 50%),
        rgba(0, 0, 0, 0.1) 12%,
        rgba(0, 0, 0, 0.15) 20%,
        rgba(0, 0, 0, 0.25) 120%
      );
    background-blend-mode: hue, hue, hue;
    background-size: var(--imgsize), 300%, 200%;
    background-position: center, 0% var(--posy, 50%), var(--posx, 50%) var(--posy, 50%);
    filter: brightness(calc((var(--posy, 75) * 0.3) + 50%)) contrast(2.5) saturate(0.5);
  }

  /* Common Holo Effect (Basic Holo from how2code_v2.md) - rarity만 있고 effectType 없을 때 */
  .card__front[data-rarity="common"][data-effect="common"] .card__shine,
  .card__front[data-rarity="common"][data-effect=""] .card__shine {
    --space: 2px;
    --h: 21;
    --s: 70%;
    --l: 50%;
    --bars: 24px;
    --bar-color: rgba(255, 255, 255, 0.6);
    --bar-bg: rgb(10, 10, 10);

    background-image:
      repeating-linear-gradient(
        90deg,
        hsl(calc(var(--h) * 0), var(--s), var(--l)) calc(var(--space) * 0),
        hsl(calc(var(--h) * 0), var(--s), var(--l)) calc(var(--space) * 1),
        black calc(var(--space) * 1.001),
        black calc(var(--space) * 1.999),
        hsl(calc(var(--h) * 1), var(--s), var(--l)) calc(var(--space) * 2),
        hsl(calc(var(--h) * 1), var(--s), var(--l)) calc(var(--space) * 3),
        black calc(var(--space) * 3.001),
        black calc(var(--space) * 3.999),
        hsl(calc(var(--h) * 2), var(--s), var(--l)) calc(var(--space) * 4),
        hsl(calc(var(--h) * 2), var(--s), var(--l)) calc(var(--space) * 5),
        black calc(var(--space) * 5.001),
        black calc(var(--space) * 5.999)
      ),
      repeating-linear-gradient(
        90deg,
        #c929f1,
        #0dbde9,
        #21e985,
        #eedf10,
        #f80e7b,
        #c929f1
      ),
      repeating-linear-gradient(
        90deg,
        var(--bar-bg) calc(var(--bars) * 2),
        var(--bar-color) calc(var(--bars) * 3),
        var(--bar-bg) calc(var(--bars) * 3.5),
        var(--bar-color) calc(var(--bars) * 4),
        var(--bar-bg) calc(var(--bars) * 5),
        var(--bar-bg) calc(var(--bars) * 12)
      ),
      radial-gradient(
        farthest-corner circle at var(--posx, 50%) var(--posy, 50%),
        rgba(230, 230, 230, 0.85) 0%,
        rgba(200, 200, 200, 0.1) 25%,
        rgb(0, 0, 0) 90%
      );

    background-blend-mode: soft-light, soft-light, screen, overlay;
    background-position: center, calc(((50% - var(--posx, 50%)) * 25) + 50%) center,
      calc(var(--posx, 50%) * -1.2) var(--posy, 50%), center;
    background-size: 100% 100%, 200% 200%, 237% 237%, 120% 120%;
    filter: brightness(0.7) contrast(3.2) saturate(0.66);
  }

  /* Sparkle/Glare Layer (Enhanced with how2code_v2.md style) */
  .card__glare {
    position: absolute;
    inset: 0;
    z-index: 3;
    opacity: 0;
    mix-blend-mode: overlay;
    background-image:
      radial-gradient(
        farthest-corner circle at var(--posx, 50%) var(--posy, 50%),
        rgba(222, 245, 250, 0.7) 10%,
        rgba(255, 255, 255, 0.5) 20%,
        rgba(0, 0, 0, 0.5) 90%
      ),
      radial-gradient(circle at calc(var(--posx, 50%) - 20%) calc(var(--posy, 50%) - 20%), rgba(255, 255, 255, 0.3) 0%, transparent 30%),
      radial-gradient(circle at calc(var(--posx, 50%) + 20%) calc(var(--posy, 50%) + 20%), rgba(255, 255, 255, 0.2) 0%, transparent 25%);
    background-size: 100% 100%, 40% 40%, 30% 30%;
    background-position: var(--posx, 50%) var(--posy, 50%);
    background-repeat: no-repeat;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  /* Show effects on hover */
  .card__front:hover .card__shine {
    opacity: 0.5;
  }

  .card__front:hover .card__glare {
    opacity: 0.35;
  }

  /* Content Overlay */
  .card__content {
    position: absolute;
    inset: 0;
    z-index: 10;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1.5rem;
    pointer-events: none;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.3) 0%,
      transparent 20%,
      transparent 70%,
      rgba(0, 0, 0, 0.7) 100%
    );
  }

  .card__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .card__team {
    font-size: 0.875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: white;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
    padding: 0.375rem 0.75rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .card__number {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
    text-shadow:
      0 0 10px rgba(255, 255, 255, 0.8),
      0 2px 4px rgba(0, 0, 0, 0.7);
  }

  .card__footer {
    text-align: center;
  }

  .card__title {
    font-family: 'Pretendard Variable', 'Gmarket Sans Bold', sans-serif;
    font-size: 2rem;
    font-weight: 900;
    color: white;
    margin: 0 0 0.25rem 0;
    line-height: 1;
    text-shadow:
      0 2px 4px rgba(0, 0, 0, 0.7),
      0 0 20px rgba(255, 255, 255, 0.3);
    letter-spacing: -0.02em;
  }

  .card__subtitle {
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin: 0 0 0.5rem 0;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
    letter-spacing: 0.05em;
  }

  .card__rarity {
    display: inline-block;
    font-size: 1.25rem;
    color: #FFD700;
    text-shadow:
      0 0 10px rgba(255, 215, 0, 0.8),
      0 2px 4px rgba(0, 0, 0, 0.7);
    letter-spacing: 0.1em;
    animation: rarity-glow 2s ease-in-out infinite;
  }

  @keyframes rarity-glow {
    0%, 100% {
      filter: brightness(1);
      text-shadow:
        0 0 10px rgba(255, 215, 0, 0.8),
        0 2px 4px rgba(0, 0, 0, 0.7);
    }
    50% {
      filter: brightness(1.3);
      text-shadow:
        0 0 20px rgba(255, 215, 0, 1),
        0 0 30px rgba(255, 215, 0, 0.6),
        0 2px 4px rgba(0, 0, 0, 0.7);
    }
  }

  .card__rarity[data-rarity="legendary"] {
    color: #FFD700;
    background: linear-gradient(90deg, #FFD700, #FFA500, #FFD700);
    background-size: 200% 100%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: rarity-glow 2s ease-in-out infinite, gradient-slide 3s linear infinite;
  }

  @keyframes gradient-slide {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  .card__rarity[data-rarity="epic"] {
    color: #C41E3A;
  }

  .card__rarity[data-rarity="rare"] {
    color: #0EA5E9;
  }

  .card__rarity[data-rarity="common"] {
    color: #AAA;
    animation: none;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .card__content {
      padding: 1rem;
    }

    .card__title {
      font-size: 1.5rem;
    }

    .card__subtitle {
      font-size: 0.875rem;
    }

    .card__number {
      font-size: 1rem;
    }
  }
</style>
