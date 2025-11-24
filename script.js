lconst tg = window.Telegram.WebApp;
tg.ready();

let balance = 0;
let refCount = 0;
let userId = tg.initDataUnsafe?.user?.id || Date.now();
let username = tg.initDataUnsafe?.user?.username || tg.initDataUnsafe?.user?.first_name || "User";
let refFrom = new URLSearchParams(window.location.search).get("start");
const BOT_TOKEN = "7964136906:AAEfh7dxAD4Jd08GDFVWzs9q1_kx667fgyA";

// DOM লোড হলে চালাও
document.addEventListener('DOMContentLoaded', function() {
  // লোড সেভড ডেটা
  const saved = localStorage.getItem("takatap_" + userId);
  if (saved) {
    const data = JSON.parse(saved);
    balance = data.balance || 0;
    refCount = data.refCount || 0;
  }

  // রেফারেল বোনাস
  if (refFrom && refFrom != userId && !localStorage.getItem("ref_awarded_" + userId)) {
    balance += 50;
    refCount += 1;
    localStorage.setItem("ref_awarded_" + userId, "true");
    alert("রেফারেল বোনাস! +৫০ পয়েন্ট পেয়েছেন 🎉");
  }

  updateBalance();
  updateAdCounter();
  verifyChannel();
});

// সব ফাংশন
function updateBalance() {
  const balEl = document.getElementById("balance");
  const wbalEl = document.getElementById("wbalance");
  const refEl = document.getElementById("refCount");
  const bonusEl = document.getElementById("refBonus");
  if (balEl) balEl.textContent = balance.toLocaleString();
  if (wbalEl) wbalEl.textContent = balance.toLocaleString();
  if (refEl) refEl.textContent = refCount;
  if (bonusEl) bonusEl.textContent = (refCount * 50).toLocaleString();
  localStorage.setItem("takatap_" + userId, JSON.stringify({ balance, refCount }));
}

function shareRef() {
  const link = `https://t.me/TakaTapBD_bot?start=${userId}`;
  tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent("TakaTap BD – এড + টাস্ক করে পয়েন্ট আর্ন করুন!\n\nশুরু করুন: " + link)}`);
}

function openTab(tabId) {
  document.querySelectorAll(".content").forEach(t => t.classList.add("hidden"));
  const targetTab = document.getElementById(tabId);
  if (targetTab) targetTab.classList.remove("hidden");
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  if (event && event.target) event.target.classList.add("active");
}

// এড কাউন্টার
function updateAdCounter() {
  const today = new Date().toDateString();
  const savedDate = localStorage.getItem("ad_date_" + userId);
  let count = 0;
  if (savedDate === today) {
    count = parseInt(localStorage.getItem("ad_count_" + userId) || "0");
  } else {
    localStorage.setItem("ad_date_" + userId, today);
    localStorage.setItem("ad_count_" + userId, "0");
  }
  const adCountEl = document.getElementById("adCount");
  const adBtn = document.getElementById("showAdBtn");
  if (adCountEl) adCountEl.textContent = count + " / 10";
  if (adBtn) {
    if (count >= 10) {
      adBtn.disabled = true;
      adBtn.textContent = "আজকের লিমিট শেষ";
    } else {
      adBtn.disabled = false;
      adBtn.textContent = "এড দেখুন (+১০ পয়েন্ট)";
    }
  }
}

// নতুন এড সিস্টেম – SDK চেক + ফলব্যাক
let countdownInterval = null;
function showAd() {
  const btn = document.getElementById("showAdBtn");
  if (!btn || btn.disabled) return;

  // SDK চেক
  if (window.show_10232544) {
    window.show_10232544();
  } else {
    // ফলব্যাক: সিম্পল অ্যালার্ট বা লোডিং
    alert("এড লোড হচ্ছে... ৩০ সেকেন্ড দেখুন।");
  }

  btn.disabled = true;
  btn.textContent = "এড দেখছে... ৩০";

  let seconds = 30;
  countdownInterval = setInterval(() => {
    seconds--;
    btn.textContent = `এড দেখছে... ${seconds}`;
    if (seconds <= 0) {
      clearInterval(countdownInterval);
      balance += 10;
      updateBalance();

      let count = parseInt(localStorage.getItem("ad_count_" + userId) || "0") + 1;
      localStorage.setItem("ad_count_" + userId, count);
      updateAdCounter();

      btn.textContent = "এড দেখুন (+১০ পয়েন্ট)";
      alert("+১০ পয়েন্ট যোগ হয়েছে! 🎉");
    }
  }, 1000);

  setTimeout(() => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      updateAdCounter();
    }
  }, 40000);
}

// রিয়েল জয়েন চেক
async function checkMembership(taskId, chatUsername, points, button) {
  const btn = button;
  if (!btn) return;
  if (localStorage.getItem("task_done_" + taskId + "_" + userId)) {
    btn.textContent = "সম্পন্ন ✓";
    btn.classList.add("done");
    return;
  }

  btn.textContent = "চেক হচ্ছে...";
  btn.disabled = true;

  try {
    const res = await fetch(`https://api.telegram.org/bot\( {BOT_TOKEN}/getChatMember?chat_id= \){chatUsername}&user_id=${userId}`);
    const data = await res.json();

    if (data.ok && ["member", "administrator", "creator"].includes(data.result.status)) {
      balance += points;
      updateBalance();
      localStorage.setItem("task_done_" + taskId + "_" + userId, "true");
      btn.textContent = "সম্পন্ন ✓";
      btn.classList.add("done");
      alert(`+${points} পয়েন্ট পেয়েছেন! 🎉`);
    } else {
      btn.textContent = "চেক করুন";
      btn.disabled = false;
      alert("আপনি এখনো জয়েন করেননি!");
    }
  } catch (e) {
    btn.textContent = "চেক করুন";
    btn.disabled = false;
    alert("ইন্টারনেট সমস্যা। আবার চেষ্টা করুন।");
  }
}

