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

const initLocationAutocomplete = () => {
    const input = document.getElementById('filterLocation');
    const list  = document.getElementById('locationSuggestions');
    let activeIndex = -1;

    const showSuggestions = (query) => {
        const q = query.toLowerCase();
        if (!q) { list.classList.remove('open'); list.innerHTML = ''; return; }

        const matches = indianCities.filter(c => c.toLowerCase().startsWith(q)).slice(0, 8);
        if (!matches.length) { list.classList.remove('open'); list.innerHTML = ''; return; }

        list.innerHTML = matches.map(city =>
            `<li data-city="${city}"><span>${city}</span></li>`
        ).join('');
        activeIndex = -1;
        list.classList.add('open');
    };

    input.addEventListener('input', (e) => {
        showSuggestions(e.target.value);
        filterProjects();
    });

    input.addEventListener('keydown', (e) => {
        const items = list.querySelectorAll('li');
        if (!items.length) return;
        if (e.key === 'ArrowDown') {
            activeIndex = Math.min(activeIndex + 1, items.length - 1);
        } else if (e.key === 'ArrowUp') {
            activeIndex = Math.max(activeIndex - 1, 0);
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            selectCity(items[activeIndex].dataset.city);
            return;
        } else if (e.key === 'Escape') {
            list.classList.remove('open');
            return;
        }
        items.forEach((li, i) => li.classList.toggle('active', i === activeIndex));
    });

    list.addEventListener('mousedown', (e) => {
        const li = e.target.closest('li');
        if (li) selectCity(li.dataset.city);
    });

    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !list.contains(e.target)) {
            list.classList.remove('open');
        }
    });

    const selectCity = (city) => {
        input.value = city;
        list.classList.remove('open');
        list.innerHTML = '';
        filterProjects();
    };
};

let map;
let markersLayer;

const initMap = () => {
    map = L.map('map', {
        minZoom: 2,
        worldCopyJump: false
    }).setView([22.5, 78.5], 4); 
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20,
        noWrap: true
    }).addTo(map);
    markersLayer = L.layerGroup().addTo(map);
};

