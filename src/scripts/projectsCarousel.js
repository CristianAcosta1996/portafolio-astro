// Responsive Projects Carousel: 2 per slide (mobile), 4 per slide (tablet), 6 per slide (desktop)
(function () {
  function getProjectsData() {
    const el = document.getElementById("projects-data");
    console.log("Element found:", el);
    if (!el) return [];
    try {
      const data = JSON.parse(el.textContent || "[]");
      console.log("Projects data parsed:", data);
      return data;
    } catch (e) {
      console.error("Error parsing projects data", e);
      return [];
    }
  }

  function getPerPage() {
    const width = window.innerWidth;
    if (width >= 1024) return 6; // Desktop: 3x2
    if (width >= 768) return 4; // Tablet: 2x2
    return 2; // Mobile: 1x2
  }

  function renderCard(p) {
    const techs = (p.technologies || [])
      .map((t) => `<span class="tech-tag" itemprop="keywords">${t}</span>`)
      .join("");
    const demo = p.demoUrl
      ? `<a href="${p.demoUrl}" target="_blank" rel="noopener noreferrer" aria-label="Ver demo de ${p.title}">Ver Demo</a>`
      : "";
    const repo = p.repoUrl
      ? `<a href="${p.repoUrl}" target="_blank" rel="noopener noreferrer" aria-label="Ver código de ${p.title}">Ver Código</a>`
      : "";
    return `
      <article class="project-card" itemscope itemtype="https://schema.org/CreativeWork">
        <div class="project-image">
          <img src="${p.image}" alt="${p.alt}" loading="lazy" itemprop="image" />
          <div class="project-overlay">
            <div class="project-links">${demo}${repo}</div>
          </div>
        </div>
        <div class="project-content">
          <h3 class="project-title" itemprop="name">${p.title}</h3>
          <p class="project-description" itemprop="description">${p.description}</p>
          <div class="project-technologies">${techs}</div>
        </div>
      </article>
    `;
  }

  function debounce(fn, wait) {
    let t;
    return (...args) => {
      if (t) window.clearTimeout(t);
      t = window.setTimeout(() => fn(...args), wait);
    };
  }

  class ProjectCarousel {
    constructor(projects) {
      this.projects = projects || [];
      this.carousel = document.getElementById("projects-carousel");
      this.prevBtn = document.getElementById("prev-btn");
      this.nextBtn = document.getElementById("next-btn");
      this.indicatorsWrap = document.querySelector(".carousel-indicators");
      this.currentIndex = 0;
      this.totalSlides = 0;
      this.handleResize = debounce(() => this.buildSlides(), 150);
      this.init();
    }

    buildSlides() {
      const perPage = getPerPage();
      const groups = [];
      for (let i = 0; i < this.projects.length; i += perPage) {
        groups.push(this.projects.slice(i, i + perPage));
      }

      if (!this.carousel) return;
      this.carousel.innerHTML = groups
        .map(
          (group, slideIndex) => `
        <div class="carousel-slide" data-slide-index="${slideIndex}">
          <div class="slide-grid">
            ${group.map((p) => renderCard(p)).join("")}
          </div>
        </div>
      `
        )
        .join("");

      // Indicators
      this.totalSlides = groups.length;
      if (this.indicatorsWrap) {
        this.indicatorsWrap.innerHTML = groups
          .map(
            (_, idx) => `
          <button class="indicator ${
            idx === 0 ? "active" : ""
          }" data-slide="${idx}" role="tab" aria-label="Ir al grupo ${
              idx + 1
            }"></button>
        `
          )
          .join("");
        const indicators = this.indicatorsWrap.querySelectorAll(".indicator");
        indicators.forEach((indicator, index) => {
          indicator.addEventListener("click", () => this.goToSlide(index));
        });
      }

      if (this.currentIndex >= this.totalSlides) this.currentIndex = 0;
      this.updateCarousel();
    }

    updateCarousel() {
      if (this.carousel) {
        const offset = -(this.currentIndex * 100);
        this.carousel.style.transform = `translateX(${offset}%)`;
      }
      if (this.indicatorsWrap) {
        const indicators = this.indicatorsWrap.querySelectorAll(".indicator");
        indicators.forEach((el, idx) =>
          el.classList.toggle("active", idx === this.currentIndex)
        );
      }
    }

    prevSlide() {
      this.currentIndex =
        this.currentIndex === 0 ? this.totalSlides - 1 : this.currentIndex - 1;
      this.updateCarousel();
    }

    nextSlide() {
      this.currentIndex =
        this.currentIndex === this.totalSlides - 1 ? 0 : this.currentIndex + 1;
      this.updateCarousel();
    }

    goToSlide(index) {
      this.currentIndex = index;
      this.updateCarousel();
    }

    init() {
      this.prevBtn &&
        this.prevBtn.addEventListener("click", () => this.prevSlide());
      this.nextBtn &&
        this.nextBtn.addEventListener("click", () => this.nextSlide());
      window.addEventListener("resize", this.handleResize);
      this.buildSlides();
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded, initializing carousel...");
    const data = getProjectsData();
    console.log("Creating carousel with data:", data);
    new ProjectCarousel(data);
  });
})();
