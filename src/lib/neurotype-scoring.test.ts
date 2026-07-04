import { describe, expect, it } from "vitest";
import {
  normalizeNeuroAnswers,
  NT_ORDER,
  scoreNeurotype,
  VALIDATION_EXAMPLES,
} from "./neurotype-scoring";

// Test di regressione dello scoring neurotipo: i 3 validation_examples di
// src/lib/neurotipo-scoring.json sono il contratto. Se questo test rompe,
// lo scoring NON è più 1:1 con la fonte (Thibaudeau / scoring-neurotipo.py).

describe("scoring neurotipo — validation_examples del JSON", () => {
  it("il JSON contiene i 3 esempi di validazione", () => {
    expect(VALIDATION_EXAMPLES).toHaveLength(3);
  });

  for (const example of VALIDATION_EXAMPLES) {
    it(example.nome, () => {
      const answers = normalizeNeuroAnswers(example.answers);
      const score = scoreNeurotype(answers);

      for (const type of NT_ORDER) {
        expect(score.totals[type], `totale ${type}`).toBe(
          example.expected_totals[type as keyof typeof example.expected_totals],
        );
      }
      expect(score.primary.code, "primario").toBe(example.expected_primary);
      expect(score.secondary.code, "secondario").toBe(example.expected_secondary);
      expect(score.margin, "margine").toBe(example.expected_margin);
    });
  }
});

describe("normalizzazione risposte", () => {
  it("accetta chiavi q1..q30 senza zero padding", () => {
    const src: Record<string, string> = {};
    for (let n = 1; n <= 30; n++) src[`q${n}`] = "A";
    expect(normalizeNeuroAnswers(src)).toEqual(Array(30).fill("A"));
  });

  it("accetta numeri 1–5 (1=A … 5=E) e minuscole", () => {
    const src: Record<string, unknown> = {};
    for (let n = 1; n <= 30; n++) src[`q${String(n).padStart(2, "0")}`] = n % 2 ? "b" : 5;
    const out = normalizeNeuroAnswers(src);
    expect(out[0]).toBe("B");
    expect(out[1]).toBe("E");
  });

  it("valori assenti o invalidi diventano stringa vuota (0 punti)", () => {
    const out = normalizeNeuroAnswers({ q01: "A", q02: "x", q03: 9 });
    expect(out[0]).toBe("A");
    expect(out[1]).toBe("");
    expect(out[2]).toBe("");
    expect(out).toHaveLength(30);
  });

  it("tie-break deterministico: a parità vince l'ordine 1A > 1B > 2A > 2B > 3", () => {
    // tutte le risposte uguali → tutti i totali uguali → primario 1A, secondario 1B
    const score = scoreNeurotype(Array(30).fill("C"));
    expect(score.primary.code).toBe("1A");
    expect(score.secondary.code).toBe("1B");
    expect(score.margin).toBe(0);
    expect(score.closeCall).toBe(true);
  });
});
