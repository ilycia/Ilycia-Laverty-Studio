/* ==========================================================
   ILYCIA LAVERTY
   FIELD KIT

   One shared Field Kit across the entire Studio.

   Loads the shared component, handles dragging,
   menu interaction, search and persistent position.
========================================================== */


const FIELD_KIT_STORAGE_KEY =
    "ilycia-field-kit-position";


/* ==========================================================
   LOAD FIELD KIT
========================================================== */

async function initialiseFieldKit() {

    const container =
        document.querySelector("#field-kit");

    if (!container) return;


    try {

        const response =
            await fetch("/components/fieldkit.html");


        if (!response.ok) {

            throw new Error(
                `Field Kit returned ${response.status}`
            );

        }


        container.innerHTML =
            await response.text();


        setupFieldKit();


    } catch (error) {

        console.error(
            "Field Kit could not be loaded.",
            error
        );

    }

}


/* ==========================================================
   FIELD KIT SETUP
========================================================== */

function setupFieldKit() {

    const fieldKit =
        document.querySelector(".field-kit");


    if (!fieldKit) return;


    /*
       Give the browser one frame to calculate the
       Field Kit's dimensions before restoring position.
    */

    requestAnimationFrame(() => {

        restoreFieldKitPosition(fieldKit);

    });


    setupFieldKitDrag(fieldKit);
    setupFieldKitMenu();
    setupFieldKitSearch();

}


/* ==========================================================
   RESTORE SAVED POSITION
========================================================== */

function restoreFieldKitPosition(fieldKit) {

    const saved =
        localStorage.getItem(
            FIELD_KIT_STORAGE_KEY
        );


    /*
       No saved position means this is a new visitor.

       Leave the Field Kit exactly where the CSS
       has placed it.
    */

    if (!saved) return;


    try {

        const position =
            JSON.parse(saved);


        if (
            typeof position.x !== "number" ||
            typeof position.y !== "number"
        ) {

            return;

        }


        restoreResponsiveFieldKitPosition(
            fieldKit,
            position
        );


    } catch (error) {

        console.warn(
            "Saved Field Kit position could not be restored."
        );

    }

}


/* ==========================================================
   APPLY POSITION
========================================================== */

function applyFieldKitPosition(
    fieldKit,
    x,
    y
) {


    const maxX =
        Math.max(
            0,
            window.innerWidth -
            fieldKit.offsetWidth
        );


    const maxY =
        Math.max(
            0,
            window.innerHeight -
            fieldKit.offsetHeight
        );


    const safeX =
        Math.min(
            Math.max(x, 0),
            maxX
        );


    const safeY =
        Math.min(
            Math.max(y, 0),
            maxY
        );


    fieldKit.style.left =
        `${safeX}px`;


    fieldKit.style.top =
        `${safeY}px`;


    fieldKit.style.right =
        "auto";

}


/* ==========================================================
   SAVE POSITION

   Store the Field Kit position as a proportion
   of the available viewport.

   This allows the position to adapt when the
   browser window changes size.
========================================================== */

function saveFieldKitPosition(fieldKit) {

    const rect =
        fieldKit.getBoundingClientRect();


    const availableWidth =
        Math.max(
            1,
            window.innerWidth -
            rect.width
        );


    const availableHeight =
        Math.max(
            1,
            window.innerHeight -
            rect.height
        );


    const position = {

        x:
            rect.left /
            availableWidth,

        y:
            rect.top /
            availableHeight

    };


    localStorage.setItem(
        FIELD_KIT_STORAGE_KEY,
        JSON.stringify(position)
    );

}


/* ==========================================================
   RESTORE RESPONSIVE POSITION
========================================================== */

function restoreResponsiveFieldKitPosition(
    fieldKit,
    position
) {


    const availableWidth =
        Math.max(
            1,
            window.innerWidth -
            fieldKit.offsetWidth
        );


    const availableHeight =
        Math.max(
            1,
            window.innerHeight -
            fieldKit.offsetHeight
        );


    applyFieldKitPosition(

        fieldKit,

        position.x *
            availableWidth,

        position.y *
            availableHeight

    );

}


/* ==========================================================
   DRAG FIELD KIT
========================================================== */

