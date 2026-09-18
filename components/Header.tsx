import {Search, CircleUserRound, Calendar, UsersRound, Bookmark} from "lucide-react";

export default function Header() {



    return (
        <header className="flex justify-between items-center cursor-pointer max-w-full p-6">
            <h1 className="text-2xl font-semibold">SniffNotes</h1>
            <nav className="flex gap-8 items-center">
                <Calendar/> {/*This will become the Daily Fragrance tab*/}
                <Search/> 
                <UsersRound/> 
                <Bookmark/>
                <CircleUserRound/> {/*This will be the profile tab */}
            </nav>
        </header>
    );
}