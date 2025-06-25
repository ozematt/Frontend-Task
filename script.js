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
          <img src="${product.image}" class="product-photo" alt="${product.text}">
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

      let item = window.innerWidth > 1000 ? products[4] : products[3];

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

  //// POPUP
  const modal = document.querySelector("#product-popup");
  const productId = document.querySelector("#product-id");
  const productImage = document.querySelector("#product-image");
  const closeModalBtn = document.querySelector(".close-btn");

  let popupOpen = false;

  // scroll lock
  function disableScroll() {
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";
  }

  // unlock scroll
  function enableScroll() {
    document.body.style.overflow = "";
    document.body.style.height = "";
  }

  // popup open fn
  function openModal(product) {
    productId.innerText = product.id;
    productImage.setAttribute("src", product.image);
    productImage.setAttribute("alt", product.name);

    modal.classList.remove("hidden");
    disableScroll(); // scroll lock
    popupOpen = true;
  }

  // popup close
  function closeModal() {
    modal.classList.add("hidden");
    enableScroll(); // unlock scroll
    popupOpen = false;
  }

  closeModalBtn.addEventListener("click", closeModal);

  // popup close - click on bg
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // handle product click
  document
    .querySelector(".products-container")
    .addEventListener("click", (e) => {
      const productCard = e.target.closest(".product-card");
      if (!productCard) return;
      // console.log(productCard);

      const product = {
        id: productCard.dataset.productId,
        name: productCard.dataset.name,
        image: productCard.dataset.image,
      };

      openModal(product);
    });

  // SLIDE MENU
  const hamburgerMenuBtn = document.querySelector("#hamburger-menu");
  const slideMenu = document.querySelector("#slide-menu");
  const closeBtn = document.querySelector(".slide-menu__close-btn");
  const menuBg = document.querySelector(".slide-menu-bg");
  const menuLinks = document.querySelectorAll(".slide-menu-link");

  hamburgerMenuBtn.addEventListener("click", () => {
    const isOpen = slideMenu.classList.toggle("active");

    menuBg.classList.toggle("hidden");
    if (isOpen) {
      disableScroll(); // lock scroll
    } else {
      enableScroll(); // unlock scroll
    }
  });

  function closeMenu() {
    menuBg.classList.add("hidden");
    slideMenu.classList.remove("active");
    enableScroll();
  }

  closeBtn.addEventListener("click", closeMenu);
  menuBg.addEventListener("click", closeMenu);

  menuLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
});
