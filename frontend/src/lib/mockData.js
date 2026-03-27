const projects = [
    {
        id: "PRJ-001",
        title: "Highway Expansion Project",
        category: "Transport",
        location: "Mumbai",
        department: "Ministry of Road Transport",
        budget: 5000000,
        status: "ongoing", // ongoing, bidding, completed
        lat: 19.0760,
        lng: 72.8777,
        progress: 60,
        totalMilestones: 5,
        completedMilestones: 3,
        currentPhase: "Asphalting Main Stretch",
        description: "Expansion of the eastern highway to 6 lanes to reduce traffic congestion and improve logistics transit times.",
        timelineStart: "2025-01-10",
        timelineEnd: "2026-06-30",
        fundsReleased: 3000000,
        milestones: [
            { id: 1, title: "Survey and Site Clearance", status: "completed", date: "2025-02-15", budget: 500000, desc: "Topographical survey, soil testing, and clearing of encroachments." },
            { id: 2, title: "Earthworks and Grading", status: "completed", date: "2025-06-01", budget: 1000000, desc: "Levelling the ground for base layers and ensuring drainage paths." },
            { id: 3, title: "Sub-base and Base Course", status: "completed", date: "2025-10-15", budget: 1500000, desc: "Laying aggregates, compaction, and applying prime coat." },
            { id: 4, title: "Asphalting Main Stretch", status: "ongoing", date: "2026-02-28", budget: 1200000, desc: "Bitumen application and final surface finishing." },
            { id: 5, title: "Signage and Handover", status: "pending", date: "2026-06-30", budget: 800000, desc: "Lane marking, crash barriers installation, and official hand-over." }
        ],
        transactions: [
            { hash: "0x3a9cc2...8f2a1b", amount: 500000, date: "2025-02-16", to: "0x12a9...bc4" },
            { hash: "0x7b11d9...4d90ef", amount: 1000000, date: "2025-06-05", to: "0x12a9...bc4" },
            { hash: "0x9c22e4...1e55fa", amount: 1500000, date: "2025-10-20", to: "0x12a9...bc4" }
        ],
        proofs: [
            { img: "https://images.unsplash.com/photo-1541888086425-d81bb192a065?w=600&q=80", hash: "QmX9aBcQf2G...", date: "2025-02-15" },
            { img: "https://images.unsplash.com/photo-1579273167104-548773e3bc24?w=600&q=80", hash: "QmY2dEfR3H...", date: "2025-06-01" },
            { img: "https://images.unsplash.com/photo-1621255562719-7975fdeda3b7?w=600&q=80", hash: "QmZ3gHiS4J...", date: "2025-10-15" }
        ],
        events: [
            { date: "2024-11-01", title: "Project Approved", desc: "Funds allocated to smart contract escrow by the Ministry." },
            { date: "2024-12-15", title: "Contractor Assigned", desc: "L&T Infrastructure selected via open decentralized bidding." },
            { date: "2025-02-16", title: "Milestone 1 Payment", desc: "₹500k released automatically upon Oracle verification." },
            { date: "2025-06-05", title: "Milestone 2 Payment", desc: "₹1M released upon successful on-chain audit." }
        ]
    },
    {
        id: "PRJ-002",
        title: "City Water Treatment Plant",
        category: "Public Utility",
        location: "New Delhi",
        department: "Dept of Water Supply",
        budget: 2500000,
        status: "bidding",
        lat: 28.6139,
        lng: 77.2090,
        progress: 0,
        totalMilestones: 4,
        completedMilestones: 0,
        currentPhase: "Tender Open",
        description: "Construction of a 50 MLD water treatment facility to service southern districts, utilizing advanced reverse osmosis.",
        timelineStart: "TBD",
        timelineEnd: "TBD",
        fundsReleased: 0,
        milestones: [
            { id: 1, title: "Design & Approvals", status: "pending", date: "TBD", budget: 300000, desc: "Finalize blueprints and environmental clearances." },
            { id: 2, title: "Civil Works", status: "pending", date: "TBD", budget: 1000000, desc: "Concrete structures, tanks, and administration buildings." },
            { id: 3, title: "Equipment Installation", status: "pending", date: "TBD", budget: 900000, desc: "Pumps, filters, and electrical substations." },
            { id: 4, title: "Testing & Commissioning", status: "pending", date: "TBD", budget: 300000, desc: "Quality checks, pipeline flushing, and grid integration." }
        ],
        transactions: [],
        proofs: [],
        events: [
            { date: "2026-03-01", title: "Project Created", desc: "Budget locked in smart contract ledger. Tenders invited." },
            { date: "2026-03-15", title: "Bidding Opened", desc: "RFP available on blockchain portal. Closing in 30 days." }
        ]
    },
    {
        id: "PRJ-003",
        title: "District Hospital Upgrades",
        category: "Healthcare",
        location: "Pune",
        department: "Ministry of Health",
        budget: 1200000,
        status: "completed",
        lat: 18.5204,
        lng: 73.8567,
        progress: 100,
        totalMilestones: 3,
        completedMilestones: 3,
        currentPhase: "Fully Operational",
        description: "Modernization of ICU ward and addition of 50 new oxygen beds, enhancing emergency response capabilities.",
        timelineStart: "2025-05-01",
        timelineEnd: "2025-12-15",
        fundsReleased: 1200000,
        milestones: [
            { id: 1, title: "Medical Procurement", status: "completed", date: "2025-06-15", budget: 500000, desc: "Ordering 50 beds, ventilators, and vital monitors." },
            { id: 2, title: "Ward Renovation", status: "completed", date: "2025-09-30", budget: 400000, desc: "Civil and electrical upgrades, HVAC installation." },
            { id: 3, title: "Installation & Training", status: "completed", date: "2025-12-10", budget: 300000, desc: "Setup, calibration, and staff training protocols." }
        ],
        transactions: [
             { hash: "0x8a2bb3...3b1d7f", amount: 500000, date: "2025-06-16", to: "0x44fa...e82" },
             { hash: "0x3d4ee5...9a8c12", amount: 400000, date: "2025-10-02", to: "0x44fa...e82" },
             { hash: "0x1f7ff8...6c5e34", amount: 300000, date: "2025-12-12", to: "0x44fa...e82" }
        ],
        proofs: [
             { img: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=600&q=80", hash: "QmApQ1xN2M...", date: "2025-06-15" },
             { img: "https://images.unsplash.com/photo-1519494026892-80bbd0d6c161?w=600&q=80", hash: "QmBvX9zP3K...", date: "2025-12-10" }
        ],
        events: [
            { date: "2025-04-10", title: "Escrow Funded", desc: "Total hospital budget committed to smart contract." },
            { date: "2025-12-15", title: "Project Completed", desc: "All funds released. Final public health audit clear." }
        ]
    },
    {
        id: "PRJ-004",
        title: "Metro Line 3 Extension",
        category: "Transport",
        location: "Bengaluru",
        department: "Ministry of Urban Dev",
        budget: 8000000,
        status: "ongoing",
        lat: 12.9716,
        lng: 77.5946,
        progress: 40,
        totalMilestones: 5,
        completedMilestones: 2,
        currentPhase: "Tunneling",
        description: "Extending the existing metro network by 15 kms to connect tech parks.",
        timelineStart: "2024-05-01",
        timelineEnd: "2027-12-30",
        fundsReleased: 3200000,
        milestones: [
            { id: 1, title: "Land Acquisition", status: "completed", date: "2024-08-01", budget: 1500000, desc: "Securing property for stations." },
            { id: 2, title: "Utility Shifting", status: "completed", date: "2024-12-01", budget: 1700000, desc: "Moving power lines and pipes." },
            { id: 3, title: "Tunnel Boring", status: "ongoing", date: "2025-10-01", budget: 2000000, desc: "Underground excavation." },
            { id: 4, title: "Track Laying", status: "pending", date: "2026-06-01", budget: 1800000, desc: "Installing rails." },
            { id: 5, title: "Testing", status: "pending", date: "2027-12-01", budget: 1000000, desc: "Safety runs." }
        ],
        transactions: [
             { hash: "0x1b2c3d...3fj29k", amount: 1500000, date: "2024-08-05", to: "0x99dd...111" },
             { hash: "0x4e5f6g...8h27sk", amount: 1700000, date: "2024-12-05", to: "0x99dd...111" }
        ],
        proofs: [
             { img: "https://images.unsplash.com/photo-1590497558661-8079cc6a4b15?w=600&q=80", hash: "QmMetroXyz...", date: "2024-12-01" }
        ],
        events: []
    },
    {
        id: "PRJ-005",
        title: "Solar Park Phase II",
        category: "Energy",
        location: "Jodhpur",
        department: "Ministry of Renewable Energy",
        budget: 4500000,
        status: "completed",
        lat: 26.2389,
        lng: 73.0243,
        progress: 100,
        totalMilestones: 3,
        completedMilestones: 3,
        currentPhase: "Operational",
        description: "Adding 100MW capacity to the regional solar farm array.",
        timelineStart: "2023-01-10",
        timelineEnd: "2024-06-30",
        fundsReleased: 4500000,
        milestones: [
            { id: 1, title: "Panel Procurement", status: "completed", date: "2023-05-01", budget: 2000000, desc: "Ordering solar modules." },
            { id: 2, title: "Installation", status: "completed", date: "2024-01-01", budget: 1500000, desc: "Mounting and wiring." },
            { id: 3, title: "Grid Sync", status: "completed", date: "2024-06-01", budget: 1000000, desc: "Connecting to state grid." }
        ],
        transactions: [],
        proofs: [
            { img: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80", hash: "QmSolarPnl...", date: "2024-06-01" }
        ],
        events: []
    },
    {
        id: "PRJ-006",
        title: "Rural Broadband Initiative",
        category: "Telecom",
        location: "Patna",
        department: "Dept of Telecommunications",
        budget: 1500000,
        status: "bidding",
        lat: 25.5941,
        lng: 85.1376,
        progress: 0,
        totalMilestones: 2,
        completedMilestones: 0,
        currentPhase: "RFP Review",
        description: "Laying optical fiber cables to connect 500 remote villages.",
        timelineStart: "TBD",
        timelineEnd: "TBD",
        fundsReleased: 0,
        milestones: [
            { id: 1, title: "Cable Laying", status: "pending", date: "TBD", budget: 1000000, desc: "Trenching and laying cables." },
            { id: 2, title: "Node Setup", status: "pending", date: "TBD", budget: 500000, desc: "Activating network nodes." }
        ],
        transactions: [],
        proofs: [],
        events: []
    },
    {
        id: "PRJ-007",
        title: "Govt School Digitization",
        category: "Education",
        location: "Chennai",
        department: "Ministry of Education",
        budget: 900000,
        status: "ongoing",
        lat: 13.0827,
        lng: 80.2707,
        progress: 50,
        totalMilestones: 2,
        completedMilestones: 1,
        currentPhase: "Lab Setup",
        description: "Providing smart boards and computer labs to 50 public schools.",
        timelineStart: "2025-06-01",
        timelineEnd: "2026-03-01",
        fundsReleased: 450000,
        milestones: [
            { id: 1, title: "Hardware Procurement", status: "completed", date: "2025-09-01", budget: 450000, desc: "Buying laptops and smartboards." },
            { id: 2, title: "Installation", status: "ongoing", date: "2026-03-01", budget: 450000, desc: "Setting up in classrooms." }
        ],
        transactions: [],
        proofs: [
            { img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80", hash: "QmEduTech...", date: "2025-09-01" }
        ],
        events: []
    },
    {
        id: "PRJ-008",
        title: "Smart Traffic Management",
        category: "Transport",
        location: "Hyderabad",
        department: "Traffic Police Dept",
        budget: 2200000,
        status: "bidding",
        lat: 17.3850,
        lng: 78.4867,
        progress: 0,
        totalMilestones: 3,
        completedMilestones: 0,
        currentPhase: "Vendor Selection",
        description: "AI-powered traffic light synchronization for 100 major junctions.",
        timelineStart: "TBD",
        timelineEnd: "TBD",
        fundsReleased: 0,
        milestones: [
            { id: 1, title: "Camera Install", status: "pending", date: "TBD", budget: 1000000, desc: "Setting up ANPR cameras." },
            { id: 2, title: "Control Room Setup", status: "pending", date: "TBD", budget: 800000, desc: "Building the monitoring center." },
            { id: 3, title: "AI Integration", status: "pending", date: "TBD", budget: 400000, desc: "Software deployment." }
        ],
        transactions: [],
        proofs: [],
        events: []
    },
    {
        id: "PRJ-009",
        title: "River Cleaning Project",
        category: "Environment",
        location: "Varanasi",
        department: "Ministry of Environment",
        budget: 6000000,
        status: "completed",
        lat: 25.3176,
        lng: 82.9739,
        progress: 100,
        totalMilestones: 4,
        completedMilestones: 4,
        currentPhase: "Maintenance",
        description: "Dredging and setting up effluent treatment plants along the river banks.",
        timelineStart: "2021-01-01",
        timelineEnd: "2024-12-31",
        fundsReleased: 6000000,
        milestones: [
            { id: 1, title: "Initial Survey", status: "completed", date: "2021-06-01", budget: 500000, desc: "Mapping pollution hotspots." },
            { id: 2, title: "Dredging", status: "completed", date: "2022-12-01", budget: 2000000, desc: "Removing solid waste." },
            { id: 3, title: "Treatment Plants", status: "completed", date: "2024-06-01", budget: 3000000, desc: "Building 3 new ETPs." },
            { id: 4, title: "Final Audit", status: "completed", date: "2024-12-30", budget: 500000, desc: "Water quality testing." }
        ],
        transactions: [],
        proofs: [
            { img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80", hash: "QmRiverGng...", date: "2024-12-30" }
        ],
        events: []
    },
    {
        id: "PRJ-010",
        title: "Public Library Revamp",
        category: "Education",
        location: "Kolkata",
        department: "Dept of Culture",
        budget: 400000,
        status: "completed",
        lat: 22.5726,
        lng: 88.3639,
        progress: 100,
        totalMilestones: 2,
        completedMilestones: 2,
        currentPhase: "Open to Public",
        description: "Renovating the heritage city library and digitizing archives.",
        timelineStart: "2024-02-01",
        timelineEnd: "2024-11-30",
        fundsReleased: 400000,
        milestones: [
            { id: 1, title: "Civil Works", status: "completed", date: "2024-06-01", budget: 200000, desc: "Structural repairs." },
            { id: 2, title: "Digitization", status: "completed", date: "2024-11-20", budget: 200000, desc: "Scanning ancient texts." }
        ],
        transactions: [],
        proofs: [
            { img: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=600&q=80", hash: "QmLibKol...", date: "2024-11-20" }
        ],
        events: []
    },
    {
        id: "PRJ-011",
        title: "Oxygen Generation Plant",
        category: "Healthcare",
        location: "Ahmedabad",
        department: "Ministry of Health",
        budget: 3500000,
        status: "ongoing",
        lat: 23.0225,
        lng: 72.5714,
        progress: 75,
        totalMilestones: 4,
        completedMilestones: 3,
        currentPhase: "Testing Mode",
        description: "Setting up a high-capacity PSA oxygen plant for the civil hospital.",
        timelineStart: "2025-08-01",
        timelineEnd: "2026-05-01",
        fundsReleased: 2500000,
        milestones: [
            { id: 1, title: "Facility Prep", status: "completed", date: "2025-09-01", budget: 500000, desc: "Building the shed." },
            { id: 2, title: "Equipment Delivery", status: "completed", date: "2025-11-01", budget: 1500000, desc: "Importing compressors." },
            { id: 3, title: "Assembly", status: "completed", date: "2026-02-01", budget: 500000, desc: "Connecting systems." },
            { id: 4, title: "Certification", status: "ongoing", date: "2026-05-01", budget: 1000000, desc: "Purity testing and clearance." }
        ],
        transactions: [],
        proofs: [
            { img: "https://images.unsplash.com/photo-1629813354972-e565ad84c2a5?w=600&q=80", hash: "QmOxyMed...", date: "2026-02-01" }
        ],
        events: []
    }
];

const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
};

// Comprehensive list of Indian cities for autocomplete
const indianCities = [
    "Agartala","Agra","Ahmedabad","Aizawl","Ajmer","Aligarh","Allahabad","Amravati",
    "Amritsar","Anantapur","Araria","Arambagh","Araria","Aravalli","Arrah","Aruppukkottai",
    "Asansol","Aurangabad","Ayodhya","Bagaha","Balaghat","Balasore","Bareilly","Bathinda",
    "Belagavi","Bengaluru","Bhagalpur","Bharatpur","Bhopal","Bhubaneswar","Bikaner",
    "Bilaspur","Bokaro","Chandigarh","Chennai","Coimbatore","Cuttack","Dahod","Darbhanga",
    "Dehradun","Delhi","Dhanbad","Dibrugarh","Dispur","Durgapur","Erode","Faridabad",
    "Firozabad","Gandhinagar","Gaya","Ghaziabad","Gorakhpur","Gulbarga","Guntur",
    "Gurgaon","Guwahati","Gwalior","Hassan","Hisar","Hubballi","Hyderabad","Imphal",
    "Indore","Itanagar","Jabalpur","Jaipur","Jalandhar","Jammu","Jamnagar","Jamshedpur",
    "Jhansi","Jodhpur","Jorhat","Kakinada","Kalyan","Kanpur","Karnal","Kochi",
    "Kohima","Kolhapur","Kolkata","Kota","Kozhikode","Kurnool","Leh","Lucknow",
    "Ludhiana","Madurai","Mangaluru","Mathura","Meerut","Mumbai","Murshidabad",
    "Muzaffarpur","Mysuru","Nagpur","Nanded","Nashik","New Delhi","Noida","Panaji",
    "Patna","Prayagraj","Pune","Raipur","Rajkot","Ranchi","Salem","Shillong",
    "Shimla","Silchar","Siliguri","Srinagar","Surat","Thane","Thiruvananthapuram",
    "Tiruchirappalli","Tiruppur","Udaipur","Ujjain","Vadodara","Varanasi","Vijayawada",
    "Visakhapatnam","Warangal","Yamunanagar"
].sort();

export { projects, formatCurrency, indianCities, SIDEBAR_CONFIG };