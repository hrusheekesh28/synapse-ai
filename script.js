/**
 * SYNAPSE AI — ADVANCED NEURAL RESEARCH LABORATORY
 * Motion Architecture & Interactive Systems Engine
 * Vanilla JavaScript (ES6+), WebGL, Web Audio API, Canvas 2D
 */

(() => {
  'use strict';

  /* ==========================================================================
     01. GLOBAL STATE & SYSTEM CONFIGURATION
     ========================================================================== */
  const SYSTEM_CONFIG = {
    audioEnabled: false,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0, normalizedX: 0, normalizedY: 0 },
    windowSize: { width: window.innerWidth, height: window.innerHeight }
  };

  /* ==========================================================================
     02. AUDIO SYNTHESIZER ENGINE (WEB AUDIO API)
     ========================================================================== */
  class AcousticSynthesizer {
    constructor() {
      this.ctx = null;
      this.isMuted = true;
      this.init();
    }

    init() {
      // Check stored preference
      const stored = localStorage.getItem('synapse_audio_mute');
      if (stored !== null) {
        this.isMuted = stored === 'true';
      }
      this.updateUI();
    }

    ensureContext() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.ensureContext();
      this.isMuted = !this.isMuted;
      localStorage.setItem('synapse_audio_mute', this.isMuted);
      this.updateUI();
      if (!this.isMuted) {
        this.playFeedback('toggle');
      }
    }

    updateUI() {
      const btn = document.getElementById('audio-toggle');
      if (!btn) return;
      const iconOn = btn.querySelector('.audio-icon-on');
      const iconOff = btn.querySelector('.audio-icon-off');
      if (this.isMuted) {
        if (iconOn) iconOn.style.display = 'none';
        if (iconOff) iconOff.style.display = 'block';
        btn.setAttribute('aria-label', 'Unmute Acoustic Synthesizer');
      } else {
        if (iconOn) iconOn.style.display = 'block';
        if (iconOff) iconOff.style.display = 'none';
        btn.setAttribute('aria-label', 'Mute Acoustic Synthesizer');
      }
    }

    playFeedback(type = 'click') {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === 'click') {
        // High-frequency tactile transient
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.045);
      } else if (type === 'beep') {
        // Minimal confirmation chirp
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1760, now + 0.05);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.13);
      } else if (type === 'toggle') {
        // Mode transition chord
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(1040, now + 0.08);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'type') {
        // Keyboard click tick
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800 + Math.random() * 400, now);
        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
        osc.start(now);
        osc.stop(now + 0.025);
      }
    }
  }

  const audioSynth = new AcousticSynthesizer();

  /* ==========================================================================
     03. SYSTEM PRELOADER ENGINE
     ========================================================================== */
  function initPreloader() {
    const preloader = document.getElementById('preloader');
    const ring = document.getElementById('preloader-ring');
    const counter = document.getElementById('preloader-counter');
    const barFill = document.getElementById('preloader-bar-fill');
    const textStatus = document.getElementById('preloader-text');

    if (!preloader) return;

    const statusStages = [
      { progress: 15, text: 'ALLOCATING TENSOR BUFFERS...' },
      { progress: 38, text: 'CALIBRATING POINCARÉ MANIFOLDS...' },
      { progress: 62, text: 'SYNCHRONIZING 48 GLOBAL NODES...' },
      { progress: 85, text: 'VERIFYING FORMAL LOGIC PROOFS...' },
      { progress: 100, text: 'SYSTEM READY // SYNAPSE CORE ONLINE' }
    ];

    let currentProgress = 0;
    const circumference = 276.46; // 2 * PI * 44

    const updateStage = (prog) => {
      for (let i = statusStages.length - 1; i >= 0; i--) {
        if (prog >= statusStages[i].progress) {
          if (textStatus) textStatus.textContent = statusStages[i].text;
          break;
        }
      }
    };

    const interval = setInterval(() => {
      // Non-linear progress increment
      const step = Math.floor(Math.random() * 6) + 3;
      currentProgress = Math.min(100, currentProgress + step);

      if (counter) {
        counter.textContent = String(currentProgress).padStart(3, '0') + '%';
      }
      if (barFill) {
        barFill.style.width = currentProgress + '%';
      }
      if (ring) {
        const offset = circumference - (currentProgress / 100) * circumference;
        ring.style.strokeDashoffset = offset;
      }

      updateStage(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          preloader.classList.add('fade-out');
          document.body.classList.remove('loading');
          audioSynth.playFeedback('beep');
          triggerHeroReveal();
        }, 350);
      }
    }, 45);
  }

  /* ==========================================================================
     04. HERO 3D METALLIC NEURAL SPHERE (WEBGL SHADER ENGINE)
     ========================================================================== */
  class MetallicSphereWebGL {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
      this.isValid = !!this.gl;
      this.time = 0;
      this.mouseRot = { x: 0, y: 0, targetX: 0, targetY: 0 };
      this.markerCoord = document.getElementById('marker-coord');
      this.orbitalMarker = document.getElementById('orbital-marker');

      if (this.isValid) {
        this.initShaders();
        this.initBuffers();
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.render();
      } else {
        this.initCanvasFallback();
      }
    }

    initShaders() {
      const vsSource = `
        attribute vec2 a_position;
        varying vec2 v_uv;
        void main() {
          v_uv = a_position * 0.5 + 0.5;
          gl_Position = vec4(a_position, 0.0, 1.0);
        }
      `;

      // Precision Raymarched Metallic Sphere with Studio Reflections & Harmonic Perturbations
      const fsSource = `
        precision highp float;
        varying vec2 v_uv;
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform vec2 u_mouse;

        #define PI 3.14159265359

        mat2 rot(float a) {
          float s = sin(a), c = cos(a);
          return mat2(c, -s, s, c);
        }

        // Procedural Studio HDRI Environment Reflection
        vec3 getStudioReflection(vec3 r) {
          // Dark graphite base with crisp metallic specular strips
          float strip1 = smoothstep(0.85, 0.99, dot(r, normalize(vec3(1.0, 1.2, 0.8))));
          float strip2 = smoothstep(0.92, 0.99, dot(r, normalize(vec3(-1.2, -0.6, 0.7))));
          float horizon = smoothstep(-0.2, 0.2, r.y);
          
          vec3 col = vec3(0.08); // Obsidian dark metal base
          col += vec3(0.35) * horizon;
          col += vec3(0.95) * strip1 * 1.5;
          col += vec3(0.65) * strip2;
          
          // Subtle metallic chrome fresnel bands
          float band = sin(r.y * 14.0 + r.x * 6.0) * 0.05 + 0.05;
          col += vec3(band);
          return col;
        }

        // Surface Distance Function with Neural Harmonic Ripples
        float mapSphere(vec3 p) {
          // Rotate surface with mouse
          p.yz *= rot(u_mouse.y * 0.4);
          p.xz *= rot(u_mouse.x * 0.6);

          float t = u_time * 0.8;
          // Harmonic wave perturbations
          float ripple = sin(p.x * 6.0 + t) * sin(p.y * 6.0 - t * 0.7) * sin(p.z * 6.0 + t * 0.5) * 0.042;
          ripple += sin(p.x * 12.0 - t * 1.2) * cos(p.z * 12.0 + t) * 0.015;
          
          return length(p) - (0.84 + ripple);
        }

        vec3 calcNormal(vec3 p) {
          vec2 e = vec2(0.003, 0.0);
          return normalize(vec3(
            mapSphere(p + e.xyy) - mapSphere(p - e.xyy),
            mapSphere(p + e.yxy) - mapSphere(p - e.yxy),
            mapSphere(p + e.yyx) - mapSphere(p - e.yyx)
          ));
        }

        void main() {
          vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
          
          // Camera setup
          vec3 ro = vec3(0.0, 0.0, 2.4);
          vec3 rd = normalize(vec3(p, -1.8));

          // Raymarching
          float t = 0.0;
          float hit = -1.0;
          for (int i = 0; i < 64; i++) {
            vec3 pos = ro + rd * t;
            float d = mapSphere(pos);
            if (d < 0.001) {
              hit = t;
              break;
            }
            if (t > 4.5) break;
            t += d;
          }

          vec3 finalColor = vec3(0.0);
          float alpha = 0.0;

          if (hit > 0.0) {
            vec3 hitPos = ro + rd * hit;
            vec3 N = calcNormal(hitPos);
            vec3 V = -rd;
            vec3 R = reflect(rd, N);

            // Studio metallic lighting
            vec3 reflection = getStudioReflection(R);
            
            // Fresnel rim reflection
            float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.2);
            vec3 chrome = mix(reflection, vec3(1.0), fresnel * 0.85);

            // Key light specular highlight
            vec3 lightDir = normalize(vec3(1.0, 1.4, 1.8));
            float spec = pow(max(dot(reflect(-lightDir, N), V), 0.0), 48.0);
            chrome += vec3(spec * 1.2);

            // Shadowing & Ambient Occlusion
            float diff = max(dot(N, lightDir), 0.0) * 0.4 + 0.6;
            finalColor = chrome * diff;

            // Outer soft edge blending
            alpha = smoothstep(4.0, 1.5, hit);
          }

          // Vignette blend into pure deep black
          gl_FragColor = vec4(finalColor, alpha);
        }
      `;

      this.program = this.createProgram(vsSource, fsSource);
      this.gl.useProgram(this.program);

      this.uResolution = this.gl.getUniformLocation(this.program, 'u_resolution');
      this.uTime = this.gl.getUniformLocation(this.program, 'u_time');
      this.uMouse = this.gl.getUniformLocation(this.program, 'u_mouse');
    }

    createShader(type, source) {
      const shader = this.gl.createShader(type);
      this.gl.shaderSource(shader, source);
      this.gl.compileShader(shader);
      if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
        this.gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    createProgram(vsSource, fsSource) {
      const vs = this.createShader(this.gl.VERTEX_SHADER, vsSource);
      const fs = this.createShader(this.gl.FRAGMENT_SHADER, fsSource);
      const prog = this.gl.createProgram();
      this.gl.attachShader(prog, vs);
      this.gl.attachShader(prog, fs);
      this.gl.linkProgram(prog);
      if (!this.gl.getProgramParameter(prog, this.gl.LINK_STATUS)) {
        console.error('Program linking error:', this.gl.getProgramInfoLog(prog));
        return null;
      }
      return prog;
    }

    initBuffers() {
      const positionBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
      const positions = new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0
      ]);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

      const aPosition = this.gl.getAttribLocation(this.program, 'a_position');
      this.gl.enableVertexAttribArray(aPosition);
      this.gl.vertexAttribPointer(aPosition, 2, this.gl.FLOAT, false, 0, 0);
    }

    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    initCanvasFallback() {
      // 2D Canvas Fallback Wireframe Sphere
      const ctx = this.canvas.getContext('2d');
      if (!ctx) return;
      const renderFallback = () => {
        const w = this.canvas.width;
        const h = this.canvas.height;
        ctx.clearRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;
        const r = Math.min(w, h) * 0.38;

        // Radial metallic gradient
        const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#c0c0c0');
        grad.addColorStop(0.7, '#222222');
        grad.addColorStop(1, '#050505');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        requestAnimationFrame(renderFallback);
      };
      renderFallback();
    }

    render() {
      this.time += 0.015;

      // Mouse inertia smoothing
      this.mouseRot.x += (this.mouseRot.targetX - this.mouseRot.x) * 0.05;
      this.mouseRot.y += (this.mouseRot.targetY - this.mouseRot.y) * 0.05;

      this.gl.useProgram(this.program);
      this.gl.uniform2f(this.uResolution, this.canvas.width, this.canvas.height);
      this.gl.uniform1f(this.uTime, this.time);
      this.gl.uniform2f(this.uMouse, this.mouseRot.x, this.mouseRot.y);

      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

      // Update orbital telemetry readout
      if (this.markerCoord) {
        const theta = (42.18 + Math.sin(this.time * 0.5) * 8.4).toFixed(2);
        const phi = (108.92 + Math.cos(this.time * 0.4) * 12.1).toFixed(2);
        this.markerCoord.textContent = `θ: ${theta}° | φ: ${phi}°`;
      }

      if (this.orbitalMarker) {
        const offsetX = this.mouseRot.x * 30;
        const offsetY = this.mouseRot.y * 30;
        this.orbitalMarker.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      }

      requestAnimationFrame(() => this.render());
    }

    onMouseMove(normX, normY) {
      this.mouseRot.targetX = normX;
      this.mouseRot.targetY = normY;
    }
  }

  /* ==========================================================================
     05. AMBIENT BACKGROUND PARTICLES CANVAS
     ========================================================================== */
  class AmbientParticleMatrix {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.particleCount = window.innerWidth < 768 ? 35 : 65;
      this.mouse = { x: -1000, y: -1000, radius: 120 };

      this.resize();
      this.initParticles();
      window.addEventListener('resize', () => {
        this.resize();
        this.initParticles();
      });

      this.animate();
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }

    initParticles() {
      this.particles = [];
      for (let i = 0; i < this.particleCount; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          size: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.45 + 0.15
        });
      }
    }

    setMouse(x, y) {
      this.mouse.x = x;
      this.mouse.y = y;
    }

    animate() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];

        // Drift
        p.x += p.vx;
        p.y += p.vy;

        // Wrap boundaries
        if (p.x < 0) p.x = this.width;
        if (p.x > this.width) p.x = 0;
        if (p.y < 0) p.y = this.height;
        if (p.y > this.height) p.y = 0;

        // Mouse avoidance aura
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.mouse.radius) {
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          p.x -= (dx / dist) * force * 1.8;
          p.y -= (dy / dist) * force * 1.8;
        }

        // Render point
        this.ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();

        // Subtle connection lines between near neighbors
        for (let j = i + 1; j < this.particles.length; j++) {
          const p2 = this.particles[j];
          const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist2 < 110) {
            const lineAlpha = (1 - dist2 / 110) * 0.08;
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
            this.ctx.lineWidth = 0.6;
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.stroke();
          }
        }
      }

      requestAnimationFrame(() => this.animate());
    }
  }

  /* ==========================================================================
     06. PRODUCT CARDS PROCEDURAL VISUALIZERS
     ========================================================================== */
  function initProductCardVisualizers() {
    // 1. SYNAPSE VISION Visualizer: Reticles, 3D target coordinates, lidar points
    const initVisionVisual = () => {
      const canvas = document.getElementById('canvas-card-vision');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let angle = 0;

      const render = () => {
        const w = (canvas.width = canvas.parentElement.clientWidth);
        const h = (canvas.height = canvas.parentElement.clientHeight);
        ctx.clearRect(0, 0, w, h);

        angle += 0.02;
        const cx = w / 2;
        const cy = h / 2;

        // Radar circle tracks
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, 45, 0, Math.PI * 2);
        ctx.arc(cx, cy, 80, 0, Math.PI * 2);
        ctx.stroke();

        // Crosshairs
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.moveTo(cx - 95, cy);
        ctx.lineTo(cx + 95, cy);
        ctx.moveTo(cx, cy - 95);
        ctx.lineTo(cx, cy + 95);
        ctx.stroke();

        // Rotating target sweep line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * 80, cy + Math.sin(angle) * 80);
        ctx.stroke();

        // Tracked Target Boxes
        const boxX = cx + Math.sin(angle * 0.7) * 40;
        const boxY = cy + Math.cos(angle * 0.5) * 35;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(boxX - 16, boxY - 16, 32, 32);

        ctx.fillStyle = '#ffffff';
        ctx.font = '8px monospace';
        ctx.fillText(`ID_OBJ [${boxX.toFixed(0)}, ${boxY.toFixed(0)}]`, boxX - 16, boxY - 20);

        requestAnimationFrame(render);
      };
      render();
    };

    // 2. SYNAPSE CORE Visualizer: Neural Logic Lattice
    const initCoreVisual = () => {
      const canvas = document.getElementById('canvas-card-core');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let t = 0;

      const nodes = [
        { x: 0.2, y: 0.3 }, { x: 0.5, y: 0.2 }, { x: 0.8, y: 0.35 },
        { x: 0.35, y: 0.65 }, { x: 0.65, y: 0.7 }, { x: 0.5, y: 0.5 }
      ];

      const render = () => {
        const w = (canvas.width = canvas.parentElement.clientWidth);
        const h = (canvas.height = canvas.parentElement.clientHeight);
        ctx.clearRect(0, 0, w, h);
        t += 0.03;

        // Render Lattice Connections
        ctx.lineWidth = 1;
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const pulse = (Math.sin(t + i + j) + 1) * 0.5;
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + pulse * 0.35})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x * w, nodes[i].y * h);
            ctx.lineTo(nodes[j].x * w, nodes[j].y * h);
            ctx.stroke();
          }
        }

        // Render Nodes
        for (let i = 0; i < nodes.length; i++) {
          const nx = nodes[i].x * w;
          const ny = nodes[i].y * h;
          const pulse = (Math.sin(t * 1.5 + i) + 1) * 0.5;

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(nx, ny, 3.5 + pulse * 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.beginPath();
          ctx.arc(nx, ny, 8 + pulse * 4, 0, Math.PI * 2);
          ctx.stroke();
        }

        requestAnimationFrame(render);
      };
      render();
    };

    // 3. SYNAPSE VOICE Visualizer: Harmonic Acoustic Waveforms
    const initVoiceVisual = () => {
      const canvas = document.getElementById('canvas-card-voice');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let phase = 0;

      const render = () => {
        const w = (canvas.width = canvas.parentElement.clientWidth);
        const h = (canvas.height = canvas.parentElement.clientHeight);
        ctx.clearRect(0, 0, w, h);
        phase += 0.04;

        const cy = h / 2;
        const waveCount = 3;

        for (let k = 0; k < waveCount; k++) {
          ctx.beginPath();
          ctx.lineWidth = k === 0 ? 1.5 : 0.8;
          ctx.strokeStyle = k === 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.25)';

          for (let x = 0; x < w; x += 4) {
            const freq = 0.025 + k * 0.015;
            const amp = (30 - k * 8) * Math.sin(phase * 0.5);
            const y = cy + Math.sin(x * freq + phase + k) * amp * Math.sin((x / w) * Math.PI);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        // Center frequency spectrum bars
        const barCount = 24;
        const barWidth = 3;
        const startX = w / 2 - (barCount * 6) / 2;
        for (let b = 0; b < barCount; b++) {
          const barHeight = Math.abs(Math.sin(phase * 2 + b * 0.4)) * 32 + 4;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.fillRect(startX + b * 6, h - 35 - barHeight, barWidth, barHeight);
        }

        requestAnimationFrame(render);
      };
      render();
    };

    // 4. SYNAPSE ANALYTICS Visualizer: High-Dimensional Manifold Streams
    const initAnalyticsVisual = () => {
      const canvas = document.getElementById('canvas-card-analytics');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let offset = 0;

      const render = () => {
        const w = (canvas.width = canvas.parentElement.clientWidth);
        const h = (canvas.height = canvas.parentElement.clientHeight);
        ctx.clearRect(0, 0, w, h);
        offset += 1;

        // Grid stream lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        for (let y = 20; y < h; y += 25) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // Volatility Trend Line
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < w; x += 6) {
          const normX = (x + offset) * 0.03;
          const y = h * 0.55 + Math.sin(normX) * 25 + Math.cos(normX * 2.3) * 15;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // High-density scatter points
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (let p = 0; p < 18; p++) {
          const px = ((p * 45 + offset * 1.5) % w);
          const py = h * 0.4 + Math.sin(px * 0.05) * 35;
          ctx.fillRect(px, py, 2.5, 2.5);
        }

        requestAnimationFrame(render);
      };
      render();
    };

    initVisionVisual();
    initCoreVisual();
    initVoiceVisual();
    initAnalyticsVisual();
  }

  /* ==========================================================================
     07. INTELLIGENCE TOPOLOGY DIAGRAM & INSPECTOR
     ========================================================================== */
  function initArchitectureDiagram() {
    const nodes = document.querySelectorAll('.diagram-node');
    const inspId = document.getElementById('insp-id');
    const inspTitle = document.getElementById('insp-title');
    const inspDesc = document.getElementById('insp-desc');
    const inspStat1 = document.getElementById('insp-stat-1');
    const inspStat2 = document.getElementById('insp-stat-2');
    const inspStat3 = document.getElementById('insp-stat-3');
    const inspFormula = document.getElementById('insp-formula');

    const nodeData = {
      ingestion: {
        id: 'SUBSYSTEM // ARCH-NODE-01',
        title: 'Data Ingestion & Tensor Streams',
        desc: 'High-frequency multimodal ingestion pipeline capable of normalizing heterogeneous data streams across visual, symbolic, acoustic, and geometric sensor arrays with sub-microsecond serialization.',
        s1: '128.4 GB/s',
        s2: '0.03 ms',
        s3: '99.999%',
        formula: 'T(x) = ∫ Ψ(x, t) · e^(-iωt) dt ⊗ W_norm'
      },
      tensors: {
        id: 'SUBSYSTEM // ARCH-NODE-02',
        title: 'Machine Learning Sub-Graph Compiler',
        desc: 'Dynamic compilation on silicon transforming tensor DAGs into hardware-accelerated kernels with 88.4% structured parameter sparsity.',
        s1: '412.8 TFLOPS',
        s2: '0.05 ms',
        s3: '99.998%',
        formula: '∇_θ L = E_{x~D} [ ∇_θ log P_θ(x) · Q(x) ]'
      },
      core: {
        id: 'SUBSYSTEM // ARCH-NODE-03',
        title: 'Neural Networks & Deterministic Core',
        desc: 'Central cognitive substrate executing verifiable reasoning graphs across 1.40 Trillion parameters with zero probabilistic hallucination.',
        s1: '1.40 T Params',
        s2: '0.12 ms',
        s3: '100.00%',
        formula: 'G_det = (V, E) s.t. ∀ v ∈ V : Proof(v) ⊢ Axiom'
      },
      vision: {
        id: 'SUBSYSTEM // ARCH-NODE-04',
        title: 'Computer Vision & 4D NeRF Field',
        desc: 'Continuous spatiotemporal radiance fields calculating 6-DoF volumetric trajectories at 240Hz for real-time robotic interaction.',
        s1: '240 FPS / 8K',
        s2: '0.08 ms',
        s3: '99.994%',
        formula: 'C(r) = ∫ T(t) σ(r(t)) c(r(t), d) dt'
      },
      nlp: {
        id: 'SUBSYSTEM // ARCH-NODE-05',
        title: 'Natural Language & Symbolic Logic',
        desc: 'Hybrid neuro-symbolic grammar engine pairing dense semantic transformers with formal First-Order Logic theorem provers.',
        s1: '2M Tokens',
        s2: '0.04 ms',
        s3: '99.999%',
        formula: '∀ x (P(x) → Q(x)) ∧ P(a) ⊢ Q(a)'
      },
      actuation: {
        id: 'SUBSYSTEM // ARCH-NODE-06',
        title: 'Intelligent Automation & Mesh Consensus',
        desc: 'Decentralized orchestration runtime synchronizing millions of autonomous agents with hard mathematical safety bounds.',
        s1: '500K Agents',
        s2: '< 0.05 ms',
        s3: '100.00%',
        formula: 'S_bound = inf { ||u(t) - u*(t)|| : t ≥ 0 } ≤ ε'
      }
    };

    nodes.forEach(node => {
      node.addEventListener('click', () => {
        nodes.forEach(n => n.classList.remove('active'));
        node.classList.add('active');
        audioSynth.playFeedback('click');

        const key = node.dataset.node;
        const data = nodeData[key];
        if (!data) return;

        if (inspId) inspId.textContent = data.id;
        if (inspTitle) inspTitle.textContent = data.title;
        if (inspDesc) inspDesc.textContent = data.desc;
        if (inspStat1) inspStat1.textContent = data.s1;
        if (inspStat2) inspStat2.textContent = data.s2;
        if (inspStat3) inspStat3.textContent = data.s3;
        if (inspFormula) inspFormula.textContent = data.formula;
      });
    });
  }

  /* ==========================================================================
     08. INTERACTIVE AI DEMONSTRATION ("Experience Intelligence")
     ========================================================================== */
  function initInteractiveDemo() {
    const terminalBody = document.getElementById('demo-terminal-body');
    const inputForm = document.getElementById('demo-input-form');
    const userInput = document.getElementById('demo-user-input');
    const clearBtn = document.getElementById('demo-clear-btn');
    const modeTabs = document.querySelectorAll('.mode-tab');
    const promptPills = document.querySelectorAll('.prompt-pill');

    const diagTime = document.getElementById('diag-time');
    const diagTps = document.getElementById('diag-tps');
    const diagConf = document.getElementById('diag-conf');

    let currentMode = 'reasoning';
    let isStreaming = false;

    // Predefined Technical Intelligence Demonstration Engine
    const KNOWLEDGE_BASE = {
      reasoning: [
        {
          keywords: ['deterministic', 'hallucination', 'graph', 'proof'],
          response: `SYNAPSE Core avoids hallucinations through Bounded Deterministic Manifolds. Rather than sampling stochastically from unconstrained softmax probabilities:\n\n1. Axiomatic Gating: Every candidate thought vector passes through an integrated SMT (Satisfiability Modulo Theories) solver.\n2. Invariant Tracking: If an inference step lacks a deductive derivation trace from axioms, its execution branch collapses.\n3. Latent Constraint: Latent representations are mapped onto negative curvature Poincaré geometry, enforcing hierarchical rigor.`
        },
        {
          keywords: ['alignment', 'formal', 'safety'],
          response: `Verifiable Cognitive Alignment at SYNAPSE relies on Constructive Mathematical Invariants:\n\n- Loss formulations explicitly penalize violations of predefined formal predicates.\n- Policy execution layers are wrapped in cryptographically signed kernel containers.\n- Even during autonomous agentic execution loops, catastrophic divergence is mathematically impossible.`
        }
      ],
      vision: [
        {
          keywords: ['robot', 'perception', '6-dof', 'spatial', 'nerf'],
          response: `SYNAPSE VISION leverages a 4D Continuous Spatiotemporal Radiance Field:\n\n- Refresh: Sustained 240Hz frame rate with zero temporal frame latency.\n- Spatial Precision: Sub-millimeter coordinate localization across multi-spectral LiDAR and photon sensors.\n- Occlusion Invariance: Volumetric priors continuously hallucination-check hidden geometry.`
        }
      ],
      voice: [
        {
          keywords: ['speech', 'voice', 'audio', 'latency', 'acoustic'],
          response: `SYNAPSE VOICE synthesizes end-to-end neural phonetics with 45ms loop latency:\n\n- Micro-Prosody: Captures subconscious vocal inflection, breath dynamics, and emotional register.\n- Multi-Lingual: Unified phonetic latent manifold supporting zero-shot cross-lingual prosody transfer across 120 languages.`
        }
      ],
      analytics: [
        {
          keywords: ['tensor', 'data', 'throughput', 'ingest', 'bottleneck'],
          response: `In high-dimensional manifold analysis (SYNAPSE ANALYTICS):\n\n- Tensor Streams: 100M events/second normalized via zero-copy shared memory primitives.\n- Causal Inference: Identifies non-linear feedback loops in macroeconomic and supply-chain topologies.`
        }
      ]
    };

    const getSynthesizedResponse = (query, mode) => {
      const q = query.toLowerCase();
      const modeEntries = KNOWLEDGE_BASE[mode] || KNOWLEDGE_BASE.reasoning;

      for (const entry of modeEntries) {
        if (entry.keywords.some(k => q.includes(k))) {
          return entry.response;
        }
      }

      // Default smart fallback synthesizer
      return `SYNAPSE ${mode.toUpperCase()} Substrate evaluated query: "${query}"\n\nInference Analysis:\n- Dimension: 4096-D Latent Coordinates synchronized.\n- Formal Verification: Satisfiability confirmed in 0.08ms.\n- Deduction: The deterministic cognitive framework constructs verifiable derivation pathways across all selected node graphs, maintaining zero semantic drift and 99.999% fidelity.`;
    };

    const appendMessage = (sender, text, isUser = false) => {
      const msgDiv = document.createElement('div');
      msgDiv.className = `terminal-message ${isUser ? 'message-user' : 'message-synapse'}`;

      const timeStr = isUser ? 'USER // LOCAL INPUT' : 'SYNAPSE AI // INFERENCE';
      msgDiv.innerHTML = `
        <div class="msg-header">
          <span class="msg-avatar">${isUser ? 'USER' : 'SYNAPSE'}</span>
          <span class="msg-time mono-label">${timeStr}</span>
        </div>
        <div class="msg-content"><p>${text}</p></div>
      `;

      terminalBody.appendChild(msgDiv);
      terminalBody.scrollTop = terminalBody.scrollHeight;
      return msgDiv;
    };

    const streamResponse = (fullText) => {
      isStreaming = true;
      const msgDiv = document.createElement('div');
      msgDiv.className = 'terminal-message message-synapse';
      msgDiv.innerHTML = `
        <div class="msg-header">
          <span class="msg-avatar">SYNAPSE</span>
          <span class="msg-time mono-label">EMULATOR v4.2 // STREAMING</span>
        </div>
        <div class="msg-content"><p><span class="stream-text"></span><span class="typing-cursor"></span></p></div>
      `;
      terminalBody.appendChild(msgDiv);

      const streamSpan = msgDiv.querySelector('.stream-text');
      const cursor = msgDiv.querySelector('.typing-cursor');

      let charIndex = 0;
      const startTime = performance.now();

      const typeInterval = setInterval(() => {
        if (charIndex < fullText.length) {
          const char = fullText.charAt(charIndex);
          streamSpan.textContent += char;
          charIndex++;
          if (charIndex % 3 === 0) audioSynth.playFeedback('type');
          terminalBody.scrollTop = terminalBody.scrollHeight;
        } else {
          clearInterval(typeInterval);
          if (cursor) cursor.remove();
          isStreaming = false;

          const elapsed = (performance.now() - startTime).toFixed(2);
          const tokens = Math.round(fullText.split(/\s+/).length * 1.3);
          const tps = ((tokens / (elapsed / 1000)) || 184).toFixed(1);

          if (diagTime) diagTime.textContent = `${(elapsed / 10).toFixed(2)} ms`;
          if (diagTps) diagTps.textContent = tps;
          if (diagConf) diagConf.textContent = '99.98%';
          audioSynth.playFeedback('beep');
        }
      }, 16);
    };

    // Mode Selector tabs
    modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        modeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentMode = tab.dataset.mode;
        audioSynth.playFeedback('toggle');

        const modePlaceholders = {
          reasoning: "Query symbolic logic... (e.g., 'Explain deterministic graphs')",
          vision: "Query 3D spatial field... (e.g., 'Synthesize 6-DoF perception model')",
          voice: "Query acoustic synthesis... (e.g., 'Explain 45ms speech loop')",
          analytics: "Query tensor streaming... (e.g., 'Analyze 4096-D bottlenecks')"
        };
        if (userInput) userInput.placeholder = modePlaceholders[currentMode] || userInput.placeholder;
      });
    });

    // Preset Prompt Pills
    promptPills.forEach(pill => {
      pill.addEventListener('click', () => {
        if (isStreaming) return;
        const prompt = pill.dataset.prompt;
        if (userInput) userInput.value = prompt;
        inputForm.dispatchEvent(new Event('submit'));
      });
    });

    // Form Submit
    if (inputForm) {
      inputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (isStreaming) return;
        const query = userInput.value.trim();
        if (!query) return;

        appendMessage('user', query, true);
        userInput.value = '';

        const reply = getSynthesizedResponse(query, currentMode);
        setTimeout(() => {
          streamResponse(reply);
        }, 200);
      });
    }

    // Clear Button
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (isStreaming) return;
        terminalBody.innerHTML = `
          <div class="terminal-message message-synapse">
            <div class="msg-header">
              <span class="msg-avatar">SYNAPSE AI</span>
              <span class="msg-time mono-label">EMULATOR v4.2 // RESET</span>
            </div>
            <div class="msg-content">
              <p>Session memory buffers purged. Cognitive graph reset to baseline tensor weights.</p>
            </div>
          </div>
        `;
        audioSynth.playFeedback('click');
      });
    }
  }

  /* ==========================================================================
     09. PRODUCT DEEP DIVE MODAL SYSTEM
     ========================================================================== */
  function initProductModals() {
    const modal = document.getElementById('product-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const modalCategory = document.getElementById('modal-category');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-long-desc');
    const modalStatsList = document.getElementById('modal-stats-list');
    const modalBenchVal = document.getElementById('modal-bench-val');
    const modalBenchBar = document.getElementById('modal-bench-bar');
    const modalCodeSnippet = document.getElementById('modal-code-snippet');
    const exploreButtons = document.querySelectorAll('.btn-product-explore');
    const modalCanvas = document.getElementById('modal-interactive-canvas');

    const PRODUCT_SPECS = {
      vision: {
        category: 'PLATFORM // COMPUTER VISION',
        title: 'SYNAPSE VISION v4.8 PRO',
        desc: 'Sub-millimeter 3D spatial perception, volumetric scene reconstruction, and dynamic object trajectory forecasting at 240Hz. Engineered for mission-critical robotics, aerospace navigation, and surgical robotics where perception failures carry zero tolerance.',
        stats: [
          { k: 'SPATIAL RESOLUTION', v: 'Sub-millimeter' },
          { k: 'TEMPORAL REFRESH', v: '240 Hz Continuous' },
          { k: '6-DoF ACCURACY', v: '99.999% Ground Truth' },
          { k: 'OCCLUSION SYNTHESIS', v: 'Instant 4D NeRF' }
        ],
        benchVal: '14.2x Faster than Standard Voxel Grids',
        benchPct: '94%',
        code: `// SYNAPSE VISION 4D Ingestion Pipeline
const sensor = new SynapseVision({ mode: "sub-millimeter" });
const stream = await sensor.subscribeVolumetricBuffer();

stream.on("frame", (spatialFrame) => {
  const trajectory = spatialFrame.predictTrajectory({
    horizon: "500ms",
    precision: 0.9999
  });
  actuatorMesh.dispatch(trajectory);
});`
      },
      core: {
        category: 'PLATFORM // REASONING CORE',
        title: 'SYNAPSE CORE v5.0 ULTRA',
        desc: 'Deterministic reasoning engine pairing dense transformer latents with formal First-Order Logic theorem provers. Guaranteed zero hallucination rate across enterprise contracts, mission software, and drug discovery workflows.',
        stats: [
          { k: 'CONTEXT WINDOW', v: '2,000,000 Tokens' },
          { k: 'PROOF SYSTEM', v: 'SMT-Satisfiable Invariant' },
          { k: 'HALLUCINATION RATE', v: '0.00% Proven' },
          { k: 'LATENT TOPOLOGY', v: 'Poincaré Hyperbolic' }
        ],
        benchVal: '100% Deterministic Verification on GSM8K-Ext',
        benchPct: '99%',
        code: `// SYNAPSE CORE Formal Verification Call
const core = new SynapseCore({ determinism: true });
const proof = await core.verifyHypothesis({
  axioms: loadFormalGrammar("euclidean-spacetime"),
  hypothesis: proposedQuantumState
});

console.log("Proof verified:", proof.satisfiable);`
      },
      voice: {
        category: 'PLATFORM // VOICE INTELLIGENCE',
        title: 'SYNAPSE VOICE v3.4 NEURAL',
        desc: 'Zero-latency acoustic intelligence with sub-audible micro-prosody, biometric vocal nuance, and instant conversational speech-to-speech loops in 120 global languages.',
        stats: [
          { k: 'ROUND-TRIP LATENCY', v: '45 ms Total Loop' },
          { k: 'AUDIO FIDELITY', v: '96 kHz / 32-bit Float' },
          { k: 'CROSS-LINGUAL ZERO-SHOT', v: '120 Languages' },
          { k: 'MICRO-PROSODY JITTER', v: '< 0.02 ms' }
        ],
        benchVal: 'Sub-human latency barrier (45ms vs 250ms)',
        benchPct: '96%',
        code: `// SYNAPSE VOICE Acoustic Stream
const duplex = new SynapseVoiceSession({ latency: "ultra-low" });
audioCapture.pipe(duplex.inbound);

duplex.outbound.on("audioFrame", (chunk) => {
  speakerArray.playImmediate(chunk);
});`
      },
      analytics: {
        category: 'PLATFORM // INTELLIGENT DATA ANALYSIS',
        title: 'SYNAPSE ANALYTICS v6.1 TENSOR',
        desc: 'Autonomous high-dimensional manifold analysis for financial equilibria, supply-chain resilience, and genomic anomaly detection with 100M events/second ingestion.',
        stats: [
          { k: 'INGESTION RATE', v: '100M events/sec' },
          { k: 'MANIFOLD DIMENSION', v: '4096-D Latent' },
          { k: 'CAUSAL ACCURACY', v: '99.98% Causal DAG' },
          { k: 'TIME HORIZON', v: 'Multi-year Predictive' }
        ],
        benchVal: '32x Throughput on Wafer-Scale Accelerators',
        benchPct: '91%',
        code: `// SYNAPSE ANALYTICS High-Dimensional Stream
const analytics = new SynapseAnalytics({ dimensions: 4096 });
await analytics.connectCluster("wss://cluster.synapse.internal");

const manifold = analytics.fitManifold(financialTelemetryStream);
const anomalies = manifold.detectSubtleCurvatureDrift();`
      }
    };

    const openModal = (productKey) => {
      const spec = PRODUCT_SPECS[productKey];
      if (!spec || !modal) return;

      modalCategory.textContent = spec.category;
      modalTitle.textContent = spec.title;
      modalDesc.textContent = spec.desc;
      modalBenchVal.textContent = spec.benchVal;
      modalBenchBar.style.width = spec.benchPct;
      modalCodeSnippet.textContent = spec.code;

      modalStatsList.innerHTML = spec.stats.map(s => `
        <div class="modal-stat-row">
          <span class="modal-stat-k">${s.k}</span>
          <span class="modal-stat-v">${s.v}</span>
        </div>
      `).join('');

      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      audioSynth.playFeedback('toggle');

      renderModalCanvas(productKey);
    };

    const closeModal = () => {
      if (!modal) return;
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      audioSynth.playFeedback('click');
    };

    const renderModalCanvas = (key) => {
      if (!modalCanvas) return;
      const ctx = modalCanvas.getContext('2d');
      const w = (modalCanvas.width = modalCanvas.parentElement.clientWidth);
      const h = (modalCanvas.height = modalCanvas.parentElement.clientHeight);
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '11px monospace';

      // Draw stylized high-tech oscilloscope / schematic in modal
      const cy = h / 2;
      ctx.beginPath();
      for (let x = 0; x < w; x += 4) {
        const y = cy + Math.sin(x * 0.05) * 35 * Math.cos(x * 0.01);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillText(`SUBSYSTEM SPEC: [${key.toUpperCase()}] ACTIVE TELEMETRY`, 16, 24);
    };

    exploreButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.product;
        openModal(key);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
        closeModal();
      }
    });
  }

  /* ==========================================================================
     10. RESEARCH WHITE PAPERS FILTER & MODAL
     ========================================================================== */
  function initResearchShowcase() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const paperCards = document.querySelectorAll('.paper-card');
    const paperModal = document.getElementById('paper-modal');
    const closeBtn = document.getElementById('paper-modal-close-btn');
    const readBtns = document.querySelectorAll('.btn-read-paper');

    const paperDoi = document.getElementById('paper-modal-doi');
    const paperTitle = document.getElementById('paper-modal-title');
    const paperMeta = document.getElementById('paper-modal-meta');
    const paperAuthors = document.getElementById('paper-modal-authors');
    const paperText = document.getElementById('paper-modal-text');
    const paperFindings = document.getElementById('paper-modal-findings');
    const downloadBtn = document.getElementById('paper-download-btn');

    const PAPERS_DATA = {
      'paper-1': {
        doi: 'DOI: 10.1038/SYNAPSE.2026.0418',
        title: 'Deterministic Latent Spaces: Eliminating Hallucinations in High-Dimensional Neural Transformers',
        meta: 'DATE: OCT 2026 • PEER REVIEW: VERIFIED • CITATIONS: 142',
        authors: 'AUTHORS: DR. ELENA VANCE, MARCUS CHEN, DR. SOPHIA THORNE',
        text: 'This paper establishes the formal mathematical basis for non-probabilistic token generation in high-dimensional transformer architectures. By mapping latent manifolds onto bounded hyperbolic manifolds with negative Gaussian curvature, we demonstrate that all syntactic and semantic transitions obey hard axiomatic invariants, driving hallucination rates to absolute zero.',
        findings: [
          'Proof of Theorem 4.1: Unconstrained softmax distributions guarantee non-zero error bounds in unbounded spaces.',
          'Proof of Theorem 4.2: Hyperbolic bounding restricts token generation strictly to axiomatic closure.',
          'Empirical validation over 10M complex deductive reasoning chains with 100% verification.'
        ]
      },
      'paper-2': {
        doi: 'DOI: 10.1038/SYNAPSE.2026.0312',
        title: 'Sub-Millisecond Multimodal Perception in Edge-Constrained High-DoF Robotics',
        meta: 'DATE: AUG 2026 • PEER REVIEW: VERIFIED • CITATIONS: 98',
        authors: 'AUTHORS: DR. KAELEN VOSS, DR. JULIAN MERCER, DR. ELENA VANCE',
        text: 'Autonomous humanoid and industrial manipulators operate under stringent real-time physical latency bounds. We formulate a hardware-native neural radiance framework utilizing continuous volumetric fields processed on ultra-low power neuromorphic silicon at 240Hz under a 12W power envelope.',
        findings: [
          'Continuous 6-DoF trajectory computation latency reduced to 0.08ms per frame.',
          'Elimination of motion blur artifacts in high-speed kinematic manipulators.',
          'Verified zero-collision tolerance across 100,000 randomized dynamic obstacle trials.'
        ]
      },
      'paper-3': {
        doi: 'DOI: 10.1038/SYNAPSE.2026.0205',
        title: 'Quantum Harmonic Resonators in Non-Von Neumann Cognitive Architectures',
        meta: 'DATE: MAY 2026 • PEER REVIEW: VERIFIED • CITATIONS: 215',
        authors: 'AUTHORS: DR. JULIAN MERCER, MAYA STERLING, MARCUS CHEN',
        text: 'We demonstrate the physical coupling of superconducting transmon qubit arrays with analog photonic memristor crossbars, achieving instant combinatorial path optimization over 10^12 discrete variables without cryogenic bottlenecking.',
        findings: [
          'Quadratic reduction in energy consumption for combinatorial graph matching.',
          'Topological quantum error mitigation preserving 99.98% coherence at 4K temperatures.',
          'Direct integration into classical high-throughput tensor memory buses.'
        ]
      },
      'paper-4': {
        doi: 'DOI: 10.1038/SYNAPSE.2026.0119',
        title: 'Verifiable Alignment: Formal Proof Systems for Autonomous Artificial Superintelligence',
        meta: 'DATE: JAN 2026 • PEER REVIEW: VERIFIED • CITATIONS: 320',
        authors: 'AUTHORS: DR. SOPHIA THORNE, DR. ELENA VANCE, DR. KAELEN VOSS',
        text: 'Post-hoc alignment mechanisms such as RLHF are fundamentally vulnerable to jailbreaking and deceptive alignment. We prove that safety bounds must be encoded as compile-time formal invariants within the neural loss manifold and enforced via hardware-enforced cryptographic boundaries.',
        findings: [
          'Proof that soft RLHF boundaries decay asymptotically as parameter scale surpasses 10^12.',
          'Formal mathematical specification for non-violable ethical boundary invariants.',
          'Zero bypass rate across adversarial fuzzing exceeding 1 billion synthesized tokens.'
        ]
      }
    };

    // Filter Pills
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        audioSynth.playFeedback('click');

        const filter = btn.dataset.filter;
        paperCards.forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // Read Abstract Modal
    readBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.paper;
        const data = PAPERS_DATA[id];
        if (!data || !paperModal) return;

        paperDoi.textContent = data.doi;
        paperTitle.textContent = data.title;
        paperMeta.textContent = data.meta;
        paperAuthors.textContent = data.authors;
        paperText.textContent = data.text;
        paperFindings.innerHTML = data.findings.map(f => `<li>${f}</li>`).join('');

        paperModal.classList.add('open');
        paperModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        audioSynth.playFeedback('toggle');
      });
    });

    const closePaperModal = () => {
      if (!paperModal) return;
      paperModal.classList.remove('open');
      paperModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      audioSynth.playFeedback('click');
    };

    if (closeBtn) closeBtn.addEventListener('click', closePaperModal);
    if (paperModal) {
      paperModal.addEventListener('click', (e) => {
        if (e.target === paperModal) closePaperModal();
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        audioSynth.playFeedback('beep');
        const origText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<span>SIMULATING PDF GENERATION...</span>';
        setTimeout(() => {
          downloadBtn.innerHTML = '<span>ABSTRACT PDF PREVIEWED (LOCAL DEMO)</span>';
          setTimeout(() => {
            downloadBtn.innerHTML = origText;
          }, 2000);
        }, 800);
      });
    }
  }

  /* ==========================================================================
     11. FAQ ACCORDION INTERACTIVITY
     ========================================================================== */
  function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
      const questionBtn = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');

      questionBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        audioSynth.playFeedback('click');

        // Close other items
        faqItems.forEach(other => {
          if (other !== item) {
            other.classList.remove('active');
            other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            other.querySelector('.faq-answer').style.maxHeight = null;
          }
        });

        if (isOpen) {
          item.classList.remove('active');
          questionBtn.setAttribute('aria-expanded', 'false');
          answer.style.maxHeight = null;
        } else {
          item.classList.add('active');
          questionBtn.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });
  }

  /* ==========================================================================
     12. CONTACT FORM VALIDATION & SIMULATION
     ========================================================================== */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const subjectSelect = document.getElementById('contact-subject');
    const messageInput = document.getElementById('contact-message');
    const charCounter = document.getElementById('char-counter');
    const submitBtn = document.getElementById('contact-submit-btn');
    const btnText = document.getElementById('submit-btn-text');
    const feedback = document.getElementById('form-feedback');

    // Live character counter
    if (messageInput && charCounter) {
      messageInput.addEventListener('input', () => {
        const len = messageInput.value.length;
        charCounter.textContent = `${len} / 1000`;
      });
    }

    const validateEmail = (email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateField = (input, condition) => {
      const group = input.closest('.form-group');
      if (!condition) {
        group.classList.add('has-error');
        return false;
      } else {
        group.classList.remove('has-error');
        return true;
      }
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const isNameValid = validateField(nameInput, nameInput.value.trim().length >= 2);
      const isEmailValid = validateField(emailInput, validateEmail(emailInput.value.trim()));
      const isSubjectValid = validateField(subjectSelect, subjectSelect.value !== '');
      const isMessageValid = validateField(messageInput, messageInput.value.trim().length >= 20);

      if (!isNameValid || !isEmailValid || !isSubjectValid || !isMessageValid) {
        audioSynth.playFeedback('click');
        return;
      }

      // Simulated Encrypted Transmission sequence
      audioSynth.playFeedback('toggle');
      submitBtn.disabled = true;
      btnText.textContent = 'ENCRYPTING VIA SHA-512...';

      setTimeout(() => {
        btnText.textContent = 'TRANSMITTING TO SYNAPSE DISPATCH...';
        setTimeout(() => {
          btnText.textContent = 'TRANSMIT ENCRYPTED PAYLOAD';
          submitBtn.disabled = false;
          form.reset();
          if (charCounter) charCounter.textContent = '0 / 1000';

          if (feedback) {
            feedback.classList.add('show');
            feedback.setAttribute('aria-hidden', 'false');
            audioSynth.playFeedback('beep');
            setTimeout(() => {
              feedback.classList.remove('show');
              feedback.setAttribute('aria-hidden', 'true');
            }, 6000);
          }
        }, 800);
      }, 700);
    });
  }

  /* ==========================================================================
     13. NAVIGATION, SCROLLSPY, PROGRESS & REVEALS
     ========================================================================== */
  function initNavigation() {
    const header = document.getElementById('site-header');
    const progressBar = document.getElementById('scroll-progress-bar');
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    const navLinks = document.querySelectorAll('.desktop-nav .nav-link');
    const backToTopBtn = document.getElementById('back-to-top');
    const audioBtn = document.getElementById('audio-toggle');

    // Audio button toggle
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        audioSynth.toggle();
      });
    }

    // Scroll listener for progress bar, header styling, and telemetry
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

      if (progressBar) progressBar.style.width = progress + '%';

      if (header) {
        if (scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
      }

      // Scrollspy active link highlight
      const sections = document.querySelectorAll('section[id]');
      sections.forEach(sec => {
        const top = sec.offsetTop - 120;
        const height = sec.offsetHeight;
        const id = sec.getAttribute('id');
        if (scrollY >= top && scrollY < top + height) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, { passive: true });

    // Mobile Menu Toggle
    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.contains('open');
        audioSynth.playFeedback('click');
        if (isOpen) {
          mobileMenu.classList.remove('open');
          menuToggle.classList.remove('active');
          menuToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        } else {
          mobileMenu.classList.add('open');
          menuToggle.classList.add('active');
          menuToggle.setAttribute('aria-expanded', 'true');
          document.body.style.overflow = 'hidden';
        }
      });

      mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
          mobileMenu.classList.remove('open');
          menuToggle.classList.remove('active');
          menuToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
          audioSynth.playFeedback('click');
        });
      });
    }

    // Back to top button
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        audioSynth.playFeedback('click');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Audio click sound on buttons
    document.querySelectorAll('[data-sound="click"]').forEach(el => {
      el.addEventListener('click', () => audioSynth.playFeedback('click'));
    });
  }

  /* ==========================================================================
     14. SCROLL REVEAL (INTERSECTION OBSERVER)
     ========================================================================== */
  function initScrollReveals() {
    const revealElements = document.querySelectorAll('.reveal-elem');
    if (!revealElements.length) return;

    if (SYSTEM_CONFIG.reducedMotion) {
      revealElements.forEach(el => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  function triggerHeroReveal() {
    const heroReveals = document.querySelectorAll('#hero .reveal-elem');
    heroReveals.forEach((el, idx) => {
      setTimeout(() => {
        el.classList.add('is-revealed');
      }, idx * 120);
    });
  }

  /* ==========================================================================
     15. CUSTOM CURSOR & MOUSE FOLLOWER
     ========================================================================== */
  function initCustomCursor(sphereEngine, particleEngine) {
    const dot = document.getElementById('cursor-dot');
    const aura = document.getElementById('cursor-aura');

    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let targetX = currentX;
    let targetY = currentY;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (dot) {
        dot.style.left = `${targetX}px`;
        dot.style.top = `${targetY}px`;
      }

      // Normalized coordinates (-1 to 1) for 3D sphere
      const normX = (targetX / window.innerWidth) * 2 - 1;
      const normY = -(targetY / window.innerHeight) * 2 + 1;

      if (sphereEngine) sphereEngine.onMouseMove(normX, normY);
      if (particleEngine) particleEngine.setMouse(targetX, targetY);
    });

    const animateCursor = () => {
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;

      if (aura) {
        aura.style.left = `${currentX}px`;
        aura.style.top = `${currentY}px`;
      }

      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    // Hover scale effects
    const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, .pillar-card, .product-card, .diagram-node');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (aura) {
          aura.style.transform = 'translate(-50%, -50%) scale(1.65)';
          aura.style.borderColor = 'rgba(255, 255, 255, 0.7)';
        }
      });
      el.addEventListener('mouseleave', () => {
        if (aura) {
          aura.style.transform = 'translate(-50%, -50%) scale(1)';
          aura.style.borderColor = 'rgba(255, 255, 255, 0.35)';
        }
      });
    });
  }

  /* ==========================================================================
     16. INITIALIZATION ORCHESTRATION
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Preloader
    initPreloader();

    // 2. Initialize WebGL 3D Metallic Neural Sphere
    const sphereEngine = new MetallicSphereWebGL('neural-sphere-canvas');

    // 3. Initialize Background Particle System
    const particleEngine = new AmbientParticleMatrix('ambient-particles');

    // 4. Initialize Product Card Visualizers
    initProductCardVisualizers();

    // 5. Initialize Architecture Diagram
    initArchitectureDiagram();

    // 6. Initialize Interactive AI Demonstration
    initInteractiveDemo();

    // 7. Initialize Product Modals
    initProductModals();

    // 8. Initialize Research Showcase
    initResearchShowcase();

    // 9. Initialize FAQ Accordion
    initFAQ();

    // 10. Initialize Contact Form
    initContactForm();

    // 11. Initialize Navigation & Controls
    initNavigation();

    // 12. Initialize Scroll Reveals
    initScrollReveals();

    // 13. Initialize Custom Cursor
    initCustomCursor(sphereEngine, particleEngine);
  });

})();
