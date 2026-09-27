import Image from "next/image";

export default function FragrancePhoto() {


    return (
        <div className="flex justify-center p-4 items-center bg-black/40 backdrop-blur-sm border border-rose-200/40 rounded-xl  ">
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