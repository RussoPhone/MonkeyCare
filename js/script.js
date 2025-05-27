document.addEventListener('DOMContentLoaded', function() {
    // Carrossel
    const slides = document.querySelectorAll('.carrossel .slide');
    const prevBtn = document.querySelector('.carrossel-controls .prev');
    const nextBtn = document.querySelector('.carrossel-controls .next');
    let currentSlide = 0;
    let slideInterval;

    // Iniciar carrossel
    function startCarrossel() {
        slideInterval = setInterval(nextSlide, 5000);
    }

    // Mostrar slide específico
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
        currentSlide = index;
    }

    // Próximo slide
    function nextSlide() {
        const nextIndex = (currentSlide + 1) % slides.length;
        showSlide(nextIndex);
    }

    // Slide anterior
    function prevSlide() {
        const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prevIndex);
    }

    // Event listeners
    nextBtn.addEventListener('click', () => {
        clearInterval(slideInterval);
        nextSlide();
        startCarrossel();
    });

    prevBtn.addEventListener('click', () => {
        clearInterval(slideInterval);
        prevSlide();
        startCarrossel();
    });

    // Iniciar
    showSlide(currentSlide);
    startCarrossel();

    // Efeito nas tags ao rolar
    const tags = document.querySelectorAll('.tag');
    
    function checkTags() {
        tags.forEach(tag => {
            const tagTop = tag.getBoundingClientRect().top;
            if (tagTop < window.innerHeight * 0.8) {
                tag.style.opacity = '1';
                tag.style.transform = 'translateY(0)';
            }
        });
    }

    // Inicialmente escondido para animação
    tags.forEach(tag => {
        tag.style.opacity = '0';
        tag.style.transform = 'translateY(20px)';
        tag.style.transition = 'all 0.5s ease';
    });

    window.addEventListener('scroll', checkTags);
    checkTags(); // Verificar na carga inicial
});