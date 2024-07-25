<script>
    import { onMount } from "svelte";
  
      import Search from "../../Search.svelte";
      import CardList from "../../Cards.svelte";
      import Card from "../../lib/components/CardProxy.svelte";
  
      let showcase, basics, reverse, holos, cosmos, amazings, radiant, basicGallery, 
              vee, veeUltra, veeAlt, veeMax, veeMaxAlt, veeStar, 
              trainerHolo, rainbow, gold, veeGallery, shinyVault;
  
      let query = "";
      let isLoading = true;
  
      const getCards = async () => {
          let promiseArray = [];
          let cardFetch = await fetch('../../public/data/cards.json');
          let cards = await cardFetch.json();
          return cards;
      };
  
      const loadCards = async() => {
          return getCards()
              .then((cards) => {
                  window.cards = cards;
                  showcase = cards[0];
                  basics = cards.slice(1, 4);
                  reverse = [...cards.slice(4, 7), ...cards.slice(70,76)];
                  holos = cards.slice(7, 13);
                  cosmos = cards.slice(13, 16);
                  amazings = cards.slice(76, 85);
                  radiant = cards.slice(16, 19);
                  basicGallery = cards.slice(19, 22);
                  vee = cards.slice(22, 25);
                  veeUltra = cards.slice(25, 28);
                  veeAlt = cards.slice(28, 34);
                  veeMax = cards.slice(37, 40);
                  veeMaxAlt = cards.slice(40, 43);
                  veeStar = cards.slice(43, 46);
                  trainerHolo = cards.slice(46, 52);
                  rainbow = cards.slice(52, 58);
                  gold = cards.slice(58, 64);
                  veeGallery = cards.slice(64, 70);
                  shinyVault = cards.slice(85,91);
                  isLoading = false;
              });
      };
  
      onMount(() => {
          loadCards();
          const $headings = document.querySelectorAll("h1,h2,h3");
          const $anchor = [...$headings].filter((el) => {
              const id = el.getAttribute("id")?.replace(/^.*?-/g,"");
              const hash = window.location.hash?.replace(/^.*?-/g,"")
              return id === hash;
          })[0];
          if( $anchor ) {
              setTimeout(() => {
                  $anchor.scrollIntoView();
              },100);
          }
      });
  </script>
  
  <main>
      <header>
          <h1 id="⚓-top">KBO 야구카드 <sup>Beta V0.1</sup></h1>
  
          <section class="intro" id="⚓-intro">
              <p>
                  KBO 야구카드를 <mark>고급 CSS</mark> 스타일을 사용하여
                  <mark>사실적인 효과</mark>로 만든 컬렉션입니다.
                  카드는 <mark>3D 변환</mark>, <mark>필터</mark>, <mark>블렌드 모드</mark>,
                  <mark>CSS 그라디언트</mark> 및 상호작용을 사용하여 자세히 볼 때 독특한 경험을 제공합니다!
                  향후 10개 구단의 사진가들을 위한 작업이 진행될 예정입니다.
              </p>
          </section>
  
          <div class="showcase">
              {#if !showcase}
                  loading...
              {:else}
                  <Card
                      id={showcase.id}
                      img={showcase.image}
                      name={showcase.name}
                      set={showcase.set}
                      number={showcase.number}
                      types={showcase.types}
                      supertype={showcase.supertype}
                      subtypes={showcase.subtypes}
                      rarity={showcase.rarity}
                      isReverse={showcase.isReverse}
                      showcase={true}
                  />
              {/if}
          </div>
  
          <section class="info">
              <h2>Click on a Card to take a Closer look!</h2>
  
              <hr />
  
              <p class="small">
                  상호작용과 상태를 처리하기 위해 SvelteJS를 사용하고 있습니다; <strong>
                      CSS 사용자 정의 속성</strong>(변수)에 값을 할당하여 
                      효과와 3D 변환을 구동합니다. 
                  
              </p>
          </section>
      </header>
  
  
      {#if query.length < 3}
  
          <h2 id="⚓-common">
              <a href="#⚓-common">
                  Common &amp; Uncommon
              </a>
          </h2>
          <p>
              모든 카드는 커서 위치에 따라 CSS로 3D 회전 효과를 얻습니다.<br /> 기본적인
              비홀로 카드는 단순히 마우스를 따라다니는 <mark>섬광/반사 효과</mark>를 카드에 적용합니다.
          </p>
  
          <CardList>
              {#if isLoading}
                  loading...
              {:else}
                  {#each basics as card, index}
                      <Card
                          id={card.id}
                          name={card.name}
                          img={card.images.large}
                          number={card.number}
                          types={card.types}
                          supertype={card.supertype}
                          subtypes={card.subtypes}
                      />
                  {/each}
              {/if}
          </CardList>
  
          <h2 id="⚓-reverse">
              <a href="#⚓-reverse">
                  Reverse Holo non-rares
              </a>
          </h2>
          <p>
              리버스 홀로 카드는 <mark>다양한 형태와 크기</mark>로 제공됩니다 (트레이너, 1단계, 그리고 다양한 에너지 타입). <br /> 따라서
              여기에 다양한 변형을 보여주는 몇 가지 예시가 있습니다. <mark>배경은 포일과 마스크 레이어</mark>를
              글레어와 함께 사용합니다. 또한 <mark>글레어를 이미지 창에 클리핑</mark>하여 이미지와 홀로포일을 다르게 처리합니다.
          </p>
  
          <CardList>
              {#if isLoading}
                  loading...
              {:else}
                  {#each reverse as card, index}
                      <Card
                          id={card.id}
                          name={card.name}
                          img={card.image}
                          number={card.number}
                          set={card.set}
                          types={card.types}
                          supertype={card.supertype}
                          subtypes={card.subtypes}
                          rarity={card.rarity}
                          isReverse
                      />
                  {/each}
              {/if}
          </CardList>
  
          <h2 id="⚓-holo">
              <a href="#⚓-holo">
                  Holofoil Rare
              </a>
          </h2>
          <p>
              홀로 카드에는 추가적인 <mark>수직 빔 홀로 효과</mark>가 있습니다. <br /> 이는
              <mark>반복되는 그라데이션과 필터</mark>의 조합을 사용하며, <mark>clip-path</mark>로
              각 단계의 홀로 영역을 마스킹합니다. 카드를 회전할 때 홀로 효과가 변하도록 하기 위해
              커서 위치에 따라 각 그라데이션 레이어의 background-position을 설정합니다.
          </p>
  
          <CardList>
              {#if isLoading}
                  loading...
              {:else}
                  {#each holos as card, index}
                      <Card
                          id={card.id}
                          name={card.name}
                          img={card.image}
                          number={card.number}
                          set={card.set}
                          types={card.types}
                          supertype={card.supertype}
                          subtypes={card.subtypes}
                          rarity={card.rarity}
                      />
                  {/each}
              {/if}
          </CardList>
  
          <h2 id="⚓-galaxy">
              <a href="#⚓-galaxy">
                  Galaxy/Cosmos Holofoil
              </a>
          </h2>
          <p>
              홀로포일과 유사하지만, 이것은 특별한 <mark>은하계 효과의 배경 이미지</mark>를 사용하며
              그 위에 <mark>color-dodge와 color-burn으로 설정된 그라데이션 무지개</mark>가 있습니다.
          </p>
          <h3>포켓몬 카드 게임 팬이라면 누구나 좋아할 고전적인 디자인입니다!</h3>
  
          <CardList>
              {#if isLoading}
                  loading...
              {:else}
                  {#each cosmos as card, index}
                      <Card
                          id={card.id}
                          name={card.name}
                          img={card.image}
                          number={card.number}
                          set={card.set}
                          types={card.types}
                          supertype={card.supertype}
                          subtypes={card.subtypes}
                          rarity={card.rarity}
                      />
                  {/each}
              {/if}
          </CardList>
  
          <h2 id="⚓-amazing">
              <a href="#⚓-amazing">
                  Holofoil Amazing Rare
              </a>
          </h2>
          <p>
              어메이징 레어 카드는 프레임을 넘어 확장되는 <mark>매우 독특한 반짝이는 포일</mark>을 가지고 있으며, 일반 홀로 효과보다 훨씬 더 반짝이고 질감이 있습니다. 
          </p>
  
          <CardList>
              {#if isLoading}
                  loading...
              {:else}
                  {#each amazings as card, index}
                      <Card
                          id={card.id}
                          name={card.name}
                          img={card.image}
                          number={card.number}
                          set={card.set}
                          types={card.types}
                          supertype={card.supertype}
                          subtypes={card.subtypes}
                          rarity={card.rarity}
                      />
                  {/each}
              {/if}
          </CardList>
  
          <h2 id="⚓-radiant">
              <a href="#⚓-radiant">
                  Radiant Holofoil
              </a>
          </h2>
          <p>
              시리즈에 새롭게 추가된 홀로포일입니다! <br /> 레디언트 효과는
              <mark>복잡한 수학 없이 모방하기가 매우 어려웠습니다</mark>.
              그래서 카드를 가로질러 움직이는 <mark>교차하는 선형 그라디언트 패턴</mark>으로 대체했습니다.
          </p>
  
          <CardList>
              {#if isLoading}
                  loading...
              {:else}
                  {#each radiant as card, index}
                      <Card
                          id={card.id}
                          name={card.name}
                          img={card.image}
                          number={card.number}
                          set={card.set}
                          types={card.types}
                          supertype={card.supertype}
                          subtypes={card.subtypes}
                          rarity={card.rarity}
                      />
                  {/each}
              {/if}
          </CardList>
  
          <h2 id="⚓-trainer-gallery-holo">
              <a href="#⚓-trainer-gallery-holo">
                  Trainer Gallery Holofoil
              </a>
          </h2>
          <p>
              트레이너 갤러리 홀로포일의 효과는 <mark>일종의 금속성 효과와 무지개빛 광택</mark>을 줍니다. 이는 <mark>큰 색상 닷지 선형 그라디언트</mark>와 커서 위치에 있는 <mark>하드라이트 방사형 그라디언트</mark>를 위에 추가하여 반짝임을 주는 방식으로 구현됩니다.
          </p>
  
          <CardList>
              {#if isLoading}
                  loading...
              {:else}
                  {#each basicGallery as card, index}
                      <Card
                          id={card.id}
                          name={card.name}
                          img={card.image}
                          number={card.number}
                          set={card.set}
                          types={card.types}
                          supertype={card.supertype}
                          subtypes={card.subtypes}
                          rarity={card.rarity}
                      />
                  {/each}
              {/if}
          </CardList>
  
          <h2 id="⚓-v">
              <a href="#⚓-v">
                  Pokemon V
              </a>
          </h2>
          <p>
              V 카드는 <mark>대각선 홀로그래픽 효과</mark>를 가지고 있으며, 카드를 빛에 비춰 기울일 때 반대 방향으로 움직이는 것처럼 보입니다.
          </p>
          <p>
              이 효과는 <mark>여러 배경 그라디언트</mark>로 구현되며, 커서의 x/y 위치에 따라 배경 위치를 변경합니다. 그라디언트는 color-dodge로 설정되어 있고, 미묘한 svg 노이즈 효과도 있습니다.
          </p>
  
          <CardList>
              {#if isLoading}
                  loading...
              {:else}
                  {#each vee as card, index}
                      <Card
                          id={card.id}
                          name={card.name}
                          img={card.image}
                          number={card.number}
                          set={card.set}
                          types={card.types}
                          supertype={card.supertype}
                          subtypes={card.subtypes}
                          rarity={card.rarity}
                      />
                  {/each}
              {/if}
          </CardList>
  
          <h2 id="⚓-v-full-art">
              <a href="#⚓-v-full-art">
                  Pokemon V <sup>(Full Art)</sup>
              </a>
          </h2>
          <p>
              포켓몬 V 효과와 유사하게, 풀 아트 카드는 <mark>대각선 그라디언트를 사용</mark>하지만, 특정 각도에서 볼 때 <mark>추가적인 텍스처</mark>가 있습니다. 이는 <mark>제외 필터가 적용된 추가 배경 이미지</mark>로 구현됩니다. 또한 효과가 더 선명하여 금속성 외관을 더해줍니다.
          </p>
          <p>
              텍스처 효과는 실제와 완전히 동일하지 않습니다. 실제 카드는 각각 아트워크를 따라 고유한 패턴을 가지고 있기 때문입니다.
          </p>
  
          <CardList>
              {#if isLoading}
                  loading...
              {:else}
                  {#each veeUltra as card, index}
                      <Card
                          id={card.id}
                          name={card.name}
                          img={card.image}
                          number={card.number}
                          set={card.set}
                          types={card.types}
                          supertype={card.supertype}
                          subtypes={card.subtypes}
                          rarity={card.rarity}
                      />
                  {/each}
              {/if}
          </CardList>
  
          <h2 id="⚓-v-alternate-art">
              <a href="#⚓-v-alternate-art">
                  Pokemon V <sup>(Alternate Art)</sup>
              </a>
          </h2>
          <p>
              대체 아트 포켓몬 V 카드는 <mark
                  >사실상 울트라 레어(풀 아트) 카드와 동일한 홀로 효과를 가지고 있습니다</mark
              >. 유일한 차이점은 패턴 텍스처입니다.
          </p>
          <p>하지만 아트워크의 유형으로 인해 효과가 다소 다르게 보입니다.</p>
  
          <CardList>
              {#if isLoading}
                  loading...
              {:else}
                  {#each veeAlt as card, index}
                      <Card
                          id={card.id}
                          name={card.name}
                          img={card.image}
                          number={card.number}
                          set={card.set}
                          types={card.types}
                          supertype={card.supertype}
                          subtypes={card.subtypes}
                          rarity={card.rarity}
                      />
                  {/each}
              {/if}
          </CardList>
  
          <h2 id="⚓-v-max">
              <a href="#⚓-v-max">
                  VMax
              </a>
          </h2>
          <p>
              포켓몬 VMax의 그라디언트 효과는 더 미묘합니다. <mark
                  >더 큰 배경 그라디언트</mark
              >를
              사용하여 더 천천히 움직입니다. 하지만 <mark>텍스처 효과는 더 두드러집니다</mark>.
          </p>
  
          <CardList>
              {#if isLoading}
                  loading...
              {:else}
                  {#each veeMax as card, index}
                      <Card
                          id={card.id}
                          name={card.name}
                          img={card.image}
                          number={card.number}
                          set={card.set}
                          types={card.types}
                          supertype={card.supertype}
                          subtypes={card.subtypes}
                          rarity={card.rarity}
                      />
                  {/each}
              {/if}
          </CardList>
  
          <h2 id="⚓-v-max-alternate">
              <a href="#⚓-v-max-alternate">
                  VMax <sup>(Alternate/Rainbow)</sup>
              </a>
          </h2>
          <p>
              일부 VMax 카드는 <mark>전체 또는 대체 아트워크</mark>를 보여줍니다. 이들은
              <mark>"레인보우 레어"로 분류되며</mark>
              레인보우 카드와 유사한 효과를 가집니다. 이는 매우
              <mark>생동감 있고 반짝이는 오버레이</mark>입니다.
          </p>
          <p>
              이는 <mark>반짝이/스파클의 배경 이미지</mark>와 텍스처 패턴
              배경 이미지를 사용하여 구현되며, 일반적인 선형 그라데이션을 샌드위치 형태로 배치합니다.
          </p>
  
          <CardList>
              {#if isLoading}
                  loading...
              {:else}
                  {#each veeMaxAlt as card, index}
                      <Card
                          id={card.id}
                          name={card.name}
                          img={card.image}
                          number={card.number}
                          set={card.set}
                          types={card.types}
                          supertype={card.supertype}
                          subtypes={card.subtypes}
                          rarity={card.rarity}
                      />
                  {/each}
              {/if}
          </CardList>
  
          <h2 id="⚓-v-star">
              <a href="#⚓-v-star">
                  VStar
              </a>
          </h2>
          <p>
              다시 <mark>대각선 그라데이션이 텍스처 위에 겹쳐진</mark> 형태로, VStar 카드는
              <mark>울트라 레어(풀 아트/얼터너티브 아트) 카드와 매우 유사합니다</mark>.
              하지만 이 카드들은 일반적으로 <mark>파스텔 색조로 더 밝게</mark> 표현되어 있어,
              그라데이션과 텍스처가 더 미묘하게 나타납니다.
          </p>
  
          <CardList>
              {#if isLoading}
                  loading...
              {:else}
                  {#each veeStar as card, index}
                      <Card
                          id={card.id}
                          name={card.name}
                          img={card.image}
                          number={card.number}
                          set={card.set}
                          types={card.types}
                          supertype={card.supertype}
                          subtypes={card.subtypes}
                          rarity={card.rarity}
                      />
                  {/each}
              {/if}
          </CardList>
  
          <h2 id="⚓-trainer-full-art">
              <a href="#⚓-trainer-full-art">
                  Trainer Holo <sup>(Full Art / Trainer Gallery)</sup>
              </a>
          </h2>
          <p>
              다시 <mark>대각선 그라데이션이 텍스처 위에 겹쳐진</mark> 형태로, VStar 카드는
              <mark>울트라 레어(풀 아트/얼터너티브 아트) 카드와 매우 유사합니다</mark>.
              하지만 이 카드들은 일반적으로 <mark>파스텔 색조로 더 밝게</mark> 표현되어 있어,
              그라데이션과 텍스처가 더 미묘하게 나타납니다.
          </p>
  
          <CardList>
              {#if isLoading}
                  loading...
              {:else}
                  {#each trainerHolo as card, index}
                      <Card
                          id={card.id}
                          name={card.name}
                          img={card.image}
                          number={card.number}
                          set={card.set}
                          types={card.types}
                          supertype={card.supertype}
                          subtypes={card.subtypes}
                          rarity={card.rarity}
                      />
                  {/each}
              {/if}
          </CardList>
  
          <h2 id="⚓-rainbow-rare">
              <a href="#⚓-rainbow-rare">
                  Rainbow Rare <sup>(VMax, VStar)</sup>
              </a>
          </h2>
          <p>
              레인보우 레어는 <mark>파스텔 그라데이션 위에 매우 반짝이는 효과</mark>를 가지고 있습니다. 이는
              반짝이/스파클 배경 이미지와 파스텔 그라데이션을 위한
              <mark>컬러번/하드라이트 배경 블렌드</mark>를 사용하여 구현됩니다.
          </p>
  
          <CardList>
              {#if isLoading}
                  loading...
              {:else}
                  {#each rainbow as card, index}
                      <Card
                          id={card.id}
                          name={card.name}
                          img={card.image}
                          number={card.number}
                          set={card.set}
                          types={card.types}
                          supertype={card.supertype}
                          subtypes={card.subtypes}
                          rarity={card.rarity}
                      />
                  {/each}
              {/if}
          </CardList>
  
          <h2 id="⚓-secret-rare">
              <a href="#⚓-secret-rare">
                  Secret Rare <sup>(Gold)</sup>
              </a>
          </h2>
          <p>
              <mark>골드!</mark> 여기서는 오버레이 효과로 두 개의 반짝이는 레이어를 서로 겹쳐 적용하고
          <mark>두 레이어를 반대 방향으로 슬라이드</mark>합니다. 또한 <mark>포일 이미지를 그라데이션으로 마스킹</mark>하여
          포일과 반짝이는 레이어가 서로 배타적이 되도록 합니다. 그 결과로 반짝이는 글리터 효과가 나타납니다!
          </p>
  
          <CardList>
              {#if isLoading}
                  loading...
              {:else}
                  {#each gold as card, index}
                      <Card
                          id={card.id}
                          name={card.name}
                          img={card.image}
                          number={card.number}
                          set={card.set}
                          types={card.types}
                          supertype={card.supertype}
                          subtypes={card.subtypes}
                          rarity={card.rarity}
                      />
                  {/each}
              {/if}
          </CardList>
  
          <h2 id="⚓-trainer-gallery-v">
              <a href="#⚓-trainer-gallery-v">
                  Trainer Gallery <sup>(V / VMax)</sup>
              </a>
          </h2>
          <p>
              트레이너 갤러리의 V와 VMax 카드는 일반적으로 일반 V와 VMax 카드와 매우 유사합니다. 
              따라서 여기서는 값을 약간 조정하고 다른 배경 텍스처를 추가했습니다.
          </p>
  
          <CardList>
              {#if isLoading}
                  loading...
              {:else}
                  {#each veeGallery as card, index}
                      <Card
                          id={card.id}
                          name={card.name}
                          img={card.image}
                          number={card.number}
                          set={card.set}
                          types={card.types}
                          supertype={card.supertype}
                          subtypes={card.subtypes}
                          rarity={card.rarity}
                      />
                  {/each}
              {/if}
          </CardList>
  
          <h2 id="⚓-shiny-vault">
              <a href="#⚓-shiny-vault">
                  Shiny Vault <sup>(Basic / Stage 1 / V / VMax)</sup>
              </a>
          </h2>
          <p>
              샤이니 볼트 카드는 포일 배경이 반짝이는 은색인 독특한 효과를 가지고 있습니다.
              이를 구현하기 위해 포일 이미지에 방사형 그라데이션을 적용하여 배경 위의 포일을 어둡게 만듭니다.
              이는 흰색 카드 배경 위에 은색 효과를 약간 만들어냅니다.
              이 효과는 Firefox에서 가장 잘 작동합니다.
          </p>
  
          <CardList>
              {#if isLoading}
                  loading...
              {:else}
                  {#each shinyVault as card, index}
                      <Card
                          id={card.id}
                          name={card.name}
                          img={card.image}
                          number={card.number}
                          set={card.set}
                          types={card.types}
                          supertype={card.supertype}
                          subtypes={card.subtypes}
                          rarity={card.rarity}
                      />
                  {/each}
              {/if}
          </CardList>
  
      {/if}
  </main>
  
  <div class="back-to-top">
    <a href="#⚓-top">Back to Top</a>
  </div>
  
  <style>
    .back-to-top a {
      color: inherit;
      text-decoration: none;
          z-index: 999;
    }
  </style>
  