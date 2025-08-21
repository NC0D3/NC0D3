//sketch based part
const canvas = document.getElementById("flockCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});


const flock = [];
let isTouching = false;
let touchX = null;
let touchY = null;

function setup() {
    createCanvas(canvas.width,canvas.height);
    colorMode(HSB, 360, 100, 100);
    let isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    let boidCount = isMobile ? 80 : 400;
    for (let i = 0; i < boidCount; i++) {
        flock.push(new Boid());
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    background(0);
    for (let boid of flock) {
        boid.edges();
        boid.flock(flock);
        boid.avoidMouse();
        boid.update();
        boid.show();
    }
}

canvas.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    touchX = touch.clientX - rect.left;
    touchY = touch.clientY - rect.top;
    isTouching = true;
}, { passive: true });  // NO bloquea el scroll

canvas.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    touchX = touch.clientX - rect.left;
    touchY = touch.clientY - rect.top;
}, { passive: true });

canvas.addEventListener("touchend", () => {
    isTouching = false;
    touchX = null;
    touchY = null;
}, { passive: true });

function touchEnded() {
    touchX = null;
    touchY = null;
}


//boid based part
class Boid {
    constructor() {
        this.position = createVector(random(width), random(height));
        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(random(2, 4));
        this.acceleration = createVector();
        this.maxForce = 0.2;
        this.maxSpeed = 5;
        let hue = random(360);
        this.color = color(hue, 30, 95);
    }

    edges() {
        if (this.position.x > width) {
            this.position.x = 0;
        } else if (this.position.x < 0) {
            this.position.x = width;
        }
        if (this.position.y > height) {
            this.position.y = 0;
        } else if (this.position.y < 0) {
            this.position.y = height;
        }
    }

    align(boids) {
        let perceptionRadius = 25;
        let steering = createVector();
        let total = 0;
        for (let other of boids) {
            let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
            if (other != this && d < perceptionRadius) {
                steering.add(other.velocity);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    separation(boids) {
        let perceptionRadius = 24;
        let steering = createVector();
        let total = 0;
        for (let other of boids) {
            let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
            if (other != this && d < perceptionRadius) {
                let diff = p5.Vector.sub(this.position, other.position);
                diff.div(d * d);
                steering.add(diff);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    cohesion(boids) {
        let perceptionRadius = 50;
        let steering = createVector();
        let total = 0;
        for (let other of boids) {
            let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
            if (other != this && d < perceptionRadius) {
                steering.add(other.position);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.sub(this.position);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    avoidMouse() {
        let active = false;
        let targetX, targetY;

        if (isTouching && touchX !== null && touchY !== null) {
            targetX = touchX;
            targetY = touchY;
            active = true;
        } else {
            targetX = mouseX;
            targetY = mouseY;
            active = true;
        }

        if (!active) return;
        let perceptionRadius = 50;
        let mouse = createVector(targetX, targetY);
        let d = dist(this.position.x, this.position.y, mouse.x, mouse.y);
        if (d < perceptionRadius) {
            let repulse = p5.Vector.sub(this.position, mouse);
            repulse.setMag((perceptionRadius - d) * 0.5); // Más fuerte si está más cerca
            this.acceleration.add(repulse);
        }
    }

    flock(boids) {
        let alignment = this.align(boids);
        let cohesion = this.cohesion(boids);
        let separation = this.separation(boids);

        alignment.mult(1.5);
        cohesion.mult(1);
        separation.mult(2);

        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        this.acceleration.add(separation);
    }

    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.acceleration.mult(0);
    }

    show() {
        noStroke();
        fill(this.color);
        ellipse(this.position.x, this.position.y, 6, 6);
    }
}


//visual based part
function llamarAPI() {
    fetch("https://nose-que-hago-xd.onrender.com/process", {
        method: "POST"
    })
        .then(response => response.text())
        .then(texto => {
            document.getElementById("respuesta").innerText = texto;
        })
        .catch(error => {
            document.getElementById("respuesta").innerText = "Error al contactar el servidor.";
            console.error(error);
        });
}


document.querySelectorAll('.navbar-logo').forEach(el => {
    const originalText = el.textContent;

    function randomizeFontPerLetter(element, text, interval = 50) {
        const letters = text.split("");
        const shuffleIndices = [...Array(letters.length).keys()].sort(() => Math.random() - 0.5);
        const spans = letters.map(letter => {
            const span = document.createElement("span");
            span.textContent = letter;
            span.style.transition = "font-family 0.2s";
            return span;
        });

        element.innerHTML = "";
        spans.forEach(span => element.appendChild(span));

        let i = 0;
        const changeInterval = setInterval(() => {
            if (i >= shuffleIndices.length) {
                clearInterval(changeInterval);
                return;
            }
            const idx = shuffleIndices[i];
            spans[idx].style.fontFamily = "'Courier New', Courier, monospace";
            i++;
        }, interval);
    }

    function resetFont(element, text) {
        element.textContent = text;
    }

    el.addEventListener("mouseenter", () => {
        randomizeFontPerLetter(el, originalText, 80);
    });

    el.addEventListener("mouseleave", () => {
        resetFont(el, originalText);
    });
});