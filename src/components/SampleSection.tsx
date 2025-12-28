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

                {/* Iframe container with scrollbar mask */}
                <div className="iframe-wrapper">
                    <div className="iframe-mask">
                        <iframe
                            src="/templates/minimal-template/preview.html"
                            title="Writer Portfolio Preview"
                            className="preview-iframe"
                        />
                    </div>
                </div>
            </div>

            <style>{`
                .iframe-wrapper {
                    width: 90%;
                    margin: 0 auto 2.5rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    overflow: hidden;
                    position: relative;
                }

                .iframe-mask {
                    width: 100%;
                    height: 680px;
                    overflow: hidden;
                    position: relative;
                }

                .preview-iframe {
                    width: calc(100% + 17px); /* Standard scrollbar width */
                    height: 680px;
                    border: none;
                    margin-right: -17px; /* Push scrollbar outside */
                    display: block;
                }

                /* For Firefox */
                @-moz-document url-prefix() {
                    .preview-iframe {
                        width: calc(100% + 15px);
                        margin-right: -15px;
                    }
                }

                /* For Safari/WebKit */
                @media not all and (min-resolution:.001dpcm) {
                    @supports (-webkit-appearance:none) {
                        .preview-iframe {
                            width: calc(100% + 15px);
                            margin-right: -15px;
                        }
                    }
                }
            `}</style>
        </div>
    );
};

export default SampleSection;