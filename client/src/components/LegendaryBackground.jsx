import React, { useRef, useEffect } from 'react';

// Palette extracted from the reference image
const PALETTE = {
  bg1:        '#06051a',   // very deep navy
  bg2:        '#0d0a2e',   // dark indigo
  bg3:        '#120d3a',   // dark blue-purple
  auroraCore: '#ffffff',   // bright white burst center
  auroraWarm: '#e8d5ff',   // warm lavender-white
  auroraPurp: '#9b59ff',   // vivid violet
  auroraMid:  '#6c8fff',   // periwinkle blue
  auroraAqua: '#22eeff',   // bright aqua/turquoise
  auroraTeal: '#00cfcf',   // deep teal
  starColor:  '#cce0ff',   // cool blue-white stars
};

const MONUMENTS = [
  { name: 'Taj Mahal',         icon: '🕌', corner: 0 },
  { name: 'Eiffel Tower',      icon: '🗼', corner: 1 },
  { name: 'Statue of Liberty', icon: '🗽', corner: 2 },
  { name: 'Colosseum',         icon: '🏛', corner: 3 },
  { name: 'Pyramids of Giza',  icon: '🔺', corner: 0, offset: Math.PI * 0.6 },
  { name: 'Mt. Fuji',          icon: '🗻', corner: 1, offset: Math.PI * 0.6 },
  { name: 'Big Ben',           icon: '🏰', corner: 2, offset: Math.PI * 0.6 },
  { name: 'Statue of Unity',   icon: '🗿', corner: 3, offset: Math.PI * 0.6 },
];

