<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'

  interface Letter {
    char: string,
    class?: string,
    active: boolean
  }

  const router = useRouter();
  const letters = ref<Letter[]>([
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
        ].map(i => ({ ...i, active: false})));

  onMounted(() => {
    const sequence: string[] = [
      'one','two','three','four','five','six','seven',
      'eight','nine','ten','eleven','twelve','thirteen',
      'fourteen','fifteen'
    ];

    let delay: number = 1500;
    sequence.forEach((cls: string): void => {
      setTimeout((): void => {
        const item = letters.value.find(l => l.class === cls);
        if (item) item.active = true;
      }, delay);
      delay += 500;
    });
  });
</script>

<template>
  <main class="min-h-screen flex items-start justify-center bg-gray-800 text-slate-200">

    <div id="wrap" class="w-[80%] max-w-350 mt-[8%] relative flex flex-col gap-10 items-start md:flex-row">

      <div id="wordsearch" class="w-full md:w-[45%] md:max-h-[60vh]">
        <ul class="p-0 m-0">
          <li v-for="(l,i) in letters" class="float-left w-[12%] leading-[clamp(1rem,4vw,50px)] m-[0.75%] bg-black/25 text-center text-[1.5vw] font-light text-slate-100 transition-all duration-750" :key="i"
              :class="[l.class, l.active && 'bg-emerald-500/70 text-slate-100 font-normal']">{{ l.char }}</li>
        </ul>
      </div>

      <section
        id="main-content"
        class="w-full md:max-w-[45%] text-slate-200 md:self-center text-xl leading-7">

        <h1 class="text-4xl font-normal mb-10">
            Sorry, we couldn't find what you were looking for.
        </h1>

        <p>
          Unfortunately the page you were looking for could not be found.
          It may be temporarily unavailable, moved or no longer exist.
        </p>

        <div id="navigation" class="mt-12 flex justify-center flex-wrap gap-6">
          <button @click="router.push('/')" class="bg-black/25 py-0 px-2 h-10.25 leading-10.25 transition-all duration-300 hover:bg-emerald-500/70">Home</button>
          <button @click="router.back()" class="bg-black/25 py-0 px-2 h-10.25 leading-10.25 transition-all duration-300 hover:bg-emerald-500/70">Back</button>
        </div>

      </section>
    </div>
  </main>
</template>