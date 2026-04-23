const ADDICTION_KNOWLEDGE = {
  porn: {
    name: "Pornography Recovery",
    phases: [
      { name: "Digital Detox", focus: "Removing triggers and resetting dopamine receptors." },
      { name: "Mental Rewiring", focus: "Breaking the association between stress and pixels." },
      { name: "Authentic Connection", focus: "Reclaiming real-world intimacy and self-respect." }
    ],
    tasks: [
      "Install content blockers on all devices.", "Identify your 'vulnerability hours'.", "Practice 5-min cold shower for dopamine reset.",
      "Unfollow triggering social media accounts.", "Journal about your specific triggers.", "Spend 20 mins in nature without a phone.",
      "Replace screen time with a physical book.", "Observe the 'urge' as a passing wave.", "Engage in a high-intensity workout.",
      "Connect with a real friend (not digital).", "Listen to a podcast on brain neuroplasticity.", "Meditate on the 'witness' state of mind.",
      "Clean your physical environment.", "Write a letter to your future self.", "Practice the 4-7-8 breathing technique.",
      "Avoid all 'soft' triggers in media.", "Set a new physical fitness goal.", "Learn a new difficult skill (like coding).",
      "Reflect on your growth since Day 1.", "Plan your 'Freedom Celebration'.", "Commit to being a guide for others."
    ]
  },
  smoking: {
    name: "Smoking/Vaping Cessation",
    phases: [
      { name: "Lung Recovery", focus: "Clearing physical toxins and managing cravings." },
      { name: "Ritual Replacement", focus: "Replacing the 'hand-to-mouth' habit with health." },
      { name: "Vitality Mastery", focus: "Reclaiming peak physical performance and breath." }
    ],
    tasks: [
      "Discard all cigarettes/vapes and lighters.", "Drink 3 liters of water to flush toxins.", "Deep breathing when craving hits.",
      "Clean your car/home of smoke smell.", "Walk for 15 mins after meals.", "Chew on sugar-free gum or cinnamon sticks.",
      "Avoid coffee (a common trigger) for today.", "Notice how your sense of smell improves.", "Do 20 pushups during a craving.",
      "Save the money you would have spent.", "Practice 'Box Breathing' for 5 minutes.", "Avoid social groups that smoke.",
      "Visit a sauna or take a hot bath.", "Run for 10 minutes at a steady pace.", "Eat a fruit whenever you feel restless.",
      "Meditate on the purity of your lungs.", "Join a fitness class.", "Notice your increased energy levels.",
      "Celebrate your improved skin and breath.", "Plan a reward with the money saved.", "Breathe deeply and feel the freedom."
    ]
  },
  social_media: {
    name: "Digital Minimalism",
    phases: [
      { name: "The Unplug", focus: "Breaking the scroll loop and notification addiction." },
      { name: "Deep Focus", focus: "Reclaiming your attention span and concentration." },
      { name: "Intentional Living", focus: "Using technology as a tool, not a master." }
    ],
    tasks: [
      "Delete most-addictive app for 24h.", "Disable ALL non-human notifications.", "Set phone to grayscale mode.",
      "Leave phone in another room while eating.", "Read for 30 minutes without interruption.", "Go for a walk without headphones.",
      "Audit who you follow - keep only value.", "Establish a 'No Screens after 9 PM' rule.", "Write 3 goals for your regained time.",
      "Install a screen time tracker.", "Practice 'Boredom' - sit for 5 mins doing nothing.", "Engage in a hands-on hobby (craft/art).",
      "Meet someone in person for tea/coffee.", "Do a digital declutter of your desktop.", "Organize your physical workspace.",
      "Avoid 'infinite scroll' sites entirely.", "Set a timer for 15 mins of social use.", "Reflect on how your focus has improved.",
      "Spend a full day completely offline.", "Write your 'Digital Manifesto'.", "Enjoy your reclaimed mental space."
    ]
  }
};

