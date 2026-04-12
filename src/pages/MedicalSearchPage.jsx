import MedicalSearch from '../components/features/MedicalSearch';

export default function MedicalSearchPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 pt-4 md:pt-8 pb-24 md:pb-12">
            <div className="mb-6 md:mb-10 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Scan Medicine</h1>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                    Identify medicines, check dosages, and compare prices instantly.
                </p>
            </div>
            <MedicalSearch />
        </div>
    );
}
