"""
Restore stripped German umlauts in src/content/docs/de/

Two-tier strategy:
  - SUBSTRING_REPLACE: longer unambiguous stems applied case-sensitively as substrings.
    Catches compound words like "Schlüsselverwaltung" via "Schlussel" -> "Schlüssel".
  - WORD_BOUNDARY_REPLACE: short ambiguous stems (fur/uber/gross) only applied at word boundaries.

Pass --apply to write changes; default is dry-run.
"""

import os, re, sys, collections

# Long unambiguous stems — safe to replace as substrings (case-sensitive).
# Order matters: longer/more specific first to avoid double-replacement issues.
SUBSTRING_REPLACE = [
    # Compound prefixes / morphemes (longest first within each family)
    ("Datensouveranitat", "Datensouveränität"),
    ("Souveranitat", "Souveränität"),
    ("Geschaftskontinuitat", "Geschäftskontinuität"),
    ("Geschaftsanforderung", "Geschäftsanforderung"),
    ("Geschaft", "Geschäft"),  # also catches Geschaftsdaten, Geschaftslogik etc.
    ("geschaft", "geschäft"),
    ("Verschlusselung", "Verschlüsselung"),
    ("verschlusselt", "verschlüsselt"),
    ("verschlusseln", "verschlüsseln"),
    ("Schlussel", "Schlüssel"),  # catches Schlüsselverwaltung etc.
    ("schlussel", "schlüssel"),
    ("Sicherheitsuberprufung", "Sicherheitsüberprüfung"),
    ("Bewertungslucken", "Bewertungslücken"),
    ("Plattformubergreifend", "Plattformübergreifend"),
    ("Qualitatsattribut", "Qualitätsattribut"),
    ("Qualitat", "Qualität"),
    ("Funktionalitat", "Funktionalität"),
    ("Verfugbarkeit", "Verfügbarkeit"),
    ("Zuverlassigkeit", "Zuverlässigkeit"),
    ("Identitat", "Identität"),
    ("Integritat", "Integrität"),
    ("Realitat", "Realität"),
    ("Aktivitat", "Aktivität"),
    ("Stabilitat", "Stabilität"),
    ("Kapazitat", "Kapazität"),
    ("Konformitat", "Konformität"),
    ("Universitat", "Universität"),
    ("Komplexitat", "Komplexität"),
    ("Vollstandigkeit", "Vollständigkeit"),
    ("Vollstandig", "Vollständig"),
    ("vollstandig", "vollständig"),
    ("Selbststandig", "Selbstständig"),
    ("selbststandig", "selbstständig"),
    ("Verstandnis", "Verständnis"),
    ("verstandlich", "verständlich"),
    ("Erlauterung", "Erläuterung"),
    ("erlautert", "erläutert"),
    ("Anhang", "Anhang"),  # singular has no umlaut, no-op
    ("Anhange", "Anhänge"),
    ("Storung", "Störung"),
    ("Losung", "Lösung"),
    ("losen", "lösen"),
    ("gelost", "gelöst"),
    ("Moglichkeit", "Möglichkeit"),
    ("moglich", "möglich"),
    ("Moglich", "Möglich"),
    ("erfullt", "erfüllt"),
    ("erfullen", "erfüllen"),
    ("Erfullung", "Erfüllung"),
    ("durchfuhren", "durchführen"),
    ("durchgefuhrt", "durchgeführt"),
    ("ausfuhren", "ausführen"),
    ("Ausfuhrung", "Ausführung"),
    ("ausfuhrlich", "ausführlich"),
    ("einfuhrung", "einführung"),
    ("Einfuhrung", "Einführung"),
    ("Fuhrung", "Führung"),
    ("fuhren", "führen"),
    ("fuhrt", "führt"),
    ("gefuhrt", "geführt"),
    ("gefuhrte", "geführte"),
    ("unterstutzt", "unterstützt"),
    ("unterstutzen", "unterstützen"),
    ("Unterstutzung", "Unterstützung"),
    ("Berucksichtigen", "Berücksichtigen"),
    ("berucksichtigen", "berücksichtigen"),
    ("berucksichtigt", "berücksichtigt"),
    ("Berucksichtigung", "Berücksichtigung"),
    ("Ubersicht", "Übersicht"),
    ("Uberblick", "Überblick"),
    ("Uberbruck", "Überbrück"),
    ("uberprufen", "überprüfen"),
    ("Uberprufung", "Überprüfung"),
    ("Ubergang", "Übergang"),
    ("ubergang", "übergang"),
    ("Ubergreifend", "Übergreifend"),
    ("ubergreifend", "übergreifend"),
    ("ubergeordnet", "übergeordnet"),
    ("Anderung", "Änderung"),  # catches Anderungen
    ("Anderungs", "Änderungs"),
    ("regelmassig", "regelmäßig"),
    ("massnahme", "maßnahme"),
    ("Massnahme", "Maßnahme"),
    ("Wahrend", "Während"),
    ("wahrend", "während"),
    ("naturlich", "natürlich"),
    ("Naturlich", "Natürlich"),
    ("Datenfussabdruck", "Datenfußabdruck"),
    ("Fussabdruck", "Fußabdruck"),
    ("temporare", "temporäre"),
    ("temporar", "temporär"),
    ("Temporare", "Temporäre"),
    ("Temporar", "Temporär"),
    ("einschliesslich", "einschließlich"),
    ("Einschliesslich", "Einschließlich"),
    ("schliessen", "schließen"),
    ("schliesst", "schließt"),
    ("Schliessen", "Schließen"),
    ("Schliesst", "Schließt"),
    ("ausschliesslich", "ausschließlich"),
    ("Ausschliesslich", "Ausschließlich"),
    ("ausschliessen", "ausschließen"),
    ("geschutzt", "geschützt"),
    ("geschutzte", "geschützte"),
    ("schutzen", "schützen"),
    ("schutzt", "schützt"),
    ("Geschutzt", "Geschützt"),
    ("Schutzen", "Schützen"),
    ("zuruck", "zurück"),
    ("Zuruck", "Zurück"),
    ("Aktivitaten", "Aktivitäten"),
    ("Lucke", "Lücke"),
    ("Lucken", "Lücken"),
    ("Glucksspiel", "Glücksspiel"),  # rare
    ("erklart", "erklärt"),
    ("erklaren", "erklären"),
    ("Erklarung", "Erklärung"),
    ("ausfuhrend", "ausführend"),
    ("gewahrleistet", "gewährleistet"),
    ("gewahrleisten", "gewährleisten"),
    ("Gewahrleistung", "Gewährleistung"),
    ("erhohen", "erhöhen"),
    ("erhoht", "erhöht"),
    ("erhohte", "erhöhte"),
    ("ungefahr", "ungefähr"),
    ("regelmaessig", "regelmäßig"),  # rare alt-spelling
    ("Massstab", "Maßstab"),
    ("Massstabe", "Maßstäbe"),
    ("massgeblich", "maßgeblich"),
    ("Datengrosse", "Datengröße"),
    ("Dateigrosse", "Dateigröße"),
    ("Grosse", "Größe"),  # subset of compounds
    ("grosse", "große"),
    ("grossen", "großen"),
    ("grosser", "großer"),
    ("Grossen", "Großen"),
    ("Strasse", "Straße"),
    ("Massnahmen", "Maßnahmen"),
    ("Strassen", "Straßen"),
    ("aussern", "äußern"),
    ("aussert", "äußert"),
    ("ausserst", "äußerst"),
    ("Ausserst", "Äußerst"),
    ("ausserhalb", "außerhalb"),
    ("Ausserhalb", "Außerhalb"),
    ("Hange", "Hänge"),
    ("Hohe", "Höhe"),
    ("Geschoftsanforderungen", "Geschäftsanforderungen"),  # typo guard
    ("erganzend", "ergänzend"),
    ("erganzt", "ergänzt"),
    ("erganzen", "ergänzen"),
    ("Erganzungen", "Ergänzungen"),
    ("Erganzung", "Ergänzung"),
    ("standig", "ständig"),
    ("Standig", "Ständig"),
    ("abhangig", "abhängig"),
    ("Abhangig", "Abhängig"),
    ("Abhangigkeit", "Abhängigkeit"),
    ("Zusatzlich", "Zusätzlich"),
    ("zusatzlich", "zusätzlich"),
    ("Zusatzliche", "Zusätzliche"),
    ("zusatzliche", "zusätzliche"),
    ("zustandig", "zuständig"),
    ("Zustandig", "Zuständig"),
    ("tatsachlich", "tatsächlich"),
    ("Tatsachlich", "Tatsächlich"),
    ("jahrlich", "jährlich"),
    ("Jahrlich", "Jährlich"),
    ("gehoren", "gehören"),
    ("gehort", "gehört"),
    ("fordern", "fördern"),
    ("fordert", "fördert"),
    ("gefordert", "gefördert"),
    ("Sauleansatz", "Säulenansatz"),  # rare
    ("Saule", "Säule"),
    ("Saulen", "Säulen"),
    ("ublich", "üblich"),
    ("Ublich", "Üblich"),
    ("ubrig", "übrig"),
    ("ubergeben", "übergeben"),
    ("ubernommen", "übernommen"),
    ("ubertragen", "übertragen"),
    ("ubertragung", "übertragung"),
    ("Ubertragung", "Übertragung"),
    ("uberwachen", "überwachen"),
    ("Uberwachung", "Überwachung"),
    ("uberwiegend", "überwiegend"),
    ("uberzeugen", "überzeugen"),
    ("ubernehmen", "übernehmen"),
    ("Lasst", "Lässt"),
    ("lasst", "lässt"),
    ("prufen", "prüfen"),
    ("pruft", "prüft"),
    ("gepruft", "geprüft"),
    ("Prufung", "Prüfung"),
    ("fruh", "früh"),
    ("fruher", "früher"),
    ("fruhzeitig", "frühzeitig"),
    ("Fruhe", "Frühe"),
    # Lowercase morpheme variants for compound words (German compounds keep
    # internal morphemes lowercase, e.g. "Datenintegrität" not "DatenIntegritat")
    ("integritat", "integrität"),
    ("identitat", "identität"),
    ("anderung", "änderung"),
    ("anderungs", "änderungs"),
    ("berucksichtigung", "berücksichtigung"),
    ("berucksichtigt", "berücksichtigt"),
    ("prufend", "prüfend"),
    ("prufende", "prüfende"),
    ("prufer", "prüfer"),
    ("Prufend", "Prüfend"),
    ("Prufende", "Prüfende"),
    ("Prufer", "Prüfer"),
    # More compound morphemes discovered post-trim
    ("veroffentlich", "veröffentlich"),
    ("Veroffentlich", "Veröffentlich"),
    ("gebrauchlich", "gebräuchlich"),
    ("Gebrauchlich", "Gebräuchlich"),
    ("Funf", "Fünf"),
    ("funf", "fünf"),
    ("Worter", "Wörter"),
    ("worter", "wörter"),
    ("Wortern", "Wörtern"),
    ("wortern", "wörtern"),
    ("Domane", "Domäne"),
    ("Domanen", "Domänen"),
    ("domane", "domäne"),
    ("domanen", "domänen"),
    ("schliesslich", "schließlich"),
    ("Schliesslich", "Schließlich"),
    ("souveranitat", "souveränität"),
    ("realitat", "realität"),
    ("kapazitat", "kapazität"),
    ("qualitat", "qualität"),
    ("verfugbar", "verfügbar"),
    ("verlassig", "verlässig"),
    ("zuverlassig", "zuverlässig"),
    # All-caps occasionally appears in headings
    ("MUSSEN", "MÜSSEN"),
    ("KONNEN", "KÖNNEN"),
    ("UBER", "ÜBER"),
    ("FUR", "FÜR"),
]