// উইথড্র
function sendWithdraw() {
  const methodEl = document.getElementById("method");
  const numberEl = document.getElementById("number");
  if (!methodEl || !numberEl) return;
  const method = methodEl.value;
  const number = numberEl.value.trim();
  if (!number) return alert("নম্বর / আইডি দিন!");

  let min = 0, reward = "";
  if (method === "bkash" || method === "nagad") { min = 1200; reward = "১০০ টাকা (২০০ পয়েন্ট ফি)"; }
  else if (method === "binance") { min = 5000; reward = "$4"; }
  else if (method === "stars") { min = 2000; reward = "১০০ Telegram Stars"; }

  if (balance < min) return alert(`মিনিমাম ${min} পয়েন্ট লাগবে!`);

  const text = `নতুন উইথড্র রিকোয়েস্ট\n\nইউজার: \( {username}\nআইডি: \){userId}\nমেথড: \( {method.toUpperCase()}\nনম্বর: \){number}\nপয়েন্ট: \( {balance}\nরিওয়ার্ড: \){reward}\n\n@TakaTapBD_bot`;

  tg.openTelegramLink(`https://t.me/7702378694?text=${encodeURIComponent(text)}`);
  alert("রিকোয়েস্ট পাঠানো হয়েছে!");
}

// চ্যানেল ভেরিফাই
async function verifyChannel() {
  try {
    const res = await fetch(`https://api.telegram.org/bot\( {BOT_TOKEN}/getChatMember?chat_id=@TakaTapBD_Channel&user_id= \){userId}`);
    const data = await res.json();
    if (data.ok && ["member","administrator","creator"].includes(data.result.status)) {
      document.querySelectorAll(".content").forEach(c => c.classList.remove("hidden"));
      const tabBar = document.querySelector(".tab-bar");
      if (tabBar) tabBar.style.display = "flex";
    } else {
      alert("প্রথমে @TakaTapBD_Channel এ জয়েন করুন!");
      tg.openTelegramLink("https://t.me/TakaTapBD_Channel");
    }
  } catch(e) {
    alert("ভেরিফাই সমস্যা। আবার চেষ্টা করুন।");
  }
}
