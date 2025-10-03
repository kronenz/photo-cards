

# 1) 이 레포의 홀로(호일) 효과는 무엇으로 이루어지나

핵심은 **여러 겹의 레이어+블렌드모드+필터+3D 틸트**를 조합해 “빛에 따라 무지개처럼 번쩍이는” 금속성/펄 텍스처를 만드는 겁니다.

구성 개요

* **기본 카드 레이어**: 카드 아트/틀(정상 렌더)
* **호일 레이어**: 그라디언트·노이즈·패턴이 섞인 ‘광택 텍스처’ (아래를 `mix-blend-mode: color-dodge` 같은 블렌드로 카드 위에 합성) ([MDN 웹 문서][1])
* **마스크(선택적)**: 특정 영역(예: 별/콘페티 패턴)만 반짝이도록 `mask-image` 또는 투명 PNG/SVG로 클리핑
* **글레어/플레어**: 마우스/기울기에 반응하는 하이라이트(보통 conic/linear-gradient, 노이즈를 섞고 `filter: contrast/saturate/brightness`로 과장) ([MDN 웹 문서][2])
* **3D 틸트**: `perspective` + `transform: rotateX/rotateY`로 시차감.
* **JS는 최소한**: 마우스 좌표로 CSS 커스텀 프로퍼티를 갱신해(예: `--mx`, `--my`) 그라디언트 각도/배치를 살짝 움직임.

레포 자체도 “Svelte 데모 + CSS Transform, Gradient, Blend-mode, Filter로 호일 효과를 흉내낸 쇼케이스”라고 못 박고 있고, 꽤 무거운 편이라 실서비스 모듈이 아님을 강조합니다. ([GitHub][3])

# 2) ‘홀로그래픽’을 그럴듯하게 보이게 하는 포인트

* **conic/linear-gradient 다중 레이어**: 무지개 스펙트럼·밴딩을 만들고, 각도/오프셋을 살짝 애니메이션. ([MDN 웹 문서][2])
* **노이즈/그레인 텍스처**: 밋밋한 그라디언트를 금속처럼 보이게 함(SVG 노이즈, 작은 PNG 타일). (일반적인 기법 레퍼런스) ([CSS-Tricks][4])
* **블렌드 모드**: `color-dodge`, `screen`, `plus-lighter` 등을 섞어 “밝은 부분만” 고급지게 튀어나오게 함. Edge/Chrome은 사양상 지원되지만 합성 컨텍스트/배경 유무에 매우 민감. ([web.dev][5])
* **필터**: `saturate(…) contrast(…) brightness(…) hue-rotate(…)`로 과장.

# 3) Chrome에선 되는데 Edge에서 안 되는 이유(흔한 원인)

1. **블렌드 컨텍스트 결여**
   `mix-blend-mode`는 “뒤에 **실제 픽셀**이 있어야” 섞입니다. 상위 요소가 투명하거나, 새 스택 컨텍스트가 애매하면 Edge가 합성을 달리 해 **효과가 사라진 것처럼** 보입니다.
   → 해결: 호일 레이어의 **부모**에 `background-color`(불투명) 또는 `isolation: isolate`를 줘서 독립된 블렌드 컨텍스트를 보장하세요. ([web.dev][5])

2. **색공간/컬러 매칭 차이**
   일부 브라우저(또는 디스플레이/HDR 설정)에서 블렌딩이 **디스플레이 색공간**에서 계산되어 sRGB 기준 색과 차이가 나며, `color-dodge` 결과가 탁해지거나 달라 보일 수 있습니다.
   → 해결: 호일 그라디언트의 컬러를 **sRGB 전제**로 재조정하거나, 과도한 `color-dodge` 의존을 줄이고 `screen/plus-lighter`로 톤을 잡아 보정. (색공간 차이로 blend 결과가 달라진다는 레퍼런스) ([Stack Overflow][6])

3. **배경이 비치는 레이아웃**
   카드가 포지셔닝/투명 배경 위에 있고, 실제 문서 배경이 체커보드/비디오/캔버스 등일 때 Edge가 레이어 순서를 다르게 최적화하여 블렌딩이 어긋날 수 있습니다.
   → 해결: 카드 컨테이너에 **불투명 배경**을 주고(예: `#000`), 호일 레이어는 그 컨테이너 안에서만 블렌딩되게 합니다. `positioning/z-index`와 `contain: paint`도 도움.

4. **데모 코드 자체가 무겁고(필터·3D·블렌드 모두) 프레임 드랍**
   Edge에서 프레임이 떨어질 때 효과가 “거의 안 먹히는” 것처럼 느껴질 수 있습니다. 레포도 “**무거운 데모**”임을 명시합니다.
   → 해결: `will-change: transform, filter;` 최소화, 해상도 축소, 레이어 수 줄이기. ([GitHub][7])

# 4) Claude가 바로 따라할 수 있는 “최소 구현 스니펫”

