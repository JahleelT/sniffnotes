import Image from "next/image";

export default function FragrancePhoto() {


    return (
        <div className="flex justify-center items-center">
            <Image
                src="/AswanWidian.jpg"
                alt="Widian Aswan bottle"
                width={300}
                height={500}
                className="object-contain"     
            />
        </div>
        
    );
}