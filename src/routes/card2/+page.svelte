<script>
    import { onMount } from "svelte";
    import { flip } from 'svelte/animate';
    import { cubicOut } from 'svelte/easing';
  
    import CardList from "$lib/components/Cards_5c.svelte";
    import Card from "$lib/components/CardProxy2.svelte";
    import cardsData from '$data/cards2.json';

    let query = "";
    let isLoading = true;
    let isRotated = false;
    let selectedCardStyle = "showcase";

    let cardCategories = [
        'showcase', 'basics', 'reverse', 'holos', 'cosmos', 'amazings', 'radiant', 'basicGallery',
        'vee', 'veeUltra', 'veeAlt', 'veeMax', 'veeMaxAlt', 'veeStar',
        'trainerHolo', 'rainbow', 'gold', 'veeGallery', 'shinyVault'
    ];

    const cardStyles = {
        showcase: [],
        basics: [],
        reverse: [],
        holos: [],
        cosmos: [],
        amazings: [],
        radiant: [],
        basicGallery: [],
        vee: [],
        veeUltra: [],
        veeAlt: [],
        veeMax: [],
        veeMaxAlt: [],
        veeStar: [],
        trainerHolo: [],
        rainbow: [],
        gold: [],
        veeGallery: [],
        shinyVault: []
    };
    let cardlist = {};

    const getCards = async () => {
        let cards = cardsData;
        return cards;
    };

    const loadCards = async() => {
        return getCards()
            .then((cards) => {
                window.cards = cards; 
                cardlist = cards.slice(0, 10);
                cardlist = cardlist.map(card => ({
                    ...card,
                    subtypes: [selectedCardStyle],
                    set: "swsh12pt5",
                    number: "160",
                    rarity: "Rare Secret",
                }));
                console.log('loadCards cardlist:', cardlist);
                isLoading = false;
            });
    };

    let rotationDegree = 360;

    const handleRotationChange = (event) => {
        rotationDegree = parseInt(event.target.value);
    };

    const rotateCards = () => {
        document.querySelectorAll('.card').forEach(card => {
            card.style.transform = `rotateY(${rotationDegree}deg)`;
            card.style.transition = `transform 2s ease`;
        });
    };

    const shuffleCards = () => {
        cardlist = [...cardlist].sort(() => Math.random() - 0.5);
    };

    const changeCardStyle = (event) => {
        // 선택된 카드 스타일을 업데이트합니다.
        selectedCardStyle = event.target.value;

        // 주의: eval() 사용은 권장되지 않습니다. 
        // 더 안전한 방법으로는 객체를 사용하여 카드 스타일을 매핑하는 것이 좋습니다.
        // 예: const cardStyles = { basics: basics, reverse: reverse, ... };
        //cardlist = cardStyles[selectedCardStyle] || cardlist;
    };

    const applyCardStyle = () => {
        isLoading = true;
        cardlist = cardlist.map(card => ({
            ...card,
            subtypes: [selectedCardStyle]
        }));
        setTimeout(() => {
            isLoading = false;
        }, 500);

        console.log('현재 cardlist:', cardlist);
        console.log('선택된 카드 스타일:', selectedCardStyle);
    };

    onMount(() => {
        loadCards(); // 카드 데이터를 로드합니다.
    });
</script>

<main>
    <header>
        <h1 id="⚓-top">KBO 야구카드 <sup>Beta V0.1</sup></h1>
    </header>
  
    <section>
    <div class="button-container">
        <div class="button-group">
            <div class="button-dropdown-container">
                <button class="modern-button" on:click={rotateCards}>회전</button>
                <select class="modern-dropdown" on:change={handleRotationChange}>
                    <option value="360">1바퀴 (360°)</option>
                    <option value="720">2바퀴 (720°)</option>
                    <option value="1080">3바퀴 (1080°)</option>
                    <option value="1440">4바퀴 (1440°)</option>
                </select>
            </div>
        </div>
        <div class="button-group">
            <button class="modern-button" on:click={shuffleCards}>셔플</button>
        </div>
        <div class="button-group">
            <button class="modern-button" on:click={applyCardStyle}>스타일 적용</button>
            <select class="modern-dropdown" on:change={changeCardStyle}>
                {#each cardCategories as category}
                    <option value={category}>{category}</option>
                {/each}
            </select>
        </div>
    </div>
    </section>
    {#if query.length < 3}
        <CardList>
            {#if isLoading}
                loading...
            {:else}
                {#each cardlist as card, index (card.id)}
                    <div class="card-wrapper" animate:flip={{ duration: 500, easing: cubicOut }}>
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
                    </div>
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

  .button-container {
      display: flex;
      justify-content: space-around;
      margin: 10px 0;
  }

  .modern-button {
      background-color: #a3d0f5;
      color: #333;
      border: none;
      padding: 10px 20px;
      font-size: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      cursor: pointer;
  }

  .modern-button:hover {
      background-color: #86c1f2;
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }

  .modern-button:active {
      background-color: #5c5c5c;
      color: #ffffff;
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .card-wrapper {
      transition: transform 0.6s, opacity 0.6s; /* 변형과 불투명도에 0.6초의 전환 시간을 적용합니다 */
      transform-style: preserve-3d; /* 3D 변환 스타일을 유지합니다 */
  }

  /* 
  이 CSS 클래스는 카드 래퍼에 적용되며 다음과 같은 기능을 합니다:
  1. 변형(transform)과 불투명도(opacity) 속성에 대해 부드러운 전환 효과를 제공합니다.
  2. 3D 변환을 위한 환경을 설정하여 카드가 3D 공간에서 회전할 수 있게 합니다.
  이는 카드 뒤집기 애니메이션과 셔플 효과를 구현할 때 유용합니다.
  */

  .modern-dropdown {
      background-color: #a3d0f5;
      color: #333;
      border: none;
      padding: 10px;
      font-size: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      cursor: pointer;
  }

  .modern-dropdown:hover {
      background-color: #86c1f2;
  }

  .button-dropdown-container {
      display: flex;
      align-items: center;
  }

</style>