아래는 **Edge에서 잘 먹히도록** 블렌드 컨텍스트를 확실히 만든 간소화 버전입니다. (핵심은 `isolation: isolate`와 **불투명한 부모 배경**)

```html
<div class="card">
  <img class="art" src="card.jpg" alt="">
  <div class="foil"></div>
</div>
```

```css
.card{
  position: relative;
  width: 320px; aspect-ratio: 63/88; /* 카드 비율 */
  border-radius: 12px; overflow: hidden;
  background: #000;           /* 불투명! */
  isolation: isolate;         /* 블렌드 컨텍스트 보장 */
  perspective: 800px;         /* 틸트용 */
}

.art{ width: 100%; display: block; }

.foil{
  position: absolute; inset: 0;
  /* 무지개 결: conic + linear를 살짝 섞음 */
  --a: 0deg;
  background:
    conic-gradient(from var(--a),
      #fff0, #ff0080 30%, #00e5ff 60%, #fff0 90%),
    linear-gradient(120deg, rgba(255,255,255,.05), rgba(255,255,255,.2));
  mix-blend-mode: color-dodge;       /* 핵심 블렌드 */
  filter: saturate(140%) contrast(120%) brightness(110%);
  pointer-events: none;
}

/* 마우스에 따라 각도만 슬쩍 바꾸기 */
.card:hover .foil{ animation: spin 2s linear infinite; }
@keyframes spin{ to { --a: 360deg; } }

/* Edge에서 color-dodge가 약하면 대체 모드 */
@supports (mix-blend-mode: plus-lighter){
  .foil.edge-fallback{ mix-blend-mode: plus-lighter; filter: saturate(160%) contrast(130%); }
}
```

> 팁
>
> * 부모 `.card`의 `background: #000` 또는 아주 어두운 색을 반드시 유지(완전 투명 금지).
> * 상위에 또 투명 래퍼가 있다면 거기에도 `isolation: isolate`를 고려.
> * 실제 레포처럼 패턴 마스크를 쓰려면 `.foil`에 `mask-image: url(star-pattern.png)` 또는 `mask: radial-gradient(...);`를 얹어 특정 부위만 반짝이게 하세요.

# 5) Edge에서의 안정화를 위한 체크리스트

* [ ] `.card` **배경을 불투명**으로(예: `#000`) 하고, `.card { isolation: isolate; }` 적용. 블렌드 컨텍스트 보장. ([web.dev][5])
* [ ] `mix-blend-mode: color-dodge`가 심하게 다르게 보이면 **`plus-lighter`/`screen` 폴백** 제공. ([web.dev][5])
* [ ] 컬러가 탁하다면 **색공간 영향**을 의심: 컬러값/필터 세기를 sRGB 기준으로 재보정. ([Stack Overflow][6])
* [ ] `z-index`/`position`으로 호일 레이어가 **카드 컨테이너 내부**에서만 섞이게 하고, 문서 배경과 섞이지 않게 설계.
* [ ] 과한 레이어·필터는 줄여 **프레임 드랍 방지**(데모 자체가 무겁다는 점 유념). ([GitHub][7])

# 6) 출처(핵심 동작/제약 관련)

* 공식 데모/리드미(구성·의도): “CSS Transforms, Gradients, Blend-modes and Filters로 호일 효과 구현(데모 성격, 무거움 경고)”. ([GitHub][3])
* `conic-gradient()` 동작과 쓰임: MDN. ([MDN 웹 문서][2])
* `mix-blend-mode`/블렌드 모드 설명 및 컨텍스트/`isolation`: web.dev 가이드. ([web.dev][5])
* 블렌딩과 **색공간 차이**로 결과가 달라질 수 있음: StackOverflow 토론. ([Stack Overflow][6])

---

[1]: https://developer.mozilla.org/en-US/docs/Web/CSS/blend-mode?utm_source=chatgpt.com "<blend-mode> - CSS | MDN - Mozilla"
[2]: https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient?utm_source=chatgpt.com "conic-gradient() - CSS | MDN - Mozilla"
[3]: https://github.com/simeydotme/pokemon-cards-css "GitHub - simeydotme/pokemon-cards-css: A collection of advanced CSS styles to create realistic-looking effects for the faces of Pokemon cards."
[4]: https://css-tricks.com/grainy-gradients/?utm_source=chatgpt.com "Grainy Gradients"
[5]: https://web.dev/learn/css/blend-modes?utm_source=chatgpt.com "Blend Modes"
[6]: https://stackoverflow.com/questions/70579988/mix-blend-mode-multiply-not-working-in-chrome/70580669?utm_source=chatgpt.com "css - Mix-blend-mode: multiply not working in Chrome"
[7]: https://github.com/simeydotme/pokemon-cards-css/issues/19 "This Repo is a Demonstration / Showcase, not a module. · Issue #19 · simeydotme/pokemon-cards-css · GitHub"


```