const renderStats = (data) => {
    const bar = document.getElementById('statsBar');
    if (!bar) return;
    const total = data.length;
    const totalBudget = data.reduce((sum, p) => sum + p.budget, 0);
    const totalReleased = data.reduce((sum, p) => sum + p.fundsReleased, 0);
    const ongoing  = data.filter(p => p.status === 'ongoing').length;
    const completed = data.filter(p => p.status === 'completed').length;
    const bidding  = data.filter(p => p.status === 'bidding').length;

    bar.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon grey"><i class="fa-solid fa-folder"></i></div>
            <div class="stat-info"><span>Total Projects</span><strong>${total}</strong></div>
        </div>
        <div class="stat-card">
            <div class="stat-icon blue"><i class="fa-solid fa-coins"></i></div>
            <div class="stat-info"><span>Total Budget</span><strong>${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 1 }).format(totalBudget)}</strong></div>
        </div>
        <div class="stat-card">
            <div class="stat-icon green"><i class="fa-solid fa-arrow-right-from-bracket"></i></div>
            <div class="stat-info"><span>Funds Released</span><strong>${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 1 }).format(totalReleased)}</strong></div>
        </div>
        <div class="stat-card">
            <div class="stat-icon blue"><i class="fa-solid fa-spinner"></i></div>
            <div class="stat-info"><span>Ongoing</span><strong>${ongoing}</strong></div>
        </div>
        <div class="stat-card">
            <div class="stat-icon red"><i class="fa-solid fa-gavel"></i></div>
            <div class="stat-info"><span>Bidding</span><strong>${bidding}</strong></div>
        </div>
        <div class="stat-card">
            <div class="stat-icon green"><i class="fa-solid fa-check"></i></div>
            <div class="stat-info"><span>Completed</span><strong>${completed}</strong></div>
        </div>
    `;
};

const getStatusColor = (status) => {
    if(status === 'ongoing') return 'var(--status-ongoing)';
    if(status === 'bidding') return 'var(--status-bidding)';
    if(status === 'completed') return 'var(--status-completed)';
    return 'var(--status-notstarted)';
};

const renderMapMarkers = (data) => {
    if(!markersLayer) return;
    markersLayer.clearLayers();
    
    data.forEach(p => {
        if(p.lat && p.lng) {
            const color = getStatusColor(p.status);
            
            const markerHtml = `
              <div class="gps-pin-container">
                <div class="gps-pin" style="background-color: ${color};"></div>
                <div class="gps-pin-dot"></div>
              </div>
            `;
            
            const icon = L.divIcon({
              className: "custom-gps-pin",
              iconSize: [30, 42],
              iconAnchor: [15, 42],
              popupAnchor: [0, -40],
              tooltipAnchor: [0, -38],
              html: markerHtml
            });
            
            const marker = L.marker([p.lat, p.lng], { icon }).addTo(markersLayer);
            
            // Tooltip on hover
            marker.bindTooltip(`
                <div style="font-family: inherit;">
                    <strong style="display:block; font-size: 0.9rem; margin-bottom: 4px; color: var(--text-primary);">${p.title}</strong>
                    <span class="badge ${p.status}" style="font-size:0.6rem; padding: 2px 8px; font-weight: 800; border: 1px solid rgba(0,0,0,0.08);">${p.status.toUpperCase()}</span>
                </div>
            `, {
                direction: 'top',
                opacity: 0.98,
                sticky: false
            });
            
            // Popup on click
            marker.bindPopup(`<b>${p.title}</b><br>${p.location}<br><br><span class="badge ${p.status}" style="font-size:0.6rem; padding:0.2rem 0.5rem; margin-top:0.4rem; border:1px solid rgba(0,0,0,0.1)">${p.status.toUpperCase()}</span>`);
            
            marker.on('click', () => openModal(p.id));
        }
    });
};

const renderGrid = (data = projects) => {
    if(typeof renderMapMarkers === 'function') renderMapMarkers(data);
    renderStats(data);

    // Update project count
    const countEl = document.getElementById('projectCount');
    if(countEl) countEl.innerHTML = `Showing <strong>${data.length}</strong> of <strong>${projects.length}</strong> projects`;
    
    const grid = document.getElementById('projectGrid');
    grid.innerHTML = '';
    
    if(data.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-folder-open"></i>
                <h3>No projects found</h3>
                <p style="color:var(--text-secondary)">Try adjusting your search or filters.</p>
            </div>
        `;
        return;
    }

    data.forEach(p => {
        // Create segments
        let segmentsHTML = '';
        for(let i=0; i<p.totalMilestones; i++) {
            let sClass = 'pending';
            if (i < p.completedMilestones) sClass = 'completed';
            else if (i === p.completedMilestones && p.status === 'ongoing') sClass = 'current';
            segmentsHTML += `<div class="progress-segment ${sClass}"></div>`;
        }

        // Proof thumbs
        let thumbsHTML = p.proofs.slice(0, 3).map(proof => `
            <div class="proof-thumb"><img src="${proof.img}" alt="Proof" loading="lazy"></div>
        `).join('');
        
        let proofsText = p.proofs.length > 0 ? "Latest Verified Proofs" : "No Proofs Uploaded";

        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => openModal(p.id);
        
        // Status icon
        let statusIcon = 'fa-spinner';
        if(p.status === 'completed') statusIcon = 'fa-check';
        if(p.status === 'bidding') statusIcon = 'fa-gavel';

        card.innerHTML = `
            <div class="card-header">
                <div>
                    <h3 class="card-title">${p.title}</h3>
                    <div class="card-meta">
                        <i class="fa-solid fa-location-dot"></i> ${p.location} &nbsp;&bull;&nbsp; <i class="fa-solid fa-building-columns"></i> ${p.department}
                    </div>
                </div>
                <span class="badge ${p.status}"><i class="fa-solid ${statusIcon}"></i> ${p.status}</span>
            </div>
            
            <div class="card-budget">
                ${formatCurrency(p.budget)}
            </div>
            
            <div class="progress-section">
                <div class="progress-header">
                    <span>Milestone Progress</span>
                    <span>${p.completedMilestones} / ${p.totalMilestones} Completed</span>
                </div>
                <div class="progress-track">
                    ${segmentsHTML}
                </div>
            </div>
            
            <div class="status-snapshot">
                <strong>Current Phase</strong>
                ${p.currentPhase}
            </div>
            
            <div style="margin-top:auto; padding-top:1.25rem; border-top:1px solid var(--border-color);">
                <div style="font-size:0.75rem; color:var(--text-secondary); margin-bottom:0.75rem; text-transform:uppercase; font-weight:800; display:flex; align-items:center; gap:0.5rem;"><i class="fa-solid fa-shield-halved"></i> ${proofsText}</div>
                <div class="proof-thumbnails">
                    ${thumbsHTML}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
};

const openModal = (id) => {
    const p = projects.find(x => x.id === id);
    if(!p) return;
    
    const content = document.getElementById('modalContent');
    const modal = document.getElementById('projectModal');
    
    let milestonesHTML = p.milestones.map(m => `
        <div class="milestone-item ${m.status}">
            <div class="milestone-info">
                <div class="milestone-header">
                    <span class="milestone-title">${m.title}</span>
                    <span class="badge ${m.status}" style="font-size:0.65rem;">${m.status}</span>
                </div>
                <div class="milestone-desc">${m.desc}</div>
                <div class="milestone-date"><i class="fa-regular fa-calendar" style="margin-right:4px;"></i> Target: ${m.date}</div>
            </div>
            <div class="milestone-budget">
                <span>Allocated Funds</span>
                ${formatCurrency(m.budget)}
            </div>
        </div>
    `).join('');

    let txHTML = p.transactions.map(tx => `
        <tr>
            <td>${tx.date}</td>
            <td><a href="#" onclick="return false;" class="tx-hash">${tx.hash}</a></td>
            <td style="font-family: 'Courier New', monospace; font-weight:600; color: var(--text-secondary);">${tx.to}</td>
            <td class="tx-amount">${formatCurrency(tx.amount)}</td>
        </tr>
    `).join('');

    if(txHTML === '') txHTML = `<tr><td colspan="4" style="text-align:center; padding: 2rem; color: var(--text-secondary); font-weight:500;">No distributions made yet</td></tr>`;

    let proofHTML = p.proofs.map(pr => `
        <div class="proof-card">
            <div class="proof-img">
                <i class="fa-solid fa-file-contract"></i>
                <img src="${pr.img}" loading="lazy">
            </div>
            <div class="proof-details">
                <div><span class="proof-label">Verified Date</span> <span>${pr.date}</span></div>
                <div><span class="proof-label">IPFS Hash</span> <span class="proof-value" title="${pr.hash}">${pr.hash}</span></div>
            </div>
        </div>
    `).join('');
    if(proofHTML === '') proofHTML = `<div style="grid-column:1/-1; padding: 2rem; border:1px dashed var(--border-color); border-radius:12px; text-align:center; color:var(--text-secondary); font-weight:500;">Awaiting verifiable document submissions.</div>`;

    let eventsHTML = p.events.map(ev => `
        <div class="timeline-item">
            <div class="timeline-date">${ev.date}</div>
            <div class="timeline-title">${ev.title}</div>
            <div class="timeline-desc">${ev.desc}</div>
        </div>
    `).join('');

    content.innerHTML = `
        <div class="modal-header">
            <h2 class="modal-title">${p.title}</h2>
            <div class="modal-tags">
                <span class="modal-tag-item"><i class="fa-solid fa-shapes"></i> ${p.category}</span>
                <span class="modal-tag-item"><i class="fa-solid fa-location-dot"></i> ${p.location}</span>
                <span class="modal-tag-item"><i class="fa-solid fa-building-columns"></i> ${p.department}</span>
            </div>
            <p class="modal-desc">${p.description}</p>
        </div>
        
        <h3 class="section-title"><i class="fa-solid fa-money-bill-transfer"></i> Fund Flow Transparency</h3>
        <div class="fund-flow">
            <div class="fund-box">
                <span>Total Contract Value</span>
                <strong>${formatCurrency(p.budget)}</strong>
            </div>
            <div class="fund-box accent">
                <span>Funds Released via Oracle</span>
                <strong>${formatCurrency(p.fundsReleased)}</strong>
            </div>
            <div class="fund-box">
                <span>Escrow Balance Remaining</span>
                <strong>${formatCurrency(p.budget - p.fundsReleased)}</strong>
            </div>
        </div>
        
        <div class="tx-table-container">
            <table class="tx-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Transaction Hash</th>
                        <th>To Wallet (Contractor)</th>
                        <th>Amount Released</th>
                    </tr>
                </thead>
                <tbody>
                    ${txHTML}
                </tbody>
            </table>
        </div>
        
        <h3 class="section-title"><i class="fa-solid fa-list-check"></i> Verified Milestone Breakdown</h3>
        <div class="milestone-list">
            ${milestonesHTML}
        </div>
        
        <h3 class="section-title"><i class="fa-solid fa-shield-halved"></i> Cryptographic Proof of Work</h3>
        <div class="proof-grid">
            ${proofHTML}
        </div>
        
        <h3 class="section-title"><i class="fa-solid fa-clock-rotate-left"></i> Project Lifecycle Event Log</h3>
        <div class="timeline">
            ${eventsHTML}
        </div>
    `;
    
    // reset scroll
    content.scrollTop = 0;
    
    // open animation
    modal.style.display = 'flex';
    // force reflow
    void modal.offsetWidth;
    modal.classList.add('active');
    
    // prevent background scrolling
    document.body.style.overflow = 'hidden';
};

const closeModal = () => {
    const modal = document.getElementById('projectModal');
    modal.classList.remove('active');
    
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }, 400); // match css transition
};

document.getElementById('closeModal').onclick = closeModal;

document.getElementById('projectModal').onclick = (e) => {
    if(e.target.id === 'projectModal') {
        closeModal();
    }
};

// Search & Filter Logic
const filterProjects = () => {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const loc = document.getElementById('filterLocation').value.toLowerCase();
    const bug = parseInt(document.getElementById('filterBudget').value);
    const stat = document.getElementById('filterStatus').value;
    const cat = document.getElementById('filterCategory').value;
    const dep = document.getElementById('filterDept').value;
    
    const filtered = projects.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(search) || p.description.toLowerCase().includes(search);
        const matchesLoc = loc === '' || p.location.toLowerCase().includes(loc);
        const matchesStat = stat === '' || p.status === stat;
        const matchesCat = cat === '' || p.category === cat;
        const matchesDep = dep === '' || p.department === dep;
        const matchesBud = p.budget <= bug;
        
        return matchesSearch && matchesLoc && matchesStat && matchesCat && matchesDep && matchesBud;
    });
    
    renderGrid(filtered);
};

document.getElementById('filterBudget').addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    const label = document.getElementById('budgetValue');
    if(val >= 10000000) label.textContent = "All";
    else label.textContent = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, notation: 'compact' }).format(val);
    filterProjects();
});

document.getElementById('searchInput').addEventListener('input', filterProjects);
document.getElementById('filterLocation').addEventListener('input', filterProjects);
document.getElementById('filterStatus').addEventListener('change', filterProjects);
document.getElementById('filterCategory').addEventListener('change', filterProjects);
document.getElementById('filterDept').addEventListener('change', filterProjects);

/* --- Role Sidebar Logic --- */
const SIDEBAR_CONFIG = {
    government: [
        { id: "create_project", label: "Create Project", icon: "fa-plus-circle" },
        { id: "manage_bids", label: "Manage Bids", icon: "fa-file-signature" },
        { id: "assign_approvers", label: "Assign Approvers", icon: "fa-user-check" },
        { id: "fund_escrow", label: "Fund Escrow", icon: "fa-money-bill-transfer" },
        { id: "milestone_setup", label: "Milestone Setup", icon: "fa-list-check" },
        { id: "project_status", label: "Project Status Control", icon: "fa-sliders" },
        { id: "audit_logs", label: "Audit Logs", icon: "fa-shoe-prints" }
    ],
    contractor: [
        { id: "available_projects", label: "Available Projects", icon: "fa-clipboard-list" },
        { id: "my_bids", label: "My Bids", icon: "fa-file-signature" },
        { id: "workdesk", label: "Workdesk", icon: "fa-hammer" },
        { id: "submit_proof", label: "Submit Proof", icon: "fa-cloud-arrow-up" },
        { id: "payments", label: "Payments", icon: "fa-sack-dollar" },
        { id: "contractor_stats", label: "Contractor Stats", icon: "fa-chart-pie" }
    ],
    approver: [
        { id: "assigned_projects", label: "Assigned Projects", icon: "fa-clipboard-check" },
        { id: "pending_reviews", label: "Pending Reviews", icon: "fa-hourglass-half" },
        { id: "review_workspace", label: "Review Workspace", icon: "fa-magnifying-glass" },
        { id: "decisions", label: "Decisions", icon: "fa-gavel" },
        { id: "decision_history", label: "Decision History", icon: "fa-clock-rotate-left" },
        { id: "review_deadlines", label: "Review Deadlines", icon: "fa-calendar-xmark" },
        { id: "logs", label: "Logs", icon: "fa-list-ul" }
    ]
};

const initSidebar = () => {
    const params = new URLSearchParams(window.location.search);
    const role = params.get('role') || 'public';
    const sidebar = document.getElementById('roleSidebar');
    
    if (role === 'public' || !SIDEBAR_CONFIG[role]) {
        sidebar.classList.add('hidden');
        return;
    }

    const items = SIDEBAR_CONFIG[role];
    let navHTML = items.map((item, index) => `
        <li class="sidebar-item ${index === 0 ? 'active' : ''}" data-id="${item.id}">
            <i class="fa-solid ${item.icon}"></i>
            <span>${item.label}</span>
        </li>
    `).join('');

    sidebar.innerHTML = `
        <div class="sidebar-header">
            <div class="sidebar-brand">
                <i class="fa-solid fa-link"></i> ClearFund
            </div>
            <div class="sidebar-role-badge">${role} Panel</div>
        </div>
        <nav class="sidebar-nav">
            <ul class="sidebar-menu">
                ${navHTML}
            </ul>
        </nav>
        <div class="sidebar-footer">
            <i class="fa-solid fa-shield-halved"></i> Wallet Connected
        </div>
    `;
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initMap();
    initLocationAutocomplete();
    // Hide modal initially
    document.getElementById('projectModal').style.display = 'none';
    renderGrid();
});
