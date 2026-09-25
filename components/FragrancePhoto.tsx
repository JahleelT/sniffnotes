import Image from "next/image";

export default function FragrancePhoto() {


    return (
        <div className="flex justify-center p-4 items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-xl  ">
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