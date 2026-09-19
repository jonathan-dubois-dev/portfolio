import { describe, it, expect } from "vitest";
import { STATUTS, PERSONAS, INTERDITS, regleClient } from "../src/lib/verifier-contenu";

describe("statuts", () => {
  it("a exactement trois libellés, dans les mots de la spec", () => {
    expect(STATUTS).toEqual({
      usage: "En usage quotidien",
      demo: "Pack de démonstration, en service",
      demonstrateur: "Démonstrateur, en construction",
    });
  });
  it("interdit aussi « compagne » et « Maison Aube »", () => {
    expect(INTERDITS).toContain("compagne");
    expect(INTERDITS).toContain("Maison Aube");
  });
  it("PERSONAS nomme les personas de démonstration", () => {
    expect(PERSONAS).toEqual(["Marc", "Camille"]);
  });
});

describe("regleClient", () => {
  it("accepte « client de démonstration » et « aucun client »", () => {
    expect(regleClient("Un client de démonstration. Aucun client réel. Pas encore de cliente.")).toEqual([]);
  });
  it("refuse un client nu", () => {
    expect(regleClient("Le client reçoit un e-mail.")).toEqual(["Le client reçoit"]);
  });
  it("est insensible à la casse et voit « cliente »", () => {
    expect(regleClient("La Cliente confirme.")).toEqual(["La Cliente confirme"]);
  });
  it("ne confond pas « clientèle » avec « client »", () => {
    expect(regleClient("Notre clientèle est satisfaite.")).toEqual([]);
  });
  it("exempte « aucune cliente » comme « aucun client »", () => {
    expect(regleClient("Aucune cliente n'a été contactée. Aucun client réel.")).toEqual([]);
  });
});
