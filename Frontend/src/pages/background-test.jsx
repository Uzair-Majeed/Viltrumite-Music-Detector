import React from 'react';
import Lightning from '../components/Lightning';




const BackgroundTest = () => {
    return (
        <div className="pt-32 px-6 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-black text-white mb-8 tracking-tighter">Prismatic Burst Test</h1>
                <div className="rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative" style={{ width: '100%', height: '600px' }}>
                    <Lightning
                        hue={260}
                        xOffset={0}
                        speed={1}
                        intensity={1}
                        size={1}
                    />


                </div>
                <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10 text-[#94a3b8] font-medium">
                    <p>Testing the WebGL prismatic burst effect as a potential background element.</p>
                </div>
            </div>
        </div>
    );
};

export default BackgroundTest;