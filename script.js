const tg = window.Telegram.WebApp;
tg.ready();

let balance = 0;
let refCount = 0;
let userId = tg.initDataUnsafe?.user?.id || Date.now();
let username = tg.initDataUnsafe?.user?.username || tg.initDataUnsafe?.user?.first_name || "User";
let refFrom = new URLSearchParams(window.location.search).get("start");
const BOT_TOKEN = "7964136906:AAEfh7dxAD4Jd08GDFVWzs9q1_kx667fgyA";

// সবকিছু এখানে সরাসরি চালানো হবে (Telegram WebApp-এর জন্য নিরাপদ)
(function() {
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
})();

// সব ফাংশন (গ্লোবাল)
window.updateBalance = function() {
  document.getElementById("balance")?.innerText = balance.toLocaleString();
  document.getElementById("wbalance")?.innerText = balance.toLocaleString();
  document.getElementById("refCount")?.innerText = refCount;
  document.getElementById("refBonus")?.innerText = (refCount * 50).toLocaleString();
  localStorage.setItem("takatap_" + userId, JSON.stringify({balance, refCount}));
};

window.shareRef = function() {
  const link = `https://t.me/TakaTapBD_bot?start=${userId}`;
  tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent("TakaTap BD – পয়েন্ট আর্ন করুন!\nশুরু করুন: " + link)}`);
};

window.openTab = function(tabId) {
  document.querySelectorAll(".content").forEach(t => t.classList.add("hidden"));
  document.getElementById(tabId)?.classList.remove("hidden");
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  event?.target?.classList.add("active");
};

window.updateAdCounter = function() {
  const today = new Date().toDateString();
  const savedDate = localStorage.getItem("ad_date_" + userId);
  let count = parseInt(localStorage.getItem("ad_count_" + userId) || "0");
  if (savedDate !== today) {
    count = 0;
    localStorage.setItem("ad_date_" + userId, today);
    localStorage.setItem("ad_count_" + userId, "0");
  }
  document.getElementById("adCount")?.innerText = count + " / 10";
  const btn = document.getElementById("showAdBtn");
  if (btn) {
    btn.disabled = count >= 10;
    btn.textContent = count >= 10 ? "আজকের লিমিট শেষ" : "এড দেখুন (+১০ পয়েন্ট)";
  }
};

let countdownInterval = null;
window.showAd = function() {
  const btn = document.getElementById("showAdBtn");
  if (!btn || btn.disabled) return;

  if (window.show_10232544) window.show_10232544();

  btn.disabled = true;
  btn.textContent = "এড দেখছে... ৩০";

  let sec = 30;
  countdownInterval = setInterval(() => {
    sec--;
    btn.textContent = `এড দেখছে... ${sec}`;
    if (sec <= 0) {
      clearInterval(countdownInterval);
      balance += 10;
      updateBalance();
      let c = parseInt(localStorage.getItem("ad_count_" + userId) || "0") + 1;
      localStorage.setItem("ad_count_" + userId, c);
      updateAdCounter();
      btn.textContent = "এড দেখুন (+১০ পয়েন্ট)";
      alert("+১০ পয়েন্ট পেয়েছেন! 🎉");
    }
  }, 1000);
};

window.checkMembership = async function(taskId, chatUsername, points, button) {
  if (localStorage.getItem("task_done_" + taskId + "_" + userId)) {
    button.textContent = "সম্পন্ন ✓";
    button.classList.add("done");
    return;
  }
  button.textContent = "চেক হচ্ছে...";
  button.disabled = true;

  try {
    const res = await fetch(`https://api.telegram.org/bot\( {BOT_TOKEN}/getChatMember?chat_id= \){chatUsername}&user_id=${userId}`);
    const data = await res.json();
    if (data.ok && ["member","administrator","creator"].includes(data.result.status)) {
      balance += points;
      updateBalance();
      localStorage.setItem("task_done_" + taskId + "_" + userId, "true");
      button.textContent = "সম্পন্ন ✓";
      button.classList.add("done");
      alert(`+${points} পয়েন্ট পেয়েছেন!`);
    } else {
      button.textContent = "চেক করুন";
      button.disabled = false;
      alert("জয়েন করেননি!");
    }
  } catch(e) {
    button.textContent = "চেক করুন";
    button.disabled = false;
    alert("ইন্টারনেট সমস্যা।");
  }
};

window.sendWithdraw = function() {
  const method = document.getElementById("method")?.value;
  const number = document.getElementById("number")?.value.trim();
  if (!number) return alert("নম্বর দিন!");

  let min = method === "binance" ? 5000 : method === "stars" ? 2000 : 1200;
  if (balance < min) return alert(`মিনিমাম ${min} পয়েন্ট লাগবে!`);

  const text = `নতুন উইথড্র\nইউজার: \( {username}\nID: \){userId}\nমেথড: \( {method.toUpperCase()}\nনম্বর: \){number}\nপয়েন্ট: ${balance}`;
  tg.openTelegramLink(`https://t.me/7702378694?text=${encodeURIComponent(text)}`);
  alert("রিকোয়েস্ট পাঠানো হয়েছে!");
};

async function verifyChannel() {
  try {
    const res = await fetch(`https://api.telegram.org/bot\( {BOT_TOKEN}/getChatMember?chat_id=@TakaTapBD_Channel&user_id= \){userId}`);
    const data = await res.json();
    if (data.ok && ["member","administrator","creator"].includes(data.result.status)) {
      document.querySelectorAll(".content").forEach(c => c.classList.remove("hidden"));
      document.querySelector(".tab-bar").style.display = "flex";
    } else {
      alert("প্রথমে @TakaTapBD_Channel এ জয়েন করুন!");
      tg.openTelegramLink("https://t.me/TakaTapBD_Channel");
    }
  } catch(e) { alert("ভেরিফাই সমস্যা।"); }
}
verifyChannel();
