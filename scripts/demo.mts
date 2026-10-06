// Demo content for presentations: a few reviewer accounts, reviews, and voted description suggestions.
//
//   npm run demo:seed    replace any existing demo content with a fresh set
//   npm run demo:clear   delete every demo account (and, by cascade, everything they wrote)
//
// Demo accounts all use the @sniffnotes-demo.example email domain, which can't receive mail, and are
// created through the admin API with email already confirmed, so no email is ever sent.
// Clear this before real people use the site, so they don't mistake it for genuine reviews.

import { createClient } from "@supabase/supabase-js";

const DEMO_DOMAIN = "sniffnotes-demo.example";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.");
    process.exit(1);
}

// The secret key bypasses row-level security, so this only runs locally, never in the app.
const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

const people = [
    { handle: "maya_sniffs", name: "Maya" },
    { handle: "theo_notes", name: "Theo" },
    { handle: "priya_p", name: "Priya" },
    { handle: "jonah_wears", name: "Jonah" },
    { handle: "lena_layers", name: "Lena" },
    { handle: "marcus_m", name: "Marcus" },
    { handle: "sofia_scent", name: "Sofia" },
    { handle: "kai_k", name: "Kai" },
] as const;

type Handle = (typeof people)[number]["handle"];
type Season = "spring" | "summer" | "fall" | "winter";
type DemoReview = [Handle, number, number | null, number | null, Season[], string];

// [reviewer, rating 1–5, longevity 1–5, sillage 1–4, seasons, text]
const reviews: Record<string, DemoReview[]> = {
    "aswan": [
        ["maya_sniffs", 5, 5, 3, ["fall", "winter"], "The raspberry and pink pepper opening is gorgeous, then it settles into this smoky tobacco and vanilla glow that lasts all day."],
        ["theo_notes", 4, 4, 3, ["fall", "winter"], "Dark and fruity in a way that still feels refined. A little goes a long way."],
        ["lena_layers", 4, 4, 2, ["winter"], ""],
    ],
    "santal-pao-rosa": [
        ["priya_p", 5, 4, 2, ["fall", "spring"], "Creamy sandalwood with a soft rose. The cardamom up top keeps it from feeling heavy. Effortlessly elegant."],
        ["jonah_wears", 4, 4, 2, ["fall", "winter"], "The oud is subtle, more a shadow than a statement. Wish it projected a bit more."],
        ["sofia_scent", 5, 5, 3, ["fall"], "My signature this year. People always ask what I'm wearing."],
    ],
    "luminoir": [
        ["lena_layers", 4, 3, 2, ["spring", "summer"], "Green tea and fig over a soft woody base. Calm, bright, and a little mysterious."],
        ["kai_k", 4, 3, 2, ["spring"], "Feels like stepping into a greenhouse at dusk. The jasmine shows up late and it's lovely."],
    ],
    "midnight-hour": [
        ["marcus_m", 4, 4, 3, ["summer", "fall"], "Mango skin and crushed leaves, then a leathery patchouli drydown. Unexpectedly sophisticated for the price."],
        ["theo_notes", 3, 3, 2, ["summer"], "Fun opening but the middle gets a bit sharp on my skin."],
        ["maya_sniffs", 4, 4, 3, ["fall"], "The star anise and geranium give it a nighttime edge. Great date-night pick."],
    ],
    "alto-astral": [
        ["sofia_scent", 4, 3, 2, ["summer", "spring"], "Coconut water and salted amber. Smells like skin after a day at the beach."],
        ["priya_p", 3, 2, 1, ["summer"], "Beautiful but very quiet. I'm reapplying by lunch."],
        ["kai_k", 4, 3, 2, ["summer"], ""],
    ],
    "ramad-earthy": [
        ["jonah_wears", 5, 5, 3, ["fall", "winter"], "Honey, apricot, and a cappuccino accord over patchouli and tonka. Cozy and seriously long-lasting."],
        ["marcus_m", 4, 5, 3, ["winter"], "Sweet but not cloying. Lasted through a full workday and dinner."],
    ],
    "gypsy-water": [
        ["lena_layers", 4, 2, 2, ["spring", "summer"], "Juniper and pine needles with a soft vanilla trail. Wistful in the best way."],
        ["theo_notes", 3, 2, 1, ["spring"], "Lovely, but it disappears fast."],
        ["sofia_scent", 4, 3, 2, ["spring", "fall"], "The incense and orris give it more depth than people credit it for."],
    ],
    "green-irish-tweed": [
        ["marcus_m", 5, 4, 3, ["spring", "summer"], "Fresh, green, and polished. The iris and ambergris make it feel timeless."],
        ["jonah_wears", 4, 4, 3, ["spring"], "Classic for a reason. Feels like a crisp morning."],
    ],
    "red-tobacco": [
        ["kai_k", 5, 5, 4, ["winter"], "Cinnamon, oud, and tobacco. A beast; one spray fills the room."],
        ["maya_sniffs", 4, 5, 4, ["fall", "winter"], "Rich and spicy. Go easy, it's loud."],
        ["theo_notes", 3, 5, 4, ["winter"], "Impressive, but too much for the office."],
    ],
    "bal-d-afrique": [
        ["priya_p", 4, 3, 2, ["spring", "summer"], "Bright marigold and violet over vetiver and cedar. Sunny and a little nostalgic."],
        ["lena_layers", 5, 3, 2, ["spring"], "Happiness in a bottle. Easy to wear anywhere."],
    ],
    "amore-caffe": [
        ["sofia_scent", 4, 4, 3, ["fall", "winter"], "Coffee and amaretto over brown sugar. Like a dessert you can wear."],
        ["jonah_wears", 3, 4, 3, ["winter"], "Delicious, but very sweet. Best on cold days."],
    ],
    "tabacco-toscano": [
        ["marcus_m", 4, 4, 2, ["fall", "winter"], "Tobacco leaf and birch with a leathery warmth. Old-world and comforting."],
        ["kai_k", 4, 3, 2, ["fall"], ""],
    ],
};