export default function LegendaryBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animFrame;
    let tick = 0;
    let mouse = { x: -9999, y: -9999 };

    const onMouseMove = e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    canvas.addEventListener('mousemove', onMouseMove);

    /* ── Starfield ───────────────────────────────────────────── */
    const STARS = Array.from({ length: 220 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.75,          // stars only in sky, not ground area
      r: Math.random() * 1.6 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.005 + Math.random() * 0.015,
      color: Math.random() > 0.85 ? '#ffccff' : Math.random() > 0.7 ? '#aaccff' : PALETTE.starColor,
    }));

    /* ── Vehicles ────────────────────────────────────────────── */
    const PLANES = [
      { t: 0.0,  speed: 0.00090, color: PALETTE.auroraAqua,  size: 22, dir: 1  },
      { t: 0.4,  speed: 0.00070, color: PALETTE.auroraPurp,  size: 20, dir: -1 },
      { t: 0.75, speed: 0.00110, color: PALETTE.auroraWarm,  size: 18, dir: 1  },
    ];

    /* ── Resize ──────────────────────────────────────────────── */
    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    /* ── Helpers ─────────────────────────────────────────────── */
    function hex(c, a) {
      // parse #rrggbb and return rgba string
      const r = parseInt(c.slice(1, 3), 16);
      const g = parseInt(c.slice(3, 5), 16);
      const b = parseInt(c.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${a})`;
    }

    /* ── 1. Background gradient ──────────────────────────────── */
    function drawBackground(W, H) {
      const grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0.00, PALETTE.bg3);
      grd.addColorStop(0.15, PALETTE.bg2);
      grd.addColorStop(0.55, PALETTE.bg1);
      grd.addColorStop(1.00, '#040310');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
    }

    /* ── 2. Stars ────────────────────────────────────────────── */
    function drawStars(W, H, t) {
      STARS.forEach(s => {
        const alpha = 0.3 + 0.7 * Math.abs(Math.sin(t * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.color.replace(')', `,${alpha.toFixed(2)}`).replace('#', 'rgba(').replace(/(.{2})(.{2})(.{2})/, (_, r, g, b) => `${parseInt(r,16)},${parseInt(g,16)},${parseInt(b,16)}`);
        // simpler version:
        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.color;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
    }

    /* ── 3. Northern Lights Aurora ───────────────────────────── */
    function drawAurora(W, H, t) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // Central dazzling white-gold burst (the heart of the aurora)
      const burstX = W * 0.38, burstY = H * 0.28;
      const burst = ctx.createRadialGradient(burstX, burstY, 0, burstX, burstY, W * 0.22);
      burst.addColorStop(0.00, `rgba(255,240,220,${0.55 + 0.10 * Math.sin(t * 0.7)})`);
      burst.addColorStop(0.20, `rgba(220,200,255,${0.30 + 0.08 * Math.sin(t * 0.5)})`);
      burst.addColorStop(0.55, `rgba(155,89,255,0.12)`);
      burst.addColorStop(1.00, 'rgba(0,0,0,0)');
      ctx.fillStyle = burst;
      ctx.fillRect(0, 0, W, H);

      // Sweeping arm 1 — purple/lavender sweeping right and down
      const arm1 = t * 0.3;
      drawAuroraArm(W, H, t,
        burstX, burstY,
        burstX + W * (0.30 + 0.05 * Math.sin(arm1)), H * 0.38,
        W * 0.32,
        PALETTE.auroraPurp, 0.28
      );

      // Sweeping arm 2 — bright cyan curling down and right
      drawAuroraArm(W, H, t,
        burstX + W * 0.02, burstY + H * 0.06,
        burstX + W * (0.22 + 0.04 * Math.sin(t * 0.4)), H * 0.55,
        W * 0.28,
        PALETTE.auroraAqua, 0.32
      );

      // Sweeping arm 3 — teal band curling further right (lower)
      drawAuroraArm(W, H, t,
        burstX + W * 0.05, burstY + H * 0.12,
        burstX + W * (0.38 + 0.06 * Math.sin(t * 0.35 + 1)), H * 0.62,
        W * 0.24,
        PALETTE.auroraTeal, 0.25
      );

      // Wide purple background haze (top right quadrant)
      const haze = ctx.createRadialGradient(W * 0.75, H * 0.15, 0, W * 0.75, H * 0.15, W * 0.55);
      haze.addColorStop(0.00, `rgba(120,80,255,${0.15 + 0.06 * Math.sin(t * 0.4)})`);
      haze.addColorStop(0.50, `rgba(80,60,180,0.08)`);
      haze.addColorStop(1.00, 'rgba(0,0,0,0)');
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, W, H);

      // Blue accent left edge
      const leftBlue = ctx.createRadialGradient(0, H * 0.3, 0, 0, H * 0.3, W * 0.35);
      leftBlue.addColorStop(0, `rgba(60,100,255,${0.12 + 0.04 * Math.sin(t * 0.6 + 2)})`);
      leftBlue.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = leftBlue;
      ctx.fillRect(0, 0, W, H);

      ctx.restore();
    }

    function drawAuroraArm(W, H, t, x1, y1, x2, y2, spread, color, alpha) {
      // Draw a glowing band between two points
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0,   hex(color, alpha));
      grad.addColorStop(0.4, hex(color, alpha * 1.2));
      grad.addColorStop(1,   hex(color, 0));
      
      ctx.save();
      ctx.filter = `blur(${spread * 0.18}px)`;
      ctx.beginPath();
      // bezier curve arm
      const cpx = (x1 + x2) / 2 + Math.sin(t * 0.5) * spread * 0.3;
      const cpy = (y1 + y2) / 2 - spread * 0.1;
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(cpx, cpy, x2, y2);
      ctx.lineWidth = spread;
      ctx.strokeStyle = grad;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.filter = 'none';
      ctx.restore();
    }

    /* ── 4. Globe (centered = behind card) ──────────────────── */
    function drawGlobe(W, H, t) {
      const cx = W * 0.5, cy = H * 0.5;
      const R  = Math.min(W, H) * 0.38;

      // Outer ambient glow
      const grd = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.5);
      grd.addColorStop(0,   hex(PALETTE.auroraAqua, 0.07));
      grd.addColorStop(0.5, hex(PALETTE.auroraPurp, 0.04));
      grd.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(cx, cy);

      // Latitude ellipses
      const LAT = 9;
      for (let i = 0; i <= LAT; i++) {
        const angle = (i / LAT) * Math.PI;
        const ry    = R * Math.abs(Math.sin(angle)) * 0.42;
        const yOff  = R * Math.cos(angle);
        ctx.beginPath();
        ctx.ellipse(0, yOff, R, ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = hex(PALETTE.auroraAqua, 0.30);
        ctx.lineWidth   = 1.0;
        ctx.stroke();
      }

      // Longitude ellipses (rotating)
      const LON = 10;
      for (let i = 0; i < LON; i++) {
        const a = (i / LON) * Math.PI + t * 0.28;
        ctx.beginPath();
        ctx.ellipse(0, 0, R * Math.abs(Math.cos(a)), R, 0, 0, Math.PI * 2);
        ctx.strokeStyle = hex(PALETTE.auroraMid, 0.25);
        ctx.lineWidth   = 1.0;
        ctx.stroke();
      }

      // Outer glowing ring
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.strokeStyle = hex(PALETTE.auroraAqua, 0.75);
      ctx.lineWidth   = 2.2;
      ctx.shadowColor = PALETTE.auroraAqua;
      ctx.shadowBlur  = 30;
      ctx.stroke();
      ctx.shadowBlur  = 0;

      ctx.restore();
    }

    /* ── 5. Monuments (corner orbits) ────────────────────────── */
    function getCorner(corner, W, H) {
      const R   = Math.min(W, H) * 0.24;
      const pad = R * 0.50;
      return [
        { cx: pad,     cy: pad     },
        { cx: W - pad, cy: pad     },
        { cx: W - pad, cy: H - pad },
        { cx: pad,     cy: H - pad },
      ][corner];
    }

    function drawMonuments(W, H, t) {
      MONUMENTS.forEach((m, i) => {
        const R    = Math.min(W, H) * 0.17;
        const { cx, cy } = getCorner(m.corner, W, H);
        const base = (i % 4) * (Math.PI / 2) + (m.offset || 0);
        const ang  = base + t * 0.22;
        const mx   = cx + R * Math.cos(ang);
        const my   = cy + R * Math.sin(ang);

        // Orbit ring
        ctx.save();
        ctx.strokeStyle = hex(PALETTE.auroraAqua, 0.10);
        ctx.lineWidth   = 0.8;
        ctx.setLineDash([4, 8]);
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Dashed tether line to corner
        ctx.save();
        ctx.strokeStyle = hex(PALETTE.auroraAqua, 0.25);
        ctx.lineWidth   = 0.8;
        ctx.setLineDash([2, 6]);
        ctx.beginPath();
        ctx.moveTo(cx, cy); ctx.lineTo(mx, my);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Glow halo
        const glow = ctx.createRadialGradient(mx, my, 0, mx, my, 30);
        glow.addColorStop(0, hex(PALETTE.auroraAqua, 0.30));
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(mx, my, 30, 0, Math.PI * 2); ctx.fill();

        // Icon
        ctx.save();
        ctx.font = '26px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.45;
        ctx.fillStyle = PALETTE.auroraAqua;
        ctx.fillText(m.icon, mx - 1, my - 1);
        ctx.globalAlpha = 1;
        ctx.fillText(m.icon, mx, my);
        ctx.restore();

        // Label
        ctx.save();
        ctx.font = 'bold 8px Inter,sans-serif';
        ctx.textAlign = 'center';
        const lw = ctx.measureText(m.name.toUpperCase()).width + 12;
        ctx.fillStyle = 'rgba(6,5,26,0.80)';
        ctx.beginPath();
        ctx.roundRect(mx - lw / 2, my + 16, lw, 13, 3);
        ctx.fill();
        ctx.fillStyle = '#a5f3fc';
        ctx.fillText(m.name.toUpperCase(), mx, my + 23);
        ctx.restore();
      });
    }

    /* ── 6. Airplanes ────────────────────────────────────────── */
    function planePath(p, t, W, H) {
      if (p.dir === 1) {
        const x = t * W;
        const y = H * 0.22 + Math.sin(t * Math.PI * 2.2) * 70;
        const angle = Math.atan2(Math.cos(t * Math.PI * 2.2) * 70 * 0.013, W * 0.013);
        return { x, y, angle };
      } else {
        const x = W * (1 - t);
        const y = H * 0.55 + Math.sin(t * Math.PI * 1.8) * 55;
        const angle = Math.PI + Math.atan2(Math.cos(t * Math.PI * 1.8) * 55 * -0.013, W * -0.013);
        return { x, y, angle };
      }
    }

    function drawPlanes(W, H) {
      PLANES.forEach(p => {
        p.t = (p.t + p.speed) % 1;
        const { x, y, angle } = planePath(p, p.t, W, H);

        // Glowing trail
        ctx.save();
        for (let tr = 1; tr <= 22; tr++) {
          const trT = (p.t - tr * p.speed * 3.5 + 1) % 1;
          const { x: tx, y: ty } = planePath(p, trT, W, H);
          ctx.globalAlpha = (1 - tr / 22) * 0.50;
          ctx.beginPath();
          ctx.arc(tx, ty, 2.8 * (1 - tr / 22) + 0.5, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.restore();

        // Bright head glow
        ctx.save();
        ctx.shadowColor = p.color;
        ctx.shadowBlur  = 18;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();

        // Airplane emoji
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✈', 0, 0);
        ctx.restore();
      });
    }

    /* ── 7. Ground Vehicles ──────────────────────────────────── */
    function drawVehicles(W, H, t) {
      function fract(v) { return v - Math.floor(v); }

      // Train (left → right, bottom area)
      const trainX = fract(t * 0.055) * (W + 60) - 30;
      const trainY = H * 0.88;
      ctx.save();
      for (let i = 5; i >= 1; i--) {
        ctx.globalAlpha = (1 - i / 6) * 0.35;
        ctx.font = '20px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🚆', trainX - i * 16, trainY);
      }
      ctx.globalAlpha = 1;
      ctx.font = '24px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚆', trainX, trainY);
      ctx.restore();

      // Bus (right → left)
      const busX = W - fract(t * 0.042 + 0.5) * (W + 60) + 30;
      const busY = H * 0.93;
      ctx.save();
      ctx.font = '21px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚌', busX, busY);
      ctx.restore();

      // 3rd Airplane (lower altitude arc — replaces ship)
      const p3t = fract(t * 0.048 + 0.7);
      const p3x = p3t * (W + 80) - 40;
      const p3y = H * 0.35 + Math.sin(p3t * Math.PI * 1.5) * 45;
      const p3a = Math.atan2(Math.cos(p3t * Math.PI * 1.5) * 45 * 0.012, (W + 80) * 0.012);
      ctx.save();
      for (let tr = 1; tr <= 12; tr++) {
        const trT = fract(t * 0.048 + 0.7 - tr * 0.00015);
        const trX = trT * (W + 80) - 40;
        const trY = H * 0.35 + Math.sin(trT * Math.PI * 1.5) * 45;
        ctx.globalAlpha = (1 - tr / 12) * 0.38;
        ctx.beginPath();
        ctx.arc(trX, trY, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#f472b6';
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowColor = '#f472b6';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p3x, p3y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.save();
      ctx.translate(p3x, p3y);
      ctx.rotate(p3a);
      ctx.font = '18px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✈', 0, 0);
      ctx.restore();
      ctx.restore();
    }

    /* ── 8. Silhouette forest & ground ──────────────────────── */
    function drawForest(W, H) {
      const groundY = H * 0.78;
      const treeColor = '#060416';   // very dark, matching image

      // Ground fill
      const groundGrad = ctx.createLinearGradient(0, groundY, 0, H);
      groundGrad.addColorStop(0, '#07051a');
      groundGrad.addColorStop(1, '#030211');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, groundY, W, H - groundY);

      // Trees silhouette
      ctx.fillStyle = treeColor;
      const step = 28;
      for (let x = -step / 2; x < W + step; x += step) {
        const h = 55 + Math.sin(x * 0.08) * 22 + (x % 55) * 0.18;
        const bx = x + Math.sin(x * 0.15) * 6;
        // Pine shape
        ctx.beginPath();
        ctx.moveTo(bx, groundY + 4);
        ctx.lineTo(bx - 12, groundY + h * 0.6);
        ctx.lineTo(bx - 7,  groundY + h * 0.6);
        ctx.lineTo(bx - 15, groundY + h);
        ctx.lineTo(bx + 15, groundY + h);
        ctx.lineTo(bx + 7,  groundY + h * 0.6);
        ctx.lineTo(bx + 12, groundY + h * 0.6);
        ctx.closePath();
        ctx.fill();
      }

      // Left cliff with deer silhouette
      ctx.fillStyle = treeColor;
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, groundY + 5);
      ctx.lineTo(W * 0.08, groundY - 60);
      ctx.lineTo(W * 0.13, groundY - 80);
      ctx.lineTo(W * 0.17, groundY - 70);
      ctx.lineTo(W * 0.20, groundY);
      ctx.closePath();
      ctx.fill();

      // Deer on cliff
      ctx.font = '18px serif';
      ctx.globalAlpha = 0.7;
      ctx.fillText('🦌', W * 0.13 - 9, groundY - 88);
      ctx.globalAlpha = 1;
    }

    /* ── Card mask: dark rect behind card area so globe never shows through ── */
    function drawCardMask(W, H) {
      // Card is centered, ~420px wide, ~560px tall max
      const cw = Math.min(440, W * 0.9);
      const ch = Math.min(580, H * 0.9);
      const cx = (W - cw) / 2;
      const cy = (H - ch) / 2;
      // Dark radial to fade naturally at card edges
      const g = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(cw, ch) * 0.72);
      g.addColorStop(0.0, 'rgba(6,5,26,0.88)');
      g.addColorStop(0.7, 'rgba(6,5,26,0.60)');
      g.addColorStop(1.0, 'rgba(6,5,26,0.00)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    /* ── Hover ripple: glow ring at mouse position ────────────── */
    function drawMouseEffect(W, H, t) {
      if (mouse.x < 0 || mouse.x > W) return;
      const pulse = 0.5 + 0.5 * Math.sin(t * 5);
      const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 80 + pulse * 30);
      g.addColorStop(0,   `rgba(34,238,255,${0.10 * pulse})`);
      g.addColorStop(0.5, `rgba(155,89,255,${0.06 * pulse})`);
      g.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // Nearby stars get extra brightness — handled via globalAlpha boost in drawStars
      // Nearby planes get a speed boost
      PLANES.forEach(p => {
        const { x, y } = planePath(p, p.t, W, H);
        const dist = Math.hypot(x - mouse.x, y - mouse.y);
        if (dist < 150) {
          // Draw extra glow ring around plane
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, 28 + pulse * 12, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(34,238,255,${0.35 * (1 - dist/150)})`;
          ctx.lineWidth = 1.5;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.restore();
        }
      });
    }

    /* ── Main loop ───────────────────────────────────────────── */
    function draw() {
      const W = canvas.width;
      const H = canvas.height;
      tick += 0.010;

      ctx.clearRect(0, 0, W, H);

      drawBackground(W, H);
      drawStars(W, H, tick);
      drawAurora(W, H, tick);
      drawGlobe(W, H, tick);
      drawMonuments(W, H, tick);
      drawPlanes(W, H);
      drawVehicles(W, H, tick);
      drawMouseEffect(W, H, tick); // ← hover ripple on top of everything

      animFrame = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full -z-20"
      style={{ display: 'block' }}
    />
  );
}
