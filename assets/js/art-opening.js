document.addEventListener("DOMContentLoaded", () => {

    const opening = document.querySelector(".art-opening");

    setTimeout(() => {

        opening.classList.add("is-fading");

        setTimeout(() => {
            window.location.href = "../collection/";
        }, 1000);

    }, 2000);

});