// Description suggestions: [author, text, voters who think it's better, voters who don't].
const suggestions: Record<string, [Handle, string, Handle[], Handle[]]> = {
    "midnight-hour": [
        "maya_sniffs",
        "A tropical night out, bottled. Juicy mango skin and crushed green leaves open over a hum of ginger, then pink pepper and star anise add a spicy edge to the geranium. As the night winds down, patchouli, leather, and musk settle into a warm, lingering trail.",
        ["theo_notes", "marcus_m", "lena_layers", "kai_k"],
        [],
    ],
    "gypsy-water": [
        "lena_layers",
        "A campfire in a pine forest at dawn: bright juniper and lemon, a whisper of incense and orris, and a soft vanilla-sandalwood glow that stays close to the skin.",
        ["sofia_scent", "priya_p"],
        ["theo_notes"],
    ],
    "santal-pao-rosa": [
        "jonah_wears",
        "Creamy sandalwood wrapped in rose petals, lifted by cardamom and darkened with a quiet thread of oud and myrrh.",
        ["priya_p"],
        [],
    ],
};

async function demoUsers() {
    const found: { id: string; email?: string }[] = [];
    for (let page = 1; ; page++) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) throw error;
        found.push(...data.users.filter((u) => u.email?.endsWith(`@${DEMO_DOMAIN}`)));
        if (data.users.length < 1000) return found;
    }
}

async function clear() {
    const users = await demoUsers();
    for (const user of users) {
        const { error } = await admin.auth.admin.deleteUser(user.id);
        if (error) throw error;
    }
    console.log(`Removed ${users.length} demo account(s) and everything they wrote.`);
}

async function seed() {
    await clear();

    const ids = new Map<Handle, string>();
    for (const person of people) {
        const { data, error } = await admin.auth.admin.createUser({
            email: `${person.handle}@${DEMO_DOMAIN}`,
            password: crypto.randomUUID(),
            email_confirm: true,
            user_metadata: { display_name: person.name, demo: true },
        });
        if (error) throw error;
        ids.set(person.handle, data.user.id);
        const { error: profileError } = await admin.from("profiles").update({ username: person.handle }).eq("id", data.user.id);
        if (profileError) throw profileError;
    }

    // Spread review dates over the last few weeks so the lists look natural.
    const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
    const reviewRows = Object.entries(reviews).flatMap(([fragranceId, list]) =>
        list.map(([handle, rating, longevity, sillage, seasons, body], i) => ({
            user_id: ids.get(handle)!,
            fragrance_id: fragranceId,
            rating, longevity, sillage, seasons, body,
            created_at: daysAgo(3 + i * 4 + (fragranceId.length % 5)),
            updated_at: daysAgo(3 + i * 4 + (fragranceId.length % 5)),
        })));
    const { error: reviewError } = await admin.from("reviews").insert(reviewRows);
    if (reviewError) throw reviewError;

    let voteCount = 0;
    for (const [fragranceId, [author, body, up, down]] of Object.entries(suggestions)) {
        const { data, error } = await admin
            .from("description_suggestions")
            .insert({ fragrance_id: fragranceId, user_id: ids.get(author)!, body })
            .select("id")
            .single();
        if (error) throw error;
        const votes = [...up.map((h) => ({ user_id: ids.get(h)!, value: 1 })), ...down.map((h) => ({ user_id: ids.get(h)!, value: -1 }))]
            .map((vote) => ({ ...vote, suggestion_id: data.id }));
        if (votes.length) {
            const { error: voteError } = await admin.from("description_votes").insert(votes);
            if (voteError) throw voteError;
        }
        voteCount += votes.length;
    }

    console.log(`Seeded ${people.length} demo accounts, ${reviewRows.length} reviews on ${Object.keys(reviews).length} fragrances, and ${Object.keys(suggestions).length} description suggestions with ${voteCount} votes.`);
}

const command = process.argv[2];
if (command === "seed") await seed();
else if (command === "clear") await clear();
else {
    console.error("Usage: node scripts/demo.mts seed|clear");
    process.exit(1);
}
