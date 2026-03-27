"use client";

import { useEffect, useState } from "react";
import MilestoneCard from "./MilestoneCard";
import styles from "./contractorDashboard.module.css";

export default function ProjectCard({ project, apiBase }) {
  const [details, setDetails] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDetails();
  }, [project.project_id]);

  const fetchDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const [detailsRes, timelineRes] = await Promise.all([
        fetch(`${apiBase}/contractor/project/${project.project_id}`),
        fetch(`${apiBase}/contractor/events/${project.project_id}`)
      ]);

      if (!detailsRes.ok) {
        throw new Error("Failed to load project details");
      }
      if (!timelineRes.ok) {
        throw new Error("Failed to load project timeline");
      }

      const detailsJson = await detailsRes.json();
      const timelineJson = await timelineRes.json();

      setDetails(detailsJson);
      setTimeline(timelineJson);
    } catch (err) {
      setError(err.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className={styles.card}>
      <div className={styles.projectHeader}>
        <h2>{project.title}</h2>
        <span className={styles.status}>{project.status}</span>
      </div>
      <p className={styles.meta}>{project.description || "No description provided."}</p>
      <p className={styles.meta}>Location: {project.location || "N/A"}</p>
      <p className={styles.meta}>Contract: {project.contract_address || "Not deployed"}</p>

      {loading ? <div className={styles.inlineState}>Loading details...</div> : null}
      {error ? (
        <div className={styles.errorRow}>
          <div className={styles.error}>{error}</div>
          <button onClick={fetchDetails} className={styles.retryBtn}>
            Retry
          </button>
        </div>
      ) : null}

      {details?.progress ? (
        <div className={styles.progress}>
          <div>
            Milestone {details.progress.current_milestone_index} /{" "}
            {details.progress.total_milestones}
          </div>
          <div>Funds Released (wei): {details.progress.funds_released_wei}</div>
        </div>
      ) : null}

      <div className={styles.milestoneList}>
        {(details?.milestones || []).map((milestone) => (
          <MilestoneCard
            key={milestone.id}
            projectId={project.project_id}
            milestone={milestone}
            contractAddress={project.contract_address}
            onSubmitted={fetchDetails}
            apiBase={apiBase}
          />
        ))}
        {!loading && !error && details?.milestones?.length === 0 ? (
          <div className={styles.inlineState}>No milestones found for this project.</div>
        ) : null}
      </div>

      <div className={styles.timeline}>
        <h3>Timeline</h3>
        {(timeline || []).map((event) => (
          <div key={event.id} className={styles.timelineItem}>
            <strong>{event.event_type}</strong> - Milestone {event.milestone_id ?? "-"} -{" "}
            {new Date(event.created_at).toLocaleString()}
          </div>
        ))}
        {!loading && !error && timeline.length === 0 ? (
          <div className={styles.inlineState}>No events yet.</div>
        ) : null}
      </div>
    </article>
  );
}
