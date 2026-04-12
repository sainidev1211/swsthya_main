const MedicineCard = ({ data, sources, isVisible }) => {
    if (!isVisible || !data) return null;

    // Helper to safely access data properties, assuming data is a structured object
    // If data is just markdown text, we might need to parse it or display it differently.
    // The original app likely parsed the markdown or JSON response. 
    // Based on the 'index.html', there are separate sections for 'uses', 'dosage', 'sideEffects', etc.
    // This implies the AI response is likely parsed into these sections or the 'data' passed here is already structured.
    // For now, let's assume 'data' is an object with these keys, or we might need a parser utility.

    // Actually, looking at index.html, the AI response text is parsed. 
    // We should probably rely on a unified parser or passing raw text and parsing it here.
    // Let's assume the parent component parses the AI text into an object: { uses, dosage, sideEffects, warnings, substitutes, priceLocator, relief, imageDetails (optional) }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl space-y-6 p-4 shadow mt-6">

            {data.reportSummary && (
                <div className="result-section">
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 section-header">Summary</h3>
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{data.reportSummary}</div>
                </div>
            )}

            {data.uses && (
                <div className="result-section">
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 section-header">Uses</h3>
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{data.uses}</div>
                </div>
            )}

            {data.dosage && (
                <div className="result-section">
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 section-header">Dosage</h3>
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{data.dosage}</div>
                </div>
            )}

            {data.sideEffects && (
                <div className="result-section">
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 section-header">Side Effects</h3>
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{data.sideEffects}</div>
                </div>
            )}

            {data.warnings && (
                <div className="result-section">
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 section-header">Warnings</h3>
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{data.warnings}</div>
                </div>
            )}

            {data.substitutes && (
                <div className="result-section">
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 section-header">Substitutes</h3>
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{data.substitutes}</div>
                </div>
            )}

            {data.priceLocator && (
                <div className="result-section">
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 section-header">Price Locator</h3>
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{data.priceLocator}</div>
                </div>
            )}

            {data.relief && (
                <div className="result-section">
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 section-header">Immediate Relief</h3>
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{data.relief}</div>
                </div>
            )}

            {/* Scrollable Buy Buttons */}
            <div className="buy-section-content">
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-3 text-center">Buy This Medicine Online</h3>
                <div className="buy-button-group">
                    <a href="https://pharmeasy.in/search/all?name=" target="_blank" rel="noopener noreferrer" className="buy-button bg-green-500 text-white hover:bg-green-600">Buy on PharmEasy</a>
                    <a href="https://www.netmeds.com/catalogsearch/result?q=" target="_blank" rel="noopener noreferrer" className="buy-button bg-red-500 text-white hover:bg-red-600">Buy on Netmeds</a>
                    <a href="https://www.truemeds.in/search/" target="_blank" rel="noopener noreferrer" className="buy-button bg-green-700 text-white hover:bg-green-800">Buy on Truemeds</a>
                    <a href="https://www.apollopharmacy.in/search-medicines/" target="_blank" rel="noopener noreferrer" className="buy-button bg-orange-600 text-white hover:bg-orange-700">Buy on Apollo</a>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">These are external, deep-linked search results.</p>
            </div>

            {sources && sources.length > 0 && (
                <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Sources used for grounding:</p>
                    <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 space-y-1">
                        {sources.map((source, idx) => (
                            <li key={idx}>
                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{source.title}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MedicineCard;
