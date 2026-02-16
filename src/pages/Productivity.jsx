import React, { useEffect } from 'react'
import './productivity.css'

export default function Productivity(){
  useEffect(()=>{
    // Ensure DOM elements exist before creating the script
    const statusEl = document.getElementById('status-text');
    const timerEl = document.getElementById('timer-val');
    
    if (!statusEl || !timerEl) return;

    const script = document.createElement('script')
    script.type = 'module'
    script.textContent = `
    import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.js';
    import TWEEN from 'https://cdnjs.cloudflare.com/ajax/libs/tween.js/23.1.1/tween.umd.js';

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playBowl(freq = 150, duration = 4) {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const osc2 = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc2.frequency.setValueAtTime(freq * 2.01, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain); osc2.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(); osc2.start();
      osc.stop(audioCtx.currentTime + duration); osc2.stop(audioCtx.currentTime + duration);
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f110f, 0.12);
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0,0,7);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0f110f);
    document.body.appendChild(renderer.domElement);

    const petals = [];
    const petalGeo = new THREE.PlaneGeometry(0.12,0.12);
    const petalMat = new THREE.MeshStandardMaterial({ color:0xffb7c5, side:THREE.DoubleSide, transparent:true, opacity:0.7 });
    function resetPetal(p){ p.position.set((Math.random()-0.5)*15,8,(Math.random()-0.5)*10); p.userData.speed = 0.01 + Math.random()*0.02 }
    for(let i=0;i<300;i++){ const p=new THREE.Mesh(petalGeo,petalMat); resetPetal(p); p.position.y = Math.random()*20-10; scene.add(p); petals.push(p) }

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    function createStone(x,color,name){ const group=new THREE.Group(); const geo=new THREE.SphereGeometry(0.8,32,32); geo.scale(1.2,0.5,1); const mat=new THREE.MeshPhysicalMaterial({ color: color, roughness:0.2, transmission:0.3, thickness:1 }); const mesh=new THREE.Mesh(geo,mat); mesh.name=name; group.add(mesh); group.position.set(x,-2.5,0); scene.add(group); return group }
    const startStone = createStone(-2,0x3a4d3a,'start'); const resetStone = createStone(2,0x4d3a3a,'reset');
    scene.add(new THREE.AmbientLight(0xffffff,0.5)); const light=new THREE.PointLight(0xffb7c5,5,20); light.position.set(0,2,2); scene.add(light);

    let seconds = 1500; let isRunning=false; let timerId=null; let storm=false;
    function updateDisplay(){ const m=Math.floor(seconds/60).toString().padStart(2,'0'); const s=(seconds%60).toString().padStart(2,'0'); const el=document.getElementById('timer-val'); if (el) el.textContent = \`\${m}:\${s}\`; }

    function handleInteraction(event){ mouse.x = (event.clientX / window.innerWidth) * 2 - 1; mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; raycaster.setFromCamera(mouse,camera); const hits = raycaster.intersectObjects(scene.children,true); if (hits.length>0){ const name = hits[0].object.name; if (name==='start') toggleTimer(); else if (name==='reset') resetTimer(); } }

    function toggleTimer(){ playBowl(isRunning?120:180); if (isRunning){ clearInterval(timerId); document.getElementById('status-text').textContent='Resting...'; } else { document.getElementById('status-text').textContent='Deep Focus'; timerId=setInterval(()=>{ seconds--; updateDisplay(); if (seconds<=0){ clearInterval(timerId); storm=true; playBowl(440,8); } },1000) } isRunning = !isRunning }
    function resetTimer(){ playBowl(100,2); clearInterval(timerId); isRunning=false; seconds=1500; storm=false; updateDisplay(); document.getElementById('status-text').textContent='Ready Again'; }

    window.addEventListener('mousedown', handleInteraction);
    let animationId;
    function animate(time){ animationId = requestAnimationFrame(animate); TWEEN.update(time); petals.forEach(p=>{ p.position.y -= storm? p.userData.speed*8 : p.userData.speed; p.rotation.x += 0.01; if (p.position.y < -6) resetPetal(p) }); renderer.render(scene,camera) }
    animate();
    const handleResize = ()=>{ camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight) };
    window.addEventListener('resize', handleResize);
    window.cleanup = ()=>{ cancelAnimationFrame(animationId); window.removeEventListener('mousedown', handleInteraction); window.removeEventListener('resize', handleResize); if(renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement); clearInterval(timerId); };
    `

    document.body.appendChild(script)
    return ()=>{ if(window.cleanup) window.cleanup(); if(script.parentNode) script.parentNode.removeChild(script) }
  },[])

  return (
    <div className="prod-root">
      <div id="ui-layer">
        <div className="label-zen" id="status-text">Touch the Green Stone to Begin</div>
        <div id="timer-val" className="text-9xl font-thin tracking-tighter opacity-80">25:00</div>
        <div className="hint">LEFT STONE: START/PAUSE | RIGHT STONE: RESET</div>
      </div>
    </div>
  )
}