# Short ambiguous stems — only at word boundaries.
WORD_BOUNDARY_REPLACE = {
    "fur": "für", "Fur": "Für",
    "uber": "über", "Uber": "Über",
    "konnen": "können", "Konnen": "Können",
    "mussen": "müssen", "Mussen": "Müssen",
    "wurde": "würde", "wurden": "würden",
    "Wurde": "Würde", "Wurden": "Würden",
    "gross": "groß", "Gross": "Groß",
}

DRY_RUN = "--apply" not in sys.argv
ROOT = "src/content/docs/de"

per_pattern = collections.Counter()
per_file = collections.Counter()

for dirpath, _, files in os.walk(ROOT):
    for f in files:
        if not f.endswith((".md", ".mdx")):
            continue
        p = os.path.join(dirpath, f)
        with open(p, encoding="utf-8") as fh:
            text = fh.read()
        original = text

        # Pass 1: substring replacements (case-sensitive)
        for stripped, proper in SUBSTRING_REPLACE:
            if stripped in text:
                count_before = text.count(stripped)
                text = text.replace(stripped, proper)
                per_pattern[stripped] += count_before

        # Pass 2: word-boundary replacements
        for stripped, proper in WORD_BOUNDARY_REPLACE.items():
            new_text, n = re.subn(r"\b" + re.escape(stripped) + r"\b", proper, text)
            if n > 0:
                per_pattern[stripped] += n
                text = new_text

        if text != original:
            per_file[p] = sum(1 for _ in re.finditer(r"[äöüÄÖÜß]", text)) - sum(1 for _ in re.finditer(r"[äöüÄÖÜß]", original))
            if not DRY_RUN:
                with open(p, "w", encoding="utf-8") as fh:
                    fh.write(text)

mode = "DRY-RUN" if DRY_RUN else "APPLIED"
print(f"=== {mode} ===\n")
print("Top 20 patterns hit:")
for pat, n in per_pattern.most_common(20):
    proper = dict(SUBSTRING_REPLACE).get(pat) or WORD_BOUNDARY_REPLACE.get(pat, "?")
    print(f"  {n:4d}  {pat:30s} -> {proper}")

print(f"\nFiles changed: {len(per_file)}")
for p, n in sorted(per_file.items(), key=lambda x: -x[1])[:30]:
    print(f"  +{n:4d} umlauts  {p}")

print(f"\nTotal pattern matches: {sum(per_pattern.values())}")
if DRY_RUN:
    print("(re-run with --apply to write changes)")
