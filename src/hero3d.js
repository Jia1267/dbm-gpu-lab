/* Exploded-view GPU for the home hero. The card comes apart layer by layer as the pointer gets close. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const L = 30.4, W = 13.7; // card length (x) and height (z), cm

const mat = {
  alu: new THREE.MeshStandardMaterial({ color: 0x2a2f37, metalness: 0.85, roughness: 0.36 }),
  fin: new THREE.MeshStandardMaterial({ color: 0x56606c, metalness: 0.9, roughness: 0.32 }),
  copper: new THREE.MeshStandardMaterial({ color: 0xc8733f, metalness: 1, roughness: 0.26 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xd8ab45, metalness: 1, roughness: 0.22 }),
  chip: new THREE.MeshStandardMaterial({ color: 0x16191d, metalness: 0.25, roughness: 0.42 }),
  die: new THREE.MeshStandardMaterial({ color: 0x9aa3ae, metalness: 0.95, roughness: 0.12 }),
  sub: new THREE.MeshStandardMaterial({ color: 0x2d3a26, metalness: 0.2, roughness: 0.5 }),
  choke: new THREE.MeshStandardMaterial({ color: 0x4a5058, metalness: 0.6, roughness: 0.45 }),
  steel: new THREE.MeshStandardMaterial({ color: 0xa6afb9, metalness: 1, roughness: 0.32 }),
  hole: new THREE.MeshStandardMaterial({ color: 0x0b0e12, metalness: 0.2, roughness: 0.8 }),
  accent: new THREE.MeshStandardMaterial({ color: 0x245ae8, emissive: 0x2f6bff, emissiveIntensity: 2.2, roughness: 0.4 }),
};

function pcbTexture() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#0c2219'; g.fillRect(0, 0, 1024, 512);
  let s = 7;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  g.strokeStyle = 'rgba(70,140,105,.35)'; g.lineWidth = 2;
  for (let i = 0; i < 160; i++) {
    let x = r() * 1024, y = r() * 512;
    g.beginPath(); g.moveTo(x, y);
    for (let k = 0; k < 3; k++) { if (r() > 0.5) x += (r() - 0.5) * 300; else y += (r() - 0.5) * 200; g.lineTo(x, y); }
    g.stroke();
  }
  g.fillStyle = 'rgba(200,170,90,.5)';
  for (let i = 0; i < 260; i++) g.fillRect(r() * 1024, r() * 512, 3, 3);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function box(w, h, d, m, x = 0, y = 0, z = 0, round = 0) {
  const geo = round ? new RoundedBoxGeometry(w, h, d, 2, round) : new THREE.BoxGeometry(w, h, d);
  const o = new THREE.Mesh(geo, m);
  o.position.set(x, y, z);
  return o;
}

function build() {
  const layers = [];
  const add = (name, objs, lift, slide = 0, anchorY) => {
    const g = new THREE.Group();
    objs.forEach((o) => g.add(o));
    layers.push({ g, lift, slide, anchorY });
  };

  // 0 backplate
  const bp = [box(L - 0.4, 0.22, W - 0.6, mat.alu, 0, 0.11, 0, 0.08)];
  for (let i = 0; i < 9; i++) bp.push(box(0.5, 0.03, W - 4, mat.hole, -L / 2 + 5 + i * 1.1, 0.23, 0));
  add('backplate', bp, 0, 0, 0.25);

  // 1 PCB with die, memory, power stages and the PCIe edge
  const pcbMat = new THREE.MeshStandardMaterial({ map: pcbTexture(), metalness: 0.15, roughness: 0.55 });
  const pcb = [box(L - 1, 0.16, W - 1.2, pcbMat, 0, 0.38, 0.3)];
  pcb.push(box(9.5, 0.16, 1, pcbMat, 2, 0.38, -W / 2 + 0.4));
  for (let i = 0; i < 26; i++) pcb.push(box(0.22, 0.17, 0.75, mat.gold, -2.6 + i * 0.36, 0.38, -W / 2 + 0.25));
  pcb.push(box(4.6, 0.12, 4.6, mat.sub, 1, 0.52, 0.6), box(2.8, 0.1, 2.8, mat.die, 1, 0.62, 0.6));
  [[-3.2, -1.6], [-3.2, 0.6], [-3.2, 2.8], [5.2, -1.6], [5.2, 0.6], [5.2, 2.8], [-0.4, -2.6], [2.4, -2.6], [-0.4, 3.9], [2.4, 3.9]].forEach(([x, z]) => pcb.push(box(1.3, 0.12, 1.3, mat.chip, x, 0.52, z)));
  for (let i = 0; i < 12; i++) pcb.push(box(0.9, 0.55, 0.9, mat.choke, -11 + i * 1.15, 0.72, 4.6, 0.08), box(0.9, 0.55, 0.9, mat.choke, -11 + i * 1.15, 0.72, -3.2, 0.08));
  const caps = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16, 0.16, 0.4, 12), mat.steel, 40);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 40; i++) { m4.makeTranslation(9 + (i % 8) * 0.55, 0.66, -4 + Math.floor(i / 8) * 1.9); caps.setMatrixAt(i, m4); }
  pcb.push(caps);
  add('pcb', pcb, 1.7, 0, 0.9);

  // 2 vapor chamber
  add('vc', [box(L - 4, 0.3, W - 3.2, mat.copper, 0.6, 1.05, 0.6, 0.1)], 3.4, 0, 1.2);

  // 3 heat pipes
  const pipes = [];
  for (let i = 0; i < 5; i++) {
    const z = -3.4 + i * 1.75;
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-L / 2 + 2.2, 2.8, z), new THREE.Vector3(-L / 2 + 2.6, 1.5, z), new THREE.Vector3(-L / 2 + 4.5, 1.45, z), new THREE.Vector3(L / 2 - 4.5, 1.45, z), new THREE.Vector3(L / 2 - 2.6, 1.5, z), new THREE.Vector3(L / 2 - 2.2, 2.8, z)]);
    pipes.push(new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.3, 14, false), mat.copper));
  }
  add('pipes', pipes, 5.4, 0, 2.9);

  // 4 fin stack
  const nf = 64, fins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, 2.4, W - 1.6), mat.fin, nf);
  for (let i = 0; i < nf; i++) { m4.makeTranslation(-L / 2 + 1.3 + i * ((L - 2.6) / (nf - 1)), 2.55, 0.3); fins.setMatrixAt(i, m4); }
  add('fins', [fins, box(L - 2.4, 0.08, W - 1.6, mat.fin, 0, 1.36, 0.3)], 7.6, 0, 3.8);

  // 5 shroud
  // open-top frame: end caps plus rails, so the fins show through like a passive server card
  const sh = [box(1.2, 4.2, W, mat.alu, -L / 2 + 0.6, 2.1, 0, 0.12), box(1.2, 4.2, W, mat.alu, L / 2 - 0.6, 2.1, 0, 0.12), box(L - 2.2, 0.32, 0.7, mat.alu, 0, 4.0, W / 2 - 0.35, 0.1), box(L - 2.2, 0.32, 0.7, mat.alu, 0, 4.0, -W / 2 + 0.35, 0.1), box(L - 6, 0.04, 0.16, mat.accent, 0, 4.17, W / 2 - 0.35)];
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => { const sc = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 16), mat.steel); sc.position.set(a * (L / 2 - 0.6), 4.22, b * (W / 2 - 1.4)); sh.push(sc); });
  add('shroud', sh, 10.4, 0, 4.2);

  // 6 I/O bracket (slides out sideways)
  const br = [box(0.14, 4.3, W - 0.4, mat.steel, -L / 2 - 0.15, 2.0, 0)];
  [[-3.6], [-1.2], [1.2], [3.6]].forEach(([z]) => br.push(box(0.16, 0.7, 1.6, mat.hole, -L / 2 - 0.15, 1.5, z)));
  add('bracket', br, 0, -2.6, 4.3);
  return layers;
}

export function mount(host, section, labels) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  const key = new THREE.DirectionalLight(0xfff1e0, 2.2); key.position.set(-10, 20, 12); scene.add(key);
  const rim = new THREE.DirectionalLight(0x4d7cff, 3); rim.position.set(12, 6, -18); scene.add(rim);

  const card = new THREE.Group();
  const layers = build();
  layers.forEach((l) => card.add(l.g));
  card.rotation.set(0, -0.62, 0);
  scene.add(card);

  // soft contact shadow
  const sc = document.createElement('canvas'); sc.width = sc.height = 256;
  const sg = sc.getContext('2d'), grd = sg.createRadialGradient(128, 128, 10, 128, 128, 128);
  grd.addColorStop(0, 'rgba(0,0,0,.6)'); grd.addColorStop(1, 'rgba(0,0,0,0)'); sg.fillStyle = grd; sg.fillRect(0, 0, 256, 256);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(L * 1.5, W * 1.9), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -0.05; card.add(shadow);

  const cam = new THREE.PerspectiveCamera(26, 1, 1, 400);
  const target = new THREE.Vector3(2.6, 4.5, 0);

  // labels
  const lw = document.createElement('div'); lw.className = 'hx-labels'; host.appendChild(lw);
  const tags = labels.map((lb) => { if (!lb) return null; const [k, v] = lb; const d = document.createElement('div'); d.className = 'hx-tag'; d.innerHTML = '<div class="in"><i></i><span class="k"></span><span class="v"></span></div>'; d.querySelector('.k').textContent = k; d.querySelector('.v').textContent = v; lw.appendChild(d); return d; });

  let w = 1, h = 1;
  const size = () => {
    w = host.clientWidth; h = host.clientHeight;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    const narrow = w < 700;
    cam.fov = narrow ? 34 : 26;
    cam.position.set(2.6, 30, 66).multiplyScalar(narrow ? 0.95 : 1);
    cam.lookAt(target);
    cam.updateProjectionMatrix();
    dirty = true;
  };

  let t = 0, goal = 0, pinned = false, mx = 0, my = 0, rx = 0, ry = 0, dirty = true, raf = 0, visible = true;
  const n = layers.length;
  const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3));
  const v = new THREE.Vector3();

  const onMove = (e) => {
    if (e.pointerType === 'touch') return;
    const r = host.getBoundingClientRect();
    v.set(0, 2, 0).applyMatrix4(card.matrixWorld).project(cam);
    const cx = r.left + (v.x * 0.5 + 0.5) * r.width, cy = r.top + (-v.y * 0.5 + 0.5) * r.height;
    const d = Math.hypot(e.clientX - cx, e.clientY - cy);
    const near = Math.min(r.width, r.height) * 0.28, far = Math.min(r.width, r.height) * 0.75;
    if (!pinned) goal = 1 - Math.min(1, Math.max(0, (d - near) / (far - near)));
    mx = Math.max(-1, Math.min(1, (e.clientX - cx) / r.width));
    my = Math.max(-1, Math.min(1, (e.clientY - cy) / r.height));
    dirty = true;
  };
  const onLeave = () => { if (!pinned) goal = 0; mx = my = 0; dirty = true; };
  section.addEventListener('pointermove', onMove);
  section.addEventListener('pointerleave', onLeave);

  const frame = () => {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    const k = reduce ? 1 : 0.07;
    const dt = goal - t, drx = my * 0.08 - rx, dry = mx * 0.22 - ry;
    if (!dirty && Math.abs(dt) < 1e-4 && Math.abs(drx) < 1e-4 && Math.abs(dry) < 1e-4) return;
    dirty = false;
    t += dt * k; rx += drx * (reduce ? 1 : 0.06); ry += dry * (reduce ? 1 : 0.06);
    card.rotation.set(rx, -0.62 + ry, 0);
    // top layers lift first, so the card opens from the outside in
    const span = 0.45;
    layers.forEach((l, i) => {
      const order = l.slide ? 0 : n - 2 - i;
      const s = ease((t * (1 + span * (n - 1)) - span * Math.max(0, order)) );
      l.g.position.y = l.lift * s;
      l.g.position.x = l.slide * s;
      l.s = s;
    });
    card.updateMatrixWorld();
    renderer.render(scene, cam);
    // labels: pin each to the right-hand end of its layer
    layers.forEach((l, i) => {
      let best = null;
      for (const ex of [-L / 2, L / 2]) {
        v.set(l.slide ? -L / 2 - 0.2 : ex + Math.sign(ex) * 0.8, l.anchorY, l.slide ? W / 2 : W / 2).applyMatrix4(l.g.matrixWorld).project(cam);
        const px = (v.x * 0.5 + 0.5) * w, py = (-v.y * 0.5 + 0.5) * h;
        if (!best || px > best[0] || l.slide) best = [px, py];
        if (l.slide) break;
      }
      const o = Math.max(0, Math.min(1, (l.s - 0.55) / 0.45)) * (i === 0 ? Math.min(1, t * 1.6 - 0.6) : 1);
      const tg = tags[i];
      if (!tg) return;
      tg.style.opacity = o.toFixed(3);
      tg.style.transform = `translate(${best[0].toFixed(1)}px,${best[1].toFixed(1)}px)`;
      tg.classList.toggle('left', !!l.slide);
    });
  };

  const ro = new ResizeObserver(size); ro.observe(host);
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; dirty = true; }); io.observe(host);
  size();
  frame();

  return {
    pin(on) { pinned = on; goal = on ? 1 : 0; dirty = true; },
    destroy() {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      section.removeEventListener('pointermove', onMove); section.removeEventListener('pointerleave', onLeave);
      renderer.dispose(); pm.dispose(); host.innerHTML = '';
    },
  };
}
