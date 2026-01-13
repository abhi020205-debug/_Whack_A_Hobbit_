const grid = document.getElementById("grid");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const comboEl = document.getElementById("combo");
const startBtn = document.getElementById("startBtn");

const video = document.getElementById("camera");
const canvas = document.getElementById("snapshot");
const ctx = canvas.getContext("2d");

const playerCard = document.getElementById("playerCard");
const playerPhoto = document.getElementById("playerPhoto");
const bestScoreEl = document.getElementById("bestScore");

const PLAYER_KEY = "whack_player";

const friends = [
  { img: "images/friend1.jpg", sound: "sounds/hit1.mp3" },
  { img: "images/friend2.jpg", sound: "sounds/hit2.mp3" },
  { img: "images/friend3.jpg", sound: "sounds/hit3.mp3" }
];

let score = 0;
let lives = 3;
let combo = 0;
let activeHole = null;
let gameInterval = null;

function createGrid() {
  grid.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const hole = document.createElement("div");
    hole.className = "hole";

    const mole = document.createElement("img");
    mole.className = "mole";

    hole.appendChild(mole);
    hole.addEventListener("click", () => handleHit(hole));
    hole.addEventListener("touchstart", () => handleHit(hole));

    grid.appendChild(hole);
  }
}

function popMole() {
  if (activeHole) activeHole.classList.remove("active");

  const holes = document.querySelectorAll(".hole");
  activeHole = holes[Math.floor(Math.random() * holes.length)];

  const friend = friends[Math.floor(Math.random() * friends.length)];
  const mole = activeHole.querySelector(".mole");

  mole.src = friend.img;
  mole.dataset.sound = friend.sound;

  activeHole.classList.add("active");
}

function handleHit(hole) {
  if (!activeHole) return;

  if (hole === activeHole) {
    score++;
    combo++;
    hole.classList.add("hit");
    setTimeout(() => hole.classList.remove("hit"), 200);

    const sound = hole.querySelector(".mole").dataset.sound;
    playSound(sound);

    scoreEl.textContent = score;
    comboEl.textContent = combo;

    activeHole.classList.remove("active");
    activeHole = null;
  } else {
    combo = 0;
    lives--;
    livesEl.textContent = lives;
    comboEl.textContent = combo;
    if (lives <= 0) endGame();
  }
}

function playSound(src) {
  if (!src) return;
  const audio = new Audio(src);
  audio.play().catch(() => {});
}

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }
    });
    video.srcObject = stream;
  } catch {}
}

function takePhoto() {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

function stopCamera() {
  if (!video.srcObject) return;
  video.srcObject.getTracks().forEach(t => t.stop());
}

function startGame() {
  score = 0;
  lives = 3;
  combo = 0;
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  comboEl.textContent = combo;
  playerCard.classList.add("hidden");

  startCamera();
  gameInterval = setInterval(popMole, 900);
}

function endGame() {
  clearInterval(gameInterval);
  stopCamera();

  if (navigator.vibrate) navigator.vibrate(400);

  const photo = takePhoto();
  let data = JSON.parse(localStorage.getItem(PLAYER_KEY)) || { best: 0 };

  if (score > data.best) {
    data.best = score;
    data.photo = photo;
    localStorage.setItem(PLAYER_KEY, JSON.stringify(data));
  }

  if (data.photo) {
    playerPhoto.src = data.photo;
    bestScoreEl.textContent = data.best;
    playerCard.classList.remove("hidden");
  }

  alert("Game Over!");
}

startBtn.addEventListener("click", startGame);

createGrid();
