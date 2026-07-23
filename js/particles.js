
export function initNeuralCanvas(canvasId, opts = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return () => {};

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};

  const ctx = canvas.getContext('2d');
  const isMobile = window.innerWidth < 768;

  // Em telas pequenas reduz a densidade automaticamente (celular antigo do público 55+)
  const baseCount  = opts.count || 35;
  const count      = isMobile ? Math.max(6, Math.round(baseCount * 0.6)) : baseCount;
  const speed      = opts.speed      || 0.25;
  const connectDist = opts.connectDist || 120;
  const opacity    = opts.opacity    || 0.25;

  // Limita a ~30fps (metade do trabalho, imperceptível para um fundo sutil)
  const FRAME_MS = 1000 / 30;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();

  const pts = Array.from({length: count}, () => ({
    x:  Math.random() * canvas.width,
    y:  Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * speed,
    vy: (Math.random() - 0.5) * speed,
  }));

  let raf = null;
  let last = 0;
  let visible = true;
  let running = false;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pts.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    });

    pts.forEach((a, i) => {
      pts.slice(i + 1).forEach(b => {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < connectDist) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(70,237,177,${opacity * (1 - d / connectDist)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
      ctx.beginPath();
      ctx.arc(a.x, a.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(70,237,177,${opacity * 2})`;
      ctx.fill();
    });
  }

  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    if (now - last < FRAME_MS) return;
    last = now;
    draw();
  }

  function start() {
    if (running || !visible) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  // Só anima quando o canvas está de fato visível na tela — o maior ganho:
  // a landing tem 6 canvas e a maioria fica fora do viewport a maior parte do tempo.
  let io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) start(); else stop();
    }, { threshold: 0.01 });
    io.observe(canvas);
  } else {
    start();
  }

  // Pausa quando a aba sai de foco (economiza bateria/CPU no celular)
  const onVis = () => { if (document.hidden) stop(); else start(); };
  document.addEventListener('visibilitychange', onVis);

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement || canvas);

  return () => {
    stop();
    ro.disconnect();
    if (io) io.disconnect();
    document.removeEventListener('visibilitychange', onVis);
  };
}
