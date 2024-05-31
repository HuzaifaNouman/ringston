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
let contactRotation = false;
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
    ring.position.set(-1, 0.3, 0);
    ring.scale.set(0.4, 0.4, 0.4);
    scene.add(ring);

    const animate = gsap.timeline({
      scrollTrigger: {
        trigger: "details-section",
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
    const imageFileTypes = ["svg", "avif", "jpg"];
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

function animateWords() {
  const words = ["Relationships", "Romance", "Rings"];
  let index = 0;
  const textElement = document.querySelector(".animated-word");
  let split;

  function animateChar(chars) {
    gsap.from(chars, {
      yPercent: 100,
      stagger: 0.03,
      duration: 1.5,
      ease: "power4.out",
      onComplete: () => {
        if (split) {
          split.revert();
        }
      },
    });
  }

  function updateText() {
    textElement.textContent = words[index];
    split = new SplitType(".animated-word", { types: "chars" });
    animateChar(split.chars);
    // index = (index + 1) % words.length;
    index == words.length ? (index = 0) : index++;
  }

  setInterval(updateText, 2000);
}

function detailsSection() {
  const animate = gsap.timeline({
    scrollTrigger: {
      trigger: ".details-section",
      start: "30% bottom",
      end: "bottom top",
    },
  });

  animate
    .to(".details h1", {
      y: -100,
    })
    .from(
      ".ring-img",
      {
        y: -50,
        height: 0,
      },
      "<"
    );

  gsap.to(".details-tag", {
    scrollTrigger: {
      trigger: ".details-tag",
      start: "top 80%",
      end: "bottom top",
      scrub: true,
    },
    x: 200,
  });
}

function animateSliderSection() {
  const matchMedia = gsap.matchMedia();

  matchMedia.add("(min-width: 768px)", () => {
    const slider = document.querySelector(".main-scroller");
    const slides = gsap.utils.toArray(".scroller");

    if (!slider) {
      return;
    }
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
      start: "top center",
      end: "40% 40%",
      scrub: true,
    },
  });
}

function initRenderLoop() {
  const tick = () => {
    if (ring) {
      // ring.rotation.x += 0.003;
      ring.rotation.y += 0.01;
    }

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  };

  tick();
}

document.addEventListener("DOMContentLoaded", () => {
  preloadFiles([
    "ring3d.glb",
    "ring.jpg",
    "h-ring.avif",
    "h-ring2.avif",
    "h-ring3.avif",
  ]);
  initThreeJS();
  initRenderLoop();

  animateWords();
  detailsSection();
  animateSliderSection();
  waitListSection();
  initSmoothScroll();
});