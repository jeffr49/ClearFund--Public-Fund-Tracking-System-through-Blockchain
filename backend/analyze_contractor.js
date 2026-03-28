require("dotenv").config();
const { ethers } = require("ethers");
const supabase = require("./src/db/supabaseClient");

async function analyzeContractor(wallet) {
    if (!wallet) {
        console.error("Usage: node analyze_contractor.js <wallet_address>");
        return;
    }

    try {
        const addr = ethers.getAddress(wallet);
        console.log(`\n--- Analysis for Contractor: ${addr} ---\n`);

        const { data: contractorRecord, error: cErr } = await supabase
            .from('contractors')
            .select('*')
            .ilike('wallet_address', addr)
            .maybeSingle();

        if (cErr) console.error("Error fetching contractor record:", cErr.message);

        const { data: projects, error: projectsError } = await supabase
            .from("projects")
            .select("id, status, title")
            .eq("contractor_wallet", addr);

        if (projectsError) throw projectsError;

        if (!projects || projects.length === 0) {
            console.log("No projects found for this contractor.");
            return;
        }

        const projectIds = projects.map(p => p.id);

        const { data: milestones, error: milestonesError } = await supabase
            .from("milestones")
            .select("id, project_id, deadline, amount, milestone_index, status")
            .in("project_id", projectIds);

        if (milestonesError) throw milestonesError;

        const { data: events, error: eventsError } = await supabase
            .from("events")
            .select("project_id, milestone_id, created_at, event_type, metadata")
            .in("project_id", projectIds)
            .in("event_type", ["MILESTONE_APPROVED", "FUNDS_RELEASED", "DEADLINE_EXTENDED"]);

        if (eventsError) throw eventsError;

        let on_time_count = 0;
        let delayed_count = 0;
        let rejected_count = 0;
        let total_earnings_inr = 0n;

        milestones.forEach(ms => {
            const releaseEvent = events.find(e => 
                e.project_id === ms.project_id && 
                Number(e.milestone_id) === ms.milestone_index && 
                e.event_type === "FUNDS_RELEASED"
            );

            const rejectionEvent = events.find(e => 
                e.project_id === ms.project_id && 
                Number(e.milestone_id) === ms.milestone_index && 
                e.event_type === "DEADLINE_EXTENDED"
            );

            if (releaseEvent) {
                const deadline = new Date(ms.deadline);
                const releaseDate = new Date(releaseEvent.created_at);
                if (releaseDate <= deadline) on_time_count++; else delayed_count++;
                try {
                    total_earnings_inr += BigInt(releaseEvent?.metadata?.amount || ms.amount || 0);
                } catch (e) {}
            } else if (rejectionEvent) {
                rejected_count++;
            }
        });

        const completed_projects = projects.filter(p => p.status === 'completed').length;
        const actioned = on_time_count + delayed_count + rejected_count;
        let score = (actioned === 0) ? 100 : (on_time_count / actioned) * 80;
        score += (completed_projects > 0 ? 20 : 0);
        score = Math.min(100, Math.round(score));

        console.log(`- Project Summary: ${projects.length} Total, ${completed_projects} Completed`);
        console.log(`- Milestone Stats: ${on_time_count} On-time, ${delayed_count} Delayed, ${rejected_count} Rejected`);
        console.log(`- Total Earnings (Estimated): ${total_earnings_inr.toString()} units`);
        console.log(`- Calculated Score: ${score}/100`);
        
        if (contractorRecord) {
            console.log(`\n- Database Record:`);
            console.log(`  - Name: ${contractorRecord.full_name}`);
            console.log(`  - DB Score: ${contractorRecord.reputation_score}`);
            console.log(`  - In Sync: ${score === contractorRecord.reputation_score ? "YES" : "NO"}`);
        } else {
            console.log("\n- No database record found in 'contractors' table.");
        }

    } catch (err) {
        console.error("Analysis failed:", err.message);
    }
}

const walletArg = process.argv[2] || "0x39685443A31A6Bc5F720597d7E5CE6016b5077b6";
analyzeContractor(walletArg);
