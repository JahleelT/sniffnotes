import Image from "next/image";

export default function FragrancePhoto() {


    return (
        <div className="flex justify-center p-4 items-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl shadow-blue-900/30 from-slate-900 via bg-gradient-to-r from-slate-950 via to-blue-950/70 via-blue-900">
            <Image
                src="/AswanWidian.jpg"
                alt="Widian Aswan bottle"
                width={400}
                height={600}
                className="object-contain"     
            />
        </div>
        
    );
}