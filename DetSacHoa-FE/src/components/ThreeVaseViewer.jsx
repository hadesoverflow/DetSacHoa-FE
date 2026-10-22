import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

/**
 * ThreeVaseViewer
 * Real-time 3D WebGL renderer powered by Three.js & OrbitControls
 * Custom 3D Model:
 * - Bình gốm thủ công dáng quai rót (Pitcher Vase with C-Handle) vẽ tay 2 chú mèo mướp
 * - Đóa hoa hồng nhung đỏ rực (Velvet Crimson Red Roses) nở rộ đa tầng cánh
 * - Cành cỏ đồng nội xanh biếc hạt li ti (Thlaspi green seed pod filler) & lá hoa hồng xanh thẫm
 * - Bục đá cẩm thạch trắng Carrara viền vàng
 * - Xuất file nhị phân chuẩn .GLB (glTF 2.0 Binary)
 */
const ThreeVaseViewer = forwardRef(function ThreeVaseViewer({ 
  designId = 'ribbed_luoshen_roses',
  autoRotate = false,
  isOverlay = false,
  onGlbReady = null
}, ref) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const vaseGroupRef = useRef(null);
  const controlsRef = useRef(null);
  const exportedOnceRef = useRef(false);

  // Expose methods to parent component (Snapshot & GLB Exporter)
  useImperativeHandle(ref, () => ({
    getSnapshot: () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        return rendererRef.current.domElement.toDataURL('image/png');
      }
      return null;
    },
    exportGLB: (filename = null, callback = null) => {
      if (vaseGroupRef.current) {
        let defaultName = 'BinhCup_HoaHongPinkFloyd.glb';
        if (designId === 'ribbed_luoshen_roses') defaultName = 'BinhTru_HongLacThan.glb';
        else if (designId === 'fluted_proud_roses') defaultName = 'BinhSuKhia_HoaHongProudTrang.glb';
        else if (designId === 'cat_red_roses') defaultName = 'BinhGomMeo_HoaHongNhung.glb';
        exportModelToGLB(vaseGroupRef.current, filename || defaultName, callback);
      }
    }
  }));

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animId;
    let controls = null;
    let renderer = null;

    const initScene = () => {
      const THREE = window.THREE;
      if (!THREE) return;

      const width = container.clientWidth || 700;
      const height = container.clientHeight || 600;

      // 1. Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // 2. Camera: Framed beautifully on the cat pitcher & red roses bouquet
      const camera = new THREE.PerspectiveCamera(isOverlay ? 30 : 34, width / height, 0.1, 100);
      if (isOverlay) {
        // In AR overlay mode: Centered on the entire model so base and flowers never get cut off
        camera.position.set(0, 0.5, 17.0);
        camera.lookAt(0, -0.5, 0);
      } else {
        camera.position.set(0, 1.2, 17.5);
      }
      cameraRef.current = camera;

      // 3. Renderer with high color fidelity & tone mapping
      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true, 
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance' 
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      if (renderer.outputColorSpace) {
        renderer.outputColorSpace = THREE.SRGBColorSpace;
      } else if (renderer.outputEncoding) {
        renderer.outputEncoding = THREE.sRGBEncoding;
      }
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.95;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      container.replaceChildren(renderer.domElement);

      // 4. OrbitControls
      if (THREE.OrbitControls && !isOverlay) {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = 1.0;
        controls.maxPolarAngle = Math.PI / 2 + 0.05;
        controls.minDistance = 6;
        controls.maxDistance = 24;
        controls.target.set(0, -0.5, 0);
        controls.update();
        controlsRef.current = controls;
      }

      // 5. Studio Lighting Setup (Calibrated for rich ceramics and silk flower petals)
      const ambientLight = new THREE.AmbientLight(0xfff7f0, 0.48);
      scene.add(ambientLight);

      // Key light: Warm sunlight focused from front-right with soft shadow resolution
      const keyLight = new THREE.DirectionalLight(0xfffaee, 1.05);
      keyLight.position.set(4, 9, 8);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;
      keyLight.shadow.bias = -0.0004;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 25;
      keyLight.shadow.camera.left = -5.5;
      keyLight.shadow.camera.right = 5.5;
      keyLight.shadow.camera.top = 5.5;
      keyLight.shadow.camera.bottom = -5.5;
      scene.add(keyLight);

      // Fill light: Soft neutral-warm
      const fillLight = new THREE.DirectionalLight(0xf5ede8, 0.40);
      fillLight.position.set(-8, 6, 4);
      scene.add(fillLight);

      // Soft back/rim light: Outlines the vase and petals
      const rimLight = new THREE.DirectionalLight(0xfff0e4, 0.45);
      rimLight.position.set(0, 8, -8);
      scene.add(rimLight);

      // Soft low fill light: Illuminates the neoclassical pedestal base relief carvings
      const baseAccentLight = new THREE.DirectionalLight(0xffffff, 0.55);
      baseAccentLight.position.set(0, -1.5, 8);
      scene.add(baseAccentLight);



      // 6. Luxury Gallery Pedestal & Contact Shadow (in 3D Studio)
      if (!isOverlay) {
        const pedestalGroup = new THREE.Group();
        scene.add(pedestalGroup);

        // Circular Carrara Marble Plinth
        const baseGeo = new THREE.CylinderGeometry(2.6, 2.8, 0.35, 64);
        const marbleMat = new THREE.MeshStandardMaterial({
          color: 0xfbfbfb,
          roughness: 0.2,
          metalness: 0.05
        });
        const baseMesh = new THREE.Mesh(baseGeo, marbleMat);
        baseMesh.position.y = -3.6;
        baseMesh.receiveShadow = true;
        pedestalGroup.add(baseMesh);

        // Gold Trim Accent Ring
        const goldRingGeo = new THREE.TorusGeometry(2.72, 0.035, 16, 64);
        const goldMat = new THREE.MeshStandardMaterial({
          color: 0xd4af37,
          roughness: 0.2,
          metalness: 0.85
        });
        const goldRing = new THREE.Mesh(goldRingGeo, goldMat);
        goldRing.rotation.x = Math.PI / 2;
        goldRing.position.y = -3.44;
        pedestalGroup.add(goldRing);

        // Soft Radial Contact Shadow below pedestal
        const shadowGeo = new THREE.PlaneGeometry(9, 9);
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(64, 64, 15, 64, 64, 64);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
        grad.addColorStop(0.6, 'rgba(0, 0, 0, 0.1)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);

        const shadowTex = new THREE.CanvasTexture(canvas);
        const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
        const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
        shadowPlane.rotation.x = -Math.PI / 2;
        shadowPlane.position.y = -3.79;
        pedestalGroup.add(shadowPlane);
      } else {
        // Soft contact shadow directly under the pitcher base for in-room AR realism
        const arShadowGeo = new THREE.PlaneGeometry(5.2, 5.2);
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 64);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.42)');
        grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.18)');
        grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.04)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);

        const shadowTex = new THREE.CanvasTexture(canvas);
        const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
        const shadowPlane = new THREE.Mesh(arShadowGeo, shadowMat);
        shadowPlane.rotation.x = -Math.PI / 2;
        shadowPlane.position.y = -3.42;
        scene.add(shadowPlane);
      }

      // 7. Vase + Flower Bouquet 3D Group
      const vaseGroup = new THREE.Group();
      scene.add(vaseGroup);
      vaseGroupRef.current = vaseGroup;

      // Build initial 3D model according to designId
      if (designId === 'compote_pink_floyd_roses') {
        buildPedestalCompoteAndPinkFloydRoses(THREE, vaseGroup);
      } else if (designId === 'fluted_proud_roses' || designId === 'peony_noble_vase' || designId === 'tulip_spring_elegance') {
        buildFlutedVaseAndProudRoses(THREE, vaseGroup);
      } else if (designId === 'cat_red_roses' || designId === 'orchid_white_cascade' || designId === 'vintage_gold_roses' || designId === 'daisy_wildflower_rustic') {
        buildCatPitcherAndRedRoses(THREE, vaseGroup);
      } else {
        buildRibbedVaseAndLuoshenRoses(THREE, vaseGroup);
      }

      // 8. Animation Loop
      const animate = () => {
        animId = requestAnimationFrame(animate);
        if (controls) controls.update();
        renderer.render(scene, camera);
      };
      animate();

      // 9. Auto-export GLB to server disk once on initialization
      if (!exportedOnceRef.current) {
        exportedOnceRef.current = true;
        setTimeout(() => {
          let exportFilename = 'ribbed_luoshen_roses.glb';
          if (designId === 'fluted_proud_roses') exportFilename = 'fluted_proud_roses.glb';
          else if (designId === 'cat_red_roses') exportFilename = 'cat_pitcher_red_roses.glb';
          else if (designId === 'compote_pink_floyd_roses') exportFilename = 'compote_pink_floyd_roses.glb';
          exportModelToGLB(vaseGroup, exportFilename, (success, data) => {
            if (onGlbReady) onGlbReady(data);
          }, false); // don't trigger download prompt automatically on load, just save to disk
        }, 800);
      }
    };

    if (window.THREE) {
      initScene();
    } else {
      const timer = setInterval(() => {
        if (window.THREE) {
          clearInterval(timer);
          initScene();
        }
      }, 100);
      return () => clearInterval(timer);
    }

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
      if (controls) controls.dispose();
    };
  }, [isOverlay]);

  // Update controls autoRotate prop
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate && !isOverlay;
    }
  }, [autoRotate, isOverlay]);

  // Seamlessly switch 3D model when designId changes
  useEffect(() => {
    if (vaseGroupRef.current && window.THREE) {
      const THREE = window.THREE;
      if (designId === 'compote_pink_floyd_roses') {
        buildPedestalCompoteAndPinkFloydRoses(THREE, vaseGroupRef.current);
      } else if (designId === 'fluted_proud_roses' || designId === 'peony_noble_vase' || designId === 'tulip_spring_elegance') {
        buildFlutedVaseAndProudRoses(THREE, vaseGroupRef.current);
      } else if (designId === 'cat_red_roses' || designId === 'orchid_white_cascade' || designId === 'vintage_gold_roses' || designId === 'daisy_wildflower_rustic') {
        buildCatPitcherAndRedRoses(THREE, vaseGroupRef.current);
      } else {
        buildRibbedVaseAndLuoshenRoses(THREE, vaseGroupRef.current);
      }
    }
  }, [designId]);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        cursor: isOverlay ? 'move' : 'grab',
        touchAction: 'none'
      }} 
    />
  );
});

export default ThreeVaseViewer;

// --- 3D MODEL GENERATOR: CAT PITCHER & RED ROSES ---

function buildCatPitcherAndRedRoses(THREE, group) {
  // Clear any existing children
  while (group.children.length > 0) {
    const obj = group.children[0];
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
      else obj.material.dispose();
    }
    group.remove(obj);
  }

  // 1. Create Ceramic Pitcher Texture (Hand-painted two cats)
  const pitcherTexture = createCatPitcherTexture(THREE);

  // Pitcher Material: Warm antique ivory pottery with clearcoat ceramic glaze
  const pitcherMaterial = new THREE.MeshPhysicalMaterial({
    map: pitcherTexture,
    color: 0xfbf8f3,
    roughness: 0.28,
    metalness: 0.04,
    clearcoat: 0.8,
    clearcoatRoughness: 0.12
  });

  // 2. Pitcher Vase Body Profile (LatheGeometry)
  const pitcherPoints = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(1.28, 0.08),
    new THREE.Vector2(1.72, 0.55),
    new THREE.Vector2(1.98, 1.25),
    new THREE.Vector2(1.85, 1.95),
    new THREE.Vector2(1.42, 2.55),
    new THREE.Vector2(1.2, 3.0),
    new THREE.Vector2(1.28, 3.35),
    new THREE.Vector2(1.38, 3.45),
    new THREE.Vector2(1.18, 3.4),
    new THREE.Vector2(1.08, 3.0)
  ];
  const latheGeo = new THREE.LatheGeometry(pitcherPoints, 64);
  latheGeo.computeVertexNormals();

  const pitcherMesh = new THREE.Mesh(latheGeo, pitcherMaterial);
  pitcherMesh.position.y = -3.42;
  // Rotate by Math.PI * 0.98 so the painted cats face straight towards camera (+Z)
  pitcherMesh.rotation.y = Math.PI * 0.98;
  pitcherMesh.castShadow = true;
  pitcherMesh.receiveShadow = true;
  group.add(pitcherMesh);

  // 3. Pitcher C-Handle (Quai rót gốm) on the right side (+X)
  const handlePoints = [
    new THREE.Vector3(1.18, 3.25, 0),
    new THREE.Vector3(1.75, 3.12, 0),
    new THREE.Vector3(2.22, 2.35, 0),
    new THREE.Vector3(2.08, 1.45, 0),
    new THREE.Vector3(1.62, 0.92, 0)
  ];
  const handleCurve = new THREE.CatmullRomCurve3(handlePoints);
  const handleGeo = new THREE.TubeGeometry(handleCurve, 32, 0.13, 14, false);
  const handleMesh = new THREE.Mesh(handleGeo, pitcherMaterial);
  handleMesh.position.y = -3.42;
  handleMesh.rotation.y = 0; // Positioned naturally on the right side (+X)
  handleMesh.castShadow = true;
  group.add(handleMesh);

  // 4. Velvet Red Roses Bouquet & Greenery
  buildRedRosesBouquet(THREE, group);
}

