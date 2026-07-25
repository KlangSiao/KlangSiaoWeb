const mangaData = {
  Knightsoul_Vacation: {
    // 🎵 แยก BGM ตามช่วงหน้า
    bgmTracks: [
      { start: 1, end: 7, src: "asset/Knightsoul Vacation/NewBGM.mp3" },
      { start: 8, end: 23, src: "asset/Knightsoul Vacation/Romence.mp3" }
    ],
    scenes: [
      { img: "asset/Knightsoul Vacation/1.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/2.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/3.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/4.png", sfx: "asset/Knightsoul Vacation/Wave.mp3" },
      { img: "asset/Knightsoul Vacation/5.png", sfx: "asset/Knightsoul Vacation/SoundP5.mp3" },
      { img: "asset/Knightsoul Vacation/6.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/7.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/8.png", sfx: { 
      src: "asset/Knightsoul Vacation/Page8.mp3", 
      volume: 0.1
      } 
  },
      { img: "asset/Knightsoul Vacation/9.png", sfx: {
      src:  "asset/Knightsoul Vacation/Page9.mp3",
      volume: 0.8,
    }
  },
      { img: "asset/Knightsoul Vacation/10.png", sfx: {
      src: "asset/Knightsoul Vacation/Page10.mp3" ,
      volume: 0.8,
      loop: true
      }
  },
      { img: "asset/Knightsoul Vacation/11.png", sfx: {
      src:  "asset/Knightsoul Vacation/Page11.mp3",
      volume: 0.8,
    } 
  },
      { img: "asset/Knightsoul Vacation/12.png", sfx: {
      src:  "asset/Knightsoul Vacation/Page12.mp3",
      volume: 0.8,
    } 
  },
      { img: "asset/Knightsoul Vacation/13.png", sfx: {
      src:  "asset/Knightsoul Vacation/Page13.mp3",
      volume: 0.8,
    } 
  },
      { img: "asset/Knightsoul Vacation/14.png", sfx: {
      src:  "asset/Knightsoul Vacation/Page14.mp3",
      volume: 0.8,
      loop: true
    } 
  },
      { img: "asset/Knightsoul Vacation/15.png", sfx: {
      src:  "asset/Knightsoul Vacation/Page14.mp3",
      volume: 0.8,
      loop: true
    } 
  },
      { img: "asset/Knightsoul Vacation/16.png", sfx: {
      src:  "asset/Knightsoul Vacation/Page16.mp3",
      volume: 0.8,
      loop: true
    } 
  },
      { img: "asset/Knightsoul Vacation/17.png", sfx: {
      src:  "asset/Knightsoul Vacation/Page17.mp3",
      volume: 0.8,
    } 
  },
      { img: "asset/Knightsoul Vacation/18.png", sfx: {
      src:  "asset/Knightsoul Vacation/Page18.mp3",
      volume: 0.8,
      loop: true
    } 
  },
      { img: "asset/Knightsoul Vacation/19.png", sfx: {
      src:  "asset/Knightsoul Vacation/Page19.mp3",
      volume: 0.8,
      loop: true
    } 
  },
      { img: "asset/Knightsoul Vacation/20.png", sfx: {
      src:  "asset/Knightsoul Vacation/Page20.mp3",
      volume: 0.8,
      loop: true
    } 
  },
      { img: "asset/Knightsoul Vacation/21.png", sfx: {
      src:  "asset/Knightsoul Vacation/Page21.mp3",
      volume: 0.8
    } 
  },
      { img: "asset/Knightsoul Vacation/22.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/23.png", sfx: "" }
    ]
  }
};

// ดึงข้อมูลเรื่อง
const urlParams = new URLSearchParams(window.location.search);
const storyParam = urlParams.get('story') || 'Knightsoul_Vacation';
const currentStory = mangaData[storyParam];

// ตัวแปรสถานะ
let currentPageIndex = 0; // เริ่มที่หน้าแรก (Index 0 = หน้า 1)
let isMuted = false;
let currentBgmSrc = "";
let bgmAudio = null;
let currentSFXAudio = null;

// DOM Elements
const imgElement = document.getElementById('current-manga-img');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageIndicator = document.getElementById('page-indicator');
const muteBtn = document.getElementById('mute-btn');
const loadingScreen = document.getElementById('loading-screen');
const pageClickArea = document.getElementById('page-click-area');

// ฟังก์ชันอัปเดตหน้ามังงะและระบบเสียง
function renderPage(index) {
  if (!currentStory || !currentStory.scenes[index]) return;

  // หยุดเสียง SFX เดิมทันทีที่เปลี่ยนหน้า (ป้องกันเสียงวนลูปค้างไปหน้าอื่น)
  if (currentSFXAudio) {
    currentSFXAudio.pause();
    currentSFXAudio = null;
  }

  const pageNum = index + 1;
  const scene = currentStory.scenes[index];

  // เปลี่ยนรูปภาพ
  imgElement.src = scene.img;
  pageIndicator.innerText = `หน้า ${pageNum} / ${currentStory.scenes.length}`;

  // จัดการสถานะปุ่ม
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === currentStory.scenes.length - 1;

  // จัดการ BGM ตามช่วงหน้า
  updateBGMForPage(pageNum);

  // เล่น SFX ประจำหน้า (ถ้ามี)
  if (scene.sfx) {
    playSFX(scene.sfx);
  }
}

