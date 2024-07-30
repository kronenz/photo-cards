<script>
    import { onMount } from "svelte";
  
    import CardList from "$lib/components/Cards_5c.svelte";
    import Card from "$lib/components/CardProxy.svelte";
    import cardsData from '$data/cards2.json';

      let basics;
  
      let query = "";
      let isLoading = true;
  
      const getCards = async () => {
          let promiseArray = [];
          let cards = cardsData;
          return cards;
      };
  
      const loadCards = async() => {
          return getCards()
              .then((cards) => {
                  window.cards = cards;
                  basics = cards.slice(0, 10);
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
      </header>
  
  
      {#if query.length < 3}
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
  