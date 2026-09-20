import {Search, CircleUserRound, Calendar, Users, Bookmark} from "lucide-react";

export default function Header() {



    return (
        <header className="flex justify-between items-center cursor-pointer max-w-full p-6">
            <h1 className="text-4xl font-semibold">SniffNotes</h1>
            <nav className="flex gap-8 items-center ">

                <button className="relative after:absolute after:left-1/2 after:-bottom-1 after:h-0.5 after:w-0 after:-translate-x-1/2 after:bg-current after:transition-all after:duration-300 hover:after:w-full">
                    <Calendar/>
                </button>

                <button className="relative after:absolute after:left-1/2 after:-bottom-1 after:h-0.5 after:w-0 after:-translate-x-1/2 after:bg-current after:transition-all after:duration-300 hover:after:w-full">
                    <Search/>
                </button>
                
                <button className="relative after:absolute after:left-1/2 after:-bottom-1 after:h-0.5 after:w-0 after:-translate-x-1/2 after:bg-current after:transition-all after:duration-300 hover:after:w-full">
                    <Users/> 
                </button>
                
                <button className="relative after:absolute after:left-1/2 after:-bottom-1 after:h-0.5 after:w-0 after:-translate-x-1/2 after:bg-current after:transition-all after:duration-300 hover:after:w-full">
                    <Bookmark/>
                </button>
                
                <button className="relative after:absolute after:left-1/2 after:-bottom-1 after:h-0.5 after:w-0 after:-translate-x-1/2 after:bg-current after:transition-all after:duration-300 hover:after:w-full">
                    <CircleUserRound/>
                </button> {/*This will be the profile tab */}
                
            </nav>
        </header>
    );
}