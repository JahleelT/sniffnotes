import Image from "next/image";
import { fragrances } from "@/data/fragrances";
export default function FragrancePhoto() {

    const photo = fragrances[0].image;

    return (
        <div className="flex justify-center p-4 items-center bg-slate-950/70 backdrop-blur-sm border border-sky-300/20 rounded-xl  ">
            <Image
                src={photo}
                alt="Widian Aswan bottle"
                width={400}
                height={600}
                className="object-contain"     
            />
        </div>
        
    );
}