
// src/lib/id-generator.ts
const counters: Record<string, number> = {};

/**
 * Genera un ID únic simulat per a les dades de mostra.
 * Utilitza un prefix i un comptador incremental per a aquest prefix,
 * juntament amb una part de Date.now() per afegir variabilitat.
 * @param prefix El prefix per a l'ID (ex: "req", "task").
 * @returns Un string d'ID generat.
 */
export function generateMockId(prefix: string): string {
  if (counters[prefix] === undefined) {
    // Intentem inicialitzar el comptador basant-nos en les dades existents (molt simplificat)
    // En una implementació real, això no seria necessari o seria més complex.
    // Per a la simulació, si el prefix no existeix, comencem des de 0.
    counters[prefix] = 0;
  }
  counters[prefix]++;
  // Afegeix una part de Date.now() per més variabilitat i per simular un timestamp.
  // padStart per al comptador ajuda a mantenir una longitud consistent.
  return `${prefix.toUpperCase()}_${counters[prefix].toString().padStart(3, '0')}_${Date.now().toString().slice(-6)}`;
}
