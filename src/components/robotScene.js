import * as THREE from 'three';

// Builds Robo with plain Three.js and runs his animation loop.
// `bot` is a shared mutable object: { talking, act, actT, look:{x,y}, scrollKick }.
// Returns a cleanup function.
export function createRobotScene(canvas, bot) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0.35, 8.4);
  camera.lookAt(0, 0.05, 0);

  const accent = 0x6e7dff;
  const eyeC = 0x8fd8ff;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x3a3d46, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 2.6);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(accent, 3);
  rim.position.set(-4, 2, -3);
  scene.add(rim);
  const rim2 = new THREE.DirectionalLight(0xffc2a8, 1.8);
  rim2.position.set(4, 1, -3);
  scene.add(rim2);

  const shell = new THREE.MeshPhysicalMaterial({ color: 0xf3f3ef, roughness: 0.22, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.08 });
  const dark = new THREE.MeshPhysicalMaterial({ color: 0x0d0e10, roughness: 0.12, metalness: 0.4, clearcoat: 1, clearcoatRoughness: 0.05 });
  const joint = new THREE.MeshStandardMaterial({ color: 0x2b2e33, roughness: 0.45, metalness: 0.7 });
  const glow = new THREE.MeshBasicMaterial({ color: eyeC });
  const glowSoft = new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.85 });
  const S = (r, ws = 48, hs = 32) => new THREE.SphereGeometry(r, ws, hs);

  const root = new THREE.Group();
  scene.add(root);
  const rig = new THREE.Group();
  root.add(rig);

  const head = new THREE.Group();
  head.position.y = 1.05;
  rig.add(head);
  const skull = new THREE.Mesh(S(1), shell);
  skull.scale.set(1.28, 1, 1.05);
  head.add(skull);
  const visor = new THREE.Mesh(S(1), dark);
  visor.scale.set(1.04, 0.7, 0.62);
  visor.position.z = 0.5;
  head.add(visor);
  const eyes = new THREE.Group();
  eyes.position.z = 1.06;
  head.add(eyes);
  const eyeL = new THREE.Mesh(S(0.16, 24, 16), glow);
  eyeL.scale.set(1, 1.35, 0.45);
  eyeL.position.x = -0.36;
  eyes.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.36;
  eyes.add(eyeR);
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.04), glow);
  mouth.position.set(0, -0.3, 1.08);
  mouth.visible = false;
  head.add(mouth);
  [-1, 1].forEach((s) => {
    const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.22, 32), joint);
    ear.rotation.z = Math.PI / 2;
    ear.position.x = s * 1.27;
    head.add(ear);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.035, 12, 40), glowSoft);
    ring.rotation.y = Math.PI / 2;
    ring.position.x = s * 1.39;
    head.add(ring);
  });
  const ant = new THREE.Group();
  ant.position.y = 0.95;
  head.add(ant);
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.5, 12), joint);
  stalk.position.y = 0.25;
  ant.add(stalk);
  const tip = new THREE.Mesh(S(0.12, 24, 16), glow);
  tip.position.y = 0.55;
  ant.add(tip);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.25, 24), joint);
  neck.position.y = 0.02;
  rig.add(neck);
  const torso = new THREE.Group();
  torso.position.y = -0.62;
  rig.add(torso);
  const belly = new THREE.Mesh(S(1), shell);
  belly.scale.set(0.95, 0.82, 0.78);
  torso.add(belly);
  const plate = new THREE.Mesh(S(1), dark);
  plate.scale.set(0.48, 0.38, 0.2);
  plate.position.z = 0.62;
  torso.add(plate);
  const core = new THREE.Mesh(S(0.11, 24, 16), glow);
  core.position.z = 0.8;
  torso.add(core);

  const arm = (s) => {
    const g = new THREE.Group();
    g.position.set(s * 0.98, -0.32, 0);
    rig.add(g);
    g.add(new THREE.Mesh(S(0.2, 24, 16), joint));
    const up = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.62, 20), shell);
    up.position.y = -0.36;
    g.add(up);
    const hand = new THREE.Mesh(S(0.2, 24, 16), shell);
    hand.position.y = -0.74;
    g.add(hand);
    return g;
  };
  const armL = arm(-1);
  const armR = arm(1);

  const jet = new THREE.Group();
  jet.position.y = -1.5;
  rig.add(jet);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.7, 24), glowSoft);
  flame.rotation.x = Math.PI;
  flame.position.y = -0.32;
  jet.add(flame);
  const flameCore = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.4, 16), new THREE.MeshBasicMaterial({ color: 0xe9f6ff }));
  flameCore.rotation.x = Math.PI;
  flameCore.position.y = -0.2;
  jet.add(flameCore);
  jet.add(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.2, 0.18, 24), joint));

  const sc = document.createElement('canvas');
  sc.width = sc.height = 128;
  const sx = sc.getContext('2d');
  const gr = sx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(28,34,48,.35)');
  gr.addColorStop(1, 'rgba(28,34,48,0)');
  sx.fillStyle = gr;
  sx.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 2.4),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -2.45;
  root.add(shadow);

  const size = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  size();
  const ro = 'ResizeObserver' in window ? new ResizeObserver(size) : null;
  ro?.observe(canvas);

  const L = (a, b, t) => a + (b - a) * t;
  let t = 0;
  let last = performance.now();
  let blinkAt = 2;
  let blinkT = -1;
  let idleAt = 1.2;
  let idleI = 0;
  const idleMoves = ['wave', 'spin', 'jump', 'wave', 'nod'];
  let raf = 0;

  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    if (document.hidden) {
      last = now;
      return;
    }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;
    const fl = reduce ? 0 : Math.sin(t * 1.8) * 0.14;
    let jumpY = 0, spin = 0, sqx = 1, sqy = 1, wave = 0, nod = 0;
    if (bot.act) {
      bot.actT += dt;
      const p = bot.actT;
      if (bot.act === 'jump') {
        const d = 0.8, k = Math.min(1, p / d);
        if (k < 0.2) { sqx = 1 + 0.12 * (k / 0.2); sqy = 1 - 0.14 * (k / 0.2); }
        else if (k < 0.75) { const u = (k - 0.2) / 0.55; jumpY = Math.sin(u * Math.PI) * 1.1; sqx = 0.94; sqy = 1.08; }
        else { const u = (k - 0.75) / 0.25; sqx = 1 + 0.1 * Math.sin(u * Math.PI); sqy = 1 - 0.1 * Math.sin(u * Math.PI); }
        if (p > d) bot.act = null;
      } else if (bot.act === 'spin') {
        const d = 1.1, k = Math.min(1, p / d);
        spin = (1 - Math.pow(1 - k, 3)) * Math.PI * 2;
        jumpY = Math.sin(k * Math.PI) * 0.35;
        if (p > d) bot.act = null;
      } else if (bot.act === 'wave') {
        wave = Math.min(1, p / 0.25) * Math.min(1, Math.max(0, (2.2 - p) / 0.3));
        if (p > 2.2) bot.act = null;
      } else if (bot.act === 'nod') {
        nod = Math.sin(p * 12) * 0.18 * Math.max(0, 1 - p / 1.2);
        if (p > 1.2) bot.act = null;
      }
    }
    bot.scrollKick *= 0.92;
    const kick = bot.scrollKick;
    rig.position.y = fl + jumpY;
    rig.scale.set(sqx, sqy, sqx);
    const lx = bot.look.x, ly = bot.look.y;
    root.rotation.y = L(root.rotation.y, lx * 0.35, 0.08);
    rig.rotation.y = spin;
    rig.rotation.x = L(rig.rotation.x, kick * 0.25, 0.1);
    head.rotation.y = L(head.rotation.y, lx * 0.55, 0.1);
    head.rotation.x = L(head.rotation.x, ly * 0.32 + nod, 0.12);
    head.rotation.z = L(head.rotation.z, -lx * 0.08 + (bot.talking ? Math.sin(t * 6) * 0.05 : 0), 0.1);
    torso.rotation.y = L(torso.rotation.y, lx * 0.15, 0.08);
    eyes.position.x = L(eyes.position.x, lx * 0.07, 0.2);
    eyes.position.y = L(eyes.position.y, -ly * 0.05, 0.2);
    ant.rotation.z = Math.sin(t * 3.2) * 0.18 + (jumpY ? -0.3 : 0) - kick * 0.4;
    armL.rotation.z = -0.18 - Math.sin(t * 1.8) * 0.08 + kick * 0.3;
    armL.rotation.x = Math.sin(t * 1.8 + 1) * 0.1;
    armR.rotation.z = L(0.18 + Math.sin(t * 1.8) * 0.08 - kick * 0.3, 2.55 + Math.sin(t * 13) * 0.32, wave);
    const fk = 0.8 + Math.random() * 0.35 + Math.abs(kick) * 0.6;
    flame.scale.set(1, fk, 1);
    flameCore.scale.set(1, fk * 0.9, 1);
    core.scale.setScalar(1 + Math.sin(t * 4) * 0.12);
    shadow.scale.setScalar(1 - (fl + jumpY) * 0.35);
    shadow.material.opacity = Math.max(0.25, 1 - (fl + jumpY) * 0.6);
    if (t > blinkAt && blinkT < 0) blinkT = 0;
    if (blinkT >= 0) {
      blinkT += dt;
      const b = blinkT < 0.07 ? 1 - blinkT / 0.07 : Math.min(1, (blinkT - 0.07) / 0.07);
      eyeL.scale.y = eyeR.scale.y = 1.35 * Math.max(0.08, b);
      if (blinkT > 0.14) { blinkT = -1; blinkAt = t + 2.5 + Math.random() * 3; }
    }
    const happy = bot.act === 'jump' || bot.act === 'wave';
    eyeL.scale.x = eyeR.scale.x = L(eyeL.scale.x, happy ? 1.25 : 1, 0.2);
    mouth.visible = bot.talking;
    if (bot.talking) mouth.scale.y = 0.6 + Math.abs(Math.sin(t * 17)) * 2.4;
    if (!reduce && !bot.talking && !bot.act && t > idleAt) {
      bot.act = idleMoves[idleI++ % idleMoves.length];
      bot.actT = 0;
      idleAt = t + 6 + Math.random() * 2;
    }
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    ro?.disconnect();
    renderer.dispose();
    scene.traverse((o) => {
      o.geometry?.dispose?.();
      o.material?.map?.dispose?.();
      o.material?.dispose?.();
    });
  };
}
