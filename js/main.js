document.getElementById("form").addEventListener("submit", (e) => {
    e.preventDefault();

    const puissance = parseFloat(document.getElementById("puissance").value); // en kVA
    const tensionPrimaire = parseFloat(document.getElementById("tensionPrimaire").value); // en kV
    const tensionSecondaire = parseFloat(document.getElementById("tensionSecondaire").value); // en kV
    const frequence = parseFloat(document.getElementById("frequence").value); // en Hz
    const couppri = document.getElementById("couppri").value;
    const coupsec = document.getElementById("coupsec").value;

    // ---- Préliminaires ----
    const tensionPhasePrimaire = couppri === "triangle" ? tensionPrimaire : tensionPrimaire / Math.sqrt(3);
    const tensionPhaseSecondaire = coupsec === "triangle" ? tensionSecondaire : tensionSecondaire / Math.sqrt(3);

    const puissanceColonne = puissance / 3; // kVA par colonne
    const courantPrimaire = (puissanceColonne * 1000) / (tensionPhasePrimaire * 1000); // A
    const courantSecondaire = (puissanceColonne * 1000) / (tensionPhaseSecondaire * 1000); // A

    document.getElementById("prelim-tensionphaseprimaire").innerText = tensionPhasePrimaire.toFixed(3);
    document.getElementById("prelim-tensionphasesecondaire").innerText = tensionPhaseSecondaire.toFixed(3);
    document.getElementById("prelim-courantphaseprimaire").innerText = courantPrimaire.toFixed(2);
    document.getElementById("prelim-courantphasesecondaire").innerText = courantSecondaire.toFixed(2);
    document.getElementById("prelim-puissancecolonne").innerText = puissanceColonne.toFixed(2);

    // Hypothèses pour valeurs constantes utilisées dans les calculs
    const Ka = 0.95;
    const Bc = 1.4; // induction magnétique typique
    const Ku = 0.85;
    const A12 = 1.5;
    const A1 = 2.5;
    const A01 = 1.2;
    const B = 0.9;

    const pertesCourtCircuit = 1000; // W, à remplacer si nécessaire
    const tensionCourtCircuit = 6; // %, à remplacer si nécessaire

    const Uka = (pertesCourtCircuit / (puissance * 1000)) * 100;
    const Ukr = Math.sqrt(Math.abs((tensionCourtCircuit * tensionCourtCircuit) - (Uka * Uka))) / 100;

    // Diamètre de la colonne
    const D = 1.0674 * Math.pow((A12 * B * Ka * puissanceColonne * 10) / ((Ku * Ku) * (Bc * Bc) * Ukr), 0.25);
    document.getElementById("prelim-diametrecolonne").innerText = D.toFixed(2);

    // Diamètre canal de fuite
    const D12 = D + 2 * A01 + 2 * A1 + A12;
    document.getElementById("prelim-diametrecanalfuite").innerText = D12.toFixed(2);

    // Section du fer
    const SFer = (Ku * Math.PI * D * D / 4) / 10000; // m²
    document.getElementById("enroul-sectionfer").innerText = (SFer * 10000).toFixed(2); // cm²

    // Tension de spire
    const Usp = Math.sqrt(2) * Math.PI * frequence * SFer * Bc;
    document.getElementById("enroul-tensionspirephase").innerText = Usp.toFixed(2);

    // Nombre de spires
    const W1 = Math.round((tensionPhasePrimaire * 1000) / Usp);
    const W2 = Math.round((tensionPhaseSecondaire * 1000) / Usp);
    document.getElementById("enroul-nombrespires").innerText = `${W1} / ${W2}`;

    // Tension spire recalculée
    const UspR = (tensionPhasePrimaire * 1000) / W1;
    const Bcr = UspR / (4.44 * frequence * SFer); // T
    document.getElementById("enroul-inductionmagnetique").innerText = Bcr.toFixed(3);

    // Densité de courant
    const J = (7.34 * pertesCourtCircuit * UspR) / (1000 * puissance * D12);
    document.getElementById("enroul-densitécourant").innerText = J.toFixed(2);

    // Section conducteurs
    const sectionPrimaire = courantSecondaire / J;
    const Jrc = courantSecondaire / sectionPrimaire;
    const sectionSecondaire = courantPrimaire / Jrc;

    document.getElementById("enroul-sectionconducteurprimaire").innerText = sectionPrimaire.toFixed(2);
    document.getElementById("enroul-sectionconducteursecondaire").innerText = sectionSecondaire.toFixed(2);
});

// Afficher / masquer formulaire
document.getElementById("toggle-form").addEventListener("click", () => {
    toggleForm();
});

function toggleForm() {
    const section = document.getElementById("form-section");
    const btn = document.getElementById("toggle-form");
    if (section.style.display === "none") {
        section.style.display = "block";
        btn.textContent = "Masquer les entrées";
    } else {
        section.style.display = "none";
        btn.textContent = "Afficher les entrées";
    }
}