// ระบบเช็คและสลับ BGM ตามช่วงหน้า
function updateBGMForPage(pageNum) {
  if (!currentStory.bgmTracks) return;

  // ค้นหาว่าเลขหน้านี้ ตกอยู่ในช่วง BGM ไหน
  const track = currentStory.bgmTracks.find(t => pageNum >= t.start && pageNum <= t.end);

  if (track) {
    // ถ้า BGM หน้านี้ ไม่ใช่เพลงเดิมที่กำลังเล่นอยู่ ให้สลับเพลง!
    if (currentBgmSrc !== track.src) {
      currentBgmSrc = track.src;
      
      if (bgmAudio) {
        bgmAudio.pause(); // หยุดเพลงเก่า
      }

      bgmAudio = new Audio(track.src);
      bgmAudio.loop = true;
      bgmAudio.volume = 0.4;

      if (!isMuted) {
        bgmAudio.play().catch(err => console.log("BGM Blocked:", err));
      }
    }
  } else {
    // ถ้าหน้านั้นไม่อยู่ในช่วง BGM ใดเลย ให้หยุดเพลง
    if (bgmAudio) {
      bgmAudio.pause();
      currentBgmSrc = "";
    }
  }
}

// เล่นเสียงเอฟเฟค
// เล่นเสียงเอฟเฟค (รองรับการตั้งระดับเสียงแยกรายหน้า)
// เล่นเสียงเอฟเฟค (รองรับการตั้งระดับเสียง และเล่นซ้ำรายหน้า)
function playSFX(sfxData) {
  if (isMuted || !sfxData) return;

  // หยุด SFX ตัวเก่าถ้ายังเล่นไม่จบ
  if (currentSFXAudio) {
    currentSFXAudio.pause();
    currentSFXAudio = null;
  }

  let src = "";
  let volume = 0.25; // ค่าความดังเริ่มต้น (25%)
  let loop = false;   // ค่าเริ่มต้น: ไม่เล่นซ้ำ

  // เช็คว่าส่งมาเป็น Object หรือ String
  if (typeof sfxData === 'object') {
    src = sfxData.src || "";
    volume = sfxData.volume !== undefined ? sfxData.volume : 0.25;
    loop = sfxData.loop !== undefined ? sfxData.loop : false; // อ่านค่า loop
  } else if (typeof sfxData === 'string') {
    src = sfxData;
  }

  if (!src) return;

  currentSFXAudio = new Audio(src);
  currentSFXAudio.volume = volume;
  currentSFXAudio.loop = loop; // กำหนดให้วนลูปตามค่าที่ตั้งไว้
  currentSFXAudio.play().catch(err => console.log("SFX Blocked:", err));
}

// Event Listeners สำหรับการเปลี่ยนหน้า
prevBtn.addEventListener('click', () => {
  if (currentPageIndex > 0) {
    currentPageIndex--;
    renderPage(currentPageIndex);
  }
});

nextBtn.addEventListener('click', () => {
  if (currentPageIndex < currentStory.scenes.length - 1) {
    currentPageIndex++;
    renderPage(currentPageIndex);
  }
});

// คลิกที่รูปเพื่อไปหน้าถัดไป
pageClickArea.addEventListener('click', () => {
  if (currentPageIndex < currentStory.scenes.length - 1) {
    currentPageIndex++;
    renderPage(currentPageIndex);
  }
});

// กดปุ่มลูกศร ซ้าย-ขวา บนคีย์บอร์ดเพื่อเปลี่ยนหน้า
document.addEventListener('keydown', (e) => {
  if (e.key === "ArrowRight" || e.key === " ") {
    if (currentPageIndex < currentStory.scenes.length - 1) {
      currentPageIndex++;
      renderPage(currentPageIndex);
    }
  } else if (e.key === "ArrowLeft") {
    if (currentPageIndex > 0) {
      currentPageIndex--;
      renderPage(currentPageIndex);
    }
  }
});

// ปุ่ม Mute
muteBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  if (isMuted) {
    muteBtn.innerText = "🔇 ปิดเสียงอยู่";
    if (bgmAudio) bgmAudio.pause();
    if (currentSFXAudio) currentSFXAudio.pause();
  } else {
    muteBtn.innerText = "🔊 เปิดเสียงอยู่";
    if (bgmAudio) bgmAudio.play().catch(err => console.log(err));
  }
});

// โหลดเว็บเสร็จแล้วเริ่มรัน
window.addEventListener('load', () => {
  if (loadingScreen) {
    loadingScreen.classList.add('fade-out');
  }
  renderPage(currentPageIndex); // แสดงหน้าแรกทันที
});