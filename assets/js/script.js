/* ==========================================================
   ILYCIA LAVERTY
   STUDIO 1.0

   Load the Studio Table
========================================================== */


/* ==========================================================
   STUDIO
========================================================== */

const studio = document.querySelector(".works");


/* ==========================================================
   TABLE LAYOUT

   These are the postcard positions on the table.
   Adjust these values to curate today's vignette.
========================================================== */

const layout = [

    { x: 900,  y: 260, r: -4 },
    { x: 999,  y: 440, r:  2 },
    { x: 990,  y: 550, r: -3 },

    { x: 1060,  y: 350, r:  1 },
    { x: 840,  y: 480, r: 4 },
    { x: 880,  y: 490, r: -2 },

    { x: 1170,  y: 480, r: -3 },
    { x: 799,  y: 480, r:  2 },

    { x: 980, y: 410, r: -6 },
    { x: 690,  y: 220, r:  0 },

    { x: 970, y: 380, r:  2 },
    { x: 770,  y: 510, r: -2 },

    { x: 790, y: 610, r:  -2 },
    { x: 740,  y: 370, r: -5 },

    { x: 900,  y: 430, r: -2 },
    { x: 790,  y: 410, r:  2 },

    { x: 920, y: 510, r: -2 },
    { x: 660,  y: 310, r: -3 },

    { x: 560,  y: 310, r:  3 },
    { x: 510,  y: 390, r: -2 },

    { x: 530,  y: 410, r:  4 },
    { x: 740,  y: 410, r: -4 }

];


/* ==========================================================
   LOAD STUDIO
========================================================== */

async function loadStudio() {

    try {

        const response = await fetch("data/works.json");

        const works = await response.json();

        buildStudio(works);

    }

    catch (error) {

        console.error("Unable to load works.", error);

    }

}


/* ==========================================================
   BUILD STUDIO
========================================================== */

function buildStudio(works) {

    works.forEach((work, index) => {

        const card = document.createElement("img");

        card.className = "work-card";

        card.draggable = false;

        card.src = work.image;

        card.alt = work.title;

        placeCard(card, index);

        card.dataset.index = index;

        studio.appendChild(card);

    card.addEventListener("mousedown", (event) => {

    activeCard = card;

    highestZ++;

    activeCard.style.zIndex = highestZ;

    const rect = activeCard.getBoundingClientRect();

cardOffsetX = event.clientX - rect.left;

cardOffsetY = event.clientY - rect.top;

});

    });

}


/* ==========================================================
   PLACE CARD
========================================================== */

function placeCard(card, index) {

    const position = layout[index];

    if (!position) return;

    card.style.left = `${position.x}px`;

    card.style.top = `${position.y}px`;

    card.style.transform = `rotate(${position.r}deg)`;

}


/* ==========================================================
   START
========================================================== */

loadStudio();


/* ==========================================================
   DRAG POSTCARDS
========================================================== */

let activeCard = null;

let highestZ = 1;

let cardOffsetX = 0;

let cardOffsetY = 0;

document.addEventListener("mousemove", (event) => {

    if (!activeCard) return;

    activeCard.style.left = `${event.clientX - cardOffsetX}px`;

    activeCard.style.top = `${event.clientY - cardOffsetY}px`;

});

document.addEventListener("mouseup", () => {

    activeCard = null;

});

