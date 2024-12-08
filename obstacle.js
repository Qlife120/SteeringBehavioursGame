class Obstacle {
    constructor(x, y, r, color, speedX = 1, speedY = 1) {
        this.pos = createVector(x, y); // Position de l'obstacle
        this.r = r;                   // Rayon de l'obstacle
        this.color = color;           // Couleur de l'obstacle
        this.speed = createVector(speedX, speedY); // Vitesse de déplacement
    }

    // Mise à jour de la position avec un effet de va-et-vient
    update(bounds) {
        // Mise à jour de la position
        this.pos.add(this.speed);

        // Gestion des rebonds sur les limites
        if (this.pos.x - this.r / 2 < bounds.left || this.pos.x + this.r / 2 > bounds.right) {
            this.speed.x *= -1; // Inverser la vitesse horizontale
        }
        if (this.pos.y - this.r / 2 < bounds.top || this.pos.y + this.r / 2 > bounds.bottom) {
            this.speed.y *= -1; // Inverser la vitesse verticale
        }
    }

    // Affichage de l'obstacle
    show() {
        push();
        fill(this.color);
        stroke("black");
        strokeWeight(2);
        ellipse(this.pos.x, this.pos.y, this.r); // Cercle externe
        fill(0);
        ellipse(this.pos.x, this.pos.y, this.r / 2); // Cercle interne
        pop();
    }
}


