const STORIES = [
  {
    title: "The Chariot of the Body",
    content: "Imagine your body as a chariot, your senses as the horses, and your mind as the reins. If the reins are loose, the horses will run wild toward destruction. But with a steady hand (the Intellect), the horses lead you to victory. Today, you are the driver.",
    source: "Katha Upanishad"
  },
  {
    title: "The King and the Poison",
    content: "A King was addicted to a sweet but poisonous drink. Every day he felt weaker. One day, he threw the cup away. He suffered for 7 days, but on the 8th day, he realized he could finally see the sun clearly for the first time in years. Your 8th day is coming.",
    source: "Ancient Wisdom"
  },
  {
    title: "The Two Wolves",
    content: "A grandfather tells his grandson: 'There are two wolves fighting inside me. One is addiction, anger, and greed. The other is peace, love, and discipline.' The grandson asks: 'Which one wins?' The grandfather replies: 'The one I feed.'",
    source: "Indigenous Wisdom"
  }
];

const SHLOKS = [
  {
    sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।",
    text: "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions.",
    author: "Bhagavad Gita 2.47",
    challenge: "Focus on your effort today, not the long-term goal.",
    message: "Recovery is your duty. Focus on the right action right now."
  },
  {
    sanskrit: "ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते।",
    text: "While contemplating on the objects of the senses, one develops attachment to them.",
    author: "Bhagavad Gita 2.62",
    challenge: "Observe your thoughts. Label urges as 'just a thought'.",
    message: "The cycle of addiction begins in the mind. Break it by observing."
  },
  {
    sanskrit: "यतो यतो निश्चरति मनश्चञ्चलमस्थिरम्।",
    text: "From whatever causes the restless and unsteady mind wanders away, bring it back.",
    author: "Bhagavad Gita 6.26",
    challenge: "Whenever mind wanders, bring it back to your breath.",
    message: "Strength is in bringing the mind back, again and again."
  },
  {
    sanskrit: "योगस्थ: कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।",
    text: "Be steadfast in yoga, O Arjuna. Perform your duty and abandon all attachment to success or failure.",
    author: "Bhagavad Gita 2.48",
    challenge: "Don't judge today as 'good' or 'bad'. Just be steady.",
    message: "Consistency is your greatest weapon. Stay steady in your path."
  }
];

const RESOURCE_LIBRARY = [
  { type: 'Movie', title: 'The Pursuit of Happyness', query: 'The Pursuit of Happyness trailer', reason: 'A story of ultimate perseverance and internal strength.' },
  { type: 'Movie', title: 'Limitless', query: 'Limitless movie breakdown', reason: 'Explore the potential of a focused, addiction-free mind.' },
  { type: 'Book', title: 'Atomic Habits by James Clear', query: 'Atomic Habits summary James Clear', reason: 'The gold standard for understanding how to break bad habits.' },
  { type: 'Book', title: 'Can\'t Hurt Me by David Goggins', query: 'David Goggins motivation', reason: 'Master your mind to overcome any physical or mental hurdle.' },
  { type: 'Music', title: 'Deep Focus - Lofi Hip Hop', query: 'lofi hip hop radio beats to relax/study to', reason: 'Perfect for keeping the mind calm during high-stress hours.' },
  { type: 'Music', title: 'The Bhagavad Gita Chant', query: 'Bhagavad Gita full chant with meaning', reason: 'Sacred vibrations to ground your nervous system.' }
];

const AFFIRMATIONS = [
  "I am the architect of my own neuro-chemistry.", "My discipline is my freedom.", "I am more than my momentary desires.",
  "Every breath I take clears my path.", "I am reclaiming my focus and my life.", "My strength grows in the silence of resistance.",
  "I choose mastery over mindless consumption.", "I am the master of the impulses of my body.", "My potential is infinite, my resolve is iron.",
  "I am building a brain that thrives on reality.", "I am free from the chains of digital shadows.", "My energy is returning, my mind is sharpening.",
  "I am the captain of my soul and my senses.", "Every 'No' to an urge is a 'Yes' to my future.", "I am becoming the version of myself I respect.",
  "I am not my past habits; I am my current actions.", "My mind is a fortress of peace and power.", "I am at home in my own skin, without escape.",
  "I am the light that observes the storm.", "My journey is a testament to human willpower.", "I am finally, completely, and eternally free."
];