function setupFieldKitDrag(fieldKit) {

    let dragging = false;

    let offsetX = 0;
    let offsetY = 0;


    /*
       Pointer events allow the Field Kit to behave
       consistently with mouse, trackpad and touch.
    */

    fieldKit.addEventListener(
        "pointerdown",
        (event) => {


            /*
               These elements are controls.

               Clicking them must never begin
               dragging the Field Kit.
            */

            if (
                event.target.closest(
                    "input, button, a, nav"
                )
            ) {

                return;

            }


            dragging = true;


            fieldKit.classList.add(
                "dragging"
            );


            fieldKit.setPointerCapture(
                event.pointerId
            );


            const rect =
                fieldKit.getBoundingClientRect();


            offsetX =
                event.clientX -
                rect.left;


            offsetY =
                event.clientY -
                rect.top;


            /*
               Convert the CSS position into
               viewport coordinates once dragging begins.
            */

            fieldKit.style.left =
                `${rect.left}px`;


            fieldKit.style.top =
                `${rect.top}px`;


            fieldKit.style.right =
                "auto";


            event.preventDefault();

        }
    );


    fieldKit.addEventListener(
        "pointermove",
        (event) => {


            if (!dragging) return;


            const x =
                event.clientX -
                offsetX;


            const y =
                event.clientY -
                offsetY;


            applyFieldKitPosition(
                fieldKit,
                x,
                y
            );

        }
    );


    function stopDragging(event) {

        if (!dragging) return;


        dragging = false;


        fieldKit.classList.remove(
            "dragging"
        );


        if (
            event &&
            fieldKit.hasPointerCapture(
                event.pointerId
            )
        ) {

            fieldKit.releasePointerCapture(
                event.pointerId
            );

        }


        saveFieldKitPosition(
            fieldKit
        );

    }


    fieldKit.addEventListener(
        "pointerup",
        stopDragging
    );


    fieldKit.addEventListener(
        "pointercancel",
        stopDragging
    );

}


/* ==========================================================
   MENU
========================================================== */

function setupFieldKitMenu() {

    const menuButton =
        document.querySelector(
            ".menu-toggle"
        );


    const menu =
        document.querySelector(
            ".field-menu"
        );


    if (
        !menuButton ||
        !menu
    ) {

        return;

    }


    menuButton.addEventListener(
        "click",
        (event) => {


            event.stopPropagation();


            menu.classList.toggle(
                "open"
            );

        }
    );

}


/* ==========================================================
   SEARCH
========================================================== */

function setupFieldKitSearch() {

    const fieldSearch =
        document.querySelector(
            ".field-search"
        );


    if (!fieldSearch) return;


    fieldSearch.addEventListener(
        "keydown",
        (event) => {


            if (
                event.key !== "Enter"
            ) {

                return;

            }


            const query =
                fieldSearch.value
                    .trim()
                    .toLowerCase();


            switch (query) {


                case "home":

                    window.location.href =
                        "/";

                    break;


                case "architecture":

                    window.location.href =
                        "/architecture/";

                    break;


                case "art":

                    window.location.href =
                        "/art/";

                    break;


                case "about":

                    window.location.href =
                        "/about/";

                    break;


                case "instagram":

                    window.open(
                        "https://www.instagram.com/ilycialavertydesign/",
                        "_blank"
                    );

                    break;


                case "linkedin":

                    window.open(
                        "https://www.linkedin.com/in/ilycialaverty/",
                        "_blank"
                    );

                    break;


                case "pinterest":

                    window.open(
                        "https://pin.it/410aXi8pF",
                        "_blank"
                    );

                    break;

            }

        }
    );

}


/* ==========================================================
   VIEWPORT CHANGE
========================================================== */

window.addEventListener(
    "resize",
    () => {


        const fieldKit =
            document.querySelector(
                ".field-kit"
            );


        if (!fieldKit) return;


        const saved =
            localStorage.getItem(
                FIELD_KIT_STORAGE_KEY
            );


        if (!saved) return;


        try {

            const position =
                JSON.parse(saved);


            restoreResponsiveFieldKitPosition(
                fieldKit,
                position
            );


        } catch (error) {

            console.warn(
                "Saved Field Kit position could not be restored."
            );

        }

    }
);


/* ==========================================================
   START
========================================================== */

initialiseFieldKit();