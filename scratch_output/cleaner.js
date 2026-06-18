const fs = require('fs');
const path = require('path');

function cleanMecanica() {
  let content = fs.readFileSync(path.join(__dirname, '../Contenidos/mecanica basica automotriz.txt'), 'utf8');
  
  // Remove reference brackets like [1], [2, 3], [20-22]
  content = content.replace(/\[[\d\s,\-]+\]/g, '');
  
  // Remove any double spaces before punctuation that might result from the removal
  content = content.replace(/\s+\./g, '.');
  content = content.replace(/\s+,/g, ',');

  // Ensure headings are correct
  // Módulo X is already ## Módulo X
  
  return content;
}

function cleanPrimerosAuxilios() {
  let content = fs.readFileSync(path.join(__dirname, '../Contenidos/Primeros auxilios.txt'), 'utf8');
  
  // Remove references like [basic validation...]
  content = content.replace(/\[.*?\]/g, '');

  // Fix isolated dots on new lines
  content = content.replace(/\n\s*\.\n/g, '.\n');
  content = content.replace(/\n\s*\./g, '.');
  
  // Format headers
  content = content.replace(/^(Módulo \d+:.*)/gm, '## $1');

  // Bold subheadings like "Conducta P.A.S. (Proteger, Avisar, Socorrer)"
  // It seems they are at the start of paragraphs followed by text.
  // Actually we can just leave them or make them bold if they don't have punctuation at the end.
  // Let's just do basic cleanup first.
  
  return content;
}

console.log("=== MECANICA ===");
console.log(cleanMecanica().substring(0, 500));
console.log("\n=== PRIMEROS AUXILIOS ===");
console.log(cleanPrimerosAuxilios().substring(0, 500));
