let coins = 0;
let energy = 1000;
let level = 1;
let coinsPerTap = 1;
let userId = 0;
let refCode = 0;

const tg = Telegram.WebApp;
tg.ready();

const urlParams = new URLSearchParams(window.location.search);
const refFromStart = urlParams.get('start'); // রেফারেল আইডি

if (tg.initDataUnsafe.user) {
  userId = tg.initDataUnsafe.user.id;
  document.getElementById('username').textContent = tg.initDataUnsafe.user.first_name;
  refCode = userId;
  document.getElementById('refCode').textContent = userId;
}

// লোড ডেটা
if (localStorage.getItem('takatap_' + userId)) {
  const data = JSON.parse(localStorage.getItem('takatap_' + userId));
  coins = data.coins || 0;
  energy = data.energy || 1000;
  level = data.level || 1;
  coinsPerTap = level;
}

// রেফারেল বোনাস (যদি রেফারেল লিংক থেকে আসে)
if (refFromStart && refFromStart != userId) {
  coins += 500; // নতুন ইউজারকে ৫০০
  // রেফারারকে পরে ১০% দিবে (ব্যাকএন্ডে)
  alert("রেফারেল বোনাস! +৫০০৳ পেয়েছেন 🎉");
}

function updateDisplay() {
  document.getElementById('coins').textContent = coins.toLocaleString();
  document.getElementById('energy').textContent = energy;
  document.getElementById('level').textContent = level;
  document.getElementById('perTap').textContent = coinsPerTap;
}

// চ্যানেল ভেরিফাই চেক
async function checkMembership() {
  try {
    const response = await fetch(`https://api.telegram.org/bot7964136906:AAEfh7dxAD4Jd08GDFVWzs9q1_kx667fgyA/getChatMember?chat_id=@TakaTapBD_Channel&user_id=${userId}`);
    const data = await response.json();

    if (data.ok && (data.result.status === "member" || data.result.status === "administrator" || data.result.status === "creator")) {
      // সফল – গেম ওপেন করো
      document.getElementById('verifyScreen').classList.add('hidden');
      document.getElementById('gameScreen').classList.remove('hidden');
      updateDisplay();
      startGame();
    } else {
      alert("আপনি এখনো চ্যানেলে জয়েন করেননি!\nজয়েন হয়ে আবার ভেরিফাই করুন।");
    }
  } catch (err) {
    alert("ভেরিফাই করতে সমস্যা হচ্ছে। আবার চেষ্টা করুন।");
  }
}

function startGame() {
  document.getElementById('coin').addEventListener('click', (e) => {
    if (energy > 0) {
      coins += coinsPerTap;
      energy -= 1;
      updateDisplay();
      saveData();

      // পপ আপ
      const popup = document.createElement('div');
      popup.textContent = '+' + coinsPerTap + '৳';
      popup.style.position = 'absolute';
      popup.style.left = (e.touches ? e.touches[0].clientX : e.clientX) - 30 + 'px';
      popup.style.top = (e.touches ? e.touches[0].clientY : e.clientY) - 80 + 'px';
      popup.style.color = '#ffeb3b';
      popup.style.fontSize = '36px';
      popup.style.fontWeight = 'bold';
      popup.style.pointerEvents = 'none';
      popup.style.animation = 'floatup 1s forwards';
      document.body.appendChild(popup);
      setTimeout(() => popup.remove(), 1000);

      // লেভেল আপ
      if (coins >= level * 4000) {
        level++;
        coinsPerTap = level;
        updateDisplay();
        tg.HapticFeedback.notificationOccurred('success');
        alert(`লেভেল \( {level} 🎉 প্রতি ট্যাপে \){level} টাকা!`);
      }
    }
  });

  // এনার্জি রিচার্জ
  setInterval(() => {
    if (energy < 1000) {
      energy += 2;
      if (energy > 1000) energy = 1000;
      document.getElementById('energy').textContent = energy;
    }
  }, 1000);

  // অ্যানিমেশন
  const style = document.createElement('style');
  style.innerHTML = `@keyframes floatup { to { transform: translateY(-120px); opacity: 0; } }`;
  document.head.appendChild(style);
}

function saveData() {
  localStorage.setItem('takatap_' + userId, JSON.stringify({coins, energy, level}));
}

function withdraw(method) {
  if (coins < 50) return alert("মিনিমাম ৫০ টাকা লাগবে!");
  const num = prompt(`তোমার ${method.toUpperCase()} নম্বর দাও (01xxxxxxxxx):`);
  if (num && num.length === 11) {
    tg.openTelegramLink(`https://t.me/TakaTap_PaymentBD?text=উইথড্র%20রিকোয়েস্ট%0Aইউজার:%20\( {tg.initDataUnsafe.user.first_name}%0Aনম্বর:%20 \){num}%0Aমেথড:%20\( {method.toUpperCase()}%0Aপরিমাণ:%20 \){coins}%20টাকা`);
    alert("রিকোয়েস্ট পাঠানো হয়েছে! ১২-২৪ ঘণ্টায় টাকা পাবেন 🚀");
  }
}
