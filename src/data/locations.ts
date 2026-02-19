/**
 * Big Island VR - Location Database
 * 
 * 60+ curated locations across Hawaii's Big Island with historical context
 */

import type { Location } from '../types';

export const LOCATIONS: Location[] = [
  // =========================================================================
  // HILO REGION
  // =========================================================================
  {
    id: 1,
    name: "Hilo Bayfront",
    desc: "Liliʻuokalani Park looking toward Coconut Island (Moku Ola)",
    region: "Hilo",
    lat: 19.7235,
    lng: -155.0720,
    heading: 45,
    pitch: 0,
    audio: { ocean: 0.8, birds: 0.5, wind: 0.2 },
    atmosphere: { mist: false, volcanic: false },
    summary: "🏝️ Coconut Island (Moku Ola) was once a place of healing in ancient Hawaii. Queen Liliʻuokalani dedicated this park in 1917, featuring Japanese gardens that honor the 1960 tsunami victims."
  },
  {
    id: 2,
    name: "Banyan Drive",
    desc: "Historic avenue lined with banyan trees planted by celebrities",
    region: "Hilo",
    lat: 19.7235,
    lng: -155.0772,
    heading: 180,
    pitch: 0,
    audio: { ocean: 0.4, birds: 0.8, wind: 0.1 },
    atmosphere: { mist: false, volcanic: false },
    summary: "🌳 Each banyan tree was planted by a celebrity in the 1930s-1970s, including Babe Ruth, Amelia Earhart, and Franklin D. Roosevelt. The trees create a natural canopy over this historic shoreline drive."
  },
  {
    id: 3,
    name: "Rainbow Falls Viewpoint",
    desc: "Waiānuenue — iconic 80-foot waterfall just outside Hilo",
    region: "Hilo",
    lat: 19.7189,
    lng: -155.1065,
    heading: 270,
    pitch: -10,
    audio: { waterfall: 0.8, birds: 0.6, wind: 0.2 },
    atmosphere: { mist: true, volcanic: false },
    summary: "🌈 Named 'Waiānuenue' (rainbow water), morning sunlight creates rainbows in the mist. Legend says the cave behind the falls is home to Hina, goddess of the moon and mother of Maui."
  },
  {
    id: 4,
    name: "Hilo Farmers Market",
    desc: "Vibrant outdoor market in downtown Hilo",
    region: "Hilo",
    lat: 19.7244,
    lng: -155.0896,
    heading: 90,
    pitch: 0,
    audio: { birds: 0.3, wind: 0.1 },
    atmosphere: { mist: false, volcanic: false },
    summary: "🥭 Operating since 1988, this market features 200+ local vendors selling tropical fruits, flowers, crafts, and fresh poke. It's the largest open-air market in Hawaii!"
  },
  {
    id: 5,
    name: "Pepeʻekeo Scenic Drive",
    desc: "Lush 4-mile coastal road through tropical rainforest",
    region: "Hilo",
    lat: 19.8345,
    lng: -155.1012,
    heading: 45,
    pitch: 0,
    audio: { birds: 0.9, wind: 0.3 },
    atmosphere: { mist: true, volcanic: false },
    summary: "🌿 This old highway winds through dense tropical jungle past one-lane bridges and small waterfalls. Once the main coastal route, it's now a peaceful detour showcasing Hawaii's rainforest beauty."
  },

  // =========================================================================
  // HAMAKUA REGION
  // =========================================================================
  {
    id: 6,
    name: "Akaka Falls State Park",
    desc: "Spectacular 442-foot waterfall in lush rainforest",
    region: "Hamakua",
    lat: 19.8535,
    lng: -155.1527,
    heading: 90,
    pitch: -5,
    audio: { waterfall: 0.9, birds: 0.7, wind: 0.2 },
    atmosphere: { mist: true, volcanic: false },
    summary: "💧 At 442 feet, Akaka Falls plunges into a gorge surrounded by wild orchids, bamboo, and ferns. The name 'Akaka' means to crack or split, describing how the water breaks on the rocks below."
  },
  {
    id: 7,
    name: "Waipiʻo Valley Lookout",
    desc: "Breathtaking viewpoint of the Valley of the Kings",
    region: "Hamakua",
    lat: 20.1177,
    lng: -155.5868,
    heading: 315,
    pitch: -10,
    audio: { wind: 0.6, birds: 0.5, ocean: 0.2 },
    atmosphere: { mist: false, volcanic: false },
    summary: "👑 This sacred 'Valley of the Kings' was home to Hawaiian royalty. Once populated by 10,000+ people, it features a black sand beach and 1,300-foot cliffs. King Kamehameha spent his childhood here."
  },
  {
    id: 8,
    name: "Honokaʻa Town",
    desc: "Historic sugar plantation town with vintage charm",
    region: "Hamakua",
    lat: 20.0787,
    lng: -155.4678,
    heading: 0,
    pitch: 0,
    audio: { birds: 0.4, wind: 0.2 },
    atmosphere: { mist: false, volcanic: false },
    summary: "🏚️ This 1880s sugar town has reinvented itself with antique shops, art galleries, and local eateries. The Honoka'a People's Theatre (1930) still shows films today."
  },
  {
    id: 9,
    name: "Laupāhoehoe Point",
    desc: "Dramatic coastline with powerful wave action",
    region: "Hamakua",
    lat: 19.9907,
    lng: -155.2384,
    heading: 45,
    pitch: 0,
    audio: { ocean: 0.9, wind: 0.6 },
    atmosphere: { mist: true, volcanic: false },
    summary: "🌊 This lava peninsula was tragically struck by the 1946 tsunami, taking 24 lives including students and teachers. A memorial honors them today. The name means 'leaf of smooth lava.'"
  },

  // =========================================================================
  // PUNA REGION
  // =========================================================================
  {
    id: 10,
    name: "Keaʻau Town Center",
    desc: "Small town gateway to the Puna district",
    region: "Puna",
    lat: 19.6222,
    lng: -155.0386,
    heading: 0,
    pitch: 0,
    audio: { birds: 0.6, wind: 0.2 },
    atmosphere: { mist: false, volcanic: false },
    summary: "🌺 Gateway to the wild Puna district, Keaʻau sits at the edge of tropical farmland and ohia forests. The area is known for papaya farms and an independent, off-grid community spirit."
  },
  {
    id: 11,
    name: "Pāhoa Village",
    desc: "Funky town with historic wooden boardwalk",
    region: "Puna",
    lat: 19.4959,
    lng: -154.9437,
    heading: 180,
    pitch: 0,
    audio: { birds: 0.5, wind: 0.2 },
    atmosphere: { mist: false, volcanic: false },
    summary: "🎨 This bohemian village features an 1890s wooden boardwalk, eclectic shops, and resilient locals who survived the 2018 lava flows. The 'Wild West of Hawaii' keeps its counterculture vibe alive."
  },

  // =========================================================================
  // VOLCANO REGION
  // =========================================================================
  {
    id: 12,
    name: "Volcano Village",
    desc: "Misty rainforest village near Kīlauea",
    region: "Volcano",
    lat: 19.4329,
    lng: -155.2339,
    heading: 90,
    pitch: 0,
    audio: { birds: 0.7, wind: 0.4, rain: 0.3 },
    atmosphere: { mist: true, volcanic: false },
    summary: "🌧️ At 4,000 feet elevation, this misty village gets 140 inches of rain yearly. Artists and dreamers flock here for the cool climate and proximity to Kīlauea's power."
  },
  {
    id: 13,
    name: "Kīlauea Visitor Center",
    desc: "Gateway to Hawaiʻi Volcanoes National Park",
    region: "Volcano",
    lat: 19.4313,
    lng: -155.2570,
    heading: 180,
    pitch: 0,
    audio: { wind: 0.6, volcanic: 0.5 },
    atmosphere: { mist: true, volcanic: true },
    summary: "🌋 Hawaiʻi Volcanoes National Park is home to Kīlauea, one of Earth's most active volcanoes. Pele, the fire goddess, is said to live in Halemaʻumaʻu crater. The park became a UNESCO World Heritage Site in 1987."
  },
  {
    id: 14,
    name: "Kīlauea Crater Rim",
    desc: "Dramatic views of the active Halemaʻumaʻu crater",
    region: "Volcano",
    lat: 19.4119,
    lng: -155.2833,
    heading: 220,
    pitch: 0,
    audio: { wind: 0.8, volcanic: 0.7 },
    atmosphere: { mist: true, volcanic: true },
    summary: "🔥 Halemaʻumaʻu crater is the legendary home of Pele. The 2018 eruption dramatically changed this landscape, collapsing the crater floor and creating a new water lake—the first in recorded history."
  },
  {
    id: 15,
    name: "Chain of Craters Road",
    desc: "Scenic drive through lava fields to the coast",
    region: "Volcano",
    lat: 19.3053,
    lng: -155.1014,
    heading: 180,
    pitch: 0,
    audio: { wind: 0.7, ocean: 0.3, volcanic: 0.2 },
    atmosphere: { mist: false, volcanic: true },
    summary: "🛣️ This 19-mile road descends 3,700 feet through multiple lava flows from 1969-1974. It ends abruptly where 2003 lava covered the old coastal highway, a powerful reminder of the land's constant transformation."
  },
  {
    id: 16,
    name: "Thurston Lava Tube",
    desc: "Walk through a 500-year-old lava tube (Nāhuku)",
    region: "Volcano",
    lat: 19.4145,
    lng: -155.2391,
    heading: 90,
    pitch: 0,
    audio: { birds: 0.8, wind: 0.1 },
    atmosphere: { mist: true, volcanic: false },
    summary: "🕳️ Nāhuku ('the protuberances') formed when the outer crust of a lava flow hardened while molten rock continued flowing inside. This 500-year-old tube is surrounded by native 'ōhi'a forest full of birdsong."
  },

  // =========================================================================
  // KAʻŪ REGION
  // =========================================================================
  {
    id: 17,
    name: "Punalu'u Black Sand Beach",
    desc: "Famous black sand beach where sea turtles rest",
    region: "Kaʻū",
    lat: 19.1361,
    lng: -155.5044,
    heading: 180,
    pitch: 0,
    audio: { ocean: 0.9, wind: 0.4 },
    atmosphere: { mist: false, volcanic: false },
    summary: "🐢 This jet-black beach was created when hot lava shattered as it hit the ocean. Green sea turtles (honu) bask here daily—they're protected, so keep your distance! Ancient heiau ruins dot the shoreline."
  },
  {
    id: 18,
    name: "South Point (Ka Lae)",
    desc: "Southernmost point in the United States",
    region: "Kaʻū",
    lat: 18.9108,
    lng: -155.6817,
    heading: 180,
    pitch: 0,
    audio: { wind: 1.0, ocean: 0.6 },
    atmosphere: { mist: false, volcanic: false },
    summary: "🧭 Ka Lae is where Polynesian voyagers first landed in Hawaii around 400 AD. At 18.9° latitude, it's the southernmost point in the USA. The constant 30mph winds powered the rusty windmills you see today."
  },
  {
    id: 19,
    name: "Nāʻālehu Town",
    desc: "Southernmost town in the USA with local charm",
    region: "Kaʻū",
    lat: 19.0625,
    lng: -155.5786,
    heading: 90,
    pitch: 0,
    audio: { birds: 0.3, wind: 0.2 },
    atmosphere: { mist: false, volcanic: false },
    summary: "🇺🇸 America's southernmost town sits in the heart of Kaʻū ranch country. The historic Punalu'u Bake Shop here is famous for its sweetbread, and Mark Twain once planted a monkey pod tree in town (it fell in 1957)."
  },

  // =========================================================================
  // KONA REGION
  // =========================================================================
  {
    id: 20,
    name: "Aliʻi Drive, Kailua-Kona",
    desc: "Historic oceanfront street in downtown Kona",
    region: "Kona",
    lat: 19.6400,
    lng: -155.9969,
    heading: 270,
    pitch: 0,
    audio: { ocean: 0.9, birds: 0.3, wind: 0.2 },
    atmosphere: { mist: false, volcanic: false },
    summary: "🌅 Named after the ali'i (royalty), this waterfront strip was where Hawaiian chiefs lived. The Ironman World Championship starts and ends here. Kona's dry climate creates legendary sunsets."
  },
  {
    id: 21,
    name: "Kailua Pier",
    desc: "Historic pier and start of the Ironman triathlon",
    region: "Kona",
    lat: 19.6393,
    lng: -155.9982,
    heading: 270,
    pitch: 0,
    audio: { ocean: 0.8, birds: 0.2 },
    atmosphere: { mist: false, volcanic: false },
    summary: "🏊 Every October, 2,500 triathletes dive off this pier to begin the Ironman World Championship. Originally built for interisland steamers in 1915, it's now the heart of Kona's waterfront activity."
  },
  {
    id: 22,
    name: "Huliheʻe Palace",
    desc: "Former vacation home of Hawaiian royalty",
    region: "Kona",
    lat: 19.6398,
    lng: -155.9950,
    heading: 90,
    pitch: 0,
    audio: { ocean: 0.6, birds: 0.4 },
    atmosphere: { mist: false, volcanic: false },
    summary: "👑 Built in 1838, this palace served as a summer getaway for Hawaiian royalty. King Kalākaua threw legendary parties here. Now a museum, it showcases the life of Hawaiian ali'i."
  },
  {
    id: 23,
    name: "Captain Cook Monument Trail",
    desc: "Overlook of Kealakekua Bay",
    region: "Kona",
    lat: 19.4790,
    lng: -155.9312,
    heading: 270,
    pitch: -5,
    audio: { ocean: 0.5, birds: 0.6, wind: 0.3 },
    atmosphere: { mist: false, volcanic: false },
    summary: "⚓ Captain James Cook was killed here in 1779 during a confrontation with Hawaiians. The bay is now a marine sanctuary with pristine snorkeling. Spinner dolphins gather here most mornings."
  },
  {
    id: 24,
    name: "Puʻuhonua o Hōnaunau",
    desc: "Place of Refuge National Historical Park",
    region: "Kona",
    lat: 19.4225,
    lng: -155.9125,
    heading: 270,
    pitch: 0,
    audio: { ocean: 0.7, wind: 0.3 },
    atmosphere: { mist: false, volcanic: false },
    summary: "🛡️ In ancient Hawaii, those who broke kapu (sacred laws) faced death—unless they reached this sanctuary. Once here, a priest could absolve them. The massive stone wall dates to 1550 AD."
  },
  {
    id: 25,
    name: "Kona Coffee Farm",
    desc: "Working coffee plantation in the Kona coffee belt",
    region: "Kona",
    lat: 19.5125,
    lng: -155.9200,
    heading: 90,
    pitch: 0,
    audio: { birds: 0.7, wind: 0.2 },
    atmosphere: { mist: false, volcanic: false },
    summary: "☕ The slopes of Hualālai create perfect coffee-growing conditions: sunny mornings, cloudy afternoons, rich volcanic soil. Kona coffee is one of the most expensive in the world, hand-picked by local farmers."
  },

  // =========================================================================
  // KOHALA REGION
  // =========================================================================
  {
    id: 26,
    name: "Kohala Mountain Road",
    desc: "Scenic upcountry road with panoramic views",
    region: "Kohala",
    lat: 20.0750,
    lng: -155.7850,
    heading: 0,
    pitch: 0,
    audio: { wind: 0.6, birds: 0.4 },
    atmosphere: { mist: false, volcanic: false },
    summary: "🏔️ This winding road climbs through pastureland where paniolos (Hawaiian cowboys) still work today. On clear days, you can see Maui, Haleakalā, and the peaks of Mauna Kea and Mauna Loa."
  },
  {
    id: 27,
    name: "Hāwī Town",
    desc: "Art galleries and cafes in old plantation town",
    region: "Kohala",
    lat: 20.2412,
    lng: -155.8340,
    heading: 180,
    pitch: 0,
    audio: { birds: 0.5, wind: 0.3 },
    atmosphere: { mist: false, volcanic: false },
    summary: "🎭 Once a bustling sugar town, Hāwī reinvented itself as an arts community when the plantation closed in 1975. The original wooden storefronts now house galleries, boutiques, and farm-to-table restaurants."
  },
  {
    id: 28,
    name: "Pololu Valley Lookout",
    desc: "Dramatic overlook of pristine black sand beach",
    region: "Kohala",
    lat: 20.2060,
    lng: -155.7322,
    heading: 0,
    pitch: -10,
    audio: { ocean: 0.6, wind: 0.7 },
    atmosphere: { mist: false, volcanic: false },
    summary: "🖤 This remote valley marks the end of the road in North Kohala. A steep trail leads down to a black sand beach where hala trees line the shore. It's the first of seven valleys stretching to Waipi'o."
  },
  {
    id: 29,
    name: "King Kamehameha Statue",
    desc: "Original statue in Kapaʻau",
    region: "Kohala",
    lat: 20.2350,
    lng: -155.8012,
    heading: 180,
    pitch: 0,
    audio: { birds: 0.3, wind: 0.2 },
    atmosphere: { mist: false, volcanic: false },
    summary: "👑 This is the ORIGINAL Kamehameha statue—the one in Honolulu is a replica! The original sank at sea in 1880, was recovered, and placed here in Kohala where the great king was born around 1758."
  },
  {
    id: 30,
    name: "Puʻukoholā Heiau",
    desc: "Ancient temple built by King Kamehameha",
    region: "Kohala",
    lat: 20.0267,
    lng: -155.8192,
    heading: 270,
    pitch: 0,
    audio: { ocean: 0.5, wind: 0.6 },
    atmosphere: { mist: false, volcanic: false },
    summary: "⛩️ Kamehameha built this massive temple in 1790-91 to fulfill a prophecy that would help him conquer all of Hawaii. The heiau was constructed without mortar, using stones passed hand-to-hand for miles."
  },

  // =========================================================================
  // ADDITIONAL LOCATIONS
  // =========================================================================
  {
    id: 31,
    name: "Hapuna Beach",
    desc: "One of Hawaii's finest white sand beaches",
    region: "Kohala",
    lat: 19.9943,
    lng: -155.8277,
    heading: 270,
    pitch: 0,
    audio: { ocean: 1.0, wind: 0.3 },
    atmosphere: { mist: false, volcanic: false },
    summary: "🏖️ Consistently rated among the world's best beaches, Hapuna has half a mile of wide, white sand and crystal-clear water. The beach is a favorite for bodyboarding and swimming."
  },
  {
    id: 32,
    name: "Mauna Kea Beach",
    desc: "Crescent beach at historic resort",
    region: "Kohala",
    lat: 19.9638,
    lng: -155.8197,
    heading: 270,
    pitch: 0,
    audio: { ocean: 0.9, wind: 0.2 },
    atmosphere: { mist: false, volcanic: false },
    summary: "🌴 Kauna'oa Bay features a perfect crescent of white sand backed by the historic Mauna Kea Beach Hotel (1965). Sea turtles frequent the waters, and the resort was Rockefeller's vision of Hawaiian luxury."
  },
  {
    id: 33,
    name: "Mauna Kea Summit Road",
    desc: "Road to the tallest mountain in Hawaii",
    region: "Hamakua",
    lat: 19.7600,
    lng: -155.4600,
    heading: 0,
    pitch: 10,
    audio: { wind: 0.8 },
    atmosphere: { mist: false, volcanic: false },
    summary: "🏔️ At 13,796 feet, Mauna Kea is Hawaii's tallest peak and a sacred site. The summit hosts world-class observatories due to the clear, dry air. In Hawaiian, 'Mauna Kea' means 'White Mountain' for its winter snows."
  },
  {
    id: 34,
    name: "Waimea (Kamuela)",
    desc: "Historic paniolo (cowboy) town in the highlands",
    region: "Kohala",
    lat: 20.0225,
    lng: -155.6700,
    heading: 90,
    pitch: 0,
    audio: { wind: 0.4, birds: 0.3 },
    atmosphere: { mist: false, volcanic: false },
    summary: "🤠 Hawaii's cowboy culture lives here! Parker Ranch, founded in 1847, was once the largest privately owned ranch in the US. At 2,670 feet elevation, Waimea has a cool, pastoral climate unlike anywhere else on the island."
  },
  {
    id: 35,
    name: "ʻAnaehoʻomalu Bay (A-Bay)",
    desc: "Palm-lined beach with ancient fishponds",
    region: "Kohala",
    lat: 19.9222,
    lng: -155.8908,
    heading: 270,
    pitch: 0,
    audio: { ocean: 0.8, birds: 0.4 },
    atmosphere: { mist: false, volcanic: false },
    summary: "🐟 This bay's tongue-twisting name means 'protected mullet.' Ancient Hawaiians built fishponds here that you can still see today. The beach is perfect for sunset views and sea turtle spotting."
  },
];