const TIPS = [
  "Dopamine reset: Avoid all screens for the first 60 mins of your day.",
  "Biological Hack: Cold water on the face activates the Vagus nerve instantly.",
  "Nutrition Fact: Magnesium-rich foods reduce the intensity of cravings.",
  "Brain Fact: Your prefrontal cortex is physically thickening today.",
  "Sleep Hack: No blue light after 9 PM to ensure deep REM recovery.",
  "Movement Fact: 10 mins of sunlight resets your circadian rhythm.",
  "Psychology: Label the urge as 'The Addict Voice' to separate it from YOU.",
  "Neuro-Fact: Deep breathing for 3 mins floods the brain with oxygen-rich blood.",
  "Habit Fact: Replace the 'Cue' with a physical movement to break the loop.",
  "Cellular Fact: Your lungs/brain are flushing out toxins at peak rate today.",
  "Dopamine Fact: True joy comes from achievement, not cheap stimulation.",
  "Mindset: View discomfort as 'The feeling of the brain re-wiring itself'.",
  "Focus Hack: Work in 25-min blocks to protect your attention span.",
  "Hydration: 3 liters of water is required to flush metabolic waste.",
  "Social Hack: Surround yourself with people who discuss ideas, not habits.",
  "Spirituality: Practice being the 'Observer' of your thoughts today.",
  "Biotic Fact: A healthy gut (probiotics) improves mental resilience.",
  "Stress Fact: High cortisol triggers urges. Meditate to lower it.",
  "Vision Fact: Focus on a distant object for 1 min to relax eye nerves.",
  "Identity: You are not 'quitting', you are 'reclaiming' your power.",
  "Victory: You have reached the peak. Your new life starts now."
];

