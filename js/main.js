document.getElementById("form").addEventListener("submit", (e) => {
    e.preventDefault();
    toggleForm();

    const puissance = parseFloat(document.getElementById("puissance").value); // en kVA
    const tensionPrimaire = parseFloat(document.getElementById("tensionPrimaire").value); // en kV
    const tensionSecondaire = parseFloat(document.getElementById("tensionSecondaire").value); // en kV
    const frequence = parseFloat(document.getElementById("frequence").value); // en Hz
    const couppri = document.getElementById("couppri").value;
    const coupsec = document.getElementById("coupsec").value;
    const tensioncc = parseFloat(document.getElementById("tensioncc").value); // en %
    const pertescc = parseFloat(document.getElementById("pertescc").value); // en W


    // ---- Préliminaires ----
    const tensionPhasePrimaire = couppri === "triangle" ? tensionPrimaire : tensionPrimaire / Math.sqrt(3);
    const tensionPhaseSecondaire = coupsec === "triangle" ? tensionSecondaire : tensionSecondaire / Math.sqrt(3);

    const puissanceColonne = puissance / 3; // kVA par colonne
    const courantPrimaire = (puissanceColonne ) / (tensionPhasePrimaire ); // A
    const courantSecondaire = (puissanceColonne ) / (tensionPhaseSecondaire ); // A

    document.getElementById("prelim-tensionphaseprimaire").innerText = tensionPhasePrimaire.toFixed(3);
    document.getElementById("prelim-tensionphasesecondaire").innerText = tensionPhaseSecondaire.toFixed(3);
    document.getElementById("prelim-courantphaseprimaire").innerText = courantPrimaire.toFixed(2);
    document.getElementById("prelim-courantphasesecondaire").innerText = courantSecondaire.toFixed(2);
    document.getElementById("prelim-puissancecolonne").innerText = puissanceColonne.toFixed(2);

    // Hypothèses pour valeurs constantes utilisées dans les calculs
    const Ka = 0.95;
    const Bc = getBc(puissance);
    const Ku = getKu(puissanceColonne);
    const A12 = getA12(tensionPrimaire);
    const Ar = A12 + getK(puissanceColonne, tensionPrimaire) * Math.pow(puissanceColonne, 0.25);
    const B = getB(puissanceColonne, tensionPrimaire);

    const Uk = tensioncc;
    const Uka = (pertescc / puissance) * 100;
    const Ukr = Math.sqrt(Math.abs((Uk * Uk) - (Uka * Uka))) / 100;

    const A01 = getA01(tensionSecondaire);
    const A1 = getA1(puissanceColonne, tensionPrimaire);


    // Diamètre de la colonne
    const D = 1.0674 * Math.pow((Ar * B * Ka * puissanceColonne * 10) / ((Ku * Ku) * (Bc * Bc) * Ukr), 0.25);
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

function getTg(tensionNominale) {
    if (tensionNominale > 0 && tensionNominale < 15) return 0.64;
    if (tensionNominale >= 15 && tensionNominale < 25) return 0.84;
    if (tensionNominale >= 25 && tensionNominale < 35) return 0.84;
    if (tensionNominale >= 35 && tensionNominale < 50) return 0.94;
    if (tensionNominale >= 50 && tensionNominale < 65) return 1.24;
    if (tensionNominale >= 65 && tensionNominale < 75) return 1.44;
    if (tensionNominale >= 75 && tensionNominale < 85) return 1.44;
    if (tensionNominale >= 85 && tensionNominale < 95) return 1.54;
    if (tensionNominale >= 95 && tensionNominale < 110) return 1.64;
    if (tensionNominale >= 110) return 1.84;
    return 0;
}

function getKpk(puissanceNominale) {

    if (puissanceNominale > 0 && puissanceNominale < 105) return 1.02;
    if (puissanceNominale >= 105 && puissanceNominale < 390) return 1.025;
    if (puissanceNominale >= 390 && puissanceNominale < 800) return 1.05;
    if (puissanceNominale >= 800 && puissanceNominale < 1300) return 1.06;
    if (puissanceNominale >= 1300 && puissanceNominale < 1800) return 1.07;
    if (puissanceNominale >= 1800 && puissanceNominale < 2250) return 1.075;
    if (puissanceNominale >= 2250 && puissanceNominale < 3250) return 1.08;
    if (puissanceNominale >= 3250 && puissanceNominale < 5000) return 1.09;
    if (puissanceNominale >= 5000 && puissanceNominale < 8000) return 1.11;
    if (puissanceNominale >= 8000) return 1.125;

    return 0;

}

function getA1(puissanceApparanteColonne, tensionPrimaire) {

    let Ka1 = 0;
    if (tensionPrimaire <= 110) Ka1 = 0.45;
    if (tensionPrimaire <= 35) Ka1 = 0.55;

    return Ka1 * Math.pow(puissanceApparanteColonne, 0.25);
}

function getA01(tensionSecondaire) {

    if (tensionSecondaire < 2 && tensionSecondaire >= 0) return 0.5;
    if (tensionSecondaire >= 2 && tensionSecondaire < 4) return 1.2;
    if (tensionSecondaire >= 4 && tensionSecondaire < 8) return 1.35;
    if (tensionSecondaire >= 8 && tensionSecondaire < 12.5) return 1.8;
    if (tensionSecondaire >= 12.5 && tensionSecondaire < 17.5) return 1.9;
    if (tensionSecondaire >= 17.5 && tensionSecondaire < 27.5) return 2.2;
    if (tensionSecondaire >= 27.5) return 3;
    return 0;

}


function getKu(puissanceApparante) {
    return getKg(puissanceApparante) * getKr();
}

function getKg(puissanceApparanteColonne) {

    if (puissanceApparanteColonne < 5) return 0.786;
    if (puissanceApparanteColonne >= 5 && puissanceApparanteColonne < 15) return 0.886;
    if (puissanceApparanteColonne >= 15 && puissanceApparanteColonne < 45) return 0.91;
    if (puissanceApparanteColonne >= 45 && puissanceApparanteColonne <= 5000) return 0.93;
    return 0;
}

function getKr() {
    return 0.945;
}

function getBc(puissanceApparante) {

    let result = 0;

    if (puissanceApparante >= 10 && puissanceApparante < 62.5) result = 1.4;
    if (puissanceApparante >= 62.5 && puissanceApparante < 282.5) result = 1.6;
    if (puissanceApparante >= 282.5 && puissanceApparante < 615) result = 1.65;
    if (puissanceApparante >= 615 && puissanceApparante <= 1000) result = 1.66;
    if (puissanceApparante > 1000) result = 1.695;

    return result;
}

function getK(puissanceApparanteColonne, tensionNominalePrimaire) {

    let result = 0;

    if (puissanceApparanteColonne < 100 && tensionNominalePrimaire <= 10) result = 0.7;

    if (tensionNominalePrimaire > 10) {
        if (puissanceApparanteColonne >= 100 && puissanceApparanteColonne < 625) result = 0.5;
        if (puissanceApparanteColonne >= 625 && puissanceApparanteColonne < 6550) result = 0.45;
        if (puissanceApparanteColonne >= 6550 && puissanceApparanteColonne <= 31500) result = 0.45;
    }

    return result;
}


function getB(puissanceApparanteColonne, tensionNominalePrimaire) {
    let result = 0;

    if (puissanceApparanteColonne >= 3 && puissanceApparanteColonne < 2000) {

        if (tensionNominalePrimaire >= 6 && tensionNominalePrimaire < 22.5) result = 2.575;
        if (tensionNominalePrimaire >= 22.5 && tensionNominalePrimaire <= 35) result = 2.633;

    } else if (puissanceApparanteColonne >= 2000 && puissanceApparanteColonne <= 20000) {

        if (tensionNominalePrimaire >= 35 && tensionNominalePrimaire < 72.5) result = 1.55;
        if (tensionNominalePrimaire >= 72.5 && tensionNominalePrimaire <= 110) result = 1.75;


    }

    return result;
}

function getSpecificLosses(induction) {
    return 0.3118 * Math.pow(induction, 3.2203);
}

function getA12(tensionNominalePrimaire) {

    let result = 0;

    if (tensionNominalePrimaire > 0 && tensionNominalePrimaire <= 4.5) result = 0.8;
    if (tensionNominalePrimaire > 4.5 && tensionNominalePrimaire <= 8) result = 0.8;
    if (tensionNominalePrimaire > 8 && tensionNominalePrimaire <= 12.5) result = 1;
    if (tensionNominalePrimaire > 12.5 && tensionNominalePrimaire <= 17.5) result = 1.25;
    if (tensionNominalePrimaire > 17.5 && tensionNominalePrimaire <= 27.5) result = 1.6;
    if (tensionNominalePrimaire > 27.5 && tensionNominalePrimaire <= 47.5) result = 2.4;
    if (tensionNominalePrimaire > 47.5 && tensionNominalePrimaire <= 60) result = 2.4;
    if (tensionNominalePrimaire > 60 && tensionNominalePrimaire < 110) result = 2.4;
    if (tensionNominalePrimaire >= 110 && tensionNominalePrimaire <= 165) result = 7;
    if (tensionNominalePrimaire > 165 && tensionNominalePrimaire <= 220) result = 17.5;

    return result;
}
