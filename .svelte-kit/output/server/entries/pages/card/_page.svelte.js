import { c as create_ssr_component, a as subscribe, b as add_attribute, v as validate_component } from "../../../chunks/index2.js";
import "pokemontcgsdk";
import { w as writable, r as readable } from "../../../chunks/index.js";
const activeCard = writable(void 0);
const Cards_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: ".card-grid.svelte-jmfqas{display:grid;grid-template-columns:1fr;grid-gap:50px 2vw;transform-style:preserve-3d;height:100%;max-width:1200px;margin:auto;padding:50px;position:relative}.card-grid.active.svelte-jmfqas{z-index:99}@media screen and (min-width: 900px){.card-grid.svelte-jmfqas{grid-template-columns:1fr 1fr 1fr}}@media screen and (max-width: 900px){ .card-grid > .card {--row:1;grid-column:1;grid-row:var(--row);transition:opacity 0.2s ease, transform 0.2s ease} .card-grid > .card:nth-child(1n) {position:relative;left:-50px;top:10px;z-index:calc(var(--card-scale) * 10 + 50);transform:translate3d(0, 0, 0.1px) rotateZ(-5deg);opacity:1} .card-grid > .card:nth-child(2n) {left:0px;top:-10px;z-index:calc(var(--card-scale) * 10 + 49);transform:translate3d(0, 0, 0.1px) rotateZ(0deg);opacity:0.99} .card-grid > .card:nth-child(3n) {left:50px;top:0px;z-index:calc(var(--card-scale) * 10 + 48);transform:translate3d(0, 0, 0.1px) rotateZ(5deg);opacity:0.99} .card-grid > .card.interacting, .card-grid > .card.active {opacity:1} .card-grid > .card:nth-child(n+4):nth-child(-n+6) {grid-row:2} .card-grid > .card:nth-child(n+7):nth-child(-n+9) {grid-row:3} .card-grid > .card:nth-child(n+10):nth-child(-n+12) {grid-row:4} .card-grid > .card:nth-child(n+13):nth-child(-n+15) {grid-row:5} .card-grid > .card:nth-child(n+16):nth-child(-n+18) {grid-row:6} .card-grid > .card:nth-child(n+19) {grid-row:auto;grid-column:auto;transform:none!important;left:0!important;top:0!important}}@media screen and (min-width: 600px) and (max-width: 900px){.card-grid.svelte-jmfqas{max-width:420px;margin:auto} .card-grid > .card:nth-child(1n) {left:-100px;top:10px;transform:translate3d(0, 0, 0.1px) rotateZ(-5deg)} .card-grid > .card:nth-child(2n) {left:0px;top:-10px;transform:translate3d(0, 0, 0.1px) rotateZ(0deg)} .card-grid > .card:nth-child(3n) {left:100px;top:0px;transform:translate3d(0, 0, 0.1px) rotateZ(5deg)}} .card-grid > .card.active {transform:translate3d(0, 0, 0.1px)!important}",
  map: null
};
const Cards = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let active;
  let $$unsubscribe_activeCard;
  $$unsubscribe_activeCard = subscribe(activeCard, (value) => value);
  let thisGrid;
  $$result.css.add(css$1);
  active = thisGrid;
  $$unsubscribe_activeCard();
  return `<section class="${["card-grid svelte-jmfqas", active ? "active" : ""].join(" ").trim()}"${add_attribute("this", thisGrid, 0)}>${slots.default ? slots.default({}) : ``}

</section>`;
});
const getRawOrientation = function(e) {
  if (!e) {
    return { alpha: 0, beta: 0, gamma: 0 };
  } else {
    return { alpha: e.alpha, beta: e.beta, gamma: e.gamma };
  }
};
const getOrientationObject = (e) => {
  const orientation = getRawOrientation(e);
  return {
    absolute: orientation,
    relative: {
      alpha: orientation.alpha - baseOrientation.alpha,
      beta: orientation.beta - baseOrientation.beta,
      gamma: orientation.gamma - baseOrientation.gamma
    }
  };
};
let firstReading = true;
let baseOrientation = getRawOrientation();
readable(getOrientationObject(), function start(set) {
  const handleOrientation = function(e) {
    if (firstReading) {
      firstReading = false;
      baseOrientation = getRawOrientation(e);
    }
    const o = getOrientationObject(e);
    set(o);
  };
  window.addEventListener("deviceorientation", handleOrientation, true);
  return function stop() {
    window.removeEventListener("deviceorientation", handleOrientation, true);
  };
});
const Card_svelte_svelte_type_style_lang = "";
const Search_svelte_svelte_type_style_lang = "";
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: ".back-to-top.svelte-1i93roe a.svelte-1i93roe{color:inherit;text-decoration:none;z-index:999}",
  map: null
};
let query = "";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `<main><header><h1 id="⚓-top">KBO 야구카드 <sup>Beta V0.1</sup></h1>
  
          <section class="intro" id="⚓-intro"><p>KBO 야구카드를 <mark>고급 CSS</mark> 스타일을 사용하여
                  <mark>사실적인 효과</mark>로 만든 컬렉션입니다.
                  카드는 <mark>3D 변환</mark>, <mark>필터</mark>, <mark>블렌드 모드</mark>,
                  <mark>CSS 그라디언트</mark> 및 상호작용을 사용하여 자세히 볼 때 독특한 경험을 제공합니다!
                  향후 10개 구단의 사진가들을 위한 작업이 진행될 예정입니다.
              </p></section>
  
          <div class="showcase">${`loading...`}</div>
  
          <section class="info"><h2>Click on a Card to take a Closer look!</h2>
  
              <hr>
  
              <p class="small">상호작용과 상태를 처리하기 위해 SvelteJS를 사용하고 있습니다; <strong>CSS 사용자 정의 속성</strong>(변수)에 값을 할당하여 
                      효과와 3D 변환을 구동합니다. 
                  
              </p></section></header>
  
  
      ${query.length < 3 ? `<h2 id="⚓-common"><a href="#⚓-common">Common &amp; Uncommon
              </a></h2>
          <p>모든 카드는 커서 위치에 따라 CSS로 3D 회전 효과를 얻습니다.<br> 기본적인
              비홀로 카드는 단순히 마우스를 따라다니는 <mark>섬광/반사 효과</mark>를 카드에 적용합니다.
          </p>
  
          ${validate_component(Cards, "CardList").$$render($$result, {}, {}, {
    default: () => {
      return `${`loading...`}`;
    }
  })}
  
          <h2 id="⚓-reverse"><a href="#⚓-reverse">Reverse Holo non-rares
              </a></h2>
          <p>리버스 홀로 카드는 <mark>다양한 형태와 크기</mark>로 제공됩니다 (트레이너, 1단계, 그리고 다양한 에너지 타입). <br> 따라서
              여기에 다양한 변형을 보여주는 몇 가지 예시가 있습니다. <mark>배경은 포일과 마스크 레이어</mark>를
              글레어와 함께 사용합니다. 또한 <mark>글레어를 이미지 창에 클리핑</mark>하여 이미지와 홀로포일을 다르게 처리합니다.
          </p>
  
          ${validate_component(Cards, "CardList").$$render($$result, {}, {}, {
    default: () => {
      return `${`loading...`}`;
    }
  })}
  
          <h2 id="⚓-holo"><a href="#⚓-holo">Holofoil Rare
              </a></h2>
          <p>홀로 카드에는 추가적인 <mark>수직 빔 홀로 효과</mark>가 있습니다. <br> 이는
              <mark>반복되는 그라데이션과 필터</mark>의 조합을 사용하며, <mark>clip-path</mark>로
              각 단계의 홀로 영역을 마스킹합니다. 카드를 회전할 때 홀로 효과가 변하도록 하기 위해
              커서 위치에 따라 각 그라데이션 레이어의 background-position을 설정합니다.
          </p>
  
          ${validate_component(Cards, "CardList").$$render($$result, {}, {}, {
    default: () => {
      return `${`loading...`}`;
    }
  })}
  
          <h2 id="⚓-galaxy"><a href="#⚓-galaxy">Galaxy/Cosmos Holofoil
              </a></h2>
          <p>홀로포일과 유사하지만, 이것은 특별한 <mark>은하계 효과의 배경 이미지</mark>를 사용하며
              그 위에 <mark>color-dodge와 color-burn으로 설정된 그라데이션 무지개</mark>가 있습니다.
          </p>
          <h3>포켓몬 카드 게임 팬이라면 누구나 좋아할 고전적인 디자인입니다!</h3>
  
          ${validate_component(Cards, "CardList").$$render($$result, {}, {}, {
    default: () => {
      return `${`loading...`}`;
    }
  })}
  
          <h2 id="⚓-amazing"><a href="#⚓-amazing">Holofoil Amazing Rare
              </a></h2>
          <p>어메이징 레어 카드는 프레임을 넘어 확장되는 <mark>매우 독특한 반짝이는 포일</mark>을 가지고 있으며, 일반 홀로 효과보다 훨씬 더 반짝이고 질감이 있습니다. 
          </p>
  
          ${validate_component(Cards, "CardList").$$render($$result, {}, {}, {
    default: () => {
      return `${`loading...`}`;
    }
  })}
  
          <h2 id="⚓-radiant"><a href="#⚓-radiant">Radiant Holofoil
              </a></h2>
          <p>시리즈에 새롭게 추가된 홀로포일입니다! <br> 레디언트 효과는
              <mark>복잡한 수학 없이 모방하기가 매우 어려웠습니다</mark>.
              그래서 카드를 가로질러 움직이는 <mark>교차하는 선형 그라디언트 패턴</mark>으로 대체했습니다.
          </p>
  
          ${validate_component(Cards, "CardList").$$render($$result, {}, {}, {
    default: () => {
      return `${`loading...`}`;
    }
  })}
  
          <h2 id="⚓-trainer-gallery-holo"><a href="#⚓-trainer-gallery-holo">Trainer Gallery Holofoil
              </a></h2>
          <p>트레이너 갤러리 홀로포일의 효과는 <mark>일종의 금속성 효과와 무지개빛 광택</mark>을 줍니다. 이는 <mark>큰 색상 닷지 선형 그라디언트</mark>와 커서 위치에 있는 <mark>하드라이트 방사형 그라디언트</mark>를 위에 추가하여 반짝임을 주는 방식으로 구현됩니다.
          </p>
  
          ${validate_component(Cards, "CardList").$$render($$result, {}, {}, {
    default: () => {
      return `${`loading...`}`;
    }
  })}
  
          <h2 id="⚓-v"><a href="#⚓-v">Pokemon V
              </a></h2>
          <p>V 카드는 <mark>대각선 홀로그래픽 효과</mark>를 가지고 있으며, 카드를 빛에 비춰 기울일 때 반대 방향으로 움직이는 것처럼 보입니다.
          </p>
          <p>이 효과는 <mark>여러 배경 그라디언트</mark>로 구현되며, 커서의 x/y 위치에 따라 배경 위치를 변경합니다. 그라디언트는 color-dodge로 설정되어 있고, 미묘한 svg 노이즈 효과도 있습니다.
          </p>
  
          ${validate_component(Cards, "CardList").$$render($$result, {}, {}, {
    default: () => {
      return `${`loading...`}`;
    }
  })}
  
          <h2 id="⚓-v-full-art"><a href="#⚓-v-full-art">Pokemon V <sup>(Full Art)</sup></a></h2>
          <p>포켓몬 V 효과와 유사하게, 풀 아트 카드는 <mark>대각선 그라디언트를 사용</mark>하지만, 특정 각도에서 볼 때 <mark>추가적인 텍스처</mark>가 있습니다. 이는 <mark>제외 필터가 적용된 추가 배경 이미지</mark>로 구현됩니다. 또한 효과가 더 선명하여 금속성 외관을 더해줍니다.
          </p>
          <p>텍스처 효과는 실제와 완전히 동일하지 않습니다. 실제 카드는 각각 아트워크를 따라 고유한 패턴을 가지고 있기 때문입니다.
          </p>
  
          ${validate_component(Cards, "CardList").$$render($$result, {}, {}, {
    default: () => {
      return `${`loading...`}`;
    }
  })}
  
          <h2 id="⚓-v-alternate-art"><a href="#⚓-v-alternate-art">Pokemon V <sup>(Alternate Art)</sup></a></h2>
          <p>대체 아트 포켓몬 V 카드는 <mark>사실상 울트라 레어(풀 아트) 카드와 동일한 홀로 효과를 가지고 있습니다</mark>. 유일한 차이점은 패턴 텍스처입니다.
          </p>
          <p>하지만 아트워크의 유형으로 인해 효과가 다소 다르게 보입니다.</p>
  
          ${validate_component(Cards, "CardList").$$render($$result, {}, {}, {
    default: () => {
      return `${`loading...`}`;
    }
  })}
  
          <h2 id="⚓-v-max"><a href="#⚓-v-max">VMax
              </a></h2>
          <p>포켓몬 VMax의 그라디언트 효과는 더 미묘합니다. <mark>더 큰 배경 그라디언트</mark>를
              사용하여 더 천천히 움직입니다. 하지만 <mark>텍스처 효과는 더 두드러집니다</mark>.
          </p>
  
          ${validate_component(Cards, "CardList").$$render($$result, {}, {}, {
    default: () => {
      return `${`loading...`}`;
    }
  })}
  
          <h2 id="⚓-v-max-alternate"><a href="#⚓-v-max-alternate">VMax <sup>(Alternate/Rainbow)</sup></a></h2>
          <p>일부 VMax 카드는 <mark>전체 또는 대체 아트워크</mark>를 보여줍니다. 이들은
              <mark>&quot;레인보우 레어&quot;로 분류되며</mark>
              레인보우 카드와 유사한 효과를 가집니다. 이는 매우
              <mark>생동감 있고 반짝이는 오버레이</mark>입니다.
          </p>
          <p>이는 <mark>반짝이/스파클의 배경 이미지</mark>와 텍스처 패턴
              배경 이미지를 사용하여 구현되며, 일반적인 선형 그라데이션을 샌드위치 형태로 배치합니다.
          </p>
  
          ${validate_component(Cards, "CardList").$$render($$result, {}, {}, {
    default: () => {
      return `${`loading...`}`;
    }
  })}
  
          <h2 id="⚓-v-star"><a href="#⚓-v-star">VStar
              </a></h2>
          <p>다시 <mark>대각선 그라데이션이 텍스처 위에 겹쳐진</mark> 형태로, VStar 카드는
              <mark>울트라 레어(풀 아트/얼터너티브 아트) 카드와 매우 유사합니다</mark>.
              하지만 이 카드들은 일반적으로 <mark>파스텔 색조로 더 밝게</mark> 표현되어 있어,
              그라데이션과 텍스처가 더 미묘하게 나타납니다.
          </p>
  
          ${validate_component(Cards, "CardList").$$render($$result, {}, {}, {
    default: () => {
      return `${`loading...`}`;
    }
  })}
  
          <h2 id="⚓-trainer-full-art"><a href="#⚓-trainer-full-art">Trainer Holo <sup>(Full Art / Trainer Gallery)</sup></a></h2>
          <p>다시 <mark>대각선 그라데이션이 텍스처 위에 겹쳐진</mark> 형태로, VStar 카드는
              <mark>울트라 레어(풀 아트/얼터너티브 아트) 카드와 매우 유사합니다</mark>.
              하지만 이 카드들은 일반적으로 <mark>파스텔 색조로 더 밝게</mark> 표현되어 있어,
              그라데이션과 텍스처가 더 미묘하게 나타납니다.
          </p>
  
          ${validate_component(Cards, "CardList").$$render($$result, {}, {}, {
    default: () => {
      return `${`loading...`}`;
    }
  })}
  
          <h2 id="⚓-rainbow-rare"><a href="#⚓-rainbow-rare">Rainbow Rare <sup>(VMax, VStar)</sup></a></h2>
          <p>레인보우 레어는 <mark>파스텔 그라데이션 위에 매우 반짝이는 효과</mark>를 가지고 있습니다. 이는
              반짝이/스파클 배경 이미지와 파스텔 그라데이션을 위한
              <mark>컬러번/하드라이트 배경 블렌드</mark>를 사용하여 구현됩니다.
          </p>
  
          ${validate_component(Cards, "CardList").$$render($$result, {}, {}, {
    default: () => {
      return `${`loading...`}`;
    }
  })}
  
          <h2 id="⚓-secret-rare"><a href="#⚓-secret-rare">Secret Rare <sup>(Gold)</sup></a></h2>
          <p><mark>골드!</mark> 여기서는 오버레이 효과로 두 개의 반짝이는 레이어를 서로 겹쳐 적용하고
          <mark>두 레이어를 반대 방향으로 슬라이드</mark>합니다. 또한 <mark>포일 이미지를 그라데이션으로 마스킹</mark>하여
          포일과 반짝이는 레이어가 서로 배타적이 되도록 합니다. 그 결과로 반짝이는 글리터 효과가 나타납니다!
          </p>
  
          ${validate_component(Cards, "CardList").$$render($$result, {}, {}, {
    default: () => {
      return `${`loading...`}`;
    }
  })}
  
          <h2 id="⚓-trainer-gallery-v"><a href="#⚓-trainer-gallery-v">Trainer Gallery <sup>(V / VMax)</sup></a></h2>
          <p>트레이너 갤러리의 V와 VMax 카드는 일반적으로 일반 V와 VMax 카드와 매우 유사합니다. 
              따라서 여기서는 값을 약간 조정하고 다른 배경 텍스처를 추가했습니다.
          </p>
  
          ${validate_component(Cards, "CardList").$$render($$result, {}, {}, {
    default: () => {
      return `${`loading...`}`;
    }
  })}
  
          <h2 id="⚓-shiny-vault"><a href="#⚓-shiny-vault">Shiny Vault <sup>(Basic / Stage 1 / V / VMax)</sup></a></h2>
          <p>샤이니 볼트 카드는 포일 배경이 반짝이는 은색인 독특한 효과를 가지고 있습니다.
              이를 구현하기 위해 포일 이미지에 방사형 그라데이션을 적용하여 배경 위의 포일을 어둡게 만듭니다.
              이는 흰색 카드 배경 위에 은색 효과를 약간 만들어냅니다.
              이 효과는 Firefox에서 가장 잘 작동합니다.
          </p>
  
          ${validate_component(Cards, "CardList").$$render($$result, {}, {}, {
    default: () => {
      return `${`loading...`}`;
    }
  })}` : ``}</main>
  
  <div class="back-to-top svelte-1i93roe"><a href="#⚓-top" class="svelte-1i93roe">Back to Top</a>
  </div>`;
});
export {
  Page as default
};
