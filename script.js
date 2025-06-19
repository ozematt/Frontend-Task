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
