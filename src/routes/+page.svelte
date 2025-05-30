<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';

  // Logika parkingowa
  let parking = [];
  let deferredPrompt;
  let showInstallButton = false;
  let isIOS = false;
  let isFirefox = false;
  let isRunningAsPWA = false;

  async function loadParking() {
    const { data, error } = await supabase.from('parking_spots').select();
    if (error) {
      alert('Błąd ładowania danych');
      console.error(error);
      return;
    }
    parking = data;
  }

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

  // Logika instalacji PWA
  onMount(() => {
    loadParking();

    // Detekcja środowiska
    isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    isFirefox = navigator.userAgent.includes('Firefox');
    isRunningAsPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    // Chrome/Edge - nasłuchuj zdarzenia instalacji
    if (!isIOS && !isFirefox && !isRunningAsPWA) {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallButton = true;
      });
    } else if (!isRunningAsPWA) {
      // Firefox/iOS - pokaż przycisk z instrukcją
      showInstallButton = true;
    }

    // Nasłuchuj instalacji
    window.addEventListener('appinstalled', () => {
      isRunningAsPWA = true;
      showInstallButton = false;
    });
  });

  async function installPWA() {
    // Chrome/Edge
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        isRunningAsPWA = true;
        showInstallButton = false;
      }
      return;
    }

    // Instrukcje dla innych przeglądarek
    const instructions = isIOS
      ? '1. Kliknij ikonę "Udostępnij" (kwadrat ze strzałką)\n2. Wybierz "Dodaj do ekranu głównego"'
      : 'Otwórz menu przeglądarki (trzy kropki → "Zainstaluj")';
    
    alert(`Aby zainstalować aplikację:\n\n${instructions}`);
  }
</script>

<style>
  .parking-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr) 10px;
    grid-template-rows: repeat(5, 60px);
    gap: 8px;
    max-width: 360px;
    margin: 0 auto;
  }
  .spot-button {
    padding: 12px;
    border: none;
    border-radius: 6px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.2s;
  }
  .spot-button:active {
    transform: scale(0.98);
  }
  .free { background-color: #4CAF50; }
  .taken { background-color: #f44336; }
  .wall {
    background-color: #757575;
    width: 10px;
    height: 100%;
    border-radius: 6px;
  }
  .install-btn {
    display: block;
    margin: 20px auto;
    padding: 12px 24px;
    background: #FF9800;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }
  .install-btn:active {
    transform: scale(0.98);
  }
  h1 {
    text-align: center;
    color: #333;
    margin-bottom: 10px;
  }
</style>

<h1>KTO MNIE ZASTAWIA</h1>

{#if !isRunningAsPWA && showInstallButton}
  <button on:click={installPWA} class="install-btn">
    {isIOS || isFirefox ? 'Jak zainstalować aplikację?' : 'Zainstaluj aplikację'}
  </button>
{/if}

<div class="parking-grid">
  {#each Array(5) as _, rowIndex}
    {#each Array(2) as _, colIndex}
      <button
        class="spot-button {parking.find(s => s.row === rowIndex && s.col === colIndex && s.name) ? 'taken' : 'free'}"
        on:click={() => {
          const spot = parking.find(s => s.row === rowIndex && s.col === colIndex);
          if (spot) toggleSpot(spot);
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