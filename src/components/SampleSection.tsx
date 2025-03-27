import { useState } from "react";

const SampleSection = () => {
    const [websiteLink] = useState("https://jakore.vercel.app");

    return (
        <div className="mt-16 flex justify-center">
            <div className="w-[90%] rounded-t-4xl overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.8)] bg-white">
                <div
                    className="w-[90%] mx-auto mt-20 overflow-y-auto"
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
                    src={websiteLink}
                    title="Portfolio Preview"
                    className="w-full h-full border-none overflow-y-auto"
                    scrolling="no"
                    style={{
                        overflowY: 'hidden',
                        height: "590px"
                    }}
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default SampleSection;