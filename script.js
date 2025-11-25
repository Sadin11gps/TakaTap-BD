const tg = window.Telegram.WebApp;
tg.ready();

let balance = 0;
let refCount = 0;
let userId = tg.initDataUnsafe?.user?.id || Date.now();
let username = tg.initDataUnsafe?.user?.username || tg.initDataUnsafe?.user?.first_name || "User";
let refFrom = new URLSearchParams(window.location.search).get("start");
const BOT_TOKEN = "7964136906:AAEfh7dxAD4Jd08GDFVWzs9q1_kx667fgyA";

// লোড ডেটা
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
  alert("রেফারেল বোনাস! +৫০ পয়েন্ট");
}

function updateBalance() {
  document.getElementById("balance").innerText = balance.toLocaleString();
  document.getElementById("wbalance").innerText = balance.toLocaleString();
  document.getElementById("refCount").innerText = refCount;
  document.getElementById("refBonus").innerText = refCount * 50;
  localStorage.setItem("takatap_" + userId, JSON.stringify({balance, refCount}));
}

updateBalance();
updateAdCounter();
verifyChannel();

// রেফার শেয়ার
function shareRef() {
  const link = `https://t.me/TakaTapBD_bot?start=${userId}`;
  tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent("TakaTap BD – পয়েন্ট আর্ন করুন!\n" + link)}`);
}

// ট্যাব ওপেন
function openTab(tabId) {
  document.querySelectorAll(".content").forEach(t => t.classList.add("hidden"));
  document.getElementById(tabId).classList.remove("hidden");
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");
}

// এড কাউন্টার
function updateAdCounter() {
  const today = new Date().toDateString();
  let count = parseInt(localStorage.getItem("ad_count_" + userId) || "0");
  if (localStorage.getItem("ad_date_" + userId) !== today) {
    count = 0;
    localStorage.setItem("ad_date_" + userId, today);
  }
  document.getElementById("adCount").innerText = count + " / 10";
  const btn = document.getElementById("showAdBtn");
  btn.disabled = count >= 10;
  btn.innerText = count >= 10 ? "লিমিট শেষ" : "এড দেখুন (+১০)";
}

// এড দেখানো (সিম্পল কাউন্টডাউন)
let countdown = null;
function showAd() {
  const btn = document.getElementById("showAdBtn");
  if (btn.disabled) return;

  if (window.show_10232544) window.show_10232544();
  else alert("এড লোড হচ্ছে...");

  btn.disabled = true;
  btn.innerText = "দেখছে... ৩০";

  let sec = 30;
  countdown = setInterval(() => {
    sec--;
    btn.innerText = `দেখছে... ${sec}`;
    if (sec <= 0) {
      clearInterval(countdown);
      balance += 10;
      updateBalance();
      let c = parseInt(localStorage.getItem("ad_count_" + userId) || "0") + 1;
      localStorage.setItem("ad_count_" + userId, c);
      updateAdCounter();
      btn.innerText = "এড দেখুন (+১০)";
      alert("+১০ পয়েন্ট!");
    }
  }, 1000);
}

// জয়েন চেক
async function checkMembership(taskId, chatUsername, points, button) {
  if (localStorage.getItem("task_" + taskId + "_" + userId)) {
    button.innerText = "সম্পন্ন";
    button.classList.add("done");
    return;
  }

  button.innerText = "চেক...";
  button.disabled = true;

  try {
    const res = await fetch(`https://api.telegram.org/bot\( {BOT_TOKEN}/getChatMember?chat_id= \){chatUsername}&user_id=${userId}`);
    const data = await res.json();
    if (data.ok && ["member","administrator","creator"].includes(data.result.status)) {
      balance += points;
      updateBalance();
      localStorage.setItem("task_" + taskId + "_" + userId, "true");
      button.innerText = "সম্পন্ন ✓";
      button.classList.add("done");
      alert("+ " + points + " পয়েন্ট!");
    } else {
      button.innerText = "চেক করুন";
      button.disabled = false;
      alert("জয়েন করেননি!");
    }
  } catch(e) {
    button.innerText = "চেক করুন";
    button.disabled = false;
    alert("সমস্যা হয়েছে।");
  }
}

// উইথড্র
function sendWithdraw() {
  const method = document.getElementById("method").value;
  const number = document.getElementById("number").value.trim();
  if (!number) return alert("নম্বর দিন!");

  let min = method === "binance" ? 5000 : method === "stars" ? 2000 : 1200;
  if (balance < min) return alert("মিনিমাম " + min + " পয়েন্ট লাগবে!");

  const text = "উইথড্র:\nইউজার: " + username + "\nID: " + userId + "\nমেথড: " + method.toUpperCase() + "\nনম্বর: " + number + "\nপয়েন্ট: " + balance;
  tg.openTelegramLink("https://t.me/7702378694?text=" + encodeURIComponent(text));
  alert("পাঠানো হয়েছে!");
}

// চ্যানেল ভেরিফাই
async function verifyChannel() {
  try {
    const res = await fetch(`https://api.telegram.org/bot\( {BOT_TOKEN}/getChatMember?chat_id=@TakaTapBD_Channel&user_id= \){userId}`);
    const data = await res.json();
    if (data.ok && ["member","administrator","creator"].includes(data.result.status)) {
      document.querySelectorAll(".content").forEach(c => c.classList.remove("hidden"));
      document.querySelector(".tab-bar").style.display = "flex";
    } else {
      alert("জয়েন করুন @TakaTapBD_Channel!");
      tg.openTelegramLink("https://t.me/TakaTapBD_Channel");
    }
  } catch(e) {
    alert("ভেরিফাই সমস্যা।");
  }
}