const PROTOCOL_BANKS = {
  morning: [
    "5-min Box Breathing (In 4, Hold 4, Out 4, Hold 4)", "Cold water splash (20 times) + 2 min Grounding", "10-min Anulom Vilom Pranayama", 
    "The Wim Hof Method (30 deep breaths + 1 min hold)", "Gratitude Sun-Gazing (2 mins)", "5-min Progressive Muscle Relaxation",
    "Tibetan Rites (5 dynamic movements)", "Diaphragmatic Breathing with hand on heart", "3-min Kapalbhati (Skull Shining Breath)",
    "Joint Mobility Routine (Neck to Ankles)", "Nadi Shodhana for mental clarity", "The 'Inner Fire' breath (Tummo style)",
    "60-second balance practice (Tree Pose)", "Vagus Nerve stimulation (Ear massage + humming)", "Hydration ritual + mindful silence",
    "Stretching the spine in 6 directions", "Positive Visualization (First 5 mins)", "Alternate Nostril Breathing with breath retention",
    "The 4-7-8 Breath for total nervous system calm", "Child's Pose + 10 deep belly breaths", "Full body shake-out (90 seconds)"
  ],
  nutrition: {
    breakfast: [
      "2 Boiled Eggs + 1 Avocado (High Healthy Fats)", "Steel-cut Oats with Chia seeds and Walnut", "Greek Yogurt with Blueberries and Flaxseeds",
      "Paneer Bhurji with Spinach and Almonds", "Smoothie: Spinach, Ginger, Protein, Maca", "Quinoa Upma with mixed vegetables",
      "Almond Butter on sourdough + Pumpkin seeds", "Tofu Scramble with Turmeric and Pepper", "Chia Seed Pudding (set overnight)",
      "Mixed Nut Granola with unsweetened Milk", "Lentil Crepe (Dosa) with Coconut Chutney", "Scrambled Eggs with smoked Salmon/Spinach",
      "Apple slices with Peanut Butter and Cinnamon", "Baked Sweet Potato with Tahini", "Protein Pancakes (Oat & Banana base)",
      "Cottage Cheese with Pineapple and Hemp seeds", "Mushroom & Spinach Omelet", "Vegetable Poha with roasted Peanuts",
      "Buckwheat Porridge with sliced Almonds", "Hummus with Cucumber and Whole Grain crackers", "Boiled Chickpeas (Chana) with lemon and chat"
    ],
    lunch: [
      "Grilled Salmon with Steamed Broccoli", "Lentil Soup (Dal) with Brown Rice", "Chicken/Tofu Salad with Lemon Vinaigrette",
      "Roasted Chickpea Wrap with Hummus", "Quinoa & Black Bean Buddha Bowl", "Stuffed Bell Peppers with Minced Lean Meat/Soya",
      "Mediterranean Platter: Olives, Feta, Greens", "Mung Bean Sprouts with Lime and Cilantro", "Baked Sea Bass with Asparagus",
      "Whole Wheat Pasta with Pesto and Walnuts", "Spinach & Ricotta Salad with Pine Nuts", "Turkey/Tofu Stir-fry with bok choy",
      "Lentil Bolognese over Zucchini Noodles", "Shrimp/Tofu Skewers with Grilled Peppers", "Sweet Potato and Chickpea Curry",
      "Falafel with Tabouleh and Greens", "Nicoise Salad (Tuna/Egg/Beans)", "Mushroom Risotto with Pearl Barley",
      "Avocado and Egg Salad with Seeds", "Tandoori Chicken/Paneer with Cauliflower Rice", "Lentil Pasta with marinara and Basil"
    ],
    dinner: [
      "Baked Cod with Zucchini and Garlic", "Lentil Stew with Sweet Potato", "Tofu Stir-fry with Ginger and Sesame",
      "Grilled Asparagus and Mushroom Plate", "Pumpkin Soup with roasted seeds", "Baked Chicken Breast with Rosemary",
      "Stuffed Eggplant with Quinoa", "Cauliflower Steaks with Tahini sauce", "Miso Soup with Seaweed and Tofu",
      "Grilled Zucchini and Halloumi salad", "Vegetable Minestrone (No Pasta)", "Baked Trout with Lemon and Dill",
      "Roasted Root Vegetables with Thyme", "Chickpea Flour Omelet with Veggies", "Grilled Turkey Burger (No Bun) with salad",
      "Cucumber and Avocado Soup (Chilled)", "Steamed Veggie Dumplings with Ginger soy", "Baked Tempeh with Green Beans",
      "Sautéed Spinach and Mushrooms with Garlic", "Boiled Eggs and Avocado with salad", "Light Fish Curry with Coconut Milk"
    ]
  },
  movement: [
    "20 Pushups + 30 Squats + 1 min Plank", "15-min Surya Namaskar (Sun Salutations)", "10-min HIIT: Burpees and Mountain Climbers",
    "Brisk Walking (20 mins) + 5-min Jog", "Stair Climbing (10 floors total)", "Shadow Boxing (5 mins) + 50 Jumping Jacks",
    "Vinyasa Flow Yoga (Heart Opening focus)", "Bodyweight Circuit: Lunges, Dips, Leg Raises", "30-min Steady State Cycling or Swimming",
    "Yoga: Warrior I, II, and III (Stability)", "2 min Wall Sit + 1 min Side Plank (each side)", "Dance/Freestyle Movement (15 mins)",
    "Tabata: 20s work / 10s rest (8 rounds)", "Yoga: Forward Folds and Inversions (Calm)", "50 Squats (5 sets of 10) + 2 min Rest",
    "Bear Crawls + Crab Walks (Room length x 5)", "Resistance Band full body workout", "Yoga: Twists and Hip Openers (Detox)",
    "Plank Challenge: Hold as long as possible", "Jumping Rope (5 mins) + Dynamic Stretching", "Full Body Mobility Flow (Neck to Toe)"
  ],
  environment: [
    "Clean your digital desktop (delete 10 files)", "Remove all trash/clutter from your bedroom", "Organize one drawer in your desk",
    "Clean your phone screen and laptop keyboard", "Change your room lighting (Warm light for night)", "Add a plant or fresh water to your desk",
    "Delete 3 apps that trigger mindless scrolling", "Organize your cables and chargers", "Wipe down all mirrors and glass surfaces",
    "Refresh your bedding/pillow covers", "Clear your nightstand of everything except water", "Organize your shoes and closet",
    "Setup a 'Focus Station' (Only work, no play)", "Spray a calming scent (Lavender/Eucalyptus)", "Declutter your kitchen counter",
    "Organize your bathroom cabinet", "Remove one unnecessary furniture item", "Clean your windows for more natural light",
    "Organize your bookshelf by color or size", "Create a 'Vision Board' or goal wall", "Clean your gym/movement equipment"
  ]
};

