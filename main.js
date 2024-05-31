import Lenis from "lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitType from "split-type";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

gsap.registerPlugin(ScrollTrigger);

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();

let ring = null;
let renderer, scene, camera;
const canvas = document.querySelector("canvas.webgl");

/**
 * Initialize smooth scroll with lenis
 */
function initSmoothScroll() {
  const lenis = new Lenis();

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

function initThreeJS() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 2;
  scene.add(camera);

  const directionalLight = new THREE.DirectionalLight("lightblue", 10);
  directionalLight.position.z = 10;
  scene.add(directionalLight);

  const directionalLight2 = new THREE.DirectionalLight("#fff", 10);
  directionalLight2.position.x = 5;
  scene.add(directionalLight2);

  dracoLoader.setDecoderPath(
    "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
  );

  dracoLoader.setDecoderConfig({ type: "js" });

  loader.setDRACOLoader(dracoLoader);

  loader.load("/ring3d.glb", (glb) => {
    ring = glb.scene;
    ring.position.set(-0.5, 0.3, 0);
    ring.scale.set(0.4, 0.4, 0.4);
    scene.add(ring);

    const animate = gsap.timeline({
      scrollTrigger: {
        trigger: ".details-section",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
      defaults: {
        ease: "power3.inOut",
        duration: 3,
      },
    });

    animate
      .to(ring.position, {
        x: 0.5,
        y: 0.34,
        z: 0.2,
      })
      .to(
        ring.scale,
        {
          x: 0.5,
          y: 0.5,
          z: 0.5,
        },
        "<"
      );
  });
}

renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

window.addEventListener("resize", () => {
  let width = window.innerWidth;
  let height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
});

/**
 * Preloading
 */

/**
 * Preloading all the assets
 */
function preloadFile(url) {
  return new Promise((resolve, reject) => {
    const imageFileTypes = ["svg", "webp", "jpg"];
    const fileType = url.split(".").pop()?.toLowerCase();

    if (imageFileTypes.includes(fileType)) {
      /**
       * Preloading images
       */
      const image = new Image();
      image.src = url;
      image.onload = resolve;
      image.onerror = reject;
    } else {
      /**
       * Preload other files like GLB
       */
      fetch(url)
        .then((response) => response.blob())
        .then(resolve)
        .then(reject);
    }
  });
}

function preloadFiles(urls) {
  const promises = urls.map((url) => preloadFile(url));

  Promise.all(promises)
    .then(() => {
      console.log("All files preloaded...");
      // Hide loading screen and show the UI
      document.querySelector(".preloader")?.classList.add("hidden");
    })
    .catch((error) => console.error("Error preloading files:", error));
}

function detailsSection() {
  console.log("hello");
  const animate = gsap.timeline({
    scrollTrigger: {
      trigger: ".details-section",
      start: "30% bottom",
    },
  });
  animate.from(".ring-img", {
    scaleY: 0,
  });
}

function animateSliderSection() {
  const matchMedia = gsap.matchMedia();
  const slider = document.querySelector(".main-scroller");
  const slides = gsap.utils.toArray(".scroller");

  matchMedia.add("(min-width: 768px)", () => {
    const animateSlider = gsap.timeline({
      defaults: {
        ease: "none",
      },
      scrollTrigger: {
        trigger: slider,
        pin: true,
        scrub: 1,
        end: () => "+=" + slider.offsetWidth,
      },
    });

    animateSlider.to(
      slides,
      {
        xPercent: -(slides.length - 1) * 100,
      },
      "<"
    );

    slides.forEach((slide) => {
      slide.style.willChange = "transform, opacity";
      const paragraph = slide.querySelector(".scroller-para");
      const slideText = new SplitType(paragraph, {
        types: "chars",
      });

      animateSlider.from(slideText.chars, {
        opacity: 0,
        y: 10,
        stagger: 0.03,
        scrollTrigger: {
          trigger: paragraph,
          start: "top bottom",
          end: "bottom center",
          containerAnimation: animateSlider,
          scrub: true,
        },
      });
    });
  });
}

function waitListSection() {
  const waitListSection = document.querySelector(".waitlist");
  const para = document.querySelector(".waitlist-para");

  const waitText = new SplitType(para, {
    types: "chars",
  });

  let tl = gsap.timeline();

  tl.from(waitText.chars, {
    opacity: 0,
    y: 30,
    duration: 2,
    stagger: 0.03,
    scrollTrigger: {
      trigger: waitListSection,
      start: "top bottom",
      end: "center 50%",
      scrub: true,
    },
  });
}

function initRenderLoop() {
  const tick = () => {
    if (ring) {
      ring.rotation.y += 0.01;
    }

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  };

  tick();
}

document.addEventListener("DOMContentLoaded", () => {
  preloadFiles([
    "favicon.svg",
    "ring3d.glb",
    "h-ring.webp",
    "h-ring2.webp",
    "h-ring3.webp",
    "hero.webp",
  ]);
  initThreeJS();
  initRenderLoop();
  initSmoothScroll();

  detailsSection();
  animateSliderSection();
  waitListSection();
});
