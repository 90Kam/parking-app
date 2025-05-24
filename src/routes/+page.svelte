<script>
  import { onMount } from 'svelte';  
  import { supabase } from '$lib/supabaseClient';

  let parking = [];

  async function loadParking() {
    const { data, error } = await supabase.from('parking_spots').select();
    if (error) {
      alert('Błąd ładowania danych');
      console.error(error);
      return;
    }
    parking = data;
  }


  onMount(async () => {
    await loadParking();
    supabase
      .channel('parking_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_spots' }, loadParking)
      .subscribe();
  });


  async function toggleSpot(spot) {
    if (spot.name) {
      if (confirm(`Czy chcesz zwolnić miejsce zajmowane przez ${spot.name}?`)) {
        const { error } = await supabase
          .from('parking_spots')
          .update({ name: null })
          .eq('id', spot.id);
        if (error) {
          alert('Błąd zwalniania miejsca');
          console.error(error);
          return;
        }
      }
    } else {
      const name = prompt('Podaj imię, aby zająć miejsce:');
      if (!name) return;
      const { error } = await supabase
        .from('parking_spots')
        .update({ name })
        .eq('id', spot.id);
      if (error) {
        alert('Błąd zajmowania miejsca');
        console.error(error);
        return;
      }
    }
    await loadParking(); 
  }
</script>


<style>
  .parking-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr) 10px;
    grid-template-rows: repeat(5, 60px);
    gap: 8px;
    max-width: 360px;
  }
  .spot-button {
    padding: 12px;
    border: none;
    border-radius: 6px;
    color: white;
    font-weight: bold;
    cursor: pointer;
  }
  .free {
    background-color: green;
  }
  .taken {
    background-color: red;
  }
  .wall {
    background-color: gray;
    width: 10px;
    height: 100%;
    border-radius: 6px;
  }
</style>

<h1>KTO MNIE ZASTAWIA</h1>

<div class="parking-grid">
  {#each Array(5) as _, rowIndex}
    {#each Array(2) as _, colIndex}
      <button
        class="spot-button {parking.find(s => s.row === rowIndex && s.col === colIndex && s.name) ? 'taken' : 'free'}"
        on:click={() => {
          const spot = parking.find(s => s.row === rowIndex && s.col === colIndex);
          if (spot) toggleSpot(spot);
        }}
        aria-label={() => {
          const spot = parking.find(s => s.row === rowIndex && s.col === colIndex);
          return spot && spot.name
            ? `Zajęte miejsce przez ${spot.name}`
            : 'Wolne miejsce';
        }}
        type="button"
      >
        {#if parking.find(s => s.row === rowIndex && s.col === colIndex)}
          {parking.find(s => s.row === rowIndex && s.col === colIndex).name || 'Wolne'}
        {:else}
          Brak miejsca
        {/if}
      </button>
    {/each}
    <div class="wall"></div>
  {/each}
</div>