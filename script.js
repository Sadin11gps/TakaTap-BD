const tg = window.Telegram.WebApp;
tg.ready();

let balance = 0;
let refCount = 0;
let userId = tg.initDataUnsafe?.user?.id || 123456;
let username = tg.initDataUnsafe?.user?.username || tg.initDataUnsafe?.user?.first_name || "User";
let refFrom = new URLSearchParams(window.location.search).get("start");

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
  localStorage.setItem("ref_awarded_" + userId, "true");
  alert("রেফারেল বোনাস! +৫০ পয়েন্ট পেয়েছেন 🎉");
}

updateBalance();

// ব্যালেন্স আপডেট
function updateBalance() {
  document.getElementById("balance").textContent = balance.toLocaleString();
  document.getElementById("wbalance").textContent = balance.toLocaleString();
  document.getElementById("refCount").textContent = refCount;
  document.getElementById("refBonus").textContent = refCount * 50;
  localStorage.setItem("takatap_" + userId, JSON.stringify({balance, refCount}));
}

// রেফার লিংক শেয়ার
function shareRef() {
  const link = `https://t.me/TakaTapBD_bot?start=${userId}`;
  tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent("🚀 TakaTap BD – প্রতি ট্যাপে পয়েন্ট + রেফারেলে ৫০ পয়েন্ট!\n\nশুরু করুন: " + link)}`);
}

// ট্যাব ওপেন
function openTab(tabId) {
  document.querySelectorAll(".content").forEach(t => t.classList.add("hidden"));
  document.getElementById(tabId).classList.remove("hidden");
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");
}

// জয়েন চেক + রিওয়ার্ড (সিম্পল সিস্টেম – পরে অটো API যোগ করা যাবে)
function checkJoin(btn, taskId, points) {
  if (localStorage.getItem("task_" + taskId + "_" + userId)) {
    btn.textContent = "সম্পন্ন ✓";
    btn.classList.add("done");
    return;
  }

  setTimeout(() => {
    const done = confirm("জয়েন করেছেন? ✓");
    if (done) {
      balance += points;
      if (taskId.includes("ch") || taskId.includes("gr")) {
        localStorage.setItem("task_" + taskId + "_" + userId, "done");
      }
      btn.textContent = "সম্পন্ন ✓";
      btn.classList.add("done");
      updateBalance();
      alert(`+${points} পয়েন্ট যোগ হয়েছে! 🎉`);
    }
  }, 2000);
}

// Monetag এড দেখার পর পয়েন্ট (ম্যানুয়াল – পরে অটো করা যাবে)
setInterval(() => {
  if (!localStorage.getItem("ad_today_" + userId)) {
    const seen = confirm("এড দেখেছেন? +১০ পয়েন্ট");
    if (seen) {
      balance += 10;
      localStorage.setItem("ad_today_" + userId, Date.now());
      updateBalance();
      alert("+১০ পয়েন্ট পেয়েছেন!");
    }
  }
}, 300000); // প্রতি ৫ মিনিটে একবার চেক

// উইথড্র রিকোয়েস্ট পাঠানো
function sendWithdraw() {
  const method = document.getElementById("method").value;
  const number = document.getElementById("number").value.trim();

  if (!number) return alert("নম্বর / আইডি দিন!");

  let min = 0;
  let info = "";

  if (method === "bkash" || method === "nagad") {
    min = 1200;
    info = "১০০ টাকা (২০০ পয়েন্ট ফি সহ)";
  } else if (method === "binance") {
    min = 5000;
    info = "$4 (কোনো ফি নাই)";
  } else if (method === "stars") {
    min = 2000;
    info = "১০০ Telegram Stars (কোনো ফি নাই)";
  }

  if (balance < min) return alert(`মিনিমাম ${min} পয়েন্ট লাগবে!`);

  const text = `🔔 নতুন উইথড্র রিকোয়েস্ট\n\n` +
               `ইউজার: ${username}\n` +
               `আইডি: ${userId}\n` +
               `মেথড: ${method.toUpperCase()}\n` +
               `নম্বর/আইডি: ${number}\n` +
               `পয়েন্ট: ${balance.toLocaleString()}\n` +
               `পরিমাণ: ${info}\n\n` +
               `@TakaTapBD_bot থেকে`;

  tg.openTelegramLink(`https://t.me/7702378694?text=${encodeURIComponent(text)}`);
  alert("উইথড্র রিকোয়েস্ট পাঠানো হয়েছে! এডমিন ২৪ ঘণ্টার মধ্যে পেমেন্ট করবে।");
}

// চ্যানেল ভেরিফাই (তোমার আগের চ্যানেল)
async function verifyChannel() {
  try {
    const res = await fetch(`https://api.telegram.org/bot7964136906:AAEfh7dxAD4Jd08GDFVWzs9q1_kx667fgyA/getChatMember?chat_id=@TakaTapBD_Channel&user_id=${userId}`);
    const data = await res.json();
    if (data.ok && ["member","administrator","creator"].includes(data.result.status)) {
      document.querySelectorAll(".content").forEach(c => c.classList.remove("hidden"));
      document.querySelector(".tab-bar").style.display = "flex";
    } else {
      alert("প্রথমে @TakaTapBD_Channel এ জয়েন করুন!");
      tg.openTelegramLink("https://t.me/TakaTapBD_Channel");
    }
  } catch(e) {
    alert("ভেরিফাই করতে সমস্যা। আবার চেষ্টা করুন।");
  }
}

// লোড হলে চ্যানেল চেক
verifyChannel();
