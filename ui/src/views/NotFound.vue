<script setup lang="ts">
  import { onMounted } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter();

  onMounted(() => {
    const resizeGrid = (): void => {
      const li: HTMLElement | null = document.querySelector<HTMLLIElement>('li');

      if (!li) return;

      const size: string = li.offsetWidth + 'px'
      document.querySelectorAll('li').forEach(el => {
        el.style.height = size
        el.style.lineHeight = size
      });
    }

    resizeGrid();
    window.addEventListener('resize', resizeGrid)

    const sequence: string[] = [
      'one','two','three','four','five','six','seven',
      'eight','nine','ten','eleven','twelve','thirteen',
      'fourteen','fifteen'
    ]

    let delay: number = 1500;
    sequence.forEach(cls => {
      setTimeout(() => {
        document.querySelector(`.${cls}`)?.classList.add('selected')
      }, delay)
      delay += 500
    })
  });
</script>

<template>
  <main class="min-h-screen flex items-start justify-center bg-gray-800 text-slate-200">

    <div id="wrap" class="w-[80%] max-w-350 mt-[8%] relative flex flex-col gap-10 items-start md:flex-row">

      <div id="wordsearch" class="w-full md:w-[45%] md:max-h-[50vh]">
        <ul class="p-0 m-0">
          <li v-for="(l,i) in letters" class="float-left w-[12%] m-[0.5%] bg-black/25 text-center text-[1.5vw] font-light text-slate-100 transition-all duration-750" :key="i"
              :class="l.class">{{ l.char }}</li>
        </ul>
      </div>

      <section
        id="main-content"
        class="w-full md:max-w-[45%] text-slate-200 text-xl leading-7">

        <h1 class="text-4xl font-normal mb-10">
            Sorry, we couldn't find what you were looking for.
        </h1>

        <p>
          Unfortunately the page you were looking for could not be found.
          It may be temporarily unavailable, moved or no longer exist.
        </p>

        <div id="navigation" class="mt-12 flex justify-center flex-wrap gap-6">
          <button @click="router.push('/')" class="nav-btn">Home</button>
          <button @click="router.back()" class="nav-btn">Back</button>
        </div>

      </section>
    </div>
  </main>
</template>

<script lang="ts">
  export default {
    data() {
      return {
        letters: [
          {char:'k'}, {char:'4', class:'one'}, {char:'0', class:'two'},
          {char:'4', class:'three'},{char:'v'}, {char:'z'}, {char:'i'},
          {char:'x'}, {char:'m'}, {char:'e'}, {char:'t'}, {char:'n'},
          {char:'y'}, {char:'l'}, {char:'p', class:'four'}, {char:'a'},
          {char:'a', class:'five'}, {char:'y'}, {char:'g', class:'six'},
          {char:'w'}, {char:'e', class:'seven'}, {char:'v'}, {char:'b'},
          {char:'o'}, {char:'x'}, {char:'c'}, {char:'v'}, {char:'d'},
          {char:'q'}, {char:'y'}, {char:'a'}, {char:'n', class:'eight'},
          {char:'j'}, {char:'a'}, {char:'s'}, {char:'p'}, {char:'x'},
          {char:'e'}, {char:'w'}, {char:'o', class:'nine'}, {char:'v'},
          {char:'e'}, {char:'p'}, {char:'c'}, {char:'f'}, {char:'s'},
          {char:'w'}, {char:'t', class:'ten'}, {char:'q'}, {char:'v'},
          {char:'o'}, {char:'s'}, {char:'m'}, {char:'v'}, {char:'f'},
          {char:'h'}, {char:'q'}, {char:'e'}, {char:'f', class:'eleven'},
          {char:'o', class:'twelve'}, {char:'u', class:'thirteen'},
          {char:'n', class:'fourteen'}, {char:'d', class:'fifteen'},
        ]
      }
    }
  }
</script>

<style scoped>
  #wordsearch ul li.selected{
    background:rgba(26,188,156,0.7);
    color:white;
    font-weight:400;
  }

  .nav-btn{
    background:rgba(0,0,0,0.2);
    padding:0 15px;
    height:41px;
    line-height:41px;
    transition:.3s;
  }
  .nav-btn:hover{
    background:rgba(26,188,156,.7);
  }
</style>
