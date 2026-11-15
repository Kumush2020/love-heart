
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let W, H, S;
let startTime = null;

const words = [
    "I love you",
    "Je t'aime",
    "Te amo",
    "Ich liebe dich",
    "Ti amo",
    "Я тебя люблю",
    "Seni seviyorum",
    "愛してる",
    "사랑해",
    "Eu te amo",
    "Kocham cię",
    "Ik hou van jou",
    "Anh yêu em",
    "Nakupenda",
    "Mahal kita",
    "Σ' αγαπώ",
    "Мен сени сүйөм",
    "Amo-te",
    "Te iubesc",
    "Szeretlek"
];

let outline = [];
let inside = [];

function resize() {
    const dpr = window.devicePixelRatio || 1;

    W = window.innerWidth;
    H = window.innerHeight;

    canvas.width = W * dpr;
    canvas.height = H * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    S = Math.min(W * 0.34, H * 0.36);

    createHeart();
}

window.addEventListener("resize", resize);

// Yurakning matematik formulasi
function isInsideHeart(x, y) {
    const a = x * x + y * y - 1;

    return a * a * a - x * x * y * y * y <= 0;
}

// Yurak chegarasining koordinatalari
function heartPoint(t) {
    const x = 16 * Math.pow(Math.sin(t), 3);

    const y =
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t);

    return {
        x: W / 2 + (x / 17) * S,
        y: H / 2 - (y / 17) * S
    };
}

// Yurakni yaratish
function createHeart() {
    outline = [];
    inside = [];

    const cx = W / 2;
    const cy = H / 2;

    // Tashqi chiziq
    const count = 1000;

    for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2;

        const p = heartPoint(t);

        outline.push({
            x: p.x,
            y: p.y,
            text: words[i % words.length]
        });
    }

    // ICHKI QISM: zich yozuvlar
    const fontSize = Math.max(7, S * 0.035);
    const stepX = fontSize * 6.5;
    const stepY = fontSize * 1.35;

    let row = 0;

    for (let y = -S; y <= S; y += stepY) {
        row++;

        for (let x = -S; x <= S; x += stepX) {

            const nx = x / S;
            const ny = -y / S;

            if (isInsideHeart(nx, ny)) {

                const angle = Math.atan2(y, x);
                const distance = Math.sqrt(nx * nx + ny * ny);

                inside.push({
                    x: cx + x,
                    y: cy + y,

                    text: words[
                        Math.floor(Math.random() * words.length)
                    ],

                    // Har tomondan asta-sekin to'lishi
                    delay: Math.random() * 2.5 +
                        distance * 0.25 +
                        Math.abs(Math.sin(angle * 3)) * 0.15
                });
            }
        }
    }
}

// Yurak shaklidagi clipping
function makeHeartPath() {
    ctx.beginPath();

    for (let i = 0; i <= 500; i++) {
        const p = heartPoint(
            (i / 500) * Math.PI * 2
        );

        if (i === 0) {
            ctx.moveTo(p.x, p.y);
        } else {
            ctx.lineTo(p.x, p.y);
        }
    }

    ctx.closePath();
}

// Matn chizish
function drawWord(x, y, word, alpha, size) {
    ctx.globalAlpha = alpha;

    ctx.font = `bold ${size}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#ff4b91";
    ctx.fillText(word, x, y);
}

// 1. Yurak chegarasi
function drawOutline(progress) {
    const total = Math.floor(outline.length * progress);

    const fontSize = Math.max(7, S * 0.035);

    for (let i = 0; i < total; i += 2) {
        const p = outline[i];

        drawWord(
            p.x,
            p.y,
            p.text,
            1,
            fontSize
        );
    }
}

// 2. Yurakning ichini to'liq to'ldirish
function drawInside(elapsed) {
    const fontSize = Math.max(7, S * 0.035);

    ctx.save();

    // Yozuvlar faqat yurak ichida ko'rinadi
    makeHeartPath();
    ctx.clip();

    inside.forEach(p => {
        const opacity = Math.max(
            0,
            Math.min(1, (elapsed - p.delay) / 0.45)
        );

        if (opacity > 0) {
            drawWord(
                p.x,
                p.y,
                p.text,
                opacity,
                fontSize
            );
        }
    });

    ctx.restore();
    ctx.globalAlpha = 1;
}







// Asosiy animatsiya
function animate(timestamp) {

    if (!startTime) startTime = timestamp;

    const time = (timestamp - startTime) / 1000;

    ctx.clearRect(0, 0, W, H);

    // 1. Yurak o'ng va chap tomondan chiziladi
    const outlineProgress = Math.min(time / 3.5, 1);

    drawOutline(outlineProgress);

    
    // Yurak yozuvlari o'qning ichkaridagi qismini yopadi
    if (time > 3.5) {
        drawInside(time - 3.5);
    }

    ctx.globalAlpha = 1;

    requestAnimationFrame(animate);
}

resize();
requestAnimationFrame(animate);