function generatePlan(data) {
  const addictionType = data.addiction_type?.toLowerCase() || 'porn';
  const type = ADDICTION_KNOWLEDGE[addictionType] || ADDICTION_KNOWLEDGE.porn;
  
  const plan = {
    overview: `CLINICAL MASTER PROTOCOL: This 21-day roadmap is a proprietary bio-optimization system for ${type.name} recovery. We utilize a 12-point daily SOP to rewire your neuro-circuitry and restore physical vitality.`,
    milestones: type.phases.map((p, i) => ({
      day: (i + 1) * 7,
      title: p.name,
      description: p.focus
    })),
    days: []
  };

  for (let i = 1; i <= 21; i++) {
    const idx = (i - 1) % 21;
    const phaseIndex = Math.floor((i - 1) / 7);
    const phase = type.phases[phaseIndex];
    const mission = type.tasks[idx] || type.tasks[0];

    const detailedTask = `12-POINT CLINICAL PROTOCOL:
1. MORNING (07:00): ${PROTOCOL_BANKS.morning[idx]}
2. HYDRATION: 500ml warm water + pinch of sea salt (Electrolyte Reset).
3. NUTRITION (Breakfast): ${PROTOCOL_BANKS.nutrition.breakfast[idx]}
4. VITALITY (Movement): ${PROTOCOL_BANKS.movement[idx]}
5. DIGITAL AUDIT: ${idx % 2 === 0 ? 'No screens for first 90 mins' : 'Delete one distracting browser bookmark'}.
6. THE MISSION: ${mission}
7. LUNCH: ${PROTOCOL_BANKS.nutrition.lunch[idx]}
8. DEEP WORK: 45 mins of focused learning on ${idx % 2 === 0 ? 'Neuroscience' : 'Stoicism'}.
9. DINNER: ${PROTOCOL_BANKS.nutrition.dinner[idx]}
10. ENVIRONMENT: ${PROTOCOL_BANKS.environment[idx]}
11. GRATITUDE: Name 3 specific things that went well today.
12. NIGHT RITUAL: 5 mins of gratitude journaling + No screens 1h before bed.`;

    plan.days.push({
      day: i,
      theme: `${phase.name} - Level ${i}`,
      task: detailedTask,
      affirmation: AFFIRMATIONS[idx],
      tip: TIPS[idx],
      emergency_strategy: i < 10 ? "30s Cold Shower or 20 Pushups." : "5-min Journaling or Call a Mentor."
    });
  }

  return plan;
}

function getMotivation(day, mood) {
  const shlok = SHLOKS[day % SHLOKS.length];
  const story = STORIES[day % STORIES.length];
  
  return {
    quote: { text: shlok.text, author: shlok.author, sanskrit: shlok.sanskrit },
    message: shlok.message,
    story: story,
    challenge: shlok.challenge,
    library: RESOURCE_LIBRARY, // Add the full library
    recommendations: {
      youtube: { title: "Dopamine Detox Mastery", search_query: "dopamine detox guide", reason: "Understand your brain's chemistry." },
      song: { title: "Peaceful Meditation", artist: "RAI Engine", reason: "Calm your nervous system." }
    }
  };
}

module.exports = { generatePlan, getMotivation, SHLOKS, RESOURCE_LIBRARY };
