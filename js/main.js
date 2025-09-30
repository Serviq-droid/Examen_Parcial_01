document.addEventListener('DOMContentLoaded', function() {
    initCarousel();
});

function initCarousel() {
    const carousel = document.getElementById('carouselInstalaciones');
    if (carousel) {
        const bsCarousel = new bootstrap.Carousel(carousel, {
            interval: 3000,
            wrap: true
        });
    }
}