window.log("loaded " + window.location.href );

document.addEventListener("DOMContentLoaded", function() {
    // Add an onclick listener to all anchors, buttons, and inputs to check whether
    // this is a download link and if so, install the chart.
    let controls = document.querySelectorAll('a:not(.button-disabled):not([disabled]), button:not([disabled]), input:not([disabled])');
    controls.forEach(function(control) {
        control.addEventListener("click", function() {
            let href = control.href;
            if (href && href.endsWith("/download")) {
                window.log("Installing chart: " + href);
                document.body.classList.add("ds-download");
                window.setTimeout(function() {
                    window.installChart(href);
                    document.body.classList.remove("ds-download");
                }, 100);
            }
        });
    });

    // Add a new stylesheet to the document to style the active control.
    let style = document.createElement("style");
    style.innerHTML = `
        .ds-active {
            position: relative;
        }
        .ds-active::after {
            content: "";
            border: 2px solid #e22c78;
            outline: none;
            
            position: absolute;
            top: 0px;
            left: 0px;
            right: 0px;
            bottom: 0px;
            pointer-events: none;
        }
        .ds-download {
            position: relative;
        }
        .ds-download::after {
            content: "Downloading...";
            font-size: 2em;
            color: #e22c78;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            font-weight: 200;
        }
        .ds-download main {
            opacity: 0.25;
        }
    `;
    document.head.appendChild(style);
});

// Enable arrow keys for navigation.
document.onkeydown = function(e) {
    switch (e.code) {
        case "ArrowUp":
            e.preventDefault();
            getControlsInDirection("up");
            break;
        case "ArrowDown":
            e.preventDefault();
            getControlsInDirection("down");
            break;
        case "ArrowLeft":
            e.preventDefault();
            getControlsInDirection("left");
            break;
        case "ArrowRight":
            e.preventDefault();
            getControlsInDirection("right");
            break;
    }
}

function getControlsInDirection(direction) {
    let controls = document.querySelectorAll('a:not(.button-disabled):not([disabled]), button:not([disabled]), input:not([disabled])');
    if (!controls.length)
        return;

    let activeControl = document.querySelector(".ds-active");
    if (!activeControl) {
        controls[0].classList.add("ds-active");
        controls[0].focus();
        return;
    }

    let activeRect = activeControl.getBoundingClientRect();
    let activeCenter = 0;

    switch (direction) {
        case "up":
        case "down":
            activeCenter = activeRect.top+activeRect.height/2;
            break;
        case "left":
        case "right":
            activeCenter = activeRect.left+activeRect.width/2;
            break;
        default:
            return;
    }

    let closestDistance = Number.MAX_VALUE;
    let closestControl = null;

    let skipOverlapCheck = false;

    function getClosest(control) {
        if (control === activeControl)
            return;

        let rect = control.getBoundingClientRect();
        let center = 0;
        let distance;

        switch (direction) {
            case "up":
            case "down":
                center = rect.top + rect.height / 2;
                break;
            case "left":
            case "right":
                center = rect.left + rect.width / 2;
                break;
        }

        if (direction === "up" && (skipOverlapCheck || (activeRect.left < rect.right && activeRect.right > rect.left)))
            distance = activeCenter - center;
        else if (direction === "down" && (skipOverlapCheck || (activeRect.left < rect.right && activeRect.right > rect.left)))
            distance = center - activeCenter;
        else if (direction === "left" && (skipOverlapCheck || (activeRect.top < rect.bottom && activeRect.bottom > rect.top)))
            distance = activeCenter - center;
        else if (direction === "right" && (skipOverlapCheck || (activeRect.top < rect.bottom && activeRect.bottom > rect.top)))
            distance = center - activeCenter;
        else
            return;

        if (distance <= 0)
            return;

        if (distance < closestDistance) {
            closestDistance = distance;
            closestControl = control;
        }
    }

    controls.forEach(getClosest);

    if (closestControl) {
        activeControl.classList.remove("ds-active");
        closestControl.classList.add("ds-active");
        closestControl.focus();
        return;
    }

    // If no control was found, try again without checking for overlap.
    skipOverlapCheck = true;
    controls.forEach(getClosest);

    if (closestControl) {
        activeControl.classList.remove("ds-active");
        closestControl.classList.add("ds-active");
        closestControl.focus();
    }
}