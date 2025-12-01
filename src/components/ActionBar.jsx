/* ActionBar.jsx */

import React from "react";
import "../css/ActionBar.css";

export default function ActionBar({ selected, onSelect }) {
    return (
        <div className="action-bar">
            <button
                className={`action-btn ${selected === "todo" ? "active" : ""}`}
                onClick={() => onSelect("todo")}
            >
                할일
            </button>
            <button
                className={`action-btn ${selected === "journal" ? "active" : ""}`}
                onClick={() => onSelect("journal")}
            >
                기록
            </button>
        </div>
    );
}
