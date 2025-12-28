const SampleSection = () => {
    return (
        <div className="mt-10 flex justify-center">
            <div className="w-[90%] rounded-t-4xl overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.8)] bg-white">
                {/* Header badge */}
                <div className="flex justify-center pt-8">
                    <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-600 border border-yellow-400 rounded-2xl font-semibold">
                        Live Preview
                    </span>
                </div>
                
                <h3 className="text-center text-xl md:text-2xl font-bold text-gray-800 mt-4 px-4">
                    See What Your Portfolio Will Look Like
                </h3>
                
                <p className="text-center text-gray-600 mt-2 px-4 mb-4">
                    This is a real example using our Minimal Writer template
                </p>

                <div
                    className="w-[90%] mx-auto mb-10 overflow-y-auto"
                    style={{
                        display: 'flex',
                        overflowX: 'auto',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <iframe
                        id="iframePreview"
                        src="public/templates/minimal-template/preview.html"
                        title="Writer Portfolio Preview"
                        className="w-full h-full border-none overflow-y-auto"
                        scrolling="yes"
                        style={{
                            overflowY: 'auto',
                            height: "680px",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px"
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default SampleSection;