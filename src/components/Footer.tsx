const Footer = () => {
    return (
        <>
            <footer className="mt-20 text-center text-sm text-slate-500 bg-slate-900/50 border-t border-slate-800 p-8 backdrop-blur-sm">
                © 2026 <a href="https://porfilr.com" className="hover:text-yellow-400 hover:underline transition">Porfilr</a> | 
                <a href="/contact" className="ml-2 text-slate-500 hover:text-yellow-400 hover:underline transition">Contact Us</a> | 
                <a href="/privacy-policy" className="ml-2 text-slate-500 hover:text-yellow-400 hover:underline transition">Privacy Policy</a>
            </footer>
        </>
    );
};

export default Footer;