document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    puissance: +document.getElementById("puissance").value,
    tensionPrimaire: +document.getElementById("tensionPrimaire").value,
    tensionSecondaire: +document.getElementById("tensionSecondaire").value,
    frequence: +document.getElementById("frequence").value,
    noyau: document.getElementById("noyau").value,
    materiau: document.getElementById("materiau").value,
    refroidissement: document.getElementById("refroidissement").value
  };
  
  const res = await fetch("http://localhost:8080/api/transformer/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  
  const r = await res.json();
  
  if (!res.ok) {
    console.error("Erreur serveur", await res.text());
    return;
  }
  
  hideEntrees();
  
  document.getElementById("prelim-puissance").textContent = r.puissanceApparente || '–';
  document.getElementById("prelim-courant").textContent = r.courantPrimaire?.toFixed(2) || '–';
  document.getElementById("prelim-courant-sec").textContent = r.courantSecondaire?.toFixed(2) || '–';
  document.getElementById("tcc").textContent = r.tensionCourtCircuit || '–';
  
  document.getElementById("spires-pri").textContent = r.spiresPrimaire || '–';
  document.getElementById("spires-sec").textContent = r.spiresSecondaire || '–';
  document.getElementById("section-fil-pri").textContent = r.sectionFilPrimaire || '–';
  document.getElementById("section-fil-sec").textContent = r.sectionFilSecondaire || '–';
  document.getElementById("longueur-fil").textContent = r.longueurFil || '–';
  document.getElementById("resistance-enroulements").textContent = r.resistanceTotale || '–';
  
  document.getElementById("noyau-section").textContent = r.sectionNoyau || '–';
  document.getElementById("dimensions-ext").textContent = r.dimensionsExt || '–';
  document.getElementById("volume-bobinage").textContent = r.volumeBobinage || '–';
  
  document.getElementById("induction").textContent = r.induction || '–';
  document.getElementById("longueur-circuit").textContent = r.longueurCircuit || '–';
  document.getElementById("flux-densite").textContent = r.densiteFlux || '–';
  
  document.getElementById("pertes-fer").textContent = r.pertesFer || '–';
  document.getElementById("pertes-cuivre").textContent = r.pertesCuivre || '–';
  document.getElementById("pertes-totales").textContent = r.pertesTotales || '–';
  document.getElementById("rendement").textContent = r.rendement ? (r.rendement * 100).toFixed(2) : '–';
});

document.getElementById("toggle-form").addEventListener("click", () => {
  hideEntrees();
});

function hideEntrees () { 
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