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

    { x: 980,  y: 120, r: -4 },
    { x: 720,  y: 180, r:  2 },
    { x: 520,  y: 160, r: -5 },

    { x: 360,  y: 260, r:  4 },
    { x: 640,  y: 320, r: -2 },
    { x: 930,  y: 300, r:  3 },

    { x: 470,  y: 470, r: -3 },
    { x: 770,  y: 510, r:  2 },

    { x: 1080, y: 450, r: -6 },
    { x: 260,  y: 420, r:  5 },

    { x: 1170, y: 170, r:  2 },
    { x: 210,  y: 170, r: -4 },

    { x: 1090, y: 610, r:  3 },
    { x: 610,  y: 650, r: -5 },

    { x: 340,  y: 620, r:  2 },
    { x: 860,  y: 660, r: -2 },

    { x: 1240, y: 330, r:  4 },
    { x: 160,  y: 580, r: -3 },

    { x: 560,  y: 120, r:  3 },
    { x: 820,  y: 140, r: -2 },

    { x: 430,  y: 760, r:  4 },
    { x: 980,  y: 740, r: -4 }

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

        card.src = work.image;

        card.alt = work.title;

        placeCard(card, index);

        studio.appendChild(card);

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