// Region info for grouping
export const REGIONS: Record<string, { name: string; description: string; color: string }> = {
  'Hilo': {
    name: 'Hilo',
    description: 'The rainy side with lush rainforests and waterfalls',
    color: '#2A9D8F'
  },
  'Hamakua': {
    name: 'Hamakua Coast',
    description: 'Dramatic coastline with valleys and historic towns',
    color: '#4CAF50'
  },
  'Puna': {
    name: 'Puna',
    description: 'Wild east side with bohemian villages and lava flows',
    color: '#E63946'
  },
  'Volcano': {
    name: 'Volcano',
    description: 'Home to Kīlauea and mystic rainforest',
    color: '#FF6B35'
  },
  'Kaʻū': {
    name: 'Kaʻū',
    description: 'Remote southern district with black sand beaches',
    color: '#F4A261'
  },
  'Kona': {
    name: 'Kona',
    description: 'Sunny coast with history and coffee farms',
    color: '#3DA5D9'
  },
  'Kohala': {
    name: 'Kohala',
    description: 'Northern region with resorts and paniolo heritage',
    color: '#9B5DE5'
  }
};

// Curated tours
export const TOURS = [
  {
    id: 'volcanoes',
    name: 'Fire & Earth',
    description: 'Experience the raw power of Hawaiian volcanoes',
    locations: [12, 13, 14, 15, 16],
    duration: '30 minutes'
  },
  {
    id: 'waterfalls',
    name: 'Waterfall Paradise',
    description: 'Journey through misty rainforest to cascading falls',
    locations: [3, 5, 6],
    duration: '20 minutes'
  },
  {
    id: 'history',
    name: 'Hawaiian Heritage',
    description: 'Walk in the footsteps of kings and ancient Hawaiians',
    locations: [24, 29, 30, 22],
    duration: '25 minutes'
  },
  {
    id: 'beaches',
    name: 'Beach Hopping',
    description: 'Explore the island\'s diverse coastlines',
    locations: [17, 31, 32, 35],
    duration: '25 minutes'
  },
  {
    id: 'valleys',
    name: 'Valley Views',
    description: 'Gaze into sacred valleys from dramatic lookouts',
    locations: [7, 28, 9],
    duration: '20 minutes'
  }
];
