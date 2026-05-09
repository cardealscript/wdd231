const hamburger = document.getElementById("hamburger");
const nav = document.querySelector("nav");

hamburger.addEventListener("click", () => {
    nav.classList.toggle("open");

    if (nav.classList.contains("open")) {
        hamburger.textContent = "X";
    } else {
        hamburger.textContent = "☰";
    }

});

// Wayfinding - mark active link
const navLinks = document.querySelectorAll("nav a");
navLinks.forEach(link => {
    if (link.href === window.location.href) {
        link.classList.add("active");
    }
});