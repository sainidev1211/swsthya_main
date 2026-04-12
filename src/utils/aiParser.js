export function parseAIResponse(text) {
    const sections = {
        reportSummary: '',
        uses: '',
        dosage: '',
        sideEffects: '',
        warnings: '',
        substitutes: '',
        priceLocator: '',
        relief: '',
    };

    // Logic from original app: split by specific keywords
    // The original app likely used Regex or simple string splitting.
    // Based on the 'index.html' view, it seems the system prompt enforces a specific format.
    // We should enforce this format in our system instructions too.

    // Example format from original (inferred):
    // **Summary:** ...
    // **Uses:** ...
    // **Dosage:** ...
    // **Side Effects:** ...
    // **Warnings:** ...
    // **Substitutes:** ...
    // **Price:** ...
    // **Relief:** ...

    // Simple parser based on standard markdown headers or bold keys
    const lines = text.split('\n');
    let currentSection = null;

    lines.forEach(line => {
        const lowerLine = line.toLowerCase().replace(/\*\*/g, '').trim();

        if (lowerLine.startsWith('summary') || lowerLine.startsWith('report summary')) {
            currentSection = 'reportSummary';
        } else if (lowerLine.startsWith('uses') || lowerLine.startsWith('use cases')) {
            currentSection = 'uses';
        } else if (lowerLine.startsWith('dosage') || lowerLine.startsWith('how to use')) {
            currentSection = 'dosage';
        } else if (lowerLine.startsWith('side effects') || lowerLine.startsWith('side-effects')) {
            currentSection = 'sideEffects';
        } else if (lowerLine.startsWith('warnings') || lowerLine.startsWith('precautions')) {
            currentSection = 'warnings';
        } else if (lowerLine.startsWith('substitutes') || lowerLine.startsWith('alternatives')) {
            currentSection = 'substitutes';
        } else if (lowerLine.startsWith('price') || lowerLine.startsWith('average price')) {
            currentSection = 'priceLocator';
        } else if (lowerLine.startsWith('relief') || lowerLine.startsWith('home remedies')) {
            currentSection = 'relief';
        } else if (lowerLine.startsWith('triage priority') || lowerLine.startsWith('triage')) {
            currentSection = 'triagePriority';
        } else if (lowerLine.startsWith('possible diagnosis') || lowerLine.startsWith('diagnosis')) {
            currentSection = 'diagnosis';
        } else if (lowerLine.startsWith('suggested otc') || lowerLine.startsWith('otc') || lowerLine.startsWith('remedy')) {
            currentSection = 'otc';
        } else {
            if (currentSection) {
                sections[currentSection] += line + '\n';
            } else {
                // Fallback: add to summary if no section started yet, or ignore
                if (line.trim()) sections.reportSummary += line + '\n';
            }
        }
    });

    // Clean up
    Object.keys(sections).forEach(key => {
        if (sections[key]) sections[key] = sections[key].trim();
    });

    return sections;
}
