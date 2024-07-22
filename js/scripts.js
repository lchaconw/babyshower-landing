document.addEventListener('DOMContentLoaded', function () {
  // Inicializar Supabase
  const supabaseUrl = 'https://jroeefimocvrxxptnske.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyb2VlZmltb2N2cnh4cHRuc2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjA1NzgzMTMsImV4cCI6MjAzNjE1NDMxM30.JplSWY3j2_9JKBNGnJOAbcXJqjLNl9ms7bGdgwR57_U';
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  document.getElementById('accept-invitation').addEventListener('click', function () {
    document.querySelector('.event-info').style.display = 'none';
    document.querySelector('.gift-selection').style.display = 'block';
    loadGifts();
  });

  let selectedGift = null;

  async function loadGifts() {
    console.log("Cargando regalos...");
    const { data: gifts, error } = await supabase
      .from('gifts')
      .select('*')
      .eq('available', true);

    console.log("Regalos: ", gifts);
    if (error) {
      console.error('Error fetching gifts:', error);
      return;
    }

    if (gifts.length === 0) {
      console.log("No hay regalos disponibles");
      document.getElementById('gift-list').innerHTML = '<p>No hay regalos disponibles</p>';
      return;
    }

    const giftList = document.getElementById('gift-list');
    giftList.innerHTML = '';

    gifts.forEach(gift => {
      const giftItem = document.createElement('div');
      giftItem.className = 'col-md-4 mb-4';
      giftItem.innerHTML = `
            <div class="card h-100">
                <img src="${gift.image}" class="card-img-top" alt="${gift.name}">
                <div class="card-body text-center">
                    <h5 class="card-title">${gift.name}</h5>
                    <button class="btn btn-primary">Seleccionar</button>
                </div>
            </div>
        `;
      giftItem.querySelector('button').addEventListener('click', () => selectGift(gift.id, gift.name));
      giftList.appendChild(giftItem);
    });
  }

  async function selectGift(id, name) {
    selectedGift = { id, name };

    // Actualizar la disponibilidad del regalo en la base de datos
    const { data, error } = await supabase
      .from('gifts')
      .update({ available: false })
      .eq('id', id);

    console.log("Actualizo: ", data);

    if (error) {
      console.error('Error updating gift:', error);
      return;
    }

    document.querySelector('.gift-selection').style.display = 'none';
    document.querySelector('.confirmation').style.display = 'block';
    document.getElementById('selected-gift').innerText = `Has seleccionado: ${name}`;
  }

  document.getElementById('confirm-selection').addEventListener('click', function () {
    if (selectedGift) {
      const message = `Confirmo mi asistencia al evento. He seleccionado el regalo: ${selectedGift.name}.`;
      const url = `https://wa.me/573224192236?text=${encodeURIComponent(message)}`;
      window.location.href = url;
    }
  });

  // Countdown Timer
  const countdownDate = new Date("August 4, 2024 15:00:00").getTime();

  const countdownFunction = setInterval(() => {
    const now = new Date().getTime();
    const distance = countdownDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = days;
    document.getElementById('hours').innerText = hours;
    document.getElementById('minutes').innerText = minutes;
    document.getElementById('seconds').innerText = seconds;

    if (distance < 0) {
      clearInterval(countdownFunction);
      document.getElementById('days').innerText = 0;
      document.getElementById('hours').innerText = 0;
      document.getElementById('minutes').innerText = 0;
      document.getElementById('seconds').innerText = 0;
    }
  }, 1000);
});