// Procedural Canvas Texture: Cream Ceramic Pottery + Hand-painted Two Tabby Cats
function createCatPitcherTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Background: Warm antique ivory ceramic
  ctx.fillStyle = '#f4ede0';
  ctx.fillRect(0, 0, 1024, 512);

  // Pottery flecks & speckles
  ctx.fillStyle = 'rgba(165, 138, 110, 0.22)';
  for (let i = 0; i < 2200; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 512;
    const r = Math.random() * 2 + 0.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(95, 70, 50, 0.28)';
  for (let i = 0; i < 800; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 512;
    const r = Math.random() * 1.5 + 0.3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Pottery turning lines
  for (let y = 35; y < 512; y += 45) {
    ctx.strokeStyle = 'rgba(215, 195, 170, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Artwork Center
  const cx = 512;
  const cy = 295;

  ctx.save();

  // Brown painted base / branch
  ctx.fillStyle = '#6b4c35';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 95, 145, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3e271a';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // --- CAT 2 (Taller Cat on the right) ---
  const cat2X = cx + 45;
  const cat2Y = cy + 10;

  // Body
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(cat2X, cat2Y + 30, 48, 65, 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2c1e16';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Orange and brown body stripes
  ctx.fillStyle = '#d97706';
  for (let s = 0; s < 5; s++) {
    const sy = cat2Y - 10 + s * 16;
    ctx.beginPath();
    ctx.ellipse(cat2X - 5, sy, 32 - s * 3, 5, 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#3e271a';
  for (let s = 0; s < 5; s++) {
    const sy = cat2Y - 2 + s * 16;
    ctx.beginPath();
    ctx.ellipse(cat2X + 5, sy, 26 - s * 2, 4, -0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Head
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cat2X, cat2Y - 55, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2c1e16';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Ears
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(cat2X - 25, cat2Y - 75);
  ctx.lineTo(cat2X - 15, cat2Y - 105);
  ctx.lineTo(cat2X - 2, cat2Y - 82);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cat2X + 5, cat2Y - 82);
  ctx.lineTo(cat2X + 22, cat2Y - 105);
  ctx.lineTo(cat2X + 28, cat2Y - 75);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Big round eyes
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cat2X - 12, cat2Y - 60, 9, 0, Math.PI * 2);
  ctx.arc(cat2X + 12, cat2Y - 60, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#1e1b18';
  ctx.beginPath();
  ctx.arc(cat2X - 12, cat2Y - 60, 4.5, 0, Math.PI * 2);
  ctx.arc(cat2X + 12, cat2Y - 60, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = '#2c1e16';
  ctx.beginPath();
  ctx.arc(cat2X, cat2Y - 48, 3, 0, Math.PI * 2);
  ctx.fill();

  // Whiskers
  ctx.strokeStyle = '#2c1e16';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cat2X - 15, cat2Y - 50); ctx.lineTo(cat2X - 45, cat2Y - 55);
  ctx.moveTo(cat2X - 15, cat2Y - 46); ctx.lineTo(cat2X - 42, cat2Y - 45);
  ctx.moveTo(cat2X + 15, cat2Y - 50); ctx.lineTo(cat2X + 45, cat2Y - 55);
  ctx.moveTo(cat2X + 15, cat2Y - 46); ctx.lineTo(cat2X + 42, cat2Y - 45);
  ctx.stroke();

  // --- CAT 1 (Smaller Cat on the left with curled tail) ---
  const cat1X = cx - 35;
  const cat1Y = cy + 25;

  // Body
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(cat1X, cat1Y + 20, 42, 55, -0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2c1e16';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Stripes
  ctx.fillStyle = '#d97706';
  for (let s = 0; s < 4; s++) {
    const sy = cat1Y - 8 + s * 15;
    ctx.beginPath();
    ctx.ellipse(cat1X, sy, 26 - s * 3, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#3e271a';
  for (let s = 0; s < 4; s++) {
    const sy = cat1Y + s * 15;
    ctx.beginPath();
    ctx.ellipse(cat1X, sy, 22 - s * 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Head
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cat1X, cat1Y - 45, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2c1e16';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Ears
  ctx.beginPath();
  ctx.moveTo(cat1X - 22, cat1Y - 60);
  ctx.lineTo(cat1X - 14, cat1Y - 86);
  ctx.lineTo(cat1X - 2, cat1Y - 68);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cat1X + 4, cat1Y - 68);
  ctx.lineTo(cat1X + 16, cat1Y - 86);
  ctx.lineTo(cat1X + 24, cat1Y - 60);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Eyes
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cat1X - 10, cat1Y - 48, 8, 0, Math.PI * 2);
  ctx.arc(cat1X + 10, cat1Y - 48, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#1e1b18';
  ctx.beginPath();
  ctx.arc(cat1X - 10, cat1Y - 48, 4, 0, Math.PI * 2);
  ctx.arc(cat1X + 10, cat1Y - 48, 4, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = '#2c1e16';
  ctx.beginPath();
  ctx.arc(cat1X, cat1Y - 38, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Whiskers
  ctx.strokeStyle = '#2c1e16';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cat1X - 12, cat1Y - 40); ctx.lineTo(cat1X - 38, cat1Y - 43);
  ctx.moveTo(cat1X - 12, cat1Y - 36); ctx.lineTo(cat1X - 35, cat1Y - 34);
  ctx.moveTo(cat1X + 12, cat1Y - 40); ctx.lineTo(cat1X + 38, cat1Y - 43);
  ctx.moveTo(cat1X + 12, cat1Y - 36); ctx.lineTo(cat1X + 35, cat1Y - 34);
  ctx.stroke();

  // Curled Tail
  ctx.strokeStyle = '#2c1e16';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(cat1X - 52, cat1Y + 35, 30, Math.PI * 0.4, Math.PI * 1.8);
  ctx.stroke();

  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// --- BOTANICAL RED ROSES BOUQUET GENERATOR (MATCHING PHOTO EXACTLY) ---

// 1. Parametric Curved Rose Petal Geometry: Smooth cylindrical shell with natural spiral twist
function createCurvedRosePetalGeo(THREE, {
  rBase = 0.08,
  rMid = 0.25,
  rTop = 0.45,
  height = 0.45,
  thetaHalf = 0.75, // Radians half-wrap angle
  reflex = 0.12,    // Outward rim curl
  droop = 0.08,     // Rim droop
  segU = 14,
  segV = 14
}) {
  const geo = new THREE.PlaneGeometry(1, 1, segU, segV);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const rawU = pos.getX(i) * 2; // [-1, 1]
    const v = py_to_v(pos.getY(i));  // [0, 1] from base to tip

    // Petal shape envelope: narrow base, wide rounded belly at v=0.6, scalloped top
    const widthFactor = Math.sin(Math.pow(v, 0.48) * Math.PI * 0.72) * (1 - 0.22 * Math.pow(rawU, 2) * Math.pow(v, 2));
    
    // Natural spiral swirl: angular twist along height
    const spiralTwist = v * 0.16;
    const theta = rawU * thetaHalf * Math.max(0.01, widthFactor) + spiralTwist;

    // Radial expansion as petal rises + overlapping shingle offset
    const shingleOffset = rawU * 0.028;
    let r = rBase + (rMid - rBase) * Math.sin(v * Math.PI * 0.5) + (rTop - rMid) * Math.pow(v, 1.8) + shingleOffset;

    // Height with heart notch at tip
    let y = v * height - Math.abs(rawU) * 0.10 * height * Math.pow(v, 2);

    // Reflex roll at petal rim
    if (v > 0.65) {
      const tReflex = (v - 0.65) / 0.35;
      r += reflex * Math.pow(tReflex, 2.2);
      y -= droop * Math.pow(tReflex, 2.0);
    }

    // Cylindrical coordinates to 3D Cartesian
    const x = r * Math.sin(theta);
    const z = r * Math.cos(theta);

    pos.setXYZ(i, x, y, z);
  }

  geo.computeVertexNormals();
  return geo;
}

function py_to_v(py) {
  return py + 0.5;
}

// 2. Realistic Ecuadorian Red Rose Bloom (7 concentric cupped shell whorls with spiral core)
function createRealisticRose(THREE, sharedGeometries, sharedMaterials, scale = 1.0) {
  const rose = new THREE.Group();
  rose.scale.set(scale, scale, scale);

  const { whorl0Geo, whorl1Geo, whorl2Geo, whorl3Geo, whorl4Geo, whorl5Geo, whorl6Geo } = sharedGeometries;
  const { whorl0Mat, whorl1Mat, whorl2Mat, whorl3Mat, whorl4Mat, whorl5Mat, whorl6Mat, sepalMat } = sharedMaterials;

  // Dark ruby center bud
  const heartGeo = new THREE.SphereGeometry(0.09, 12, 12);
  heartGeo.scale(0.8, 1.5, 0.8);
  const heartMesh = new THREE.Mesh(heartGeo, whorl0Mat);
  heartMesh.position.y = 0.14;
  rose.add(heartMesh);

  // Helper to add a whorl of petals rotated around flower Y axis
  const addWhorl = (count, geo, mat, angleOffset, yOffset = 0) => {
    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count + angleOffset;
      const petalMesh = new THREE.Mesh(geo, mat);
      petalMesh.rotation.y = angle;
      petalMesh.position.y = yOffset;
      rose.add(petalMesh);
    }
  };

  // Whorl 0: Core spiral swirl (3 petals wrapping tightly, upright cone)
  addWhorl(3, whorl0Geo, whorl0Mat, 0.2, 0.10);

  // Whorl 1: Tight spiral core (4 petals)
  addWhorl(4, whorl1Geo, whorl1Mat, 0.45, 0.08);

  // Whorl 2: Inner cupped petals (5 petals)
  addWhorl(5, whorl2Geo, whorl2Mat, 0.15, 0.06);

  // Whorl 3: Mid-inner cupping petals (5 petals)
  addWhorl(5, whorl3Geo, whorl3Mat, 0.52, 0.04);

  // Whorl 4: Mid blooming petals (6 petals)
  addWhorl(6, whorl4Geo, whorl4Mat, 0.25, 0.02);

  // Whorl 5: Outer blooming petals (6 petals)
  addWhorl(6, whorl5Geo, whorl5Mat, 0.62, 0.0);

  // Whorl 6: Broad guard reflexed petals (7 petals)
  addWhorl(7, whorl6Geo, whorl6Mat, 0.35, -0.03);

  // Green Sepals under the rose head
  const sepalGeo = new THREE.ConeGeometry(0.08, 0.65, 4);
  sepalGeo.scale(1.2, 0.1, 1);
  for (let s = 0; s < 5; s++) {
    const sAngle = s * (Math.PI * 2 / 5);
    const sepalMesh = new THREE.Mesh(sepalGeo, sepalMat);
    sepalMesh.position.set(Math.cos(sAngle) * 0.35, -0.06, Math.sin(sAngle) * 0.35);
    sepalMesh.rotation.y = -sAngle;
    sepalMesh.rotation.x = Math.PI / 1.65;
    rose.add(sepalMesh);
  }

  return rose;
}

// 3. Realistic Rose Leaf
function createRoseLeaf(THREE, length = 0.85, width = 0.45) {
  const shape = new THREE.Shape();
  const hw = width * 0.5;
  shape.moveTo(0, 0);
  shape.bezierCurveTo(hw * 0.65, length * 0.22, hw * 1.08, length * 0.58, 0, length);
  shape.bezierCurveTo(-hw * 1.08, length * 0.58, -hw * 0.65, length * 0.22, 0, 0);

  const geo = new THREE.ShapeGeometry(shape, 8);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = -0.05 * (1 - Math.abs(x) / hw) * Math.sin((y / length) * Math.PI);
    pos.setZ(i, z);
  }
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    color: 0x113316, // Deep glossy forest rose green
    roughness: 0.36,
    metalness: 0.04,
    side: THREE.DoubleSide
  });

  return new THREE.Mesh(geo, mat);
}

// 4. Delicate Green Thlaspi Filler Stem with Seed Beads (Cành Cỏ Đồng Nội Hạt Tròn)
function createGreenFillerStem(THREE, start, mid, end, podGeo, podMat) {
  const fillerGroup = new THREE.Group();
  const stemCurve = new THREE.CatmullRomCurve3([start, mid, end]);
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x3e6b12, roughness: 0.5 });
  const stemGeo = new THREE.TubeGeometry(stemCurve, 14, 0.018, 6, false);
  const stemMesh = new THREE.Mesh(stemGeo, stemMat);
  fillerGroup.add(stemMesh);

  // Fresh bright lime-green seed pods along upper 65% of stem
  for (let p = 0; p < 20; p++) {
    const t = 0.35 + (p / 20) * 0.65;
    const pointOnStem = stemCurve.getPoint(t);
    const podMesh = new THREE.Mesh(podGeo, podMat);
    const offsetAngle = p * 2.39;
    const offsetDist = 0.065 + (p % 3) * 0.025;
    podMesh.position.set(
      pointOnStem.x + Math.cos(offsetAngle) * offsetDist,
      pointOnStem.y + (Math.random() - 0.5) * 0.02,
      pointOnStem.z + Math.sin(offsetAngle) * offsetDist
    );
    fillerGroup.add(podMesh);
  }

  return fillerGroup;
}

// 5. Build Bouquet: 22 Lush Velvet Red Roses Dense Dome + Leaves + Thlaspi Sprays
function buildRedRosesBouquet(THREE, group) {
  const bouquetGroup = new THREE.Group();
  bouquetGroup.position.y = 0.02;

  // Shared 7 Petal Geometries (Continuous progressive overlapping radii)
  const sharedGeometries = {
    whorl0Geo: createCurvedRosePetalGeo(THREE, {
      rBase: 0.02, rMid: 0.05, rTop: 0.09, height: 0.28, thetaHalf: 1.15, reflex: 0.0, droop: 0.0
    }),
    whorl1Geo: createCurvedRosePetalGeo(THREE, {
      rBase: 0.04, rMid: 0.09, rTop: 0.15, height: 0.32, thetaHalf: 1.05, reflex: 0.01, droop: 0.0
    }),
    whorl2Geo: createCurvedRosePetalGeo(THREE, {
      rBase: 0.08, rMid: 0.15, rTop: 0.23, height: 0.36, thetaHalf: 0.95, reflex: 0.03, droop: 0.01
    }),
    whorl3Geo: createCurvedRosePetalGeo(THREE, {
      rBase: 0.13, rMid: 0.22, rTop: 0.33, height: 0.40, thetaHalf: 0.88, reflex: 0.07, droop: 0.02
    }),
    whorl4Geo: createCurvedRosePetalGeo(THREE, {
      rBase: 0.19, rMid: 0.31, rTop: 0.45, height: 0.44, thetaHalf: 0.82, reflex: 0.12, droop: 0.04
    }),
    whorl5Geo: createCurvedRosePetalGeo(THREE, {
      rBase: 0.27, rMid: 0.42, rTop: 0.58, height: 0.46, thetaHalf: 0.78, reflex: 0.18, droop: 0.08
    }),
    whorl6Geo: createCurvedRosePetalGeo(THREE, {
      rBase: 0.36, rMid: 0.54, rTop: 0.72, height: 0.46, thetaHalf: 0.74, reflex: 0.26, droop: 0.14
    })
  };

  // Pure Velvet Red Materials (Deep ruby core to rich scarlet red outer)
  const sharedMaterials = {
    whorl0Mat: new THREE.MeshStandardMaterial({
      color: 0x1e0002, // Deepest shadow ruby
      roughness: 0.62,
      metalness: 0.0,
      side: THREE.DoubleSide
    }),
    whorl1Mat: new THREE.MeshStandardMaterial({
      color: 0x340004, // Dark crimson shadow
      roughness: 0.58,
      metalness: 0.0,
      side: THREE.DoubleSide
    }),
    whorl2Mat: new THREE.MeshStandardMaterial({
      color: 0x4c0006, // Rich crimson
      roughness: 0.54,
      metalness: 0.0,
      side: THREE.DoubleSide
    }),
    whorl3Mat: new THREE.MeshStandardMaterial({
      color: 0x680008, // Deep ruby red
      roughness: 0.50,
      metalness: 0.0,
      side: THREE.DoubleSide
    }),
    whorl4Mat: new THREE.MeshStandardMaterial({
      color: 0x82000a, // Classic velvet red
      roughness: 0.46,
      metalness: 0.0,
      side: THREE.DoubleSide
    }),
    whorl5Mat: new THREE.MeshStandardMaterial({
      color: 0x9b0212, // Rich scarlet velvet
      roughness: 0.42,
      metalness: 0.0,
      side: THREE.DoubleSide
    }),
    whorl6Mat: new THREE.MeshStandardMaterial({
      color: 0x8f000e, // Outer reflex velvet red
      roughness: 0.45,
      metalness: 0.0,
      side: THREE.DoubleSide
    }),
    sepalMat: new THREE.MeshStandardMaterial({
      color: 0x133818,
      roughness: 0.6,
      side: THREE.DoubleSide
    })
  };

  const stemMat = new THREE.MeshStandardMaterial({ color: 0x17361b, roughness: 0.6 });

  // 22 Botanical Red Roses arranged in a dense, solid, rounded dome matching the photo
  const rosePositions = [
    // [HERO ROSE] Front & Center - Tilted forward directly to viewer eyes
    { pos: new THREE.Vector3(0, 0.55, 1.25), rot: new THREE.Euler(1.22, 0, 0), scale: 1.22 },

    // Front-Lower Flanking Roses (Covering left & right pitcher rim, tilted forward-out)
    { pos: new THREE.Vector3(-0.95, 0.52, 1.05), rot: new THREE.Euler(1.15, -0.65, 0.35), scale: 1.10 },
    { pos: new THREE.Vector3(0.95, 0.52, 1.05), rot: new THREE.Euler(1.15, 0.65, -0.35), scale: 1.10 },

    // Far-Left & Far-Right Overhang Roses (Spreading wide past pitcher belly)
    { pos: new THREE.Vector3(-1.70, 0.62, 0.45), rot: new THREE.Euler(0.95, -1.20, 0.40), scale: 1.05 },
    { pos: new THREE.Vector3(1.70, 0.62, 0.45), rot: new THREE.Euler(0.95, 1.20, -0.40), scale: 1.05 },

    // Mid-Row Center Rose (Directly above hero rose, tilted 45° forward)
    { pos: new THREE.Vector3(0, 1.22, 0.95), rot: new THREE.Euler(0.75, 0, 0), scale: 1.15 },
    { pos: new THREE.Vector3(-0.85, 1.18, 0.72), rot: new THREE.Euler(0.70, -0.50, 0.20), scale: 1.08 },
    { pos: new THREE.Vector3(0.85, 1.18, 0.72), rot: new THREE.Euler(0.70, 0.50, -0.20), scale: 1.08 },
    { pos: new THREE.Vector3(-1.65, 1.25, 0.15), rot: new THREE.Euler(0.65, -1.05, 0.30), scale: 1.05 },
    { pos: new THREE.Vector3(1.65, 1.25, 0.15), rot: new THREE.Euler(0.65, 1.05, -0.30), scale: 1.05 },

    // Upper-Row Roses (Facing up-forward)
    { pos: new THREE.Vector3(0, 1.82, 0.55), rot: new THREE.Euler(0.48, 0, 0), scale: 1.12 },
    { pos: new THREE.Vector3(-0.80, 1.78, 0.35), rot: new THREE.Euler(0.45, -0.45, 0.15), scale: 1.06 },
    { pos: new THREE.Vector3(0.80, 1.78, 0.35), rot: new THREE.Euler(0.45, 0.45, -0.15), scale: 1.06 },

    // Crown Apex Roses (Nestled at the crest)
    { pos: new THREE.Vector3(-0.45, 2.22, 0.10), rot: new THREE.Euler(0.28, -0.25, 0.10), scale: 1.08 },
    { pos: new THREE.Vector3(0.45, 2.22, 0.10), rot: new THREE.Euler(0.28, 0.25, -0.10), scale: 1.08 },

    // Rear Roses for 360° Spherical Fullness in OrbitControls
    { pos: new THREE.Vector3(0, 0.60, -1.05), rot: new THREE.Euler(-0.95, 0, 0), scale: 1.06 },
    { pos: new THREE.Vector3(-1.05, 0.62, -0.85), rot: new THREE.Euler(-0.85, -0.65, 0.25), scale: 1.04 },
    { pos: new THREE.Vector3(1.05, 0.62, -0.85), rot: new THREE.Euler(-0.85, 0.65, -0.25), scale: 1.04 },
    { pos: new THREE.Vector3(0, 1.30, -0.88), rot: new THREE.Euler(-0.70, 0, 0), scale: 1.08 },
    { pos: new THREE.Vector3(-0.95, 1.32, -0.65), rot: new THREE.Euler(-0.65, -0.55, 0.20), scale: 1.04 },
    { pos: new THREE.Vector3(0.95, 1.32, -0.65), rot: new THREE.Euler(-0.65, 0.55, -0.20), scale: 1.04 },
    { pos: new THREE.Vector3(0, 1.82, -0.50), rot: new THREE.Euler(-0.45, 0, 0), scale: 1.06 }
  ];

  rosePositions.forEach((roseData) => {
    // Internal stem anchoring bloom into vase
    const start = new THREE.Vector3(0, 0, 0);
    const mid = new THREE.Vector3(roseData.pos.x * 0.45, roseData.pos.y * 0.5, roseData.pos.z * 0.45);
    const end = roseData.pos.clone();

    const curve = new THREE.CatmullRomCurve3([start, mid, end]);
    const stemGeo = new THREE.TubeGeometry(curve, 8, 0.04, 6, false);
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    bouquetGroup.add(stemMesh);

    // Realistic Botanical Rose Head
    const roseHead = createRealisticRose(THREE, sharedGeometries, sharedMaterials, roseData.scale);
    roseHead.position.copy(end);
    roseHead.rotation.copy(roseData.rot);
    bouquetGroup.add(roseHead);
  });

  // 2. Rose Leaves: Collar around the pitcher rim
  const leafCount = 18;
  for (let l = 0; l < leafCount; l++) {
    const lAngle = (l / leafCount) * Math.PI * 2;
    const leafMesh = createRoseLeaf(THREE, 0.85, 0.45);
    leafMesh.position.set(Math.cos(lAngle) * 1.15, 0.12, Math.sin(lAngle) * 1.15);
    leafMesh.rotation.y = -lAngle + Math.PI / 2;
    leafMesh.rotation.x = Math.PI / 2.7;
    bouquetGroup.add(leafMesh);
  }

  // Inter-rose leaves nestled between blooms
  const midLeafCoords = [
    { pos: new THREE.Vector3(0.55, 0.95, 1.05), rot: new THREE.Euler(0.65, 0.4, 0) },
    { pos: new THREE.Vector3(-0.55, 0.95, 1.05), rot: new THREE.Euler(0.65, -0.4, 0) },
    { pos: new THREE.Vector3(1.35, 0.95, 0.55), rot: new THREE.Euler(0.55, 0.8, -0.3) },
    { pos: new THREE.Vector3(-1.35, 0.95, 0.55), rot: new THREE.Euler(0.55, -0.8, 0.3) },
    { pos: new THREE.Vector3(0.65, 1.55, 0.45), rot: new THREE.Euler(0.45, 0.3, 0) },
    { pos: new THREE.Vector3(-0.65, 1.55, 0.45), rot: new THREE.Euler(0.45, -0.3, 0) },
    { pos: new THREE.Vector3(0, 1.60, 0.65), rot: new THREE.Euler(0.50, 0, 0) }
  ];
  midLeafCoords.forEach(({ pos, rot }) => {
    const leaf = createRoseLeaf(THREE, 0.72, 0.38);
    leaf.position.copy(pos);
    leaf.rotation.copy(rot);
    bouquetGroup.add(leaf);
  });

  // 3. Delicate Green Thlaspi Filler Stems with Seed Pod Beads (Cành Cỏ Đồng Nội Hạt Tròn)
  const podGeo = new THREE.SphereGeometry(0.040, 8, 8);
  const podMat = new THREE.MeshStandardMaterial({
    color: 0x6ea814, // Fresh bright spring lime-green
    roughness: 0.35,
    metalness: 0.04
  });

  const fillerCount = 32;
  for (let f = 0; f < fillerCount; f++) {
    const angle = (f / fillerCount) * Math.PI * 2 + (f % 5) * 0.15;
    const radius = 1.65 + (f % 4) * 0.35;
    const height = 2.45 + (f % 3) * 0.40;

    const start = new THREE.Vector3(Math.cos(angle) * 0.4, 0.75, Math.sin(angle) * 0.4);
    const mid = new THREE.Vector3(Math.cos(angle) * radius * 0.85, height * 0.92, Math.sin(angle) * radius * 0.85);
    const end = new THREE.Vector3(Math.cos(angle) * radius * 1.15, height * 0.80, Math.sin(angle) * radius * 1.15);

    const fillerStem = createGreenFillerStem(THREE, start, mid, end, podGeo, podMat);
    bouquetGroup.add(fillerStem);
  }

  group.add(bouquetGroup);
}


// --- 3D MODEL GENERATOR: NEOCLASSICAL TALL FLUTED URN & ECUADORIAN PROUD WHITE ROSES ---

function buildFlutedVaseAndProudRoses(THREE, group) {
  // Clear any existing children
  while (group.children.length > 0) {
    const obj = group.children[0];
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
      else obj.material.dispose();
    }
    group.remove(obj);
  }

  // 1. Create Fluted Vase Glaze Texture (warm ivory porcelain + neoclassical wave relief band)
  const vaseTexture = createFlutedVaseTexture(THREE);

  // 2. Pearlescent Glossy Glazed Porcelain Material (Warm ivory glazed porcelain)
  const vaseMaterial = new THREE.MeshStandardMaterial({
    map: vaseTexture,
    color: 0xffffff,
    roughness: 0.22,
    metalness: 0.01
  });

  // 3. Stately Neoclassical Fluted Urn Geometry (matching photo proportions: waist r = 0.50, mouth r = 1.08, height = 3.42, 24 smooth flutes)
  const vaseGeo = createFlutedVaseGeometry(THREE);
  const vaseMesh = new THREE.Mesh(vaseGeo, vaseMaterial);
  vaseMesh.castShadow = true;
  vaseMesh.receiveShadow = true;
  group.add(vaseMesh);

  // 4. Stately Bouquet: 18 Distinct High-Centered Ecuadorian Garden Roses 'Proud' + Upright Canes + Serrated Foliage
  buildProudWhiteRosesBouquet(THREE, group);
}

// Parametric 24-Flute Slender Neoclassical Urn Geometry (Watertight Manifold with 192 Smooth Radial Segments)
function createFlutedVaseGeometry(THREE) {
  // Matching real reference photo proportions exactly:
  // Base rests on plinth at y = -3.42 with stepped pedestal foot.
  // Sturdy elegant waist ankle r = 0.50 at y = -2.70.
  // Slender trumpet body flares smoothly from r = 0.50 up to r = 1.00 at y = -0.38.
  // Neoclassical relief collar band: y = -0.32 to -0.08.
  // Rolled mouth lip: y = -0.08 to 0.0, radius 1.08.
  const rawProfile = [
    // 1. Stepped Pedestal Base Foot (Y = -3.42 to -2.70)
    [-3.42, 0.78, 0.0],  // bottom flat ring resting on plinth
    [-3.34, 0.80, 0.0],  // lower plinth bead
    [-3.26, 0.72, 0.0],  // stepped torus ring
    [-3.15, 0.66, 0.0],  // graceful concave neck
    [-2.95, 0.56, 0.0],  // narrowing ankle
    [-2.70, 0.50, 0.0],  // sturdy elegant waist junction where flutes start

    // 2. Slender Trumpet Body (flares from 0.50 to 1.00)
    [-2.45, 0.54, 0.5],  // flute ramp-in
    [-2.15, 0.62, 1.0],  // full flutes
    [-1.75, 0.72, 1.0],
    [-1.35, 0.82, 1.0],
    [-0.95, 0.90, 1.0],
    [-0.60, 0.96, 1.0],
    [-0.38, 1.00, 1.0],
    [-0.32, 1.01, 0.3],  // flute ramp-out

    // 3. Neoclassical Relief Collar Band (Y = -0.32 to -0.08)
    [-0.30, 1.03, 0.0],  // lower relief bead ring
    [-0.20, 1.06, 0.0],  // gentle convex frieze swell
    [-0.10, 1.04, 0.0],  // upper relief bead ring

    // 4. Rolled Mouth Lip & Interior Neck Cavity (Y = -0.08 to 0.0)
    [-0.05, 1.07, 0.0],  // rounded lip flare
    [-0.01, 1.08, 0.0],  // outer lip apex
    [ 0.00, 1.05, 0.0],  // rim top curve
    [-0.05, 0.94, 0.0],  // inner rolled lip bevel
    [-0.25, 0.84, 0.0],  // interior neck cavity
    [-0.60, 0.78, 0.0]   // deep interior cavity floor
  ];

  const numRings = 80;
  const numSegments = 192; // 24 flutes * 8 segments per flute for silky smooth curves
  const numFlutes = 24;

  // Linear interpolation along rawProfile
  const profile = [];
  for (let r = 0; r < numRings; r++) {
    const t = r / (numRings - 1);
    const indexFloat = t * (rawProfile.length - 1);
    const i0 = Math.floor(indexFloat);
    const i1 = Math.min(rawProfile.length - 1, i0 + 1);
    const frac = indexFloat - i0;

    const y = rawProfile[i0][0] + (rawProfile[i1][0] - rawProfile[i0][0]) * frac;
    const rBase = rawProfile[i0][1] + (rawProfile[i1][1] - rawProfile[i0][1]) * frac;
    const fluteWeight = rawProfile[i0][2] + (rawProfile[i1][2] - rawProfile[i0][2]) * frac;
    profile.push({ y, rBase, fluteWeight });
  }

  const positions = [];
  const uvs = [];
  const indices = [];

  // Generate vertices ring by ring
  for (let ring = 0; ring < numRings; ring++) {
    const { y, rBase, fluteWeight } = profile[ring];
    const v = (y - (-3.42)) / 3.42;

    for (let seg = 0; seg <= numSegments; seg++) {
      const u = seg / numSegments;
      const theta = u * Math.PI * 2;

      let r = rBase;
      if (rBase > 0.01 && fluteWeight > 0.001) {
        const A = Math.cos(numFlutes * theta);
        // Smooth rounded convex flutes & concave grooves matching the reference photo
        const fluteOffset = 0.046 * rBase * (Math.pow(Math.abs(A), 0.72) * Math.sign(A)) * fluteWeight;
        r += fluteOffset;
      }

      const x = r * Math.sin(theta);
      const z = r * Math.cos(theta);

      positions.push(x, y, z);
      uvs.push(u, v);
    }
  }

  // Generate quad indices between rings with correct outward normal winding
  for (let ring = 0; ring < numRings - 1; ring++) {
    const row1 = ring * (numSegments + 1);
    const row2 = (ring + 1) * (numSegments + 1);

    for (let seg = 0; seg < numSegments; seg++) {
      const a = row1 + seg;
      const b = row2 + seg;
      const c = row2 + seg + 1;
      const d = row1 + seg + 1;

      // Outward facing CCW winding order
      indices.push(a, d, b);
      indices.push(b, d, c);
    }
  }

  // Watertight bottom base cap disc at y = -3.42 (outward downward normal)
  const bottomCenterIndex = positions.length / 3;
  positions.push(0, -3.42, 0);
  uvs.push(0.5, 0.0);
  const bottomRingStart = 0;
  for (let seg = 0; seg < numSegments; seg++) {
    indices.push(bottomCenterIndex, bottomRingStart + seg, bottomRingStart + seg + 1);
  }

  // Watertight top interior cavity floor disc at y = -0.60
  const topCenterIndex = positions.length / 3;
  positions.push(0, -0.60, 0);
  uvs.push(0.5, 1.0);
  const topRingStart = (numRings - 1) * (numSegments + 1);
  for (let seg = 0; seg < numSegments; seg++) {
    indices.push(topCenterIndex, topRingStart + seg + 1, topRingStart + seg);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  return geo;
}

// Procedural Ivory Glaze Texture with Neoclassical Embossed Wave Band
function createFlutedVaseTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // 1. Luxurious Warm Ivory Porcelain Base
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 512);
  bgGrad.addColorStop(0, '#fdfbf7');
  bgGrad.addColorStop(0.35, '#fefcf8');
  bgGrad.addColorStop(0.85, '#faf6ee');
  bgGrad.addColorStop(1, '#f5ede0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // 2. Micro-glaze speckles for realistic fired ceramic surface
  ctx.fillStyle = 'rgba(210, 198, 180, 0.03)';
  for (let i = 0; i < 3000; i++) {
    const rx = Math.random() * 1024;
    const ry = Math.random() * 512;
    ctx.fillRect(rx, ry, 2, 2);
  }

  // 3. Vertical glaze specular highlights along the 24 flutes
  const fluteW = 1024 / 24;
  for (let f = 0; f < 24; f++) {
    const fx = f * fluteW + fluteW * 0.5;
    // Convex ridge highlight
    const rGrad = ctx.createLinearGradient(fx - 5, 0, fx + 5, 0);
    rGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    rGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
    rGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = rGrad;
    ctx.fillRect(fx - 5, 52, 10, 395);

    // Concave groove shadow
    const gx = f * fluteW;
    const gGrad = ctx.createLinearGradient(gx - 6, 0, gx + 6, 0);
    gGrad.addColorStop(0, 'rgba(210, 198, 182, 0)');
    gGrad.addColorStop(0.5, 'rgba(210, 198, 182, 0.18)');
    gGrad.addColorStop(1, 'rgba(210, 198, 182, 0)');
    ctx.fillStyle = gGrad;
    ctx.fillRect(gx - 6, 52, 12, 395);
  }

  // 4. Neoclassical Relief Collar Band (Canvas Y from 16 to 52)
  const bandY1 = 16;
  const bandY2 = 52;

  // Background tint for frieze band
  ctx.fillStyle = '#f6efe3';
  ctx.fillRect(0, bandY1, 1024, bandY2 - bandY1);

  // Top and bottom relief borders
  ctx.strokeStyle = '#ded5c4';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, bandY1); ctx.lineTo(1024, bandY1);
  ctx.moveTo(0, bandY2); ctx.lineTo(1024, bandY2);
  ctx.stroke();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, bandY1 + 1.5); ctx.lineTo(1024, bandY1 + 1.5);
  ctx.moveTo(0, bandY2 - 1.5); ctx.lineTo(1024, bandY2 - 1.5);
  ctx.stroke();

  // Embossed Bead Trim on both edges
  const beadCount = 64;
  const beadStep = 1024 / beadCount;
  for (let b = 0; b < beadCount; b++) {
    const bx = b * beadStep + beadStep * 0.5;
    // Top beads
    ctx.fillStyle = 'rgba(185, 172, 155, 0.45)';
    ctx.beginPath();
    ctx.arc(bx + 1, bandY1 + 5.5, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(bx, bandY1 + 4.5, 2.1, 0, Math.PI * 2);
    ctx.fill();

    // Bottom beads
    ctx.fillStyle = 'rgba(185, 172, 155, 0.45)';
    ctx.beginPath();
    ctx.arc(bx + 1, bandY2 - 3.5, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(bx, bandY2 - 4.5, 2.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Neoclassical Greek Wave / Rococo Scroll Garland
  const waveCount = 16;
  const waveW = 1024 / waveCount;
  const midY = (bandY1 + bandY2) * 0.5;

  for (let w = 0; w < waveCount; w++) {
    const wx = w * waveW;

    // Shadow stroke (bottom-right 3D depth)
    ctx.strokeStyle = 'rgba(185, 172, 155, 0.45)';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(wx + waveW * 0.35 + 1, midY + 1, 7.5, Math.PI * 0.2, Math.PI * 1.3, false);
    ctx.arc(wx + waveW * 0.75 + 1, midY + 1, 7.5, Math.PI * 1.2, Math.PI * 0.3, true);
    ctx.stroke();

    // Glazed white highlight stroke (raised porcelain relief)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(wx + waveW * 0.35, midY, 7.5, Math.PI * 0.2, Math.PI * 1.3, false);
    ctx.arc(wx + waveW * 0.75, midY, 7.5, Math.PI * 1.2, Math.PI * 0.3, true);
    ctx.stroke();

    // Center rosette bead in each wave crest
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(wx + waveW * 0.35, midY, 3.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(195, 182, 165, 0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Procedural Silk Petal Texture (delicate radial venation + warm champagne honey base to pearl white tip)
function createRosePetalTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Petal base gradient: warm honey champagne (#e8cca2) at bottom to pure white (#ffffff) at top
  const grad = ctx.createLinearGradient(0, 512, 0, 0);
  grad.addColorStop(0, '#e8cca2');
  grad.addColorStop(0.18, '#f5e4c6');
  grad.addColorStop(0.50, '#fdfaf5');
  grad.addColorStop(1, '#ffffff');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Delicate silky petal venation (gân cánh hoa tơ lụa mềm mại)
  ctx.strokeStyle = 'rgba(195, 172, 130, 0.22)';
  ctx.lineWidth = 1.6;
  for (let i = -18; i <= 18; i++) {
    ctx.beginPath();
    ctx.moveTo(256, 512);
    ctx.quadraticCurveTo(256 + i * 9.5, 270, 256 + i * 16.5, 24);
    ctx.stroke();
  }

  // Soft rim highlight along top edge
  const rimGrad = ctx.createLinearGradient(0, 0, 0, 55);
  rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = rimGrad;
  ctx.fillRect(0, 0, 512, 55);

  // Soft crevice shadow along bottom edge for inner petal depth
  const baseGrad = ctx.createLinearGradient(0, 512, 0, 400);
  baseGrad.addColorStop(0, 'rgba(165, 138, 95, 0.38)');
  baseGrad.addColorStop(1, 'rgba(165, 138, 95, 0)');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 400, 512, 112);

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

// Procedural Botanical Rose Leaf Texture (Rich emerald green with central & lateral veins)
function createRoseLeafTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Rich deep forest green background
  const bg = ctx.createLinearGradient(0, 0, 512, 512);
  bg.addColorStop(0, '#1c4217');
  bg.addColorStop(0.5, '#25541e');
  bg.addColorStop(1, '#153312');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 512);

  // Main primary vein down the center
  ctx.strokeStyle = '#4e823d';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(256, 512);
  ctx.quadraticCurveTo(256, 256, 256, 12);
  ctx.stroke();

  // Highlight along main vein
  ctx.strokeStyle = '#6ea45c';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(256, 512);
  ctx.quadraticCurveTo(256, 256, 256, 12);
  ctx.stroke();

  // Secondary herringbone veins branching out to serrations
  ctx.strokeStyle = 'rgba(78, 130, 61, 0.45)';
  ctx.lineWidth = 2.0;
  for (let i = 0; i < 14; i++) {
    const yV = 460 - i * 32;
    // Left branch
    ctx.beginPath();
    ctx.moveTo(256, yV);
    ctx.quadraticCurveTo(170, yV - 25, 45, yV - 55);
    ctx.stroke();

    // Right branch
    ctx.beginPath();
    ctx.moveTo(256, yV);
    ctx.quadraticCurveTo(342, yV - 25, 467, yV - 55);
    ctx.stroke();
  }

  // Micro-texture for wax cuticle
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  for (let p = 0; p < 2000; p++) {
    const px = Math.random() * 512;
    const py = Math.random() * 512;
    ctx.fillRect(px, py, 2, 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

// Sculpted Botanical Rose Leaf with Serrated Margin & 3D V-Fold
function createBotanicalRoseLeaf(THREE, leafTex, length = 0.88, width = 0.48) {
  const shape = new THREE.Shape();
  const hw = width * 0.5;

  shape.moveTo(0, 0);

  // Right side with serrated saw-tooth margin
  const steps = 14;
  for (let s = 1; s <= steps; s++) {
    const t = s / steps;
    const y = t * length;
    let x = hw * Math.sin(t * Math.PI) * (1.08 - 0.28 * t);
    if (s < steps) {
      const tooth = (s % 2 === 1) ? hw * 0.08 : -hw * 0.04;
      x += tooth;
    }
    shape.lineTo(x, y);
  }

  // Apex tip
  shape.lineTo(0, length);

  // Left side with serrated saw-tooth margin
  for (let s = steps - 1; s >= 0; s--) {
    const t = s / steps;
    const y = t * length;
    let x = -hw * Math.sin(t * Math.PI) * (1.08 - 0.28 * t);
    if (s > 0) {
      const tooth = (s % 2 === 1) ? -hw * 0.08 : hw * 0.04;
      x += tooth;
    }
    shape.lineTo(x, y);
  }

  const geo = new THREE.ShapeGeometry(shape, 12);
  const pos = geo.attributes.position;
  // Natural 3D leaf curve: concave V-fold along central rib + gentle lengthwise arc
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const tLen = Math.max(0, Math.min(1, y / length));
    const arch = Math.sin(tLen * Math.PI);
    const vFold = -0.06 * (Math.abs(x) / hw) * arch;
    const droop = -0.08 * Math.pow(tLen, 2.2);
    pos.setZ(i, vFold + droop);
  }
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    map: leafTex,
    color: 0xffffff,
    roughness: 0.35,
    metalness: 0.02,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// Parametric Curving Rose Petal Geometry for Ecuadorian Garden Rose 'Proud'
// Truly rounded scalloped envelope closing cleanly at apex (ZERO rectangular paper-like corners)
function createProudWhiteRosePetalGeo(THREE, {
  rBase = 0.03,
  rMid = 0.16,
  rTop = 0.36,
  height = 0.52,
  thetaHalf = 0.95,
  spiralTwist = 0.18,
  cupping = 0.06,
  reflex = 0.18,
  droop = 0.10,
  ruffle = 0.03,
  notch = 0.03,
  segU = 20,
  segV = 20
}) {
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let j = 0; j <= segV; j++) {
    const v = j / segV; // [0, 1] from base attachment to top apex

    // Petal width envelope:
    // Expands smoothly from base (v=0), reaches max width at v=0.62,
    // and curves gracefully into a round, scalloped dome at v=1.0!
    let widthProfile;
    if (v < 0.62) {
      widthProfile = Math.sin((v / 0.62) * (Math.PI * 0.5));
      widthProfile = Math.pow(widthProfile, 0.65);
    } else {
      const tTop = (v - 0.62) / 0.38;
      widthProfile = Math.sqrt(Math.max(0, 1.0 - tTop * tTop));
    }
    widthProfile = Math.max(0.015, widthProfile);

    // Radial expansion as petal rises from stem
    const rBaseToMid = rBase + (rMid - rBase) * Math.sin(v * Math.PI * 0.5) + (rTop - rMid) * Math.pow(v, 1.6);

    // Reflex roll at petal rim (scalloped backward curl of Ecuadorian garden rose)
    let reflexOffset = 0;
    let droopOffset = 0;
    let reflexWeight = 0;
    if (v > 0.58) {
      reflexWeight = (v - 0.58) / 0.42;
      reflexOffset = reflex * Math.pow(reflexWeight, 2.0);
      droopOffset = droop * Math.pow(reflexWeight, 1.8);
    }

    for (let i = 0; i <= segU; i++) {
      const uFrac = i / segU; // [0, 1]
      const rawU = uFrac * 2 - 1; // [-1, 1] across petal width

      // Swirl angle in cylindrical coordinates
      const twist = v * spiralTwist;
      const theta = rawU * thetaHalf * widthProfile + twist;

      // Spoon cupping: dishes inward in the center of the petal like a garden rose chalice
      const cup = cupping * (1.0 - rawU * rawU) * Math.sin(v * Math.PI);

      // Edge ruffle / waviness on outer blooming petals
      const wave = ruffle * Math.sin(rawU * Math.PI * 3.0) * reflexWeight;

      const currentR = rBaseToMid + reflexOffset + wave - cup;

      // Height with gentle heart notch at top center
      let y = v * height - droopOffset;
      if (v > 0.75) {
        const tNotch = (v - 0.75) / 0.25;
        y -= notch * Math.pow(1.0 - Math.abs(rawU), 1.5) * tNotch;
      }

      const x = currentR * Math.sin(theta);
      const z = currentR * Math.cos(theta);

      positions.push(x, y, z);
      uvs.push(uFrac, v);
    }
  }

  // Generate quad indices with CCW winding
  for (let j = 0; j < segV; j++) {
    const row1 = j * (segU + 1);
    const row2 = (j + 1) * (segU + 1);

    for (let i = 0; i < segU; i++) {
      const a = row1 + i;
      const b = row2 + i;
      const c = row2 + i + 1;
      const d = row1 + i + 1;

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// High-Centered Botanical Ecuadorian Garden Rose 'Proud' (36 petals in 7 concentric cupped shell whorls)
function createEcuadorianProudRose(THREE, sharedGeos, sharedMats, scale = 1.0) {
  const rose = new THREE.Group();
  rose.scale.set(scale, scale, scale);

  const {
    coreBudGeo,
    whorl0Geo, whorl1Geo, whorl2Geo, whorl3Geo, whorl4Geo, whorl5Geo, whorl6Geo
  } = sharedGeos;
  const {
    coreMat, whorl0Mat, whorl1Mat, whorl2Mat, whorl3Mat, whorl4Mat, whorl5Mat, whorl6Mat, sepalMat
  } = sharedMats;

  // 1. Center High-Pointed Spiral Bud Cone (Nhụy nón xoắn ốc cao đặc trưng hoa hồng Ecuador)
  const budMesh = new THREE.Mesh(coreBudGeo, coreMat);
  budMesh.position.y = 0.16;
  budMesh.scale.set(1.15, 1.25, 1.15);
  budMesh.castShadow = true;
  budMesh.receiveShadow = true;
  rose.add(budMesh);

  // Helper to add a whorl of petals rotated around flower Y axis with cast/receive shadow
  const addWhorl = (count, geo, mat, angleOffset, yOffset = 0) => {
    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count + angleOffset;
      const petalMesh = new THREE.Mesh(geo, mat);
      petalMesh.rotation.y = angle;
      petalMesh.position.y = yOffset;
      petalMesh.castShadow = true;
      petalMesh.receiveShadow = true;
      rose.add(petalMesh);
    }
  };

  // Whorl 0: Core spiral swirl (3 petals wrapping tightly, upright high center)
  addWhorl(3, whorl0Geo, whorl0Mat, 0.20, 0.12);

  // Whorl 1: Inner spiral bud (4 petals)
  addWhorl(4, whorl1Geo, whorl1Mat, 0.48, 0.10);

  // Whorl 2: Inner cupped chalice (5 petals)
  addWhorl(5, whorl2Geo, whorl2Mat, 0.18, 0.08);

  // Whorl 3: Mid cupped petals (5 petals)
  addWhorl(5, whorl3Geo, whorl3Mat, 0.54, 0.06);

  // Whorl 4: Mid blooming petals (6 petals)
  addWhorl(6, whorl4Geo, whorl4Mat, 0.28, 0.03);

  // Whorl 5: Outer blooming petals (6 petals)
  addWhorl(6, whorl5Geo, whorl5Mat, 0.65, 0.01);

  // Whorl 6: Broad reflexed guard petals (7 petals with rolled rims)
  addWhorl(7, whorl6Geo, whorl6Mat, 0.38, -0.02);

  // 5 Green Sepals spreading beneath base
  const sepalGeo = new THREE.ConeGeometry(0.07, 0.55, 5);
  sepalGeo.scale(1.2, 0.12, 1);
  for (let s = 0; s < 5; s++) {
    const sAngle = s * (Math.PI * 2 / 5);
    const sepal = new THREE.Mesh(sepalGeo, sepalMat);
    sepal.position.set(Math.cos(sAngle) * 0.28, -0.05, Math.sin(sAngle) * 0.28);
    sepal.rotation.y = -sAngle;
    sepal.rotation.x = Math.PI / 1.62;
    sepal.castShadow = true;
    sepal.receiveShadow = true;
    rose.add(sepal);
  }

  return rose;
}

// Stately Bouquet of 18 Botanical Ecuadorian White Garden Roses 'Proud' Arranged in a Lush Full Dome
function buildProudWhiteRosesBouquet(THREE, group) {
  const bouquetGroup = new THREE.Group();

  // Shared procedural petal and leaf textures
  const petalTex = createRosePetalTexture(THREE);
  const leafTex = createRoseLeafTexture(THREE);

  // Shared 7 Cylindrical Curved Petal Geometries (Compact Cupped Botanical Garden Rose 'Proud')
  const sharedGeos = {
    coreBudGeo: new THREE.ConeGeometry(0.055, 0.38, 16),
    whorl0Geo: createProudWhiteRosePetalGeo(THREE, {
      rBase: 0.02, rMid: 0.04, rTop: 0.07, height: 0.40, thetaHalf: 1.25, spiralTwist: 0.32, cupping: 0.015, reflex: 0.0, droop: 0.0, ruffle: 0.0, notch: 0.01
    }),
    whorl1Geo: createProudWhiteRosePetalGeo(THREE, {
      rBase: 0.03, rMid: 0.07, rTop: 0.12, height: 0.44, thetaHalf: 1.15, spiralTwist: 0.24, cupping: 0.03, reflex: 0.02, droop: 0.01, ruffle: 0.0, notch: 0.02
    }),
    whorl2Geo: createProudWhiteRosePetalGeo(THREE, {
      rBase: 0.05, rMid: 0.11, rTop: 0.18, height: 0.47, thetaHalf: 1.05, spiralTwist: 0.18, cupping: 0.05, reflex: 0.05, droop: 0.02, ruffle: 0.01, notch: 0.02
    }),
    whorl3Geo: createProudWhiteRosePetalGeo(THREE, {
      rBase: 0.08, rMid: 0.16, rTop: 0.25, height: 0.49, thetaHalf: 0.95, spiralTwist: 0.12, cupping: 0.07, reflex: 0.09, droop: 0.03, ruffle: 0.02, notch: 0.03
    }),
    whorl4Geo: createProudWhiteRosePetalGeo(THREE, {
      rBase: 0.11, rMid: 0.21, rTop: 0.31, height: 0.50, thetaHalf: 0.88, spiralTwist: 0.07, cupping: 0.08, reflex: 0.14, droop: 0.05, ruffle: 0.025, notch: 0.03
    }),
    whorl5Geo: createProudWhiteRosePetalGeo(THREE, {
      rBase: 0.15, rMid: 0.26, rTop: 0.36, height: 0.48, thetaHalf: 0.82, spiralTwist: 0.03, cupping: 0.09, reflex: 0.19, droop: 0.08, ruffle: 0.03, notch: 0.03
    }),
    whorl6Geo: createProudWhiteRosePetalGeo(THREE, {
      rBase: 0.19, rMid: 0.31, rTop: 0.40, height: 0.45, thetaHalf: 0.78, spiralTwist: 0.01, cupping: 0.08, reflex: 0.24, droop: 0.11, ruffle: 0.035, notch: 0.03
    })
  };

  // Shared materials: Rich warm golden honey champagne core to luminous pearl white outer reflex petals
  const pbrSide = {
    map: petalTex,
    roughness: 0.40,
    metalness: 0.0,
    side: THREE.DoubleSide
  };

  const sharedMats = {
    coreMat: new THREE.MeshStandardMaterial({ color: 0xdfb462, roughness: 0.36 }), // rich golden honey center
    whorl0Mat: new THREE.MeshStandardMaterial({ ...pbrSide, color: 0xeac885 }), // warm golden champagne core
    whorl1Mat: new THREE.MeshStandardMaterial({ ...pbrSide, color: 0xf3db9f }), // creamy butter honey
    whorl2Mat: new THREE.MeshStandardMaterial({ ...pbrSide, color: 0xf8e6c0 }), // warm ivory
    whorl3Mat: new THREE.MeshStandardMaterial({ ...pbrSide, color: 0xfbf0d8 }), // soft champagne
    whorl4Mat: new THREE.MeshStandardMaterial({ ...pbrSide, color: 0xfdf7ec }), // pearl white
    whorl5Mat: new THREE.MeshStandardMaterial({ ...pbrSide, color: 0xfefbfa }), // bridal white
    whorl6Mat: new THREE.MeshStandardMaterial({ ...pbrSide, color: 0xffffff }), // crisp white reflex
    sepalMat: new THREE.MeshStandardMaterial({ color: 0x18421b, roughness: 0.32, side: THREE.DoubleSide })
  };

  // Fresh botanical rose stem cane material
  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x2f5c22,
    roughness: 0.38
  });

  // 18 Botanical Ecuadorian Garden Roses 'Proud' Arranged in a Wide, Plump, Hemispherical Dome
  // Height: apex at Y = 2.02. Width: spans across X = -1.32 to +1.32 (Total span ~2.64 units, Golden Ratio 1.3:1)
  const rosePositions = [
    // --- [1. CROWN APEX ROSES] (3 roses forming the rounded apex crest) ---
    { pos: new THREE.Vector3(0.00, 2.02, 0.10), scale: 1.08 }, // Center top forward
    { pos: new THREE.Vector3(-0.42, 1.95, -0.22), scale: 1.04 }, // Left-rear top
    { pos: new THREE.Vector3(0.42, 1.95, -0.22), scale: 1.04 }, // Right-rear top

    // --- [2. UPPER-MID DOME RING] (5 roses forming the full upper curve) ---
    { pos: new THREE.Vector3(0.00, 1.76, 0.68), scale: 1.10 }, // Upper front-center
    { pos: new THREE.Vector3(-0.68, 1.70, 0.42), scale: 1.06 }, // Upper front-left
    { pos: new THREE.Vector3(0.68, 1.70, 0.42), scale: 1.06 }, // Upper front-right
    { pos: new THREE.Vector3(-0.62, 1.72, -0.48), scale: 1.02 }, // Upper rear-left
    { pos: new THREE.Vector3(0.62, 1.72, -0.48), scale: 1.02 }, // Upper rear-right

    // --- [3. MID-LEVEL HERO RING] (6 roses forming the wide luxurious belly of the bouquet) ---
    { pos: new THREE.Vector3(0.00, 1.32, 1.08), scale: 1.18 }, // HERO FRONT ROSE! Tilted directly toward camera!
    { pos: new THREE.Vector3(-0.95, 1.28, 0.72), scale: 1.10 }, // Front-left hero
    { pos: new THREE.Vector3(0.95, 1.28, 0.72), scale: 1.10 }, // Front-right hero
    { pos: new THREE.Vector3(-1.32, 1.30, 0.00), scale: 1.08 }, // Wide far-left flank
    { pos: new THREE.Vector3(1.32, 1.30, 0.00), scale: 1.08 }, // Wide far-right flank
    { pos: new THREE.Vector3(0.00, 1.34, -0.98), scale: 1.04 }, // Rear-center mid

    // --- [4. LOWER OVERHANG & SKIRT RING] (4 roses flaring outward over collar foliage) ---
    { pos: new THREE.Vector3(0.00, 0.92, 1.22), scale: 1.12 }, // Low front draping rose directly above collar leaves
    { pos: new THREE.Vector3(-1.12, 0.88, 0.48), scale: 1.08 }, // Low left draping rose
    { pos: new THREE.Vector3(1.12, 0.88, 0.48), scale: 1.08 }, // Low right draping rose
    { pos: new THREE.Vector3(0.00, 0.94, -1.15), scale: 1.04 } // Low rear draping rose
  ];

  // Upright green canes emerging visibly from vase mouth up to each bloom in a flared spray
  rosePositions.forEach((roseData, idx) => {
    const stemAngle = (idx / rosePositions.length) * Math.PI * 2;
    const baseR = 0.18 + (idx % 4) * 0.06;
    const start = new THREE.Vector3(Math.cos(stemAngle) * baseR, -0.35, Math.sin(stemAngle) * baseR);
    
    // Point where cane exits the vase mouth
    const mouthPt = new THREE.Vector3(
      roseData.pos.x * 0.36,
      0.0,
      roseData.pos.z * 0.36
    );

    // Visible flared cane midpoint rising ~0.45 unit above vase mouth
    const mid = new THREE.Vector3(
      roseData.pos.x * 0.68,
      roseData.pos.y * 0.50 + 0.08,
      roseData.pos.z * 0.68
    );

    // End at the base of the rose head
    const end = roseData.pos.clone();

    // Smooth botanical stem curve
    const curve = new THREE.CatmullRomCurve3([start, mouthPt, mid, end]);
    const stemGeo = new THREE.TubeGeometry(curve, 14, 0.044, 8, false);
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    stemMesh.castShadow = true;
    stemMesh.receiveShadow = true;
    bouquetGroup.add(stemMesh);

    // Calculate natural blossoming orientation:
    // The rose head points outward along the stem's terminal tangent!
    const tangent = curve.getTangent(1.0).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, tangent);

    // Sculpted Botanical High-Centered Ecuadorian Garden Rose 'Proud'
    const roseHead = createEcuadorianProudRose(THREE, sharedGeos, sharedMats, roseData.scale);
    roseHead.position.copy(end);
    roseHead.quaternion.copy(quat);
    // Add natural golden-ratio axial rotation so every bloom has a unique petal orientation
    roseHead.rotateY((idx * 2.399) % (Math.PI * 2));
    bouquetGroup.add(roseHead);
  });

  // Dark Green Rose Leaves: Lush Collar hugging the stems and draping over vase rim
  const collarLeafCount = 24;
  for (let l = 0; l < collarLeafCount; l++) {
    const lAngle = (l / collarLeafCount) * Math.PI * 2;
    const leaf = createBotanicalRoseLeaf(THREE, leafTex, 0.88, 0.48);
    // Nestled around Y = 0.42 to 0.72 framing the stems and lower roses
    const dist = 0.82 + (l % 4) * 0.24;
    const yL = 0.45 + (l % 3) * 0.10;
    leaf.position.set(Math.cos(lAngle) * dist, yL, Math.sin(lAngle) * dist);
    leaf.rotation.y = -lAngle + Math.PI / 2;
    // Alternate between leaves draping downward over the rim and leaves cupping upward
    if (l % 3 === 0) {
      // Draping down over vase collar rim
      leaf.rotation.x = Math.PI / 1.75;
    } else {
      // Cupping upward toward lower roses
      leaf.rotation.x = Math.PI / 2.35 + (l % 2) * 0.10;
    }
    bouquetGroup.add(leaf);
  }

  // Inter-bloom leaves nestled between middle and upper roses for organic botanical realism
  const interLeafPositions = [
    { pos: new THREE.Vector3(0.48, 1.25, 0.82), rot: new THREE.Euler(0.65, 0.35, 0) },
    { pos: new THREE.Vector3(-0.48, 1.25, 0.82), rot: new THREE.Euler(0.65, -0.35, 0) },
    { pos: new THREE.Vector3(1.18, 1.22, 0.35), rot: new THREE.Euler(0.55, 0.80, -0.28) },
    { pos: new THREE.Vector3(-1.18, 1.22, 0.35), rot: new THREE.Euler(0.55, -0.80, 0.28) },
    { pos: new THREE.Vector3(0.52, 1.62, 0.42), rot: new THREE.Euler(0.42, 0.25, 0) },
    { pos: new THREE.Vector3(-0.52, 1.62, 0.42), rot: new THREE.Euler(0.42, -0.25, 0) },
    { pos: new THREE.Vector3(0.00, 1.72, 0.52), rot: new THREE.Euler(0.48, 0, 0) },
    { pos: new THREE.Vector3(0.85, 1.58, -0.25), rot: new THREE.Euler(0.28, 0.92, -0.22) },
    { pos: new THREE.Vector3(-0.85, 1.58, -0.25), rot: new THREE.Euler(0.28, -0.92, 0.22) },
    { pos: new THREE.Vector3(0.00, 1.95, -0.38), rot: new THREE.Euler(-0.45, 0, 0) },
    { pos: new THREE.Vector3(0.38, 1.92, 0.12), rot: new THREE.Euler(0.22, 0.48, 0) },
    { pos: new THREE.Vector3(-0.38, 1.92, 0.12), rot: new THREE.Euler(0.22, -0.48, 0) }
  ];
  interLeafPositions.forEach(({ pos, rot }) => {
    const leaf = createBotanicalRoseLeaf(THREE, leafTex, 0.75, 0.40);
    leaf.position.copy(pos);
    leaf.rotation.copy(rot);
    bouquetGroup.add(leaf);
  });

  group.add(bouquetGroup);
}

// --- 3D MODEL GENERATOR: RIBBED CYLINDER VASE & LUOSHEN ENGLISH CABBAGE ROSES (MẪU 3) ---

function buildRibbedVaseAndLuoshenRoses(THREE, group) {
  // Clear any existing children
  while (group.children.length > 0) {
    const obj = group.children[0];
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
      else obj.material.dispose();
    }
    group.remove(obj);
  }

  // 1. Horizontal Ribbed White Ceramic Vase
  const vaseTex = createRibbedVaseTexture(THREE);
  const vaseMat = new THREE.MeshStandardMaterial({
    map: vaseTex,
    color: 0xffffff,
    roughness: 0.38,
    metalness: 0.02
  });
  const vaseGeo = createRibbedCylinderVaseGeometry(THREE);
  const vaseMesh = new THREE.Mesh(vaseGeo, vaseMat);
  vaseMesh.castShadow = true;
  vaseMesh.receiveShadow = true;
  group.add(vaseMesh);

  // 2. Grand English Cabbage Roses Bouquet (Hồng Lạc Thần)
  buildLuoshenBouquet(THREE, group);
}

// Parametric Horizontal Ribbed Cylindrical Ceramic Vase
function createRibbedCylinderVaseGeometry(THREE) {
  // Base rests on plinth at y = -3.42, flat base r = 0.98.
  // Straight cylindrical body with 16 horizontal sinusoidal ribs from y = -3.36 to -0.92.
  // Smooth rolled mouth lip at y = -0.75, radius 1.06.
  const rawProfile = [
    [-3.42, 0.98, 0.0],  // bottom flat ring resting on plinth
    [-3.36, 1.00, 0.0],  // base chamfer bead
    [-3.30, 1.00, 1.0],  // ribbed body start
    [-3.00, 1.01, 1.0],
    [-2.60, 1.02, 1.0],
    [-2.20, 1.02, 1.0],
    [-1.80, 1.03, 1.0],
    [-1.40, 1.04, 1.0],
    [-1.05, 1.05, 1.0],
    [-0.92, 1.05, 0.5],  // ribbed body ramp-out
    [-0.85, 1.06, 0.0],  // smooth upper collar band
    [-0.78, 1.08, 0.0],  // outer lip apex
    [-0.75, 1.04, 0.0],  // rim top apex
    [-0.78, 0.94, 0.0],  // inner rolled lip bevel
    [-0.95, 0.88, 0.0],  // interior neck cavity
    [-1.35, 0.84, 0.0]   // interior cavity floor
  ];

  const numRings = 80;
  const numSegments = 128;
  const numHorizontalRibs = 16;

  const profile = [];
  for (let r = 0; r < numRings; r++) {
    const t = r / (numRings - 1);
    const indexFloat = t * (rawProfile.length - 1);
    const i0 = Math.floor(indexFloat);
    const i1 = Math.min(rawProfile.length - 1, i0 + 1);
    const frac = indexFloat - i0;

    const y = rawProfile[i0][0] + (rawProfile[i1][0] - rawProfile[i0][0]) * frac;
    const rBase = rawProfile[i0][1] + (rawProfile[i1][1] - rawProfile[i0][1]) * frac;
    const ribWeight = rawProfile[i0][2] + (rawProfile[i1][2] - rawProfile[i0][2]) * frac;
    profile.push({ y, rBase, ribWeight });
  }

  const positions = [];
  const uvs = [];
  const indices = [];

  for (let ring = 0; ring < numRings; ring++) {
    const { y, rBase, ribWeight } = profile[ring];
    const v = (y - (-3.42)) / 2.67;

    for (let seg = 0; seg <= numSegments; seg++) {
      const u = seg / numSegments;
      const theta = u * Math.PI * 2;

      let r = rBase;
      if (ribWeight > 0.01) {
        // Horizontal sinusoidal throwing ribs (vòng gân ngang vuốt gốm nổi rõ nét)
        const tVert = (y - (-3.36)) / ((-0.92) - (-3.36));
        const ribSin = Math.sin(tVert * Math.PI * numHorizontalRibs);
        const ribOffset = 0.045 * (0.5 + 0.5 * ribSin) * ribWeight;
        r += ribOffset;
      }

      const x = r * Math.sin(theta);
      const z = r * Math.cos(theta);

      positions.push(x, y, z);
      uvs.push(u, v);
    }
  }

  // CCW outward indices
  for (let ring = 0; ring < numRings - 1; ring++) {
    const row1 = ring * (numSegments + 1);
    const row2 = (ring + 1) * (numSegments + 1);

    for (let seg = 0; seg < numSegments; seg++) {
      const a = row1 + seg;
      const b = row2 + seg;
      const c = row2 + seg + 1;
      const d = row1 + seg + 1;

      indices.push(a, d, b);
      indices.push(b, d, c);
    }
  }

  // Watertight bottom base cap at y = -3.42
  const bottomCenterIndex = positions.length / 3;
  positions.push(0, -3.42, 0);
  uvs.push(0.5, 0.0);
  const bottomRingStart = 0;
  for (let seg = 0; seg < numSegments; seg++) {
    indices.push(bottomCenterIndex, bottomRingStart + seg, bottomRingStart + seg + 1);
  }

  // Watertight top interior cavity floor at y = -1.35
  const topCenterIndex = positions.length / 3;
  positions.push(0, -1.35, 0);
  uvs.push(0.5, 1.0);
  const topRingStart = (numRings - 1) * (numSegments + 1);
  for (let seg = 0; seg < numSegments; seg++) {
    indices.push(topCenterIndex, topRingStart + seg + 1, topRingStart + seg);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  return geo;
}

// Procedural Off-White Ceramic Texture with Subtle Horizontal Wheel Ridges
function createRibbedVaseTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Warm off-white chalky eggshell glaze
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#faf8f4');
  grad.addColorStop(0.5, '#f5efe6');
  grad.addColorStop(1, '#ede5d8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // 16 Horizontal Throwing Ring Shading Bands
  const ribHeight = 512 / 16;
  for (let r = 0; r < 16; r++) {
    const ry = r * ribHeight;
    // Highlight ridge crest
    const hGrad = ctx.createLinearGradient(0, ry, 0, ry + ribHeight * 0.5);
    hGrad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
    hGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = hGrad;
    ctx.fillRect(0, ry, 1024, ribHeight * 0.5);

    // Groove shadow
    const sGrad = ctx.createLinearGradient(0, ry + ribHeight * 0.5, 0, ry + ribHeight);
    sGrad.addColorStop(0, 'rgba(180, 168, 150, 0.0)');
    sGrad.addColorStop(1, 'rgba(168, 153, 136, 0.38)');
    ctx.fillStyle = sGrad;
    ctx.fillRect(0, ry + ribHeight * 0.5, 1024, ribHeight * 0.5);
  }

  // Micro-texture for authentic fired ceramic
  ctx.fillStyle = 'rgba(200, 185, 165, 0.05)';
  for (let p = 0; p < 2500; p++) {
    const px = Math.random() * 1024;
    const py = Math.random() * 512;
    ctx.fillRect(px, py, 2, 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

// Procedural Watercolor Texture for Luoshen Rose Petals (Pink or Cream White)
function createLuoshenRosePetalTexture(THREE, isPink = true) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 512, 0, 0);
  if (isPink) {
    // Rich romantic candy rose pink: deep core, vibrant pink body, blush petal edge
    grad.addColorStop(0, '#bd2045');     // rich rose magenta base
    grad.addColorStop(0.20, '#d83861');  // vivid rose
    grad.addColorStop(0.50, '#ea587f');  // classic cabbage rose pink
    grad.addColorStop(0.75, '#f485a3');  // lush pastel pink
    grad.addColorStop(0.92, '#fcaec3');  // blush petal rim
    grad.addColorStop(1.0, '#fdd2df');   // soft blush edge
  } else {
    // Warm custard apricot center fading into creamy ivory butter and bridal white tips
    grad.addColorStop(0, '#f2ce6e');     // warm golden custard core
    grad.addColorStop(0.25, '#fae39b');  // creamy apricot glow
    grad.addColorStop(0.55, '#fef0c7');  // warm ivory cream
    grad.addColorStop(0.85, '#fefaf0');  // pearl white
    grad.addColorStop(1.0, '#ffffff');   // bridal white
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Silky delicate radial petal veins
  ctx.strokeStyle = isPink ? 'rgba(180, 40, 70, 0.22)' : 'rgba(205, 175, 120, 0.22)';
  ctx.lineWidth = 1.6;
  for (let i = -18; i <= 18; i++) {
    ctx.beginPath();
    ctx.moveTo(256, 512);
    ctx.quadraticCurveTo(256 + i * 9.5, 270, 256 + i * 16.5, 24);
    ctx.stroke();
  }

  // Soft rim highlight along top edge
  const rimGrad = ctx.createLinearGradient(0, 0, 0, 48);
  if (isPink) {
    rimGrad.addColorStop(0, 'rgba(255, 220, 235, 0.65)');
    rimGrad.addColorStop(1, 'rgba(255, 220, 235, 0.0)');
  } else {
    rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
  }
  ctx.fillStyle = rimGrad;
  ctx.fillRect(0, 0, 512, 48);

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

// Parametric Curving & Ruffled Cabbage Rose Petal Geometry (Hồng Lạc Thần / David Austin Peony-Rose)
function createLuoshenRosePetalGeo(THREE, {
  rBase = 0.02,
  rMid = 0.15,
  rTop = 0.32,
  height = 0.45,
  thetaHalf = 0.85,
  spiralTwist = 0.15,
  cupping = 0.08,    // Deep spherical bowl-like dishing
  curling = 0.06,    // Inward curling top for cabbage chalice
  ruffle = 0.025,   // Accordion frills along petal edge
  reflex = 0.02,    // Gentle outward rim lip only at apex
  segU = 18,
  segV = 18
}) {
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let j = 0; j <= segV; j++) {
    const v = j / segV; // [0, 1]

    // Wide rounded cabbage petal envelope
    let widthProfile;
    if (v < 0.60) {
      widthProfile = Math.sin((v / 0.60) * (Math.PI * 0.5));
      widthProfile = Math.pow(widthProfile, 0.65);
    } else {
      const tTop = (v - 0.60) / 0.40;
      widthProfile = Math.sqrt(Math.max(0, 1.0 - tTop * tTop));
    }
    widthProfile = Math.max(0.02, widthProfile);

    // Radial expansion as petal rises from stem into round chalice
    let r = rBase + (rMid - rBase) * Math.sin(v * Math.PI * 0.5) + (rTop - rMid) * Math.pow(v, 1.4);

    // Inward cabbage bowl curl: curves inward near the top to form a ball
    if (v > 0.55) {
      const tEnd = (v - 0.55) / 0.45;
      r -= curling * Math.pow(tEnd, 1.5);
      r += reflex * Math.pow(tEnd, 3.0);
    }

    for (let i = 0; i <= segU; i++) {
      const uFrac = i / segU;
      const rawU = uFrac * 2 - 1; // [-1, 1]

      const twist = v * spiralTwist;
      const theta = rawU * thetaHalf * widthProfile + twist;

      // Spherical chalice spoon cupping
      const cup = cupping * (1.0 - rawU * rawU) * Math.sin(v * Math.PI * 0.9);

      // Frilly accordion ruffles characteristic of Luoshen cabbage roses
      const wave = ruffle * Math.sin(rawU * Math.PI * 5.0) * Math.sin(v * Math.PI * 0.85);

      const currentR = r + wave - cup;
      const y = v * height;

      const x = currentR * Math.sin(theta);
      const z = currentR * Math.cos(theta);

      positions.push(x, y, z);
      uvs.push(uFrac, v);
    }
  }

  // Quad indices with CCW winding
  for (let j = 0; j < segV; j++) {
    const row1 = j * (segU + 1);
    const row2 = (j + 1) * (segU + 1);

    for (let i = 0; i < segU; i++) {
      const a = row1 + i;
      const b = row2 + i;
      const c = row2 + i + 1;
      const d = row1 + i + 1;

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// Lush English Cabbage Rose 'Hồng Lạc Thần' (44 petals across 8 whorls with Quartered Rosette Heart)
function createLuoshenRoseBloom(THREE, sharedGeos, mats, scale = 1.0) {
  const rose = new THREE.Group();
  rose.scale.set(scale, scale, scale);

  const {
    whorl0Geo, whorl1Geo, whorl2Geo, whorl3Geo, whorl4Geo, whorl5Geo, whorl6Geo
  } = sharedGeos;
  const {
    coreMat, whorl0Mat, whorl1Mat, whorl2Mat, whorl3Mat, whorl4Mat, whorl5Mat, whorl6Mat, sepalMat
  } = mats;

  // 1. Center Quartered Ruffled Rosette Heart (Nhụy nhúm bèo tổ ong 4 múi)
  const rosetteGeo = new THREE.SphereGeometry(0.14, 14, 14);
  rosetteGeo.scale(1.15, 0.75, 1.15);
  const rosetteMesh = new THREE.Mesh(rosetteGeo, coreMat);
  rosetteMesh.position.y = 0.12;
  rosetteMesh.castShadow = true;
  rosetteMesh.receiveShadow = true;
  rose.add(rosetteMesh);

  // Helper to add a whorl of cupped cabbage petals
  const addWhorl = (count, geo, mat, angleOffset, yOffset = 0) => {
    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count + angleOffset;
      const petalMesh = new THREE.Mesh(geo, mat);
      petalMesh.rotation.y = angle;
      petalMesh.position.y = yOffset;
      petalMesh.castShadow = true;
      petalMesh.receiveShadow = true;
      rose.add(petalMesh);
    }
  };

  // Whorl 0: Crinkled rosette swirl (4 petals wrapping tight)
  addWhorl(4, whorl0Geo, whorl0Mat, 0.25, 0.10);

  // Whorl 1: Inner cupped chalice (5 petals)
  addWhorl(5, whorl1Geo, whorl1Mat, 0.50, 0.08);

  // Whorl 2: Inner chalice bowl (5 petals)
  addWhorl(5, whorl2Geo, whorl2Mat, 0.15, 0.06);

  // Whorl 3: Mid chalice bowl (6 petals)
  addWhorl(6, whorl3Geo, whorl3Mat, 0.42, 0.04);

  // Whorl 4: Mid blooming petals (6 petals)
  addWhorl(6, whorl4Geo, whorl4Mat, 0.20, 0.02);

  // Whorl 5: Outer cupped petals (7 petals)
  addWhorl(7, whorl5Geo, whorl5Mat, 0.60, 0.00);

  // Whorl 6: Broad cupped guard petals (7 petals)
  addWhorl(7, whorl6Geo, whorl6Mat, 0.30, -0.02);

  // 5 Green Sepals beneath
  const sepalGeo = new THREE.ConeGeometry(0.065, 0.50, 5);
  sepalGeo.scale(1.2, 0.12, 1);
  for (let s = 0; s < 5; s++) {
    const sAngle = s * (Math.PI * 2 / 5);
    const sepal = new THREE.Mesh(sepalGeo, sepalMat);
    sepal.position.set(Math.cos(sAngle) * 0.28, -0.05, Math.sin(sAngle) * 0.28);
    sepal.rotation.y = -sAngle;
    sepal.rotation.x = Math.PI / 1.62;
    sepal.castShadow = true;
    sepal.receiveShadow = true;
    rose.add(sepal);
  }

  return rose;
}

// Petite Pink Rosebud (Nụ Hồng Lạc Thần Chúm Chím)
function createLuoshenRosebud(THREE, petalMat, sepalMat, scale = 1.0) {
  const budGroup = new THREE.Group();
  budGroup.scale.set(scale, scale, scale);

  // Spherical pink petal ball
  const budGeo = new THREE.SphereGeometry(0.18, 14, 14);
  budGeo.scale(0.85, 1.25, 0.85);
  const budMesh = new THREE.Mesh(budGeo, petalMat);
  budMesh.position.y = 0.16;
  budMesh.castShadow = true;
  budMesh.receiveShadow = true;
  budGroup.add(budMesh);

  // 5 Long pointed sepals hugging the bud
  const sepalGeo = new THREE.ConeGeometry(0.055, 0.52, 4);
  sepalGeo.scale(1.15, 0.15, 1);
  for (let s = 0; s < 5; s++) {
    const sAngle = s * (Math.PI * 2 / 5);
    const sepal = new THREE.Mesh(sepalGeo, sepalMat);
    sepal.position.set(Math.cos(sAngle) * 0.14, 0.14, Math.sin(sAngle) * 0.14);
    sepal.rotation.y = -sAngle;
    sepal.rotation.x = 0.22; // Hugs upward around bud
    sepal.castShadow = true;
    budGroup.add(sepal);
  }

  return budGroup;
}

// Glossy Pearl Berry Cluster (Chùm Quả Mọng Hạt Ngọc Trắng Xanh)
function createPearlBerryCluster(THREE, berryGeo, berryMat, stemMat) {
  const cluster = new THREE.Group();

  // Branching stems bearing 7-8 glossy berries
  const berryPositions = [
    new THREE.Vector3(0.00, 0.30, 0.00),
    new THREE.Vector3(0.10, 0.25, 0.07),
    new THREE.Vector3(-0.10, 0.23, 0.06),
    new THREE.Vector3(0.06, 0.19, -0.08),
    new THREE.Vector3(-0.07, 0.17, -0.07),
    new THREE.Vector3(0.12, 0.13, 0.02),
    new THREE.Vector3(-0.11, 0.11, 0.04)
  ];

  berryPositions.forEach((pos) => {
    // Small connecting twig
    const twigCurve = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), pos);
    const twigGeo = new THREE.TubeGeometry(twigCurve, 4, 0.014, 5, false);
    const twig = new THREE.Mesh(twigGeo, stemMat);
    cluster.add(twig);

    // Round pearl berry
    const berry = new THREE.Mesh(berryGeo, berryMat);
    berry.position.copy(pos);
    berry.castShadow = true;
    cluster.add(berry);
  });

  return cluster;
}

// Tiny Cream Star Floret Sprig (Hoa Sao Li Ti Nở Chùm)
function createStarFloretSprig(THREE, floretMat, stemMat) {
  const sprig = new THREE.Group();

  // Little star geometry (5 tiny petals)
  const starGeo = new THREE.CircleGeometry(0.055, 5);

  const floretOffsets = [
    new THREE.Vector3(0.00, 0.28, 0.00),
    new THREE.Vector3(0.08, 0.24, 0.06),
    new THREE.Vector3(-0.08, 0.22, 0.05),
    new THREE.Vector3(0.06, 0.18, -0.07),
    new THREE.Vector3(-0.07, 0.15, -0.06)
  ];

  floretOffsets.forEach((pos, idx) => {
    const twigCurve = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), pos);
    const twigGeo = new THREE.TubeGeometry(twigCurve, 3, 0.010, 4, false);
    const twig = new THREE.Mesh(twigGeo, stemMat);
    sprig.add(twig);

    const floret = new THREE.Mesh(starGeo, floretMat);
    floret.position.copy(pos);
    floret.rotation.x = Math.PI / 4 + idx * 0.2;
    floret.rotation.y = idx * 1.2;
    sprig.add(floret);
  });

  return sprig;
}

// Grand French Country Bouquet of 18 Luoshen Cabbage Roses + 5 Rosebuds + Berries + Star Florets
function buildLuoshenBouquet(THREE, group) {
  const bouquetGroup = new THREE.Group();

  // Procedural petal & leaf textures
  const pinkPetalTex = createLuoshenRosePetalTexture(THREE, true);
  const whitePetalTex = createLuoshenRosePetalTexture(THREE, false);
  const leafTex = createRoseLeafTexture(THREE);

  // Shared 7 Cabbage Rose Petal Geometries (True Spherical Peony Cabbage Shape)
  const sharedGeos = {
    whorl0Geo: createLuoshenRosePetalGeo(THREE, {
      rBase: 0.02, rMid: 0.05, rTop: 0.09, height: 0.35, thetaHalf: 1.25, spiralTwist: 0.28, cupping: 0.03, curling: 0.03, ruffle: 0.035, reflex: 0.0
    }),
    whorl1Geo: createLuoshenRosePetalGeo(THREE, {
      rBase: 0.03, rMid: 0.08, rTop: 0.14, height: 0.40, thetaHalf: 1.15, spiralTwist: 0.22, cupping: 0.05, curling: 0.04, ruffle: 0.030, reflex: 0.01
    }),
    whorl2Geo: createLuoshenRosePetalGeo(THREE, {
      rBase: 0.05, rMid: 0.12, rTop: 0.20, height: 0.44, thetaHalf: 1.05, spiralTwist: 0.16, cupping: 0.07, curling: 0.05, ruffle: 0.028, reflex: 0.02
    }),
    whorl3Geo: createLuoshenRosePetalGeo(THREE, {
      rBase: 0.08, rMid: 0.17, rTop: 0.26, height: 0.47, thetaHalf: 0.95, spiralTwist: 0.10, cupping: 0.09, curling: 0.06, ruffle: 0.025, reflex: 0.025
    }),
    whorl4Geo: createLuoshenRosePetalGeo(THREE, {
      rBase: 0.12, rMid: 0.22, rTop: 0.32, height: 0.49, thetaHalf: 0.88, spiralTwist: 0.06, cupping: 0.10, curling: 0.07, ruffle: 0.025, reflex: 0.03
    }),
    whorl5Geo: createLuoshenRosePetalGeo(THREE, {
      rBase: 0.16, rMid: 0.27, rTop: 0.37, height: 0.48, thetaHalf: 0.82, spiralTwist: 0.03, cupping: 0.10, curling: 0.07, ruffle: 0.022, reflex: 0.035
    }),
    whorl6Geo: createLuoshenRosePetalGeo(THREE, {
      rBase: 0.20, rMid: 0.32, rTop: 0.41, height: 0.46, thetaHalf: 0.78, spiralTwist: 0.01, cupping: 0.09, curling: 0.06, ruffle: 0.020, reflex: 0.04
    })
  };

  // Shared Pink Luoshen Rose Materials (Rich Candy Rose Pink Throughout)
  const pbrPink = { map: pinkPetalTex, roughness: 0.40, metalness: 0.0, side: THREE.DoubleSide };
  const pinkMats = {
    coreMat: new THREE.MeshStandardMaterial({ color: 0x9b1b3b, roughness: 0.35 }),
    whorl0Mat: new THREE.MeshStandardMaterial({ ...pbrPink, color: 0xb82649 }),
    whorl1Mat: new THREE.MeshStandardMaterial({ ...pbrPink, color: 0xcf355c }),
    whorl2Mat: new THREE.MeshStandardMaterial({ ...pbrPink, color: 0xe04d74 }),
    whorl3Mat: new THREE.MeshStandardMaterial({ ...pbrPink, color: 0xeb648b }),
    whorl4Mat: new THREE.MeshStandardMaterial({ ...pbrPink, color: 0xf27d9f }),
    whorl5Mat: new THREE.MeshStandardMaterial({ ...pbrPink, color: 0xf592af }),
    whorl6Mat: new THREE.MeshStandardMaterial({ ...pbrPink, color: 0xf7a4be }),
    sepalMat: new THREE.MeshStandardMaterial({ color: 0x18421b, roughness: 0.32, side: THREE.DoubleSide })
  };

  // Shared Cream White Luoshen Rose Materials (Warm Custard Glow to Bridal Cream White)
  const pbrWhite = { map: whitePetalTex, roughness: 0.40, metalness: 0.0, side: THREE.DoubleSide };
  const whiteMats = {
    coreMat: new THREE.MeshStandardMaterial({ color: 0xecd078, roughness: 0.35 }),
    whorl0Mat: new THREE.MeshStandardMaterial({ ...pbrWhite, color: 0xf5df96 }),
    whorl1Mat: new THREE.MeshStandardMaterial({ ...pbrWhite, color: 0xfaeab2 }),
    whorl2Mat: new THREE.MeshStandardMaterial({ ...pbrWhite, color: 0xfdf3cb }),
    whorl3Mat: new THREE.MeshStandardMaterial({ ...pbrWhite, color: 0xfef7db }),
    whorl4Mat: new THREE.MeshStandardMaterial({ ...pbrWhite, color: 0xfefbeb }),
    whorl5Mat: new THREE.MeshStandardMaterial({ ...pbrWhite, color: 0xffffff }),
    whorl6Mat: new THREE.MeshStandardMaterial({ ...pbrWhite, color: 0xffffff }),
    sepalMat: new THREE.MeshStandardMaterial({ color: 0x18421b, roughness: 0.32, side: THREE.DoubleSide })
  };

  // Stems & Accessories Materials
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x2e5c24, roughness: 0.38 });
  const berryGeo = new THREE.SphereGeometry(0.060, 14, 14);
  const berryMat = new THREE.MeshStandardMaterial({ color: 0xf2f8ed, roughness: 0.14, metalness: 0.04 });
  const floretMat = new THREE.MeshStandardMaterial({ color: 0xfdf8ee, roughness: 0.35, side: THREE.DoubleSide });

  // 18 Grand Cabbage Blooms arranged in a massive, overflowing dome (matching photo 100%)
  // Lower roses sit directly on/over the vase rim (y = -0.75), concealing the rim and stems!
  const bloomsData = [
    // --- [1. LOWER OVERHANG ROSES (8 blooms encircling rim at y = -0.42 to -0.46, broad spread)] ---
    { pos: new THREE.Vector3(-0.58, -0.42, 1.15), isPink: true, scale: 1.56 }, // HERO FRONT-LEFT PINK ROSE!
    { pos: new THREE.Vector3(0.58, -0.44, 1.15), isPink: true, scale: 1.56 },  // HERO FRONT-RIGHT PINK ROSE!
    { pos: new THREE.Vector3(-1.38, -0.40, 0.48), isPink: true, scale: 1.50 }, // LEFT PINK
    { pos: new THREE.Vector3(1.38, -0.40, 0.48), isPink: false, scale: 1.50 }, // RIGHT CREAM
    { pos: new THREE.Vector3(-1.18, -0.42, -0.62), isPink: false, scale: 1.45 },
    { pos: new THREE.Vector3(1.18, -0.42, -0.62), isPink: true, scale: 1.45 },
    { pos: new THREE.Vector3(-0.48, -0.45, -1.20), isPink: true, scale: 1.45 },
    { pos: new THREE.Vector3(0.48, -0.45, -1.20), isPink: false, scale: 1.45 },

    // --- [2. MID-LEVEL BODY ROSES (6 blooms creating a full dome at y = 0.02 to 0.12)] ---
    { pos: new THREE.Vector3(-0.52, 0.04, 1.00), isPink: false, scale: 1.58 }, // HERO UPPER-LEFT CREAM ROSE!
    { pos: new THREE.Vector3(0.58, 0.00, 0.98), isPink: false, scale: 1.58 },  // HERO UPPER-RIGHT CREAM ROSE!
    { pos: new THREE.Vector3(-1.18, 0.10, 0.22), isPink: false, scale: 1.50 },
    { pos: new THREE.Vector3(1.18, 0.10, 0.22), isPink: true, scale: 1.50 },
    { pos: new THREE.Vector3(-0.70, 0.14, -0.70), isPink: true, scale: 1.46 },
    { pos: new THREE.Vector3(0.70, 0.14, -0.70), isPink: false, scale: 1.46 },

    // --- [3. CROWN APEX ROSES (4 top blooms at y = 0.45 to 0.52)] ---
    { pos: new THREE.Vector3(-0.12, 0.50, 0.22), isPink: true, scale: 1.62 },   // CROWN TOP PINK ROSE!
    { pos: new THREE.Vector3(0.48, 0.44, -0.16), isPink: false, scale: 1.54 },
    { pos: new THREE.Vector3(-0.60, 0.42, -0.16), isPink: false, scale: 1.52 },
    { pos: new THREE.Vector3(0.00, 0.46, -0.52), isPink: true, scale: 1.48 }
  ];

  // Upright canes emerging from cylindrical vase mouth up to each bloom
  bloomsData.forEach((data, idx) => {
    const stemAngle = (idx / bloomsData.length) * Math.PI * 2;
    const baseR = 0.22 + (idx % 4) * 0.08;
    const start = new THREE.Vector3(Math.cos(stemAngle) * baseR, -1.15, Math.sin(stemAngle) * baseR);
    const mouthPt = new THREE.Vector3(data.pos.x * 0.45, -0.75, data.pos.z * 0.45);
    const mid = new THREE.Vector3(data.pos.x * 0.72, data.pos.y * 0.55 - 0.25, data.pos.z * 0.72);
    const end = data.pos.clone();

    const curve = new THREE.CatmullRomCurve3([start, mouthPt, mid, end]);
    const stemGeo = new THREE.TubeGeometry(curve, 14, 0.044, 8, false);
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    stemMesh.castShadow = true;
    stemMesh.receiveShadow = true;
    bouquetGroup.add(stemMesh);

    // Natural blossoming tangent orientation
    const tangent = curve.getTangent(1.0).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, tangent);

    const roseMats = data.isPink ? pinkMats : whiteMats;
    const roseHead = createLuoshenRoseBloom(THREE, sharedGeos, roseMats, data.scale);
    roseHead.position.copy(end);
    roseHead.quaternion.copy(quat);
    roseHead.rotateY((idx * 2.399) % (Math.PI * 2));
    bouquetGroup.add(roseHead);
  });

  // 5 Petite Pink Rosebuds (Nụ hồng hé nở quanh miệng bình)
  const budPositions = [
    { pos: new THREE.Vector3(0.00, -0.58, 1.34), rot: new THREE.Euler(0.92, 0, 0), scale: 1.30 },
    { pos: new THREE.Vector3(-0.95, -0.52, 1.25), rot: new THREE.Euler(0.85, -0.40, 0.15), scale: 1.25 },
    { pos: new THREE.Vector3(0.95, -0.52, 1.25), rot: new THREE.Euler(0.85, 0.40, -0.15), scale: 1.25 },
    { pos: new THREE.Vector3(-0.30, -0.22, 1.26), rot: new THREE.Euler(0.65, -0.20, 0), scale: 1.20 },
    { pos: new THREE.Vector3(0.32, -0.20, 1.26), rot: new THREE.Euler(0.65, 0.20, 0), scale: 1.20 }
  ];
  budPositions.forEach(({ pos, rot, scale }) => {
    const bud = createLuoshenRosebud(THREE, pinkMats.whorl1Mat, pinkMats.sepalMat, scale);
    bud.position.copy(pos);
    bud.rotation.copy(rot);
    bouquetGroup.add(bud);
  });

  // 8 Glossy Pearl Berry Clusters
  const berryClusters = [
    { pos: new THREE.Vector3(-0.15, -0.52, 1.30), rot: new THREE.Euler(0.75, 0.15, 0) },
    { pos: new THREE.Vector3(0.80, -0.48, 1.22), rot: new THREE.Euler(0.70, 0.45, -0.15) },
    { pos: new THREE.Vector3(-1.05, -0.44, 1.12), rot: new THREE.Euler(0.70, -0.45, 0.15) },
    { pos: new THREE.Vector3(1.35, 0.10, 0.45), rot: new THREE.Euler(0.45, 1.05, -0.30) },
    { pos: new THREE.Vector3(-1.35, 0.10, 0.45), rot: new THREE.Euler(0.45, -1.05, 0.30) },
    { pos: new THREE.Vector3(-0.38, 0.38, 0.78), rot: new THREE.Euler(0.35, -0.30, 0) },
    { pos: new THREE.Vector3(0.42, 0.38, 0.78), rot: new THREE.Euler(0.35, 0.30, 0) },
    { pos: new THREE.Vector3(0.00, 0.62, 0.35), rot: new THREE.Euler(0.25, 0, 0) }
  ];
  berryClusters.forEach(({ pos, rot }) => {
    const cluster = createPearlBerryCluster(THREE, berryGeo, berryMat, stemMat);
    cluster.position.copy(pos);
    cluster.rotation.copy(rot);
    bouquetGroup.add(cluster);
  });

  // 8 Tiny Cream Star Floret Sprigs
  const starSprigs = [
    { pos: new THREE.Vector3(-0.25, -0.38, 1.24), rot: new THREE.Euler(0.55, -0.15, 0) },
    { pos: new THREE.Vector3(0.72, -0.32, 1.18), rot: new THREE.Euler(0.60, 0.45, -0.15) },
    { pos: new THREE.Vector3(-0.95, 0.05, 0.88), rot: new THREE.Euler(0.45, -0.65, 0.20) },
    { pos: new THREE.Vector3(0.95, 0.05, 0.88), rot: new THREE.Euler(0.45, 0.65, -0.20) },
    { pos: new THREE.Vector3(0.00, 0.38, 0.76), rot: new THREE.Euler(0.35, 0, 0) },
    { pos: new THREE.Vector3(-0.48, 0.55, 0.35), rot: new THREE.Euler(0.25, -0.45, 0) },
    { pos: new THREE.Vector3(0.48, 0.55, 0.35), rot: new THREE.Euler(0.25, 0.45, 0) },
    { pos: new THREE.Vector3(0.00, 0.58, -0.42), rot: new THREE.Euler(-0.45, 0, 0) }
  ];
  starSprigs.forEach(({ pos, rot }) => {
    const sprig = createStarFloretSprig(THREE, floretMat, stemMat);
    sprig.position.copy(pos);
    sprig.rotation.copy(rot);
    bouquetGroup.add(sprig);
  });

  // 24 Dark Emerald Rose Leaves framing the vase rim and draping over pottery ridges
  const collarLeafCount = 24;
  for (let l = 0; l < collarLeafCount; l++) {
    const lAngle = (l / collarLeafCount) * Math.PI * 2;
    const leaf = createBotanicalRoseLeaf(THREE, leafTex, 0.96, 0.52);
    const dist = 1.08 + (l % 4) * 0.24;
    const yL = -0.74 + (l % 3) * 0.08;
    leaf.position.set(Math.cos(lAngle) * dist, yL, Math.sin(lAngle) * dist);
    leaf.rotation.y = -lAngle + Math.PI / 2;
    if (l % 2 === 0) {
      // Draping down over vase rim onto the ceramic throwing ridges
      leaf.rotation.x = Math.PI / 1.55;
    } else {
      // Cupping upward toward lower roses
      leaf.rotation.x = Math.PI / 2.35 + (l % 2) * 0.10;
    }
    bouquetGroup.add(leaf);
  }

  // 16 Inter-bloom leaves nestled between middle and upper roses
  const interLeafPositions = [
    { pos: new THREE.Vector3(0.42, 0.14, 1.02), rot: new THREE.Euler(0.60, 0.35, 0) },
    { pos: new THREE.Vector3(-0.42, 0.14, 1.02), rot: new THREE.Euler(0.60, -0.35, 0) },
    { pos: new THREE.Vector3(1.22, 0.22, 0.48), rot: new THREE.Euler(0.50, 0.80, -0.25) },
    { pos: new THREE.Vector3(-1.22, 0.22, 0.48), rot: new THREE.Euler(0.50, -0.80, 0.25) },
    { pos: new THREE.Vector3(0.48, 0.40, 0.54), rot: new THREE.Euler(0.40, 0.25, 0) },
    { pos: new THREE.Vector3(-0.48, 0.40, 0.54), rot: new THREE.Euler(0.40, -0.25, 0) },
    { pos: new THREE.Vector3(0.00, 0.45, 0.58), rot: new THREE.Euler(0.45, 0, 0) },
    { pos: new THREE.Vector3(0.80, 0.35, -0.25), rot: new THREE.Euler(0.25, 0.92, -0.20) },
    { pos: new THREE.Vector3(-0.80, 0.35, -0.25), rot: new THREE.Euler(0.25, -0.92, 0.20) },
    { pos: new THREE.Vector3(0.00, 0.58, -0.38), rot: new THREE.Euler(-0.42, 0, 0) },
    { pos: new THREE.Vector3(-0.95, -0.25, 1.05), rot: new THREE.Euler(0.70, -0.45, 0.15) },
    { pos: new THREE.Vector3(0.95, -0.25, 1.05), rot: new THREE.Euler(0.70, 0.45, -0.15) },
    { pos: new THREE.Vector3(0.00, -0.30, 1.25), rot: new THREE.Euler(0.75, 0, 0) },
    { pos: new THREE.Vector3(-0.72, 0.32, 0.44), rot: new THREE.Euler(0.45, -0.40, 0.10) },
    { pos: new THREE.Vector3(0.72, 0.32, 0.44), rot: new THREE.Euler(0.45, 0.40, -0.10) },
    { pos: new THREE.Vector3(0.00, 0.50, 0.18), rot: new THREE.Euler(0.35, 0, 0) }
  ];
  interLeafPositions.forEach(({ pos, rot }) => {
    const leaf = createBotanicalRoseLeaf(THREE, leafTex, 0.85, 0.46);
    leaf.position.copy(pos);
    leaf.rotation.copy(rot);
    bouquetGroup.add(leaf);
  });

  group.add(bouquetGroup);
}

// ============================================================================
// --- 3D MODEL GENERATOR: NEOCLASSICAL PEDESTAL COMPOTE & PINK FLOYD ROSES ---
// ============================================================================

function buildPedestalCompoteAndPinkFloydRoses(THREE, group) {
  // Clear any existing children
  while (group.children.length > 0) {
    const obj = group.children[0];
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
      else obj.material.dispose();
    }
    group.remove(obj);
  }

  // 1. Neoclassical Footed Pedestal Compote Urn Vase (Bình đôn cúp chân cao sứ trắng hoàng gia)
  const compoteGeo = createPedestalCompoteVaseGeometry(THREE);
  const compoteTex = createPedestalCompoteTexture(THREE);
  const compoteMat = new THREE.MeshPhysicalMaterial({
    map: compoteTex,
    color: 0xfefefe,
    roughness: 0.12,
    metalness: 0.02,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04
  });
  const compoteMesh = new THREE.Mesh(compoteGeo, compoteMat);
  compoteMesh.castShadow = true;
  compoteMesh.receiveShadow = true;
  group.add(compoteMesh);

  // 2. Sculpted Porcelain Relief Roses & Carved Leaves Around Pedestal Base (Bottom-right inset)
  createPedestalBaseReliefRoses(THREE, group);

  // 3. Floral Core safely recessed deep inside Compote Bowl
  const foamGeo = new THREE.CylinderGeometry(0.95, 0.55, 0.40, 32);
  const foamMat = new THREE.MeshLambertMaterial({ color: 0x182a1c });
  const foam = new THREE.Mesh(foamGeo, foamMat);
  foam.position.set(0, -1.25, 0);
  group.add(foam);

  // 4. Pink Floyd Rose Bouquet & Silver Dollar Eucalyptus Arrangement
  buildPinkFloydBouquet(THREE, group);
}

// --- 1. PEDESTAL COMPOTE VASE GEOMETRY (NEOCLASSICAL FOOTED CHALICE) ---
function createPedestalCompoteVaseGeometry(THREE) {
  // Graceful Neoclassical compote chalice: base at y = -3.42, waist at y = -2.05, rim at y = -0.72
  const points = [
    // Flat bottom base disc
    new THREE.Vector2(0.001, -3.42),
    new THREE.Vector2(1.25, -3.42),
    new THREE.Vector2(1.25, -3.36),
    new THREE.Vector2(1.20, -3.30),
    new THREE.Vector2(1.15, -3.26),

    // Bell-shaped pedestal foot mound (where sculpted relief roses sit)
    new THREE.Vector2(1.08, -3.18),
    new THREE.Vector2(0.96, -3.05),
    new THREE.Vector2(0.82, -2.88),
    new THREE.Vector2(0.68, -2.72),
    new THREE.Vector2(0.54, -2.58),

    // Collar transition ring
    new THREE.Vector2(0.46, -2.54),
    new THREE.Vector2(0.44, -2.50),

    // Slender pedestal waist
    new THREE.Vector2(0.36, -2.38),
    new THREE.Vector2(0.30, -2.22),
    new THREE.Vector2(0.27, -2.05), // Narrowest waist
    new THREE.Vector2(0.31, -1.86),
    new THREE.Vector2(0.40, -1.68),
    new THREE.Vector2(0.52, -1.56), // Stem collar

    // Flaring compote chalice bowl (wide, shallow, elegant)
    new THREE.Vector2(0.72, -1.40),
    new THREE.Vector2(0.96, -1.22),
    new THREE.Vector2(1.18, -1.02),
    new THREE.Vector2(1.32, -0.86),
    new THREE.Vector2(1.39, -0.74), // Outer rounded rim lip
    new THREE.Vector2(1.36, -0.71), // Top rim crest

    // Inner bowl cavity (recessed for floral core)
    new THREE.Vector2(1.30, -0.74),
    new THREE.Vector2(1.18, -0.90),
    new THREE.Vector2(0.98, -1.10),
    new THREE.Vector2(0.72, -1.28),
    new THREE.Vector2(0.40, -1.42),
    new THREE.Vector2(0.01, -1.45)  // Center floor of inner bowl
  ];

  const latheGeo = new THREE.LatheGeometry(points, 64);
  latheGeo.computeVertexNormals();
  return latheGeo;
}

// --- 2. PEDESTAL COMPOTE PORCELAIN TEXTURE ---
function createPedestalCompoteTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Pure royal white porcelain ground
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle warm ambient porcelain nuance
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.30, '#faf9f7');
  grad.addColorStop(0.60, '#f5f4ef');
  grad.addColorStop(0.85, '#faf9f7');
  grad.addColorStop(1, '#ffffff');
  ctx.fillStyle = grad;
  ctx.globalAlpha = 0.50;
  ctx.fillRect(0, 0, 512, 512);
  ctx.globalAlpha = 1.0;

  // Very fine silky horizontal ceramic turning sheen lines
  ctx.strokeStyle = 'rgba(230, 226, 218, 0.22)';
  ctx.lineWidth = 1;
  for (let y = 0; y < 512; y += 10) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// --- 3. SCULPTED PORCELAIN RELIEF ROSES ON PEDESTAL BASE ---
// Encircling garland with celadon/antique slate-blue patina crevices (matching bottom-right photo inset)
function createPedestalBaseReliefRoses(THREE, group) {
  // Pure royal white porcelain with high gloss clearcoat
  const porcelainMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.08,
    metalness: 0.02,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03
  });

  // Rich Antique Celadon / Turquoise-Slate glaze patina for carved recesses & leaf veins (matching photo inset)
  const patinaMat = new THREE.MeshPhysicalMaterial({
    color: 0x2e5e6e,
    roughness: 0.40,
    metalness: 0.02,
    clearcoat: 0.70,
    clearcoatRoughness: 0.12
  });

  const leafPorcelainMat = new THREE.MeshPhysicalMaterial({
    color: 0xfafffa,
    roughness: 0.12,
    metalness: 0.02,
    clearcoat: 0.95,
    clearcoatRoughness: 0.05
  });

  const roseCount = 8;
  const radius = 0.88;
  const yPos = -2.86;

  for (let i = 0; i < roseCount; i++) {
    const angle = (i / roseCount) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const reliefRoseGroup = new THREE.Group();
    reliefRoseGroup.position.set(x, yPos, z);

    // True radial outward orientation hugging the 45-degree slope of the bell foot!
    reliefRoseGroup.lookAt(x * 2, yPos, z * 2);
    reliefRoseGroup.rotateX(-0.58);

    // 1. Antique Celadon Patina backplate in deep carved recesses
    const backplateGeo = new THREE.CircleGeometry(0.36, 16);
    const backplate = new THREE.Mesh(backplateGeo, patinaMat);
    backplate.position.set(0, 0, -0.010);
    reliefRoseGroup.add(backplate);

    // 2. Carved porcelain acanthus leaves flanking the rose with prominent celadon borders
    const leafAngles = [-0.72, -0.26, 0.26, 0.72];
    leafAngles.forEach((la) => {
      // Celadon shadow border under-leaf (wider to frame the white porcelain!)
      const shadeGeo = new THREE.ConeGeometry(0.16, 0.46, 5);
      shadeGeo.scale(1.0, 1.0, 0.18);
      const shadeMesh = new THREE.Mesh(shadeGeo, patinaMat);
      shadeMesh.position.set(Math.sin(la) * 0.24, -0.20, 0.002);
      shadeMesh.rotation.z = -la;
      shadeMesh.rotation.x = -0.32;
      reliefRoseGroup.add(shadeMesh);

      // White porcelain leaf with raised central rib sitting inside celadon border
      const leafGeo = new THREE.ConeGeometry(0.11, 0.40, 5);
      leafGeo.scale(1.0, 1.0, 0.22);
      const leafMesh = new THREE.Mesh(leafGeo, leafPorcelainMat);
      leafMesh.position.set(Math.sin(la) * 0.24, -0.19, 0.012);
      leafMesh.rotation.z = -la;
      leafMesh.rotation.x = -0.30;
      reliefRoseGroup.add(leafMesh);
    });

    // 3. Central sculpted rose spiral core (tight porcelain rosette button)
    const coreGeo = new THREE.SphereGeometry(0.10, 16, 12);
    coreGeo.scale(1.0, 0.85, 0.65);
    const coreMesh = new THREE.Mesh(coreGeo, porcelainMat);
    coreMesh.position.set(0, 0, 0.075);
    reliefRoseGroup.add(coreMesh);

    // Celadon patina wash inside center crevices
    const corePatinaGeo = new THREE.TorusGeometry(0.08, 0.028, 8, 16);
    const corePatina = new THREE.Mesh(corePatinaGeo, patinaMat);
    corePatina.position.set(0, 0, 0.058);
    reliefRoseGroup.add(corePatina);

    // 4. Inner carved porcelain petal whorl (4 cupped overlapping petals)
    for (let p = 0; p < 4; p++) {
      const pAngle = (p / 4) * Math.PI * 2 + 0.2;
      const petGeo = new THREE.SphereGeometry(0.14, 10, 8, 0, Math.PI * 0.75, 0, Math.PI * 0.60);
      petGeo.scale(1.0, 0.85, 0.50);
      const petMesh = new THREE.Mesh(petGeo, porcelainMat);
      petMesh.position.set(Math.cos(pAngle) * 0.06, Math.sin(pAngle) * 0.06, 0.048);
      petMesh.rotation.z = pAngle + 0.35;
      petMesh.rotation.x = 0.35;
      reliefRoseGroup.add(petMesh);
    }

    // Celadon patina glaze ring between inner and middle whorl
    const midPatinaGeo = new THREE.TorusGeometry(0.13, 0.024, 6, 16);
    const midPatina = new THREE.Mesh(midPatinaGeo, patinaMat);
    midPatina.position.set(0, 0, 0.036);
    reliefRoseGroup.add(midPatina);

    // 5. Middle carved porcelain petal whorl (5 cupped petals)
    for (let p = 0; p < 5; p++) {
      const pAngle = (p / 5) * Math.PI * 2 + 0.4;
      const petGeo = new THREE.SphereGeometry(0.20, 12, 8, 0, Math.PI * 0.70, 0, Math.PI * 0.62);
      petGeo.scale(1.0, 0.85, 0.45);
      const petMesh = new THREE.Mesh(petGeo, porcelainMat);
      petMesh.position.set(Math.cos(pAngle) * 0.11, Math.sin(pAngle) * 0.11, 0.032);
      petMesh.rotation.z = pAngle + 0.25;
      petMesh.rotation.x = 0.50;
      reliefRoseGroup.add(petMesh);
    }

    // Celadon patina glaze ring between middle and outer whorl
    const outPatinaGeo = new THREE.TorusGeometry(0.19, 0.025, 6, 16);
    const outPatina = new THREE.Mesh(outPatinaGeo, patinaMat);
    outPatina.position.set(0, 0, 0.020);
    reliefRoseGroup.add(outPatina);

    // 6. Outer carved porcelain petal whorl (6 flared ruffled petals rolling outward)
    for (let p = 0; p < 6; p++) {
      const pAngle = (p / 6) * Math.PI * 2 + 0.25;
      const petGeo = new THREE.SphereGeometry(0.26, 12, 8, 0, Math.PI * 0.65, 0, Math.PI * 0.65);
      petGeo.scale(1.0, 0.85, 0.40);
      const petMesh = new THREE.Mesh(petGeo, porcelainMat);
      petMesh.position.set(Math.cos(pAngle) * 0.18, Math.sin(pAngle) * 0.18, 0.018);
      petMesh.rotation.z = pAngle + 0.18;
      petMesh.rotation.x = 0.68;
      reliefRoseGroup.add(petMesh);
    }

    group.add(reliefRoseGroup);
  }
}

// --- 4A. PINK FLOYD INNER PETAL TEXTURE (DEEP VELVET WINE-RUBY CORE SPIRAL) ---
function createPinkFloydRoseInnerPetalTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep Saturated Velvet Wine-Ruby Core Gradient (v = 0 base at y=512, v = 1 crest at y=0)
  const grad = ctx.createRadialGradient(256, 512, 10, 256, 120, 460);
  grad.addColorStop(0.00, '#2e000f'); // Pitch velvet wine-ruby base
  grad.addColorStop(0.20, '#54011f'); // Deep burgundy wine
  grad.addColorStop(0.40, '#820235'); // Deep burgundy fuchsia
  grad.addColorStop(0.65, '#b80650'); // Saturated velvet hot fuchsia
  grad.addColorStop(0.85, '#dc0b66'); // Radiant Pink Floyd fuchsia
  grad.addColorStop(1.00, '#f2187b'); // Highlight crest rim
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Silky petal micro-veins radiating from base
  ctx.lineWidth = 1.0;
  for (let i = 0; i < 80; i++) {
    const angle = -Math.PI * 0.46 + (i / 79) * Math.PI * 0.92;
    const len = 390 + Math.sin(i * 1.7) * 40;
    const endX = 256 + Math.sin(angle) * len;
    const endY = 512 - Math.cos(angle) * len;
    const alpha = 0.14 + Math.sin(i * 0.9) * 0.05;
    ctx.strokeStyle = `rgba(245, 45, 130, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(256, 512);
    const midX = 256 + Math.sin(angle) * (len * 0.5) + Math.cos(i) * 3;
    const midY = 512 - Math.cos(angle) * (len * 0.5);
    ctx.quadraticCurveTo(midX, midY, endX, endY);
    ctx.stroke();
  }

  // Strong lateral edge shadow vignette (creates crisp spiral fold depth creases)
  const edgeShade = ctx.createLinearGradient(0, 0, 512, 0);
  edgeShade.addColorStop(0.00, 'rgba(38, 0, 12, 0.55)');
  edgeShade.addColorStop(0.12, 'rgba(38, 0, 12, 0.22)');
  edgeShade.addColorStop(0.25, 'rgba(38, 0, 12, 0.00)');
  edgeShade.addColorStop(0.75, 'rgba(38, 0, 12, 0.00)');
  edgeShade.addColorStop(0.88, 'rgba(38, 0, 12, 0.22)');
  edgeShade.addColorStop(1.00, 'rgba(38, 0, 12, 0.55)');
  ctx.fillStyle = edgeShade;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// --- 4B. PINK FLOYD OUTER PETAL TEXTURE (ELECTRIC FUCHSIA WITH LUMINOUS REFLEX RIM) ---
function createPinkFloydRoseOuterPetalTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Luminous Electric Cerise-Fuchsia Gradient (100% authentic Ecuador garden rose)
  const grad = ctx.createRadialGradient(256, 512, 10, 256, 80, 490);
  grad.addColorStop(0.00, '#4a001a'); // Dark wine-fuchsia base attachment
  grad.addColorStop(0.20, '#78012d'); // Deep cerise shadow
  grad.addColorStop(0.45, '#b0054c'); // Rich velvet fuchsia
  grad.addColorStop(0.70, '#db0a68'); // Saturated vibrant Pink Floyd hot fuchsia
  grad.addColorStop(0.88, '#f5187e'); // Glowing electric magenta
  grad.addColorStop(1.00, '#ff3593'); // Sunlit reflex highlight rim
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Silky radial petal veins fanning from base to crest
  ctx.lineWidth = 1.0;
  for (let i = 0; i < 90; i++) {
    const angle = -Math.PI * 0.46 + (i / 89) * Math.PI * 0.92;
    const len = 400 + Math.sin(i * 1.7) * 45;
    const endX = 256 + Math.sin(angle) * len;
    const endY = 512 - Math.cos(angle) * len;
    const alpha = 0.16 + Math.sin(i * 0.9) * 0.06;
    ctx.strokeStyle = `rgba(255, 90, 170, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(256, 512);
    const midX = 256 + Math.sin(angle) * (len * 0.5) + Math.cos(i) * 4;
    const midY = 512 - Math.cos(angle) * (len * 0.5);
    ctx.quadraticCurveTo(midX, midY, endX, endY);
    ctx.stroke();
  }

  // Petal Boundary Shading (Vignette on lateral edges for crisp depth separation between overlapping petals)
  const edgeShade = ctx.createLinearGradient(0, 0, 512, 0);
  edgeShade.addColorStop(0.00, 'rgba(48, 0, 18, 0.42)');
  edgeShade.addColorStop(0.12, 'rgba(48, 0, 18, 0.18)');
  edgeShade.addColorStop(0.25, 'rgba(48, 0, 18, 0.00)');
  edgeShade.addColorStop(0.75, 'rgba(48, 0, 18, 0.00)');
  edgeShade.addColorStop(0.88, 'rgba(48, 0, 18, 0.18)');
  edgeShade.addColorStop(1.00, 'rgba(48, 0, 18, 0.42)');
  ctx.fillStyle = edgeShade;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// --- 5. ECUADORIAN PINK FLOYD ROSE PETAL GEOMETRY (SMOOTH ROUNDED GARDEN ROSE) ---
function createPinkFloydRosePetalGeo(THREE, width, height, cupX, cupY, reflex) {
  const segU = 16;
  const segV = 16;
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let j = 0; j <= segV; j++) {
    const v = j / segV; // 0 (base) to 1 (crest)

    // Smooth rounded fan petal envelope (classic rounded garden rose scallop shell)
    let w = width;
    if (v < 0.18) {
      w = width * Math.pow(v / 0.18, 0.65);
    } else if (v <= 0.65) {
      w = width * (1.0 + 0.38 * Math.sin(((v - 0.18) / 0.47) * Math.PI));
    } else {
      const tv = (v - 0.65) / 0.35;
      // Smooth convex scallop curve rounding off gently at the top
      w = width * (1.38 * Math.cos(tv * Math.PI * 0.44));
    }
    if (w < 0.005) w = 0.005;

    for (let i = 0; i <= segU; i++) {
      const u = i / segU; // 0 to 1
      const uNorm = (u - 0.5) * 2; // -1 to +1

      // Lateral coordinate along local X
      const x = uNorm * (w / 2);

      // Height along local Y: naturally rounded oval arch at the petal crest!
      let y = v * height * (1.0 - 0.28 * Math.pow(uNorm, 2) * v);

      // 3D Depth curvature:
      // Smooth lateral cupping (concave on inner side facing flower center)
      let z = (1.0 - Math.pow(uNorm, 2)) * cupX * Math.sin(v * Math.PI * 0.88);
      // Longitudinal bowl cup
      z += Math.sin(v * Math.PI * 0.50) * cupY * 0.35;

      // Silky reflex roll backward at the upper margin (smooth gentle curl, no folding!)
      if (v > 0.48) {
        const rf = Math.pow((v - 0.48) / 0.52, 2.0);
        const centerReflex = 0.85 + 0.15 * (1.0 - Math.pow(uNorm, 2));
        z -= reflex * height * rf * 0.45 * centerReflex;
        y -= reflex * height * rf * 0.14;
      }

      positions.push(x, y, z);
      uvs.push(u, v);
    }
  }

  for (let j = 0; j < segV; j++) {
    for (let i = 0; i < segU; i++) {
      const a = j * (segU + 1) + i;
      const b = (j + 1) * (segU + 1) + i;
      const c = (j + 1) * (segU + 1) + (i + 1);
      const d = j * (segU + 1) + (i + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// --- 6. PINK FLOYD ROSE BLOOM (37 SCULPTED PETALS WITH DUAL-TEXTURE SPIRAL ROSETTE) ---
function createPinkFloydRoseBloom(THREE, innerTex, outerTex, scale = 1.0, openness = 1.0) {
  const bloomGroup = new THREE.Group();

  // Deep wine-ruby velvet material for the tight spiral rosette heart
  const innerMat = new THREE.MeshStandardMaterial({
    map: innerTex,
    roughness: 0.50,
    metalness: 0.0,
    emissive: 0x1e000a,
    emissiveIntensity: 0.45,
    side: THREE.DoubleSide
  });

  // Luminous electric fuchsia material for outer reflexed petals
  const outerMat = new THREE.MeshStandardMaterial({
    map: outerTex,
    roughness: 0.44,
    metalness: 0.0,
    emissive: 0x24000e,
    emissiveIntensity: 0.35,
    side: THREE.DoubleSide
  });

  // Base scale factor: scale = 1.0 gives a natural outer flower diameter of ~0.76 units
  const bs = scale * 0.48;

  // Central tight velvet spiral bud core (ensures pitch wine-ruby depth at center)
  const budCoreGeo = new THREE.SphereGeometry(0.08 * bs, 12, 10);
  budCoreGeo.scale(0.8, 0.8, 1.2);
  const budCore = new THREE.Mesh(budCoreGeo, innerMat);
  budCore.position.set(0, 0, 0.16 * bs);
  bloomGroup.add(budCore);

  // Green Sepal & Receptacle Base (positioned in -Z behind the flower)
  const sepalsMat = new THREE.MeshStandardMaterial({
    color: 0x2e421a,
    roughness: 0.60,
    metalness: 0.02,
    side: THREE.DoubleSide
  });
  const recepGeo = new THREE.CylinderGeometry(0.12 * bs, 0.03 * bs, 0.25 * bs, 10);
  const recep = new THREE.Mesh(recepGeo, sepalsMat);
  recep.position.set(0, 0, -0.12 * bs);
  recep.rotation.x = Math.PI / 2;
  bloomGroup.add(recep);

  // 5 Pointed Green Sepals radiating outward in XY plane
  for (let s = 0; s < 5; s++) {
    const sAngle = (s / 5) * Math.PI * 2;
    const sGeo = new THREE.ConeGeometry(0.06 * bs, 0.42 * bs, 4);
    sGeo.scale(1.0, 1.0, 0.15);
    const sepal = new THREE.Mesh(sGeo, sepalsMat);
    sepal.position.set(Math.cos(sAngle) * 0.10 * bs, Math.sin(sAngle) * 0.10 * bs, -0.05 * bs);
    sepal.rotation.z = sAngle - Math.PI / 2;
    sepal.rotation.x = -Math.PI * 0.46;
    bloomGroup.add(sepal);
  }

  // Botanical petal attachment helper facing forward along +Z:
  const addPetalFacingZ = (pAngle, r, zOffset, tiltOutward, petGeo, mat, curl = 0) => {
    const anchor = new THREE.Group();
    anchor.position.set(Math.cos(pAngle) * r, Math.sin(pAngle) * r, zOffset);
    anchor.rotation.z = pAngle - Math.PI / 2; // radial alignment

    const petalMesh = new THREE.Mesh(petGeo, mat);
    petalMesh.castShadow = true;
    petalMesh.rotation.x = Math.PI / 2 - tiltOutward;
    if (curl !== 0) petalMesh.rotation.y = curl;
    anchor.add(petalMesh);
    bloomGroup.add(anchor);
  };

  // --- WHORL 0 & 1: TIGHT HIGH-CENTERED SPIRAL ROSETTE HEART (10 spiraling conical scroll petals) ---
  // Golden spiral progression creating the iconic high-centered garden rose center!
  for (let p = 0; p < 10; p++) {
    const pAngle = p * 2.39996; // Golden angle (~137.5 deg)
    const r = (0.006 + p * 0.009) * bs;
    const zOffset = (0.22 - p * 0.012) * bs;
    const pWidth = (0.34 + p * 0.024) * bs;
    const pHeight = (0.36 + p * 0.016) * bs;
    const tilt = (0.05 + p * 0.024) * openness;
    const curl = (0.38 - p * 0.024); // Tangential angle creates the spiral swirl!

    const petGeo = createPinkFloydRosePetalGeo(THREE, pWidth, pHeight, 0.28 * bs, 0.12 * bs, 0.06);
    addPetalFacingZ(pAngle, r, zOffset, tilt, petGeo, innerMat, curl);
  }

  // --- WHORL 2: INNER ROSETTE CHALICE CUP (6 overlapping cupped petals) ---
  for (let p = 0; p < 6; p++) {
    const pAngle = (p / 6) * Math.PI * 2 + 0.35;
    const r = 0.10 * bs;
    const zOffset = 0.09 * bs;
    const pWidth = 0.56 * bs;
    const pHeight = 0.42 * bs;
    const tilt = 0.36 * openness;

    const petGeo = createPinkFloydRosePetalGeo(THREE, pWidth, pHeight, 0.28 * bs, 0.14 * bs, 0.18);
    addPetalFacingZ(pAngle, r, zOffset, tilt, petGeo, innerMat, 0.12);
  }

  // --- WHORL 3: MIDDLE TRANSITION CUP (6 large cupped petals) ---
  for (let p = 0; p < 6; p++) {
    const pAngle = (p / 6) * Math.PI * 2 + 0.85;
    const r = 0.16 * bs;
    const zOffset = 0.03 * bs;
    const pWidth = 0.68 * bs;
    const pHeight = 0.46 * bs;
    const tilt = 0.60 * openness;

    const petGeo = createPinkFloydRosePetalGeo(THREE, pWidth, pHeight, 0.30 * bs, 0.14 * bs, 0.32);
    addPetalFacingZ(pAngle, r, zOffset, tilt, petGeo, outerMat);
  }

  // --- WHORL 4: OUTER CANOPY CUP WITH REFLEX (7 broad reflexed petals) ---
  for (let p = 0; p < 7; p++) {
    const pAngle = (p / 7) * Math.PI * 2 + 0.42;
    const r = 0.22 * bs;
    const zOffset = -0.02 * bs;
    const pWidth = 0.78 * bs;
    const pHeight = 0.50 * bs;
    const tilt = 0.88 * openness;

    const petGeo = createPinkFloydRosePetalGeo(THREE, pWidth, pHeight, 0.28 * bs, 0.14 * bs, 0.45);
    addPetalFacingZ(pAngle, r, zOffset, tilt, petGeo, outerMat);
  }

  // --- WHORL 5: GRAND STAR-REFLEXED GUARD PETALS (8 broad flared guard petals rolling backward) ---
  for (let p = 0; p < 8; p++) {
    const pAngle = (p / 8) * Math.PI * 2 + 0.20;
    const r = 0.28 * bs;
    const zOffset = -0.06 * bs;
    const pWidth = 0.90 * bs;
    const pHeight = 0.54 * bs;
    const tilt = 1.18 * openness;

    const petGeo = createPinkFloydRosePetalGeo(THREE, pWidth, pHeight, 0.24 * bs, 0.12 * bs, 0.58);
    addPetalFacingZ(pAngle, r, zOffset, tilt, petGeo, outerMat);
  }

  return bloomGroup;
}

// --- 7. SILVER DOLLAR EUCALYPTUS LEAF TEXTURE (AUTHENTIC DUSTY SEAFOAM / SAGE GREEN) ---
function createEucalyptusLeafTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Full-bleed glaucous dusty seafoam / sage-green circular leaf with frosted bloom
  const grad = ctx.createRadialGradient(128, 128, 6, 128, 128, 128);
  grad.addColorStop(0.00, '#a8d2be'); // Glaucous powdery seafoam frosted center
  grad.addColorStop(0.35, '#7caa94'); // Dusty sage green
  grad.addColorStop(0.72, '#55806c'); // Rich eucalyptus green
  grad.addColorStop(0.92, '#426856'); // Margin green
  grad.addColorStop(1.00, '#58363a'); // Delicate burgundy leaf edge
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Soft translucent central vein
  ctx.strokeStyle = 'rgba(235, 255, 245, 0.65)';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(128, 252);
  ctx.lineTo(128, 8);
  ctx.stroke();

  // Delicate radiating secondary veins
  ctx.lineWidth = 1.0;
  ctx.strokeStyle = 'rgba(235, 255, 245, 0.32)';
  for (let y = 36; y < 240; y += 22) {
    ctx.beginPath();
    ctx.moveTo(128, y);
    ctx.quadraticCurveTo(75, y - 8, 28, y - 18);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(128, y);
    ctx.quadraticCurveTo(181, y - 8, 228, y - 18);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// --- 8. SILVER DOLLAR EUCALYPTUS SPRIG (DELICATE ARCHING TWIG WITH BROAD COIN LEAVES) ---
function createSilverDollarEucalyptusStem(THREE, leafTex, config) {
  const { p0, p1, p2, leafCount = 5, leafSize = 0.135, flutter = 0.25 } = config;
  const stemGroup = new THREE.Group();

  // Slender delicate woody branch
  const curve = new THREE.CatmullRomCurve3([p0, p1, p2]);
  const stemGeo = new THREE.TubeGeometry(curve, 18, 0.010, 5, false);
  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x3d2822, // Dark olive-mahogany woody stem
    roughness: 0.65,
    metalness: 0.02
  });
  const stemMesh = new THREE.Mesh(stemGeo, stemMat);
  stemMesh.castShadow = true;
  stemGroup.add(stemMesh);

  // Leaf Material (Dusty Glaucous Seafoam Green) - White color so leafTex prints at true authentic luminance!
  const leafMat = new THREE.MeshStandardMaterial({
    map: leafTex,
    color: 0xffffff,
    roughness: 0.42,
    metalness: 0.01,
    side: THREE.DoubleSide
  });

  // Natural alternate/paired circular coin leaves along the stem
  for (let i = 0; i < leafCount; i++) {
    const t = 0.20 + (i / Math.max(1, leafCount - 1)) * 0.78;
    const pt = curve.getPoint(t);
    const tangent = curve.getTangent(t).normalize();

    // Normal & Binormal
    const up = Math.abs(tangent.y) > 0.88 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
    const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();

    // Broad round coin discs
    const curScale = (1.0 - (i / leafCount) * 0.18) * leafSize;
    const side = (i % 2 === 0 ? 1 : -1);

    // Flat circular coin disc
    const discGeo = new THREE.CircleGeometry(curScale, 20);
    const disc = new THREE.Mesh(discGeo, leafMat);

    // Offset from stem along normal
    const petioleOffset = normal.clone().multiplyScalar(side * (curScale * 0.95 + 0.015));
    disc.position.copy(pt).add(petioleOffset);

    // Natural 3D fluttering rotation (eliminating rigid comb look!)
    disc.rotation.set(
      Math.sin(i * 2.8 + side) * flutter * 1.5,
      Math.cos(i * 1.9 + side) * flutter * 2.0,
      Math.sin(i * 3.4) * flutter * 1.2
    );

    // Short woody petiole connector
    const petioleGeo = new THREE.CylinderGeometry(0.005, 0.005, curScale * 0.70, 3);
    const petiole = new THREE.Mesh(petioleGeo, stemMat);
    petiole.position.copy(pt).add(petioleOffset.clone().multiplyScalar(0.45));
    stemGroup.add(petiole);

    stemGroup.add(disc);
  }

  return stemGroup;
}

// --- 9. PINK FLOYD BOUQUET (LUSH 3D BAROQUE FAN WITH VISIBLE COMPOTE BOWL) ---
function buildPinkFloydBouquet(THREE, group) {
  const bouquetGroup = new THREE.Group();

  const innerTex = createPinkFloydRoseInnerPetalTexture(THREE);
  const outerTex = createPinkFloydRoseOuterPetalTexture(THREE);
  const leafTex = createEucalyptusLeafTexture(THREE);

  // =========================================================================
  // 34 GRAND LUXURY PINK FLOYD ECUADOR ROSES IN CONTINUOUS BAROQUE FAN
  // Sized naturally (diameter ~ 1.15 to 1.30 units) with prominent rosette centers
  // Perfectly framing the exposed white porcelain compote bowl beneath!
  // =========================================================================
  const bloomsConfig = [
    // --- TIER 1: APEX CROWN (Proud high blooms at the top peak, y = 1.15 to 1.28) ---
    { pos: new THREE.Vector3(0.00, 1.25, 0.40), rot: new THREE.Euler(-0.25, 0.00, 0.00), scale: 1.55, open: 1.02 },
    { pos: new THREE.Vector3(-0.62, 1.16, 0.42), rot: new THREE.Euler(-0.22, -0.22, 0.08), scale: 1.48, open: 1.00 },
    { pos: new THREE.Vector3(0.62, 1.16, 0.42), rot: new THREE.Euler(-0.22, 0.22, -0.08), scale: 1.48, open: 1.00 },

    // --- TIER 2: UPPER CANOPY (Wide fan spreading across 3D dome, y = 0.75 to 0.95) ---
    { pos: new THREE.Vector3(0.00, 0.88, 0.68), rot: new THREE.Euler(-0.14, 0.00, 0.00), scale: 1.62, open: 1.05 },
    { pos: new THREE.Vector3(-0.68, 0.80, 0.68), rot: new THREE.Euler(-0.12, -0.25, 0.08), scale: 1.56, open: 1.02 },
    { pos: new THREE.Vector3(0.68, 0.80, 0.68), rot: new THREE.Euler(-0.12, 0.25, -0.08), scale: 1.56, open: 1.02 },
    { pos: new THREE.Vector3(-1.38, 0.72, 0.52), rot: new THREE.Euler(-0.08, -0.52, 0.16), scale: 1.50, open: 1.00 },
    { pos: new THREE.Vector3(1.38, 0.72, 0.52), rot: new THREE.Euler(-0.08, 0.52, -0.16), scale: 1.50, open: 1.00 },
    { pos: new THREE.Vector3(0.00, 0.85, -0.22), rot: new THREE.Euler(-0.35, 0.00, 0.00), scale: 1.45, open: 0.98 },

    // --- TIER 3: MID-FACE HERO TIER (Focal point of arrangement, y = 0.35 to 0.55) ---
    { pos: new THREE.Vector3(0.00, 0.46, 0.90), rot: new THREE.Euler(-0.04, 0.00, 0.00), scale: 1.68, open: 1.06 },
    { pos: new THREE.Vector3(-0.72, 0.42, 0.86), rot: new THREE.Euler(-0.04, -0.24, 0.08), scale: 1.62, open: 1.04 },
    { pos: new THREE.Vector3(0.72, 0.42, 0.86), rot: new THREE.Euler(-0.04, 0.24, -0.08), scale: 1.62, open: 1.04 },
    { pos: new THREE.Vector3(-1.48, 0.36, 0.70), rot: new THREE.Euler(0.00, -0.54, 0.16), scale: 1.55, open: 1.02 },
    { pos: new THREE.Vector3(1.48, 0.36, 0.70), rot: new THREE.Euler(0.00, 0.54, -0.16), scale: 1.55, open: 1.02 },
    { pos: new THREE.Vector3(-2.15, 0.26, 0.48), rot: new THREE.Euler(0.06, -0.85, 0.22), scale: 1.48, open: 0.98 },
    { pos: new THREE.Vector3(2.15, 0.26, 0.48), rot: new THREE.Euler(0.06, 0.85, -0.22), scale: 1.48, open: 0.98 },

    // --- TIER 4: LOWER CANOPY (Filling space right above compote bowl, y = -0.05 to 0.15) ---
    { pos: new THREE.Vector3(-0.46, 0.04, 0.98), rot: new THREE.Euler(0.08, -0.22, 0.08), scale: 1.60, open: 1.05 },
    { pos: new THREE.Vector3(0.46, 0.04, 0.98), rot: new THREE.Euler(0.08, 0.22, -0.08), scale: 1.60, open: 1.05 },
    { pos: new THREE.Vector3(-1.18, -0.02, 0.82), rot: new THREE.Euler(0.12, -0.52, 0.16), scale: 1.54, open: 1.02 },
    { pos: new THREE.Vector3(1.18, -0.02, 0.82), rot: new THREE.Euler(0.12, 0.52, -0.16), scale: 1.54, open: 1.02 },
    { pos: new THREE.Vector3(-1.85, -0.10, 0.60), rot: new THREE.Euler(0.16, -0.82, 0.22), scale: 1.48, open: 0.98 },
    { pos: new THREE.Vector3(1.85, -0.10, 0.60), rot: new THREE.Euler(0.16, 0.82, -0.22), scale: 1.48, open: 0.98 },

    // --- TIER 5: COMPOTE RIM RESTING & NODDING (Resting directly on compote rim lip, y = -0.45 to -0.62) ---
    { pos: new THREE.Vector3(-0.35, -0.52, 1.15), rot: new THREE.Euler(0.26, -0.12, 0.05), scale: 1.55, open: 1.04 },
    { pos: new THREE.Vector3(0.35, -0.52, 1.15), rot: new THREE.Euler(0.26, 0.12, -0.05), scale: 1.55, open: 1.04 },
    { pos: new THREE.Vector3(-1.02, -0.48, 0.95), rot: new THREE.Euler(0.24, -0.48, 0.14), scale: 1.50, open: 1.02 },
    { pos: new THREE.Vector3(1.02, -0.48, 0.95), rot: new THREE.Euler(0.24, 0.48, -0.14), scale: 1.50, open: 1.02 },
    { pos: new THREE.Vector3(-1.65, -0.52, 0.75), rot: new THREE.Euler(0.28, -0.78, 0.20), scale: 1.45, open: 1.00 },
    { pos: new THREE.Vector3(1.65, -0.52, 0.75), rot: new THREE.Euler(0.28, 0.78, -0.20), scale: 1.45, open: 1.00 },

    // --- TIER 6: GRAND CASCADING WINGS (Cascading diagonally outward & downward past rim) ---
    { pos: new THREE.Vector3(-2.35, -0.12, 0.42), rot: new THREE.Euler(0.20, -1.05, 0.28), scale: 1.42, open: 0.98 },
    { pos: new THREE.Vector3(-2.60, -0.46, 0.36), rot: new THREE.Euler(0.32, -1.22, 0.34), scale: 1.38, open: 0.96 },
    { pos: new THREE.Vector3(-2.25, -0.80, 0.28), rot: new THREE.Euler(0.48, -1.18, 0.36), scale: 1.32, open: 0.95 },
    { pos: new THREE.Vector3(2.35, -0.12, 0.42), rot: new THREE.Euler(0.20, 1.05, -0.28), scale: 1.42, open: 0.98 },
    { pos: new THREE.Vector3(2.60, -0.46, 0.36), rot: new THREE.Euler(0.32, 1.22, -0.34), scale: 1.38, open: 0.96 },
    { pos: new THREE.Vector3(2.25, -0.80, 0.28), rot: new THREE.Euler(0.48, 1.18, -0.36), scale: 1.32, open: 0.95 }
  ];

  bloomsConfig.forEach((cfg) => {
    const bloom = createPinkFloydRoseBloom(THREE, innerTex, outerTex, cfg.scale, cfg.open);
    bloom.position.copy(cfg.pos);
    bloom.rotation.copy(cfg.rot);
    bouquetGroup.add(bloom);
  });

  // =========================================================================
  // 22 DELICATE SILVER DOLLAR EUCALYPTUS SPRIGS (AUTHENTIC COMPOSITION FILLER)
  // Delicate round coins peeking BETWEEN roses and framing borders softly!
  // =========================================================================
  const eucalyptusSprigs = [
    // 1. Left Waterfall Signature Weeping Spray (sweeping outward diagonally)
    {
      p0: new THREE.Vector3(-1.65, -0.40, 0.65),
      p1: new THREE.Vector3(-2.45, -0.85, 0.45),
      p2: new THREE.Vector3(-2.95, -1.40, 0.25),
      leafCount: 7,
      leafSize: 0.145,
      flutter: 0.35
    },
    // 2. Secondary Low Weeping Left Sprig
    {
      p0: new THREE.Vector3(-1.20, -0.55, 0.75),
      p1: new THREE.Vector3(-2.00, -1.05, 0.55),
      p2: new THREE.Vector3(-2.45, -1.60, 0.35),
      leafCount: 6,
      leafSize: 0.135,
      flutter: 0.30
    },
    // 3. Right Flank Trailing Weeping Sprig (sweeping outward diagonally)
    {
      p0: new THREE.Vector3(1.65, -0.40, 0.65),
      p1: new THREE.Vector3(2.45, -0.85, 0.45),
      p2: new THREE.Vector3(2.95, -1.40, 0.25),
      leafCount: 7,
      leafSize: 0.145,
      flutter: 0.35
    },
    // 4. Secondary Low Weeping Right Sprig
    {
      p0: new THREE.Vector3(1.20, -0.55, 0.75),
      p1: new THREE.Vector3(2.00, -1.05, 0.55),
      p2: new THREE.Vector3(2.45, -1.60, 0.35),
      leafCount: 6,
      leafSize: 0.135,
      flutter: 0.30
    },

    // 5. FRONT INTER-BLOOM COINS (Peeking proudly BETWEEN front-center roses!)
    {
      p0: new THREE.Vector3(-0.22, 0.25, 1.05),
      p1: new THREE.Vector3(-0.32, 0.38, 1.25),
      p2: new THREE.Vector3(-0.42, 0.44, 1.34),
      leafCount: 4,
      leafSize: 0.135,
      flutter: 0.22
    },
    // 6. Front Right Inter-Bloom
    {
      p0: new THREE.Vector3(0.22, 0.25, 1.05),
      p1: new THREE.Vector3(0.32, 0.38, 1.25),
      p2: new THREE.Vector3(0.42, 0.44, 1.34),
      leafCount: 4,
      leafSize: 0.135,
      flutter: 0.22
    },
    // 7. Front Center Upper Sprig (between Tier 2 and Tier 3)
    {
      p0: new THREE.Vector3(0.00, 0.65, 0.88),
      p1: new THREE.Vector3(0.00, 0.78, 1.15),
      p2: new THREE.Vector3(0.00, 0.86, 1.25),
      leafCount: 4,
      leafSize: 0.128,
      flutter: 0.20
    },
    // 8. Mid-front Left Flank Inter-Bloom
    {
      p0: new THREE.Vector3(-0.80, 0.58, 0.82),
      p1: new THREE.Vector3(-1.05, 0.72, 1.08),
      p2: new THREE.Vector3(-1.22, 0.78, 1.18),
      leafCount: 4,
      leafSize: 0.130,
      flutter: 0.24
    },
    // 9. Mid-front Right Flank Inter-Bloom
    {
      p0: new THREE.Vector3(0.80, 0.58, 0.82),
      p1: new THREE.Vector3(1.05, 0.72, 1.08),
      p2: new THREE.Vector3(1.22, 0.78, 1.18),
      leafCount: 4,
      leafSize: 0.130,
      flutter: 0.24
    },

    // 10. Rim Lip Tucked Sprig Center-Left (Peeking just above compote rim)
    {
      p0: new THREE.Vector3(-0.50, -0.55, 1.12),
      p1: new THREE.Vector3(-0.70, -0.65, 1.28),
      p2: new THREE.Vector3(-0.85, -0.72, 1.35),
      leafCount: 4,
      leafSize: 0.128,
      flutter: 0.22
    },
    // 11. Rim Lip Tucked Sprig Center-Right
    {
      p0: new THREE.Vector3(0.50, -0.55, 1.12),
      p1: new THREE.Vector3(0.70, -0.65, 1.28),
      p2: new THREE.Vector3(0.85, -0.72, 1.35),
      leafCount: 4,
      leafSize: 0.128,
      flutter: 0.22
    },

    // 12. Top Crest Arching Sprig (Whimsical crown extension)
    {
      p0: new THREE.Vector3(0.00, 1.20, 0.20),
      p1: new THREE.Vector3(0.00, 1.55, 0.25),
      p2: new THREE.Vector3(0.00, 1.78, 0.22),
      leafCount: 5,
      leafSize: 0.130,
      flutter: 0.25
    },
    // 13. Top Left Arching Sprig
    {
      p0: new THREE.Vector3(-0.55, 1.15, 0.22),
      p1: new THREE.Vector3(-0.85, 1.48, 0.28),
      p2: new THREE.Vector3(-1.05, 1.65, 0.25),
      leafCount: 5,
      leafSize: 0.128,
      flutter: 0.25
    },
    // 14. Top Right Arching Sprig
    {
      p0: new THREE.Vector3(0.55, 1.15, 0.22),
      p1: new THREE.Vector3(0.85, 1.48, 0.28),
      p2: new THREE.Vector3(1.05, 1.65, 0.25),
      leafCount: 5,
      leafSize: 0.128,
      flutter: 0.25
    },

    // 15. Outer Left Wing Extension Sprig
    {
      p0: new THREE.Vector3(-2.20, 0.45, 0.32),
      p1: new THREE.Vector3(-2.80, 0.58, 0.30),
      p2: new THREE.Vector3(-3.25, 0.62, 0.22),
      leafCount: 5,
      leafSize: 0.138,
      flutter: 0.28
    },
    // 16. Outer Right Wing Extension Sprig
    {
      p0: new THREE.Vector3(2.20, 0.45, 0.32),
      p1: new THREE.Vector3(2.80, 0.58, 0.30),
      p2: new THREE.Vector3(3.25, 0.62, 0.22),
      leafCount: 5,
      leafSize: 0.138,
      flutter: 0.28
    },

    // 17. Mid Left Shoulder Sprig
    {
      p0: new THREE.Vector3(-1.80, 0.72, 0.35),
      p1: new THREE.Vector3(-2.35, 0.90, 0.38),
      p2: new THREE.Vector3(-2.70, 1.00, 0.32),
      leafCount: 5,
      leafSize: 0.132,
      flutter: 0.28
    },
    // 18. Mid Right Shoulder Sprig
    {
      p0: new THREE.Vector3(1.80, 0.72, 0.35),
      p1: new THREE.Vector3(2.35, 0.90, 0.38),
      p2: new THREE.Vector3(2.70, 1.00, 0.32),
      leafCount: 5,
      leafSize: 0.132,
      flutter: 0.28
    },

    // 19. Back Upper Filler Sprig
    {
      p0: new THREE.Vector3(0.00, 1.10, -0.25),
      p1: new THREE.Vector3(0.00, 1.45, -0.38),
      p2: new THREE.Vector3(0.00, 1.68, -0.45),
      leafCount: 5,
      leafSize: 0.130,
      flutter: 0.20
    },
    // 20. Back Left Flank Filler Sprig
    {
      p0: new THREE.Vector3(-1.10, 0.75, -0.22),
      p1: new THREE.Vector3(-1.65, 1.05, -0.35),
      p2: new THREE.Vector3(-2.05, 1.15, -0.45),
      leafCount: 5,
      leafSize: 0.130,
      flutter: 0.22
    },
    // 21. Back Right Flank Filler Sprig
    {
      p0: new THREE.Vector3(1.10, 0.75, -0.22),
      p1: new THREE.Vector3(1.65, 1.05, -0.35),
      p2: new THREE.Vector3(2.05, 1.15, -0.45),
      leafCount: 5,
      leafSize: 0.130,
      flutter: 0.22
    },
    // 22. Lower Front Inter-Bloom Center (Between rim nodding roses)
    {
      p0: new THREE.Vector3(0.00, -0.48, 1.18),
      p1: new THREE.Vector3(0.00, -0.65, 1.38),
      p2: new THREE.Vector3(0.00, -0.78, 1.45),
      leafCount: 4,
      leafSize: 0.125,
      flutter: 0.20
    },
    // 23. Front Hero Rose Cross-Sprig Left (Panel 2 signature feature!)
    {
      p0: new THREE.Vector3(-0.45, 0.20, 1.15),
      p1: new THREE.Vector3(-0.55, 0.32, 1.32),
      p2: new THREE.Vector3(-0.65, 0.40, 1.40),
      leafCount: 4,
      leafSize: 0.135,
      flutter: 0.22
    },
    // 24. Front Hero Rose Cross-Sprig Right (Panel 2 signature feature!)
    {
      p0: new THREE.Vector3(0.45, 0.20, 1.15),
      p1: new THREE.Vector3(0.55, 0.32, 1.32),
      p2: new THREE.Vector3(0.65, 0.40, 1.40),
      leafCount: 4,
      leafSize: 0.135,
      flutter: 0.22
    }
  ];

  eucalyptusSprigs.forEach((cfg) => {
    const branch = createSilverDollarEucalyptusStem(THREE, leafTex, cfg);
    bouquetGroup.add(branch);
  });

  group.add(bouquetGroup);
}

// --- GLTF 2.0 BINARY (.GLB) EXPORTER HELPER ---

export function exportModelToGLB(targetObject, filename = 'BinhSuKhia_HoaHongProudTrang.glb', callback = null, triggerDownload = true) {
  const THREE = window.THREE;
  if (!THREE || !THREE.GLTFExporter) {
    console.error('Three.js GLTFExporter not loaded');
    if (callback) callback(false, null);
    return;
  }

  const exporter = new THREE.GLTFExporter();
  exporter.parse(
    targetObject,
    (result) => {
      // result is an ArrayBuffer when binary: true
      const blob = new Blob([result], { type: 'application/octet-stream' });

      // 1. Trigger browser direct download if requested
      if (triggerDownload) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
      }

      // 2. Send binary stream to Vite server to save on disk
      fetch('/api/save-glb', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/octet-stream',
          'x-filename': filename
        },
        body: blob
      })
      .then(res => res.json())
      .then(data => {
        console.log('GLB successfully saved to disk:', data);
        if (callback) callback(true, data);
      })
      .catch(err => {
        console.warn('Vite save notice:', err);
        if (callback) callback(true, null);
      });
    },
    { binary: true }
  );
}

