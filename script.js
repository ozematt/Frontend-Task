"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // product carousel
  const swiper = new Swiper(".swiper", {
    slidesPerView: 4,
    loop: true,
    lazy: {
      loadPrevNext: true,
      loadOnTransitionStart: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
    },

    scrollbar: {
      el: ".swiper-scrollbar",
      draggable: true,
      dragSize: "auto",
      hide: false,
    },
  });

  // custom select elements
  const trigger = document.getElementById("select-trigger");
  const options = document.getElementById("select-options");
  const selected = document.getElementById("selected-value");

  //product list elements
  const productsContainer = document.querySelector(".products-container");
  const pageSizeSelect = document.querySelector("#selected-value");

  let currentPage = 1;
  let currentPageSize = 14;
  let isProductsLoaded = false;
  let isFetching = false;
  let hasMore = true;

  trigger.addEventListener("click", () => {
    options.classList.toggle("hidden");
  });

  options.querySelectorAll(".custom-select__option").forEach((option) => {
    option.addEventListener("click", () => {
      selected.textContent = option.textContent;
      selected.setAttribute("data-value", option.getAttribute("data-value"));
      options.classList.add("hidden");

      const productsQuantity = option.getAttribute("data-value");

      currentPage = 1;
      currentPageSize = parseInt(productsQuantity);
      hasMore = true;
      productsContainer.innerHTML = "";
      loadProducts(currentPageSize);
    });
  });

  window.addEventListener("click", (e) => {
    if (!document.getElementById("custom-select").contains(e.target)) {
      options.classList.add("hidden");
    }
  });

  // product card template
  const createProductCard = (product) => `
      <div class="product-card" 
      data-image="${product.image}"
      data-name="${product.text}"  
      data-product-id="${product.id}" >
        <div class="product-card__image">
          <p class="product-id">ID: ${product.id}</p>
          <img src="${product.image}" class="product-photo" alt="jacket">
        </div>
      </div>
    `;

  // products fetching
  const loadProducts = async (pageSize, pageNumber = 1, append = false) => {
    if (isFetching || !hasMore) return;

    try {
      isFetching = true;
      const response = await fetch(
        `https://brandstestowy.smallhost.pl/api/random?pageNumber=${pageNumber}&pageSize=${pageSize}`
      );

      if (!response.ok) throw new Error("Data fetch error");

      const data = await response.json();

      hasMore = data.data.length >= pageSize;

      console.log(`Page: ${pageNumber}, Size: ${pageSize}`, data); // Debug info

      if (append) {
        productsContainer.innerHTML += data.data
          .map((product) => createProductCard(product))
          .join("");
      } else {
        productsContainer.innerHTML = data.data
          .map((product) => createProductCard(product))
          .join("");
      }
    } catch (error) {
      productsContainer.innerHTML = `<p class="error">${error.message}</p>`;
    } finally {
      isFetching = false;
      if (hasMore) setupInfiniteScroll();
      afterRenderProducts();
    }
  };

  // infinite scroll
  const setupInfiniteScroll = () => {
    const lastProduct = document.querySelector(".product-card:last-child");
    if (!lastProduct) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          currentPage++;
          loadProducts(currentPageSize, currentPage, true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px", threshold: 1.0 }
    );

    observer.observe(lastProduct);
  };

  // first products render
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !isProductsLoaded) {
        loadProducts(currentPageSize, 1);
        isProductsLoaded = true;
        observer.disconnect();
      }
    },
    {
      rootMargin: "100px",
      threshold: 1.0,
    }
  );

  const sentinel = document.querySelector(".products-container");
  observer.observe(sentinel);

  // banner logic

  const banner = `
  <div class="banner">
    <img src="assets/images/banner--desktop.webp" alt="man on ski" class="banner__background">
    <div class="banner__text">
      <p class="banner__subtitle">Forma’sint.</p>
      <h1 class="banner__title">You'll look and feel like the champion.</h1>
    </div> 
    <button class="banner__btn"> 
     <span> 
      Check this out 
      <img src="assets/icons/arrow-right-icon.svg" alt="right arrow icon"> 
     </span> 
    </button>
  </div>
  `;

  function afterRenderProducts() {
    function handleResize() {
      const products = document.querySelectorAll("[data-product-id]");

      let item;

      if (window.innerWidth > 1000) {
        item = products[4];
      } else {
        item = products[3];
      }

      if (item) {
        const existingBanner = document.querySelector(".banner");
        if (existingBanner) existingBanner.remove();

        item.insertAdjacentHTML("afterend", banner);
      }
    }

    window.removeEventListener("resize", handleResize);
    window.addEventListener("resize", handleResize);
    handleResize();
  }
});
