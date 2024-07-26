document.addEventListener('DOMContentLoaded', function () {
  // Inicializar Supabase
  const phoneNumber = '573224192236';
  const supabaseUrl = 'https://jroeefimocvrxxptnske.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyb2VlZmltb2N2cnh4cHRuc2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjA1NzgzMTMsImV4cCI6MjAzNjE1NDMxM30.JplSWY3j2_9JKBNGnJOAbcXJqjLNl9ms7bGdgwR57_U';
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  document.getElementById('accept-invitation').addEventListener('click', function () {
    document.querySelector('.event-info').style.display = 'none';
    document.querySelector('.gift-selection').style.display = 'block';
    loadGifts();
  });

  document.getElementById('decline-invitation').addEventListener('click', () => {
    const message = 'Hola Lau, no podré asistir porque';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.location.href = whatsappUrl;
  });

  let selectedGifts = [];

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
                <button class="btn btn-primary gift-select-btn" data-id="${gift.id}">Seleccionar</button>
            </div>
        </div>
      `;
      giftItem.querySelector('button').addEventListener('click', (e) => toggleGiftSelection(e.target, gift.id, gift.name));
      giftList.appendChild(giftItem);
    });
  }

  function toggleGiftSelection(button, id, name) {
    const giftIndex = selectedGifts.findIndex(gift => gift.id === id);
    if (giftIndex > -1) {
      selectedGifts.splice(giftIndex, 1);
      button.textContent = 'Seleccionar';
      button.classList.remove('btn-success');
      button.classList.add('btn-primary');
    } else {
      selectedGifts.push({ id, name });
      button.textContent = 'Seleccionado';
      button.classList.remove('btn-primary');
      button.classList.add('btn-success');
    }
    console.log("Regalos seleccionados: ", selectedGifts);
  }

  document.getElementById('confirm-selection').addEventListener('click', async function () {
    if (selectedGifts.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: 'Por favor, selecciona al menos un regalo antes de confirmar.',
      });
      return;
    }

    const updates = selectedGifts.map(gift => {
      return supabase
        .from('gifts')
        .update({ available: false })
        .eq('id', gift.id);
    });

    try {
      await Promise.all(updates);
      console.log("Regalos actualizados en la base de datos");

      const message = `Hola Lau, confirmo mi asistencia al evento.`;
      const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      
      Swal.fire({
        icon: 'success',
        title: '¡Selección confirmada!',
        text: 'Serás redirigido a WhatsApp para confirmar tu asistencia.',
        showConfirmButton: false,
        timer: 2000
      }).then(() => {
        window.location.href = url;
      });
    } catch (error) {
      console.error('Error updating gifts:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al actualizar los regalos. Por favor, intenta de nuevo.',
      });
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
